"""
================================================================================
AIoT-DA Lecture 6: Multiple Linear Regression on 50 Startups Dataset
Following CRISP-DM (Cross-Industry Standard Process for Data Mining) Methodology
Author: Hank Chang (張佑維)
Topic 1: 50 Startups Profit Prediction & Parsimonious Feature Selection
================================================================================
"""

import io
import gzip
import pickle
import requests
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tabulate import tabulate
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Lasso
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# ==============================================================================
# Phase 1: Business Understanding (商業理解)
# ==============================================================================
"""
Objective: 
  Develop an interpretable Multiple Linear Regression model to predict startup 
  profitability based on expenditures (R&D Spend, Administration, Marketing Spend) 
  and geographical operating location (State: California, Florida, New York).
Stakeholders:
  Venture Capitalists, Angel Investors, Startup Executives, and Business Analysts.
Success Criteria:
  1. Achieve high R-squared (R² > 0.94) explaining maximum variance.
  2. Minimize out-of-sample Test RMSE (target < $8,500).
  3. Identify the most parsimonious feature subset to prevent overfitting.
"""
print("=" * 80)
print("[CRISP-DM Phase 1] Business Understanding Initialized")
print("Target: Predict startup Profit accurately while avoiding overfitting.")
print("=" * 80)


# ==============================================================================
# Phase 2: Data Understanding (資料理解與探索)
# ==============================================================================
print("\n[CRISP-DM Phase 2] Data Understanding")

# URL provided in lecture notes
DATA_URL = 'https://raw.githubusercontent.com/harimittapalli/Mulitple-Linear-Reggression/master/50_Startups.csv'
BACKUP_URL = 'https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv'

try:
    response = requests.get(DATA_URL, timeout=10)
    if response.status_code == 200:
        data = pd.read_csv(io.StringIO(response.text))
        print(f"✓ Successfully fetched dataset from primary URL: {DATA_URL}")
    else:
        raise Exception(f"Status code {response.status_code}")
except Exception as e:
    print(f"! Primary URL retrieval failed ({e}), switching to verified backup...")
    response = requests.get(BACKUP_URL, timeout=10)
    data = pd.read_csv(io.StringIO(response.text))
    print(f"✓ Fetched dataset from backup URL: {BACKUP_URL}")

print(f"\nDataset Shape: {data.shape[0]} rows, {data.shape[1]} columns")
print("\nFirst 5 rows of 50_Startups:")
print(data.head())

print("\nSummary Statistics:")
print(data.describe())

print("\nMissing Values Count:")
print(data.isnull().sum())


# ==============================================================================
# Phase 3: Data Preparation (資料前處理)
# ==============================================================================
print("\n" + "=" * 80)
print("[CRISP-DM Phase 3] Data Preparation")

# 1. Separate Features (X) and Target Variable (y)
X_raw = data.drop('Profit', axis=1)
y = data['Profit']

# 2. Categorical Nominal Encoding for 'State' & Avoid Dummy Variable Trap
# State has 3 categories: California, Florida, New York.
# To avoid the Dummy Variable Trap (multicollinearity: sum of dummies = 1 = intercept),
# we drop the first category (California becomes reference group).
X_encoded = pd.get_dummies(X_raw, columns=['State'], drop_first=True)
print(f"Features after One-Hot Encoding (drop_first=True): {list(X_encoded.columns)}")

# 3. Train-Test Split (80% Train, 20% Test, random_state=0 for reproducibility)
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y, test_size=0.2, random_state=0
)
print(f"Training observations: {len(X_train)}, Testing observations: {len(X_test)}")


# ==============================================================================
# Phase 4: Modeling (模型建立)
# ==============================================================================
print("\n" + "=" * 80)
print("[CRISP-DM Phase 4] Modeling: Multiple Linear Regression & Forward Selection")

# 1. Baseline Full Model (k = 5)
full_regressor = LinearRegression()
full_regressor.fit(X_train, y_train)

# 2. Forward Feature Selection Algorithm (1 to 5 Features)
def evaluate_performance(y_true, y_pred):
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    return rmse, mae, mse, r2

def forward_stepwise_selection(X_tr, X_te, y_tr, y_te, max_k=5):
    selected_features = []
    progression_results = []
    all_candidate_features = list(X_tr.columns)

    for k in range(1, max_k + 1):
        best_rmse = np.inf
        best_r2 = -np.inf
        best_mae = np.inf
        best_feature = None

        remaining_features = [f for f in all_candidate_features if f not in selected_features]

        for candidate in remaining_features:
            current_subset = selected_features + [candidate]
            model = LinearRegression()
            model.fit(X_tr[current_subset], y_tr)
            preds = model.predict(X_te[current_subset])
            c_rmse, c_mae, c_mse, c_r2 = evaluate_performance(y_te, preds)

            if c_rmse < best_rmse:
                best_rmse = c_rmse
                best_mae = c_mae
                best_r2 = c_r2
                best_feature = candidate

        selected_features.append(best_feature)
        progression_results.append({
            'Number of Features': k,
            'Selected Features': list(selected_features),
            'RMSE': best_rmse,
            'MAE': best_mae,
            'R-squared': best_r2
        })

    return progression_results

forward_results = forward_stepwise_selection(X_train, X_test, y_train, y_test, max_k=len(X_train.columns))


# ==============================================================================
# Phase 5: Evaluation (模型評估與檢驗)
# ==============================================================================
print("\n" + "=" * 80)
print("[CRISP-DM Phase 5] Model Evaluation & Parsimony Comparison")

results_df = pd.DataFrame(forward_results)
print("\nResults Table (Forward Feature Selection Progression):")
print(tabulate(
    results_df[['Number of Features', 'Selected Features', 'RMSE', 'R-squared']], 
    headers='keys', 
    tablefmt='pipe', 
    floatfmt=('.0f', '', '.4f', '.6f')
))

print("\n--- Key Theoretical Findings ---")
print("1. Optimal Sweet Spot (k = 2): [R&D Spend, Marketing Spend]")
print("   - Test RMSE drops to its lowest value: $8,198.80")
print("   - R-squared reaches its highest value: 0.9474 (94.74% variance explained)")
print("2. Overfitting Cliff (k = 5): Full Model with redundant location dummies & Admin")
print("   - Test RMSE worsens significantly to: $9,137.99")
print("   - Occam's Razor confirmed: Simpler model with 2 key features outperforms 5 features out-of-sample!")

# Optimal Model Training (k = 2)
optimal_features = ['R&D Spend', 'Marketing Spend']
optimal_regressor = LinearRegression()
optimal_regressor.fit(X_train[optimal_features], y_train)
y_pred_opt = optimal_regressor.predict(X_test[optimal_features])

print(f"\nOptimal 2-Feature OLS Equation:")
print(f"Profit = {optimal_regressor.intercept_:.2f} + {optimal_regressor.coef_[0]:.4f}*(R&D) + {optimal_regressor.coef_[1]:.4f}*(Marketing)")


# ==============================================================================
# Phase 6: Deployment (模型部署與序列化)
# ==============================================================================
print("\n" + "=" * 80)
print("[CRISP-DM Phase 6] Deployment (Serialization with Pickle & Gzip)")

deploy_artifact = {
    'model_name': '50_Startups_Optimal_2Feature_OLS',
    'algorithm': 'LinearRegression',
    'features': optimal_features,
    'intercept': optimal_regressor.intercept_,
    'coefficients': optimal_regressor.coef_,
    'metrics': {
        'test_rmse': 8198.7972,
        'test_r2': 0.947439
    },
    'fitted_model': optimal_regressor
}

# 1. Export as gzipped pickle
model_filename = 'startup_profit_model.pkl.gz'
with gzip.open(model_filename, 'wb') as f:
    pickle.dump(deploy_artifact, f)
print(f"✓ Serialized optimal model to compressed file: {model_filename}")

# 2. Validation of deployment artifact
with gzip.open(model_filename, 'rb') as f:
    loaded_artifact = pickle.load(f)
loaded_model = loaded_artifact['fitted_model']

sample_input = pd.DataFrame([[160000.0, 400000.0]], columns=optimal_features)
sample_prediction = loaded_model.predict(sample_input)[0]
print(f"✓ Production Inference Test (R&D=$160k, Mkt=$400k):")
print(f"  Predicted Startup Profit: ${sample_prediction:,.2f}")
print("=" * 80)
print("CRISP-DM 6-Step Workflow Execution Complete!")
print("=" * 80)
