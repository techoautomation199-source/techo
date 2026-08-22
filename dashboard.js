/* =========================================================================
   TECHO — ATTENDANCE DASHBOARD
   -------------------------------------------------------------------------
   Talks to google-apps-script.gs — the ONE merged backend for the whole
   site. The deployment URL lives in config.js (loaded before this file)
   as TECHO_SCRIPT_URL — update it there, not here.
   ========================================================================= */

async function dashApi(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function curLang() { return localStorage.getItem('techoLang') || 'en'; }
function tText(key, fallback) {
  return (window.TECHO_I18N && TECHO_I18N[key] && TECHO_I18N[key][curLang()]) || fallback;
}

function renderPie(pieId, presentCount, absentCount) {
  const pie = document.getElementById(pieId);
  if (!pie) return;
  const total = presentCount + absentCount;
  if (total === 0) {
    pie.style.background = 'conic-gradient(var(--border) 0deg 360deg)';
    return;
  }
  const presentDeg = (presentCount / total) * 360;
  pie.style.background =
    'conic-gradient(var(--green) 0deg ' + presentDeg + 'deg, var(--red) ' + presentDeg + 'deg 360deg)';
}

async function loadSummary() {
  try {
    const data = await dashApi('getAttendanceSummary', {});
    if (data.error) return;

    document.getElementById('dTotalStudents').textContent = data.totalStudents ?? 0;
    document.getElementById('dTodayPresent').textContent = data.todayPresent ?? 0;
    document.getElementById('dTodayAbsent').textContent = data.todayAbsent ?? 0;
    document.getElementById('dashTodayDate').textContent = tText('dash_today_label', 'Today') + ': ' + (data.today || '');

    document.getElementById('legendTodayPresent').textContent = data.todayPresent ?? 0;
    document.getElementById('legendTodayAbsent').textContent = data.todayAbsent ?? 0;
    renderPie('todayPie', data.todayPresent ?? 0, data.todayAbsent ?? 0);

    document.getElementById('yearChartTitle').textContent = (data.year || '') + ' ' + tText('dash_year_chart', "'s Attendance");
    document.getElementById('legendYearPresent').textContent = data.yearPresent ?? 0;
    document.getElementById('legendYearAbsent').textContent = data.yearAbsent ?? 0;
    renderPie('yearPie', data.yearPresent ?? 0, data.yearAbsent ?? 0);

    document.getElementById('monthChartTitle').textContent =
      (data.currentMonthName || '') + ' ' + (data.year || '') + ' — ' + tText('dash_month_chart_suffix', 'Attendance');
    document.getElementById('legendMonthPresent').textContent = data.monthPresent ?? 0;
    document.getElementById('legendMonthAbsent').textContent = data.monthAbsent ?? 0;
    renderPie('monthPie', data.monthPresent ?? 0, data.monthAbsent ?? 0);
  } catch (err) {
    console.error('Could not load attendance summary:', err);
  }
}

function statusLabel(status) {
  if (status === 'Present') return tText('present', 'Present');
  if (status === 'Absent') return tText('absent', 'Absent');
  return tText('dash_holiday', 'Holiday');
}

function statusPill(status) {
  const cls = status === 'Present' ? 'att-status-present' : (status === 'Absent' ? 'att-status-absent' : 'att-status-holiday');
  return '<span class="att-status-pill ' + cls + '">' + statusLabel(status) + '</span>';
}

let _lookupMode = 'admin';
let _calYear = new Date().getFullYear();
let _allHolidays = [];

function applyDashLang() {
  if (window.techoApplyLang) techoApplyLang(curLang());
}

/* ---------------- yearly holiday calendar ---------------- */
function buildMonthMini(year, month, holidayMap) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = first.getDay();

  let cells = '';
  for (let i = 0; i < startWeekday; i++) cells += '<span class="cal-day cal-day-empty"></span>';
  for (let d = 1; d <= daysInMonth; d++) {
    const key = new Date(year, month, d).toLocaleDateString();
    const reason = holidayMap.get(key);
    const isHoliday = !!reason;
    cells += '<span class="cal-day' + (isHoliday ? ' cal-day-holiday' : '') + '"' +
      (isHoliday ? ' title="' + reason.replace(/"/g, '&quot;') + '"' : '') + '>' + d + '</span>';
  }

  return '<div class="cal-month-box">' +
    '<div class="cal-month-title">' + monthNames[month] + '</div>' +
    '<div class="cal-weekdays"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>' +
    '<div class="cal-days-grid">' + cells + '</div>' +
    '</div>';
}

function renderYearCalendar() {
  const holidayMap = new Map();
  _allHolidays.forEach(function (h) {
    const d = new Date(h.Date);
    if (!isNaN(d)) holidayMap.set(d.toLocaleDateString(), h.Reason || '');
  });

  let html = '';
  for (let m = 0; m < 12; m++) html += buildMonthMini(_calYear, m, holidayMap);
  document.getElementById('calMonthsGrid').innerHTML = html;
  document.getElementById('calYearLabel').textContent = _calYear;

  const yearHolidays = _allHolidays.filter(function (h) {
    const d = new Date(h.Date);
    return !isNaN(d) && d.getFullYear() === _calYear;
  }).sort(function (a, b) { return new Date(a.Date) - new Date(b.Date); });

  const listWrap = document.getElementById('calHolidayList');
  if (!yearHolidays.length) {
    listWrap.innerHTML = '<p class="att-log-empty">' + tText('dash_no_holidays', 'No holidays marked for this year yet.') + '</p>';
  } else {
    listWrap.innerHTML = yearHolidays.map(function (h) {
      return '<div class="cal-holiday-row">' +
        '<span class="cal-holiday-date">' + h.Date + '</span>' +
        '<span class="cal-holiday-reason">' + (h.Reason || '') + '</span>' +
        '<span class="cal-holiday-by">' + (h.MarkedByName || h.MarkedBy || '') + '</span>' +
        '</div>';
    }).join('');
  }
}

async function loadHolidaysAndCalendar() {
  try {
    const res = await dashApi('listHolidaysPublic', {});
    _allHolidays = res.holidays || [];
  } catch (err) {
    console.error('Could not load holidays:', err);
    _allHolidays = [];
  }
  renderYearCalendar();
}

document.addEventListener('DOMContentLoaded', function () {
  applyDashLang();
  loadSummary();
  loadHolidaysAndCalendar();

  document.getElementById('btnRefreshDash').addEventListener('click', function () {
    loadSummary();
    loadHolidaysAndCalendar();
  });

  document.getElementById('calPrevYear').addEventListener('click', function () {
    _calYear--;
    renderYearCalendar();
  });
  document.getElementById('calNextYear').addEventListener('click', function () {
    _calYear++;
    renderYearCalendar();
  });

  /* ---------------- Admin vs Self lookup mode toggle ---------------- */
  const modeToggle = document.getElementById('lookupModeToggle');
  const adminFields = document.getElementById('lkAdminFields');
  const selfFields = document.getElementById('lkSelfFields');
  modeToggle.querySelectorAll('.lmt-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeToggle.querySelectorAll('.lmt-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _lookupMode = btn.getAttribute('data-mode');
      adminFields.style.display = (_lookupMode === 'admin') ? 'grid' : 'none';
      selfFields.style.display = (_lookupMode === 'self') ? 'grid' : 'none';
    });
  });

  document.getElementById('btnLookupAttendance').addEventListener('click', async function () {
    const errEl = document.getElementById('lookupError');
    const wrap = document.getElementById('attendanceLogWrap');
    errEl.textContent = '';
    wrap.innerHTML = '';

    const studentId = document.getElementById('lkStudentId').value.trim();
    if (!studentId) {
      errEl.textContent = tText('dash_enter_trainee_id', 'Please enter a Trainee ID.');
      return;
    }

    let payload = { studentId: studentId };

    if (_lookupMode === 'admin') {
      const adminId = document.getElementById('lkAdminId').value.trim();
      const adminPassword = document.getElementById('lkAdminPassword').value;
      if (!adminId || !adminPassword) {
        errEl.textContent = tText('dash_fill_admin_creds', 'Please fill Admin ID and Admin Password.');
        return;
      }
      payload.adminId = adminId;
      payload.adminPassword = adminPassword;
    } else {
      const studentPassword = document.getElementById('lkStudentPassword').value;
      if (!studentPassword) {
        errEl.textContent = tText('dash_fill_trainee_password', 'Please enter your Trainee Password.');
        return;
      }
      payload.studentPassword = studentPassword;
    }

    const result = await dashApi('getStudentAttendanceLog', payload);

    if (result.error) { errEl.textContent = result.error; return; }

    const log = result.log || [];
    if (!log.length) {
      wrap.innerHTML = '<p class="att-log-empty">' + tText('dash_no_entries', 'No attendance entries found for this Trainee ID yet.') + '</p>';
      return;
    }

    wrap.innerHTML =
      '<table class="att-log-table"><thead><tr>' +
      '<th>' + tText('date', 'Date') + '</th>' +
      '<th>' + tText('dash_status', 'Status') + '</th>' +
      '<th>' + tText('dash_time', 'Time') + '</th>' +
      '<th>' + tText('dash_holiday_reason', 'Reason') + '</th>' +
      '<th>' + tText('dash_declared_by', 'Declared By') + '</th>' +
      '</tr></thead><tbody>' +
      log.map(function (r) {
        return '<tr>' +
          '<td>' + (r.Date || '') + '</td>' +
          '<td>' + statusPill(r.Status || '') + '</td>' +
          '<td>' + (r.Time || '—') + '</td>' +
          '<td>' + (r.Reason || '—') + '</td>' +
          '<td>' + (r.Status === 'Holiday' ? (r.DeclaredBy || '—') : '—') + '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table>';
  });

  document.getElementById('btnAddHoliday').addEventListener('click', async function () {
    const errEl = document.getElementById('holidayError');
    const successEl = document.getElementById('holidaySuccess');
    errEl.textContent = '';
    successEl.textContent = '';

    const date = document.getElementById('holAdminDate').value;
    const reason = document.getElementById('holAdminReason').value.trim();
    const adminId = document.getElementById('holAdminId').value.trim();
    const adminPassword = document.getElementById('holAdminPassword').value;

    if (!date || !reason || !adminId || !adminPassword) {
      errEl.textContent = tText('dash_fill_holiday_fields', 'Please fill Date, Reason, Admin ID and Admin Password.');
      return;
    }

    const result = await dashApi('addHoliday', {
      date: date, reason: reason, adminId: adminId, adminPassword: adminPassword
    });

    if (result.error) { errEl.textContent = result.error; return; }

    successEl.textContent = tText('dash_holiday_marked', 'Holiday marked for') + ' ' + date + '. ' +
      tText('dash_holiday_marked_note', "It will now show up in every trainee's attendance record.");
    document.getElementById('holAdminDate').value = '';
    document.getElementById('holAdminReason').value = '';
    document.getElementById('holAdminPassword').value = '';
    loadHolidaysAndCalendar();
  });

  /* ---------------- language toggle ---------------- */
  const langBar = document.getElementById('langToggleBar');
  if (langBar) {
    langBar.querySelectorAll('.lang-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const lang = btn.getAttribute('data-lang');
        localStorage.setItem('techoLang', lang);
        langBar.querySelectorAll('.lang-toggle-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyDashLang();
        loadSummary();
        renderYearCalendar();
      });
    });
    const activeBtn = langBar.querySelector('[data-lang="' + curLang() + '"]');
    if (activeBtn) activeBtn.classList.add('active');
  }
});
