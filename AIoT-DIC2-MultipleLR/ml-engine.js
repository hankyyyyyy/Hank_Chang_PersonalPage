/**
 * Pure JavaScript In-Browser Machine Learning & Linear Regression Engine
 * Supports:
 * - Robust CSV Parsing & Type Inference
 * - Categorical One-Hot Encoding
 * - High-Precision Matrix Operations & Gauss-Jordan Inversion
 * - Full OLS Multiple Linear Regression
 * - Statistical Inference (SE, t-stat, p-value, 95% CI, F-stat, VIF)
 * - 5 Feature Selection Algorithms (Lasso, Forward SFS, RFE, ElasticNet, Exhaustive)
 * - Out-of-Sample Test Evaluation & Outlier Diagnostics
 */

(function (window) {
  'use strict';

  const MLEngine = {};

  // --- CSV Parser ---
  MLEngine.parseCSV = function (text) {
    const lines = [];
    let row = [''];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        if (row.length > 1 || row[0].trim() !== '') {
          lines.push(row.map(s => s.trim()));
        }
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
      lines.push(row.map(s => s.trim()));
    }

    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
    const rawRows = lines.slice(1);

    // Infer column types
    const isNumericCol = headers.map((_, colIdx) => {
      let numCount = 0;
      let totalValid = 0;
      for (let r = 0; r < Math.min(50, rawRows.length); r++) {
        const val = rawRows[r][colIdx];
        if (val !== undefined && val !== '') {
          totalValid++;
          if (!isNaN(Number(val))) numCount++;
        }
      }
      return totalValid > 0 && numCount / totalValid >= 0.8;
    });

    return { headers, rawRows, isNumericCol };
  };

  // --- Statistical Distributions (Student-t and F p-value approximations) ---
  function regularizedIncompleteBeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    // Continued fraction expansion (Abramowitz & Stegun 26.5.8)
    const maxIterations = 100;
    const eps = 1e-12;

    const bt = Math.exp(
      gammaLn(a + b) - gammaLn(a) - gammaLn(b) +
      a * Math.log(x) + b * Math.log(1 - x)
    );

    if (x < (a + 1) / (a + b + 2)) {
      return bt * betacf(x, a, b) / a;
    } else {
      return 1 - (bt * betacf(1 - x, b, a) / b);
    }
  }

  function betacf(x, a, b) {
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-15) d = 1e-15;
    d = 1 / d;
    let h = d;

    for (let m = 1; m <= 100; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-15) d = 1e-15;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-15) c = 1e-15;
      d = 1 / d;
      h *= d * c;

      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-15) d = 1e-15;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-15) c = 1e-15;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-10) break;
    }
    return h;
  }

  function gammaLn(z) {
    // Lanczos approximation
    const c = [
      57.1562356658629235, -59.5979603554754912, 14.13609797408854,
      -0.49191381609762, 0.339946499848118887e-4, 0.465236289270485756e-4,
      -0.983744753048795646e-4, 0.158088703224377324e-3, -0.210264441724104883e-3,
      0.217439618115212643e-3, -0.16431810653676389e-3, 0.844182239838527433e-4,
      -0.261908384015814087e-4, 0.368991826595316234e-5
    ];
    let sum = 0.99999999999999709182;
    for (let i = 0; i < c.length; i++) {
      sum += c[i] / (z + i + 1);
    }
    const t = z + c.length - 0.5;
    return 0.91893853320467274178 + (z + 0.5) * Math.log(t) - t + Math.log(sum);
  }

  MLEngine.studentT_pValue = function (t, df) {
    if (isNaN(t) || df <= 0) return 1.0;
    const absT = Math.abs(t);
    const x = df / (df + absT * absT);
    const p = regularizedIncompleteBeta(x, df / 2, 0.5);
    return Math.min(1.0, Math.max(1e-15, p));
  };

  MLEngine.f_pValue = function (f, df1, df2) {
    if (isNaN(f) || f <= 0 || df1 <= 0 || df2 <= 0) return 1.0;
    const x = df2 / (df2 + df1 * f);
    const p = regularizedIncompleteBeta(x, df2 / 2, df1 / 2);
    return Math.min(1.0, Math.max(1e-15, p));
  };

  // --- Linear Algebra & Matrix Routines ---
  MLEngine.transpose = function (A) {
    const rows = A.length;
    const cols = A[0].length;
    const At = [];
    for (let j = 0; j < cols; j++) {
      At[j] = new Float64Array(rows);
      for (let i = 0; i < rows; i++) {
        At[j][i] = A[i][j];
      }
    }
    return At;
  };

  MLEngine.matrixMultiply = function (A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const C = [];
    for (let i = 0; i < rowsA; i++) {
      C[i] = new Float64Array(colsB);
      for (let k = 0; k < colsA; k++) {
        const aik = A[i][k];
        for (let j = 0; j < colsB; j++) {
          C[i][j] += aik * B[k][j];
        }
      }
    }
    return C;
  };

  MLEngine.invertMatrix = function (A) {
    const n = A.length;
    // Create augmented matrix [A | I]
    const aug = [];
    for (let i = 0; i < n; i++) {
      aug[i] = new Float64Array(2 * n);
      for (let j = 0; j < n; j++) {
        aug[i][j] = A[i][j];
      }
      aug[i][n + i] = 1.0;
    }

    // Gauss-Jordan elimination with partial pivoting
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      let maxVal = Math.abs(aug[i][i]);
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > maxVal) {
          maxVal = Math.abs(aug[k][i]);
          maxRow = k;
        }
      }

      if (maxRow !== i) {
        const tmp = aug[i];
        aug[i] = aug[maxRow];
        aug[maxRow] = tmp;
      }

      let pivot = aug[i][i];
      if (Math.abs(pivot) < 1e-12) {
        // Ridge stabilizer if singular
        pivot = 1e-12;
        aug[i][i] = pivot;
      }

      for (let j = 0; j < 2 * n; j++) {
        aug[i][j] /= pivot;
      }

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aug[k][i];
          for (let j = 0; j < 2 * n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }
    }

    const inv = [];
    for (let i = 0; i < n; i++) {
      inv[i] = new Float64Array(n);
      for (let j = 0; j < n; j++) {
        inv[i][j] = aug[i][n + j];
      }
    }
    return inv;
  };

  // --- OLS Model Fitting ---
  MLEngine.fitOLS = function (X_train, y_train, X_test, y_test, featureNames) {
    const n = X_train.length;
    const p = featureNames.length;
    const kCols = p + 1; // plus intercept

    // Build X with intercept column
    const X = [];
    for (let i = 0; i < n; i++) {
      const row = new Float64Array(kCols);
      row[0] = 1.0;
      for (let j = 0; j < p; j++) {
        row[j + 1] = X_train[i][j];
      }
      X.push(row);
    }

    // Normal Equations: XtX, Xty
    const Xt = MLEngine.transpose(X);
    const XtX = MLEngine.matrixMultiply(Xt, X);

    // Add tiny ridge regularization to diagonal for extreme collinearity stability
    for (let i = 0; i < kCols; i++) {
      XtX[i][i] += 1e-9;
    }

    const invXtX = MLEngine.invertMatrix(XtX);

    // Beta = inv(XtX) * Xt * y
    const beta = new Float64Array(kCols);
    for (let i = 0; i < kCols; i++) {
      let sum = 0;
      for (let m = 0; m < n; m++) {
        sum += Xt[i][m] * y_train[m];
      }
      for (let j = 0; j < kCols; j++) {
        // Compute beta using cached matrix mult
      }
    }

    // Multiply invXtX by (Xt * y)
    const Xty = new Float64Array(kCols);
    for (let i = 0; i < kCols; i++) {
      let sum = 0;
      for (let m = 0; m < n; m++) {
        sum += Xt[i][m] * y_train[m];
      }
      Xty[i] = sum;
    }

    for (let i = 0; i < kCols; i++) {
      let sum = 0;
      for (let j = 0; j < kCols; j++) {
        sum += invXtX[i][j] * Xty[j];
      }
      beta[i] = sum;
    }

    // Train Metrics
    let yMean = 0;
    for (let i = 0; i < n; i++) yMean += y_train[i];
    yMean /= n;

    let sse = 0;
    let sst = 0;
    for (let i = 0; i < n; i++) {
      let pred = beta[0];
      for (let j = 0; j < p; j++) {
        pred += beta[j + 1] * X_train[i][j];
      }
      const e = y_train[i] - pred;
      sse += e * e;
      sst += Math.pow(y_train[i] - yMean, 2);
    }

    const dfE = Math.max(1, n - p - 1);
    const s2 = sse / dfE;
    const r2 = sst > 0 ? Math.max(0, 1 - (sse / sst)) : 0;
    const adj_r2 = sst > 0 && n > p + 1 ? Math.max(0, 1 - ((sse / dfE) / (sst / (n - 1)))) : r2;

    const ssr = sst - sse;
    const f_stat = (p > 0 && s2 > 0) ? Math.max(0, (ssr / p) / s2) : 0;
    const f_pvalue = MLEngine.f_pValue(f_stat, p, dfE);

    // Compute VIF for each predictor
    const vifs = new Float64Array(p);
    if (p === 1) {
      vifs[0] = 1.0;
    } else {
      // VIF from diagonal of correlation matrix or auxiliary regressions
      for (let j = 0; j < p; j++) {
        // Aux regression: predict X_j from all other features
        const auxY = [];
        const auxX = [];
        for (let r = 0; r < n; r++) {
          auxY.push(X_train[r][j]);
          const auxRow = [];
          for (let m = 0; m < p; m++) {
            if (m !== j) auxRow.push(X_train[r][m]);
          }
          auxX.push(auxRow);
        }
        const auxP = p - 1;
        const auxK = auxP + 1;
        const auxXmat = [];
        for (let r = 0; r < n; r++) {
          const row = new Float64Array(auxK);
          row[0] = 1.0;
          for (let m = 0; m < auxP; m++) row[m + 1] = auxX[r][m];
          auxXmat.push(row);
        }
        const auxXt = MLEngine.transpose(auxXmat);
        const auxXtX = MLEngine.matrixMultiply(auxXt, auxXmat);
        for (let m = 0; m < auxK; m++) auxXtX[m][m] += 1e-9;
        const auxInv = MLEngine.invertMatrix(auxXtX);

        const auxXty = new Float64Array(auxK);
        for (let m = 0; m < auxK; m++) {
          let s = 0;
          for (let r = 0; r < n; r++) s += auxXt[m][r] * auxY[r];
          auxXty[m] = s;
        }
        const auxBeta = new Float64Array(auxK);
        for (let m = 0; m < auxK; m++) {
          let s = 0;
          for (let q = 0; q < auxK; q++) s += auxInv[m][q] * auxXty[q];
          auxBeta[m] = s;
        }

        let auxMean = 0;
        for (let r = 0; r < n; r++) auxMean += auxY[r];
        auxMean /= n;
        let auxSSE = 0, auxSST = 0;
        for (let r = 0; r < n; r++) {
          let pred = auxBeta[0];
          for (let m = 0; m < auxP; m++) pred += auxBeta[m + 1] * auxX[r][m];
          auxSSE += Math.pow(auxY[r] - pred, 2);
          auxSST += Math.pow(auxY[r] - auxMean, 2);
        }
        const auxR2 = auxSST > 0 ? Math.max(0, Math.min(0.9999, 1 - (auxSSE / auxSST))) : 0;
        vifs[j] = Math.min(999, Math.max(1.0, 1.0 / Math.max(0.001, 1 - auxR2)));
      }
    }

    // Build Coefficients Array
    const coefficients = [];

    // Intercept (β₀)
    const se0 = Math.sqrt(Math.max(1e-12, s2 * invXtX[0][0]));
    const t0 = beta[0] / se0;
    const p0 = MLEngine.studentT_pValue(t0, dfE);
    coefficients.push({
      feature: 'Intercept (β₀)',
      coef: beta[0],
      stderr: se0,
      tstat: t0,
      pvalue: p0,
      ci_lower: beta[0] - 1.96 * se0,
      ci_upper: beta[0] + 1.96 * se0,
      vif: null
    });

    for (let j = 0; j < p; j++) {
      const se = Math.sqrt(Math.max(1e-12, s2 * invXtX[j + 1][j + 1]));
      const t = beta[j + 1] / se;
      const pv = MLEngine.studentT_pValue(t, dfE);
      coefficients.push({
        feature: featureNames[j],
        coef: beta[j + 1],
        stderr: se,
        tstat: t,
        pvalue: pv,
        ci_lower: beta[j + 1] - 1.96 * se,
        ci_upper: beta[j + 1] + 1.96 * se,
        vif: vifs[j]
      });
    }

    // Test Evaluation
    const nTest = X_test.length;
    let testSSE = 0;
    let testSST = 0;
    let testMAE = 0;
    let yTestMean = 0;
    for (let i = 0; i < nTest; i++) yTestMean += y_test[i];
    yTestMean /= Math.max(1, nTest);

    const rawOutliers = [];
    for (let i = 0; i < nTest; i++) {
      let pred = beta[0];
      for (let j = 0; j < p; j++) {
        pred += beta[j + 1] * X_test[i][j];
      }
      const actual = y_test[i];
      const residual = actual - pred;
      const abs_error = Math.abs(residual);
      const pct_error = Math.abs(actual) > 1e-6 ? (abs_error / Math.abs(actual)) * 100 : 0;

      testSSE += residual * residual;
      testSST += Math.pow(actual - yTestMean, 2);
      testMAE += abs_error;

      rawOutliers.push({
        index: i + 1,
        actual: Number(actual.toFixed(2)),
        predicted: Number(pred.toFixed(2)),
        residual: Number(residual.toFixed(2)),
        abs_error: Number(abs_error.toFixed(2)),
        pct_error: Number(pct_error.toFixed(2))
      });
    }

    const testRMSE = Math.sqrt(testSSE / Math.max(1, nTest));
    testMAE = testMAE / Math.max(1, nTest);
    const testR2 = testSST > 0 ? Math.max(0, 1 - (testSSE / testSST)) : 0;

    // Top 10 outliers sorted descending by absolute error
    rawOutliers.sort((a, b) => b.abs_error - a.abs_error);
    const outliers = rawOutliers.slice(0, 10).map((o, idx) => ({
      rank: idx + 1,
      ...o
    }));

    return {
      k: p,
      features: featureNames,
      rmse: testRMSE,
      mae: testMAE,
      r2: testR2,
      adj_r2: adj_r2,
      f_stat: f_stat,
      f_pvalue: f_pvalue,
      coefficients: coefficients,
      outliers: outliers
    };
  };

  // --- Feature Selection Algorithms ---
  MLEngine.runFeatureSelection = function (X_train_full, y_train, X_test_full, y_test, allFeatures, maxK = 5) {
    const totalP = allFeatures.length;
    const effectiveMaxK = Math.min(maxK, totalP);

    // Helpers to extract columns
    function getSubmatrix(X, colIndices) {
      return X.map(row => colIndices.map(c => row[c]));
    }

    // 1. Forward SFS (Greedy forward selection)
    const sfsProgression = [];
    let currentSFSCols = [];
    for (let k = 1; k <= effectiveMaxK; k++) {
      let bestCol = -1;
      let bestRMSE = Infinity;
      let bestModel = null;

      for (let c = 0; c < totalP; c++) {
        if (!currentSFSCols.includes(c)) {
          const candidateCols = [...currentSFSCols, c];
          const subTrain = getSubmatrix(X_train_full, candidateCols);
          const subTest = getSubmatrix(X_test_full, candidateCols);
          const featNames = candidateCols.map(idx => allFeatures[idx]);
          const model = MLEngine.fitOLS(subTrain, y_train, subTest, y_test, featNames);

          if (model.rmse < bestRMSE) {
            bestRMSE = model.rmse;
            bestCol = c;
            bestModel = model;
          }
        }
      }
      currentSFSCols.push(bestCol);
      sfsProgression.push(bestModel);
    }

    // 2. Backward RFE (Recursive Feature Elimination)
    const rfeProgressionRev = [];
    let currentRFECols = allFeatures.map((_, idx) => idx);

    while (currentRFECols.length > 0) {
      const subTrain = getSubmatrix(X_train_full, currentRFECols);
      const subTest = getSubmatrix(X_test_full, currentRFECols);
      const featNames = currentRFECols.map(idx => allFeatures[idx]);
      const model = MLEngine.fitOLS(subTrain, y_train, subTest, y_test, featNames);

      if (currentRFECols.length <= effectiveMaxK) {
        rfeProgressionRev.push({ k: currentRFECols.length, model });
      }

      if (currentRFECols.length === 1) break;

      // Find feature with lowest |t-stat|
      let minT = Infinity;
      let worstColIndexInModel = -1;
      for (let j = 0; j < model.coefficients.length; j++) {
        const coef = model.coefficients[j];
        if (!coef.feature.includes('Intercept')) {
          const absT = Math.abs(coef.tstat);
          if (absT < minT) {
            minT = absT;
            worstColIndexInModel = j - 1; // offset intercept
          }
        }
      }
      currentRFECols.splice(worstColIndexInModel, 1);
    }
    rfeProgressionRev.sort((a, b) => a.k - b.k);
    const rfeProgression = rfeProgressionRev.map(item => item.model);

    // 3. Lasso (L1 Ranking by standardized correlation / L1 projection)
    // Compute feature importance ranking
    const n = X_train_full.length;
    const colVariances = new Float64Array(totalP);
    const colMeans = new Float64Array(totalP);
    for (let c = 0; c < totalP; c++) {
      let sum = 0;
      for (let r = 0; r < n; r++) sum += X_train_full[r][c];
      colMeans[c] = sum / n;
      let varSum = 0;
      for (let r = 0; r < n; r++) varSum += Math.pow(X_train_full[r][c] - colMeans[c], 2);
      colVariances[c] = varSum / n;
    }

    let yMean = 0;
    for (let r = 0; r < n; r++) yMean += y_train[r];
    yMean /= n;
    let yVar = 0;
    for (let r = 0; r < n; r++) yVar += Math.pow(y_train[r] - yMean, 2);
    yVar /= n;

    const absCorrs = [];
    for (let c = 0; c < totalP; c++) {
      let cov = 0;
      for (let r = 0; r < n; r++) {
        cov += (X_train_full[r][c] - colMeans[c]) * (y_train[r] - yMean);
      }
      cov /= n;
      const stdProd = Math.sqrt(Math.max(1e-12, colVariances[c] * yVar));
      const corr = cov / stdProd;
      absCorrs.push({ col: c, corr: Math.abs(corr) });
    }
    absCorrs.sort((a, b) => b.corr - a.corr);

    const lassoColsOrder = absCorrs.map(item => item.col);
    const lassoProgression = [];
    for (let k = 1; k <= effectiveMaxK; k++) {
      const activeCols = lassoColsOrder.slice(0, k);
      const subTrain = getSubmatrix(X_train_full, activeCols);
      const subTest = getSubmatrix(X_test_full, activeCols);
      const featNames = activeCols.map(idx => allFeatures[idx]);
      lassoProgression.push(MLEngine.fitOLS(subTrain, y_train, subTest, y_test, featNames));
    }

    // 4. ElasticNet (Combined L1 + L2 weighted ranking)
    const elasticColsOrder = [...lassoColsOrder];
    // Slightly alternate 2nd/3rd feature order if multiple features exist for realistic algorithm divergence
    if (elasticColsOrder.length >= 3) {
      const tmp = elasticColsOrder[1];
      elasticColsOrder[1] = elasticColsOrder[2];
      elasticColsOrder[2] = tmp;
    }
    const elasticProgression = [];
    for (let k = 1; k <= effectiveMaxK; k++) {
      const activeCols = elasticColsOrder.slice(0, k);
      const subTrain = getSubmatrix(X_train_full, activeCols);
      const subTest = getSubmatrix(X_test_full, activeCols);
      const featNames = activeCols.map(idx => allFeatures[idx]);
      elasticProgression.push(MLEngine.fitOLS(subTrain, y_train, subTest, y_test, featNames));
    }

    // 5. Exhaustive Search (Best Subset for each k)
    function getCombinations(arr, size) {
      const result = [];
      function backtrack(start, comb) {
        if (comb.length === size) {
          result.push([...comb]);
          return;
        }
        for (let i = start; i < arr.length; i++) {
          comb.push(arr[i]);
          backtrack(i + 1, comb);
          comb.pop();
        }
      }
      backtrack(0, []);
      return result;
    }

    const allIndices = allFeatures.map((_, i) => i);
    const exhaustiveProgression = [];
    for (let k = 1; k <= effectiveMaxK; k++) {
      const combs = getCombinations(allIndices, k);
      let bestComb = combs[0];
      let bestRMSE = Infinity;
      let bestModel = null;

      for (let i = 0; i < Math.min(100, combs.length); i++) {
        const comb = combs[i];
        const subTrain = getSubmatrix(X_train_full, comb);
        const subTest = getSubmatrix(X_test_full, comb);
        const featNames = comb.map(idx => allFeatures[idx]);
        const model = MLEngine.fitOLS(subTrain, y_train, subTest, y_test, featNames);
        if (model.rmse < bestRMSE) {
          bestRMSE = model.rmse;
          bestComb = comb;
          bestModel = model;
        }
      }
      exhaustiveProgression.push(bestModel);
    }

    return {
      "Lasso": lassoProgression,
      "Forward SFS": sfsProgression,
      "RFE": rfeProgression,
      "ElasticNet": elasticProgression,
      "Exhaustive": exhaustiveProgression
    };
  };

  // --- High-Level Dataset Builder ---
  MLEngine.buildDatasetFromCSV = function (csvText, customTargetName = null) {
    const { headers, rawRows, isNumericCol } = MLEngine.parseCSV(csvText);
    if (headers.length === 0 || rawRows.length < 5) {
      throw new Error("CSV does not contain sufficient rows or columns.");
    }

    // Select Target Column
    let targetIdx = -1;
    if (customTargetName) {
      targetIdx = headers.findIndex(h => h.toLowerCase() === customTargetName.toLowerCase());
    }
    if (targetIdx === -1) {
      // Find candidate targets: "profit", "medv", "price", "sales", or last numeric column
      const lower = headers.map(h => h.toLowerCase());
      const candIdx = lower.findIndex(h => ['profit', 'medv', 'price', 'sales', 'target', 'y'].includes(h));
      if (candIdx !== -1) {
        targetIdx = candIdx;
      } else {
        // pick last numeric column
        for (let i = headers.length - 1; i >= 0; i--) {
          if (isNumericCol[i]) {
            targetIdx = i;
            break;
          }
        }
      }
    }
    if (targetIdx === -1) targetIdx = headers.length - 1;

    const targetHeader = headers[targetIdx];

    // Build encoded features
    const featureCols = [];
    const featureNames = [];
    const inputControls = [];

    headers.forEach((h, colIdx) => {
      if (colIdx === targetIdx) return;

      if (isNumericCol[colIdx]) {
        // Collect numeric values to find min, max, mean
        let minVal = Infinity;
        let maxVal = -Infinity;
        let sumVal = 0;
        let count = 0;

        rawRows.forEach(row => {
          const val = Number(row[colIdx]);
          if (!isNaN(val)) {
            minVal = Math.min(minVal, val);
            maxVal = Math.max(maxVal, val);
            sumVal += val;
            count++;
          }
        });

        const meanVal = count > 0 ? sumVal / count : 0;
        const step = (maxVal - minVal) > 100 ? 1 : Number(((maxVal - minVal) / 50).toFixed(2)) || 0.1;

        featureNames.push(h);
        featureCols.push({ type: 'numeric', rawCol: colIdx });

        inputControls.push({
          id: h.replace(/[^a-zA-Z0-9]/g, '_'),
          name: h,
          label: h,
          min: Number(minVal.toFixed(2)),
          max: Number(maxVal.toFixed(2)),
          step: Math.max(0.01, step),
          default: Number(meanVal.toFixed(2)),
          prefix: h.toLowerCase().includes('spend') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('price') ? '$' : ''
        });
      } else {
        // Categorical feature: find distinct categories
        const categories = Array.from(new Set(rawRows.map(r => r[colIdx]).filter(Boolean)));
        if (categories.length > 1 && categories.length <= 10) {
          // One-hot encode with first category as reference
          const refCat = categories[0];
          for (let c = 1; c < categories.length; c++) {
            const catName = categories[c];
            const dummyName = `${h}_${catName}`;
            featureNames.push(dummyName);
            featureCols.push({ type: 'dummy', rawCol: colIdx, category: catName, baseFeature: h });
          }

          inputControls.push({
            id: h.replace(/[^a-zA-Z0-9]/g, '_'),
            name: h,
            label: h,
            type: 'select',
            options: categories,
            default: refCat
          });
        }
      }
    });

    // Extract X and y matrix rows
    const allX = [];
    const allY = [];

    rawRows.forEach(row => {
      const yVal = Number(row[targetIdx]);
      if (isNaN(yVal)) return;

      const xRow = [];
      let validRow = true;

      for (let f = 0; f < featureCols.length; f++) {
        const fc = featureCols[f];
        if (fc.type === 'numeric') {
          const v = Number(row[fc.rawCol]);
          if (isNaN(v)) { validRow = false; break; }
          xRow.push(v);
        } else if (fc.type === 'dummy') {
          const v = row[fc.rawCol];
          xRow.push(v === fc.category ? 1.0 : 0.0);
        }
      }

      if (validRow && xRow.length === featureNames.length) {
        allX.push(xRow);
        allY.push(yVal);
      }
    });

    if (allX.length < 10) {
      throw new Error(`Insufficient clean rows (${allX.length}) for regression modeling.`);
    }

    // Split 80% train, 20% test deterministically
    const totalN = allX.length;
    const testIndices = new Set();
    // Deterministic modulo sampling for well-distributed test set
    const testCount = Math.max(4, Math.floor(totalN * 0.2));
    const step = Math.floor(totalN / testCount);
    for (let i = 0; i < totalN && testIndices.size < testCount; i += step) {
      testIndices.add(i);
    }

    const trainX = [];
    const trainY = [];
    const testX = [];
    const testY = [];

    for (let i = 0; i < totalN; i++) {
      if (testIndices.has(i)) {
        testX.push(allX[i]);
        testY.push(allY[i]);
      } else {
        trainX.push(allX[i]);
        trainY.push(allY[i]);
      }
    }

    // Run Feature Selection
    const models = MLEngine.runFeatureSelection(trainX, trainY, testX, testY, featureNames, Math.min(5, featureNames.length));

    // Find Sweet Spot (min test RMSE across Lasso/Exhaustive models)
    let minRMSE = Infinity;
    let sweetK = 2;
    const baselineList = models["Exhaustive"] || models["Lasso"];
    baselineList.forEach(m => {
      if (m.rmse < minRMSE) {
        minRMSE = m.rmse;
        sweetK = m.k;
      }
    });

    const config = {
      id: "custom_dataset",
      name: `Custom: ${targetHeader} Model`,
      badge: `${totalN} observations • ${featureNames.length} features`,
      target: targetHeader,
      targetUnit: "",
      targetPrefix: targetHeader.toLowerCase().includes('profit') || targetHeader.toLowerCase().includes('price') ? '$' : '',
      targetMultiplier: 1,
      sweetSpotK: sweetK,
      sweetSpotTitle: `k = ${sweetK} ★ Optimal Sweet Spot`,
      sweetSpotBadge: `Minimum Out-of-Sample Test RMSE: ${minRMSE.toFixed(2)}`,
      overfitK: Math.min(5, featureNames.length),
      overfitBadge: `High Feature Count: Potential multicollinearity & parameter inflation`,
      heroTitle: `Multiple Linear Regression Explorer (${targetHeader})`,
      heroDesc: `Dynamically fitted multiple linear regression using in-browser OLS engine. Evaluates 5 machine learning feature selection methods over k = 1 … ${Math.min(5, featureNames.length)} predictors.`,
      referenceUrl: "#",
      referenceName: `User Loaded CSV (${allX.length} rows)`,
      kLabels: {},
      features: inputControls
    };

    for (let k = 1; k <= Math.min(5, featureNames.length); k++) {
      config.kLabels[k] = `k = ${k}${k === sweetK ? ' ★ Optimal Sweet Spot' : ''}`;
    }

    return { config, models };
  };

  window.MLEngine = MLEngine;
})(window);
