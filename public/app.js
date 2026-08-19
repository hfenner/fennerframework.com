// Progressive enhancement for the contact form + small niceties. The form works
// without JS (plain POST to /api/contact, which redirects back to /?sent=1#contact).
(function () {
  'use strict';
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  if (!form || !status) return;

  var params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') { say('Thanks — we got your request and will be in touch within one business day.', 'ok'); }
  else if (params.get('sent') === '0') { say('Something went wrong sending that. Please call or email us instead.', 'err'); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.name.trim()) return say('Please tell us your name.', 'err');
    if (!data.message || data.message.trim().length < 10) return say('Please add a few details about the project.', 'err');
    if (!(data.email && data.email.trim()) && !(data.phone && data.phone.trim())) return say('Please include a phone number or an email so we can reach you.', 'err');
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; say('Sending…', '');
    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.ok) { form.reset(); say('Thanks — we got your request and will be in touch within one business day.', 'ok'); }
        else say(res.body && res.body.error ? res.body.error : 'Something went wrong. Please call or email us instead.', 'err');
      })
      .catch(function () { say('Network error — please try again, or call or email us.', 'err'); })
      .then(function () { btn.disabled = false; });
  });

  function say(msg, kind) { status.textContent = msg; status.className = 'form-status' + (kind ? ' ' + kind : ''); }
})();
