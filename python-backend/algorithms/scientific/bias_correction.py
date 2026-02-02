"""
==============================================
Bias Correction - Quantile Mapping
تصحيح الانحياز باستخدام تخطيط الكميات

Reference: Themeßl, M.J., Gobiet, A., & Leuprecht, A. (2011).
Empirical-statistical downscaling and error correction of 
daily precipitation from regional climate models.
Int. J. Climatol., 31(10), 1530-1544.
==============================================
"""

import numpy as np
from scipy import stats
from scipy.interpolate import interp1d
from typing import List, Dict, Any
import inspect


class QuantileMappingCorrection:
    """
    Quantile Mapping for bias correction of weather model outputs.
    
    Mathematical Framework:
    ======================
    
    Quantile Mapping transforms model output to match observed distribution:
    
        x_corrected = F_obs^{-1}(F_mod(x_raw))
    
    Where:
    - F_mod: CDF of model predictions
    - F_obs: CDF of observations
    - F_obs^{-1}: Inverse CDF (quantile function) of observations
    
    Steps:
    1. Compute empirical CDFs for model and observations
    2. For each model value, find its quantile in model CDF
    3. Map to observation distribution using inverse CDF
    
    Types of Quantile Mapping:
    =========================
    1. Standard QM: Direct mapping
    2. Detrended QM: Remove trend before mapping
    3. Quantile Delta Mapping (QDM): Preserve trends
    4. Parametric QM: Fit distributions (gamma, normal)
    
    Weather Application:
    ===================
    - Corrects systematic biases in temperature forecasts
    - Adjusts precipitation distribution (often uses gamma)
    - Improves forecast reliability
    """
    
    def __init__(self, method: str = "empirical"):
        """
        Initialize bias correction.
        
        Args:
            method: Correction method
                   - "empirical": Non-parametric quantile mapping
                   - "parametric_normal": Fit normal distributions
                   - "parametric_gamma": Fit gamma distributions (for precip)
        """
        self.method = method
        self.model_cdf = None
        self.obs_cdf = None
        self.fitted = False
        
    def fit(self, model_data: np.ndarray, obs_data: np.ndarray):
        """
        Fit the quantile mapping transformation.
        
        Args:
            model_data: Historical model predictions
            obs_data: Corresponding observations
        """
        self.model_data = np.sort(model_data)
        self.obs_data = np.sort(obs_data)
        
        if self.method == "empirical":
            # Compute empirical quantiles
            n = len(self.model_data)
            self.quantiles = (np.arange(1, n + 1) - 0.5) / n
            
            # Create interpolation function for model CDF
            self.model_to_quantile = interp1d(
                self.model_data, self.quantiles,
                bounds_error=False, fill_value=(0, 1)
            )
            
            # Create interpolation function for obs inverse CDF
            self.quantile_to_obs = interp1d(
                self.quantiles, self.obs_data,
                bounds_error=False,
                fill_value=(self.obs_data[0], self.obs_data[-1])
            )
            
        elif self.method == "parametric_normal":
            # Fit normal distributions
            self.model_mean, self.model_std = np.mean(model_data), np.std(model_data)
            self.obs_mean, self.obs_std = np.mean(obs_data), np.std(obs_data)
            
        elif self.method == "parametric_gamma":
            # Fit gamma distributions (for precipitation)
            # Filter positive values
            model_pos = model_data[model_data > 0]
            obs_pos = obs_data[obs_data > 0]
            
            if len(model_pos) > 2 and len(obs_pos) > 2:
                self.model_gamma = stats.gamma.fit(model_pos, floc=0)
                self.obs_gamma = stats.gamma.fit(obs_pos, floc=0)
            else:
                # Fallback to empirical
                self.method = "empirical"
                self.fit(model_data, obs_data)
                return
                
        self.fitted = True
        
    def transform(self, model_values: np.ndarray) -> np.ndarray:
        """
        Apply bias correction to model values.
        
        Args:
            model_values: Raw model predictions to correct
            
        Returns:
            Bias-corrected values
        """
        if not self.fitted:
            raise ValueError("Must call fit() first")
            
        if self.method == "empirical":
            # Map through quantiles
            quantiles = self.model_to_quantile(model_values)
            corrected = self.quantile_to_obs(quantiles)
            
        elif self.method == "parametric_normal":
            # Standardize using model params, then transform using obs params
            z_scores = (model_values - self.model_mean) / self.model_std
            corrected = z_scores * self.obs_std + self.obs_mean
            
        elif self.method == "parametric_gamma":
            # For precipitation: handle zeros separately
            corrected = np.zeros_like(model_values, dtype=float)
            positive_mask = model_values > 0
            
            if np.any(positive_mask):
                # Map through gamma distributions
                model_quantiles = stats.gamma.cdf(
                    model_values[positive_mask], *self.model_gamma
                )
                corrected[positive_mask] = stats.gamma.ppf(
                    model_quantiles, *self.obs_gamma
                )
            
        return corrected
    
    def compute_statistics(self, model_data: np.ndarray, 
                          obs_data: np.ndarray,
                          corrected_data: np.ndarray) -> Dict[str, Any]:
        """
        Compute correction statistics.
        
        Args:
            model_data: Raw model predictions
            obs_data: Observations
            corrected_data: Bias-corrected predictions
            
        Returns:
            Dictionary with correction statistics
        """
        # Bias before and after
        bias_before = np.mean(model_data) - np.mean(obs_data)
        bias_after = np.mean(corrected_data) - np.mean(obs_data)
        
        # RMSE before and after
        rmse_before = np.sqrt(np.mean((model_data - obs_data)**2))
        rmse_after = np.sqrt(np.mean((corrected_data - obs_data)**2))
        
        # Variance ratio
        var_ratio_before = np.var(model_data) / np.var(obs_data)
        var_ratio_after = np.var(corrected_data) / np.var(obs_data)
        
        # Kolmogorov-Smirnov test
        ks_before = stats.ks_2samp(model_data, obs_data)
        ks_after = stats.ks_2samp(corrected_data, obs_data)
        
        return {
            "bias": {
                "before": float(bias_before),
                "after": float(bias_after),
                "reduction_percent": float((1 - abs(bias_after) / abs(bias_before)) * 100) if bias_before != 0 else 100
            },
            "rmse": {
                "before": float(rmse_before),
                "after": float(rmse_after),
                "reduction_percent": float((1 - rmse_after / rmse_before) * 100) if rmse_before > 0 else 0
            },
            "variance_ratio": {
                "before": float(var_ratio_before),
                "after": float(var_ratio_after),
                "target": 1.0
            },
            "ks_test": {
                "before": {"statistic": float(ks_before.statistic), "pvalue": float(ks_before.pvalue)},
                "after": {"statistic": float(ks_after.statistic), "pvalue": float(ks_after.pvalue)}
            }
        }


def run_correction(predictions: List[float],
                   observations: List[float],
                   method: str = "quantile") -> Dict[str, Any]:
    """
    Run bias correction on weather predictions.
    
    Args:
        predictions: Model predictions
        observations: Corresponding observations
        method: Correction method ("quantile", "linear", "gamma")
        
    Returns:
        Complete correction results
        
    Example:
        >>> preds = [21.0, 22.5, 23.0, 24.5, 25.0]  # Model runs warm
        >>> obs = [20.0, 21.0, 22.0, 23.0, 24.0]     # Actual temps
        >>> result = run_correction(preds, obs)
    """
    preds_array = np.array(predictions)
    obs_array = np.array(observations)
    
    # Map method names
    method_map = {
        "quantile": "empirical",
        "linear": "parametric_normal",
        "gamma": "parametric_gamma",
        "empirical": "empirical"
    }
    internal_method = method_map.get(method, "empirical")
    
    # Initialize and fit correction
    qm = QuantileMappingCorrection(method=internal_method)
    qm.fit(preds_array, obs_array)
    
    # Apply correction
    corrected = qm.transform(preds_array)
    
    # Compute statistics
    stats_dict = qm.compute_statistics(preds_array, obs_array, corrected)
    
    # Compute percentile comparison
    percentiles = [10, 25, 50, 75, 90]
    percentile_comparison = {
        "percentiles": percentiles,
        "observations": [float(np.percentile(obs_array, p)) for p in percentiles],
        "model_raw": [float(np.percentile(preds_array, p)) for p in percentiles],
        "model_corrected": [float(np.percentile(corrected, p)) for p in percentiles]
    }
    
    return {
        "algorithm": "Quantile Mapping Bias Correction",
        "library": "scipy",
        "reference": "Themeßl et al. (2011). Empirical-statistical downscaling and error correction",
        "mathematical_formulation": {
            "equation": "x_corrected = F_obs^{-1}(F_mod(x_raw))",
            "description": "Map model quantiles to observation distribution"
        },
        "method": method,
        "corrected_values": corrected.tolist(),
        "statistics": stats_dict,
        "percentile_comparison": percentile_comparison,
        "distribution_summary": {
            "observations": {
                "mean": float(np.mean(obs_array)),
                "std": float(np.std(obs_array)),
                "min": float(np.min(obs_array)),
                "max": float(np.max(obs_array))
            },
            "model_raw": {
                "mean": float(np.mean(preds_array)),
                "std": float(np.std(preds_array)),
                "min": float(np.min(preds_array)),
                "max": float(np.max(preds_array))
            },
            "model_corrected": {
                "mean": float(np.mean(corrected)),
                "std": float(np.std(corrected)),
                "min": float(np.min(corrected)),
                "max": float(np.max(corrected))
            }
        }
    }


def get_source_code() -> str:
    """Return the source code of the QuantileMappingCorrection class"""
    return inspect.getsource(QuantileMappingCorrection)
