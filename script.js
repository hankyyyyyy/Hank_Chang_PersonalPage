/**
 * DevPortfolio - Modern Personal Portfolio & Real-time Live Clock
 * Pure Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLiveClock();
  initProfileCustomizer();
  initCopyEmail();
  initScrollSpy();
  initDemoButtons();
});

/* ==========================================================================
   1. Live Clock Engine (HH : MM : SS 即時自動更新)
   ========================================================================== */

let is24HourFormat = true;

function initLiveClock() {
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const dateEl = document.getElementById('clock-date');
  const dayEl = document.getElementById('clock-day');
  const ampmEl = document.getElementById('clock-ampm');
  const progressFill = document.getElementById('second-progress-bar');
  const formatBtn = document.getElementById('clock-format-btn');
  const formatLabel = document.getElementById('format-label');

  const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function updateClock() {
    const now = new Date();

    // 日期部分
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const dayName = daysOfWeek[now.getDay()];

    if (dateEl) dateEl.textContent = `${year} 年 ${month} 月 ${date} 日`;
    if (dayEl) dayEl.textContent = dayName;

    // 時間部分 (HH, MM, SS)
    let rawHours = now.getHours();
    const rawMinutes = now.getMinutes();
    const rawSeconds = now.getSeconds();

    let displayHours = rawHours;
    let ampmText = '24H';

    if (!is24HourFormat) {
      ampmText = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12;
      displayHours = displayHours ? displayHours : 12; // 0 點轉 12 點
    }

    const hh = String(displayHours).padStart(2, '0');
    const mm = String(rawMinutes).padStart(2, '0');
    const ss = String(rawSeconds).padStart(2, '0');

    if (hoursEl) hoursEl.textContent = hh;
    if (minutesEl) minutesEl.textContent = mm;
    if (secondsEl) secondsEl.textContent = ss;
    if (ampmEl) ampmEl.textContent = ampmText;

    // 秒數進度條 (0 ~ 59 秒換算百分比)
    if (progressFill) {
      const percent = ((rawSeconds + 1) / 60) * 100;
      progressFill.style.width = `${percent}%`;
    }
  }

  // 立即執行一次，防止初次載入時延遲 1 秒
  updateClock();

  // 每 1000 毫秒 (1 秒) 自動觸發更新
  setInterval(updateClock, 1000);

  // 12 / 24 小時制切換
  if (formatBtn) {
    formatBtn.addEventListener('click', () => {
      is24HourFormat = !is24HourFormat;
      formatLabel.textContent = is24HourFormat ? '切換至 12 小時制' : '切換至 24 小時制';
      updateClock();
      showToast(is24HourFormat ? '已切換為 24 小時制' : '已切換為 12 小時制 (AM/PM)');
    });
  }
}

/* ==========================================================================
   2. Theme System (深色 / 淺色切換與持久化)
   ========================================================================== */

function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const root = document.documentElement;

  // 讀取 localStorage 或預設 dark
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', targetTheme);
      localStorage.setItem('portfolio-theme', targetTheme);
      showToast(`已切換為${targetTheme === 'dark' ? '深色' : '淺色'}模式`);
    });
  }
}

/* ==========================================================================
   3. Profile Customizer & LocalStorage (直接在瀏覽器自訂個人資料)
   ========================================================================== */

const STORAGE_KEY = 'portfolio-profile-data';

function initProfileCustomizer() {
  const editBtn = document.getElementById('edit-profile-btn');
  const modal = document.getElementById('edit-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('edit-profile-form');

  // DOM 元素
  const nameEl = document.getElementById('profile-name');
  const majorEl = document.getElementById('profile-major');
  const bioEl = document.getElementById('profile-bio');
  const githubBtn = document.getElementById('profile-github-btn');
  const emailBtn = document.getElementById('profile-email-btn');
  const footerName = document.getElementById('footer-name');

  // 載入已儲存的個人資料
  function loadProfile() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // 若存在舊範例名稱，自動清除以新設定的 Hank Chang 為準
        if (data.name && (data.name.includes('王小明') || data.name.includes('Alex Wang'))) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        if (data.name) {
          nameEl.innerHTML = escapeHtml(data.name);
          if (footerName) footerName.textContent = data.name;
        }
        if (data.major) {
          majorEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline-icon">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            ${escapeHtml(data.major)}
          `;
        }
        if (data.bio) bioEl.textContent = data.bio;
        if (data.github) githubBtn.href = data.github;
        if (data.email) emailBtn.href = `mailto:${data.email}`;
      } catch (err) {
        console.error('Failed to parse profile data:', err);
      }
    }
  }

  loadProfile();

  function openModal() {
    // 預先填入目前 DOM 的數值
    document.getElementById('input-name').value = nameEl.textContent.trim();
    document.getElementById('input-major').value = majorEl.textContent.trim();
    document.getElementById('input-bio').value = bioEl.textContent.trim();
    document.getElementById('input-github').value = githubBtn.getAttribute('href');
    const mailHref = emailBtn.getAttribute('href') || '';
    document.getElementById('input-email').value = mailHref.replace('mailto:', '');

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (editBtn) editBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // 點擊 Modal 背景關閉
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // 表單送出儲存
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('input-name').value.trim(),
      major: document.getElementById('input-major').value.trim(),
      bio: document.getElementById('input-bio').value.trim(),
      github: document.getElementById('input-github').value.trim() || 'https://github.com',
      email: document.getElementById('input-email').value.trim() || 'student@university.edu.tw'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    loadProfile();
    closeModal();
    showToast('個人資訊已成功更新並儲存！🎉');
  });
}

/* ==========================================================================
   4. Copy Email & Toast Notification
   ========================================================================== */

function initCopyEmail() {
  const copyBtn = document.getElementById('quick-copy-email-btn');
  const emailBtn = document.getElementById('profile-email-btn');

  if (copyBtn && emailBtn) {
    copyBtn.addEventListener('click', () => {
      const email = emailBtn.getAttribute('href').replace('mailto:', '').trim();
      navigator.clipboard.writeText(email)
        .then(() => {
          showToast(`已複製信箱：${email} 📋`);
        })
        .catch(() => {
          showToast(`信箱地址：${email}`);
        });
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="width: 18px; height: 18px; flex-shrink: 0;">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ==========================================================================
   5. Scroll Spy & Nav Link Highlight
   ========================================================================== */

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

function initDemoButtons() {
  const buttons = document.querySelectorAll('.demo-toast-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-project') || '專案';
      showToast(`已開啟 ${name} 之詳細說明文件與架構圖！`);
    });
  });
}

// 輔助防 XSS
function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
