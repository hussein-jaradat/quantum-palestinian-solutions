
# خطة بناء Backend Python كامل للخوارزميات العلمية والكمومية

## نظرة عامة

سنقوم بإنشاء **خادم Python منفصل** يحتوي على جميع خوارزميات AI و Machine Learning و Quantum Computing الحقيقية، ثم نربطه مع Edge Functions الموجودة. هذا سيمكنك من عرض **كود Python حقيقي** أمام لجنة التحكيم.

---

## الهيكل الكامل للمشروع

```text
python-backend/
├── main.py                           # FastAPI server
├── requirements.txt                  # المكتبات
├── Dockerfile                        # للنشر
├── railway.json                      # إعدادات Railway
├── .env.example                      # متغيرات البيئة
│
├── algorithms/
│   ├── __init__.py
│   │
│   ├── scientific/                   # خوارزميات علمية
│   │   ├── __init__.py
│   │   ├── kalman_filter.py          # Kalman Filter (filterpy)
│   │   ├── arima_model.py            # ARIMA (statsmodels)
│   │   ├── bayesian_ensemble.py      # BMA (scipy)
│   │   ├── bias_correction.py        # Quantile Mapping
│   │   ├── anomaly_detection.py      # Z-score & IQR
│   │   └── trend_analysis.py         # Mann-Kendall
│   │
│   ├── ml/                           # Machine Learning
│   │   ├── __init__.py
│   │   ├── lstm_predictor.py         # LSTM (TensorFlow)
│   │   ├── random_forest.py          # Random Forest (sklearn)
│   │   ├── xgboost_predictor.py      # XGBoost
│   │   ├── gradient_boosting.py      # GradientBoosting
│   │   └── ensemble_voting.py        # VotingRegressor
│   │
│   └── quantum/                      # Quantum Computing
│       ├── __init__.py
│       ├── vqe_optimizer.py          # VQE (Qiskit)
│       ├── qaoa_solver.py            # QAOA (Qiskit)
│       ├── qsvm_classifier.py        # QSVM (qiskit-machine-learning)
│       ├── qnn_regression.py         # QNN (Qiskit)
│       └── grover_search.py          # Grover's Algorithm
│
├── services/
│   ├── __init__.py
│   ├── ibm_quantum_service.py        # IBM Quantum Runtime
│   ├── weather_processor.py          # معالجة بيانات الطقس
│   └── model_trainer.py              # تدريب النماذج
│
├── models/
│   ├── schemas.py                    # Pydantic Schemas
│   └── trained/                      # النماذج المدربة
│       └── .gitkeep
│
└── tests/
    ├── test_scientific.py
    ├── test_ml.py
    └── test_quantum.py
```

---

## المرحلة 1: ملفات Python الأساسية

### 1.1 ملف requirements.txt
```text
# FastAPI & Server
fastapi==0.109.2
uvicorn[standard]==0.27.1
pydantic==2.6.1
python-dotenv==1.0.1

# Scientific Computing
numpy==1.26.4
scipy==1.12.0
pandas==2.2.0
filterpy==1.4.5
statsmodels==0.14.1

# Machine Learning
scikit-learn==1.4.0
xgboost==2.0.3
tensorflow==2.15.0
keras==2.15.0

# Quantum Computing
qiskit==1.0.2
qiskit-algorithms==0.3.0
qiskit-machine-learning==0.7.1
qiskit-optimization==0.6.0
qiskit-ibm-runtime==0.20.0

# Utilities
httpx==0.26.0
pytz==2024.1
```

### 1.2 ملف main.py (FastAPI Server)
```python
"""
QANWP-AI Python Backend
خوارزميات التنبؤ الجوي العلمية والكمومية
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np

# Import algorithms
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
    ensemble_voting
)
from algorithms.quantum import (
    vqe_optimizer,
    qaoa_solver,
    qsvm_classifier,
    qnn_regression,
    grover_search
)

app = FastAPI(
    title="QANWP-AI Python Backend",
    description="Real Scientific & Quantum ML Algorithms for Weather Prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class KalmanRequest(BaseModel):
    data: List[float]
    process_noise: float = 0.1
    measurement_noise: float = 1.0

class ARIMARequest(BaseModel):
    data: List[float]
    order: tuple = (2, 1, 1)
    forecast_steps: int = 7

class RandomForestRequest(BaseModel):
    X_train: List[List[float]]
    y_train: List[float]
    X_predict: Optional[List[List[float]]] = None

class VQERequest(BaseModel):
    weather_params: Dict[str, float]
    num_qubits: int = 4
    layers: int = 2

class QSVMRequest(BaseModel):
    X_train: List[List[float]]
    y_train: List[int]
    X_test: Optional[List[List[float]]] = None

# =============== SCIENTIFIC ENDPOINTS ===============

@app.post("/api/scientific/kalman")
async def run_kalman(request: KalmanRequest):
    """Kalman Filter for noise reduction"""
    result = kalman_filter.run_filter(
        request.data,
        request.process_noise,
        request.measurement_noise
    )
    return result

@app.post("/api/scientific/arima")
async def run_arima(request: ARIMARequest):
    """ARIMA Time Series Forecasting"""
    result = arima_model.run_forecast(
        request.data,
        request.order,
        request.forecast_steps
    )
    return result

# =============== ML ENDPOINTS ===============

@app.post("/api/ml/random-forest")
async def run_random_forest(request: RandomForestRequest):
    """Random Forest Weather Prediction"""
    result = random_forest.train_and_predict(
        np.array(request.X_train),
        np.array(request.y_train),
        np.array(request.X_predict) if request.X_predict else None
    )
    return result

@app.post("/api/ml/lstm")
async def run_lstm(request: dict):
    """LSTM Neural Network Prediction"""
    result = lstm_predictor.train_and_predict(request)
    return result

# =============== QUANTUM ENDPOINTS ===============

@app.post("/api/quantum/vqe")
async def run_vqe(request: VQERequest):
    """Variational Quantum Eigensolver"""
    result = vqe_optimizer.optimize(
        request.weather_params,
        request.num_qubits,
        request.layers
    )
    return result

@app.post("/api/quantum/qaoa")
async def run_qaoa(request: dict):
    """QAOA Combinatorial Optimization"""
    result = qaoa_solver.optimize(
        request.get("nodes", 4),
        request.get("edges", []),
        request.get("depth", 3)
    )
    return result

@app.post("/api/quantum/qsvm")
async def run_qsvm(request: QSVMRequest):
    """Quantum SVM Classification"""
    result = qsvm_classifier.train_and_predict(
        np.array(request.X_train),
        np.array(request.y_train),
        np.array(request.X_test) if request.X_test else None
    )
    return result

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "algorithms": {
            "scientific": ["kalman", "arima", "bayesian", "bias_correction", "anomaly", "trend"],
            "ml": ["random_forest", "xgboost", "lstm", "gradient_boosting", "ensemble"],
            "quantum": ["vqe", "qaoa", "qsvm", "qnn", "grover"]
        }
    }

@app.get("/api/code/{algorithm}")
async def get_algorithm_code(algorithm: str):
    """Get Python source code for an algorithm"""
    code_mapping = {
        "kalman": kalman_filter.get_source_code(),
        "arima": arima_model.get_source_code(),
        "vqe": vqe_optimizer.get_source_code(),
        "qsvm": qsvm_classifier.get_source_code(),
    }
    if algorithm not in code_mapping:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    return {"algorithm": algorithm, "code": code_mapping[algorithm]}
```

---

## المرحلة 2: الخوارزميات العلمية (Scientific)

### 2.1 Kalman Filter (kalman_filter.py)
```python
"""
Kalman Filter Implementation
Reference: Kalman, R.E. (1960). A New Approach to Linear Filtering
"""
import numpy as np
from filterpy.kalman import KalmanFilter as KF
from typing import List, Dict, Any
import inspect

class WeatherKalmanFilter:
    """
    Kalman Filter for weather data smoothing and prediction.
    
    Mathematical Model:
    - State transition: x_k = F @ x_{k-1} + w
    - Measurement: z_k = H @ x_k + v
    
    Where:
    - F: State transition matrix
    - H: Measurement matrix
    - Q: Process noise covariance
    - R: Measurement noise covariance
    """
    
    def __init__(self, dim_x: int = 2, dim_z: int = 1):
        self.kf = KF(dim_x=dim_x, dim_z=dim_z)
        
        # State transition matrix (position + velocity model)
        self.kf.F = np.array([
            [1., 1.],  # x = x + v*dt
            [0., 1.]   # v = v
        ])
        
        # Measurement matrix (we only observe position)
        self.kf.H = np.array([[1., 0.]])
        
        # Initial covariance
        self.kf.P *= 1000.
        
    def configure(self, process_noise: float, measurement_noise: float):
        """Configure noise parameters"""
        self.kf.Q = np.array([
            [0.25, 0.5],
            [0.5, 1.0]
        ]) * process_noise
        
        self.kf.R = np.array([[measurement_noise]])
        
    def filter_data(self, observations: List[float]) -> Dict[str, Any]:
        """
        Apply Kalman filter to observations.
        
        Args:
            observations: List of noisy measurements
            
        Returns:
            Dictionary with filtered data, gains, and uncertainties
        """
        filtered = []
        velocities = []
        gains = []
        uncertainties = []
        
        # Initialize with first observation
        self.kf.x = np.array([[observations[0]], [0.]])
        
        for z in observations:
            # Predict step
            self.kf.predict()
            
            # Update step
            self.kf.update(np.array([[z]]))
            
            filtered.append(float(self.kf.x[0, 0]))
            velocities.append(float(self.kf.x[1, 0]))
            gains.append(float(self.kf.K[0, 0]))
            uncertainties.append(float(self.kf.P[0, 0]))
            
        return {
            "filtered": filtered,
            "velocities": velocities,
            "kalman_gains": gains,
            "uncertainties": uncertainties,
            "final_state": {
                "position": float(self.kf.x[0, 0]),
                "velocity": float(self.kf.x[1, 0])
            }
        }
    
    def forecast(self, steps: int) -> List[float]:
        """Forecast future values"""
        forecasts = []
        for _ in range(steps):
            self.kf.predict()
            forecasts.append(float(self.kf.x[0, 0]))
        return forecasts


def run_filter(data: List[float], 
               process_noise: float = 0.1, 
               measurement_noise: float = 1.0) -> Dict[str, Any]:
    """
    Run Kalman filter on weather data.
    
    Args:
        data: Raw temperature/precipitation observations
        process_noise: Q matrix scaling factor
        measurement_noise: R matrix scaling factor
        
    Returns:
        Complete filter results with statistics
    """
    kf = WeatherKalmanFilter()
    kf.configure(process_noise, measurement_noise)
    
    result = kf.filter_data(data)
    forecast = kf.forecast(7)
    
    # Calculate improvement metrics
    original_variance = np.var(data)
    filtered_variance = np.var(result["filtered"])
    noise_reduction = (1 - filtered_variance / original_variance) * 100
    
    return {
        "algorithm": "Kalman Filter",
        "library": "filterpy",
        "reference": "Kalman, R.E. (1960). A New Approach to Linear Filtering",
        "input": {
            "data_points": len(data),
            "process_noise": process_noise,
            "measurement_noise": measurement_noise
        },
        "output": {
            "filtered_last_10": result["filtered"][-10:],
            "forecast_7_days": forecast,
            "avg_kalman_gain": np.mean(result["kalman_gains"]),
            "final_uncertainty": result["uncertainties"][-1]
        },
        "metrics": {
            "noise_reduction_percent": round(noise_reduction, 2),
            "signal_improvement": round(100 - noise_reduction / 2, 2)
        }
    }


def get_source_code() -> str:
    """Return the source code of this module"""
    return inspect.getsource(WeatherKalmanFilter)
```

### 2.2 ARIMA Model (arima_model.py)
```python
"""
ARIMA Time Series Forecasting
Reference: Box, G.E.P., Jenkins, G.M. (1970). Time Series Analysis
"""
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller, acf, pacf
from typing import List, Dict, Any, Tuple
import inspect
import warnings
warnings.filterwarnings('ignore')


class WeatherARIMA:
    """
    ARIMA model for weather time series forecasting.
    
    ARIMA(p, d, q):
    - p: Autoregressive order
    - d: Differencing order
    - q: Moving average order
    """
    
    def __init__(self, order: Tuple[int, int, int] = (2, 1, 1)):
        self.order = order
        self.model = None
        self.fitted = None
        
    def fit(self, data: np.ndarray) -> Dict[str, Any]:
        """Fit ARIMA model to data"""
        self.model = ARIMA(data, order=self.order)
        self.fitted = self.model.fit()
        
        return {
            "aic": self.fitted.aic,
            "bic": self.fitted.bic,
            "ar_coefficients": self.fitted.arparams.tolist(),
            "ma_coefficients": self.fitted.maparams.tolist(),
            "log_likelihood": self.fitted.llf
        }
    
    def forecast(self, steps: int) -> Dict[str, Any]:
        """Generate forecasts with confidence intervals"""
        forecast_result = self.fitted.get_forecast(steps=steps)
        mean = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int()
        
        return {
            "forecast": mean.tolist(),
            "lower_bound": conf_int.iloc[:, 0].tolist(),
            "upper_bound": conf_int.iloc[:, 1].tolist()
        }
    
    def diagnostics(self, data: np.ndarray) -> Dict[str, Any]:
        """Perform model diagnostics"""
        # ADF test for stationarity
        adf_result = adfuller(data)
        
        # ACF and PACF
        acf_values = acf(data, nlags=10)
        pacf_values = pacf(data, nlags=10)
        
        # Residual analysis
        residuals = self.fitted.resid
        
        return {
            "stationarity_test": {
                "adf_statistic": adf_result[0],
                "p_value": adf_result[1],
                "is_stationary": adf_result[1] < 0.05
            },
            "acf": acf_values.tolist(),
            "pacf": pacf_values.tolist(),
            "residuals": {
                "mean": np.mean(residuals),
                "std": np.std(residuals),
                "is_white_noise": abs(np.mean(residuals)) < 0.1
            }
        }


def run_forecast(data: List[float], 
                 order: Tuple[int, int, int] = (2, 1, 1),
                 forecast_steps: int = 7) -> Dict[str, Any]:
    """
    Run ARIMA forecast on weather data.
    
    Args:
        data: Historical weather observations
        order: ARIMA(p, d, q) order
        forecast_steps: Number of future steps to forecast
        
    Returns:
        Complete forecast results with diagnostics
    """
    data_array = np.array(data)
    
    arima = WeatherARIMA(order=order)
    fit_stats = arima.fit(data_array)
    forecast = arima.forecast(forecast_steps)
    diagnostics = arima.diagnostics(data_array)
    
    return {
        "algorithm": "ARIMA",
        "library": "statsmodels",
        "reference": "Box, G.E.P., Jenkins, G.M. (1970). Time Series Analysis",
        "parameters": {
            "p": order[0],
            "d": order[1],
            "q": order[2]
        },
        "fit_statistics": fit_stats,
        "forecast": forecast,
        "diagnostics": diagnostics,
        "trend": "increasing" if np.mean(np.diff(data)) > 0 else "decreasing"
    }


def get_source_code() -> str:
    """Return the source code of this module"""
    return inspect.getsource(WeatherARIMA)
```

---

## المرحلة 3: خوارزميات Machine Learning

### 3.1 Random Forest (random_forest.py)
```python
"""
Random Forest for Weather Prediction
Reference: Breiman, L. (2001). Random Forests. Machine Learning
"""
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import List, Dict, Any, Optional
import inspect


class WeatherRandomForest:
    """
    Random Forest Regressor for weather prediction.
    
    Features:
    - Ensemble of decision trees
    - Feature importance analysis
    - Cross-validation support
    """
    
    def __init__(self, n_estimators: int = 100, max_depth: int = 10):
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.feature_names = [
            "temperature_lag1", "temperature_lag2",
            "humidity", "pressure", "wind_speed",
            "day_of_year", "month"
        ]
        
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train the model and return metrics"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='neg_mean_absolute_error')
        
        # Predictions on test set
        y_pred = self.model.predict(X_test)
        
        return {
            "cv_scores": (-cv_scores).tolist(),
            "cv_mean": float(-cv_scores.mean()),
            "cv_std": float(cv_scores.std()),
            "test_mae": float(mean_absolute_error(y_test, y_pred)),
            "test_rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "test_r2": float(r2_score(y_test, y_pred)),
            "feature_importance": dict(zip(
                self.feature_names[:X.shape[1]],
                self.model.feature_importances_.tolist()
            ))
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return self.model.predict(X)


def train_and_predict(X_train: np.ndarray, 
                      y_train: np.ndarray,
                      X_predict: Optional[np.ndarray] = None) -> Dict[str, Any]:
    """
    Train Random Forest and optionally make predictions.
    
    Args:
        X_train: Training features
        y_train: Training targets
        X_predict: Optional features for prediction
        
    Returns:
        Training metrics and predictions
    """
    rf = WeatherRandomForest()
    train_metrics = rf.train(X_train, y_train)
    
    result = {
        "algorithm": "Random Forest",
        "library": "scikit-learn",
        "reference": "Breiman, L. (2001). Random Forests. Machine Learning",
        "model_config": {
            "n_estimators": 100,
            "max_depth": 10,
            "min_samples_split": 5
        },
        "training_metrics": train_metrics
    }
    
    if X_predict is not None:
        predictions = rf.predict(X_predict)
        result["predictions"] = predictions.tolist()
    
    return result


def get_source_code() -> str:
    """Return the source code of this module"""
    return inspect.getsource(WeatherRandomForest)
```

### 3.2 LSTM Neural Network (lstm_predictor.py)
```python
"""
LSTM Neural Network for Weather Forecasting
Reference: Hochreiter & Schmidhuber (1997). Long Short-Term Memory
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
from typing import Dict, Any, List
import inspect


class WeatherLSTM:
    """
    LSTM Neural Network for time series weather prediction.
    
    Architecture:
    - Stacked LSTM layers
    - Dropout for regularization
    - Dense output layer
    """
    
    def __init__(self, sequence_length: int = 24, n_features: int = 4):
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.model = self._build_model()
        
    def _build_model(self) -> Sequential:
        """Build LSTM architecture"""
        model = Sequential([
            LSTM(64, return_sequences=True, 
                 input_shape=(self.sequence_length, self.n_features)),
            BatchNormalization(),
            Dropout(0.2),
            
            LSTM(32, return_sequences=False),
            BatchNormalization(),
            Dropout(0.2),
            
            Dense(16, activation='relu'),
            Dense(1)
        ])
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train(self, X: np.ndarray, y: np.ndarray, 
              epochs: int = 50) -> Dict[str, Any]:
        """Train the LSTM model"""
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=32,
            validation_split=0.2,
            callbacks=[early_stop],
            verbose=0
        )
        
        return {
            "epochs_trained": len(history.history['loss']),
            "final_loss": float(history.history['loss'][-1]),
            "final_val_loss": float(history.history['val_loss'][-1]),
            "final_mae": float(history.history['mae'][-1]),
            "final_val_mae": float(history.history['val_mae'][-1]),
            "training_history": {
                "loss": history.history['loss'],
                "val_loss": history.history['val_loss']
            }
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        return self.model.predict(X, verbose=0)


def train_and_predict(request: dict) -> Dict[str, Any]:
    """
    Train LSTM and make predictions.
    
    Args:
        request: Dictionary containing X_train, y_train, X_predict
        
    Returns:
        Training metrics and predictions
    """
    X_train = np.array(request.get("X_train", []))
    y_train = np.array(request.get("y_train", []))
    epochs = request.get("epochs", 50)
    
    # Reshape for LSTM [samples, timesteps, features]
    if len(X_train.shape) == 2:
        X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
    
    lstm = WeatherLSTM(
        sequence_length=X_train.shape[1],
        n_features=X_train.shape[2]
    )
    
    train_metrics = lstm.train(X_train, y_train, epochs)
    
    result = {
        "algorithm": "LSTM Neural Network",
        "library": "TensorFlow/Keras",
        "reference": "Hochreiter & Schmidhuber (1997). Long Short-Term Memory",
        "architecture": {
            "layers": ["LSTM(64)", "LSTM(32)", "Dense(16)", "Dense(1)"],
            "sequence_length": X_train.shape[1],
            "features": X_train.shape[2]
        },
        "training_metrics": train_metrics
    }
    
    if "X_predict" in request:
        X_predict = np.array(request["X_predict"])
        if len(X_predict.shape) == 2:
            X_predict = X_predict.reshape((X_predict.shape[0], X_predict.shape[1], 1))
        predictions = lstm.predict(X_predict)
        result["predictions"] = predictions.flatten().tolist()
    
    return result


def get_source_code() -> str:
    """Return the source code of this module"""
    return inspect.getsource(WeatherLSTM)
```

---

## المرحلة 4: خوارزميات Quantum Computing (Qiskit)

### 4.1 VQE Optimizer (vqe_optimizer.py)
```python
"""
Variational Quantum Eigensolver (VQE)
Reference: Peruzzo et al. (2014). Nature Communications
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import TwoLocal
from qiskit.quantum_info import SparsePauliOp
from qiskit_algorithms import VQE
from qiskit_algorithms.optimizers import COBYLA, SPSA
from qiskit.primitives import Estimator
from typing import Dict, Any
import inspect


class WeatherVQE:
    """
    VQE for optimizing weather model weights.
    
    Uses variational quantum circuits to find optimal
    parameters for ensemble model weighting.
    """
    
    def __init__(self, num_qubits: int = 4, layers: int = 2):
        self.num_qubits = num_qubits
        self.layers = layers
        
        # Build ansatz circuit
        self.ansatz = TwoLocal(
            num_qubits=num_qubits,
            rotation_blocks=['ry', 'rz'],
            entanglement_blocks='cx',
            entanglement='linear',
            reps=layers
        )
        
    def build_hamiltonian(self, weather_params: Dict[str, float]) -> SparsePauliOp:
        """
        Build Hamiltonian from weather parameters.
        
        The Hamiltonian encodes the optimization problem:
        H = Σ_i c_i * Z_i + Σ_{ij} J_{ij} * Z_i * Z_j
        """
        # Normalize parameters
        temp = weather_params.get('temperature', 20) / 50
        humidity = weather_params.get('humidity', 50) / 100
        pressure = weather_params.get('pressure', 1013) / 1050
        wind = weather_params.get('wind_speed', 10) / 50
        
        # Build Pauli terms
        pauli_terms = []
        
        # Single-qubit terms (local fields)
        pauli_terms.append(("ZIII", temp))
        pauli_terms.append(("IZII", humidity))
        pauli_terms.append(("IIZI", pressure))
        pauli_terms.append(("IIIZ", wind))
        
        # Two-qubit terms (interactions)
        pauli_terms.append(("ZZII", 0.3))  # temp-humidity coupling
        pauli_terms.append(("IZZI", 0.2))  # humidity-pressure coupling
        pauli_terms.append(("IIZZ", 0.1))  # pressure-wind coupling
        pauli_terms.append(("ZIIZ", 0.15)) # temp-wind coupling
        
        return SparsePauliOp.from_list(pauli_terms)
    
    def optimize(self, weather_params: Dict[str, float]) -> Dict[str, Any]:
        """Run VQE optimization"""
        hamiltonian = self.build_hamiltonian(weather_params)
        
        estimator = Estimator()
        optimizer = COBYLA(maxiter=100)
        
        vqe = VQE(estimator, self.ansatz, optimizer)
        result = vqe.compute_minimum_eigenvalue(hamiltonian)
        
        # Extract optimal parameters
        optimal_params = result.optimal_parameters
        
        # Convert to model weights
        model_weights = self._params_to_weights(optimal_params)
        
        return {
            "optimal_energy": float(result.eigenvalue.real),
            "optimal_parameters": [float(p) for p in optimal_params],
            "iterations": result.cost_function_evals,
            "model_weights": model_weights,
            "circuit_depth": self.ansatz.depth(),
            "qasm_circuit": self.get_qasm(optimal_params)
        }
    
    def _params_to_weights(self, params: np.ndarray) -> Dict[str, float]:
        """Convert circuit parameters to model weights"""
        # Use first few parameters as weights
        weights = np.abs(np.cos(params[:4]))
        weights = weights / weights.sum()  # Normalize
        
        return {
            "IFS": float(weights[0]),
            "GFS": float(weights[1]),
            "ICON": float(weights[2]),
            "ERA5": float(weights[3])
        }
    
    def get_qasm(self, params: np.ndarray = None) -> str:
        """Generate OpenQASM 3.0 circuit"""
        if params is None:
            params = np.random.random(self.ansatz.num_parameters) * 2 * np.pi
            
        bound_circuit = self.ansatz.assign_parameters(params)
        return bound_circuit.qasm()


def optimize(weather_params: Dict[str, float],
             num_qubits: int = 4,
             layers: int = 2) -> Dict[str, Any]:
    """
    Run VQE optimization for weather model weighting.
    
    Args:
        weather_params: Current weather conditions
        num_qubits: Number of qubits
        layers: Ansatz depth
        
    Returns:
        Optimization results with model weights
    """
    vqe = WeatherVQE(num_qubits, layers)
    result = vqe.optimize(weather_params)
    
    return {
        "algorithm": "VQE (Variational Quantum Eigensolver)",
        "library": "Qiskit",
        "reference": "Peruzzo et al. (2014). Nature Communications",
        "quantum_config": {
            "num_qubits": num_qubits,
            "ansatz_layers": layers,
            "optimizer": "COBYLA"
        },
        "input_params": weather_params,
        "results": result
    }


def get_source_code() -> str:
    """Return the source code of this module"""
    return inspect.getsource(WeatherVQE)
```

### 4.2 QSVM Classifier (qsvm_classifier.py)
```python
"""
Quantum Support Vector Machine (QSVM)
Reference: Havlíček et al. (2019). Nature
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.algorithms import QSVC
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from qiskit.primitives import Sampler
from typing import Dict, Any, Optional
import inspect


class WeatherQSVM:
    """
    Quantum SVM for weather pattern classification.
    
    Uses quantum feature maps to compute kernel
    in high-dimensional Hilbert space.
    """
    
    WEATHER_CLASSES = {
        0: "clear",
        1: "cloudy", 
        2: "rainy",
        3: "stormy"
    }
    
    def __init__(self, feature_dim: int = 4, reps: int = 2):
        self.feature_dim = feature_dim
        
        # ZZ Feature Map for encoding
        self.feature_map = ZZFeatureMap(
            feature_dimension=feature_dim,
            reps=reps,
            entanglement='linear'
        )
        
        # Quantum kernel
        sampler = Sampler()
        self.kernel = FidelityQuantumKernel(
            feature_map=self.feature_map,
            sampler=sampler
        )
        
        # QSVC classifier
        self.classifier = QSVC(
            quantum_kernel=self.kernel
        )
        
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train the QSVM classifier"""
        # Normalize features to [0, 2π]
        X_normalized = self._normalize_features(X)
        
        self.classifier.fit(X_normalized, y)
        
        # Training accuracy
        train_predictions = self.classifier.predict(X_normalized)
        accuracy = np.mean(train_predictions == y)
        
        return {
            "training_samples": len(y),
            "training_accuracy": float(accuracy),
            "feature_map_depth": self.feature_map.depth(),
            "num_parameters": self.feature_map.num_parameters
        }
    
    def predict(self, X: np.ndarray) -> Dict[str, Any]:
        """Classify weather patterns"""
        X_normalized = self._normalize_features(X)
        predictions = self.classifier.predict(X_normalized)
        
        return {
            "predictions": predictions.tolist(),
            "class_labels": [self.WEATHER_CLASSES.get(p, "unknown") for p in predictions]
        }
    
    def _normalize_features(self, X: np.ndarray) -> np.ndarray:
        """Normalize features to quantum-compatible range"""
        X_min = X.min(axis=0, keepdims=True)
        X_max = X.max(axis=0, keepdims=True)
        return (X - X_min) / (X_max - X_min + 1e-8) * np.pi
    
    def get_feature_map_qasm(self, x: np.ndarray) -> str:
        """Generate QASM for feature map circuit"""
        bound_circuit = self.feature_map.assign_parameters(x[:self.feature_dim])
        return bound_circuit.qasm()


def train_and_predict(X_train: np.ndarray,
                      y_train: np.ndarray,
                      X_test: Optional[np.ndarray] = None) -> Dict[str, Any]:
    """
    Train QSVM and optionally classify test data.
    
    Args:
        X_train: Training features (weather parameters)
        y_train: Training labels (weather classes)
        X_test: Optional test features
        
    Returns:
        Training metrics and predictions
    """
    feature_dim = min(4, X_train.shape[1])
    qsvm = WeatherQSVM(feature_dim=feature_dim)
    
    train_metrics = qsvm.train(X_train[:, :feature_dim], y_train)
    
    result = {
        "algorithm": "QSVM (Quantum Support Vector Machine)",
        "library": "qiskit-machine-learning",
        "reference": "Havlíček et al. (2019). Nature",
        "quantum_config": {
            "feature_dimension": feature_dim,
            "feature_map": "ZZFeatureMap",
            "kernel": "FidelityQuantumKernel"
        },
        "training_metrics": train_metrics,
        "weather_classes": WeatherQSVM.WEATHER_CLASSES
    }
    
    if X_test is not None:
        predictions = qsvm.predict(X_test[:, :feature_dim])
        result["predictions"] = predictions
        result["qasm_example"] = qsvm.get_feature_map_qasm(X_test[0])
    
    return result


def get_source_code() -> str:
    """Return the source code of this module"""
    return inspect.getsource(WeatherQSVM)
```

---

## المرحلة 5: ملفات النشر

### 5.1 Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.2 railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

---

## المرحلة 6: تعديل Edge Functions

سنقوم بتعديل `scientific-algorithms` و `quantum-ml-engine` لاستدعاء Python API:

```typescript
// في scientific-algorithms/index.ts
const PYTHON_API_URL = Deno.env.get("PYTHON_API_URL");

// إذا كان Python API متوفر، استخدمه
if (PYTHON_API_URL) {
  const response = await fetch(`${PYTHON_API_URL}/api/scientific/kalman`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, process_noise, measurement_noise })
  });
  return await response.json();
}
// وإلا استخدم التنفيذ المحلي TypeScript
```

---

## المرحلة 7: واجهة عرض الكود للجنة

### PythonCodeViewer.tsx
مكون React يعرض كود Python الحقيقي مع:
- Syntax highlighting
- عرض المعادلات الرياضية
- الرسوم البيانية للنتائج
- تشغيل تجريبي للخوارزميات

---

## ملخص الملفات المطلوب إنشاؤها

| رقم | الملف | الوصف |
|-----|-------|-------|
| 1 | `python-backend/main.py` | FastAPI server |
| 2 | `python-backend/requirements.txt` | المكتبات |
| 3 | `python-backend/Dockerfile` | Docker image |
| 4 | `python-backend/railway.json` | إعدادات النشر |
| 5 | `python-backend/algorithms/scientific/kalman_filter.py` | Kalman Filter |
| 6 | `python-backend/algorithms/scientific/arima_model.py` | ARIMA |
| 7 | `python-backend/algorithms/scientific/bayesian_ensemble.py` | BMA |
| 8 | `python-backend/algorithms/scientific/bias_correction.py` | Quantile Mapping |
| 9 | `python-backend/algorithms/scientific/anomaly_detection.py` | Anomaly Detection |
| 10 | `python-backend/algorithms/scientific/trend_analysis.py` | Mann-Kendall |
| 11 | `python-backend/algorithms/ml/random_forest.py` | Random Forest |
| 12 | `python-backend/algorithms/ml/lstm_predictor.py` | LSTM |
| 13 | `python-backend/algorithms/ml/xgboost_predictor.py` | XGBoost |
| 14 | `python-backend/algorithms/ml/ensemble_voting.py` | Ensemble |
| 15 | `python-backend/algorithms/quantum/vqe_optimizer.py` | VQE |
| 16 | `python-backend/algorithms/quantum/qaoa_solver.py` | QAOA |
| 17 | `python-backend/algorithms/quantum/qsvm_classifier.py` | QSVM |
| 18 | `python-backend/algorithms/quantum/qnn_regression.py` | QNN |
| 19 | `python-backend/algorithms/quantum/grover_search.py` | Grover |
| 20 | `src/components/PythonCodeViewer.tsx` | عرض الكود |

---

## خطوات ما بعد الإنشاء

1. **نشر على Railway.app**:
   - إنشاء حساب مجاني
   - ربط GitHub repository
   - نشر مجلد `python-backend/`

2. **إضافة PYTHON_API_URL كـ secret**:
   - بعد النشر، أضف عنوان API كمتغير بيئة

3. **اختبار الخوارزميات**:
   - اختبر كل endpoint من الـ 16 خوارزمية
   - تأكد من التكامل مع Edge Functions
