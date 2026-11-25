(function () {
  'use strict';
  try {
    var M = {"/":"/en/","/leistungen/":"/en/services/","/leistungen/marketingberatung/":"/en/services/marketing-consulting/","/leistungen/it-beratung/":"/en/services/it-consulting/","/leistungen/software-nach-mass/":"/en/services/custom-software/","/fuer-wen/":"/en/who-we-serve/","/ueber-uns/":"/en/about/","/haeufige-fragen/":"/en/faq/","/kontakt/":"/en/contact/","/impressum/":"/en/legal-notice/","/datenschutz/":"/en/privacy/"}, en = M[location.pathname];
    if (!en) return;
    /* ausdrückliche Wahl über den Umschalter (?sprache=de): bleiben, Adresse säubern */
    var qs = new URLSearchParams(location.search);
    if (qs.get('sprache') === 'de') {
      qs.delete('sprache');
      var rest = qs.toString();
      history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      return;
    }
    /* Wer schon auf der Seite surft (Verweis von der eigenen Adresse), wird nie umgeleitet */
    if (document.referrer) { try { if (new URL(document.referrer).origin === location.origin) return; } catch (e) {} }
    /* Suchmaschinen und Link-Vorschauen sehen immer die deutsche Seite */
    if (/bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(navigator.userAgent || '')) return;
    var l = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    if (!l || /^(de|gsw)(-|_|$)/.test(l)) return;
    location.replace(en + location.search + location.hash);
  } catch (e) {}
})();
