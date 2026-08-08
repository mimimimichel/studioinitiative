/* ===== Studio Initiative — page de scan NFC =====
   Séquence : reconnaissance → rapport des agents → diagnostic → agent conversationnel → RDV.
   Aucune dépendance externe. Dégradé proprement si l'API de chat est absente. */

(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- */
  /* 1. Identifiant du tag                                            */
  /* ---------------------------------------------------------------- */

  function resolveTagId() {
    var q = new URLSearchParams(location.search).get('t');
    var h = (location.hash || '').replace(/^#/, '');
    var seg = location.pathname.replace(/\/+$/, '').split('/').pop();
    if (seg === 'k' || /\.html?$/i.test(seg)) seg = '';
    var raw = q || h || seg || '';
    return /^[A-Za-z0-9_-]{1,24}$/.test(raw) ? raw.toUpperCase() : '';
  }

  var TAG = resolveTagId();

  function loadDossier() {
    // Mode aperçu : le générateur dépose le dossier en sessionStorage pour
    // qu'on puisse voir le résultat exact avant de publier quoi que ce soit.
    if (/[?&]preview=1/.test(location.search)) {
      try {
        var raw = sessionStorage.getItem('si-preview');
        if (raw) return Promise.resolve(JSON.parse(raw));
      } catch (e) { /* aperçu illisible : on retombe sur le flux normal */ }
    }

    var tries = TAG ? ['data/' + TAG + '.json', 'data/_demo.json'] : ['data/_demo.json'];
    return tries.reduce(function (chain, url) {
      return chain.catch(function () {
        return fetch(url, { cache: 'no-store' }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        });
      });
    }, Promise.reject());
  }

  /* ---------------------------------------------------------------- */
  /* 2. Dates et compteur vivant                                      */
  /* ---------------------------------------------------------------- */

  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS  = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
               'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function frDate(d) {
    return JOURS[d.getDay()] + ' ' + (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()];
  }

  function elapsed(from) {
    var ms = Math.max(0, Date.now() - from.getTime());
    var mins = Math.floor(ms / 60000);
    return { d: Math.floor(mins / 1440), h: Math.floor(mins % 1440 / 60), m: mins % 60, totalMin: mins };
  }

  function countTo(el, target) {
    if (REDUCED || target === 0) { el.textContent = String(target); return; }
    var t0 = performance.now(), dur = 900;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------------------------------------------------------------- */
  /* 3. Séquence d'ouverture                                          */
  /* ---------------------------------------------------------------- */

  var HEX = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.6 20 7v10l-8 4.4L4 17V7l8-4.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 8.4c.42 1.75 1.35 2.68 3.1 3.1-1.75.42-2.68 1.35-3.1 3.1-.42-1.75-1.35-2.68-3.1-3.1 1.75-.42 2.68-1.35 3.1-3.1Z" fill="currentColor"/></svg>';

  function typeInto(el, text, speed) {
    return new Promise(function (done) {
      if (REDUCED) { el.textContent = text; return done(); }
      var i = 0;
      (function tick() {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, speed);
        else done();
      })();
    });
  }

  function buzz(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* non supporté */ }
  }

  function playIntro(dossier) {
    var meetingDate = new Date(dossier.meeting.datetime);
    var at = function (ms, fn) { setTimeout(fn, REDUCED ? Math.min(ms, 60) : ms); };

    $('.scan-mesh').classList.add('lit');
    at(120, function () { $('.scan-brand').classList.add('in'); });

    at(260, function () {
      var line = $('#tag-line');
      line.classList.add('in');
      var label = 'liaison privée · tag ' + (TAG || dossier.id || '——') + ' · vérifié';
      typeInto($('#tag-text'), label, 34).then(function () {
        line.classList.add('typed');
        buzz(14);
      });
    });

    at(1650, function () {
      $('#hello-name').textContent = dossier.prospect.firstName + '.';
      $('#hello').classList.add('in');
    });

    at(2350, function () {
      var place = dossier.meeting.place ? ' ' + dossier.meeting.place : '';
      // Formulation sans accord genré : le dossier ne connaît pas le genre
      // de la personne, et « reparti(e) » se voit immédiatement.
      $('#meeting-line').textContent = dossier.meeting.line ||
        ('Nous nous sommes vus ' + frDate(meetingDate) + place + '. Vous avez emporté ce porte-clés.');
      $('#meeting-line').classList.add('in');
    });

    at(3150, function () {
      $('#since').classList.add('in');
      tickCounter(meetingDate, true);
      setInterval(function () { tickCounter(meetingDate, false); }, 20000);
    });

    at(4400, function () {
      $('#since-kicker').classList.add('in');
      buzz([10, 60, 10]);
    });

    at(5100, function () {
      $('#scroll-cue').hidden = false;
      $('#skip-btn').hidden = false;
    });
  }

  function tickCounter(meetingDate, animate) {
    var e = elapsed(meetingDate);
    $$('#since-counter b').forEach(function (b) {
      var v = e[b.getAttribute('data-count')];
      if (animate) countTo(b, v); else b.textContent = String(v);
    });
  }

  /* ---------------------------------------------------------------- */
  /* 4. Rendu du dossier                                              */
  /* ---------------------------------------------------------------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderDossier(d) {
    var meetingDate = new Date(d.meeting.datetime);

    document.title = 'Studio Initiative — ' + d.prospect.firstName;
    $('#core-sub').textContent = d.prospect.company || '';
    if (d.sinceLabel)  $('.since-label').textContent = d.sinceLabel;
    if (d.sinceKicker) $('#since-kicker').textContent = d.sinceKicker;

    /* — journal des agents — */
    var beams = $('#beams');
    var pts = [[120, 62], [520, 62], [120, 238], [520, 238]];
    beams.innerHTML = pts.map(function (p) {
      return '<line x1="320" y1="150" x2="' + p[0] + '" y2="' + p[1] + '" />';
    }).join('');

    var log = $('#agent-log');
    log.innerHTML = (d.agents || []).map(function (a) {
      return '<li class="agent-row">' +
        '<span class="agent-ico">' + HEX + '</span>' +
        '<div class="agent-body">' +
          '<p class="agent-name">Agent <b>' + esc(a.name) + '</b></p>' +
          '<p class="agent-line">' + esc(a.line) + '</p>' +
          (a.meta ? '<p class="agent-meta"><span class="check">✓</span>' + esc(a.meta) + '</p>' : '') +
        '</div></li>';
    }).join('');

    /* — verbatims — */
    $('#quotes').innerHTML = (d.quotes || []).map(function (q) {
      return '<blockquote class="quote">' + esc(q) + '</blockquote>';
    }).join('');
    if (!(d.quotes || []).length) $('#quotes-block').hidden = true;

    /* — constats chiffrés — */
    $('#findings').innerHTML = (d.findings || []).map(function (f) {
      return '<article class="finding">' +
        '<p class="finding-value">' + esc(f.value) + (f.unit ? '<span>' + esc(f.unit) + '</span>' : '') + '</p>' +
        '<p class="finding-label">' + esc(f.label) + '</p>' +
        '<p class="finding-detail">' + esc(f.detail) + '</p>' +
      '</article>';
    }).join('');
    $('#brief-note').textContent = d.briefNote ||
      'Chiffres établis à partir de ce que vous nous avez décrit et de nos ordres de grandeur de mission. À confirmer sur pièces — c\'est précisément l\'objet du cadrage.';

    /* — clôture — */
    $('#close-lead').textContent = d.closeLead ||
      ('Si ce premier regard vous parle, la suite tient en vingt minutes : on confronte ce diagnostic à vos données réelles, et vous repartez avec un plan chiffré — que vous nous confiiez la suite ou non.');

    var actions = [];
    if (d.cta && d.cta.calendarUrl) {
      actions.push('<a class="btn btn-primary" href="' + esc(d.cta.calendarUrl) + '" target="_blank" rel="noopener">' +
        'Bloquer 20 minutes <span class="arrow" aria-hidden="true">→</span></a>');
    }
    actions.push('<a class="btn btn-ghost" href="mailto:contact@studioinitiative.com?subject=' +
      encodeURIComponent('Suite à notre rendez-vous — ' + (d.prospect.company || '')) + '">Écrire directement</a>');
    if (d.cta && d.cta.docUrl) {
      actions.push('<a class="btn btn-ghost" href="' + esc(d.cta.docUrl) + '" target="_blank" rel="noopener">Lire la note de cadrage</a>');
    }
    actions.push('<a class="btn btn-ghost" href="/">Voir le cabinet</a>');
    $('#close-actions').innerHTML = actions.join('');

    $('#mentions-meta').textContent =
      'Dossier ' + (TAG || d.id || '—') + ' · rendez-vous du ' + frDate(meetingDate) +
      ' · page consultée le ' + frDate(new Date()) + '.';

    /* — amorce du chat — */
    var chips = (d.chat && d.chat.suggestions) || [
      'Comment vous démarrez concrètement ?',
      'Combien ça coûte, un cadrage ?',
      'Vos agents, ils tournent chez vous ou chez nous ?'
    ];
    $('#chat-chips').innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip">' + esc(c) + '</button>';
    }).join('');

    if (d.chat && d.chat.opener) addMessage('bot', d.chat.opener);
  }

  /* ---------------------------------------------------------------- */
  /* 5. Révélations au défilement                                     */
  /* ---------------------------------------------------------------- */

  function revealOnScroll() {
    var groups = [
      { items: $$('.agent-row'), step: 220, onEach: function (i) {
          var l = $$('#beams line')[i]; if (l) l.classList.add('lit');
        } },
      { items: $$('.quote'),   step: 140 },
      { items: $$('.finding'), step: 140 }
    ];

    var showAll = function () {
      groups.forEach(function (g) {
        g.items.forEach(function (el, i) { el.classList.add('in'); if (g.onEach) g.onEach(i); });
      });
    };

    if (!('IntersectionObserver' in window) || REDUCED) { showAll(); return; }

    groups.forEach(function (g) {
      if (!g.items.length) return;
      // Observation élément par élément : un défilement rapide ou un saut
      // d'ancre ne peut plus laisser un bloc invisible. Le décalage se fait
      // par transition-delay, pour garder l'effet de cascade.
      var io = new IntersectionObserver(function (entries) {
        // Le décalage se calcule sur le lot qui entre à l'instant : un bloc
        // qui arrive seul apparaît sans attendre.
        entries.filter(function (e) { return e.isIntersecting; })
          .map(function (e) { return g.items.indexOf(e.target); })
          .sort(function (a, b) { return a - b; })
          .forEach(function (i, rank) {
            var el = g.items[i], delay = rank * g.step;
            io.unobserve(el);
            el.style.transitionDelay = delay + 'ms';
            el.classList.add('in');
            if (g.onEach) setTimeout(function () { g.onEach(i); }, delay);
          });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      g.items.forEach(function (el) { io.observe(el); });
    });

    // Filet de sécurité : si quoi que ce soit reste caché après une seconde
    // de repos en bas de page, on l'affiche plutôt que de laisser un trou.
    window.addEventListener('load', function () {
      setTimeout(function () {
        groups.forEach(function (g) {
          g.items.forEach(function (el, i) {
            var r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && !el.classList.contains('in')) {
              el.classList.add('in'); if (g.onEach) g.onEach(i);
            }
          });
        });
      }, 1200);
    });
  }

  /* ---------------------------------------------------------------- */
  /* 6. Agent conversationnel                                         */
  /* ---------------------------------------------------------------- */

  var history = [];       // [{role, content}] envoyé à l'API
  var busy = false;
  var ttsOn = false;

  function addMessage(role, text) {
    var el = document.createElement('div');
    el.className = 'msg msg-' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    $('#chat-log').appendChild(el);
    scrollLog();
    return el;
  }

  function scrollLog() {
    var log = $('#chat-log');
    log.scrollTop = log.scrollHeight;
  }

  function speak(text) {
    if (!ttsOn || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR';
      u.rate = 1.02;
      var v = window.speechSynthesis.getVoices().filter(function (x) { return /^fr/i.test(x.lang); })[0];
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* synthèse indisponible */ }
  }

  function chatFallback(bubble) {
    bubble.classList.add('err');
    bubble.textContent =
      "L'agent n'est pas joignable pour le moment. Écrivez-nous à contact@studioinitiative.com — Michael répond lui-même, et souvent plus vite qu'une IA.";
  }

  function send(text) {
    if (busy || !text.trim()) return;
    busy = true;
    $('#chat-send').disabled = true;
    $('#chat-chips').innerHTML = '';

    addMessage('user', text);
    history.push({ role: 'user', content: text });

    var bubble = addMessage('bot', '');
    var caret = document.createElement('span');
    caret.className = 'caret';
    bubble.appendChild(caret);

    var answer = '';

    // Chemin absolu : depuis /k/A7F2 un chemin relatif viserait /k/api/chat.
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: TAG, messages: history.slice(-12) })
    }).then(function (res) {
      if (!res.ok || !res.body) throw new Error('http ' + res.status);

      var reader = res.body.getReader();
      var dec = new TextDecoder();
      var buf = '';

      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) return;
          buf += dec.decode(r.value, { stream: true });
          var parts = buf.split('\n\n');
          buf = parts.pop();
          parts.forEach(function (block) {
            block.split('\n').forEach(function (line) {
              if (line.indexOf('data:') !== 0) return;
              var payload = line.slice(5).trim();
              if (!payload) return;
              var msg;
              try { msg = JSON.parse(payload); } catch (e) { return; }
              if (msg.t) {
                answer += msg.t;
                bubble.textContent = answer;
                bubble.appendChild(caret);
                scrollLog();
              } else if (msg.error) {
                throw new Error(msg.error);
              }
            });
          });
          return pump();
        });
      })();
    }).then(function () {
      caret.remove();
      if (!answer.trim()) { chatFallback(bubble); return; }
      history.push({ role: 'assistant', content: answer });
      speak(answer);
    }).catch(function () {
      caret.remove();
      history.pop();
      chatFallback(bubble);
    }).then(function () {
      busy = false;
      $('#chat-send').disabled = false;
      $('#chat-input').focus();
    });
  }

  /* — reconnaissance vocale (progressive : masquée si non supportée) — */
  function setupVoice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var micBtn = $('#chat-mic');
    if (!SR) return;

    micBtn.hidden = false;
    var rec = new SR();
    rec.lang = 'fr-FR';
    rec.interimResults = true;
    rec.continuous = false;
    var listening = false, finalText = '';

    rec.onresult = function (e) {
      var interim = '';
      finalText = '';
      for (var i = 0; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      $('#chat-input').value = (finalText || interim).trim();
    };
    rec.onend = function () {
      listening = false;
      micBtn.classList.remove('rec');
      var v = $('#chat-input').value.trim();
      if (v) { $('#chat-input').value = ''; send(v); }
    };
    rec.onerror = function () { listening = false; micBtn.classList.remove('rec'); };

    micBtn.addEventListener('click', function () {
      if (listening) { rec.stop(); return; }
      try {
        rec.start();
        listening = true;
        micBtn.classList.add('rec');
        buzz(12);
      } catch (e) { /* déjà démarré */ }
    });
  }

  function setupTts() {
    if (!('speechSynthesis' in window)) return;
    var btn = $('#chat-tts');
    btn.hidden = false;
    btn.addEventListener('click', function () {
      ttsOn = !ttsOn;
      btn.setAttribute('aria-pressed', String(ttsOn));
      if (!ttsOn) window.speechSynthesis.cancel();
    });
  }

  /* ---------------------------------------------------------------- */
  /* 7. Câblage                                                       */
  /* ---------------------------------------------------------------- */

  function wire() {
    $('#chat-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#chat-input').value.trim();
      $('#chat-input').value = '';
      send(v);
    });

    $('#chat-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (chip) send(chip.textContent.trim());
    });

    $('#skip-btn').addEventListener('click', function () {
      $('#act-agents').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });

    $('#scroll-cue').addEventListener('click', function () {
      $('#act-agents').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });

    // Le bouton « passer l'intro » n'a plus de sens une fois l'intro passée.
    window.addEventListener('scroll', function () {
      var btn = $('#skip-btn');
      if (!btn.hidden && window.scrollY > window.innerHeight * 0.6) btn.hidden = true;
    }, { passive: true });

    setupVoice();
    setupTts();
  }

  /* ---------------------------------------------------------------- */

  loadDossier().then(function (d) {
    renderDossier(d);
    playIntro(d);
    revealOnScroll();
    wire();
  }).catch(function () {
    // Aucun dossier lisible : on ne laisse jamais un cul-de-sac.
    document.querySelector('#scan-main').innerHTML =
      '<section class="act act-reveal"><div class="reveal-inner">' +
      '<h1 class="hello in"><span class="hello-name">Studio Initiative</span></h1>' +
      '<p class="meeting-line in">Ce lien n\'est plus actif. Écrivez-nous — nous retrouverons votre dossier.</p>' +
      '<div class="close-actions" style="justify-content:center">' +
      '<a class="btn btn-primary" href="mailto:contact@studioinitiative.com">Nous écrire <span class="arrow">→</span></a>' +
      '<a class="btn btn-ghost" href="/">Voir le cabinet</a></div></div></section>';
    $('.scan-mesh').classList.add('lit');
    $('.scan-brand').classList.add('in');
  });

})();
