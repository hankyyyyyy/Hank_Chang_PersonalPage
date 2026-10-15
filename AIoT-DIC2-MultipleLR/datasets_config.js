// Model data benchmarks for 50 Startups, Boston Housing, and TSMC 2330.TW datasets
// Designed for AIoT Multiple Linear Regression & Feature Selection Explorer (CRISP-DM)

window.DATASETS_CONFIG = {
  "50_startups": {
    id: "50_startups",
    name: "Problem 1: 50 Startups (Profit Prediction - Multiple LR)",
    badge: "Kaggle / Avik Jain",
    target: "Profit",
    targetUnit: "$",
    targetPrefix: "$",
    targetMultiplier: 1,
    sweetSpotK: 2,
    sweetSpotTitle: "k = 2 ★ Optimal Sweet Spot (Min RMSE)",
    sweetSpotBadge: "Occam's Razor: 2 features (R&D + Marketing) minimize test RMSE ($8,198.80) & peak R² (0.9474)",
    overfitK: 5,
    overfitBadge: "Overfitting Cliff: Test RMSE spikes to $9,137.99 when adding redundant State dummies & Admin",
    heroTitle: "50 Startups Multiple Linear Regression & Parsimony Explorer",
    heroDesc: "Compare 5 Machine Learning Feature Selection Algorithms (Lasso, Forward SFS, RFE, ElasticNet, Exhaustive Search) against Baseline OLS. Explore the bias-variance tradeoff across feature counts k = 1 … 5, pinpointing the 2-feature optimal sweet spot and the 5-feature overfitting cliff.",
    referenceUrl: "https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv",
    referenceName: "50 Startups Dataset (Avik Jain 100-Days-Of-ML)",
    kLabels: {
      1: "k = 1 (R&D Spend)",
      2: "k = 2 ★ Optimal Sweet Spot (Min RMSE)",
      3: "k = 3 (+ State / Admin)",
      4: "k = 4 (4 Predictors)",
      5: "k = 5 ⚠ Full Model (Overfitting Cliff)"
    },
    features: [
      { id: "RD", name: "R&D Spend", label: "R&D Spend ($)", min: 0, max: 250000, step: 5000, default: 100000, prefix: "$" },
      { id: "Mkt", name: "Marketing Spend", label: "Marketing Spend ($)", min: 0, max: 500000, step: 5000, default: 150000, prefix: "$" },
      { id: "Admin", name: "Administration", label: "Administration ($)", min: 0, max: 250000, step: 5000, default: 120000, prefix: "$" },
      { id: "State", name: "State", label: "State Location", type: "select", options: ["California", "New York", "Florida"], default: "California" }
    ]
  },
  "boston_housing": {
    id: "boston_housing",
    name: "Problem 2A: Boston Housing (MEDV Home Value)",
    badge: "Kaggle / UCI StatLib",
    target: "MEDV",
    targetUnit: "$1,000s",
    targetPrefix: "$",
    targetMultiplier: 1000,
    sweetSpotK: 3,
    sweetSpotTitle: "k = 3 ★ Optimal Sweet Spot (LSTAT + RM + PTRATIO)",
    sweetSpotBadge: "Parsimony Champion: LSTAT + RM + PTRATIO yields lowest test error ($5.12k RMSE, R² = 0.679)",
    overfitK: 5,
    overfitBadge: "Diminishing Returns: Adding NOX & DIS increases parameter variance without practical gain",
    heroTitle: "Boston Housing Multiple Linear Regression & Parsimony Explorer",
    heroDesc: "Predict suburban Boston housing values (MEDV in $1,000s) using socio-economic and structural indicators. Benchmark 5 Feature Selection methods to find the optimal parsimonious model balancing predictive power and interpretability.",
    referenceUrl: "https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv",
    referenceName: "Boston Housing Dataset (506 Census Tracts)",
    kLabels: {
      1: "k = 1 (LSTAT: % Lower Status)",
      2: "k = 2 (+ RM: Rooms per Dwelling)",
      3: "k = 3 ★ Optimal Sweet Spot (+ PTRATIO)",
      4: "k = 4 (+ DIS: Employment Dist)",
      5: "k = 5 (Full 5-Feature Subset)"
    },
    features: [
      { id: "LSTAT", name: "lstat", label: "LSTAT (% Lower Status of Population)", min: 1, max: 40, step: 0.5, default: 12.5, prefix: "", suffix: "%" },
      { id: "RM", name: "rm", label: "RM (Avg Rooms per Dwelling)", min: 3, max: 9, step: 0.1, default: 6.2, prefix: "", suffix: " rooms" },
      { id: "PTRATIO", name: "ptratio", label: "PTRATIO (Pupil-Teacher Ratio)", min: 12, max: 23, step: 0.2, default: 18.4, prefix: "", suffix: ":1" },
      { id: "DIS", name: "dis", label: "DIS (Weighted Dist to Employment)", min: 1, max: 12, step: 0.2, default: 3.8, prefix: "", suffix: " mi" },
      { id: "CRIM", name: "crim", label: "CRIM (Per Capita Crime Rate)", min: 0.01, max: 50, step: 0.1, default: 3.6, prefix: "", suffix: "" },
      { id: "NOX", name: "nox", label: "NOX (Nitric Oxides Concentration)", min: 0.38, max: 0.88, step: 0.01, default: 0.54, prefix: "", suffix: " ppm" }
    ]
  },
  "tsmc_stock": {
    id: "tsmc_stock",
    name: "Problem 2B: TSMC 2330.TW (Stock Auto-Regression)",
    badge: "TWSE 2330.TW / Lecture 6 AR",
    target: "Close_t",
    targetUnit: "NT$",
    targetPrefix: "NT$ ",
    targetMultiplier: 1,
    sweetSpotK: 2,
    sweetSpotTitle: "k = 2 ★ Optimal Sweet Spot (Lag-1 + 5MA)",
    sweetSpotBadge: "Occam's Razor: Lag-1 Price & 5-Day MA yields lowest out-of-sample RMSE (NT$ 13.82)",
    overfitK: 5,
    overfitBadge: "Multicollinearity Warning: Adding consecutive lags (Lag-2, Lag-3) inflates VIF > 12 without error reduction",
    heroTitle: "TSMC 2330.TW Stock Auto-Regression & Parsimony Explorer",
    heroDesc: "Model next-day closing price of TSMC (2330.TW) using Autoregressive Time-Lagged Features (Lag-1, Lag-2, Lag-3, 5-Day MA, Volume). Compare 5 feature selection methods to balance momentum capturing vs high autocorrelation overfitting.",
    referenceUrl: "https://finance.yahoo.com/quote/2330.TW",
    referenceName: "TSMC 2330.TW Daily Quotes (TWSE)",
    kLabels: {
      1: "k = 1 (Lag-1 Close)",
      2: "k = 2 ★ Optimal Sweet Spot (+ 5-Day MA)",
      3: "k = 3 (+ Trading Volume)",
      4: "k = 4 (+ Lag-2 Close)",
      5: "k = 5 ⚠ Full Autoregression (VIF Collinear)"
    },
    features: [
      { id: "Lag1", name: "Lag1_Close", label: "Lag-1 Close Price (NT$)", min: 500, max: 1200, step: 5, default: 980, prefix: "NT$ " },
      { id: "MA5", name: "MA5_Close", label: "5-Day Moving Average (NT$)", min: 500, max: 1200, step: 5, default: 972, prefix: "NT$ " },
      { id: "Vol", name: "Volume_K", label: "Volume (Thousand Shares)", min: 10000, max: 80000, step: 1000, default: 32000, prefix: "", suffix: " K" },
      { id: "Lag2", name: "Lag2_Close", label: "Lag-2 Close Price (NT$)", min: 500, max: 1200, step: 5, default: 968, prefix: "NT$ " },
      { id: "Lag3", name: "Lag3_Close", label: "Lag-3 Close Price (NT$)", min: 500, max: 1200, step: 5, default: 965, prefix: "NT$ " }
    ]
  }
};
