"""
==============================================
Trend Analysis - Mann-Kendall Test
تحليل الاتجاهات باستخدام اختبار مان-كيندال

Reference: 
- Mann, H.B. (1945). Nonparametric tests against trend.
  Econometrica, 13(3), 245-259.
- Kendall, M.G. (1975). Rank correlation methods.
  Charles Griffin, London.
==============================================
"""

import numpy as np
from scipy import stats
from typing import List, Dict, Any, Tuple
import inspect

try:
    import pymannkendall as mk
    HAS_MK = True
except ImportError:
    HAS_MK = False


class TrendAnalyzer:
    """
    Non-parametric Trend Analysis for climate data.
    
    Mann-Kendall Test:
    =================
    
    Test statistic S:
        S = Σ_{i=1}^{n-1} Σ_{j=i+1}^{n} sgn(x_j - x_i)
    
    Where sgn(x) is:
        +1 if x > 0
         0 if x = 0
        -1 if x < 0
    
    For n > 10, S is approximately normal with:
        E[S] = 0
        Var(S) = [n(n-1)(2n+5) - Σ t_i(t_i-1)(2t_i+5)] / 18
    
    Standardized test statistic:
        Z = (S - sgn(S)) / √Var(S)
    
    Sen's Slope Estimator:
    =====================
        β = median[(x_j - x_i) / (j - i)] for all i < j
    
    This is a robust, non-parametric estimate of the trend magnitude.
    
    Weather Application:
    ===================
    - Detect long-term climate trends
    - Analyze precipitation patterns
    - Temperature trend assessment
    - Robust to outliers and non-normal distributions
    """
    
    def __init__(self, alpha: float = 0.05):
        """
        Initialize trend analyzer.
        
        Args:
            alpha: Significance level for hypothesis testing
        """
        self.alpha = alpha
        
    def mann_kendall_test(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Perform Mann-Kendall trend test.
        
        Args:
            data: Time series data
            
        Returns:
            Test results dictionary
        """
        n = len(data)
        
        # Calculate S statistic
        s = 0
        for i in range(n - 1):
            for j in range(i + 1, n):
                diff = data[j] - data[i]
                if diff > 0:
                    s += 1
                elif diff < 0:
                    s -= 1
        
        # Calculate variance
        # Account for ties
        unique, counts = np.unique(data, return_counts=True)
        tie_groups = counts[counts > 1]
        
        var_s = (n * (n - 1) * (2 * n + 5))
        if len(tie_groups) > 0:
            for t in tie_groups:
                var_s -= t * (t - 1) * (2 * t + 5)
        var_s = var_s / 18
        
        # Calculate Z statistic
        if s > 0:
            z = (s - 1) / np.sqrt(var_s)
        elif s < 0:
            z = (s + 1) / np.sqrt(var_s)
        else:
            z = 0
        
        # Two-tailed p-value
        p_value = 2 * (1 - stats.norm.cdf(abs(z)))
        
        # Determine trend
        if p_value < self.alpha:
            if z > 0:
                trend = "increasing"
            else:
                trend = "decreasing"
        else:
            trend = "no_trend"
        
        return {
            "s_statistic": int(s),
            "var_s": float(var_s),
            "z_statistic": float(z),
            "p_value": float(p_value),
            "trend": trend,
            "significant": p_value < self.alpha,
            "n_ties": int(len(tie_groups)),
            "alpha": self.alpha
        }
    
    def sens_slope(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Calculate Sen's slope estimator.
        
        Args:
            data: Time series data
            
        Returns:
            Slope estimation results
        """
        n = len(data)
        slopes = []
        
        for i in range(n - 1):
            for j in range(i + 1, n):
                slope = (data[j] - data[i]) / (j - i)
                slopes.append(slope)
        
        slopes = np.array(slopes)
        median_slope = np.median(slopes)
        
        # Calculate confidence interval using bootstrap
        sorted_slopes = np.sort(slopes)
        n_slopes = len(sorted_slopes)
        
        # Approximate confidence interval
        z_alpha = stats.norm.ppf(1 - self.alpha / 2)
        c_alpha = z_alpha * np.sqrt(n * (n - 1) * (2 * n + 5) / 18)
        
        lower_idx = int(max(0, (n_slopes - c_alpha) / 2))
        upper_idx = int(min(n_slopes - 1, (n_slopes + c_alpha) / 2))
        
        return {
            "median_slope": float(median_slope),
            "slope_per_unit": float(median_slope),
            "lower_ci": float(sorted_slopes[lower_idx]) if lower_idx < len(sorted_slopes) else None,
            "upper_ci": float(sorted_slopes[upper_idx]) if upper_idx < len(sorted_slopes) else None,
            "n_slopes_computed": n_slopes,
            "intercept": float(np.median(data - median_slope * np.arange(n)))
        }
    
    def analyze(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Perform complete trend analysis.
        
        Args:
            data: Time series data
            
        Returns:
            Complete analysis results
        """
        mk_result = self.mann_kendall_test(data)
        sens_result = self.sens_slope(data)
        
        # Calculate additional statistics
        n = len(data)
        change_per_decade = sens_result["median_slope"] * 10
        total_change = sens_result["median_slope"] * (n - 1)
        
        return {
            "mann_kendall": mk_result,
            "sens_slope": sens_result,
            "summary": {
                "trend_direction": mk_result["trend"],
                "is_significant": mk_result["significant"],
                "slope_per_unit": sens_result["median_slope"],
                "change_per_decade": float(change_per_decade),
                "total_change": float(total_change),
                "percent_change": float(total_change / data[0] * 100) if data[0] != 0 else None
            }
        }


def analyze(data: List[float]) -> Dict[str, Any]:
    """
    Perform trend analysis on weather data.
    
    Args:
        data: Time series observations
        
    Returns:
        Complete trend analysis results
        
    Example:
        >>> temps = [20, 20.5, 21, 21.5, 22, 22.5, 23]  # Clear upward trend
        >>> result = analyze(temps)
        >>> print(result['summary']['trend_direction'])  # 'increasing'
    """
    data_array = np.array(data)
    
    if len(data_array) < 4:
        raise ValueError("At least 4 data points required for trend analysis")
    
    # Use pymannkendall if available for additional tests
    if HAS_MK:
        mk_result = mk.original_test(data_array)
        seasonal_result = None
        
        # Try seasonal test if enough data
        if len(data_array) >= 12:
            try:
                seasonal_result = mk.seasonal_test(data_array)
            except:
                pass
        
        pymannkendall_result = {
            "trend": mk_result.trend,
            "h": mk_result.h,
            "p": float(mk_result.p),
            "z": float(mk_result.z),
            "tau": float(mk_result.Tau),
            "s": float(mk_result.s),
            "slope": float(mk_result.slope),
            "intercept": float(mk_result.intercept)
        }
        
        if seasonal_result:
            pymannkendall_result["seasonal"] = {
                "trend": seasonal_result.trend,
                "p": float(seasonal_result.p),
                "z": float(seasonal_result.z)
            }
    else:
        pymannkendall_result = None
    
    # Custom implementation
    analyzer = TrendAnalyzer(alpha=0.05)
    custom_result = analyzer.analyze(data_array)
    
    # Simple linear regression for comparison
    x = np.arange(len(data_array))
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, data_array)
    
    linear_regression = {
        "slope": float(slope),
        "intercept": float(intercept),
        "r_squared": float(r_value ** 2),
        "p_value": float(p_value),
        "std_error": float(std_err)
    }
    
    return {
        "algorithm": "Mann-Kendall Trend Test with Sen's Slope",
        "library": "pymannkendall + scipy",
        "references": [
            "Mann, H.B. (1945). Nonparametric tests against trend",
            "Kendall, M.G. (1975). Rank correlation methods",
            "Sen, P.K. (1968). Estimates of regression coefficient"
        ],
        "mathematical_formulation": {
            "s_statistic": "S = Σ_i Σ_j sgn(x_j - x_i)",
            "variance": "Var(S) = n(n-1)(2n+5)/18 - Σ t(t-1)(2t+5)/18",
            "z_statistic": "Z = (S - 1)/√Var(S) if S>0",
            "sens_slope": "β = median[(x_j - x_i)/(j-i)]"
        },
        "data_info": {
            "n_observations": len(data),
            "first_value": float(data_array[0]),
            "last_value": float(data_array[-1]),
            "mean": float(np.mean(data_array)),
            "std": float(np.std(data_array))
        },
        "mann_kendall_test": custom_result["mann_kendall"],
        "sens_slope": custom_result["sens_slope"],
        "linear_regression": linear_regression,
        "pymannkendall": pymannkendall_result,
        "summary": custom_result["summary"]
    }


def get_source_code() -> str:
    """Return the source code of the TrendAnalyzer class"""
    return inspect.getsource(TrendAnalyzer)
