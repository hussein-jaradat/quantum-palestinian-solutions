import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get IBM Cloud Bearer Token from API Key
async function getIBMBearerToken(apiKey: string): Promise<string> {
  const response = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get IBM bearer token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const IBM_QUANTUM_TOKEN = Deno.env.get("IBM_QUANTUM_TOKEN");
    const IBM_SERVICE_CRN = Deno.env.get("IBM_SERVICE_CRN");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job from database
    const { data: job, error: jobError } = await supabase
      .from('quantum_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If job is already completed or failed, return cached result
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'credentials_missing') {
      return new Response(JSON.stringify({
        jobId: job.id,
        ibmJobId: job.ibm_job_id,
        status: job.status,
        algorithm: job.algorithm,
        result: job.result,
        circuit: job.circuit_qasm,
        executionTime: job.execution_time_ms,
        completedAt: job.completed_at,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we have IBM credentials and IBM job ID, check status with IBM
    if (IBM_QUANTUM_TOKEN && IBM_SERVICE_CRN && job.ibm_job_id) {
      try {
        // Get bearer token
        const bearerToken = await getIBMBearerToken(IBM_QUANTUM_TOKEN);
        
        const statusResponse = await fetch(
          `https://quantum.cloud.ibm.com/api/v1/jobs/${job.ibm_job_id}`,
          {
            headers: {
              "Authorization": `Bearer ${bearerToken}`,
              "Service-CRN": IBM_SERVICE_CRN,
              "IBM-API-Version": "2025-05-01",
            },
          }
        );

        if (statusResponse.ok) {
          const ibmStatus = await statusResponse.json();
          
          let newStatus = job.status;
          let result = null;
          
          if (ibmStatus.status === 'Completed') {
            // Fetch results
            const resultsResponse = await fetch(
              `https://quantum.cloud.ibm.com/api/v1/jobs/${job.ibm_job_id}/results`,
              {
                headers: {
                  "Authorization": `Bearer ${bearerToken}`,
                  "Service-CRN": IBM_SERVICE_CRN,
                  "IBM-API-Version": "2025-05-01",
                },
              }
            );

            if (resultsResponse.ok) {
              const rawResults = await resultsResponse.json();
              
              // Parse the quantum results
              result = parseQuantumResults(rawResults, job.input_params);
              newStatus = 'completed';
              
              // Update job in database
              await supabase
                .from('quantum_jobs')
                .update({
                  status: 'completed',
                  result,
                  execution_time_ms: ibmStatus.execution_time || null,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', job.id);
            } else {
              await resultsResponse.text(); // Consume body
            }
          } else if (ibmStatus.status === 'Failed' || ibmStatus.status === 'Cancelled') {
            newStatus = 'failed';
            result = { error: ibmStatus.status_message || 'Job failed' };
            
            await supabase
              .from('quantum_jobs')
              .update({
                status: 'failed',
                result,
                completed_at: new Date().toISOString(),
              })
              .eq('id', job.id);
          } else if (ibmStatus.status === 'Running') {
            newStatus = 'running';
            await supabase
              .from('quantum_jobs')
              .update({ status: 'running' })
              .eq('id', job.id);
          }

          return new Response(JSON.stringify({
            jobId: job.id,
            ibmJobId: job.ibm_job_id,
            status: newStatus,
            ibmStatus: ibmStatus.status,
            algorithm: job.algorithm,
            result,
            queuePosition: ibmStatus.queue_position,
            estimatedStartTime: ibmStatus.estimated_start_time,
            backend: job.backend,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          await statusResponse.text(); // Consume body
        }
      } catch (ibmError) {
        console.error('Error checking IBM status:', ibmError);
      }
    }

    // Return current database status
    return new Response(JSON.stringify({
      jobId: job.id,
      ibmJobId: job.ibm_job_id,
      status: job.status,
      algorithm: job.algorithm,
      circuit: job.circuit_qasm,
      createdAt: job.created_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Quantum job status error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get job status', details: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Parse quantum measurement results into weather predictions
function parseQuantumResults(rawResults: any, inputParams: any) {
  const results = rawResults?.results?.[0] || rawResults;
  const counts = results?.data?.c || results?.counts || {};
  
  // Calculate probabilities
  const totalShots = Object.values(counts).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number;
  const probabilities: Record<string, number> = {};
  
  for (const [state, count] of Object.entries(counts)) {
    probabilities[state] = Math.round(((Number(count) || 0) / (totalShots || 1)) * 10000) / 100;
  }

  // Sort by probability
  const sortedStates = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a);

  const dominantState = sortedStates[0]?.[0] || '0000';
  const dominantProbability = sortedStates[0]?.[1] || 0;

  // Calculate entropy
  let entropy = 0;
  for (const prob of Object.values(probabilities)) {
    const p = prob / 100;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Derive weather insights from quantum measurements
  const stateValue = parseInt(dominantState.replace(/\s/g, ''), 2);
  const maxState = Math.pow(2, dominantState.replace(/\s/g, '').length) - 1;
  
  // Temperature correction based on dominant state
  const tempCorrection = ((stateValue / maxState) - 0.5) * 4;
  
  // Precipitation probability from entropy (higher entropy = more uncertainty = precipitation)
  const maxEntropy = Math.log2(16); // 4 qubits
  const precipProb = Math.min(95, (entropy / maxEntropy) * 80 + 10);
  
  // Confidence from dominant state probability
  const confidence = Math.min(98, dominantProbability + 20);

  return {
    measurements: {
      totalShots,
      uniqueStates: Object.keys(counts).length,
      probabilities: sortedStates.slice(0, 8).map(([state, prob]) => ({ state, probability: prob })),
    },
    analysis: {
      dominantState,
      dominantProbability,
      entropy: Math.round(entropy * 1000) / 1000,
      maxEntropy: Math.round(maxEntropy * 1000) / 1000,
    },
    weatherPrediction: {
      temperatureCorrection: Math.round(tempCorrection * 100) / 100,
      precipitationProbability: Math.round(precipProb),
      confidence: Math.round(confidence),
      quantumAdvantage: entropy > 1.5 ? 'high' : entropy > 0.8 ? 'medium' : 'low',
    },
    inputParams,
  };
}
