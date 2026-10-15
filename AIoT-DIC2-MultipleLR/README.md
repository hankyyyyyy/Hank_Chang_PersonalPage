# DIC-2 Multiple Linear Regression & Feature Selection Explorer

## 🎓 國立中興大學 (NCHU) - DIC-2 作業專案
* **課程/作業名稱**: DIC-2 kaggle 50 startup and boston housing
* **指導教授**: 陳煥 教授 (HUAN CHEN)
* **學生**: Hank Chang (張佑維) - 電機工程學系
* **展示網址 (GitHub Pages)**: [https://hankyyyyyy.github.io/DIC-2-kaggle-50-startup-and-boston-housing-/](https://hankyyyyyy.github.io/DIC-2-kaggle-50-startup-and-boston-housing-/)
* **個人作品集整合頁**: [https://hankyyyyyy.github.io/Hank_Chang_PersonalPage/](https://hankyyyyyy.github.io/Hank_Chang_PersonalPage/)
* **GitHub 倉庫**: [https://github.com/hankyyyyyy/DIC-2-kaggle-50-startup-and-boston-housing-](https://github.com/hankyyyyyy/DIC-2-kaggle-50-startup-and-boston-housing-)

---

## 🌟 作業核心功能與滿分加分項亮點

### 1. 核心任務：雙主題探索 (50 Startups & Boston Housing)
- **50 Startups Dataset**: 新創公司研發（R&D Spend）、行銷（Marketing Spend）、行政（Administration）與州別支出預測獲利（Profit）。
- **Boston Housing Dataset**: 波士頓房價 13 項特徵（房間數 RM、低收入人口比例 LSTAT、師生比 PTRATIO、距離就業中心 DIS 等）之享樂定價模型（Hedonic Price Model）。
- **5 大機器學習特徵選取演算法 (Feature Selection)**:
  1. `Lasso (L1 Ranking)`: 基於 L1 正則化稀疏係數衰減排序
  2. `Forward SFS`: 循序前向貪婪搜尋 (Sequential Forward Selection)
  3. `RFE`: 遞迴特徵消除 (Recursive Feature Elimination)
  4. `ElasticNet`: 結合 L1 與 L2 正則化平衡共線性
  5. `Exhaustive Search`: 全子集窮舉搜尋最佳簡約模型
- **模型複雜度與奧坎剃刀 (Occam's Razor) 分析**:
  - 動態切換特徵數 $k=1 \sim 5$
  - 清楚標記 **Global Sweet Spot**（最小驗證 RMSE 最佳簡約模型點）與 **Overfitting Warning**（過度擬合斷崖點）
  - 雙指標曲線 (Chart.js): 呈現 RMSE 與 $R^2$ 隨 $k$ 變化的偏誤-變異權衡 (Bias-Variance Tradeoff)

### 2. 滿分加分項目 1：下拉視窗呈現兩種 Problem (加總分 +1 分) 🌟
- 頂部導航列具備醒目的 **Select Problem** 下拉選單：
  - `🏢 Problem 1: 50 Startups (Profit)`
  - `🏡 Problem 2: Boston Housing (MEDV)`
  - `🌐 Custom Dataset (URL / File)`
- 切換時**完全無重整動態渲染**：標題、簡介、特徵數按鈕、指標卡片、迴歸方程式、係數檢定表、即時預測器滑桿、離群值殘差診斷表均即時更新！

### 3. 滿分加分項目 2：可任意輸入 Dataset 網址或檔案 (加總分 +2 分) 🌟
- 具備**瀏覽器原生機器學習 OLS 迴歸引擎**：
  - 支援任意 CSV URL（如 `https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv`）或本機上傳 CSV。
  - 自動解析資料集、偵測目標欄位（Profit、Price、MEDV、Sales 等）。
  - 自動將類別變數進行虛擬變數編碼（One-Hot Encoding）。
  - 以矩陣運算 $(X^T X)^{-1} X^T y$ 進行最小平方法 (OLS) 訓練。
  - 即時計算 $R^2$、Adjusted $R^2$、RMSE、MAE、$F$-statistic、係數標準誤、t 統計量、VIF 共線性，並找出該資料集之最佳特徵甜蜜點 (Sweet Spot)！

### 4. 互動式即時預測器 (Live Interactive Predictor)
- 根據當前啟用的最佳簡約模型，提供直覺的雙向綁定滑桿與數值輸入框。
- 即時計算預測金額與各項特徵對目標值的個別貢獻分解（Contribution Decomposition）。

---

## 🛠️ 技術架構
* **前端核心**: Vanilla HTML5, CSS3, ES6+ JavaScript (無重型框架依賴，載入秒開)
* **視覺圖表**: [Chart.js 4](https://www.chartjs.org/)
* **字體與圖標**: Google Fonts (Outfit, Inter, Fira Code), FontAwesome 6
* **方法論**: CRISP-DM (Cross-Industry Standard Process for Data Mining)
* **參考設計風格**: [StatsUnlock Multiple Linear Regression Calculator](https://statsunlock.com)

---

## 🚀 GitHub Pages 部署說明
本專案已附帶官方自動部署工作流程檔案：`.github/workflows/pages.yml`。

### 部署步驟：
1. 將程式碼推送到 GitHub 倉庫的 `main` 分支。
2. 進入該 GitHub 倉庫的 **Settings** -> **Pages**。
3. 在 **Build and deployment** 下拉選單中選擇 **GitHub Actions**（或選擇 **Deploy from a branch** -> `main` / `(root)`）。
4. 稍等約 30 秒，即可在上方看到綠色勾勾與發布成功的公開網址！
