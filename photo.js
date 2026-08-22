/* =========================================================================
   TECHO — SHARED PHOTO UPLOAD HELPER
   -------------------------------------------------------------------------
   Used by admin.js (Admin's own photo) and student-admission.js (Trainee's
   photo). Lets the user pick a photo from their device gallery, shrinks it
   right in the browser (so uploads stay small and fast), shows an instant
   preview, and uploads it to the backend's "uploadPhoto" action (which
   saves it to Google Drive and returns a public image URL) only at the
   moment the form is actually submitted.
   Include this file BEFORE admin.js / student-admission.js.
   ========================================================================= */

/* Reads an image file, downsizes it, and compresses it as JPEG — retrying
   with a smaller size/lower quality if needed — until the base64 text is
   safely small enough to store directly in a Google Sheets cell (50,000
   char limit). Returns both a data URL (for instant preview) and the
   raw base64 (for uploading). */
function techoReadAndResizeImage(file, maxDim, quality) {
  maxDim = maxDim || 380;
  quality = quality || 0.72;
  const MAX_B64_LEN = 46000;

  return new Promise(function (resolve, reject) {
    if (!file) { reject(new Error('No file selected')); return; }
    if (!file.type || file.type.indexOf('image/') !== 0) { reject(new Error('Please choose an image file')); return; }

    const reader = new FileReader();
    reader.onerror = function () { reject(new Error('Could not read the file')); };
    reader.onload = function () {
      const img = new Image();
      img.onerror = function () { reject(new Error('Could not read the image')); };
      img.onload = function () {
        function drawAt(dim) {
          let w = img.width, h = img.height;
          if (w > dim || h > dim) {
            if (w >= h) { h = Math.round(h * (dim / w)); w = dim; }
            else { w = Math.round(w * (dim / h)); h = dim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          return canvas;
        }
        function attempt(dim, q, triesLeft) {
          const canvas = drawAt(dim);
          const dataUrl = canvas.toDataURL('image/jpeg', q);
          const base64 = dataUrl.split(',')[1];
          if (base64.length <= MAX_B64_LEN || triesLeft <= 0) {
            resolve({ dataUrl: dataUrl, base64: base64, mimeType: 'image/jpeg' });
          } else {
            attempt(Math.max(100, Math.round(dim * 0.8)), Math.max(0.3, q - 0.12), triesLeft - 1);
          }
        }
        attempt(maxDim, quality, 6);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Wires up a file-input + preview + hidden-URL-field group. Call once per
   form (on DOMContentLoaded). Returns a small controller object used at
   submit time to actually upload the chosen photo. */
function techoSetupPhotoUpload(opts) {
  const fileInput = opts.fileInputId ? document.getElementById(opts.fileInputId) : null;
  const previewImg = opts.previewImgId ? document.getElementById(opts.previewImgId) : null;
  const previewBox = opts.previewBoxId ? document.getElementById(opts.previewBoxId) : null;
  const hiddenUrl = opts.hiddenUrlId ? document.getElementById(opts.hiddenUrlId) : null;
  const removeBtn = opts.removeBtnId ? document.getElementById(opts.removeBtnId) : null;
  const errEl = opts.errorId ? document.getElementById(opts.errorId) : null;
  let pendingBase64 = null, pendingMime = null;

  function clearPreview() {
    pendingBase64 = null; pendingMime = null;
    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.removeAttribute('src');
    if (previewBox) previewBox.classList.remove('has-photo');
    if (hiddenUrl) hiddenUrl.value = '';
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      const file = fileInput.files && fileInput.files[0];
      if (errEl) errEl.textContent = '';
      if (!file) return;
      techoReadAndResizeImage(file).then(function (out) {
        pendingBase64 = out.base64;
        pendingMime = out.mimeType;
        if (previewImg) previewImg.src = out.dataUrl;
        if (previewBox) previewBox.classList.add('has-photo');
        if (hiddenUrl) hiddenUrl.value = '';
      }).catch(function (err) {
        if (errEl) errEl.textContent = err.message;
        fileInput.value = '';
      });
    });
  }

  if (removeBtn) removeBtn.addEventListener('click', clearPreview);

  return {
    hasPending: function () { return !!pendingBase64; },
    /* Uploads the chosen photo (if any) via apiFn('uploadPhoto', {...})
       and returns its URL. If nothing new was chosen, returns whatever
       is already in the hidden URL field (usually empty on a new form). */
    upload: async function (apiFn, folder, fileNamePrefix) {
      if (!pendingBase64) return hiddenUrl ? hiddenUrl.value : '';
      const res = await apiFn('uploadPhoto', {
        base64: pendingBase64,
        mimeType: pendingMime,
        folder: folder,
        fileName: (fileNamePrefix || 'photo') + '_' + new Date().getTime() + '.jpg'
      });
      if (res.error) throw new Error(res.error);
      return res.url;
    },
    reset: clearPreview
  };
}
