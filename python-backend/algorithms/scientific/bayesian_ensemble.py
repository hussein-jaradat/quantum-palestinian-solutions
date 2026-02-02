"""
==============================================
Bayesian Model Averaging (BMA)
المتوسط البايزي للنماذج

Reference: Hoeting, J.A., Madigan, D., Raftery, A.E., 
& Volinsky, C.T. (1999). Bayesian Model Averaging: 
A Tutorial. Statistical Science, 14(4), 382-417.
==============================================
"""

import numpy as np
from scipy import stats
from scipy.special import logsumexp
from typing import List, Dict, Any, Optional
import inspect


class BayesianModelAveraging:
    """
    Bayesian Model Averaging for ensemble weather predictions.
    
    Mathematical Framework:
    ======================
    
    Posterior model probability:
        P(M_k | D) = P(D | M_k) * P(M_k) / P(D)
    
    Where:
    - P(M_k | D): Posterior probability of model k given data
    - P(D | M_k): Marginal likelihood (evidence) of data under model k
    - P(M_k): Prior probability of model k
    - P(D): Normalizing constant (evidence)
    
    BMA Prediction:
        E[Δ | D] = Σ_k P(M_k | D) * E[Δ | M_k, D]
    
    BMA Variance:
        Var[Δ | D] = Σ_k P(M_k | D) * [Var(Δ | M_k, D) + (E[Δ | M_k, D] - E[Δ | D])²]
    
    Model Evidence (Marginal Likelihood):
        P(D | M_k) = ∫ P(D | θ_k, M_k) * P(θ_k | M_k) dθ_k
    
    For Gaussian likelihood:
        log P(D | M_k) ≈ -n/2 * log(2π) - n/2 * log(σ²_k) - RSS_k / (2σ²_k)
    
    Weather Application:
    ===================
    - Combines IFS, GFS, ICON, ERA5 models
    - Weights based on historical performance
    - Accounts for model uncertainty
    - Provides calibrated probability forecasts
    """
    
    def __init__(self, model_names: List[str]):
        """
        Initialize BMA with model names.
        
        Args:
            model_names: List of model identifiers (e.g., ['IFS', 'GFS', 'ICON'])
        """
        self.model_names = model_names
        self.n_models = len(model_names)
        self.posterior_weights = None
        self.model_variances = None
        
    def compute_log_likelihood(self, predictions: np.ndarray, 
                               observations: np.ndarray,
                               variance: float) -> float:
        """
        Compute log-likelihood for Gaussian model.
        
        L(θ) = Π_i N(y_i | μ_i, σ²)
        log L(θ) = -n/2 * log(2πσ²) - Σ(y_i - μ_i)² / (2σ²)
        
        Args:
            predictions: Model predictions
            observations: Actual observations
            variance: Model error variance
            
        Returns:
            Log-likelihood value
        """
        n = len(observations)
        residuals = observations - predictions
        rss = np.sum(residuals ** 2)
        
        log_lik = -n/2 * np.log(2 * np.pi * variance) - rss / (2 * variance)
        return log_lik
    
    def estimate_variance(self, predictions: np.ndarray, 
                         observations: np.ndarray) -> float:
        """
        Estimate model error variance using MLE.
        
        σ²_MLE = Σ(y_i - μ_i)² / n
        
        Args:
            predictions: Model predictions
            observations: Actual observations
            
        Returns:
            Variance estimate
        """
        residuals = observations - predictions
        return np.var(residuals, ddof=0) + 1e-10  # Add small value for stability
    
    def compute_weights(self, 
                       models_predictions: Dict[str, np.ndarray],
                       observations: np.ndarray,
                       prior_weights: Optional[Dict[str, float]] = None) -> Dict[str, float]:
        """
        Compute posterior model weights using Bayes' theorem.
        
        Args:
            models_predictions: Dict mapping model names to prediction arrays
            observations: Actual observations
            prior_weights: Prior probabilities (uniform if None)
            
        Returns:
            Dictionary of posterior weights
        """
        # Initialize uniform priors if not provided
        if prior_weights is None:
            prior_weights = {name: 1.0 / self.n_models for name in self.model_names}
        
        # Compute log-likelihoods for each model
        log_likelihoods = {}
        variances = {}
        
        for name in self.model_names:
            if name not in models_predictions:
                continue
            preds = np.array(models_predictions[name])
            var = self.estimate_variance(preds, observations)
            variances[name] = var
            log_likelihoods[name] = self.compute_log_likelihood(preds, observations, var)
        
        self.model_variances = variances
        
        # Compute log posteriors (log prior + log likelihood)
        log_posteriors = {}
        for name in log_likelihoods:
            log_prior = np.log(prior_weights.get(name, 1.0 / self.n_models))
            log_posteriors[name] = log_prior + log_likelihoods[name]
        
        # Normalize using log-sum-exp trick for numerical stability
        log_evidence = logsumexp(list(log_posteriors.values()))
        
        # Convert to weights
        weights = {}
        for name, log_post in log_posteriors.items():
            weights[name] = float(np.exp(log_post - log_evidence))
        
        self.posterior_weights = weights
        return weights
    
    def predict(self, 
               models_predictions: Dict[str, np.ndarray]) -> Dict[str, Any]:
        """
        Generate BMA prediction with uncertainty.
        
        BMA Mean: μ_BMA = Σ_k w_k * μ_k
        BMA Variance: σ²_BMA = Σ_k w_k * [σ²_k + (μ_k - μ_BMA)²]
        
        Args:
            models_predictions: Dict mapping model names to predictions
            
        Returns:
            Dictionary with BMA prediction and uncertainty
        """
        if self.posterior_weights is None:
            raise ValueError("Weights must be computed first")
        
        # Stack predictions
        all_preds = []
        weights = []
        for name in models_predictions:
            if name in self.posterior_weights:
                all_preds.append(models_predictions[name])
                weights.append(self.posterior_weights[name])
        
        all_preds = np.array(all_preds)
        weights = np.array(weights)
        
        # BMA mean prediction
        bma_mean = np.sum(weights[:, np.newaxis] * all_preds, axis=0)
        
        # BMA variance (accounts for between-model and within-model variance)
        within_var = np.zeros(all_preds.shape[1])
        between_var = np.zeros(all_preds.shape[1])
        
        for i, name in enumerate(models_predictions):
            if name in self.posterior_weights:
                w = self.posterior_weights[name]
                var = self.model_variances.get(name, 1.0)
                within_var += w * var
                between_var += w * (all_preds[i] - bma_mean) ** 2
        
        bma_var = within_var + between_var
        bma_std = np.sqrt(bma_var)
        
        return {
            "mean": bma_mean.tolist(),
            "std": bma_std.tolist(),
            "lower_95": (bma_mean - 1.96 * bma_std).tolist(),
            "upper_95": (bma_mean + 1.96 * bma_std).tolist()
        }


def run_bma(models_predictions: Dict[str, List[float]],
            observations: List[float],
            prior_weights: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """
    Run Bayesian Model Averaging on ensemble predictions.
    
    Args:
        models_predictions: Dict mapping model names to prediction lists
        observations: Actual observations for weight calibration
        prior_weights: Prior probabilities for each model (optional)
        
    Returns:
        Complete BMA results with weights and predictions
        
    Example:
        >>> predictions = {
        ...     'IFS': [20.1, 21.2, 22.0],
        ...     'GFS': [19.8, 20.9, 21.5],
        ...     'ICON': [20.5, 21.5, 22.3]
        ... }
        >>> observations = [20.0, 21.0, 22.0]
        >>> result = run_bma(predictions, observations)
    """
    model_names = list(models_predictions.keys())
    obs_array = np.array(observations)
    
    # Convert predictions to numpy arrays
    preds_arrays = {name: np.array(pred) for name, pred in models_predictions.items()}
    
    # Initialize BMA
    bma = BayesianModelAveraging(model_names)
    
    # Compute posterior weights
    weights = bma.compute_weights(preds_arrays, obs_array, prior_weights)
    
    # Generate BMA prediction
    prediction = bma.predict(preds_arrays)
    
    # Compute individual model metrics
    model_metrics = {}
    for name in model_names:
        preds = preds_arrays[name]
        errors = obs_array - preds
        model_metrics[name] = {
            "mae": float(np.mean(np.abs(errors))),
            "rmse": float(np.sqrt(np.mean(errors**2))),
            "bias": float(np.mean(errors)),
            "variance": float(bma.model_variances.get(name, 0))
        }
    
    # BMA combined metrics
    bma_mean = np.array(prediction["mean"])
    bma_errors = obs_array - bma_mean[:len(obs_array)]
    
    return {
        "algorithm": "Bayesian Model Averaging",
        "library": "scipy",
        "reference": "Hoeting et al. (1999). Bayesian Model Averaging: A Tutorial",
        "mathematical_formulation": {
            "posterior": "P(M_k | D) ∝ P(D | M_k) × P(M_k)",
            "bma_mean": "E[Δ | D] = Σ_k P(M_k | D) × E[Δ | M_k, D]",
            "bma_variance": "Var[Δ | D] = Σ_k w_k × [σ²_k + (μ_k - μ_BMA)²]"
        },
        "posterior_weights": weights,
        "prior_weights": prior_weights or {name: 1.0/len(model_names) for name in model_names},
        "model_metrics": model_metrics,
        "bma_prediction": prediction,
        "bma_metrics": {
            "mae": float(np.mean(np.abs(bma_errors))),
            "rmse": float(np.sqrt(np.mean(bma_errors**2))),
            "skill_improvement": float(
                1 - np.mean(bma_errors**2) / np.mean([model_metrics[m]["rmse"]**2 for m in model_names])
            )
        },
        "n_models": len(model_names),
        "n_observations": len(observations)
    }


def get_source_code() -> str:
    """Return the source code of the BayesianModelAveraging class"""
    return inspect.getsource(BayesianModelAveraging)
