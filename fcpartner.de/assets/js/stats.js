(function () {
  'use strict';
  try {
    if (!/(^|\.)fcpartner\.de$/.test(location.hostname)) return;
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    var u = 'https://leads.fcpartner.de/api/hit';
    var q = new URLSearchParams(location.search);
    var d = JSON.stringify({ p: location.pathname, r: document.referrer, u: q.get('utm_source') || '' });
    /* fetch statt sendBeacon: ohne Cookies (credentials omit) und ohne CORS-Meldung in der Konsole (no-cors); keepalive übersteht einen Seitenwechsel */
    if (window.fetch) fetch(u, { method: 'POST', body: d, keepalive: true, mode: 'no-cors', credentials: 'omit' }).catch(function () {});
    else if (navigator.sendBeacon) navigator.sendBeacon(u, d);
  } catch (e) {}
})();
