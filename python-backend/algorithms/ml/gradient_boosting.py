"""
==============================================
Gradient Boosting for Weather Prediction
التعزيز التدريجي للتنبؤ بالطقس

Reference: Friedman, J.H. (2001).
Greedy Function Approximation: A Gradient Boosting Machine.
Annals of Statistics, 29(5), 1189-1232.
==============================================
"""

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, Optional
import inspect


class WeatherGradientBoosting:
    """
    Gradient Boosting Regressor for weather prediction.
    
    Algorithm Overview:
    ==================
    
    Gradient Boosting builds an additive model in a forward stage-wise manner:
    
        F_m(x) = F_{m-1}(x) + ν × h_m(x)
    
    Where:
    - F_m: Model at stage m
    - h_m: Base learner (decision tree) at stage m
    - ν: Learning rate (shrinkage)
    
    At each stage, fit h_m to pseudo-residuals:
        r_im = -[∂L(y_i, F(x_i))/∂F(x_i)]_{F=F_{m-1}}
    
    For squared error loss:
        r_im = y_i - F_{m-1}(x_i)
    
    Key Differences from Random Forest:
    ==================================
    - Sequential: Each tree corrects previous errors
    - Lower variance than individual trees
    - Can overfit if not regularized
    - Learning rate controls contribution
    
    Regularization:
    ==============
    - Learning rate (shrinkage)
    - Max depth limits tree complexity
    - Subsample (stochastic gradient boosting)
    - Min samples per leaf
    """
    
    def __init__(self,
                 n_estimators: int = 100,
                 max_depth: int = 5,
                 learning_rate: float = 0.1,
                 subsample: float = 0.8):
        """
        Initialize Gradient Boosting model.
        
        Args:
            n_estimators: Number of boosting stages
            max_depth: Maximum depth of individual trees
            learning_rate: Shrinkage factor
            subsample: Fraction of samples for each tree
        """
        self.model = GradientBoostingRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            subsample=subsample,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        self.feature_names = [
            "temperature_lag1", "temperature_lag2",
            "humidity", "pressure", "wind_speed",
            "day_of_year", "month"
        ]
        self.is_trained = False
        
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Train the Gradient Boosting model.
        
        Args:
            X: Training features
            y: Training targets
            
        Returns:
            Training metrics
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.model, X, y,
            cv=5,
            scoring='neg_mean_absolute_error'
        )
        
        # Test predictions
        y_pred = self.model.predict(X_test)
        
        # Staged predictions for learning curve
        train_scores = []
        test_scores = []
        for i, y_pred_staged in enumerate(self.model.staged_predict(X_test)):
            if i % 10 == 0:
                test_scores.append(float(mean_squared_error(y_test, y_pred_staged)))
        
        # Feature importance
        n_features = min(X.shape[1], len(self.feature_names))
        feature_importance = dict(zip(
            self.feature_names[:n_features],
            self.model.feature_importances_.tolist()
        ))
        
        return {
            "n_samples": len(y),
            "n_features": X.shape[1],
            "cross_validation": {
                "cv_scores": (-cv_scores).tolist(),
                "cv_mean": float(-cv_scores.mean()),
                "cv_std": float(cv_scores.std())
            },
            "test_metrics": {
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "r2": float(r2_score(y_test, y_pred))
            },
            "feature_importance": feature_importance,
            "staged_test_mse": test_scores,
            "train_score": float(self.model.score(X_train, y_train)),
            "oob_improvement": self.model.oob_improvement_.tolist()[-5:] if hasattr(self.model, 'oob_improvement_') else None
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained first")
        return self.model.predict(X)


def train_and_predict(X_train: np.ndarray,
                      y_train: np.ndarray,
                      X_predict: Optional[np.ndarray] = None) -> Dict[str, Any]:
    """
    Train Gradient Boosting and optionally make predictions.
    """
    gb = WeatherGradientBoosting()
    train_metrics = gb.train(X_train, y_train)
    
    result = {
        "algorithm": "Gradient Boosting",
        "library": "scikit-learn",
        "version": "1.4.0",
        "reference": "Friedman, J.H. (2001). Greedy Function Approximation",
        "mathematical_formulation": {
            "additive_model": "F_m(x) = F_{m-1}(x) + ν × h_m(x)",
            "pseudo_residuals": "r_im = -∂L(y_i, F(x_i))/∂F(x_i)",
            "squared_loss": "L(y, F) = ½(y - F)²"
        },
        "model_config": {
            "n_estimators": 100,
            "max_depth": 5,
            "learning_rate": 0.1,
            "subsample": 0.8
        },
        "training_metrics": train_metrics
    }
    
    if X_predict is not None:
        predictions = gb.predict(X_predict)
        result["predictions"] = predictions.tolist()
    
    return result


def get_source_code() -> str:
    """Return the source code of the WeatherGradientBoosting class"""
    return inspect.getsource(WeatherGradientBoosting)
