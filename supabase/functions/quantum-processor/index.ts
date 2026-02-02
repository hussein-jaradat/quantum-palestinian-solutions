import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuantumRequest {
  algorithm: 'vqe' | 'qaoa' | 'qml';
  weatherParams: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed?: number;
  };
  governorateId: string;
  shots?: number;
}

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

// Build QASM 3.0 circuit for IBM Quantum Runtime
// Uses $n syntax for virtual qubits as required by IBM Runtime API
function buildQuantumCircuit(algorithm: string, params: QuantumRequest['weatherParams']): string {
  // Normalize parameters to rotation angles (0 to 2π)
  const theta1 = ((params.temperature + 20) / 60) * Math.PI; // -20 to 40°C normalized
  const theta2 = (params.humidity / 100) * Math.PI;
  const theta3 = ((params.pressure - 950) / 100) * Math.PI; // 950-1050 hPa normalized
  const theta4 = ((params.windSpeed || 10) / 50) * Math.PI;

  if (algorithm === 'vqe') {
    // VQE circuit for weather parameter optimization - IBM Runtime format
    return `OPENQASM 3.0; include "stdgates.inc"; bit[4] c; h $0; h $1; h $2; h $3; ry(${theta1.toFixed(4)}) $0; rz(${theta2.toFixed(4)}) $1; rx(${theta3.toFixed(4)}) $2; ry(${theta4.toFixed(4)}) $3; cx $0, $1; cx $1, $2; cx $2, $3; ry(${(theta1 * 0.5).toFixed(4)}) $0; rz(${(theta2 * 0.5).toFixed(4)}) $1; c[0] = measure $0; c[1] = measure $1; c[2] = measure $2; c[3] = measure $3;`;
  } else if (algorithm === 'qaoa') {
    // QAOA circuit - IBM Runtime format
    const gamma = 0.5;
    const beta = 0.3;
    return `OPENQASM 3.0; include "stdgates.inc"; bit[4] c; h $0; h $1; h $2; h $3; rz(${(gamma * theta1).toFixed(4)}) $0; rz(${(gamma * theta2).toFixed(4)}) $1; cx $0, $1; cx $1, $2; rx(${(2 * beta).toFixed(4)}) $0; rx(${(2 * beta).toFixed(4)}) $1; rx(${(2 * beta).toFixed(4)}) $2; rx(${(2 * beta).toFixed(4)}) $3; c[0] = measure $0; c[1] = measure $1; c[2] = measure $2; c[3] = measure $3;`;
  } else {
    // QML circuit - IBM Runtime format
    return `OPENQASM 3.0; include "stdgates.inc"; bit[4] c; ry(${theta1.toFixed(4)}) $0; ry(${theta2.toFixed(4)}) $1; ry(${theta3.toFixed(4)}) $2; ry(${theta4.toFixed(4)}) $3; rz(0.7854) $0; rz(1.0472) $1; cx $0, $1; cx $2, $3; cx $1, $2; ry(0.6283) $0; ry(0.9425) $1; c[0] = measure $0; c[1] = measure $1; c[2] = measure $2; c[3] = measure $3;`;
  }
}


// Fetch available IBM Quantum backends
async function getAvailableBackends(bearerToken: string, serviceCRN: string): Promise<string[]> {
  try {
    const response = await fetch("https://quantum.cloud.ibm.com/api/v1/backends", {
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Service-CRN": serviceCRN,
        "IBM-API-Version": "2025-05-01",
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Return only simulators and available QPUs
      return data.devices?.map((d: any) => d.name) || ['ibmq_qasm_simulator'];
    }
    await response.text();
    return ['ibmq_qasm_simulator'];
  } catch {
    return ['ibmq_qasm_simulator'];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const IBM_QUANTUM_TOKEN = Deno.env.get("IBM_QUANTUM_TOKEN");
    const IBM_SERVICE_CRN = Deno.env.get("IBM_SERVICE_CRN");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle GET request for listing backends
    if (req.method === 'GET') {
      if (!IBM_QUANTUM_TOKEN || !IBM_SERVICE_CRN) {
        return new Response(JSON.stringify({ error: 'IBM credentials not configured' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const bearerToken = await getIBMBearerToken(IBM_QUANTUM_TOKEN);
      const backends = await getAvailableBackends(bearerToken, IBM_SERVICE_CRN);
      
      return new Response(JSON.stringify({ backends }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: QuantumRequest = await req.json();
    const { algorithm, weatherParams, governorateId, shots = 1024 } = body;

    // Build the quantum circuit
    const circuit = buildQuantumCircuit(algorithm, weatherParams);
    
    // Check if IBM Quantum credentials are configured
    if (!IBM_QUANTUM_TOKEN || !IBM_SERVICE_CRN) {
      // Return detailed info about what would be executed
      console.log('IBM Quantum credentials not configured - returning circuit info');
      
      // Create a job record for tracking
      const { data: job, error: jobError } = await supabase
        .from('quantum_jobs')
        .insert({
          circuit_type: algorithm,
          algorithm,
          status: 'credentials_missing',
          input_params: weatherParams,
          circuit_qasm: circuit,
          backend: 'simulation_required',
          shots,
        })
        .select()
        .single();

      return new Response(JSON.stringify({
        status: 'credentials_missing',
        message: 'IBM Quantum credentials not configured. Add IBM_QUANTUM_TOKEN and IBM_SERVICE_CRN secrets.',
        setupUrl: 'https://quantum.ibm.com',
        circuit: circuit,
        algorithm,
        governorateId,
        weatherParams,
        jobId: job?.id,
        instructions: {
          step1: 'Go to https://quantum.ibm.com and create an account',
          step2: 'Navigate to Settings → API Token and copy your token',
          step3: 'Navigate to Instances and copy the Service CRN',
          step4: 'Add IBM_QUANTUM_TOKEN and IBM_SERVICE_CRN as secrets',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Bearer Token from API Key
    console.log('Getting IBM Bearer Token...');
    let bearerToken: string;
    try {
      bearerToken = await getIBMBearerToken(IBM_QUANTUM_TOKEN);
      console.log('Bearer token obtained successfully');
    } catch (tokenError) {
      console.error('Failed to get bearer token:', tokenError);
      return new Response(JSON.stringify({
        status: 'auth_failed',
        error: 'Failed to authenticate with IBM Quantum',
        details: tokenError instanceof Error ? tokenError.message : 'Unknown error',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get available backends and select the best one
    const availableBackends = await getAvailableBackends(bearerToken, IBM_SERVICE_CRN);
    console.log('Available backends:', availableBackends);
    
    // Prefer real QPU, fallback to simulator
    const preferredBackends = ['ibm_sherbrooke', 'ibm_brisbane', 'ibm_kyiv', 'ibm_quebec', 'ibmq_qasm_simulator'];
    let selectedBackend = availableBackends[0] || 'ibmq_qasm_simulator';
    
    for (const preferred of preferredBackends) {
      if (availableBackends.includes(preferred)) {
        selectedBackend = preferred;
        break;
      }
    }
    
    console.log('Selected backend:', selectedBackend);

    // Create job record first
    const { data: job, error: jobError } = await supabase
      .from('quantum_jobs')
      .insert({
        circuit_type: algorithm,
        algorithm,
        status: 'submitting',
        input_params: weatherParams,
        circuit_qasm: circuit,
        backend: selectedBackend,
        shots,
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job record: ${jobError.message}`);
    }

    console.log(`Submitting ${algorithm} job to IBM Quantum on ${selectedBackend}...`);

    try {
      // Submit to IBM Quantum Runtime - Correct API endpoint
      const ibmResponse = await fetch("https://quantum.cloud.ibm.com/api/v1/jobs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "Service-CRN": IBM_SERVICE_CRN,
          "IBM-API-Version": "2025-05-01",
        },
        body: JSON.stringify({
          program_id: "sampler",
          backend: selectedBackend,
          params: {
            pubs: [[circuit, null, shots]],
          },
        }),
      });

      const responseText = await ibmResponse.text();
      console.log('IBM Response status:', ibmResponse.status);
      console.log('IBM Response:', responseText);

      if (!ibmResponse.ok) {
        console.error('IBM Quantum API error:', ibmResponse.status, responseText);
        
        // Update job status
        await supabase
          .from('quantum_jobs')
          .update({ 
            status: 'failed',
            result: { error: responseText, status: ibmResponse.status },
          })
          .eq('id', job.id);

        return new Response(JSON.stringify({
          status: 'ibm_error',
          error: `IBM Quantum API error: ${ibmResponse.status}`,
          details: responseText,
          jobId: job.id,
          circuit: circuit,
        }), {
          status: 200, // Return 200 so we can see the error details
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const ibmJob = JSON.parse(responseText);
      
      // Update job with IBM job ID
      await supabase
        .from('quantum_jobs')
        .update({ 
          ibm_job_id: ibmJob.id,
          status: 'queued',
          started_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return new Response(JSON.stringify({
        status: 'queued',
        jobId: job.id,
        ibmJobId: ibmJob.id,
        algorithm,
        backend: 'ibm_brisbane',
        shots,
        estimatedWaitTime: '2-10 minutes',
        checkStatusUrl: `${supabaseUrl}/functions/v1/quantum-job-status?jobId=${job.id}`,
        circuit: circuit,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (ibmError: unknown) {
      const errorMessage = ibmError instanceof Error ? ibmError.message : 'Unknown IBM error';
      
      await supabase
        .from('quantum_jobs')
        .update({ 
          status: 'failed',
          result: { error: errorMessage },
        })
        .eq('id', job.id);

      return new Response(JSON.stringify({
        status: 'error',
        error: errorMessage,
        jobId: job.id,
        circuit: circuit,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Quantum processor error:', error);
    return new Response(
      JSON.stringify({ error: 'Quantum processing failed', details: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
