"""
==============================================
ARIMA Time Series Forecasting
نموذج أريما للتنبؤ بالسلاسل الزمنية

Reference: Box, G.E.P., Jenkins, G.M. (1970). 
Time Series Analysis: Forecasting and Control.
Holden-Day, San Francisco.
==============================================
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
    
    ARIMA(p, d, q) = AutoRegressive Integrated Moving Average
    
    Mathematical Formulation:
    ========================
    
    AR(p) - AutoRegressive component:
        y_t = c + φ_1*y_{t-1} + φ_2*y_{t-2} + ... + φ_p*y_{t-p} + ε_t
    
    I(d) - Integration (Differencing):
        y'_t = y_t - y_{t-1}  (first difference)
        y''_t = y'_t - y'_{t-1}  (second difference)
    
    MA(q) - Moving Average component:
        y_t = c + ε_t + θ_1*ε_{t-1} + θ_2*ε_{t-2} + ... + θ_q*ε_{t-q}
    
    Full ARIMA(p,d,q) equation:
        (1 - Σ φ_i*L^i)(1-L)^d * y_t = c + (1 + Σ θ_j*L^j)*ε_t
    
    Where:
    - L: Lag operator (L*y_t = y_{t-1})
    - φ: AR coefficients
    - θ: MA coefficients
    - d: Differencing order
    - ε_t: White noise error term
    
    Model Selection:
    ===============
    - p: Determined by PACF (Partial Autocorrelation Function)
    - d: Determined by ADF test (Augmented Dickey-Fuller)
    - q: Determined by ACF (Autocorrelation Function)
    
    Weather Application:
    ===================
    - Temperature: Usually ARIMA(2,1,1) or ARIMA(1,1,1)
    - Precipitation: May need seasonal component SARIMA
    - Wind: Often requires higher order AR terms
    """
    
    def __init__(self, order: Tuple[int, int, int] = (2, 1, 1)):
        """
        Initialize ARIMA model.
        
        Args:
            order: Tuple of (p, d, q) 
                   p = AR order
                   d = differencing order  
                   q = MA order
        """
        self.order = order
        self.model = None
        self.fitted = None
        self.data = None
        
    def fit(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Fit ARIMA model to data.
        
        Args:
            data: Time series observations
            
        Returns:
            Dictionary with model statistics
        """
        self.data = data
        self.model = ARIMA(data, order=self.order)
        self.fitted = self.model.fit()
        
        return {
            "aic": float(self.fitted.aic),
            "bic": float(self.fitted.bic),
            "hqic": float(self.fitted.hqic),
            "log_likelihood": float(self.fitted.llf),
            "ar_coefficients": self.fitted.arparams.tolist() if len(self.fitted.arparams) > 0 else [],
            "ma_coefficients": self.fitted.maparams.tolist() if len(self.fitted.maparams) > 0 else [],
            "sigma2": float(self.fitted.params[-1]) if hasattr(self.fitted, 'params') else None
        }
    
    def forecast(self, steps: int) -> Dict[str, Any]:
        """
        Generate forecasts with confidence intervals.
        
        Args:
            steps: Number of future periods to forecast
            
        Returns:
            Dictionary with forecasts and confidence intervals
        """
        if self.fitted is None:
            raise ValueError("Model must be fitted first")
            
        forecast_result = self.fitted.get_forecast(steps=steps)
        mean = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=0.05)  # 95% CI
        
        return {
            "forecast": mean.tolist(),
            "lower_bound_95": conf_int.iloc[:, 0].tolist(),
            "upper_bound_95": conf_int.iloc[:, 1].tolist(),
            "forecast_variance": forecast_result.var_pred_mean.tolist() if hasattr(forecast_result, 'var_pred_mean') else []
        }
    
    def diagnostics(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Perform comprehensive model diagnostics.
        
        Tests performed:
        1. ADF Test: Stationarity check
        2. ACF: Autocorrelation analysis
        3. PACF: Partial autocorrelation analysis
        4. Residual analysis: White noise check
        
        Args:
            data: Original time series
            
        Returns:
            Dictionary with diagnostic results
        """
        # Augmented Dickey-Fuller test for stationarity
        adf_result = adfuller(data, autolag='AIC')
        
        # Calculate ACF and PACF
        n_lags = min(10, len(data) // 2 - 1)
        acf_values = acf(data, nlags=n_lags, fft=True)
        pacf_values = pacf(data, nlags=n_lags)
        
        # Residual analysis
        if self.fitted is not None:
            residuals = self.fitted.resid
            resid_mean = float(np.mean(residuals))
            resid_std = float(np.std(residuals))
            resid_skew = float(np.mean(((residuals - resid_mean) / resid_std) ** 3))
            resid_kurtosis = float(np.mean(((residuals - resid_mean) / resid_std) ** 4) - 3)
            
            # Ljung-Box test for autocorrelation in residuals
            from statsmodels.stats.diagnostic import acorr_ljungbox
            lb_test = acorr_ljungbox(residuals, lags=[10], return_df=True)
            lb_pvalue = float(lb_test['lb_pvalue'].values[0])
        else:
            resid_mean = resid_std = resid_skew = resid_kurtosis = lb_pvalue = None
        
        return {
            "stationarity_test": {
                "test_name": "Augmented Dickey-Fuller",
                "adf_statistic": float(adf_result[0]),
                "p_value": float(adf_result[1]),
                "critical_values": {
                    "1%": float(adf_result[4]['1%']),
                    "5%": float(adf_result[4]['5%']),
                    "10%": float(adf_result[4]['10%'])
                },
                "is_stationary": adf_result[1] < 0.05,
                "lags_used": int(adf_result[2]),
                "n_obs": int(adf_result[3])
            },
            "acf": acf_values.tolist(),
            "pacf": pacf_values.tolist(),
            "residuals": {
                "mean": resid_mean,
                "std": resid_std,
                "skewness": resid_skew,
                "kurtosis": resid_kurtosis,
                "ljung_box_pvalue": lb_pvalue,
                "is_white_noise": lb_pvalue > 0.05 if lb_pvalue else None
            }
        }
    
    def get_equation(self) -> str:
        """
        Return the fitted ARIMA equation as a string.
        """
        if self.fitted is None:
            return "Model not fitted yet"
            
        p, d, q = self.order
        ar_params = self.fitted.arparams if len(self.fitted.arparams) > 0 else []
        ma_params = self.fitted.maparams if len(self.fitted.maparams) > 0 else []
        
        equation = f"ARIMA({p},{d},{q}): "
        
        # AR part
        if len(ar_params) > 0:
            ar_terms = " + ".join([f"{ar_params[i]:.4f}*y_{{t-{i+1}}}" for i in range(len(ar_params))])
            equation += f"y_t = {ar_terms}"
        else:
            equation += "y_t = "
            
        # MA part
        if len(ma_params) > 0:
            ma_terms = " + ".join([f"{ma_params[i]:.4f}*ε_{{t-{i+1}}}" for i in range(len(ma_params))])
            equation += f" + {ma_terms}"
            
        equation += " + ε_t"
        
        return equation


def run_forecast(data: List[float], 
                 order: Tuple[int, int, int] = (2, 1, 1),
                 forecast_steps: int = 7) -> Dict[str, Any]:
    """
    Run ARIMA forecast on weather data.
    
    This is the main entry point for the ARIMA algorithm.
    
    Args:
        data: Historical weather observations
        order: ARIMA(p, d, q) order tuple
        forecast_steps: Number of future steps to forecast
        
    Returns:
        Complete forecast results with diagnostics
        
    Example:
        >>> temps = [20.0, 21.0, 22.0, 21.5, 23.0, 22.5, 24.0]
        >>> result = run_forecast(temps, order=(2,1,1), forecast_steps=7)
        >>> print(result['forecast']['forecast'])
    """
    if len(data) < 10:
        raise ValueError("At least 10 data points required for ARIMA")
    
    data_array = np.array(data)
    
    # Initialize and fit model
    arima = WeatherARIMA(order=order)
    fit_stats = arima.fit(data_array)
    
    # Generate forecast
    forecast = arima.forecast(forecast_steps)
    
    # Run diagnostics
    diagnostics = arima.diagnostics(data_array)
    
    # Determine trend
    diff = np.diff(data_array)
    trend = "increasing" if np.mean(diff) > 0 else "decreasing" if np.mean(diff) < 0 else "stable"
    
    # Calculate in-sample fit metrics
    fitted_values = arima.fitted.fittedvalues
    residuals = arima.fitted.resid
    mae = float(np.mean(np.abs(residuals)))
    rmse = float(np.sqrt(np.mean(residuals**2)))
    mape = float(np.mean(np.abs(residuals / data_array[1:])) * 100) if np.all(data_array[1:] != 0) else None
    
    return {
        "algorithm": "ARIMA",
        "library": "statsmodels",
        "version": "0.14.1",
        "reference": "Box, G.E.P., Jenkins, G.M. (1970). Time Series Analysis: Forecasting and Control",
        "mathematical_formulation": {
            "full_equation": arima.get_equation(),
            "ar_component": f"φ(L) = 1 - Σ_{{i=1}}^{{{order[0]}}} φ_i * L^i",
            "ma_component": f"θ(L) = 1 + Σ_{{j=1}}^{{{order[2]}}} θ_j * L^j",
            "differencing": f"(1-L)^{order[1]} * y_t"
        },
        "parameters": {
            "p": order[0],
            "d": order[1], 
            "q": order[2],
            "description": {
                "p": "Autoregressive order (PACF)",
                "d": "Differencing order (stationarity)",
                "q": "Moving average order (ACF)"
            }
        },
        "fit_statistics": fit_stats,
        "forecast": forecast,
        "diagnostics": diagnostics,
        "in_sample_metrics": {
            "mae": mae,
            "rmse": rmse,
            "mape": mape,
            "n_observations": len(data)
        },
        "trend": trend,
        "data_summary": {
            "mean": float(np.mean(data)),
            "std": float(np.std(data)),
            "min": float(np.min(data)),
            "max": float(np.max(data))
        }
    }


def get_source_code() -> str:
    """Return the source code of the WeatherARIMA class"""
    return inspect.getsource(WeatherARIMA)
