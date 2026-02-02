"""
==============================================
QANWP-AI Python Backend
نظام التنبؤ الجوي الكمومي الفلسطيني
Quantum-Aware Neural Weather Prediction

Real Scientific & Quantum ML Algorithms
==============================================
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Tuple
import numpy as np
import os
from datetime import datetime

# Import algorithm modules
from algorithms.scientific import (
    kalman_filter,
    arima_model,
    bayesian_ensemble,
    bias_correction,
    anomaly_detection,
    trend_analysis
)
from algorithms.ml import (
    lstm_predictor,
    random_forest,
    xgboost_predictor,
    gradient_boosting,
    ensemble_voting
)
from algorithms.quantum import (
    vqe_optimizer,
    qaoa_solver,
    qsvm_classifier,
    qnn_regression,
    grover_search
)
from services import ibm_quantum_service, weather_processor

# ==============================================
# FastAPI App Configuration
# ==============================================

app = FastAPI(
    title="QANWP-AI Python Backend",
    description="""
    ## نظام التنبؤ الجوي الكمومي الفلسطيني
    
    Real Scientific & Quantum ML Algorithms for Weather Prediction
    
    ### Categories:
    - **Scientific**: Kalman Filter, ARIMA, Bayesian Ensemble, Bias Correction
    - **Machine Learning**: LSTM, Random Forest, XGBoost, Gradient Boosting
    - **Quantum Computing**: VQE, QAOA, QSVM, QNN, Grover's Algorithm
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================
# Pydantic Request Models
# ==============================================

class KalmanRequest(BaseModel):
    """Kalman Filter Request"""
    data: List[float] = Field(..., description="Time series data")
    process_noise: float = Field(0.1, description="Process noise (Q)")
    measurement_noise: float = Field(1.0, description="Measurement noise (R)")

class ARIMARequest(BaseModel):
    """ARIMA Forecast Request"""
    data: List[float] = Field(..., description="Historical data")
    order: Tuple[int, int, int] = Field((2, 1, 1), description="ARIMA(p,d,q) order")
    forecast_steps: int = Field(7, description="Steps to forecast")

class BayesianRequest(BaseModel):
    """Bayesian Model Averaging Request"""
    models_predictions: Dict[str, List[float]] = Field(..., description="Model predictions")
    observations: List[float] = Field(..., description="Actual observations")
    prior_weights: Optional[Dict[str, float]] = Field(None, description="Prior weights")

class BiasRequest(BaseModel):
    """Bias Correction Request"""
    predictions: List[float] = Field(..., description="Model predictions")
    observations: List[float] = Field(..., description="Actual observations")
    method: str = Field("quantile", description="Correction method")

class AnomalyRequest(BaseModel):
    """Anomaly Detection Request"""
    data: List[float] = Field(..., description="Time series data")
    method: str = Field("zscore", description="Detection method (zscore/iqr)")
    threshold: float = Field(3.0, description="Detection threshold")

class TrendRequest(BaseModel):
    """Trend Analysis Request"""
    data: List[float] = Field(..., description="Time series data")

class RandomForestRequest(BaseModel):
    """Random Forest Request"""
    X_train: List[List[float]] = Field(..., description="Training features")
    y_train: List[float] = Field(..., description="Training targets")
    X_predict: Optional[List[List[float]]] = Field(None, description="Prediction features")

class LSTMRequest(BaseModel):
    """LSTM Request"""
    X_train: List[List[float]] = Field(..., description="Training sequences")
    y_train: List[float] = Field(..., description="Training targets")
    X_predict: Optional[List[List[float]]] = Field(None, description="Prediction sequences")
    epochs: int = Field(50, description="Training epochs")

class XGBoostRequest(BaseModel):
    """XGBoost Request"""
    X_train: List[List[float]] = Field(..., description="Training features")
    y_train: List[float] = Field(..., description="Training targets")
    X_predict: Optional[List[List[float]]] = Field(None, description="Prediction features")

class GradientBoostingRequest(BaseModel):
    """Gradient Boosting Request"""
    X_train: List[List[float]] = Field(..., description="Training features")
    y_train: List[float] = Field(..., description="Training targets")
    X_predict: Optional[List[List[float]]] = Field(None, description="Prediction features")

class EnsembleRequest(BaseModel):
    """Ensemble Voting Request"""
    X_train: List[List[float]] = Field(..., description="Training features")
    y_train: List[float] = Field(..., description="Training targets")
    X_predict: Optional[List[List[float]]] = Field(None, description="Prediction features")

class VQERequest(BaseModel):
    """VQE Optimization Request"""
    weather_params: Dict[str, float] = Field(..., description="Weather parameters")
    num_qubits: int = Field(4, description="Number of qubits")
    layers: int = Field(2, description="Ansatz layers")

class QAOARequest(BaseModel):
    """QAOA Optimization Request"""
    nodes: int = Field(4, description="Number of nodes")
    edges: List[Tuple[int, int, float]] = Field([], description="Graph edges")
    depth: int = Field(3, description="QAOA depth")

class QSVMRequest(BaseModel):
    """QSVM Classification Request"""
    X_train: List[List[float]] = Field(..., description="Training features")
    y_train: List[int] = Field(..., description="Training labels")
    X_test: Optional[List[List[float]]] = Field(None, description="Test features")

class QNNRequest(BaseModel):
    """QNN Regression Request"""
    X_train: List[List[float]] = Field(..., description="Training features")
    y_train: List[float] = Field(..., description="Training targets")
    X_predict: Optional[List[List[float]]] = Field(None, description="Prediction features")

class GroverRequest(BaseModel):
    """Grover Search Request"""
    n_qubits: int = Field(4, description="Number of qubits")
    target_state: int = Field(0, description="Target state to find")

# ==============================================
# Health Check Endpoint
# ==============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "algorithms": {
            "scientific": [
                "kalman_filter", "arima", "bayesian_ensemble", 
                "bias_correction", "anomaly_detection", "trend_analysis"
            ],
            "ml": [
                "random_forest", "xgboost", "lstm", 
                "gradient_boosting", "ensemble_voting"
            ],
            "quantum": [
                "vqe", "qaoa", "qsvm", "qnn", "grover"
            ]
        }
    }

# ==============================================
# Scientific Algorithms Endpoints
# ==============================================

@app.post("/api/scientific/kalman")
async def run_kalman(request: KalmanRequest):
    """
    Kalman Filter for noise reduction and state estimation.
    Reference: Kalman, R.E. (1960). A New Approach to Linear Filtering
    """
    try:
        result = kalman_filter.run_filter(
            request.data,
            request.process_noise,
            request.measurement_noise
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scientific/arima")
async def run_arima(request: ARIMARequest):
    """
    ARIMA Time Series Forecasting.
    Reference: Box, G.E.P., Jenkins, G.M. (1970). Time Series Analysis
    """
    try:
        result = arima_model.run_forecast(
            request.data,
            request.order,
            request.forecast_steps
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scientific/bayesian")
async def run_bayesian(request: BayesianRequest):
    """
    Bayesian Model Averaging for ensemble predictions.
    Reference: Hoeting et al. (1999). Bayesian Model Averaging
    """
    try:
        result = bayesian_ensemble.run_bma(
            request.models_predictions,
            request.observations,
            request.prior_weights
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scientific/bias-correction")
async def run_bias_correction(request: BiasRequest):
    """
    Quantile Mapping Bias Correction.
    Reference: Themeßl et al. (2011). Empirical-statistical downscaling
    """
    try:
        result = bias_correction.run_correction(
            request.predictions,
            request.observations,
            request.method
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scientific/anomaly")
async def run_anomaly_detection(request: AnomalyRequest):
    """
    Anomaly Detection using Z-score or IQR methods.
    """
    try:
        result = anomaly_detection.detect(
            request.data,
            request.method,
            request.threshold
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scientific/trend")
async def run_trend_analysis(request: TrendRequest):
    """
    Mann-Kendall Trend Test.
    Reference: Mann (1945), Kendall (1975)
    """
    try:
        result = trend_analysis.analyze(request.data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================
# Machine Learning Endpoints
# ==============================================

@app.post("/api/ml/random-forest")
async def run_random_forest(request: RandomForestRequest):
    """
    Random Forest Weather Prediction.
    Reference: Breiman, L. (2001). Random Forests. Machine Learning
    """
    try:
        result = random_forest.train_and_predict(
            np.array(request.X_train),
            np.array(request.y_train),
            np.array(request.X_predict) if request.X_predict else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/lstm")
async def run_lstm(request: LSTMRequest):
    """
    LSTM Neural Network Prediction.
    Reference: Hochreiter & Schmidhuber (1997). Long Short-Term Memory
    """
    try:
        result = lstm_predictor.train_and_predict({
            "X_train": request.X_train,
            "y_train": request.y_train,
            "X_predict": request.X_predict,
            "epochs": request.epochs
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/xgboost")
async def run_xgboost(request: XGBoostRequest):
    """
    XGBoost Weather Prediction.
    Reference: Chen & Guestrin (2016). XGBoost
    """
    try:
        result = xgboost_predictor.train_and_predict(
            np.array(request.X_train),
            np.array(request.y_train),
            np.array(request.X_predict) if request.X_predict else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/gradient-boosting")
async def run_gradient_boosting(request: GradientBoostingRequest):
    """
    Gradient Boosting Prediction.
    Reference: Friedman (2001). Greedy Function Approximation
    """
    try:
        result = gradient_boosting.train_and_predict(
            np.array(request.X_train),
            np.array(request.y_train),
            np.array(request.X_predict) if request.X_predict else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/ensemble")
async def run_ensemble(request: EnsembleRequest):
    """
    Ensemble Voting Regressor.
    Combines multiple ML models for improved predictions.
    """
    try:
        result = ensemble_voting.train_and_predict(
            np.array(request.X_train),
            np.array(request.y_train),
            np.array(request.X_predict) if request.X_predict else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================
# Quantum Computing Endpoints
# ==============================================

@app.post("/api/quantum/vqe")
async def run_vqe(request: VQERequest):
    """
    Variational Quantum Eigensolver for model weight optimization.
    Reference: Peruzzo et al. (2014). Nature Communications
    """
    try:
        result = vqe_optimizer.optimize(
            request.weather_params,
            request.num_qubits,
            request.layers
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quantum/qaoa")
async def run_qaoa(request: QAOARequest):
    """
    QAOA for combinatorial optimization.
    Reference: Farhi et al. (2014). Quantum Approximate Optimization Algorithm
    """
    try:
        result = qaoa_solver.optimize(
            request.nodes,
            request.edges,
            request.depth
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quantum/qsvm")
async def run_qsvm(request: QSVMRequest):
    """
    Quantum Support Vector Machine Classification.
    Reference: Havlíček et al. (2019). Nature
    """
    try:
        result = qsvm_classifier.train_and_predict(
            np.array(request.X_train),
            np.array(request.y_train),
            np.array(request.X_test) if request.X_test else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quantum/qnn")
async def run_qnn(request: QNNRequest):
    """
    Quantum Neural Network Regression.
    Reference: Schuld et al. (2020). Effect of data encoding
    """
    try:
        result = qnn_regression.train_and_predict(
            np.array(request.X_train),
            np.array(request.y_train),
            np.array(request.X_predict) if request.X_predict else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quantum/grover")
async def run_grover(request: GroverRequest):
    """
    Grover's Quantum Search Algorithm.
    Reference: Grover (1996). A fast quantum mechanical algorithm
    """
    try:
        result = grover_search.search(
            request.n_qubits,
            request.target_state
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================
# Code Retrieval Endpoints
# ==============================================

@app.get("/api/code/{category}/{algorithm}")
async def get_algorithm_code(category: str, algorithm: str):
    """Get Python source code for an algorithm"""
    code_mapping = {
        "scientific": {
            "kalman": kalman_filter.get_source_code,
            "arima": arima_model.get_source_code,
            "bayesian": bayesian_ensemble.get_source_code,
            "bias_correction": bias_correction.get_source_code,
            "anomaly": anomaly_detection.get_source_code,
            "trend": trend_analysis.get_source_code,
        },
        "ml": {
            "random_forest": random_forest.get_source_code,
            "lstm": lstm_predictor.get_source_code,
            "xgboost": xgboost_predictor.get_source_code,
            "gradient_boosting": gradient_boosting.get_source_code,
            "ensemble": ensemble_voting.get_source_code,
        },
        "quantum": {
            "vqe": vqe_optimizer.get_source_code,
            "qaoa": qaoa_solver.get_source_code,
            "qsvm": qsvm_classifier.get_source_code,
            "qnn": qnn_regression.get_source_code,
            "grover": grover_search.get_source_code,
        }
    }
    
    if category not in code_mapping:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    if algorithm not in code_mapping[category]:
        raise HTTPException(status_code=404, detail=f"Algorithm '{algorithm}' not found")
    
    return {
        "category": category,
        "algorithm": algorithm,
        "code": code_mapping[category][algorithm]()
    }

@app.get("/api/algorithms")
async def list_algorithms():
    """List all available algorithms with descriptions"""
    return {
        "scientific": {
            "kalman_filter": {
                "name": "Kalman Filter",
                "description": "State estimation and noise reduction",
                "library": "filterpy",
                "reference": "Kalman, R.E. (1960)"
            },
            "arima": {
                "name": "ARIMA",
                "description": "Time series forecasting",
                "library": "statsmodels",
                "reference": "Box & Jenkins (1970)"
            },
            "bayesian_ensemble": {
                "name": "Bayesian Model Averaging",
                "description": "Probabilistic model combination",
                "library": "scipy",
                "reference": "Hoeting et al. (1999)"
            },
            "bias_correction": {
                "name": "Quantile Mapping",
                "description": "Systematic bias correction",
                "library": "scipy",
                "reference": "Themeßl et al. (2011)"
            },
            "anomaly_detection": {
                "name": "Anomaly Detection",
                "description": "Z-score and IQR methods",
                "library": "numpy/scipy",
                "reference": "Standard statistical methods"
            },
            "trend_analysis": {
                "name": "Mann-Kendall Test",
                "description": "Non-parametric trend detection",
                "library": "pymannkendall",
                "reference": "Mann (1945), Kendall (1975)"
            }
        },
        "ml": {
            "random_forest": {
                "name": "Random Forest",
                "description": "Ensemble of decision trees",
                "library": "scikit-learn",
                "reference": "Breiman (2001)"
            },
            "lstm": {
                "name": "LSTM Neural Network",
                "description": "Long Short-Term Memory RNN",
                "library": "TensorFlow/Keras",
                "reference": "Hochreiter & Schmidhuber (1997)"
            },
            "xgboost": {
                "name": "XGBoost",
                "description": "Extreme Gradient Boosting",
                "library": "xgboost",
                "reference": "Chen & Guestrin (2016)"
            },
            "gradient_boosting": {
                "name": "Gradient Boosting",
                "description": "Sequential ensemble method",
                "library": "scikit-learn",
                "reference": "Friedman (2001)"
            },
            "ensemble_voting": {
                "name": "Voting Regressor",
                "description": "Model averaging ensemble",
                "library": "scikit-learn",
                "reference": "scikit-learn documentation"
            }
        },
        "quantum": {
            "vqe": {
                "name": "VQE",
                "description": "Variational Quantum Eigensolver",
                "library": "Qiskit",
                "reference": "Peruzzo et al. (2014)"
            },
            "qaoa": {
                "name": "QAOA",
                "description": "Quantum Approximate Optimization",
                "library": "Qiskit",
                "reference": "Farhi et al. (2014)"
            },
            "qsvm": {
                "name": "QSVM",
                "description": "Quantum Support Vector Machine",
                "library": "qiskit-machine-learning",
                "reference": "Havlíček et al. (2019)"
            },
            "qnn": {
                "name": "QNN",
                "description": "Quantum Neural Network",
                "library": "qiskit-machine-learning",
                "reference": "Schuld et al. (2020)"
            },
            "grover": {
                "name": "Grover's Algorithm",
                "description": "Quantum search algorithm",
                "library": "Qiskit",
                "reference": "Grover (1996)"
            }
        }
    }

# ==============================================
# Main Entry Point
# ==============================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
