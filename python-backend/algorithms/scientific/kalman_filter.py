"""
==============================================
Kalman Filter Implementation
مرشح كالمان لتقليل الضوضاء وتقدير الحالة

Reference: Kalman, R.E. (1960). A New Approach to 
Linear Filtering and Prediction Problems.
Journal of Basic Engineering, 82(1), 35-45.
==============================================
"""

import numpy as np
from filterpy.kalman import KalmanFilter as KF
from typing import List, Dict, Any
import inspect


class WeatherKalmanFilter:
    """
    Kalman Filter for weather data smoothing and prediction.
    
    Mathematical Model:
    ==================
    State-space representation:
    
    State transition:  x_k = F @ x_{k-1} + w_k
    Measurement:       z_k = H @ x_k + v_k
    
    Where:
    - x_k: State vector at time k [position, velocity]
    - F: State transition matrix
    - H: Measurement matrix (observation model)
    - w_k: Process noise ~ N(0, Q)
    - v_k: Measurement noise ~ N(0, R)
    - Q: Process noise covariance matrix
    - R: Measurement noise covariance matrix
    
    Kalman Equations:
    ================
    Predict Step:
        x̂_k|k-1 = F @ x̂_{k-1|k-1}
        P_k|k-1 = F @ P_{k-1|k-1} @ F^T + Q
    
    Update Step:
        K_k = P_k|k-1 @ H^T @ (H @ P_k|k-1 @ H^T + R)^{-1}
        x̂_k|k = x̂_k|k-1 + K_k @ (z_k - H @ x̂_k|k-1)
        P_k|k = (I - K_k @ H) @ P_k|k-1
    
    Weather Application:
    ===================
    - State: [temperature, rate of change]
    - Observation: Noisy temperature measurement
    - Filters sensor noise for cleaner predictions
    """
    
    def __init__(self, dim_x: int = 2, dim_z: int = 1):
        """
        Initialize Kalman Filter.
        
        Args:
            dim_x: State dimension (default 2: position + velocity)
            dim_z: Measurement dimension (default 1: single observation)
        """
        self.kf = KF(dim_x=dim_x, dim_z=dim_z)
        
        # State transition matrix (constant velocity model)
        # x_new = x_old + v*dt (where dt=1)
        # v_new = v_old
        self.kf.F = np.array([
            [1., 1.],  # x = x + v*dt
            [0., 1.]   # v = v (constant velocity)
        ])
        
        # Measurement matrix (we only observe position)
        self.kf.H = np.array([[1., 0.]])
        
        # Initial state covariance (high uncertainty)
        self.kf.P *= 1000.
        
        # Initial state estimate
        self.kf.x = np.array([[0.], [0.]])
        
    def configure(self, process_noise: float, measurement_noise: float):
        """
        Configure noise parameters.
        
        Args:
            process_noise: Scaling factor for process noise covariance Q
            measurement_noise: Measurement noise variance R
        """
        # Process noise covariance matrix
        # Discrete white noise acceleration model
        self.kf.Q = np.array([
            [0.25, 0.5],
            [0.5, 1.0]
        ]) * process_noise
        
        # Measurement noise covariance
        self.kf.R = np.array([[measurement_noise]])
        
    def filter_data(self, observations: List[float]) -> Dict[str, Any]:
        """
        Apply Kalman filter to a sequence of observations.
        
        Args:
            observations: List of noisy measurements
            
        Returns:
            Dictionary containing:
            - filtered: Smoothed state estimates
            - velocities: Estimated rates of change
            - kalman_gains: Filter gains at each step
            - uncertainties: State covariances
            - final_state: Last estimated state
        """
        filtered = []
        velocities = []
        gains = []
        uncertainties = []
        innovations = []
        
        # Initialize state with first observation
        self.kf.x = np.array([[observations[0]], [0.]])
        
        for i, z in enumerate(observations):
            # === PREDICT STEP ===
            # x̂_k|k-1 = F @ x̂_{k-1|k-1}
            # P_k|k-1 = F @ P_{k-1|k-1} @ F^T + Q
            self.kf.predict()
            
            # Calculate innovation (measurement residual)
            # y_k = z_k - H @ x̂_k|k-1
            innovation = z - float(self.kf.H @ self.kf.x)
            innovations.append(innovation)
            
            # === UPDATE STEP ===
            # K_k = P_k|k-1 @ H^T @ S^{-1}
            # x̂_k|k = x̂_k|k-1 + K_k @ y_k
            # P_k|k = (I - K_k @ H) @ P_k|k-1
            self.kf.update(np.array([[z]]))
            
            # Store results
            filtered.append(float(self.kf.x[0, 0]))
            velocities.append(float(self.kf.x[1, 0]))
            gains.append(float(self.kf.K[0, 0]))
            uncertainties.append(float(self.kf.P[0, 0]))
            
        return {
            "filtered": filtered,
            "velocities": velocities,
            "kalman_gains": gains,
            "uncertainties": uncertainties,
            "innovations": innovations,
            "final_state": {
                "position": float(self.kf.x[0, 0]),
                "velocity": float(self.kf.x[1, 0])
            },
            "final_covariance": self.kf.P.tolist()
        }
    
    def forecast(self, steps: int) -> List[float]:
        """
        Forecast future values by iterating predict step.
        
        Args:
            steps: Number of future steps to forecast
            
        Returns:
            List of forecasted values
        """
        forecasts = []
        # Store current state
        x_backup = self.kf.x.copy()
        P_backup = self.kf.P.copy()
        
        for _ in range(steps):
            self.kf.predict()
            forecasts.append(float(self.kf.x[0, 0]))
            
        # Restore state
        self.kf.x = x_backup
        self.kf.P = P_backup
        
        return forecasts


def run_filter(data: List[float], 
               process_noise: float = 0.1, 
               measurement_noise: float = 1.0) -> Dict[str, Any]:
    """
    Run Kalman filter on weather data.
    
    This is the main entry point for the Kalman Filter algorithm.
    
    Args:
        data: Raw temperature/precipitation observations
        process_noise: Q matrix scaling factor (smaller = smoother)
        measurement_noise: R value (larger = trust model more)
        
    Returns:
        Complete filter results with statistics and diagnostics
        
    Example:
        >>> temps = [20.1, 20.5, 21.2, 20.8, 21.5, 22.0]
        >>> result = run_filter(temps, process_noise=0.1, measurement_noise=1.0)
        >>> print(result['output']['filtered_last_10'])
    """
    if len(data) < 3:
        raise ValueError("At least 3 data points required")
    
    # Initialize and configure filter
    kf = WeatherKalmanFilter()
    kf.configure(process_noise, measurement_noise)
    
    # Run filtering
    result = kf.filter_data(data)
    
    # Generate 7-day forecast
    forecast = kf.forecast(7)
    
    # Calculate quality metrics
    original_variance = np.var(data)
    filtered_variance = np.var(result["filtered"])
    noise_reduction = (1 - filtered_variance / original_variance) * 100 if original_variance > 0 else 0
    
    # Calculate RMSE between original and filtered
    rmse = np.sqrt(np.mean((np.array(data) - np.array(result["filtered"]))**2))
    
    # Calculate average innovation (should be near zero for well-tuned filter)
    avg_innovation = np.mean(np.abs(result["innovations"]))
    
    return {
        "algorithm": "Kalman Filter",
        "library": "filterpy",
        "version": "1.4.5",
        "reference": "Kalman, R.E. (1960). A New Approach to Linear Filtering and Prediction Problems",
        "mathematical_formulation": {
            "state_transition": "x_k = F @ x_{k-1} + w_k",
            "measurement": "z_k = H @ x_k + v_k",
            "kalman_gain": "K = P @ H^T @ (H @ P @ H^T + R)^{-1}",
            "state_update": "x = x + K @ (z - H @ x)"
        },
        "input": {
            "data_points": len(data),
            "process_noise": process_noise,
            "measurement_noise": measurement_noise,
            "data_range": {
                "min": float(min(data)),
                "max": float(max(data)),
                "mean": float(np.mean(data))
            }
        },
        "output": {
            "filtered_all": result["filtered"],
            "filtered_last_10": result["filtered"][-10:],
            "forecast_7_days": forecast,
            "velocities": result["velocities"][-5:],
            "final_state": result["final_state"]
        },
        "filter_diagnostics": {
            "avg_kalman_gain": float(np.mean(result["kalman_gains"])),
            "final_kalman_gain": float(result["kalman_gains"][-1]),
            "final_uncertainty": float(result["uncertainties"][-1]),
            "avg_innovation": float(avg_innovation)
        },
        "metrics": {
            "noise_reduction_percent": round(max(0, noise_reduction), 2),
            "rmse": round(rmse, 4),
            "signal_to_noise_improvement": round(original_variance / filtered_variance if filtered_variance > 0 else 1, 2)
        }
    }


def get_source_code() -> str:
    """Return the source code of the WeatherKalmanFilter class"""
    return inspect.getsource(WeatherKalmanFilter)
