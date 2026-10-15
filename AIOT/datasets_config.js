// Model data benchmarks for 50 Startups and Boston Housing datasets
// Designed for AIoT Multiple Linear Regression & Feature Selection Explorer

window.DATASETS_CONFIG = {
  "50_startups": {
    id: "50_startups",
    name: "50 Startups (Profit Prediction)",
    badge: "Kaggle / Avik Jain",
    target: "Profit",
    targetUnit: "$",
    targetPrefix: "$",
    targetMultiplier: 1,
    sweetSpotK: 2,
    sweetSpotTitle: "k = 2 ★ Optimal Sweet Spot",
    sweetSpotBadge: "Occam's Razor: Min Test RMSE ($8,198.80) & Peak R² (0.9474)",
    overfitK: 5,
    overfitBadge: "Overfitting Cliff: Test RMSE spikes to $9,137.99 with collinear dummies",
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
    name: "Boston Housing (Median House Value - MEDV)",
    badge: "Kaggle / UCI StatLib",
    target: "MEDV",
    targetUnit: "$1,000s",
    targetPrefix: "$",
    targetMultiplier: 1000,
    sweetSpotK: 3,
    sweetSpotTitle: "k = 3 ★ Optimal Sweet Spot",
    sweetSpotBadge: "Parsimony Champion: LSTAT + RM + PTRATIO yields lowest test error ($5.12k RMSE, R² = 0.69)",
    overfitK: 5,
    overfitBadge: "Diminishing Returns: Adding NOX & DIS increases parameter variance without practical gain",
    heroTitle: "Boston Housing Multiple Linear Regression & Parsimony Explorer",
    heroDesc: "Predict suburban Boston housing values (MEDV in $1,000s) using classic socio-economic and structural indicators. Benchmark 5 Feature Selection methods to find the optimal parsimonious model balancing predictive power and interpretability.",
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
  }
};
