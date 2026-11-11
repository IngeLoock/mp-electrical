/* MP Electrical: quote form sending (Web3Forms) and Google Analytics events. */
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  // Sends a checked quote form. Called by the page's own submit handler.
  window.mpSend = function (f) {
    var box = f.closest('.quote');
    var btn = f.querySelector('button[type=submit]');
    var err = f.querySelector('.err');
    if (err) err.remove();
    if (f.botcheck && f.botcheck.checked) return;
    var data = new FormData(f);
    data.append('page', location.pathname);
    if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending...'; }
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.success) throw new Error(j.message || 'send failed');
      box.classList.add('done');
      track('generate_lead', { form_location: location.pathname, job: f.job ? f.job.value : '' });
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
      var p = document.createElement('p');
      p.className = 'err';
      p.innerHTML = 'Sorry, that didn’t go through. Please try again or call <a href="tel:+61438883273">0438 883 273</a>.';
      f.appendChild(p);
    });
  };

  // Clear the red 'required' border once a field is filled in
  document.addEventListener('input', function (e) {
    if (e.target.closest && e.target.closest('form.qf') && e.target.value.trim()) e.target.style.borderColor = '';
  });

  // Phone, email and social clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.indexOf('tel:') === 0) track('click_to_call', { link_url: h, page: location.pathname });
    else if (h.indexOf('mailto:') === 0) track('click_to_email', { link_url: h, page: location.pathname });
    else if (/facebook\.com|instagram\.com/.test(h)) track('click_social', { link_url: h });
  });
})();
