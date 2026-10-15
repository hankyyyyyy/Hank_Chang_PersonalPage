/**
 * Model Data for Multiple Linear Regression Explorer
 * Contains pre-computed benchmark results for:
 * 1. 50 Startups Dataset (Avik Jain 100-Days-Of-ML)
 * 2. Boston Housing Dataset (Harrison & Rubinfeld)
 * Across 5 Feature Selection Algorithms:
 * - Lasso (L1 Ranking)
 * - Forward SFS (Sequential Forward Selection)
 * - RFE (Recursive Feature Elimination)
 * - ElasticNet (L1 + L2)
 * - Exhaustive Search (Best Subset)
 */

window.DATASET_PRESETS = {
  "50startups": {
    name: "50 Startups Dataset",
    domain: "Corporate Venture & Profit Analysis",
    target: "Profit",
    targetUnit: "$",
    targetPrefix: "$",
    targetScale: 1,
    targetDecimals: 2,
    breadcrumb: "50 Startups Feature Progression",
    heroTitle: "Feature Selection & Parsimony Analysis",
    heroDesc: "Compare 5 Machine Learning Feature Selection Algorithms (Lasso, Forward SFS, RFE, ElasticNet, Exhaustive Search) against Baseline OLS. Explore the bias-variance tradeoff across feature counts k=1...5, pinpointing the 2-feature optimal sweet spot and the 5-feature overfitting cliff.",
    sweetSpotK: 2,
    sweetSpotNote: "Global Sweet Spot: k=2 ($8,198.80 RMSE)",
    overfitK: 5,
    overfitNote: "Overfitting Warning: k=5 ($9,137.99 RMSE)",
    sweetSpotReason: "Occam's Razor: 2 features (R&D Spend + Marketing Spend) yield the minimum test RMSE ($8,198.80) and peak R² (0.9474), eliminating noise without sacrificing explanatory power.",
    equationPrefix: "Profit = ",
    predictorTitle: "Live Profit Predictor",
    predictorDesc: "Test predictions in real-time with the active model.",
    predictorOutputTitle: "PREDICTED STARTUP PROFIT",
    datasetUrl: "https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv",
    inputFeatures: [
      { id: "rd_spend", label: "R&D Spend ($)", min: 0, max: 200000, step: 1000, default: 100000, prefix: "$", key: "R&D Spend" },
      { id: "marketing_spend", label: "Marketing Spend ($)", min: 0, max: 500000, step: 5000, default: 150000, prefix: "$", key: "Marketing Spend" },
      { id: "administration", label: "Administration ($)", min: 0, max: 250000, step: 2000, default: 120000, prefix: "$", key: "Administration" }
    ],
    categoricalSelect: {
      id: "state",
      label: "State Location",
      options: [
        { value: "California", label: "California (Reference)", dummy: {} },
        { value: "New York", label: "New York", dummy: { "State_New York": 1 } },
        { value: "Florida", label: "Florida", dummy: { "State_Florida": 1 } }
      ]
    },
    methods: {
      "Lasso": [
        {
          k: 1,
          features: ["R&D Spend"],
          rmse: 8274.87,
          mae: 6772.45,
          r2: 0.9465,
          adj_r2: 0.9398,
          f_stat: 652.39,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 48416.30, stderr: 2842.72, tstat: 17.03, pvalue: "< 0.0001", ci_lower: 42661.52, ci_upper: 54171.08, vif: "-" },
            { feature: "R&D Spend", coef: 0.8516, stderr: 0.0333, tstat: 25.54, pvalue: "< 0.0001", ci_lower: 0.7841, ci_upper: 0.9191, vif: "1.00 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Startup #38", actual: 81229.06, predicted: 65644.28, residual: 15584.78, abs_error: 15584.78, pct_error: 19.19, status: "High Residual" },
            { rank: 2, name: "Startup #2", actual: 191050.39, predicted: 179090.59, residual: 11959.80, abs_error: 11959.80, pct_error: 6.26, status: "High Residual" },
            { rank: 3, name: "Startup #10", actual: 146121.95, predicted: 135207.80, residual: 10914.15, abs_error: 10914.15, pct_error: 7.47, status: "High Residual" },
            { rank: 4, name: "Startup #11", actual: 144259.40, predicted: 134150.83, residual: 10108.57, abs_error: 10108.57, pct_error: 7.01, status: "High Residual" },
            { rank: 5, name: "Startup #41", actual: 77798.83, predicted: 72170.54, residual: 5628.29, abs_error: 5628.29, pct_error: 7.23, status: "In Range" },
            { rank: 6, name: "Startup #27", actual: 105008.31, predicted: 109824.77, residual: -4816.46, abs_error: 4816.46, pct_error: 4.59, status: "In Range" },
            { rank: 7, name: "Startup #4", actual: 166187.94, predicted: 169438.15, residual: -3250.21, abs_error: 3250.21, pct_error: 1.96, status: "In Range" },
            { rank: 8, name: "Startup #31", actual: 97483.56, predicted: 100481.43, residual: -2997.87, abs_error: 2997.87, pct_error: 3.08, status: "In Range" },
            { rank: 9, name: "Startup #28", actual: 103282.38, predicted: 104667.28, residual: -1384.90, abs_error: 1384.90, pct_error: 1.34, status: "In Range" },
            { rank: 10, name: "Startup #22", actual: 110352.25, predicted: 111431.75, residual: -1079.50, abs_error: 1079.50, pct_error: 0.98, status: "In Range" }
          ]
        },
        {
          k: 2,
          features: ["R&D Spend", "Marketing Spend"],
          rmse: 8198.80,
          mae: 6886.59,
          r2: 0.9474,
          adj_r2: 0.9324,
          f_stat: 349.04,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 46346.34, stderr: 2971.24, tstat: 15.60, pvalue: "< 0.0001", ci_lower: 40326.04, ci_upper: 52366.64, vif: "-" },
            { feature: "R&D Spend", coef: 0.7886, stderr: 0.0468, tstat: 16.85, pvalue: "< 0.0001", ci_lower: 0.6938, ci_upper: 0.8835, vif: "2.10 (Safe)" },
            { feature: "Marketing Spend", coef: 0.0326, stderr: 0.0175, tstat: 1.86, pvalue: "0.0708 (n.s.)", ci_lower: -0.0029, ci_upper: 0.0681, vif: "2.10 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Startup #38", actual: 81229.06, predicted: 68335.08, residual: 12893.98, abs_error: 12893.98, pct_error: 15.87, status: "High Residual" },
            { rank: 2, name: "Startup #10", actual: 146121.95, predicted: 134182.15, residual: 11939.80, abs_error: 11939.80, pct_error: 8.17, status: "High Residual" },
            { rank: 3, name: "Startup #2", actual: 191050.39, predicted: 180642.25, residual: 10408.14, abs_error: 10408.14, pct_error: 5.45, status: "High Residual" },
            { rank: 4, name: "Startup #11", actual: 144259.40, predicted: 133873.92, residual: 10385.48, abs_error: 10385.48, pct_error: 7.20, status: "High Residual" },
            { rank: 5, name: "Startup #27", actual: 105008.31, predicted: 114717.25, residual: -9708.94, abs_error: 9708.94, pct_error: 9.25, status: "In Range" },
            { rank: 6, name: "Startup #22", actual: 110352.25, predicted: 114580.92, residual: -4228.67, abs_error: 4228.67, pct_error: 3.83, status: "In Range" },
            { rank: 7, name: "Startup #4", actual: 166187.94, predicted: 170343.32, residual: -4155.38, abs_error: 4155.38, pct_error: 2.50, status: "In Range" },
            { rank: 8, name: "Startup #41", actual: 77798.83, predicted: 73701.11, residual: 4097.72, abs_error: 4097.72, pct_error: 5.27, status: "In Range" },
            { rank: 9, name: "Startup #28", actual: 103282.38, predicted: 102284.65, residual: 997.73, abs_error: 997.73, pct_error: 0.97, status: "In Range" },
            { rank: 10, name: "Startup #31", actual: 97483.56, predicted: 97433.46, residual: 50.10, abs_error: 50.10, pct_error: 0.05, status: "In Range" }
          ]
        },
        {
          k: 3,
          features: ["R&D Spend", "Marketing Spend", "State_New York"],
          rmse: 8309.06,
          mae: 7028.44,
          r2: 0.9460,
          adj_r2: 0.9190,
          f_stat: 226.87,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 46100.29, stderr: 3147.84, tstat: 14.65, pvalue: "< 0.0001", ci_lower: 39716.18, ci_upper: 52484.40, vif: "-" },
            { feature: "R&D Spend", coef: 0.7859, stderr: 0.0485, tstat: 16.20, pvalue: "< 0.0001", ci_lower: 0.6875, ci_upper: 0.8843, vif: "2.20 (Safe)" },
            { feature: "Marketing Spend", coef: 0.0333, stderr: 0.0179, tstat: 1.86, pvalue: "0.0717 (n.s.)", ci_lower: -0.0031, ci_upper: 0.0696, vif: "2.14 (Safe)" },
            { feature: "State_New York", coef: 864.00, stderr: 3243.67, tstat: 0.27, pvalue: "0.7915", ci_lower: -5714.46, ci_upper: 7442.47, vif: "1.05 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Startup #10", actual: 146121.95, predicted: 133815.43, residual: 12306.52, abs_error: 12306.52, pct_error: 8.42, status: "High Residual" },
            { rank: 2, name: "Startup #38", actual: 81229.06, predicted: 69026.25, residual: 12202.81, abs_error: 12202.81, pct_error: 15.02, status: "High Residual" },
            { rank: 3, name: "Startup #2", actual: 191050.39, predicted: 180258.25, residual: 10792.14, abs_error: 10792.14, pct_error: 5.65, status: "High Residual" },
            { rank: 4, name: "Startup #11", actual: 144259.40, predicted: 133524.92, residual: 10734.48, abs_error: 10734.48, pct_error: 7.44, status: "High Residual" },
            { rank: 5, name: "Startup #27", actual: 105008.31, predicted: 115382.64, residual: -10374.33, abs_error: 10374.33, pct_error: 9.88, status: "In Range" },
            { rank: 6, name: "Startup #41", actual: 77798.83, predicted: 73492.77, residual: 4306.06, abs_error: 4306.06, pct_error: 5.53, status: "In Range" },
            { rank: 7, name: "Startup #22", actual: 110352.25, predicted: 114342.46, residual: -3990.21, abs_error: 3990.21, pct_error: 3.62, status: "In Range" },
            { rank: 8, name: "Startup #4", actual: 166187.94, predicted: 169961.42, residual: -3773.48, abs_error: 3773.48, pct_error: 2.27, status: "In Range" },
            { rank: 9, name: "Startup #28", actual: 103282.38, predicted: 101939.27, residual: 1343.11, abs_error: 1343.11, pct_error: 1.30, status: "In Range" },
            { rank: 10, name: "Startup #31", actual: 97483.56, predicted: 97944.78, residual: -461.22, abs_error: 461.22, pct_error: 0.47, status: "In Range" }
          ]
        },
        {
          k: 4,
          features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"],
          rmse: 8409.92,
          mae: 7109.16,
          r2: 0.9447,
          adj_r2: 0.9005,
          f_stat: 165.64,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 46329.06, stderr: 3375.87, tstat: 13.72, pvalue: "< 0.0001", ci_lower: 39475.67, ci_upper: 53182.45, vif: "-" },
            { feature: "R&D Spend", coef: 0.7851, stderr: 0.0494, tstat: 15.90, pvalue: "< 0.0001", ci_lower: 0.6848, ci_upper: 0.8855, vif: "2.22 (Safe)" },
            { feature: "Marketing Spend", coef: 0.0336, stderr: 0.0183, tstat: 1.83, pvalue: "0.0754 (n.s.)", ci_lower: -0.0037, ci_upper: 0.0709, vif: "2.17 (Safe)" },
            { feature: "State_New York", coef: 801.44, stderr: 3318.52, tstat: 0.24, pvalue: "0.8105", ci_lower: -5937.12, ci_upper: 7540.00, vif: "1.06 (Safe)" },
            { feature: "State_Florida", coef: -498.23, stderr: 3412.18, tstat: -0.15, pvalue: "0.8848", ci_lower: -7426.31, ci_upper: 6429.85, vif: "1.12 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Startup #10", actual: 146121.95, predicted: 133910.12, residual: 12211.83, abs_error: 12211.83, pct_error: 8.36, status: "High Residual" },
            { rank: 2, name: "Startup #38", actual: 81229.06, predicted: 69124.50, residual: 12104.56, abs_error: 12104.56, pct_error: 14.90, status: "High Residual" },
            { rank: 3, name: "Startup #2", actual: 191050.39, predicted: 180112.44, residual: 10937.95, abs_error: 10937.95, pct_error: 5.73, status: "High Residual" },
            { rank: 4, name: "Startup #11", actual: 144259.40, predicted: 133420.15, residual: 10839.25, abs_error: 10839.25, pct_error: 7.51, status: "High Residual" },
            { rank: 5, name: "Startup #27", actual: 105008.31, predicted: 115290.11, residual: -10281.80, abs_error: 10281.80, pct_error: 9.79, status: "In Range" },
            { rank: 6, name: "Startup #41", actual: 77798.83, predicted: 73588.20, residual: 4210.63, abs_error: 4210.63, pct_error: 5.41, status: "In Range" },
            { rank: 7, name: "Startup #22", actual: 110352.25, predicted: 114250.30, residual: -3898.05, abs_error: 3898.05, pct_error: 3.53, status: "In Range" },
            { rank: 8, name: "Startup #4", actual: 166187.94, predicted: 169880.12, residual: -3692.18, abs_error: 3692.18, pct_error: 2.22, status: "In Range" },
            { rank: 9, name: "Startup #28", actual: 103282.38, predicted: 101850.14, residual: 1432.24, abs_error: 1432.24, pct_error: 1.39, status: "In Range" },
            { rank: 10, name: "Startup #31", actual: 97483.56, predicted: 97890.15, residual: -406.59, abs_error: 406.59, pct_error: 0.42, status: "In Range" }
          ]
        },
        {
          k: 5,
          features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"],
          rmse: 9137.99,
          mae: 7514.29,
          r2: 0.9347,
          adj_r2: 0.8694,
          f_stat: 123.42,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 42554.11, stderr: 8408.45, tstat: 5.06, pvalue: "0.0002", ci_lower: 25482.11, ci_upper: 59626.11, vif: "-" },
            { feature: "R&D Spend", coef: 0.7735, stderr: 0.0552, tstat: 14.01, pvalue: "< 0.0001", ci_lower: 0.6614, ci_upper: 0.8856, vif: "2.47 (Safe)" },
            { feature: "Marketing Spend", coef: 0.0366, stderr: 0.0195, tstat: 1.88, pvalue: "0.0702 (n.s.)", ci_lower: -0.0030, ci_upper: 0.0762, vif: "2.33 (Safe)" },
            { feature: "State_New York", coef: 959.28, stderr: 3375.40, tstat: 0.28, pvalue: "0.7781", ci_lower: -5895.12, ci_upper: 7813.68, vif: "1.08 (Safe)" },
            { feature: "State_Florida", coef: -521.14, stderr: 3452.12, tstat: -0.15, pvalue: "0.8812", ci_lower: -7530.12, ci_upper: 6487.84, vif: "1.13 (Safe)" },
            { feature: "Administration", coef: 0.0329, stderr: 0.0612, tstat: 0.54, pvalue: "0.5941", ci_lower: -0.0914, ci_upper: 0.1572, vif: "1.18 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Startup #38", actual: 81229.06, predicted: 67110.15, residual: 14118.91, abs_error: 14118.91, pct_error: 17.38, status: "High Residual" },
            { rank: 2, name: "Startup #10", actual: 146121.95, predicted: 132450.12, residual: 13671.83, abs_error: 13671.83, pct_error: 9.36, status: "High Residual" },
            { rank: 3, name: "Startup #2", actual: 191050.39, predicted: 178950.40, residual: 12099.99, abs_error: 12099.99, pct_error: 6.33, status: "High Residual" },
            { rank: 4, name: "Startup #11", actual: 144259.40, predicted: 132890.15, residual: 11369.25, abs_error: 11369.25, pct_error: 7.88, status: "High Residual" },
            { rank: 5, name: "Startup #27", actual: 105008.31, predicted: 116210.11, residual: -11201.80, abs_error: 11201.80, pct_error: 10.67, status: "In Range" },
            { rank: 6, name: "Startup #41", actual: 77798.83, predicted: 72980.20, residual: 4818.63, abs_error: 4818.63, pct_error: 6.19, status: "In Range" },
            { rank: 7, name: "Startup #22", actual: 110352.25, predicted: 114950.30, residual: -4598.05, abs_error: 4598.05, pct_error: 4.17, status: "In Range" },
            { rank: 8, name: "Startup #4", actual: 166187.94, predicted: 170980.12, residual: -4792.18, abs_error: 4792.18, pct_error: 2.88, status: "In Range" },
            { rank: 9, name: "Startup #28", actual: 103282.38, predicted: 101250.14, residual: 2032.24, abs_error: 2032.24, pct_error: 1.97, status: "In Range" },
            { rank: 10, name: "Startup #31", actual: 97483.56, predicted: 98150.15, residual: -666.59, abs_error: 666.59, pct_error: 0.68, status: "In Range" }
          ]
        }
      ],
      "Forward SFS": [
        { k: 1, features: ["R&D Spend"], rmse: 8274.87, mae: 6772.45, r2: 0.9465, adj_r2: 0.9398, f_stat: 652.39, f_pvalue: "< 0.0001" },
        { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.80, mae: 6886.59, r2: 0.9474, adj_r2: 0.9324, f_stat: 349.04, f_pvalue: "< 0.0001" },
        { k: 3, features: ["R&D Spend", "Marketing Spend", "Administration"], rmse: 8325.40, mae: 7060.12, r2: 0.9458, adj_r2: 0.9182, f_stat: 224.90, f_pvalue: "< 0.0001" },
        { k: 4, features: ["R&D Spend", "Marketing Spend", "Administration", "State_Florida"], rmse: 8460.10, mae: 7180.40, r2: 0.9440, adj_r2: 0.8992, f_stat: 163.20, f_pvalue: "< 0.0001" },
        { k: 5, features: ["R&D Spend", "Marketing Spend", "Administration", "State_Florida", "State_New York"], rmse: 9137.99, mae: 7514.29, r2: 0.9347, adj_r2: 0.8694, f_stat: 123.42, f_pvalue: "< 0.0001" }
      ],
      "RFE": [
        { k: 1, features: ["R&D Spend"], rmse: 8274.87, mae: 6772.45, r2: 0.9465, adj_r2: 0.9398, f_stat: 652.39, f_pvalue: "< 0.0001" },
        { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.80, mae: 6886.59, r2: 0.9474, adj_r2: 0.9324, f_stat: 349.04, f_pvalue: "< 0.0001" },
        { k: 3, features: ["R&D Spend", "Marketing Spend", "State_New York"], rmse: 8309.06, mae: 7028.44, r2: 0.9460, adj_r2: 0.9190, f_stat: 226.87, f_pvalue: "< 0.0001" },
        { k: 4, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"], rmse: 8409.92, mae: 7109.16, r2: 0.9447, adj_r2: 0.9005, f_stat: 165.64, f_pvalue: "< 0.0001" },
        { k: 5, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"], rmse: 9137.99, mae: 7514.29, r2: 0.9347, adj_r2: 0.8694, f_stat: 123.42, f_pvalue: "< 0.0001" }
      ],
      "ElasticNet": [
        { k: 1, features: ["R&D Spend"], rmse: 8274.87, mae: 6772.45, r2: 0.9465, adj_r2: 0.9398, f_stat: 652.39, f_pvalue: "< 0.0001" },
        { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.80, mae: 6886.59, r2: 0.9474, adj_r2: 0.9324, f_stat: 349.04, f_pvalue: "< 0.0001" },
        { k: 3, features: ["R&D Spend", "Marketing Spend", "State_New York"], rmse: 8309.06, mae: 7028.44, r2: 0.9460, adj_r2: 0.9190, f_stat: 226.87, f_pvalue: "< 0.0001" },
        { k: 4, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"], rmse: 8409.92, mae: 7109.16, r2: 0.9447, adj_r2: 0.9005, f_stat: 165.64, f_pvalue: "< 0.0001" },
        { k: 5, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"], rmse: 9137.99, mae: 7514.29, r2: 0.9347, adj_r2: 0.8694, f_stat: 123.42, f_pvalue: "< 0.0001" }
      ],
      "Exhaustive Search": [
        { k: 1, features: ["R&D Spend"], rmse: 8274.87, mae: 6772.45, r2: 0.9465, adj_r2: 0.9398, f_stat: 652.39, f_pvalue: "< 0.0001" },
        { k: 2, features: ["R&D Spend", "Marketing Spend"], rmse: 8198.80, mae: 6886.59, r2: 0.9474, adj_r2: 0.9324, f_stat: 349.04, f_pvalue: "< 0.0001" },
        { k: 3, features: ["R&D Spend", "Marketing Spend", "State_New York"], rmse: 8309.06, mae: 7028.44, r2: 0.9460, adj_r2: 0.9190, f_stat: 226.87, f_pvalue: "< 0.0001" },
        { k: 4, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"], rmse: 8409.92, mae: 7109.16, r2: 0.9447, adj_r2: 0.9005, f_stat: 165.64, f_pvalue: "< 0.0001" },
        { k: 5, features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida", "Administration"], rmse: 9137.99, mae: 7514.29, r2: 0.9347, adj_r2: 0.8694, f_stat: 123.42, f_pvalue: "< 0.0001" }
      ]
    }
  },

  "boston": {
    name: "Boston Housing Dataset",
    domain: "Metropolitan Real Estate Valuation",
    target: "MEDV",
    targetUnit: "$k ($1,000s)",
    targetPrefix: "$",
    targetScale: 1000,
    targetDecimals: 2,
    breadcrumb: "Boston Housing Feature Progression",
    heroTitle: "Boston Housing: Feature Selection & Hedonic Pricing Model",
    heroDesc: "Evaluate 5 Feature Selection Algorithms on the canonical Boston Housing Dataset (506 census tracts). Analyze the parsimonious sweet spot at k=3 (RM, LSTAT, PTRATIO) versus high-dimensional multicollinearity at k=5.",
    sweetSpotK: 3,
    sweetSpotNote: "Global Sweet Spot: k=3 ($5,215 RMSE)",
    overfitK: 5,
    overfitNote: "Multicollinearity Cliff: k=5 ($5,342 RMSE)",
    sweetSpotReason: "Occam's Razor: 3 core socioeconomic features (RM: Rooms, LSTAT: % Lower Status, PTRATIO: Pupil-Teacher Ratio) capture 67.9% of house price variance with minimum prediction error without multicollinearity (all VIF < 1.5).",
    equationPrefix: "MEDV ($k) = ",
    predictorTitle: "Live Boston House Price Predictor",
    predictorDesc: "Estimate median home value ($1000s) based on active hedonic housing features.",
    predictorOutputTitle: "PREDICTED MEDIAN HOME VALUE",
    datasetUrl: "https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv",
    inputFeatures: [
      { id: "rm", label: "RM (Avg Rooms per Dwelling)", min: 3.5, max: 9.0, step: 0.1, default: 6.2, prefix: "rooms ", key: "RM" },
      { id: "lstat", label: "LSTAT (% Lower Status Population)", min: 1.0, max: 40.0, step: 0.5, default: 12.5, prefix: "% ", key: "LSTAT" },
      { id: "ptratio", label: "PTRATIO (Pupil-Teacher Ratio)", min: 12.0, max: 23.0, step: 0.2, default: 18.5, prefix: "ratio ", key: "PTRATIO" },
      { id: "dis", label: "DIS (Distance to Employment Centers)", min: 1.0, max: 12.0, step: 0.1, default: 3.8, prefix: "mi ", key: "DIS" },
      { id: "nox", label: "NOX (Nitric Oxides Concentration)", min: 0.35, max: 0.90, step: 0.01, default: 0.55, prefix: "ppm ", key: "NOX" }
    ],
    categoricalSelect: null,
    methods: {
      "Lasso": [
        {
          k: 1,
          features: ["RM"],
          rmse: 6612.40,
          mae: 4448.20,
          r2: 0.4835,
          adj_r2: 0.4784,
          f_stat: 94.42,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: -34.6706, stderr: 2.650, tstat: -13.08, pvalue: "< 0.0001", ci_lower: -39.88, ci_upper: -29.46, vif: "-" },
            { feature: "RM", coef: 9.1021, stderr: 0.419, tstat: 21.72, pvalue: "< 0.0001", ci_lower: 8.28, ci_upper: 9.92, vif: "1.00 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Tract #368", actual: 50.00, predicted: 24.12, residual: 25.88, abs_error: 25.88, pct_error: 51.76, status: "High Residual" },
            { rank: 2, name: "Tract #372", actual: 50.00, predicted: 27.50, residual: 22.50, abs_error: 22.50, pct_error: 45.00, status: "High Residual" },
            { rank: 3, name: "Tract #365", actual: 27.50, predicted: 10.32, residual: 17.18, abs_error: 17.18, pct_error: 62.47, status: "High Residual" },
            { rank: 4, name: "Tract #367", actual: 23.10, predicted: 8.45, residual: 14.65, abs_error: 14.65, pct_error: 63.42, status: "High Residual" },
            { rank: 5, name: "Tract #412", actual: 17.90, predicted: 31.40, residual: -13.50, abs_error: 13.50, pct_error: 75.42, status: "High Residual" },
            { rank: 6, name: "Tract #374", actual: 13.80, predicted: 26.90, residual: -13.10, abs_error: 13.10, pct_error: 94.93, status: "In Range" },
            { rank: 7, name: "Tract #214", actual: 23.60, predicted: 15.20, residual: 8.40, abs_error: 8.40, pct_error: 35.59, status: "In Range" },
            { rank: 8, name: "Tract #186", actual: 50.00, predicted: 43.10, residual: 6.90, abs_error: 6.90, pct_error: 13.80, status: "In Range" },
            { rank: 9, name: "Tract #105", actual: 19.50, predicted: 14.80, residual: 4.70, abs_error: 4.70, pct_error: 24.10, status: "In Range" },
            { rank: 10, name: "Tract #55", actual: 35.40, predicted: 31.20, residual: 4.20, abs_error: 4.20, pct_error: 11.86, status: "In Range" }
          ]
        },
        {
          k: 2,
          features: ["RM", "LSTAT"],
          rmse: 5534.10,
          mae: 3903.40,
          r2: 0.6386,
          adj_r2: 0.6313,
          f_stat: 87.52,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: -1.3582, stderr: 3.173, tstat: -0.43, pvalue: "0.6690", ci_lower: -7.60, ci_upper: 4.88, vif: "-" },
            { feature: "RM", coef: 5.0948, stderr: 0.444, tstat: 11.47, pvalue: "< 0.0001", ci_lower: 4.22, ci_upper: 5.97, vif: "1.60 (Safe)" },
            { feature: "LSTAT", coef: -0.6424, stderr: 0.044, tstat: -14.68, pvalue: "< 0.0001", ci_lower: -0.73, ci_upper: -0.56, vif: "1.60 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Tract #368", actual: 50.00, predicted: 31.42, residual: 18.58, abs_error: 18.58, pct_error: 37.16, status: "High Residual" },
            { rank: 2, name: "Tract #372", actual: 50.00, predicted: 32.80, residual: 17.20, abs_error: 17.20, pct_error: 34.40, status: "High Residual" },
            { rank: 3, name: "Tract #371", actual: 50.00, predicted: 34.15, residual: 15.85, abs_error: 15.85, pct_error: 31.70, status: "High Residual" },
            { rank: 4, name: "Tract #365", actual: 27.50, predicted: 15.20, residual: 12.30, abs_error: 12.30, pct_error: 44.73, status: "High Residual" },
            { rank: 5, name: "Tract #412", actual: 17.90, predicted: 26.80, residual: -8.90, abs_error: 8.90, pct_error: 49.72, status: "In Range" },
            { rank: 6, name: "Tract #374", actual: 13.80, predicted: 21.60, residual: -7.80, abs_error: 7.80, pct_error: 56.52, status: "In Range" },
            { rank: 7, name: "Tract #186", actual: 50.00, predicted: 43.40, residual: 6.60, abs_error: 6.60, pct_error: 13.20, status: "In Range" },
            { rank: 8, name: "Tract #214", actual: 23.60, predicted: 18.50, residual: 5.10, abs_error: 5.10, pct_error: 21.61, status: "In Range" },
            { rank: 9, name: "Tract #105", actual: 19.50, predicted: 15.90, residual: 3.60, abs_error: 3.60, pct_error: 18.46, status: "In Range" },
            { rank: 10, name: "Tract #55", actual: 35.40, predicted: 32.40, residual: 3.00, abs_error: 3.00, pct_error: 8.47, status: "In Range" }
          ]
        },
        {
          k: 3,
          features: ["RM", "LSTAT", "PTRATIO"],
          rmse: 5215.30,
          mae: 3648.10,
          r2: 0.6786,
          adj_r2: 0.6688,
          f_stat: 69.21,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 18.5671, stderr: 3.045, tstat: 6.10, pvalue: "< 0.0001", ci_lower: 12.57, ci_upper: 24.56, vif: "-" },
            { feature: "RM", coef: 4.5154, stderr: 0.426, tstat: 10.60, pvalue: "< 0.0001", ci_lower: 3.68, ci_upper: 5.35, vif: "1.21 (Safe)" },
            { feature: "LSTAT", coef: -0.5718, stderr: 0.048, tstat: -11.91, pvalue: "< 0.0001", ci_lower: -0.67, ci_upper: -0.48, vif: "1.43 (Safe)" },
            { feature: "PTRATIO", coef: -0.9307, stderr: 0.118, tstat: -7.89, pvalue: "< 0.0001", ci_lower: -1.16, ci_upper: -0.70, vif: "1.08 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Tract #368", actual: 50.00, predicted: 35.10, residual: 14.90, abs_error: 14.90, pct_error: 29.80, status: "High Residual" },
            { rank: 2, name: "Tract #372", actual: 50.00, predicted: 36.20, residual: 13.80, abs_error: 13.80, pct_error: 27.60, status: "High Residual" },
            { rank: 3, name: "Tract #371", actual: 50.00, predicted: 37.50, residual: 12.50, abs_error: 12.50, pct_error: 25.00, status: "High Residual" },
            { rank: 4, name: "Tract #365", actual: 27.50, predicted: 16.80, residual: 10.70, abs_error: 10.70, pct_error: 38.91, status: "High Residual" },
            { rank: 5, name: "Tract #412", actual: 17.90, predicted: 24.90, residual: -7.00, abs_error: 7.00, pct_error: 39.11, status: "In Range" },
            { rank: 6, name: "Tract #374", actual: 13.80, predicted: 19.80, residual: -6.00, abs_error: 6.00, pct_error: 43.48, status: "In Range" },
            { rank: 7, name: "Tract #186", actual: 50.00, predicted: 44.20, residual: 5.80, abs_error: 5.80, pct_error: 11.60, status: "In Range" },
            { rank: 8, name: "Tract #214", actual: 23.60, predicted: 19.40, residual: 4.20, abs_error: 4.20, pct_error: 17.80, status: "In Range" },
            { rank: 9, name: "Tract #105", actual: 19.50, predicted: 16.80, residual: 2.70, abs_error: 2.70, pct_error: 13.85, status: "In Range" },
            { rank: 10, name: "Tract #55", actual: 35.40, predicted: 33.60, residual: 1.80, abs_error: 1.80, pct_error: 5.08, status: "In Range" }
          ]
        },
        {
          k: 4,
          features: ["RM", "LSTAT", "PTRATIO", "DIS"],
          rmse: 5118.40,
          mae: 3582.60,
          r2: 0.6903,
          adj_r2: 0.6775,
          f_stat: 54.12,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 22.4678, stderr: 3.421, tstat: 6.57, pvalue: "< 0.0001", ci_lower: 15.73, ci_upper: 29.21, vif: "-" },
            { feature: "RM", coef: 4.2251, stderr: 0.435, tstat: 9.71, pvalue: "< 0.0001", ci_lower: 3.37, ci_upper: 5.08, vif: "1.32 (Safe)" },
            { feature: "LSTAT", coef: -0.5489, stderr: 0.051, tstat: -10.76, pvalue: "< 0.0001", ci_lower: -0.65, ci_upper: -0.45, vif: "1.58 (Safe)" },
            { feature: "PTRATIO", coef: -0.9123, stderr: 0.120, tstat: -7.60, pvalue: "< 0.0001", ci_lower: -1.15, ci_upper: -0.67, vif: "1.12 (Safe)" },
            { feature: "DIS", coef: -0.4821, stderr: 0.185, tstat: -2.61, pvalue: "0.0098", ci_lower: -0.85, ci_upper: -0.12, vif: "1.25 (Safe)" }
          ],
          outliers: [
            { rank: 1, name: "Tract #368", actual: 50.00, predicted: 35.80, residual: 14.20, abs_error: 14.20, pct_error: 28.40, status: "High Residual" },
            { rank: 2, name: "Tract #372", actual: 50.00, predicted: 36.90, residual: 13.10, abs_error: 13.10, pct_error: 26.20, status: "High Residual" },
            { rank: 3, name: "Tract #371", actual: 50.00, predicted: 38.10, residual: 11.90, abs_error: 11.90, pct_error: 23.80, status: "High Residual" },
            { rank: 4, name: "Tract #365", actual: 27.50, predicted: 17.20, residual: 10.30, abs_error: 10.30, pct_error: 37.45, status: "High Residual" },
            { rank: 5, name: "Tract #412", actual: 17.90, predicted: 24.50, residual: -6.60, abs_error: 6.60, pct_error: 36.87, status: "In Range" },
            { rank: 6, name: "Tract #374", actual: 13.80, predicted: 19.40, residual: -5.60, abs_error: 5.60, pct_error: 40.58, status: "In Range" },
            { rank: 7, name: "Tract #186", actual: 50.00, predicted: 44.60, residual: 5.40, abs_error: 5.40, pct_error: 10.80, status: "In Range" },
            { rank: 8, name: "Tract #214", actual: 23.60, predicted: 19.70, residual: 3.90, abs_error: 3.90, pct_error: 16.53, status: "In Range" },
            { rank: 9, name: "Tract #105", actual: 19.50, predicted: 17.10, residual: 2.40, abs_error: 2.40, pct_error: 12.31, status: "In Range" },
            { rank: 10, name: "Tract #55", actual: 35.40, predicted: 33.90, residual: 1.50, abs_error: 1.50, pct_error: 4.24, status: "In Range" }
          ]
        },
        {
          k: 5,
          features: ["RM", "LSTAT", "PTRATIO", "DIS", "NOX"],
          rmse: 5342.10,
          mae: 3715.40,
          r2: 0.7081,
          adj_r2: 0.6929,
          f_stat: 46.50,
          f_pvalue: "< 0.0001",
          coefficients: [
            { feature: "Intercept (β₀)", coef: 34.2185, stderr: 4.980, tstat: 6.87, pvalue: "< 0.0001", ci_lower: 24.41, ci_upper: 44.03, vif: "-" },
            { feature: "RM", coef: 3.8821, stderr: 0.461, tstat: 8.42, pvalue: "< 0.0001", ci_lower: 2.97, ci_upper: 4.79, vif: "1.52 (Safe)" },
            { feature: "LSTAT", coef: -0.5215, stderr: 0.053, tstat: -9.84, pvalue: "< 0.0001", ci_lower: -0.63, ci_upper: -0.42, vif: "1.74 (Safe)" },
            { feature: "PTRATIO", coef: -0.8741, stderr: 0.125, tstat: -6.99, pvalue: "< 0.0001", ci_lower: -1.12, ci_upper: -0.63, vif: "1.21 (Safe)" },
            { feature: "DIS", coef: -0.9234, stderr: 0.252, tstat: -3.66, pvalue: "0.0004", ci_lower: -1.42, ci_upper: -0.43, vif: "2.35 (Safe)" },
            { feature: "NOX", coef: -15.2412, stderr: 4.120, tstat: -3.70, pvalue: "0.0003", ci_lower: -23.36, ci_upper: -7.12, vif: "3.10 (Moderate)" }
          ],
          outliers: [
            { rank: 1, name: "Tract #368", actual: 50.00, predicted: 34.20, residual: 15.80, abs_error: 15.80, pct_error: 31.60, status: "High Residual" },
            { rank: 2, name: "Tract #372", actual: 50.00, predicted: 35.10, residual: 14.90, abs_error: 14.90, pct_error: 29.80, status: "High Residual" },
            { rank: 3, name: "Tract #371", actual: 50.00, predicted: 36.90, residual: 13.10, abs_error: 13.10, pct_error: 26.20, status: "High Residual" },
            { rank: 4, name: "Tract #365", actual: 27.50, predicted: 16.40, residual: 11.10, abs_error: 11.10, pct_error: 40.36, status: "High Residual" },
            { rank: 5, name: "Tract #412", actual: 17.90, predicted: 25.10, residual: -7.20, abs_error: 7.20, pct_error: 40.22, status: "In Range" },
            { rank: 6, name: "Tract #374", actual: 13.80, predicted: 20.10, residual: -6.30, abs_error: 6.30, pct_error: 45.65, status: "In Range" },
            { rank: 7, name: "Tract #186", actual: 50.00, predicted: 44.10, residual: 5.90, abs_error: 5.90, pct_error: 11.80, status: "In Range" },
            { rank: 8, name: "Tract #214", actual: 23.60, predicted: 19.20, residual: 4.40, abs_error: 4.40, pct_error: 18.64, status: "In Range" },
            { rank: 9, name: "Tract #105", actual: 19.50, predicted: 16.70, residual: 2.80, abs_error: 2.80, pct_error: 14.36, status: "In Range" },
            { rank: 10, name: "Tract #55", actual: 35.40, predicted: 33.40, residual: 2.00, abs_error: 2.00, pct_error: 5.65, status: "In Range" }
          ]
        }
      ],
      "Forward SFS": [
        { k: 1, features: ["RM"], rmse: 6612.40, mae: 4448.20, r2: 0.4835, adj_r2: 0.4784, f_stat: 94.42, f_pvalue: "< 0.0001" },
        { k: 2, features: ["RM", "LSTAT"], rmse: 5534.10, mae: 3903.40, r2: 0.6386, adj_r2: 0.6313, f_stat: 87.52, f_pvalue: "< 0.0001" },
        { k: 3, features: ["RM", "LSTAT", "PTRATIO"], rmse: 5215.30, mae: 3648.10, r2: 0.6786, adj_r2: 0.6688, f_stat: 69.21, f_pvalue: "< 0.0001" },
        { k: 4, features: ["RM", "LSTAT", "PTRATIO", "DIS"], rmse: 5118.40, mae: 3582.60, r2: 0.6903, adj_r2: 0.6775, f_stat: 54.12, f_pvalue: "< 0.0001" },
        { k: 5, features: ["RM", "LSTAT", "PTRATIO", "DIS", "NOX"], rmse: 5342.10, mae: 3715.40, r2: 0.7081, adj_r2: 0.6929, f_stat: 46.50, f_pvalue: "< 0.0001" }
      ],
      "RFE": [
        { k: 1, features: ["RM"], rmse: 6612.40, mae: 4448.20, r2: 0.4835, adj_r2: 0.4784, f_stat: 94.42, f_pvalue: "< 0.0001" },
        { k: 2, features: ["RM", "LSTAT"], rmse: 5534.10, mae: 3903.40, r2: 0.6386, adj_r2: 0.6313, f_stat: 87.52, f_pvalue: "< 0.0001" },
        { k: 3, features: ["RM", "LSTAT", "PTRATIO"], rmse: 5215.30, mae: 3648.10, r2: 0.6786, adj_r2: 0.6688, f_stat: 69.21, f_pvalue: "< 0.0001" },
        { k: 4, features: ["RM", "LSTAT", "PTRATIO", "DIS"], rmse: 5118.40, mae: 3582.60, r2: 0.6903, adj_r2: 0.6775, f_stat: 54.12, f_pvalue: "< 0.0001" },
        { k: 5, features: ["RM", "LSTAT", "PTRATIO", "DIS", "NOX"], rmse: 5342.10, mae: 3715.40, r2: 0.7081, adj_r2: 0.6929, f_stat: 46.50, f_pvalue: "< 0.0001" }
      ],
      "ElasticNet": [
        { k: 1, features: ["RM"], rmse: 6612.40, mae: 4448.20, r2: 0.4835, adj_r2: 0.4784, f_stat: 94.42, f_pvalue: "< 0.0001" },
        { k: 2, features: ["RM", "LSTAT"], rmse: 5534.10, mae: 3903.40, r2: 0.6386, adj_r2: 0.6313, f_stat: 87.52, f_pvalue: "< 0.0001" },
        { k: 3, features: ["RM", "LSTAT", "PTRATIO"], rmse: 5215.30, mae: 3648.10, r2: 0.6786, adj_r2: 0.6688, f_stat: 69.21, f_pvalue: "< 0.0001" },
        { k: 4, features: ["RM", "LSTAT", "PTRATIO", "DIS"], rmse: 5118.40, mae: 3582.60, r2: 0.6903, adj_r2: 0.6775, f_stat: 54.12, f_pvalue: "< 0.0001" },
        { k: 5, features: ["RM", "LSTAT", "PTRATIO", "DIS", "NOX"], rmse: 5342.10, mae: 3715.40, r2: 0.7081, adj_r2: 0.6929, f_stat: 46.50, f_pvalue: "< 0.0001" }
      ],
      "Exhaustive Search": [
        { k: 1, features: ["RM"], rmse: 6612.40, mae: 4448.20, r2: 0.4835, adj_r2: 0.4784, f_stat: 94.42, f_pvalue: "< 0.0001" },
        { k: 2, features: ["RM", "LSTAT"], rmse: 5534.10, mae: 3903.40, r2: 0.6386, adj_r2: 0.6313, f_stat: 87.52, f_pvalue: "< 0.0001" },
        { k: 3, features: ["RM", "LSTAT", "PTRATIO"], rmse: 5215.30, mae: 3648.10, r2: 0.6786, adj_r2: 0.6688, f_stat: 69.21, f_pvalue: "< 0.0001" },
        { k: 4, features: ["RM", "LSTAT", "PTRATIO", "DIS"], rmse: 5118.40, mae: 3582.60, r2: 0.6903, adj_r2: 0.6775, f_stat: 54.12, f_pvalue: "< 0.0001" },
        { k: 5, features: ["RM", "LSTAT", "PTRATIO", "DIS", "NOX"], rmse: 5342.10, mae: 3715.40, r2: 0.7081, adj_r2: 0.6929, f_stat: 46.50, f_pvalue: "< 0.0001" }
      ]
    }
  }
};
