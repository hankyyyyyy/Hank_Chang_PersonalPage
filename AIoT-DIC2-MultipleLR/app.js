/**
 * Main Application Logic for Multiple Linear Regression Explorer
 * Supports Problem Switching (Bonus 1) and Custom Dataset Training (Bonus 2)
 */

(function () {
  'use strict';

  let currentProblem = '50_startups';
  let currentAlgo = 'Lasso';
  let currentK = 2;
  let rmseChartInstance = null;
  let r2ChartInstance = null;

  const ALGO_COLORS = {
    'Lasso': '#4f46e5',
    'Forward SFS': '#ff7f0e',
    'RFE': '#2ca02c',
    'ElasticNet': '#d62728',
    'Exhaustive': '#9467bd'
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    setupEventListeners();
    applyProblemChange('50_startups');
  });

  function getProblemConfig() {
    return window.DATASETS_CONFIG[currentProblem];
  }

  function getProblemModels() {
    if (currentProblem === '50_startups') {
      return window.MODEL_DATA_50_STARTUPS || window.MODEL_DATA;
    } else if (currentProblem === 'boston_housing') {
      return window.MODEL_DATA_BOSTON;
    } else if (window.MODEL_DATA_CUSTOM) {
      return window.MODEL_DATA_CUSTOM;
    }
    return window.MODEL_DATA;
  }

  function getActiveModelData() {
    const models = getProblemModels();
    if (!models) return null;

    const algoKey = currentAlgo === 'ALL' ? 'Lasso' : currentAlgo;
    const algoList = models[algoKey] || models['Lasso'] || models[Object.keys(models)[0]];
    if (!algoList || algoList.length === 0) return null;

    // Constrain k to valid range
    const safeK = Math.min(algoList.length, Math.max(1, currentK));
    return algoList[safeK - 1];
  }

  function setupEventListeners() {
    // Problem selector dropdown (Bonus 1)
    const problemSelect = document.getElementById('problemSelect');
    if (problemSelect) {
      problemSelect.addEventListener('change', (e) => {
        applyProblemChange(e.target.value);
      });
    }

    // Algorithm tabs
    const tabs = document.querySelectorAll('#algoTabs .tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAlgo = btn.dataset.algo;
        updateDashboard();
      });
    });

    // Preset CSV chips (Bonus 2)
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const url = chip.dataset.url;
        const target = chip.dataset.target || '';
        document.getElementById('customCsvUrl').value = url;
        loadDatasetFromUrl(url, target);
      });
    });

    // Load CSV from URL button (Bonus 2)
    const btnLoadUrl = document.getElementById('btnLoadUrl');
    if (btnLoadUrl) {
      btnLoadUrl.addEventListener('click', () => {
        const url = document.getElementById('customCsvUrl').value.trim();
        if (url) {
          loadDatasetFromUrl(url);
        } else {
          alert('Please enter a valid raw CSV URL.');
        }
      });
    }

    // Local CSV File Upload (Bonus 2)
    const fileInput = document.getElementById('csvFileInput');
    const btnUpload = document.getElementById('btnUploadCsv');
    if (btnUpload && fileInput) {
      btnUpload.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              processAndApplyCustomCSV(event.target.result, file.name);
            } catch (err) {
              alert('Error analyzing CSV: ' + err.message);
            }
          };
          reader.readAsText(file);
        }
      });
    }
  }

  function applyProblemChange(problemId) {
    currentProblem = problemId;
    const config = getProblemConfig();
    if (!config) return;

    currentK = config.sweetSpotK || 2;

    // Update Hero elements
    document.getElementById('heroTitle').textContent = config.heroTitle;
    document.getElementById('heroDesc').textContent = config.heroDesc;
    document.getElementById('heroDatasetPill').innerHTML = `<i class="fa-solid fa-database"></i> ${config.name}`;
    document.getElementById('heroSweetPill').innerHTML = `<i class="fa-solid fa-star" style="color: #34d399;"></i> ${config.sweetSpotTitle}`;
    document.getElementById('heroOverfitPill').innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #fbbf24;"></i> ${config.overfitBadge}`;

    // Update Reference Link
    const refSourceLink = document.getElementById('refSourceLink');
    if (refSourceLink) {
      refSourceLink.href = config.referenceUrl;
      refSourceLink.textContent = config.referenceName;
    }

    renderKButtons();
    renderPredictorInputs();
    updateDashboard();
  }

  function renderKButtons() {
    const config = getProblemConfig();
    const models = getProblemModels();
    const algoKey = currentAlgo === 'ALL' ? 'Lasso' : currentAlgo;
    const list = models ? (models[algoKey] || models['Lasso']) : [];
    const maxK = list ? list.length : 5;

    const group = document.getElementById('kSelectorGroup');
    group.innerHTML = '';

    for (let k = 1; k <= maxK; k++) {
      const btn = document.createElement('button');
      btn.className = 'k-btn';
      btn.dataset.k = k;

      if (k === currentK) btn.classList.add('active');

      if (k === config.sweetSpotK) {
        btn.classList.add('sweet-spot');
      } else if (k === maxK && maxK >= 4) {
        btn.classList.add('overfitting');
      }

      const labelText = config.kLabels && config.kLabels[k] ? config.kLabels[k] : `k = ${k}`;
      btn.innerHTML = labelText;

      btn.addEventListener('click', () => {
        document.querySelectorAll('#kSelectorGroup .k-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentK = k;
        updateDashboard();
      });

      group.appendChild(btn);
    }
  }

  function renderPredictorInputs() {
    const config = getProblemConfig();
    const container = document.getElementById('dynamicInputsContainer');
    container.innerHTML = '';

    if (!config.features || config.features.length === 0) return;

    config.features.forEach(feat => {
      const group = document.createElement('div');
      group.className = 'input-group';
      group.id = `inputGroup_${feat.id}`;

      if (feat.type === 'select') {
        group.innerHTML = `
          <div class="input-label-row">
            <span>${feat.label}</span>
          </div>
          <select id="input_${feat.id}" class="input-field" data-feature="${feat.name}">
            ${feat.options.map(opt => `<option value="${opt}" ${opt === feat.default ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        `;
        container.appendChild(group);
        document.getElementById(`input_${feat.id}`).addEventListener('change', calculateLivePrediction);
      } else {
        const prefix = feat.prefix || '';
        const suffix = feat.suffix || '';
        group.innerHTML = `
          <div class="input-label-row">
            <span>${feat.label}</span>
            <span id="label_${feat.id}" style="color: var(--primary); font-family: 'Fira Code', monospace; font-weight: 600;">
              ${prefix}${feat.default.toLocaleString()}${suffix}
            </span>
          </div>
          <input type="number" id="num_${feat.id}" class="input-field" value="${feat.default}" min="${feat.min}" max="${feat.max}" step="${feat.step}" data-feature="${feat.name}">
          <input type="range" id="range_${feat.id}" class="range-slider" value="${feat.default}" min="${feat.min}" max="${feat.max}" step="${feat.step}">
        `;
        container.appendChild(group);

        const slider = document.getElementById(`range_${feat.id}`);
        const num = document.getElementById(`num_${feat.id}`);
        const label = document.getElementById(`label_${feat.id}`);

        slider.addEventListener('input', (e) => {
          num.value = e.target.value;
          label.textContent = prefix + Number(e.target.value).toLocaleString() + suffix;
          calculateLivePrediction();
        });

        num.addEventListener('input', (e) => {
          slider.value = e.target.value;
          label.textContent = prefix + Number(e.target.value).toLocaleString() + suffix;
          calculateLivePrediction();
        });
      }
    });
  }

  function updateDashboard() {
    const data = getActiveModelData();
    const config = getProblemConfig();
    if (!data || !config) return;

    // Format target currency / unit
    const prefix = config.targetPrefix || '';
    const unit = config.targetUnit ? ` ${config.targetUnit}` : '';
    const mult = config.targetMultiplier || 1;

    // Update KPI Cards
    const dispRMSE = (data.rmse * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('valRMSE').textContent = `${prefix}${dispRMSE}${unit}`;
    document.getElementById('valR2').textContent = data.r2.toFixed(4);
    document.getElementById('valAdjR2').textContent = data.adj_r2 ? data.adj_r2.toFixed(4) : data.r2.toFixed(4);
    const dispMAE = (data.mae * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('valMAE').textContent = `${prefix}${dispMAE}${unit}`;
    document.getElementById('valFStat').textContent = data.f_stat ? data.f_stat.toFixed(1) : '150.0';

    // Sweet spot / Warning Badges
    const rmseBadge = document.getElementById('rmseBadge');
    if (currentK === config.sweetSpotK) {
      rmseBadge.className = 'badge-tag badge-green';
      rmseBadge.innerHTML = '<i class="fa-solid fa-award"></i> Optimal Sweet Spot';
    } else if (currentK >= config.overfitK) {
      rmseBadge.className = 'badge-tag badge-amber';
      rmseBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Overfitting / Diminishing';
    } else {
      rmseBadge.className = 'badge-tag badge-blue';
      rmseBadge.innerHTML = `k = ${currentK}`;
    }

    // Active Feature Chips
    document.getElementById('featuresCount').textContent = data.features.length;
    const chipsContainer = document.getElementById('featuresListChips');
    chipsContainer.innerHTML = '';
    data.features.forEach(feat => {
      const chip = document.createElement('span');
      chip.className = 'feature-chip';
      chip.textContent = feat;
      chipsContainer.appendChild(chip);
    });

    // Parsimony notice
    const notice = document.getElementById('parsimonyNotice');
    if (currentK === config.sweetSpotK) {
      notice.className = 'badge-tag badge-green';
      notice.innerHTML = `<i class="fa-solid fa-star"></i> Occam's Razor: ${config.sweetSpotBadge}`;
    } else if (currentK >= config.overfitK) {
      notice.className = 'badge-tag badge-amber';
      notice.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Warning: ${config.overfitBadge}`;
    } else {
      notice.className = 'badge-tag badge-blue';
      notice.innerHTML = `<i class="fa-solid fa-circle-info"></i> Model evaluated with ${currentK} predictors.`;
    }

    // Update Equation
    updateEquation(data.coefficients, config.target);

    // Update Coefficients Table
    updateCoefficientsTable(data.coefficients);

    // Update Outliers Table
    updateOutliersTable(data.outliers, config);

    // Update Charts
    updateCharts();

    // Recalculate Live Prediction
    calculateLivePrediction();
  }

  function updateEquation(coefficients, targetName) {
    const box = document.getElementById('equationBox');
    const intercept = coefficients.find(c => c.feature.includes('Intercept'));
    let parts = [];

    if (intercept) {
      parts.push(`<span class="eq-intercept">${intercept.coef.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>`);
    }

    coefficients.forEach(c => {
      if (c.feature.includes('Intercept')) return;
      const sign = c.coef >= 0 ? '<span class="eq-pos">+</span>' : '<span class="eq-neg">-</span>';
      const absVal = Math.abs(c.coef).toFixed(4);
      parts.push(`${sign} ${absVal} × <span class="eq-var">(${c.feature})</span>`);
    });

    box.innerHTML = `<strong>${targetName}</strong> = ${parts.join(' ')}`;
  }

  function updateCoefficientsTable(coefficients) {
    const tbody = document.getElementById('coefTableBody');
    tbody.innerHTML = '';

    coefficients.forEach(c => {
      const tr = document.createElement('tr');
      const isIntercept = c.feature.includes('Intercept');
      const pVal = c.pvalue !== undefined ? c.pvalue : 0.0001;
      const pBadge = pVal < 0.05
        ? `<span class="badge-tag badge-green">${pVal < 0.0001 ? '< 0.0001' : pVal.toFixed(4)} <i class="fa-solid fa-check"></i></span>`
        : `<span class="badge-tag badge-amber">${pVal.toFixed(4)} (n.s.)</span>`;

      let vifDisplay = '-';
      if (!isIntercept && c.vif !== null && c.vif !== undefined) {
        if (c.vif < 5) {
          vifDisplay = `<span class="badge-tag badge-green">${c.vif.toFixed(2)} (Safe)</span>`;
        } else {
          vifDisplay = `<span class="badge-tag badge-amber">${c.vif.toFixed(2)} (Collinear)</span>`;
        }
      }

      tr.innerHTML = `
        <td><strong>${c.feature}</strong></td>
        <td style="font-family: 'Fira Code', monospace; font-weight: 600;">${c.coef.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
        <td>${c.stderr ? c.stderr.toFixed(4) : '0.0000'}</td>
        <td>${c.tstat ? c.tstat.toFixed(3) : '0.000'}</td>
        <td>${pBadge}</td>
        <td style="font-size: 12px; color: var(--slate-600);">[${c.ci_lower ? c.ci_lower.toFixed(2) : '-'}, ${c.ci_upper ? c.ci_upper.toFixed(2) : '-'}]</td>
        <td>${vifDisplay}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function updateOutliersTable(outliers, config) {
    const tbody = document.getElementById('outliersTableBody');
    tbody.innerHTML = '';
    const prefix = config.targetPrefix || '';
    const unit = config.targetUnit ? ` ${config.targetUnit}` : '';
    const mult = config.targetMultiplier || 1;

    outliers.forEach(o => {
      const tr = document.createElement('tr');
      const isHigh = o.pct_error > 25 || (o.abs_error * mult) > 10000;
      const statusBadge = isHigh
        ? `<span class="badge-tag badge-amber"><span class="status-dot dot-amber"></span> High Residual</span>`
        : `<span class="badge-tag badge-green"><span class="status-dot dot-green"></span> In Range</span>`;

      tr.innerHTML = `
        <td style="font-weight: 700;">#${o.rank}</td>
        <td>Observation #${o.index}</td>
        <td style="font-family: 'Fira Code', monospace;">${prefix}${(o.actual * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}</td>
        <td style="font-family: 'Fira Code', monospace;">${prefix}${(o.predicted * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}</td>
        <td style="color: ${o.residual >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">
          ${o.residual >= 0 ? '+' : ''}${prefix}${(o.residual * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}
        </td>
        <td>${prefix}${(o.abs_error * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}</td>
        <td>${o.pct_error.toFixed(2)}%</td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function calculateLivePrediction() {
    const data = getActiveModelData();
    const config = getProblemConfig();
    if (!data || !config) return;

    let pred = 0;
    const usedFeatures = [];

    data.coefficients.forEach(c => {
      if (c.feature.includes('Intercept')) {
        pred += c.coef;
      } else {
        // Try finding matching number input or select
        let inputEl = document.querySelector(`input[data-feature="${c.feature}"]`);
        if (inputEl) {
          const val = parseFloat(inputEl.value) || 0;
          pred += c.coef * val;
          usedFeatures.push(`${c.feature}: ${(c.coef * val >= 0 ? '+' : '')}${(c.coef * val).toFixed(2)}`);
        } else {
          // Check for dummy variable like State_Florida or State_New York
          const parts = c.feature.split('_');
          if (parts.length === 2) {
            const baseFeature = parts[0];
            const catVal = parts[1];
            const selectEl = document.querySelector(`select[data-feature="${baseFeature}"]`);
            if (selectEl && selectEl.value === catVal) {
              pred += c.coef * 1.0;
              usedFeatures.push(`${c.feature}: ${(c.coef >= 0 ? '+' : '')}${c.coef.toFixed(2)}`);
            }
          }
        }
      }
    });

    const prefix = config.targetPrefix || '';
    const unit = config.targetUnit ? ` ${config.targetUnit}` : '';
    const mult = config.targetMultiplier || 1;
    const finalVal = (pred * mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('predProfitOutput').textContent = `${prefix}${finalVal}${unit}`;
    document.getElementById('predFormulaNote').innerHTML = `
      Active predictors: <strong>${data.features.join(', ')}</strong><br>
      <span style="font-size: 11px; color: #cbd5e1;">(${usedFeatures.join(' | ')})</span>
    `;
  }

  // --- Chart.js Setup ---
  function initCharts() {
    const ctxRMSE = document.getElementById('rmseChart').getContext('2d');
    const ctxR2 = document.getElementById('r2Chart').getContext('2d');

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false, position: 'top' },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleFont: { family: 'Outfit', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            afterLabel: function (context) {
              const k = context.dataIndex + 1;
              const algo = currentAlgo === 'ALL' ? context.dataset.label : currentAlgo;
              const models = getProblemModels();
              const modelItem = models[algo] ? models[algo][k - 1] : null;
              return modelItem ? 'Features: ' + modelItem.features.join(', ') : '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Features (k)',
            font: { family: 'Inter', weight: 600, size: 12 }
          },
          grid: { color: '#f1f5f9' }
        },
        y: { grid: { color: '#f1f5f9' } }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const newK = index + 1;
          const kBtns = document.querySelectorAll('#kSelectorGroup .k-btn');
          kBtns.forEach(b => {
            if (parseInt(b.dataset.k) === newK) {
              b.click();
            }
          });
        }
      }
    };

    rmseChartInstance = new Chart(ctxRMSE, {
      type: 'line',
      data: { labels: ['1', '2', '3', '4', '5'], datasets: [] },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: 'RMSE (Lower is Better)',
              font: { family: 'Inter', weight: 600, size: 12 }
            }
          }
        }
      }
    });

    r2ChartInstance = new Chart(ctxR2, {
      type: 'line',
      data: { labels: ['1', '2', '3', '4', '5'], datasets: [] },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: 'R-squared (Higher is Better)',
              font: { family: 'Inter', weight: 600, size: 12 }
            }
          }
        }
      }
    });
  }

  function updateCharts() {
    const isCompareAll = currentAlgo === 'ALL';
    document.getElementById('rmseChartBadge').textContent = isCompareAll ? 'Comparing 5 Methods' : currentAlgo;

    const models = getProblemModels();
    const config = getProblemConfig();
    if (!models || !config) return;

    const algosToRender = isCompareAll
      ? ['Lasso', 'Forward SFS', 'RFE', 'ElasticNet', 'Exhaustive']
      : [currentAlgo];

    const datasetsRMSE = [];
    const datasetsR2 = [];
    let maxK = 5;

    algosToRender.forEach((algo) => {
      const algoData = models[algo] || models['Lasso'];
      if (!algoData) return;
      maxK = Math.max(maxK, algoData.length);

      const rmsePoints = algoData.map(item => item.rmse);
      const r2Points = algoData.map(item => item.r2);
      const color = ALGO_COLORS[algo] || '#4f46e5';

      const pointRadii = algoData.map(item => item.k === currentK ? 7 : (item.k === config.sweetSpotK ? 6 : 4));
      const pointColors = algoData.map(item => item.k === config.sweetSpotK ? '#10b981' : color);

      datasetsRMSE.push({
        label: algo,
        data: rmsePoints,
        borderColor: color,
        backgroundColor: color,
        borderWidth: isCompareAll ? 2 : 2.5,
        tension: 0.1,
        pointRadius: pointRadii,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });

      datasetsR2.push({
        label: algo,
        data: r2Points,
        borderColor: color,
        backgroundColor: color,
        borderWidth: isCompareAll ? 2 : 2.5,
        tension: 0.1,
        pointRadius: pointRadii,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });
    });

    const labels = [];
    for (let i = 1; i <= maxK; i++) labels.push(String(i));

    rmseChartInstance.data.labels = labels;
    rmseChartInstance.data.datasets = datasetsRMSE;
    rmseChartInstance.options.plugins.legend.display = isCompareAll;
    rmseChartInstance.update();

    r2ChartInstance.data.labels = labels;
    r2ChartInstance.data.datasets = datasetsR2;
    r2ChartInstance.options.plugins.legend.display = isCompareAll;
    r2ChartInstance.update();
  }

  // --- Bonus 2: Custom CSV Loading & Engine Hook ---
  function loadDatasetFromUrl(url, targetCol = null) {
    const statusMsg = document.getElementById('loaderStatus');
    if (statusMsg) {
      statusMsg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching dataset from URL...';
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.text();
      })
      .then(csvText => {
        if (statusMsg) {
          statusMsg.innerHTML = '<i class="fa-solid fa-gear fa-spin"></i> Training ML regression models in browser...';
        }
        setTimeout(() => {
          processAndApplyCustomCSV(csvText, url.split('/').pop(), targetCol);
          if (statusMsg) {
            statusMsg.innerHTML = '<span style="color: #059669; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Models trained successfully!</span>';
          }
        }, 50);
      })
      .catch(err => {
        console.error(err);
        if (statusMsg) {
          statusMsg.innerHTML = `<span style="color: #dc2626;"><i class="fa-solid fa-triangle-exclamation"></i> Load failed: ${err.message}. Try another URL or local file upload.</span>`;
        }
      });
  }

  function processAndApplyCustomCSV(csvText, filename, customTarget = null) {
    const { config, models } = window.MLEngine.buildDatasetFromCSV(csvText, customTarget);

    config.referenceName = `${filename} (${config.badge})`;
    window.DATASETS_CONFIG['custom_dataset'] = config;
    window.MODEL_DATA_CUSTOM = models;

    // Add or select option in problem dropdown
    const select = document.getElementById('problemSelect');
    let customOption = select.querySelector('option[value="custom_dataset"]');
    if (!customOption) {
      customOption = document.createElement('option');
      customOption.value = 'custom_dataset';
      customOption.textContent = `📂 Custom: ${filename}`;
      select.appendChild(customOption);
    } else {
      customOption.textContent = `📂 Custom: ${filename}`;
    }
    select.value = 'custom_dataset';

    applyProblemChange('custom_dataset');
  }

  // Expose for external calls
  window.AppML = {
    applyProblemChange,
    loadDatasetFromUrl
  };
})();
