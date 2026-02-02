"""
==============================================
Ensemble Voting for Weather Prediction
التصويت المجمع للتنبؤ بالطقس

Combines multiple ML models for improved predictions
==============================================
"""

import numpy as np
from sklearn.ensemble import (
    VotingRegressor,
    RandomForestRegressor,
    GradientBoostingRegressor,
    AdaBoostRegressor
)
from sklearn.linear_model import Ridge, ElasticNet
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, Optional, List
import inspect


class WeatherEnsembleVoting:
    """
    Ensemble Voting Regressor for weather prediction.
    
    Ensemble Methods:
    ================
    
    1. Hard Voting (Classification):
       Majority vote from all models
    
    2. Soft Voting (Classification):
       Weighted average of probabilities
    
    3. Averaging (Regression):
       ŷ = (1/M) × Σ_{m=1}^{M} ŷ_m
    
    4. Weighted Averaging:
       ŷ = Σ_{m=1}^{M} w_m × ŷ_m, where Σw_m = 1
    
    Diversity:
    =========
    Ensemble benefits from diverse models:
    - Different algorithms (RF, GB, Ridge)
    - Different hyperparameters
    - Different feature subsets
    
    Model Combination Benefits:
    ==========================
    - Reduces variance (averaging effect)
    - Reduces bias (if models complement)
    - More robust to overfitting
    - Better generalization
    
    Weather Application:
    ===================
    Combines:
    - Random Forest: Handles non-linearity
    - Gradient Boosting: Captures residual patterns
    - Ridge Regression: Linear baseline
    - AdaBoost: Focuses on hard examples
    """
    
    def __init__(self, 
                 models: Optional[List[str]] = None,
                 weights: Optional[List[float]] = None):
        """
        Initialize Ensemble Voting.
        
        Args:
            models: List of model names to include
            weights: Optional weights for each model
        """
        # Default models
        if models is None:
            models = ['random_forest', 'gradient_boosting', 'ridge', 'adaboost']
        
        self.models = models
        self.weights = weights
        
        # Build estimators
        estimators = []
        for name in models:
            if name == 'random_forest':
                estimators.append((
                    'rf',
                    RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42)
                ))
            elif name == 'gradient_boosting':
                estimators.append((
                    'gb',
                    GradientBoostingRegressor(n_estimators=50, max_depth=4, random_state=42)
                ))
            elif name == 'ridge':
                estimators.append((
                    'ridge',
                    Ridge(alpha=1.0)
                ))
            elif name == 'adaboost':
                estimators.append((
                    'ada',
                    AdaBoostRegressor(n_estimators=50, random_state=42)
                ))
            elif name == 'elastic_net':
                estimators.append((
                    'enet',
                    ElasticNet(alpha=0.1, l1_ratio=0.5)
                ))
        
        self.ensemble = VotingRegressor(
            estimators=estimators,
            weights=weights
        )
        self.is_trained = False
        
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Train the ensemble model.
        
        Args:
            X: Training features
            y: Training targets
            
        Returns:
            Training metrics
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train ensemble
        self.ensemble.fit(X_train, y_train)
        self.is_trained = True
        
        # Ensemble predictions
        y_pred_ensemble = self.ensemble.predict(X_test)
        
        # Individual model predictions and metrics
        individual_metrics = {}
        for name, model in self.ensemble.estimators_:
            y_pred_individual = model.predict(X_test)
            individual_metrics[name] = {
                "mae": float(mean_absolute_error(y_test, y_pred_individual)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred_individual))),
                "r2": float(r2_score(y_test, y_pred_individual))
            }
        
        # Cross-validation for ensemble
        cv_scores = cross_val_score(
            self.ensemble, X, y,
            cv=5,
            scoring='neg_mean_absolute_error'
        )
        
        return {
            "n_samples": len(y),
            "n_features": X.shape[1],
            "n_models": len(self.models),
            "model_names": self.models,
            "weights": self.weights,
            "cross_validation": {
                "cv_scores": (-cv_scores).tolist(),
                "cv_mean": float(-cv_scores.mean()),
                "cv_std": float(cv_scores.std())
            },
            "ensemble_metrics": {
                "mae": float(mean_absolute_error(y_test, y_pred_ensemble)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred_ensemble))),
                "r2": float(r2_score(y_test, y_pred_ensemble))
            },
            "individual_metrics": individual_metrics,
            "improvement_over_best": float(
                min([m["mae"] for m in individual_metrics.values()]) - 
                mean_absolute_error(y_test, y_pred_ensemble)
            )
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained first")
        return self.ensemble.predict(X)
    
    def predict_all_models(self, X: np.ndarray) -> Dict[str, np.ndarray]:
        """Get predictions from all individual models"""
        if not self.is_trained:
            raise ValueError("Model must be trained first")
            
        predictions = {}
        for name, model in self.ensemble.estimators_:
            predictions[name] = model.predict(X)
        predictions["ensemble"] = self.ensemble.predict(X)
        
        return predictions


def train_and_predict(X_train: np.ndarray,
                      y_train: np.ndarray,
                      X_predict: Optional[np.ndarray] = None) -> Dict[str, Any]:
    """
    Train Ensemble Voting and optionally make predictions.
    """
    ensemble = WeatherEnsembleVoting()
    train_metrics = ensemble.train(X_train, y_train)
    
    result = {
        "algorithm": "Ensemble Voting Regressor",
        "library": "scikit-learn",
        "version": "1.4.0",
        "reference": "scikit-learn.org - Ensemble Methods",
        "mathematical_formulation": {
            "averaging": "ŷ = (1/M) × Σ_{m=1}^{M} ŷ_m",
            "weighted": "ŷ = Σ_{m=1}^{M} w_m × ŷ_m",
            "diversity": "Error_ensemble ≤ (1/M) × Σ Error_m"
        },
        "included_models": {
            "random_forest": "Handles non-linearity, reduces variance",
            "gradient_boosting": "Captures residual patterns",
            "ridge": "Regularized linear baseline",
            "adaboost": "Focuses on hard examples"
        },
        "training_metrics": train_metrics
    }
    
    if X_predict is not None:
        predictions = ensemble.predict_all_models(X_predict)
        result["predictions"] = {
            name: pred.tolist() for name, pred in predictions.items()
        }
    
    return result


def get_source_code() -> str:
    """Return the source code of the WeatherEnsembleVoting class"""
    return inspect.getsource(WeatherEnsembleVoting)
