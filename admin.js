/* =========================================================================
   TECHO — ADMIN PORTAL LOGIC
   -------------------------------------------------------------------------
   Talks to admin-backend.gs (a SEPARATE Apps Script from the enrollment
   form's script). Paste your deployment URL below.
   ========================================================================= */

const ADMIN_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3UmPIGbGPyVLkjcnPeAbTezSLP5ljYHyImD_VvUd5kS5OM6GP3IpOVu4gTIjqcZgWGQ/exec";

async function api(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(ADMIN_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function showScreen(id) {
  document.querySelectorAll('.admin-screen').forEach(function (s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

/* Fun cartoon-style avatar (via DiceBear, free & no key needed) used
   whenever no Photo URL was provided for an admin — styled by role:
   Boss gets a blazer/suit look, Supervisor gets a plain dark t-shirt. */
function safeRole(role) {
  return (role && role !== 'undefined') ? role : 'Supervisor';
}

function avatarUrl(name, role) {
  const seed = encodeURIComponent(name || 'TECHO');
  const clothes = role === 'Boss' ? 'BlazerShirt' : 'CrewNeck';
  const color = role === 'Boss' ? 'Black03' : 'Black';
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + seed +
    '&clotheType=' + clothes + '&clotheColor=' + color;
}

document.addEventListener('DOMContentLoaded', function () {
  async function openNewAdminForm() {
    let status;
    try {
      status = await api('bossExists', {});
    } catch (err) {
      alert('Could not reach the server. Check ADMIN_SCRIPT_URL in admin.js and that the Apps Script is deployed.');
      console.error(err);
      return;
    }

    let bossId = '', bossPassword = '';
    if (status.exists) {
      bossId = prompt('Enter Boss Admin ID to create a new admin:');
      if (bossId === null) return;
      bossPassword = prompt('Enter Boss Password:');
      if (bossPassword === null) return;
    }

    document.getElementById('formCreateAdmin').reset();
    document.getElementById('caCreatedDate').value = new Date().toLocaleString();
    document.getElementById('gateBossId').value = bossId;
    document.getElementById('gateBossPassword').value = bossPassword;
    showScreen('screen-createadmin');
  }
  document.getElementById('btnNewAdmin').addEventListener('click', openNewAdminForm);
  document.getElementById('btnAdminList').addEventListener('click', function () {
    showScreen('screen-adminlist');
    loadAdminList();
  });

  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.getAttribute('data-back');
      showScreen(target);
      if (target === 'screen-adminlist') loadAdminList();
    });
  });

  document.getElementById('formCreateAdmin').addEventListener('submit', onCreateAdminSubmit);
  document.getElementById('formViewGate').addEventListener('submit', onViewGateSubmit);
  document.getElementById('btnUpdateStatus').addEventListener('click', onUpdateStatus);
  document.getElementById('pdStatusActive').addEventListener('change', function () { setStatusIndicator('Active'); });
  document.getElementById('pdStatusInactive').addEventListener('change', function () { setStatusIndicator('Inactive'); });
});

/* ---------------- Admin List ---------------- */
let _allAdmins = [];
let _pendingTargetId = null;
let _currentProfileViewer = null; // {id, password, isBoss}

async function loadAdminList() {
  const wrap = document.getElementById('adminListWrap');
  wrap.innerHTML = '<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</p>';
  let result;
  try {
    result = await api('listAdmins', {});
  } catch (err) {
    wrap.innerHTML = '<p class="loading-text" style="color:var(--red);">Could not reach the server. Check ADMIN_SCRIPT_URL in admin.js and that the Apps Script is deployed.</p>';
    console.error(err);
    return;
  }
  _allAdmins = result.admins || [];
  wrap.innerHTML = '';

  if (!_allAdmins.length) {
    wrap.innerHTML = '<p class="loading-text">No admins yet — create one above.</p>';
    return;
  }

  _allAdmins.forEach(function (a) {
    const item = document.createElement('div');
    item.className = 'plist-item';
    const statusClass = a.Status === 'Active' ? '' : 'inactive';
    const badge = a.Role !== 'Boss' ? '<span class="avatar-badge">T</span>' : '';
    item.innerHTML =
      '<span class="avatar-wrap">' +
      '<img src="' + (a.PhotoURL || avatarUrl(a.FullName, a.Role)) + '" alt="" onerror="this.src=\'' + avatarUrl(a.FullName, a.Role) + '\'">' +
      badge + '</span>' +
      '<div><div class="pl-name">' + a.FullName + '</div><div class="pl-role">' + safeRole(a.Role) + '</div></div>' +
      '<div class="pl-right">' +
      '<span class="pl-status ' + statusClass + '"><i class="fa-solid fa-circle"></i> ' + a.Status + '</span>' +
      '<i class="fa-solid fa-ellipsis-vertical pl-dots"></i>' +
      '</div>';
    item.addEventListener('click', function (ev) {
      if (ev.target.classList.contains('pl-dots')) return; // handled separately
      openViewGate(a.AdminID, a.FullName);
    });
    const dots = item.querySelector('.pl-dots');
    dots.addEventListener('click', function (ev) {
      ev.stopPropagation();
      closeAllDotMenus();
      const menu = document.createElement('div');
      menu.className = 'dot-menu';
      menu.innerHTML = '<button class="dot-menu-item delete">Delete</button>';
      menu.querySelector('.delete').addEventListener('click', function (evt) {
        evt.stopPropagation();
        openDeleteGate(a.AdminID, a.FullName);
      });
      item.style.position = 'relative';
      item.appendChild(menu);
    });
    wrap.appendChild(item);
  });
}

function closeAllDotMenus() {
  document.querySelectorAll('.dot-menu').forEach(function (m) { m.remove(); });
}
document.addEventListener('click', closeAllDotMenus);

async function openDeleteGate(adminId, fullName) {
  let status;
  try {
    status = await api('bossExists', {});
  } catch (err) {
    alert('Could not reach the server.');
    return;
  }

  let bossId = '', bossPassword = '';
  if (status.exists) {
    bossId = prompt('Enter Boss Admin ID to delete "' + fullName + '":');
    if (bossId === null) return;
    bossPassword = prompt('Enter Boss Password:');
    if (bossPassword === null) return;
  } else {
    if (!confirm('No Boss exists yet — delete "' + fullName + '" without verification?')) return;
  }

  api('deleteAdmin', { bossId: bossId, bossPassword: bossPassword, targetAdminId: adminId, noBossOverride: !status.exists })
    .then(function (result) {
      if (result.error) { alert(result.error); return; }
      alert(fullName + ' has been deleted.');
      loadAdminList();
    })
    .catch(function (err) {
      alert('Could not reach the server.');
      console.error(err);
    });
}

/* ---------------- View Profile gate ---------------- */
function openViewGate(adminId, fullName) {
  _pendingTargetId = adminId;
  document.getElementById('gateTargetName').textContent = fullName;
  document.getElementById('viewGateError').textContent = '';
  document.getElementById('formViewGate').reset();
  showScreen('screen-viewgate');
}

async function onViewGateSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('viewGateError');
  errEl.textContent = '';

  const result = await api('viewAdminProfile', {
    targetAdminId: _pendingTargetId,
    enteredId: document.getElementById('viewGateId').value.trim(),
    enteredPassword: document.getElementById('viewGatePassword').value
  });
  if (result.error) { errEl.textContent = result.error; return; }

  _currentProfileViewer = { id: result.viewerId, password: result.viewerPassword, isBoss: result.viewerIsBoss };
  renderProfile(result);
}

/* ---------------- Profile Detail (password never shown) ---------------- */
function renderProfile(a) {
  const pdBadge = a.Role !== 'Boss' ? '<span class="avatar-badge pd-badge">T</span>' : '';
  document.getElementById('pdPhotoWrap').innerHTML =
    '<span class="avatar-wrap">' +
    '<img src="' + (a.PhotoURL || avatarUrl(a.FullName, a.Role)) + '" alt="" onerror="this.src=\'' + avatarUrl(a.FullName, a.Role) + '\'">' +
    pdBadge + '</span>';
  document.getElementById('pdName').textContent = a.FullName;
  document.getElementById('pdRole').textContent = safeRole(a.Role);

  document.getElementById('pdStatusActive').checked = (a.Status === 'Active');
  document.getElementById('pdStatusInactive').checked = (a.Status !== 'Active');
  setStatusIndicator(a.Status);
  document.getElementById('statusError').textContent = '';

  const rows = [
    ['fa-id-badge', 'Admin ID', a.AdminID],
    ['fa-phone', 'Mobile Number', a.Phone],
    ['fa-brands fa-whatsapp', 'WhatsApp Number', a.WhatsApp],
    ['fa-envelope', 'Email Address', a.Email],
    ['fa-location-dot', 'Address', a.Address],
    ['fa-calendar-days', 'Created Date', a.CreatedDate],
    ['fa-user', 'Created By', a.CreatedBy]
  ];
  document.getElementById('pdRows').innerHTML = rows.map(function (r) {
    return '<div class="pd-row"><i class="fa-solid ' + r[0] + '"></i><span class="pd-k">' + r[1] + '</span><span class="pd-sep">:</span><span class="pd-v">' + (r[2] || '—') + '</span></div>';
  }).join('');

  document.getElementById('screen-profile').dataset.targetId = a.AdminID;
  showScreen('screen-profile');
}

function setStatusIndicator(status) {
  const el = document.getElementById('pdStatusLive');
  const isActive = status === 'Active';
  el.className = 'pd-status-live ' + (isActive ? 'active' : 'inactive');
  el.innerHTML = '<i class="fa-solid fa-circle"></i> ' + status;
}

async function onUpdateStatus() {
  const errEl = document.getElementById('statusError');
  errEl.textContent = '';

  const newStatus = document.getElementById('pdStatusActive').checked ? 'Active' : 'Inactive';
  const targetId = document.getElementById('screen-profile').dataset.targetId;

  const bossId = prompt('Enter Boss Admin ID to update status:');
  if (bossId === null) return;
  const bossPassword = prompt('Enter Boss Password:');
  if (bossPassword === null) return;

  let result;
  try {
    result = await api('setAdminStatus', { bossId: bossId, bossPassword: bossPassword, targetAdminId: targetId, status: newStatus });
  } catch (err) {
    errEl.textContent = 'Could not reach the server.';
    console.error(err);
    return;
  }
  if (result.error) { errEl.textContent = result.error; return; }
  setStatusIndicator(newStatus);
  errEl.style.color = 'var(--green)';
  errEl.textContent = 'Status updated to ' + newStatus + '.';
}

/* ---------------- Create Admin ---------------- */
async function onCreateAdminSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('createError');
  errEl.textContent = '';

  const statusEl = document.querySelector('input[name="caStatus"]:checked');
  const addressParts = [
    document.getElementById('caAddress').value.trim(),
    document.getElementById('caCity').value.trim(),
    document.getElementById('caState').value.trim(),
    document.getElementById('caPin').value.trim()
  ].filter(Boolean).join(', ');

  const payload = {
    photoUrl: document.getElementById('caPhoto').value.trim(),
    fullName: document.getElementById('caName').value.trim(),
    phone: document.getElementById('caPhone').value.trim(),
    whatsapp: document.getElementById('caWhatsapp').value.trim(),
    email: document.getElementById('caEmail').value.trim(),
    aadhaar: document.getElementById('caAadhaar').value.trim(),
    pan: document.getElementById('caPan').value.trim(),
    address: addressParts,
    role: document.getElementById('caRole').value,
    status: statusEl ? statusEl.value : 'Active',
    createdBy: document.getElementById('caCreatedBy').value.trim() || 'Self',
    bossId: document.getElementById('gateBossId').value.trim(),
    bossPassword: document.getElementById('gateBossPassword').value
  };

  let result;
  try {
    result = await api('createAdmin', payload);
  } catch (err) {
    errEl.textContent = 'Could not reach the server. Check that ADMIN_SCRIPT_URL is set correctly in admin.js, and that the Apps Script is deployed as "Anyone" access.';
    console.error(err);
    return;
  }
  if (result.error) { errEl.textContent = result.error; return; }

  document.getElementById('createdId').textContent = result.id;
  document.getElementById('createdPassword').textContent = result.password;
  document.getElementById('createdRole').textContent = result.role;
  showScreen('screen-created');
  document.getElementById('formCreateAdmin').reset();
}
