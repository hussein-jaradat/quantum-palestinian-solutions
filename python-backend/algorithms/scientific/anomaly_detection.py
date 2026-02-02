"""
==============================================
Anomaly Detection
كشف القيم الشاذة في بيانات الطقس

Methods: Z-Score and IQR (Interquartile Range)
==============================================
"""

import numpy as np
from scipy import stats
from typing import List, Dict, Any, Tuple
import inspect


class WeatherAnomalyDetector:
    """
    Anomaly Detection for weather time series data.
    
    Methods Implemented:
    ===================
    
    1. Z-Score Method:
       ---------------
       z = (x - μ) / σ
       
       Anomaly if |z| > threshold (typically 2.5-3.0)
       
       Assumes normal distribution
       Sensitive to outliers in calculation
    
    2. IQR Method (Interquartile Range):
       ----------------------------------
       IQR = Q3 - Q1
       Lower bound = Q1 - k * IQR
       Upper bound = Q3 + k * IQR
       
       Typically k = 1.5 (outlier) or k = 3.0 (extreme outlier)
       
       More robust to outliers
       Non-parametric method
    
    3. Modified Z-Score (MAD-based):
       -----------------------------
       MAD = median(|x - median(x)|)
       Modified Z = 0.6745 * (x - median) / MAD
       
       More robust than standard z-score
       Uses median instead of mean
    
    Weather Application:
    ===================
    - Detect sensor malfunctions
    - Identify extreme weather events
    - Quality control of observations
    - Data cleaning before analysis
    """
    
    def __init__(self, method: str = "zscore", threshold: float = 3.0):
        """
        Initialize anomaly detector.
        
        Args:
            method: Detection method ("zscore", "iqr", "modified_zscore")
            threshold: Detection threshold
        """
        self.method = method
        self.threshold = threshold
        
    def detect_zscore(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Detect anomalies using Z-score method.
        
        Args:
            data: Time series data
            
        Returns:
            Tuple of (anomaly_mask, z_scores)
        """
        mean = np.mean(data)
        std = np.std(data)
        
        z_scores = (data - mean) / (std + 1e-10)
        anomaly_mask = np.abs(z_scores) > self.threshold
        
        return anomaly_mask, z_scores
    
    def detect_iqr(self, data: np.ndarray) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Detect anomalies using IQR method.
        
        Args:
            data: Time series data
            
        Returns:
            Tuple of (anomaly_mask, bounds_dict)
        """
        q1 = np.percentile(data, 25)
        q3 = np.percentile(data, 75)
        iqr = q3 - q1
        
        lower_bound = q1 - self.threshold * iqr
        upper_bound = q3 + self.threshold * iqr
        
        anomaly_mask = (data < lower_bound) | (data > upper_bound)
        
        bounds = {
            "q1": float(q1),
            "q3": float(q3),
            "iqr": float(iqr),
            "lower_bound": float(lower_bound),
            "upper_bound": float(upper_bound)
        }
        
        return anomaly_mask, bounds
    
    def detect_modified_zscore(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Detect anomalies using Modified Z-score (MAD-based).
        
        More robust than standard z-score.
        
        Args:
            data: Time series data
            
        Returns:
            Tuple of (anomaly_mask, modified_z_scores)
        """
        median = np.median(data)
        mad = np.median(np.abs(data - median))
        
        # 0.6745 is the 0.75th quantile of normal distribution
        modified_z = 0.6745 * (data - median) / (mad + 1e-10)
        anomaly_mask = np.abs(modified_z) > self.threshold
        
        return anomaly_mask, modified_z
    
    def detect(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Run anomaly detection using configured method.
        
        Args:
            data: Time series data
            
        Returns:
            Complete detection results
        """
        if self.method == "zscore":
            mask, scores = self.detect_zscore(data)
            method_specific = {"z_scores": scores.tolist()}
            
        elif self.method == "iqr":
            mask, bounds = self.detect_iqr(data)
            method_specific = {"bounds": bounds}
            
        elif self.method == "modified_zscore":
            mask, scores = self.detect_modified_zscore(data)
            method_specific = {"modified_z_scores": scores.tolist()}
            
        else:
            raise ValueError(f"Unknown method: {self.method}")
        
        # Get anomaly details
        anomaly_indices = np.where(mask)[0]
        anomaly_values = data[mask]
        
        return {
            "mask": mask,
            "anomaly_indices": anomaly_indices.tolist(),
            "anomaly_values": anomaly_values.tolist(),
            "n_anomalies": int(np.sum(mask)),
            "method_specific": method_specific
        }
    
    def get_anomaly_classification(self, data: np.ndarray) -> Dict[str, List[int]]:
        """
        Classify anomalies by severity.
        
        Args:
            data: Time series data
            
        Returns:
            Dictionary with anomaly indices by severity
        """
        mean = np.mean(data)
        std = np.std(data)
        z_scores = np.abs((data - mean) / (std + 1e-10))
        
        return {
            "mild": np.where((z_scores > 2) & (z_scores <= 3))[0].tolist(),
            "moderate": np.where((z_scores > 3) & (z_scores <= 4))[0].tolist(),
            "severe": np.where(z_scores > 4)[0].tolist()
        }


def detect(data: List[float],
           method: str = "zscore",
           threshold: float = 3.0) -> Dict[str, Any]:
    """
    Detect anomalies in weather data.
    
    Args:
        data: Time series observations
        method: Detection method ("zscore", "iqr", "modified_zscore")
        threshold: Detection threshold (z-score or IQR multiplier)
        
    Returns:
        Complete anomaly detection results
        
    Example:
        >>> temps = [20, 21, 22, 50, 21, 22, 20]  # 50 is anomaly
        >>> result = detect(temps, method="zscore", threshold=3.0)
        >>> print(result['anomaly_indices'])  # [3]
    """
    data_array = np.array(data)
    
    # Initialize detector
    detector = WeatherAnomalyDetector(method=method, threshold=threshold)
    
    # Run detection
    detection_result = detector.detect(data_array)
    
    # Get severity classification
    classification = detector.get_anomaly_classification(data_array)
    
    # Compute summary statistics
    clean_data = data_array[~detection_result["mask"]]
    
    return {
        "algorithm": "Anomaly Detection",
        "library": "numpy/scipy",
        "method": method,
        "threshold": threshold,
        "mathematical_formulation": {
            "zscore": "z = (x - μ) / σ, anomaly if |z| > threshold",
            "iqr": "anomaly if x < Q1 - k*IQR or x > Q3 + k*IQR",
            "modified_zscore": "M = 0.6745 × (x - median) / MAD"
        },
        "results": {
            "total_points": len(data),
            "n_anomalies": detection_result["n_anomalies"],
            "anomaly_rate": float(detection_result["n_anomalies"] / len(data) * 100),
            "anomaly_indices": detection_result["anomaly_indices"],
            "anomaly_values": detection_result["anomaly_values"],
            "severity_classification": classification
        },
        "method_details": detection_result["method_specific"],
        "data_statistics": {
            "original": {
                "mean": float(np.mean(data_array)),
                "std": float(np.std(data_array)),
                "min": float(np.min(data_array)),
                "max": float(np.max(data_array))
            },
            "cleaned": {
                "mean": float(np.mean(clean_data)) if len(clean_data) > 0 else None,
                "std": float(np.std(clean_data)) if len(clean_data) > 0 else None,
                "min": float(np.min(clean_data)) if len(clean_data) > 0 else None,
                "max": float(np.max(clean_data)) if len(clean_data) > 0 else None
            }
        }
    }


def get_source_code() -> str:
    """Return the source code of the WeatherAnomalyDetector class"""
    return inspect.getsource(WeatherAnomalyDetector)
