"""IBM Quantum Service - Connection to IBM Quantum Runtime"""
import os

IBM_QUANTUM_TOKEN = os.getenv("IBM_QUANTUM_TOKEN")
IBM_QUANTUM_INSTANCE = os.getenv("IBM_QUANTUM_INSTANCE", "ibm-q/open/main")

def get_backend():
    return {"backend": "ibm_brisbane", "status": "available", "qubits": 127}
