"""
==============================================
Random Forest for Weather Prediction
الغابات العشوائية للتنبؤ بالطقس

Reference: Breiman, L. (2001). Random Forests.
Machine Learning, 45(1), 5-32.
==============================================
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
    
    Algorithm Overview:
    ==================
    
    Random Forest is an ensemble of Decision Trees that:
    1. Trains multiple trees on bootstrapped samples (Bagging)
    2. Uses random feature subsets at each split
    3. Aggregates predictions (averaging for regression)
    
    Key Concepts:
    ============
    
    Bootstrap Aggregating (Bagging):
        - Sample n points with replacement from training set
        - Each tree sees different subset of data
        - Reduces variance without increasing bias
    
    Random Feature Selection:
        - At each node, consider only √p features (or p/3)
        - Decorrelates trees for better ensemble
    
    Out-of-Bag (OOB) Error:
        - Each tree is tested on ~37% data not in bootstrap
        - Provides unbiased generalization estimate
    
    Feature Importance:
        - Mean Decrease in Impurity (MDI)
        - Permutation Importance
    
    Weather Features:
    ================
    Typical input features:
    - temperature_lag1, temperature_lag2 (autoregressive)
    - humidity, pressure, wind_speed (current conditions)
    - day_of_year, month (seasonality)
    - elevation, latitude (geographic)
    """
    
    def __init__(self, 
                 n_estimators: int = 100, 
                 max_depth: int = 10,
                 min_samples_split: int = 5):
        """
        Initialize Random Forest model.
        
        Args:
            n_estimators: Number of trees in the forest
            max_depth: Maximum depth of each tree
            min_samples_split: Minimum samples required to split a node
        """
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42,
            n_jobs=-1,
            oob_score=True
        )
        self.feature_names = [
            "temperature_lag1", "temperature_lag2",
            "humidity", "pressure", "wind_speed",
            "day_of_year", "month"
        ]
        self.is_trained = False
        
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """
        Train the Random Forest model.
        
        Args:
            X: Training features (n_samples, n_features)
            y: Training targets (n_samples,)
            
        Returns:
            Dictionary with training metrics
        """
        # Split data for evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Cross-validation scores
        cv_scores = cross_val_score(
            self.model, X, y, 
            cv=5, 
            scoring='neg_mean_absolute_error'
        )
        
        # Predictions on test set
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
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
                "mae": float(mae),
                "rmse": float(rmse),
                "r2": float(r2),
                "mape": float(np.mean(np.abs((y_test - y_pred) / y_test)) * 100) if np.all(y_test != 0) else None
            },
            "oob_score": float(self.model.oob_score_),
            "feature_importance": feature_importance,
            "model_params": {
                "n_estimators": self.model.n_estimators,
                "max_depth": self.model.max_depth,
                "min_samples_split": self.model.min_samples_split
            }
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions.
        
        Args:
            X: Features for prediction
            
        Returns:
            Predicted values
        """
        if not self.is_trained:
            raise ValueError("Model must be trained first")
        return self.model.predict(X)
    
    def predict_with_uncertainty(self, X: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Make predictions with uncertainty estimates.
        
        Uses predictions from individual trees to estimate uncertainty.
        
        Args:
            X: Features for prediction
            
        Returns:
            Dictionary with predictions and uncertainty
        """
        if not self.is_trained:
            raise ValueError("Model must be trained first")
            
        # Get predictions from all trees
        all_predictions = np.array([
            tree.predict(X) for tree in self.model.estimators_
        ])
        
        mean_pred = np.mean(all_predictions, axis=0)
        std_pred = np.std(all_predictions, axis=0)
        
        return {
            "mean": mean_pred,
            "std": std_pred,
            "lower_ci": mean_pred - 1.96 * std_pred,
            "upper_ci": mean_pred + 1.96 * std_pred
        }


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
        Complete training results and predictions
        
    Example:
        >>> X = np.random.rand(100, 5)  # 100 samples, 5 features
        >>> y = np.random.rand(100) * 10 + 20  # Temperature targets
        >>> result = train_and_predict(X, y)
    """
    # Initialize model
    rf = WeatherRandomForest(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5
    )
    
    # Train
    train_metrics = rf.train(X_train, y_train)
    
    # Build result
    result = {
        "algorithm": "Random Forest",
        "library": "scikit-learn",
        "version": "1.4.0",
        "reference": "Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32",
        "mathematical_formulation": {
            "prediction": "ŷ = (1/B) × Σ_{b=1}^{B} T_b(x)",
            "bootstrap": "Draw n samples with replacement",
            "feature_selection": "Random subset of √p features at each split",
            "ensemble": "Average predictions from B trees"
        },
        "model_config": {
            "n_estimators": 100,
            "max_depth": 10,
            "min_samples_split": 5,
            "max_features": "sqrt"
        },
        "training_metrics": train_metrics
    }
    
    # Make predictions if requested
    if X_predict is not None:
        predictions = rf.predict_with_uncertainty(X_predict)
        result["predictions"] = {
            "values": predictions["mean"].tolist(),
            "std": predictions["std"].tolist(),
            "lower_ci": predictions["lower_ci"].tolist(),
            "upper_ci": predictions["upper_ci"].tolist()
        }
    
    return result


def get_source_code() -> str:
    """Return the source code of the WeatherRandomForest class"""
    return inspect.getsource(WeatherRandomForest)
