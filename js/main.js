/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'occhialeria-niguarda',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google = loro sito (24/9/2026): lunedì solo pomeriggio, mar–sab spezzato, domenica chiuso. */
    hours: {
      0: [],
      1: [['15:30', '19:00']],
      2: [['09:30', '12:30'], ['15:30', '19:00']],
      3: [['09:30', '12:30'], ['15:30', '19:00']],
      4: [['09:30', '12:30'], ['15:30', '19:00']],
      5: [['09:30', '12:30'], ['15:30', '19:00']],
      6: [['09:30', '12:30'], ['15:30', '19:00']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.skip": "enter",
      "nav.home": "L'Occhialeria, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "master opticians since 1955",
      "nav.esame": "Eye test",
      "nav.lenti": "Lenses",
      "nav.montature": "Frames",
      "nav.laboratorio": "Workshop",
      "nav.dove": "Where & hours",
      "cta.chiama": "Call",
      "cta.chiama2": "Call 02 6611 7392",
      "h.aria": "The chart",
      "h.r1": "L'Occhialeria",
      "h.r2": "Master opticians since 1955",
      "h.r3": "Via Terruggia 2 · Niguarda",
      "h.r4": "Eye test · lenses · frames",
      "h.r5": "Workshop repairs · interest-free instalments",
      "h.r6": "If you cannot read this line, come and see us.",
      "h.nota": "Tap the last line. Inside, it works the same way: you read the chart, we measure, and we look for the right lens until every line is sharp.",
      "h.cta1": "Call for an appointment",
      "h.cta2": "Hours and where",
      "h.alt": "The round metal shelf with the frames on display, against the petrol-blue wall of the shop",
      "h.cap": "The shop, Via Terruggia 2",
      "k.maestri": "About us",
      "m.h": "Master opticians since 1955.",
      "m.p": "The shop opened in 1955. Maurizio Bondoni came in 1980, as a boy, to help his father in the workshop: lenses were made of glass then, and were worked by hand before being fitted. In 1986 he qualified as an optician, and he has not stopped since.",
      "m.p2": "On the walls of the shop hang the master optician diploma and black-and-white photographs of opticians of the past at their workbench. They are not decoration: they are the trade we come from.",
      "m.d1": "L'Occhialeria opens, on Via Ornato",
      "m.d2": "Maurizio joins his father in the workshop",
      "m.d3": "his optician qualification",
      "m.alt1": "Maurizio Bondoni in a white coat in front of the frames in the shop",
      "m.alt2": "The framed Master Optician diploma on the wall of the shop",
      "m.alt3": "Inside the shop: petrol-blue walls, light wood furniture and the vintage photographs of opticians at work",
      "e.alt": "The examination room with the chair and the instruments for the eye test",
      "k.esame": "The eye test",
      "e.h": "How well you see, measured.",
      "e.p": "It starts with the chart: reading the optotype line by line tells how well you see, and from there we try until the lens is the right one. No hurry, and you do not leave with the first prescription that works.",
      "e.s1": "Visual acuity",
      "e.s1d": "Reading the chart and the tests to tell apart shapes, sizes and colours, with the instruments in the shop.",
      "e.s2": "With eye doctors",
      "e.s2d": "If something needs a closer look, we work with ophthalmologists: the optician measures, the doctor treats.",
      "e.s3": "Contact lenses",
      "e.s3d": "Custom or disposable, with the tests before fitting and the instructions to put them in, take them out and keep them clean.",
      "k.lenti": "The lenses",
      "l.h": "The right lens, not the first one.",
      "l.p": "Organic or mineral glass, spherical, aspheric or made to measure for your eye: the difference is felt on the nose and seen at the edges.",
      "l.t1": "Spherical",
      "l.t1d": "The classic lens: reliable, for simple prescriptions.",
      "l.t2": "Aspheric",
      "l.t2d": "Thinner and flatter, with less distortion at the edges and a more natural eye behind the lens.",
      "l.t3": "Made to measure",
      "l.t3d": "Calculated on your frame and on how you wear it: the most precise lens that can be made.",
      "l.t4": "And then",
      "l.a1": "Progressive",
      "l.a1d": "Near and far in a single lens, with a habit that takes a few days.",
      "l.a2": "Organic or mineral",
      "l.a2d": "Light and tough the first, harder against scratches the second.",
      "l.a3": "Blue-light filter",
      "l.a3d": "For those who spend the day in front of a screen.",
      "l.a4": "Prescription sunglasses",
      "l.a4d": "Your prescription in the tinted lens too.",
      "k.mont": "The frames",
      "mo.h": "Ten brands you will not find everywhere.",
      "mo.p": "Frames in titanium, acetate, metal, wood, combined: almost all from small Italian and European makers, chosen one by one. Colour, material, fit and face shape are looked at together, in front of the mirror.",
      "mo.d1": "Made in Italy: a craftsman working copper, metal, steel and plastic.",
      "mo.d2": "Every frame is made by hand.",
      "mo.d3": "Unique Italian pieces, handmade, refined and informal.",
      "mo.d4": "From acetate to various woods, to metal.",
      "mo.d5": "Born from a family of Italian opticians.",
      "mo.d6": "Modern, metropolitan style, inspired by New York.",
      "mo.d7": "Retro lines, from the American Seventies.",
      "mo.d8": "Clean lines and minimal design.",
      "mo.d9": "Young, fresh, customisable collections.",
      "mo.d10": "Sunglasses and prescription frames, a reference in the field.",
      "mo.alt1": "Colourful acetate frames laid on the wooden counter",
      "mo.alt2": "A blue frame and a red one, one in front of the other",
      "mo.alt3": "A red frame resting on a brass propeller",
      "mo.mat": "Also frames for children and sunglasses, prescription or not.",
      "k.lab": "The workshop",
      "la.h": "Fitting and repairs, on the premises.",
      "la.p": "The workshop is where it all began in 1980, with glass lenses. Today lenses are fitted and centred here, nose pads and temples are replaced, and frames that got bent or broken are put back in shape.",
      "la.p2": "If they are the glasses you drive or work with, tell us: people who came here talk of jobs ready in less than a day.",
      "la.alt": "The wall of the shop with the wooden shelves, the frames on display and the framed photographs",
      "r.mesi": "months, interest-free",
      "k.rate": "Instalments",
      "r.h": "The price stays the same.",
      "r.p": "Glasses and lenses can be paid over twelve months with no interest: the cost is the one of the day you buy, up to the last instalment. It is arranged in the shop, in five minutes.",
      "k.voci": "Who told us",
      "v.h": "What customers say.",
      "v.badge": "from 70 Google reviews",
      "v.t1": "The expertise",
      "v.t1d": "It is the word that comes back most often: tests done calmly, the lens found after a bad experience elsewhere, progressives that finally work.",
      "v.t2": "The advice",
      "v.t2d": "Choosing the frame together, keeping in mind your taste and how you live, without pushing.",
      "v.t3": "Maurizio",
      "v.t3d": "They call him by name. Whole families who have come here for years, and people who walked in with a broken frame and stayed.",
      "v.cit": "«The job was done in less than 24 hours»",
      "v.citda": "From a Google review (translated)",
      "v.btn": "Read all the reviews on Google",
      "k.dove": "Where and when",
      "d.h": "On the corner of Via Ornato.",
      "d.p": "On Via Ornato since 1955; today a few metres away, on the corner, at Via Terruggia 2. On Monday we open in the afternoon only.",
      "d.no1": "<b>Monday</b> afternoon only, from 3.30 pm.",
      "d.no2": "<b>Sunday</b> closed.",
      "d.strada": "Take me there with Google Maps",
      "d.mappa": "Map: L'Occhialeria, Via Giovanni Terruggia 2, Milan",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "k.dom": "Questions",
      "q.h": "What we are often asked.",
      "q.1": "Where is L'Occhialeria?",
      "r.1": "At Via Giovanni Terruggia 2, on the corner of Via Luigi Ornato, in the Niguarda district of Milan (postcode 20162).",
      "q.2": "Do you do eye tests?",
      "r.2": "Yes: visual acuity check by reading the chart and with dedicated instruments. For further examination we work with ophthalmologists.",
      "q.3": "Do you repair glasses?",
      "r.3": "Yes, in the workshop: fitting lenses, centring, replacements and frame repairs. Bring them in, no appointment needed.",
      "q.4": "Can I pay in instalments?",
      "r.4": "Yes, over 12 months with no interest: the price stays the one of the day of purchase up to the last instalment.",
      "q.5": "What are your hours?",
      "r.5": "Monday 3.30–7 pm; Tuesday to Saturday 9.30 am–12.30 pm and 3.30–7 pm. Closed on Sunday.",
      "q.6": "Do you fit contact lenses?",
      "r.6": "Yes, custom and disposable, with the tests before fitting and the instructions for daily handling and care.",
      "piede.s": "master opticians since 1955 · Milan, Niguarda",
      "piede.d": "Via Giovanni Terruggia 2, 20162 Milan · <a href='tel:+390266117392'>02 6611 7392</a>",
      "piede.b": "Demo website made by <a href='https://bespokestud.io' target='_blank' rel='noopener'>Bespoke Studio</a> · texts, hours and services from the business's public sources; photographs published by the business and on Google Maps.",
      "b.chiama": "Call",
      "b.esame": "Eye test",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · L'Occhialeria — «L'ultima riga.» ═══
     La pagina è un ottotipo. In apertura le righe della tavola compaiono una alla volta,
     come quando l'ottico indica la riga successiva; l'ultima riga, minuscola, si lascia
     leggere solo a chi la tocca. I decimi delle sezioni «scattano» quando il blocco entra.
     Regole: solo gsap.set + gsap.to; nessun elemento-firma è un .reveal; senza GSAP tutto
     resta visibile (il CSS non nasconde niente). */

  /* l'ultima riga si ingrandisce al tocco (funziona anche senza GSAP: è solo CSS) */
  var ultima = document.getElementById('ultimaRiga');
  var rigaUltima = document.getElementById('rigaUltima');
  if (ultima && rigaUltima) {
    ultima.addEventListener('click', function () {
      var on = !rigaUltima.classList.contains('is-letta');
      rigaUltima.classList.toggle('is-letta', on);
      ultima.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* entrata dell'apertura: chiamata dal plumbing a fine intro */
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.apertura__foto img', { scale: 1.06, duration: 1.4, ease: 'power2.out' }, 0)
      .from('.ottotipo .riga', { opacity: 0, x: -14, duration: 0.5, stagger: 0.16 }, 0.05)
      .from('.apertura__nota, .apertura__azioni, .apertura__stato', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, 0.9);
  };

  if (hasGsap && hasST && !reducedMotion) {
    /* i decimi delle sezioni: scattano come il puntatore sulla riga */
    gsap.utils.toArray('.kicker .dec').forEach(function (d) {
      gsap.set(d, { scale: 0.6, opacity: 0, transformOrigin: '0% 50%' });
      gsap.to(d, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.5)', scrollTrigger: { trigger: d, start: 'top 85%', once: true } });
    });
    /* le date di Maurizio e il «12» delle rate: entrano una alla volta */
    gsap.utils.toArray('.maestri__date li, .rate__n').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 12 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: (i % 3) * 0.12, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
  }
})();
