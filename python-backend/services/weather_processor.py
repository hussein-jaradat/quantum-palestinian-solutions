"""Weather Data Processor"""
import numpy as np

def normalize_features(data):
    return (data - np.mean(data)) / (np.std(data) + 1e-8)

def create_sequences(data, seq_length=24):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    return np.array(X), np.array(y)
