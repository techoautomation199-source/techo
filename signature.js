/* =========================================================================
   TECHO — REUSABLE SIGNATURE PAD
   -------------------------------------------------------------------------
   A white canvas pad that opens in a popup. The person draws their
   signature with mouse or finger, then Save converts it to a small PNG.
   Used by agreements.js (Trainee signature on Undertaking/Declaration
   forms) and admin.js (Admin's own signature on their profile).

   Usage: const dataUrl = await techoOpenSignaturePad();
   Returns a PNG data URL, or null if the person cancelled.
   Requires the shared <div id="signaturePadOverlay">...</div> markup
   (added once per page that uses this) to already be in the HTML.
   ========================================================================= */

let _sigResolve = null;
let _sigCanvas = null;
let _sigCtx = null;
let _sigDrawing = false;

function techoInitSignaturePad() {
  _sigCanvas = document.getElementById('sigPadCanvas');
  if (!_sigCanvas) return;
  _sigCtx = _sigCanvas.getContext('2d');
  _sigCtx.strokeStyle = '#111';
  _sigCtx.lineWidth = 2.4;
  _sigCtx.lineCap = 'round';
  _sigCtx.lineJoin = 'round';

  // The canvas has a fixed internal drawing resolution (width/height
  // attributes) but is displayed at whatever CSS size the layout gives it
  // (e.g. width:100% inside the popup). On phones that displayed size is
  // usually smaller/different than the internal resolution, so touch
  // coordinates (which come back in CSS pixels) must be scaled into the
  // canvas's own coordinate space — otherwise strokes land in the wrong
  // place or effectively never register, which is why it looked "blank"
  // on mobile while working fine on a laptop.
  function pos(e) {
    const rect = _sigCanvas.getBoundingClientRect();
    const t = (e.touches && e.touches.length) ? e.touches[0]
      : (e.changedTouches && e.changedTouches.length) ? e.changedTouches[0] : e;
    const scaleX = _sigCanvas.width / rect.width;
    const scaleY = _sigCanvas.height / rect.height;
    return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
  }
  function start(e) {
    _sigDrawing = true;
    const p = pos(e);
    _sigCtx.beginPath();
    _sigCtx.moveTo(p.x, p.y);
    e.preventDefault();
  }
  function move(e) {
    if (!_sigDrawing) return;
    const p = pos(e);
    _sigCtx.lineTo(p.x, p.y);
    _sigCtx.stroke();
    e.preventDefault();
  }
  function end(e) { _sigDrawing = false; if (e && e.preventDefault) e.preventDefault(); }

  _sigCanvas.addEventListener('mousedown', start);
  _sigCanvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  _sigCanvas.addEventListener('touchstart', start, { passive: false });
  _sigCanvas.addEventListener('touchmove', move, { passive: false });
  _sigCanvas.addEventListener('touchend', end, { passive: false });
  _sigCanvas.addEventListener('touchcancel', end, { passive: false });

  const clearBtn = document.getElementById('sigPadClear');
  const cancelBtn = document.getElementById('sigPadCancel');
  const saveBtn = document.getElementById('sigPadSave');

  if (clearBtn) clearBtn.addEventListener('click', function () {
    _sigCtx.clearRect(0, 0, _sigCanvas.width, _sigCanvas.height);
  });

  if (cancelBtn) cancelBtn.addEventListener('click', function () {
    document.getElementById('signaturePadOverlay').classList.remove('show');
    if (_sigResolve) { _sigResolve(null); _sigResolve = null; }
  });

  if (saveBtn) saveBtn.addEventListener('click', function () {
    const errEl = document.getElementById('sigPadError');
    if (errEl) errEl.textContent = '';

    const blank = document.createElement('canvas');
    blank.width = _sigCanvas.width;
    blank.height = _sigCanvas.height;
    if (_sigCanvas.toDataURL() === blank.toDataURL()) {
      if (errEl) errEl.textContent = 'Please sign before saving.';
      return;
    }

    const dataUrl = _sigCanvas.toDataURL('image/png');
    document.getElementById('signaturePadOverlay').classList.remove('show');
    if (_sigResolve) { _sigResolve(dataUrl); _sigResolve = null; }
  });
}

function techoOpenSignaturePad() {
  return new Promise(function (resolve) {
    if (!_sigCanvas) { resolve(null); return; }
    _sigResolve = resolve;
    _sigCtx.clearRect(0, 0, _sigCanvas.width, _sigCanvas.height);
    const errEl = document.getElementById('sigPadError');
    if (errEl) errEl.textContent = '';
    document.getElementById('signaturePadOverlay').classList.add('show');
  });
}

document.addEventListener('DOMContentLoaded', techoInitSignaturePad);
