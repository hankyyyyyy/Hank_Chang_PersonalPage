"""
================================================================================
AIoT-DA Lecture 6: Problem 2 - TSMC 2330.TW Stock Auto-Regression & Boston Housing
Following CRISP-DM (Cross-Industry Standard Process for Data Mining) Methodology
Author: Hank Chang (張佑維)
Topic 2: Autoregressive Time-Lag Regression & Socio-Economic Housing Valuation
================================================================================
"""

import io
import gzip
import pickle
import requests
import numpy as np
import pandas as pd
from tabulate import tabulate
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

print("=" * 80)
print("[CRISP-DM Problem 2: TSMC 2330.TW Stock Auto-Regression (AR)]")
print("=" * 80)

# ==============================================================================
# Part A: TSMC 2330.TW Stock Auto-Regression (Lecture 6 Mentioned Topic)
# ==============================================================================
# Generating TSMC daily price time series with realistic momentum & volatility
np.random.seed(42)
n_days = 250
dates = pd.date_range(start='2024-01-01', periods=n_days, freq='B')

# Simulated TSMC daily price walk around 900-1080 NT$
returns = np.random.normal(0.0012, 0.015, n_days)
prices = [900.0]
for r in returns[1:]:
    prices.append(prices[-1] * (1 + r))

volumes = np.random.normal(35000, 8000, n_days).clip(15000, 85000)

tsmc_df = pd.DataFrame({
    'Date': dates,
    'Close_t': prices,
    'Volume_K': volumes / 1000.0
})

# Feature Engineering: Lagged Features for Auto-Regression
tsmc_df['Lag1_Close'] = tsmc_df['Close_t'].shift(1)
tsmc_df['Lag2_Close'] = tsmc_df['Close_t'].shift(2)
tsmc_df['Lag3_Close'] = tsmc_df['Close_t'].shift(3)
tsmc_df['MA5_Close'] = tsmc_df['Close_t'].rolling(window=5).mean().shift(1)

tsmc_clean = tsmc_df.dropna().reset_index(drop=True)

X_tsmc = tsmc_clean[['Lag1_Close', 'MA5_Close', 'Volume_K', 'Lag2_Close', 'Lag3_Close']]
y_tsmc = tsmc_clean['Close_t']

# Temporal Train-Test Split (First 80% train, last 20% test)
split_idx = int(len(tsmc_clean) * 0.8)
X_train_tsmc, X_test_tsmc = X_tsmc.iloc[:split_idx], X_tsmc.iloc[split_idx:]
y_train_tsmc, y_test_tsmc = y_tsmc.iloc[:split_idx], y_tsmc.iloc[split_idx:]

print(f"TSMC Data: {len(X_train_tsmc)} train days, {len(X_test_tsmc)} out-of-sample test days")

# Forward Feature Selection for TSMC
tsmc_results = []
selected = []
for k in range(1, 6):
    best_rmse = np.inf
    best_feat = None
    best_r2 = -np.inf
    remaining = [f for f in X_tsmc.columns if f not in selected]
    for feat in remaining:
        feats = selected + [feat]
        m = LinearRegression()
        m.fit(X_train_tsmc[feats], y_train_tsmc)
        preds = m.predict(X_test_tsmc[feats])
        rmse = np.sqrt(mean_squared_error(y_test_tsmc, preds))
        r2 = r2_score(y_test_tsmc, preds)
        if rmse < best_rmse:
            best_rmse = rmse
            best_r2 = r2
            best_feat = feat
    selected.append(best_feat)
    tsmc_results.append({
        'Number of Features': k,
        'Selected Features': list(selected),
        'RMSE (NT$)': best_rmse,
        'R-squared': best_r2
    })

print("\nTSMC 2330.TW Auto-Regression Feature Progression:")
print(tabulate(pd.DataFrame(tsmc_results), headers='keys', tablefmt='pipe', floatfmt=('.0f', '', '.4f', '.6f')))


# ==============================================================================
# Part B: Boston Housing Price Multiple Linear Regression
# ==============================================================================
print("\n" + "=" * 80)
print("[CRISP-DM Problem 2 Option B: Boston Housing (MEDV Valuation)]")
print("=" * 80)

BOSTON_URL = 'https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv'
try:
    resp = requests.get(BOSTON_URL, timeout=10)
    boston_df = pd.read_csv(io.StringIO(resp.text))
    print(f"✓ Successfully fetched Boston Housing dataset ({len(boston_df)} census tracts)")
except Exception:
    # Fallback to local
    boston_df = pd.read_csv('datasets/BostonHousing.csv')

X_boston = boston_df.drop('medv', axis=1)
y_boston = boston_df['medv']

X_tr_b, X_te_b, y_tr_b, y_te_b = train_test_split(X_boston, y_boston, test_size=0.2, random_state=42)

boston_results = []
selected_b = []
for k in range(1, 6):
    best_rmse = np.inf
    best_feat = None
    best_r2 = -np.inf
    remaining = [f for f in X_boston.columns if f not in selected_b]
    for feat in remaining:
        feats = selected_b + [feat]
        m = LinearRegression()
        m.fit(X_tr_b[feats], y_tr_b)
        preds = m.predict(X_te_b[feats])
        rmse = np.sqrt(mean_squared_error(y_te_b, preds))
        r2 = r2_score(y_te_b, preds)
        if rmse < best_rmse:
            best_rmse = rmse
            best_r2 = r2
            best_feat = feat
    selected_b.append(best_feat)
    boston_results.append({
        'Number of Features': k,
        'Selected Features': list(selected_b),
        'RMSE ($1k)': best_rmse,
        'R-squared': best_r2
    })

print("\nBoston Housing Feature Progression:")
print(tabulate(pd.DataFrame(boston_results), headers='keys', tablefmt='pipe', floatfmt=('.0f', '', '.4f', '.6f')))

print("\n" + "=" * 80)
print("Problem 2 Analysis Complete! Ready for Submission & Integration.")
print("=" * 80)
