document.addEventListener('DOMContentLoaded', function () {
  // Policy selector (Code of Conduct / Complaint / Copyright / ... / Terms & Conditions)
  document.querySelectorAll('.policy-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      const key = tab.getAttribute('data-policy');
      document.querySelectorAll('.policy-tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.policy-content').forEach(function (c) { c.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('policy-' + key).classList.add('active');
      document.querySelector('.terms-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Global language selector — applies to every policy's content at once
  document.querySelectorAll('.lang-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      const lang = tab.getAttribute('data-lang');
      document.querySelectorAll('.lang-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.lang-block').forEach(function (block) {
        block.classList.toggle('active', block.getAttribute('data-lang') === lang);
      });
    });
  });
});
