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

// Build QASM 3.0 circuit based on algorithm and weather parameters
function buildQuantumCircuit(algorithm: string, params: QuantumRequest['weatherParams']): string {
  // Normalize parameters to rotation angles (0 to 2π)
  const theta1 = ((params.temperature + 20) / 60) * Math.PI; // -20 to 40°C normalized
  const theta2 = (params.humidity / 100) * Math.PI;
  const theta3 = ((params.pressure - 950) / 100) * Math.PI; // 950-1050 hPa normalized
  const theta4 = ((params.windSpeed || 10) / 50) * Math.PI;

  if (algorithm === 'vqe') {
    // VQE circuit for weather parameter optimization
    return `
OPENQASM 3.0;
include "stdgates.inc";
qubit[4] q;
bit[4] c;

// Initial superposition
h q[0];
h q[1];
h q[2];
h q[3];

// Weather parameter encoding layer
ry(${theta1.toFixed(6)}) q[0];
rz(${theta2.toFixed(6)}) q[1];
rx(${theta3.toFixed(6)}) q[2];
ry(${theta4.toFixed(6)}) q[3];

// Entanglement layer for correlations
cx q[0], q[1];
cx q[1], q[2];
cx q[2], q[3];

// Variational layer 1
ry(${(theta1 * 0.5).toFixed(6)}) q[0];
rz(${(theta2 * 0.5).toFixed(6)}) q[1];
rx(${(theta3 * 0.5).toFixed(6)}) q[2];

// Second entanglement
cx q[3], q[0];
cx q[2], q[1];

// Variational layer 2
ry(${(theta1 * 0.25).toFixed(6)}) q[3];
rz(${(theta2 * 0.25).toFixed(6)}) q[2];

// Measurement
c = measure q;
`;
  } else if (algorithm === 'qaoa') {
    // QAOA circuit for optimization problems (e.g., flood routing)
    const gamma = 0.5; // Problem Hamiltonian parameter
    const beta = 0.3;  // Mixer parameter
    
    return `
OPENQASM 3.0;
include "stdgates.inc";
qubit[4] q;
bit[4] c;

// Initial state (uniform superposition)
h q[0];
h q[1];
h q[2];
h q[3];

// QAOA Layer 1 - Problem Hamiltonian (Cost function encoding)
// ZZ interactions based on weather correlations
rzz(${(gamma * theta1).toFixed(6)}) q[0], q[1];
rzz(${(gamma * theta2).toFixed(6)}) q[1], q[2];
rzz(${(gamma * theta3).toFixed(6)}) q[2], q[3];
rzz(${(gamma * theta4).toFixed(6)}) q[3], q[0];

// Mixer layer
rx(${(2 * beta).toFixed(6)}) q[0];
rx(${(2 * beta).toFixed(6)}) q[1];
rx(${(2 * beta).toFixed(6)}) q[2];
rx(${(2 * beta).toFixed(6)}) q[3];

// QAOA Layer 2 (deeper circuit for better approximation)
rzz(${(gamma * theta1 * 0.7).toFixed(6)}) q[0], q[1];
rzz(${(gamma * theta2 * 0.7).toFixed(6)}) q[1], q[2];
rzz(${(gamma * theta3 * 0.7).toFixed(6)}) q[2], q[3];

rx(${(2 * beta * 0.7).toFixed(6)}) q[0];
rx(${(2 * beta * 0.7).toFixed(6)}) q[1];
rx(${(2 * beta * 0.7).toFixed(6)}) q[2];
rx(${(2 * beta * 0.7).toFixed(6)}) q[3];

// Measurement
c = measure q;
`;
  } else {
    // QML (Quantum Machine Learning) circuit for pattern recognition
    return `
OPENQASM 3.0;
include "stdgates.inc";
qubit[4] q;
bit[4] c;

// Data encoding layer (amplitude encoding)
ry(${theta1.toFixed(6)}) q[0];
ry(${theta2.toFixed(6)}) q[1];
ry(${theta3.toFixed(6)}) q[2];
ry(${theta4.toFixed(6)}) q[3];

// Trainable layer 1
rz(0.785398) q[0];
rz(1.047198) q[1];
rz(0.523599) q[2];
rz(1.570796) q[3];

cx q[0], q[1];
cx q[2], q[3];
cx q[1], q[2];

// Trainable layer 2
ry(0.628318) q[0];
ry(0.942478) q[1];
ry(1.256637) q[2];
ry(0.314159) q[3];

cx q[0], q[3];
cx q[1], q[2];

// Trainable layer 3
rz(0.392699) q[0];
rz(0.785398) q[1];
rz(1.178097) q[2];
rz(0.196349) q[3];

// Measurement
c = measure q;
`;
  }
}

// Parse quantum measurement results
function parseQuantumResults(results: any): {
  probabilities: Record<string, number>;
  dominantState: string;
  entropy: number;
  prediction: {
    temperatureCorrection: number;
    precipitationProbability: number;
    confidence: number;
  };
} {
  // Results from IBM Quantum come as measurement counts
  const counts = results?.results?.[0]?.data?.c || results?.counts || {};
  
  // Calculate probabilities
  const totalShots = Object.values(counts).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number;
  const probabilities: Record<string, number> = {};
  
  for (const [state, count] of Object.entries(counts)) {
    probabilities[state] = (Number(count) || 0) / (totalShots || 1);
  }

  // Find dominant state
  const dominantState = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '0000';

  // Calculate entropy (measure of uncertainty)
  let entropy = 0;
  for (const prob of Object.values(probabilities)) {
    if (prob > 0) {
      entropy -= prob * Math.log2(prob);
    }
  }

  // Derive weather predictions from quantum state
  const stateValue = parseInt(dominantState, 2);
  const temperatureCorrection = ((stateValue / 15) - 0.5) * 4; // -2 to +2°C
  const precipitationProbability = (entropy / 4) * 100; // Higher entropy = higher uncertainty = precipitation
  const confidence = Math.max(20, 100 - (entropy * 20));

  return {
    probabilities,
    dominantState,
    entropy: Math.round(entropy * 1000) / 1000,
    prediction: {
      temperatureCorrection: Math.round(temperatureCorrection * 100) / 100,
      precipitationProbability: Math.round(precipitationProbability),
      confidence: Math.round(confidence),
    },
  };
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

    // Submit job to IBM Quantum
    console.log(`Submitting ${algorithm} job to IBM Quantum...`);
    
    // Create job record first
    const { data: job, error: jobError } = await supabase
      .from('quantum_jobs')
      .insert({
        circuit_type: algorithm,
        algorithm,
        status: 'submitting',
        input_params: weatherParams,
        circuit_qasm: circuit,
        backend: 'ibm_brisbane',
        shots,
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create job record: ${jobError.message}`);
    }

    try {
      // Submit to IBM Quantum Runtime
      const ibmResponse = await fetch("https://api.quantum-computing.ibm.com/runtime/jobs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${IBM_QUANTUM_TOKEN}`,
          "Content-Type": "application/json",
          "Service-CRN": IBM_SERVICE_CRN,
        },
        body: JSON.stringify({
          program_id: "sampler",
          backend: "ibm_brisbane",
          hub: "ibm-q",
          group: "open",
          project: "main",
          params: {
            pubs: [[circuit, null, shots]],
          },
        }),
      });

      if (!ibmResponse.ok) {
        const errorText = await ibmResponse.text();
        console.error('IBM Quantum API error:', ibmResponse.status, errorText);
        
        // Update job status
        await supabase
          .from('quantum_jobs')
          .update({ 
            status: 'failed',
            result: { error: errorText, status: ibmResponse.status },
          })
          .eq('id', job.id);

        throw new Error(`IBM Quantum API error: ${ibmResponse.status} - ${errorText}`);
      }

      const ibmJob = await ibmResponse.json();
      
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

      throw ibmError;
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
