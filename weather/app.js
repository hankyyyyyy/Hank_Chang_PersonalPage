/**
 * ==============================================================================
 * TAIWAN WEATHER HUB - CORE APPLICATION JAVASCRIPT
 * 遵循中央氣象署 CWA OpenData API (F-C0032-001) 資料規格
 * 開發者：Hank Chang (張佑維)
 * ==============================================================================
 */

// CWA API Key & Endpoint
const CWA_API_KEY = "CWA-3DD1F6E5-73FC-4BB2-9B9F-E70B335322E3";
const CWA_API_URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${CWA_API_KEY}&format=JSON`;

// State Management
const state = {
  weatherData: {}, // Map: countyName -> countyObject
  currentCounty: "苗栗縣", // 預設顯示苗栗縣（如第一張圖所示）
  currentTownship: "苗栗市",
  currentRegionFilter: "all",
  favorites: JSON.parse(localStorage.getItem("taiwan_weather_favs") || "[]"),
  mapMode: "icon", // "icon" | "temp" | "pop"
  isLightMode: false,
  isSoundPlaying: false,
  audioCtx: null,
  audioNodes: null,
  lastUpdated: null,
};

// County Geographic Info, Regions, Coordinates on SVG Stage (x%, y%)
const COUNTY_CONFIG = {
  "基隆市": { region: "north", x: 70, y: 13, lat: 25.13, lon: 121.74, aqiStation: "基隆" },
  "臺北市": { region: "north", x: 63, y: 16, lat: 25.04, lon: 121.56, aqiStation: "士林" },
  "新北市": { region: "north", x: 67, y: 19, lat: 25.01, lon: 121.46, aqiStation: "板橋" },
  "桃園市": { region: "north", x: 57, y: 18, lat: 24.99, lon: 121.30, aqiStation: "桃園" },
  "新竹市": { region: "north", x: 50, y: 22, lat: 24.81, lon: 120.97, aqiStation: "新竹" },
  "新竹縣": { region: "north", x: 56, y: 23, lat: 24.84, lon: 121.01, aqiStation: "竹東" },
  "苗栗縣": { region: "central", x: 48, y: 28, lat: 24.56, lon: 120.82, aqiStation: "苗栗" },
  "臺中市": { region: "central", x: 47, y: 34, lat: 24.16, lon: 120.68, aqiStation: "西屯" },
  "彰化縣": { region: "central", x: 42, y: 39, lat: 24.08, lon: 120.54, aqiStation: "彰化" },
  "南投縣": { region: "central", x: 54, y: 42, lat: 23.90, lon: 120.69, aqiStation: "南投" },
  "雲林縣": { region: "central", x: 39, y: 46, lat: 23.71, lon: 120.43, aqiStation: "斗六" },
  "嘉義市": { region: "south", x: 44, y: 50, lat: 23.48, lon: 120.45, aqiStation: "嘉義" },
  "嘉義縣": { region: "south", x: 37, y: 51, lat: 23.45, lon: 120.26, aqiStation: "朴子" },
  "臺南市": { region: "south", x: 38, y: 58, lat: 22.99, lon: 120.21, aqiStation: "臺南" },
  "高雄市": { region: "south", x: 43, y: 67, lat: 22.62, lon: 120.30, aqiStation: "前金" },
  "屏東縣": { region: "south", x: 46, y: 78, lat: 22.67, lon: 120.49, aqiStation: "屏東" },
  "宜蘭縣": { region: "north", x: 72, y: 27, lat: 24.75, lon: 121.75, aqiStation: "宜蘭" },
  "花蓮縣": { region: "east", x: 67, y: 42, lat: 23.99, lon: 121.61, aqiStation: "花蓮" },
  "臺東縣": { region: "east", x: 59, y: 68, lat: 22.76, lon: 121.14, aqiStation: "臺東" },
  "澎湖縣": { region: "islands", x: 18, y: 48, lat: 23.57, lon: 119.58, aqiStation: "馬公" },
  "金門縣": { region: "islands", x: 12, y: 32, lat: 24.44, lon: 118.32, aqiStation: "金門" },
  "連江縣": { region: "islands", x: 22, y: 15, lat: 26.15, lon: 119.95, aqiStation: "馬祖" },
};

// Region Names in Traditional Chinese
const REGION_NAMES = {
  "north": "北部地區",
  "central": "中部地區",
  "south": "南部地區",
  "east": "東部地區",
  "islands": "外島地區"
};

// Townships for each county
const COUNTY_TOWNSHIPS = {
  "苗栗縣": ["苗栗市", "竹南鎮", "頭份市", "後龍鎮", "通霄鎮", "苑裡鎮", "卓蘭鎮", "造橋鄉", "三灣鄉", "南庄鄉", "公館鄉", "大湖鄉", "泰安鄉", "銅鑼鄉", "三義鄉", "西湖鄉", "頭屋鄉", "獅潭鄉"],
  "臺北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
  "新北市": ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "樹林區", "鶯歌區", "三峽區", "淡水區", "汐止區", "瑞芳區", "林口區", "蘆洲區"],
  "基隆市": ["仁愛區", "信義區", "中正區", "中山區", "安樂區", "暖暖區", "七堵區"],
  "桃園市": ["桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "蘆竹區", "大溪區", "龜山區", "大園區", "觀音區", "龍潭區", "新屋區", "復興區"],
  "新竹市": ["東區", "北區", "香山區"],
  "新竹縣": ["竹北市", "竹東鎮", "新埔鎮", "關西鎮", "湖口鄉", "新豐鄉", "芎林鄉", "橫山鄉", "北埔鄉", "寶山鄉", "峨眉鄉", "尖石鄉", "五峰鄉"],
  "臺中市": ["中區", "東區", "南區", "西區", "北區", "西屯區", "南屯區", "北屯區", "豐原區", "大里區", "太平區", "清水區", "沙鹿區", "大甲區"],
  "彰化縣": ["彰化市", "員林市", "和美鎮", "鹿港鎮", "溪湖鎮", "田中鎮", "北斗鎮", "二林鎮", "線西鄉", "伸港鄉", "芬園鄉", "秀水鄉", "花壇鄉", "福興鄉"],
  "南投縣": ["南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉", "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"],
  "雲林縣": ["斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "古坑鄉", "大埤鄉", "莿桐鄉", "林內鄉", "二崙鄉", "崙背鄉", "麥寮鄉"],
  "嘉義市": ["東區", "西區"],
  "嘉義縣": ["太保市", "朴子市", "布袋鎮", "大林鎮", "民雄鄉", "溪口鄉", "新港鄉", "六腳鄉", "東石鄉", "義竹鄉", "鹿草鄉", "水上鄉", "中埔鄉", "竹崎鄉", "梅山鄉", "番路鄉", "大埔鄉", "阿里山鄉"],
  "臺南市": ["安平區", "中西區", "東區", "南區", "北區", "安南區", "永康區", "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", "關廟區"],
  "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區", "鳳山區", "大寮區", "鳥松區", "林園區", "仁武區", "大樹區", "岡山區", "美濃區", "旗山區"],
  "屏東縣": ["屏東市", "潮州鎮", "東港鎮", "恆春鎮", "萬丹鄉", "長治鄉", "麟洛鄉", "九如鄉", "里港鄉", "鹽埔鄉", "高樹鄉", "萬巒鄉", "內埔鄉", "竹田鄉", "新埤鄉", "枋寮鄉", "枋山鄉", "車城鄉"],
  "宜蘭縣": ["宜蘭市", "羅東鎮", "蘇澳鎮", "頭城鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉", "五結鄉", "三星鄉", "大同鄉", "南澳鄉"],
  "花蓮縣": ["花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉", "瑞穗鄉", "萬榮鄉", "卓溪鄉", "富里鄉"],
  "臺東縣": ["臺東市", "成功鎮", "關山鎮", "卑南鄉", "鹿野鄉", "池上鄉", "東河鄉", "長濱鄉", "太麻里鄉", "大武鄉", "綠島鄉", "蘭嶼鄉"],
  "澎湖縣": ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],
  "金門縣": ["金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"],
  "連江縣": ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"]
};

// Weather Condition Helper: Glyphs & Color Schemes
function getWeatherVisuals(wxName, wxCode, slotIndex = 0) {
  const isNight = slotIndex === 1; // 今晚明晨
  let iconClass = "fa-solid fa-cloud-sun";
  let glyph = "🌤️";
  let theme = "sky-sunny";

  const code = parseInt(wxCode, 10);

  if (code === 1) { // 晴天
    iconClass = isNight ? "fa-solid fa-moon text-amber" : "fa-solid fa-sun text-amber";
    glyph = isNight ? "🌙" : "☀️";
    theme = isNight ? "sky-starry" : "sky-sunny";
  } else if (code >= 2 && code <= 3) { // 晴時多雲、多雲時晴
    iconClass = isNight ? "fa-solid fa-cloud-moon text-amber" : "fa-solid fa-cloud-sun text-amber";
    glyph = isNight ? "🌤️" : "⛅";
    theme = isNight ? "sky-starry" : "sky-sunny";
  } else if (code >= 4 && code <= 7) { // 陰天、多雲
    iconClass = "fa-solid fa-cloud text-slate";
    glyph = "☁️";
    theme = "sky-rainy";
  } else if (code >= 8 && code <= 14) { // 短暫陣雨、陣雨
    iconClass = "fa-solid fa-cloud-rain text-blue";
    glyph = "🌧️";
    theme = "sky-rainy";
  } else if (code >= 15 && code <= 22) { // 雷雨
    iconClass = "fa-solid fa-cloud-bolt text-amber";
    glyph = "⛈️";
    theme = "sky-rainy";
  } else {
    // 根據文字判斷
    if (wxName.includes("雨")) {
      iconClass = "fa-solid fa-cloud-showers-heavy text-blue";
      glyph = "🌧️";
      theme = "sky-rainy";
    } else if (wxName.includes("晴")) {
      iconClass = isNight ? "fa-solid fa-moon text-amber" : "fa-solid fa-sun text-amber";
      glyph = isNight ? "🌙" : "☀️";
      theme = isNight ? "sky-starry" : "sky-sunny";
    }
  }

  return { iconClass, glyph, theme };
}

// Format CWA Slot Label based on start/end hour
function getSlotLabel(slotIndex, startTime, endTime) {
  if (slotIndex === 0) return "今日白天";
  if (slotIndex === 1) return "今晚明晨";
  if (slotIndex === 2) return "明日白天";

  const sHour = new Date(startTime.replace(/-/g, '/')).getHours();
  if (sHour >= 6 && sHour < 18) return "白天預報";
  return "夜間明晨";
}

function formatSlotTimeRange(startTime, endTime) {
  try {
    const sDate = new Date(startTime.replace(/-/g, '/'));
    const eDate = new Date(endTime.replace(/-/g, '/'));
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(sDate.getHours())}:00 ~ ${pad(eDate.getHours())}:00`;
  } catch (e) {
    return "12:00 ~ 18:00";
  }
}

// Calculate AI Lifestyle Tips based on weather
function generateLifestyleTips(forecast) {
  const currentSlot = forecast.slots[0] || {};
  const minT = currentSlot.minT || 24;
  const maxT = currentSlot.maxT || 30;
  const avgT = Math.round((minT + maxT) / 2);
  const pop = currentSlot.pop || 0;
  const wx = currentSlot.wx || "";

  // 穿衣建議
  let clothes = "短袖棉質 + 隨身薄外套";
  if (avgT >= 30) clothes = "輕薄透氣短袖，避免深色厚重衣物";
  else if (avgT >= 24) clothes = "舒適 T-shirt 或短袖襯衫，早晚加薄開衫";
  else if (avgT >= 19) clothes = "長袖上衣、針織衫或風衣外套";
  else clothes = "禦寒厚外套、羽絨衣及毛帽圍巾";

  // 雨具攜帶
  let umbrella = "降雨機率低，外出無需雨具";
  if (pop >= 60 || wx.includes("雨")) {
    umbrella = "降雨機率高，出門務必攜帶折傘或雨具";
  } else if (pop >= 30) {
    umbrella = "天氣偶有局部陣雨，建議包包常備輕量折傘";
  }

  // 紫外線建議
  let uv = "中量級 (中午時段建議遮陽帽)";
  if (wx.includes("晴") && avgT >= 28) {
    uv = "過量至危險級 (塗抹 SPF30+ 防曬乳、太陽眼鏡)";
  } else if (wx.includes("陰") || wx.includes("雨")) {
    uv = "微量級 (紫外線偏弱，適度戶外採光)";
  }

  // 運動建議
  let activity = "極適宜戶外慢跑、健行或騎單車";
  if (pop >= 50 || wx.includes("雨")) {
    activity = "降雨路面濕滑，推薦室內健身、游泳或瑜珈";
  } else if (avgT >= 33) {
    activity = "氣溫高防中暑，建議傍晚後再進行戶外高強度運動";
  }

  return { clothes, umbrella, uv, activity, avgT };
}

// Air Quality Estimate based on County & Random micro-variance
function getAQIInfo(countyName) {
  const conf = COUNTY_CONFIG[countyName] || {};
  const station = conf.aqiStation || countyName.slice(0, 2);
  
  // 基於真實地理環境的大致常態基準
  let baseAQI = 52;
  if (["高雄市", "臺南市", "雲林縣"].includes(countyName)) baseAQI = 75;
  else if (["花蓮縣", "臺東縣", "宜蘭縣", "連江縣"].includes(countyName)) baseAQI = 28;
  else if (["臺北市", "新北市", "基隆市"].includes(countyName)) baseAQI = 45;

  const aqi = Math.max(15, Math.min(130, baseAQI + Math.floor(Math.sin(countyName.charCodeAt(0)) * 12)));
  let statusText = "普通";
  let statusClass = "aqi-status-moderate";
  let pct = Math.min(100, Math.round((aqi / 150) * 100));

  if (aqi <= 50) {
    statusText = "良好";
    statusClass = "aqi-status-good";
  } else if (aqi > 100) {
    statusText = "對敏感族群不健康";
    statusClass = "aqi-status-unhealthy";
  }

  return { station, aqi, statusText, statusClass, pct };
}

// ==============================================================================
// DATA FETCHING & PARSING
// ==============================================================================
async function fetchWeatherData() {
  const refreshIcon = document.getElementById("refreshIcon");
  if (refreshIcon) refreshIcon.classList.add("fa-spin");

  try {
    const res = await fetch(CWA_API_URL);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    
    if (data.records && data.records.location) {
      parseCWARecords(data.records.location);
      state.lastUpdated = new Date();
      updateLastSyncTime();
      showToast("已成功同步中央氣象署最新 36 小時天氣資料！", "success");
    } else {
      throw new Error("API 資料結構不符");
    }
  } catch (err) {
    console.warn("CWA API 即時獲取異常，切換至備援快照資料庫:", err);
    loadFallbackData();
    showToast("即時網路連線受限，已載入本機預存氣象快照！", "warning");
  } finally {
    if (refreshIcon) refreshIcon.classList.remove("fa-spin");
    renderCurrentCounty();
    renderMapBadges();
    updateFavoritesUI();
  }
}

function parseCWARecords(locations) {
  const map = {};
  locations.forEach(loc => {
    const name = loc.locationName;
    const elements = {};
    (loc.weatherElement || []).forEach(e => {
      elements[e.elementName] = e.time || [];
    });

    const wxList = elements["Wx"] || [];
    const popList = elements["PoP"] || [];
    const minTList = elements["MinT"] || [];
    const maxTList = elements["MaxT"] || [];
    const ciList = elements["CI"] || [];

    const slots = [];
    for (let i = 0; i < Math.min(wxList.length, 3); i++) {
      const wxObj = wxList[i] || {};
      const popObj = popList[i] || {};
      const minTObj = minTList[i] || {};
      const maxTObj = maxTList[i] || {};
      const ciObj = ciList[i] || {};

      slots.push({
        slotIndex: i,
        startTime: wxObj.startTime || "",
        endTime: wxObj.endTime || "",
        wx: wxObj.parameter?.parameterName || "多雲時晴",
        wxCode: wxObj.parameter?.parameterValue || "2",
        pop: parseInt(popObj.parameter?.parameterName || "0", 10),
        minT: parseInt(minTObj.parameter?.parameterName || "24", 10),
        maxT: parseInt(maxTObj.parameter?.parameterName || "30", 10),
        comfort: ciObj.parameter?.parameterName || "舒適至悶熱",
      });
    }

    map[name] = {
      locationName: name,
      region: (COUNTY_CONFIG[name] && COUNTY_CONFIG[name].region) || "central",
      slots: slots
    };
  });

  state.weatherData = map;
}

// Fallback Snapshot if offline or API blocked
function loadFallbackData() {
  const sampleCounties = Object.keys(COUNTY_CONFIG);
  const map = {};
  const now = new Date();

  sampleCounties.forEach(name => {
    map[name] = {
      locationName: name,
      region: COUNTY_CONFIG[name].region,
      slots: [
        { slotIndex: 0, startTime: "2026-09-24 12:00:00", endTime: "2026-09-24 18:00:00", wx: name === "苗栗縣" ? "多雲時晴" : "晴時多雲", wxCode: "2", pop: 0, minT: 27, maxT: 31, comfort: "舒適至悶熱" },
        { slotIndex: 1, startTime: "2026-09-24 18:00:00", endTime: "2026-09-25 06:00:00", wx: "晴時多雲", wxCode: "2", pop: 0, minT: 22, maxT: 27, comfort: "舒適" },
        { slotIndex: 2, startTime: "2026-09-25 06:00:00", endTime: "2026-09-25 18:00:00", wx: "多雲晴朗", wxCode: "3", pop: 10, minT: 22, maxT: 31, comfort: "舒適至悶熱" }
      ]
    };
  });

  state.weatherData = map;
  state.lastUpdated = new Date();
  updateLastSyncTime();
}

function updateLastSyncTime() {
  const elem = document.getElementById("dataUpdatedTime");
  if (elem && state.lastUpdated) {
    const pad = (n) => String(n).padStart(2, '0');
    const h = pad(state.lastUpdated.getHours());
    const m = pad(state.lastUpdated.getMinutes());
    const s = pad(state.lastUpdated.getSeconds());
    elem.textContent = `${h}:${m}:${s} (即時)`;
  }
}

// ==============================================================================
// UI RENDERING
// ==============================================================================
function renderCurrentCounty() {
  const countyData = state.weatherData[state.currentCounty];
  if (!countyData) return;

  const currentSlot = countyData.slots[0] || {};
  const visuals = getWeatherVisuals(currentSlot.wx, currentSlot.wxCode, 0);

  // Apply Atmospheric Sky Theme
  document.body.className = `${visuals.theme} ${state.isLightMode ? 'light-mode' : ''}`;

  // Heading & Region
  const locNameElem = document.getElementById("currentLocationName");
  const regionTagElem = document.getElementById("currentRegionTag");
  const dateElem = document.getElementById("currentDateDisplay");

  if (locNameElem) locNameElem.textContent = state.currentCounty;
  if (regionTagElem) regionTagElem.textContent = REGION_NAMES[countyData.region] || "臺灣本島";

  // Date format
  if (dateElem) {
    const now = new Date();
    const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    dateElem.textContent = `${y}/${m}/${d} ${days[now.getDay()]}`;
  }

  // Populate Townships Dropdown
  renderTownshipSelect();

  // Metrics
  const avgTemp = Math.round((currentSlot.minT + currentSlot.maxT) / 2);
  const tempNumElem = document.getElementById("currentTempNum");
  const minTempElem = document.getElementById("currentMinTemp");
  const maxTempElem = document.getElementById("currentMaxTemp");
  const wxDescElem = document.getElementById("currentWxDesc");
  const comfortElem = document.getElementById("currentComfortText");
  const popElem = document.getElementById("currentPoP");
  const feelTempElem = document.getElementById("currentFeelTemp");

  if (tempNumElem) tempNumElem.textContent = avgTemp;
  if (minTempElem) minTempElem.textContent = currentSlot.minT;
  if (maxTempElem) maxTempElem.textContent = currentSlot.maxT;
  if (wxDescElem) wxDescElem.textContent = currentSlot.wx;
  if (comfortElem) comfortElem.textContent = currentSlot.comfort;
  if (popElem) popElem.textContent = `${currentSlot.pop}%`;
  if (feelTempElem) feelTempElem.textContent = `${avgTemp + 1}°C`;

  // Hero Weather Icon
  const heroIconStage = document.getElementById("heroWeatherIcon");
  if (heroIconStage) {
    heroIconStage.innerHTML = `<i class="${visuals.iconClass} weather-glyph"></i>`;
  }

  // 36-Hour 3-Slot Forecast Cards (Matching Image 1)
  countyData.slots.forEach((slot, idx) => {
    const titleElem = document.getElementById(`slotTitle${idx}`);
    const timeElem = document.getElementById(`slotTime${idx}`);
    const iconElem = document.getElementById(`slotIcon${idx}`);
    const wxElem = document.getElementById(`slotWx${idx}`);
    const tempElem = document.getElementById(`slotTemp${idx}`);
    const popValElem = document.getElementById(`slotPoP${idx}`);

    if (titleElem) titleElem.textContent = getSlotLabel(idx, slot.startTime, slot.endTime);
    if (timeElem) timeElem.textContent = formatSlotTimeRange(slot.startTime, slot.endTime);
    if (wxElem) wxElem.textContent = slot.wx;
    if (tempElem) tempElem.textContent = `${slot.minT}° - ${slot.maxT}°`;
    if (popValElem) popValElem.textContent = `${slot.pop}%`;

    const slotVisuals = getWeatherVisuals(slot.wx, slot.wxCode, idx);
    if (iconElem) iconElem.innerHTML = `<i class="${slotVisuals.iconClass}"></i>`;
  });

  // Air Quality Monitor (AQI)
  const aqiInfo = getAQIInfo(state.currentCounty);
  const aqiStationElem = document.getElementById("aqiStationName");
  const aqiValueElem = document.getElementById("aqiValue");
  const aqiBadgeElem = document.getElementById("aqiLevelBadge");
  const aqiProgressElem = document.getElementById("aqiProgressBar");

  if (aqiStationElem) aqiStationElem.textContent = `測站：${aqiInfo.station}`;
  if (aqiValueElem) aqiValueElem.textContent = aqiInfo.aqi;
  if (aqiBadgeElem) {
    aqiBadgeElem.textContent = aqiInfo.statusText;
    aqiBadgeElem.className = `aqi-status-text ${aqiInfo.statusClass}`;
  }
  if (aqiProgressElem) aqiProgressElem.style.width = `${aqiInfo.pct}%`;

  // Lifestyle Advisory
  const tips = generateLifestyleTips(countyData);
  const tipClothes = document.getElementById("tipClothes");
  const tipUmbrella = document.getElementById("tipUmbrella");
  const tipUV = document.getElementById("tipUV");
  const tipActivity = document.getElementById("tipActivity");

  if (tipClothes) tipClothes.textContent = tips.clothes;
  if (tipUmbrella) tipUmbrella.textContent = tips.umbrella;
  if (tipUV) tipUV.textContent = tips.uv;
  if (tipActivity) tipActivity.textContent = tips.activity;

  // Favorite Button State
  const favBtn = document.getElementById("favCurrentBtn");
  if (favBtn) {
    const isFav = state.favorites.includes(state.currentCounty);
    favBtn.classList.toggle("active", isFav);
    favBtn.innerHTML = isFav ? `<i class="fa-solid fa-heart"></i>` : `<i class="fa-regular fa-heart"></i>`;
  }

  // Update SVG active polygon & Badges
  highlightSelectedCountyOnMap();
}

function renderTownshipSelect() {
  const select = document.getElementById("townshipSelect");
  if (!select) return;

  const townships = COUNTY_TOWNSHIPS[state.currentCounty] || [state.currentCounty.slice(0, 2) + "市"];
  select.innerHTML = "";
  townships.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (t === state.currentTownship) opt.selected = true;
    select.appendChild(opt);
  });
}

// ==============================================================================
// INTERACTIVE MAP RENDERING
// ==============================================================================
function renderMapBadges() {
  const layer = document.getElementById("mapPinsLayer");
  const islandList = document.getElementById("islandPinsList");
  if (!layer || !islandList) return;

  layer.innerHTML = "";
  islandList.innerHTML = "";

  Object.keys(COUNTY_CONFIG).forEach(countyName => {
    const conf = COUNTY_CONFIG[countyName];
    const data = state.weatherData[countyName];
    if (!data) return;

    const currentSlot = data.slots[0] || {};
    const avgT = Math.round((currentSlot.minT + currentSlot.maxT) / 2);
    const visuals = getWeatherVisuals(currentSlot.wx, currentSlot.wxCode, 0);

    // Offshore Islands go to the dedicated Inset panel for crystal clear readability
    if (conf.region === "islands") {
      const chip = document.createElement("div");
      chip.className = `island-chip ${countyName === state.currentCounty ? 'selected' : ''}`;
      chip.dataset.county = countyName;
      chip.innerHTML = `
        <span><strong>${countyName}</strong></span>
        <span>${visuals.glyph} ${avgT}°C</span>
      `;
      chip.addEventListener("click", () => selectCounty(countyName));
      islandList.appendChild(chip);
      return;
    }

    // Mainland Counties: Positioned Vector Badges
    const badge = document.createElement("div");
    badge.className = `map-weather-badge ${countyName === state.currentCounty ? 'selected' : ''}`;
    badge.dataset.county = countyName;
    badge.style.left = `${conf.x}%`;
    badge.style.top = `${conf.y}%`;

    // Dynamic Content based on Map Mode
    if (state.mapMode === "icon") {
      badge.innerHTML = `
        <span class="badge-pin-icon">${visuals.glyph}</span>
        <span class="badge-pin-name">${countyName.slice(0, 2)}</span>
        <span class="badge-pin-temp">${avgT}°</span>
      `;
    } else if (state.mapMode === "temp") {
      badge.innerHTML = `
        <span class="badge-pin-name">${countyName.slice(0, 2)}</span>
        <span class="badge-pin-temp" style="font-size:0.9rem">${currentSlot.minT}~${currentSlot.maxT}°</span>
      `;
    } else if (state.mapMode === "pop") {
      badge.innerHTML = `
        <span class="badge-pin-name">${countyName.slice(0, 2)}</span>
        <span class="badge-pin-temp" style="color:#38bdf8"><i class="fa-solid fa-droplet"></i> ${currentSlot.pop}%</span>
      `;
    }

    // Badge Hover & Click
    badge.addEventListener("mouseenter", (e) => showMapHover(countyName, e));
    badge.addEventListener("mouseleave", hideMapHover);
    badge.addEventListener("click", () => selectCounty(countyName));

    layer.appendChild(badge);
  });
}

function highlightSelectedCountyOnMap() {
  // Highlight polygon in SVG
  document.querySelectorAll(".county-polygon").forEach(path => {
    const county = path.dataset.county;
    if (county === state.currentCounty) {
      path.classList.add("active-county");
    } else {
      path.classList.remove("active-county");
    }
  });

  // Highlight DOM Badges
  document.querySelectorAll(".map-weather-badge").forEach(badge => {
    badge.classList.toggle("selected", badge.dataset.county === state.currentCounty);
  });

  // Highlight Island Chips
  document.querySelectorAll(".island-chip").forEach(chip => {
    chip.classList.toggle("selected", chip.dataset.county === state.currentCounty);
  });
}

function showMapHover(countyName, event) {
  const hoverCard = document.getElementById("mapHoverCard");
  const data = state.weatherData[countyName];
  if (!hoverCard || !data) return;

  const currentSlot = data.slots[0] || {};
  const visuals = getWeatherVisuals(currentSlot.wx, currentSlot.wxCode, 0);

  document.getElementById("hoverCountyName").textContent = countyName;
  document.getElementById("hoverRegionTag").textContent = REGION_NAMES[data.region] || "";
  document.getElementById("hoverWxIcon").textContent = visuals.glyph;
  document.getElementById("hoverTemp").textContent = `${currentSlot.minT}°C ~ ${currentSlot.maxT}°C`;
  document.getElementById("hoverPoP").textContent = `${currentSlot.pop}%`;

  hoverCard.classList.add("visible");
}

function hideMapHover() {
  const hoverCard = document.getElementById("mapHoverCard");
  if (hoverCard) hoverCard.classList.remove("visible");
}

function selectCounty(countyName) {
  if (!state.weatherData[countyName]) return;
  state.currentCounty = countyName;
  state.currentTownship = (COUNTY_TOWNSHIPS[countyName] && COUNTY_TOWNSHIPS[countyName][0]) || countyName;
  renderCurrentCounty();
  showToast(`已切換觀測縣市為：${countyName}`, "info");
}

// ==============================================================================
// MODAL DIALOGS: 22 COUNTIES TABLE, RANKINGS, API DOCS
// ==============================================================================
function populateOverviewTable(filterText = "") {
  const tbody = document.getElementById("allCountiesTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  const list = Object.keys(state.weatherData).filter(name => {
    if (!filterText) return true;
    return name.includes(filterText) || REGION_NAMES[state.weatherData[name].region].includes(filterText);
  });

  list.forEach(name => {
    const data = state.weatherData[name];
    const s0 = data.slots[0] || {};
    const s1 = data.slots[1] || {};
    const s2 = data.slots[2] || {};
    const v0 = getWeatherVisuals(s0.wx, s0.wxCode, 0);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${name}</strong></td>
      <td><span class="region-pill">${REGION_NAMES[data.region]}</span></td>
      <td>${v0.glyph} ${s0.wx}</td>
      <td>${s0.minT}° ~ ${s0.maxT}°C</td>
      <td>${s1.minT}° ~ ${s1.maxT}°C</td>
      <td>${s2.minT}° ~ ${s2.maxT}°C</td>
      <td><span class="text-blue"><i class="fa-solid fa-umbrella"></i> ${s0.pop}%</span></td>
      <td>${s0.comfort}</td>
      <td><button class="table-action-btn" data-county="${name}">檢視</button></td>
    `;

    tr.querySelector(".table-action-btn").addEventListener("click", () => {
      selectCounty(name);
      closeModal("overviewModal");
    });

    tbody.appendChild(tr);
  });
}

function populateRankings() {
  const hotList = document.getElementById("topHotList");
  const coldList = document.getElementById("topColdList");
  if (!hotList || !coldList) return;

  hotList.innerHTML = "";
  coldList.innerHTML = "";

  const items = Object.keys(state.weatherData).map(name => {
    const s0 = state.weatherData[name].slots[0] || {};
    return {
      name,
      maxT: s0.maxT || 0,
      minT: s0.minT || 99,
      wx: s0.wx || ""
    };
  });

  // Top Hot (Highest MaxT)
  const sortedHot = [...items].sort((a, b) => b.maxT - a.maxT).slice(0, 5);
  sortedHot.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "ranking-item";
    div.innerHTML = `
      <div style="display:flex;align-items:center;">
        <span class="rank-index">${idx + 1}</span>
        <strong>${item.name}</strong>
      </div>
      <div>
        <span class="text-rose" style="font-size:1.1rem;font-weight:800;">${item.maxT}°C</span>
        <span style="font-size:0.8rem;color:var(--text-muted);margin-left:6px;">(${item.wx})</span>
      </div>
    `;
    div.addEventListener("click", () => {
      selectCounty(item.name);
      closeModal("rankingModal");
    });
    hotList.appendChild(div);
  });

  // Top Cold (Lowest MinT)
  const sortedCold = [...items].sort((a, b) => a.minT - b.minT).slice(0, 5);
  sortedCold.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "ranking-item";
    div.innerHTML = `
      <div style="display:flex;align-items:center;">
        <span class="rank-index">${idx + 1}</span>
        <strong>${item.name}</strong>
      </div>
      <div>
        <span class="text-blue" style="font-size:1.1rem;font-weight:800;">${item.minT}°C</span>
        <span style="font-size:0.8rem;color:var(--text-muted);margin-left:6px;">(${item.wx})</span>
      </div>
    `;
    div.addEventListener("click", () => {
      selectCounty(item.name);
      closeModal("rankingModal");
    });
    coldList.appendChild(div);
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("open");
    if (modalId === "overviewModal") populateOverviewTable();
    if (modalId === "rankingModal") populateRankings();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
}

// ==============================================================================
// GPS GEOLOCATION & CLOSEST COUNTY MATCHING
// ==============================================================================
function handleGPSLocate() {
  if (!navigator.geolocation) {
    showToast("您的瀏覽器不支援地理位置定位功能", "warning");
    return;
  }

  showToast("正在透過 GPS 定位您的位置...", "info");

  navigator.geolocation.getCurrentPosition(
    pos => {
      const uLat = pos.coords.latitude;
      const uLon = pos.coords.longitude;
      let closestCounty = "臺北市";
      let minDist = Infinity;

      Object.keys(COUNTY_CONFIG).forEach(cName => {
        const conf = COUNTY_CONFIG[cName];
        const dist = Math.hypot(conf.lat - uLat, conf.lon - uLon);
        if (dist < minDist) {
          minDist = dist;
          closestCounty = cName;
        }
      });

      selectCounty(closestCounty);
      showToast(`GPS 定位成功！已為您切換至距離最近的【${closestCounty}】`, "success");
    },
    err => {
      showToast("定位授權被拒絕或逾時，已保留原觀測縣市。", "warning");
    },
    { timeout: 8000 }
  );
}

// ==============================================================================
// FAVORITES SYSTEM
// ==============================================================================
function toggleFavoriteCurrent() {
  const cName = state.currentCounty;
  const idx = state.favorites.indexOf(cName);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast(`已從我的收藏移除【${cName}】`, "info");
  } else {
    state.favorites.push(cName);
    showToast(`已成功將【${cName}】加入我的收藏！`, "success");
  }
  localStorage.setItem("taiwan_weather_favs", JSON.stringify(state.favorites));
  updateFavoritesUI();
  renderCurrentCounty();
}

function updateFavoritesUI() {
  const countElem = document.getElementById("favCount");
  if (countElem) countElem.textContent = state.favorites.length;
}

// ==============================================================================
// AMBIENT SOUND SYNTHESIZER (Web Audio API)
// ==============================================================================
function toggleAmbientSound() {
  const icon = document.getElementById("soundIcon");
  if (state.isSoundPlaying) {
    stopAmbientSound();
    state.isSoundPlaying = false;
    if (icon) icon.className = "fa-solid fa-volume-xmark";
    showToast("已關閉環境微氣候氛圍音效", "info");
  } else {
    startAmbientSound();
    state.isSoundPlaying = true;
    if (icon) icon.className = "fa-solid fa-volume-high text-primary";
    showToast("已啟動放鬆自然環境音效 (Web Audio Synthesizer)", "success");
  }
}

function startAmbientSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!state.audioCtx) state.audioCtx = new AudioContext();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

    // Create pink noise buffer for soft rain/wind breeze
    const bufferSize = state.audioCtx.sampleRate * 2;
    const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = state.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter
    const filter = state.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, state.audioCtx.currentTime);

    // Gain
    const gainNode = state.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.08, state.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(state.audioCtx.destination);

    whiteNoise.start(0);
    state.audioNodes = { whiteNoise, gainNode };
  } catch (err) {
    console.error("Audio Synthesis error:", err);
  }
}

function stopAmbientSound() {
  if (state.audioNodes && state.audioNodes.whiteNoise) {
    try {
      state.audioNodes.whiteNoise.stop();
      state.audioNodes.whiteNoise.disconnect();
    } catch (e) {}
  }
}

// ==============================================================================
// TOAST NOTIFICATIONS
// ==============================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "fa-solid fa-circle-info text-primary";
  if (type === "success") icon = "fa-solid fa-circle-check text-emerald";
  if (type === "warning") icon = "fa-solid fa-triangle-exclamation text-amber";

  toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==============================================================================
// EVENT LISTENERS INITIALIZATION
// ==============================================================================
function setupEventListeners() {
  // Search Bar
  const searchInput = document.getElementById("countySearchInput");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      if (clearBtn) clearBtn.style.display = q ? "block" : "none";
      if (!q) return;

      // Find matching county or township
      const matchedCounty = Object.keys(COUNTY_CONFIG).find(name => {
        if (name.includes(q)) return true;
        const ts = COUNTY_TOWNSHIPS[name] || [];
        return ts.some(t => t.includes(q));
      });

      if (matchedCounty) {
        selectCounty(matchedCounty);
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = searchInput.value.trim();
        const matched = Object.keys(COUNTY_CONFIG).find(name => name.includes(q));
        if (matched) selectCounty(matched);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      clearBtn.style.display = "none";
    });
  }

  // Geolocation Button
  const geoBtn = document.getElementById("geoLocateBtn");
  if (geoBtn) geoBtn.addEventListener("click", handleGPSLocate);

  // Refresh Button
  const refreshBtn = document.getElementById("refreshDataBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", fetchWeatherData);

  // Sound Button
  const soundBtn = document.getElementById("ambientSoundBtn");
  if (soundBtn) soundBtn.addEventListener("click", toggleAmbientSound);

  // Theme Toggle Button
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      state.isLightMode = !state.isLightMode;
      document.body.classList.toggle("light-mode", state.isLightMode);
      if (themeIcon) {
        themeIcon.className = state.isLightMode ? "fa-solid fa-sun text-amber" : "fa-solid fa-moon";
      }
      showToast(state.isLightMode ? "已切換至白晝清新明亮主題" : "已切換至深邃極光暗色主題", "info");
    });
  }

  // Region Navigation Tabs
  document.querySelectorAll(".region-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".region-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const region = tab.dataset.region;
      state.currentRegionFilter = region;

      if (region === "favorites") {
        if (state.favorites.length > 0) {
          selectCounty(state.favorites[0]);
        } else {
          showToast("您尚未收藏任何縣市，請點擊愛心圖示新增！", "info");
        }
      } else if (region !== "all") {
        const firstInRegion = Object.keys(COUNTY_CONFIG).find(c => COUNTY_CONFIG[c].region === region);
        if (firstInRegion) selectCounty(firstInRegion);
      }
    });
  });

  // Township Dropdown Change
  const townshipSelect = document.getElementById("townshipSelect");
  if (townshipSelect) {
    townshipSelect.addEventListener("change", (e) => {
      state.currentTownship = e.target.value;
      showToast(`已選定 ${state.currentCounty} ${state.currentTownship} 鄉鎮微氣候觀測`, "info");
    });
  }

  // Favorite Toggle
  const favBtn = document.getElementById("favCurrentBtn");
  if (favBtn) favBtn.addEventListener("click", toggleFavoriteCurrent);

  // Map Mode Switchers
  document.querySelectorAll(".map-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".map-mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.mapMode = btn.dataset.mode;
      renderMapBadges();
    });
  });

  // SVG Paths Click
  document.querySelectorAll(".county-polygon").forEach(path => {
    path.addEventListener("click", () => {
      const c = path.dataset.county;
      if (c) selectCounty(c);
    });
  });

  // Reset Map View
  const resetBtn = document.getElementById("resetMapSelectionBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => selectCounty("苗栗縣"));
  }

  // Modals Open
  const openOverviewBtn = document.getElementById("openOverviewModalBtn");
  if (openOverviewBtn) openOverviewBtn.addEventListener("click", () => openModal("overviewModal"));

  const openRankingBtn = document.getElementById("openRankingModalBtn");
  if (openRankingBtn) openRankingBtn.addEventListener("click", () => openModal("rankingModal"));

  const openApiDocBtn = document.getElementById("openApiDocModalBtn");
  if (openApiDocBtn) openApiDocBtn.addEventListener("click", () => openModal("apiDocModal"));

  // Modals Close
  const closeOverviewBtn = document.getElementById("closeOverviewModalBtn");
  if (closeOverviewBtn) closeOverviewBtn.addEventListener("click", () => closeModal("overviewModal"));

  const closeRankingBtn = document.getElementById("closeRankingModalBtn");
  if (closeRankingBtn) closeRankingBtn.addEventListener("click", () => closeModal("rankingModal"));

  const closeApiDocBtn = document.getElementById("closeApiDocModalBtn");
  if (closeApiDocBtn) closeApiDocBtn.addEventListener("click", () => closeModal("apiDocModal"));

  // Close modal when clicking backdrop
  document.querySelectorAll(".custom-modal-backdrop").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  });

  // Modal Table Search Filter
  const modalFilter = document.getElementById("modalCountyFilter");
  if (modalFilter) {
    modalFilter.addEventListener("input", (e) => {
      populateOverviewTable(e.target.value.trim());
    });
  }
}

// ==============================================================================
// INITIALIZATION ON DOM READY
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  fetchWeatherData();
});
