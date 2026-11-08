/* Banyan Builders — local adult writing demo.
   Eight paintings are byte copies of the reading app tiles named below.
   See img/SOURCE-MAP.txt for the order and the excluded predecessor.
   No network calls except an optional injected-wallet status check. */
(function () {
  'use strict';

  var KEY = 'banyan-builders-red-v1';
  var STEPS = [
    { id: 'job', label: 'The Job' },
    { id: 'ideas', label: 'Idea Box' },
    { id: 'sketch', label: 'Sketchbook' },
    { id: 'build', label: 'Build & Try' }
  ];
  var PLACES = [
    {
      id: 'red', dot: 'red', file: 'img/tile02.webp', playable: true,
      name: 'Red bough', piece: "Nim's Rain Porch",
      alt: 'Original painting of a bright red bell hanging by a chain from a banyan, with pale roots and distant mountains.',
      blurb: ''
    },
    {
      id: 'coral', dot: 'coral', file: 'img/tile03.webp', playable: false,
      name: 'Coral bough', piece: 'The Fern Gallery',
      alt: 'Original painting of a coral bell on a rope, with floating cliffs in warm sunrise cloud.',
      blurb: 'A later build would plan a short gallery along the sunrise roots, so studies can be hung and looked at one at a time.'
    },
    {
      id: 'orange', dot: 'orange', file: 'img/tile04.webp', playable: false,
      name: 'Orange bough', piece: 'The Pattern Loft',
      alt: 'Original painting of an ornate orange bell hanging in a huge banyan on a cliff above mist.',
      blurb: 'A later build would plan a loft for laying out a repeating joint before any wood is cut.'
    },
    {
      id: 'yellow', dot: 'yellow', file: 'img/tile05.webp', playable: false,
      name: 'Yellow bough', piece: 'The Moon Desk',
      alt: 'Original painting of a yellow bell hanging in a banyan under a full moon.',
      blurb: 'A later build would plan a night desk under the moon, sized for one page and a lamp.'
    },
    {
      id: 'green', dot: 'green', file: 'img/tile06.webp', playable: false,
      name: 'Green bough', piece: 'The Vine Bridge',
      alt: 'Original painting of a green bell on a rope against a mass of banyan roots.',
      blurb: 'A later build would plan a short footbridge of vine between two roots, and what has to be true before anyone crosses.'
    },
    {
      id: 'light-blue', dot: 'lblue', file: 'img/tile07.webp', playable: false,
      name: 'Light blue bough', piece: 'The Cloud Window',
      alt: 'Original painting of a light blue bell on a chain, in a banyan on a floating island under bright clouds.',
      blurb: 'A later build would plan a window room aimed at one cloud, with a sill deep enough for a cup and a folded plan.'
    },
    {
      id: 'dark-blue', dot: 'dblue', file: 'img/tile08.webp', playable: false,
      name: 'Dark blue bough', piece: 'The Shade Study',
      alt: 'Original painting of a dark blue bell on a braided rope under a deep blue sky.',
      blurb: 'A later build would plan a shaded study in the trunk for work that needs less glare.'
    },
    {
      id: 'purple', dot: 'purple', file: 'img/tile09.webp', playable: false,
      name: 'Purple bough', piece: 'The Dusk Landing',
      alt: 'Original painting of a purple bell on a chain against a pink and violet dusk sky.',
      blurb: 'A later build would plan a dusk landing where a guest can pause, with a rail and a dry hook for a coat.'
    }
  ];
  var CARDS = [
    { id: 'dry', text: 'The paper has to stay dry when the cliff wind turns.' },
    { id: 'gutter', text: 'A gutter that tips into a pot of ferns.' },
    { id: 'cedar', text: 'Narrow cedar boards, silvered by weather.' },
    { id: 'window', text: 'A window aimed at one far hill.' },
    { id: 'pencil', text: 'A groove so the pencil does not roll into the rain.' },
    { id: 'vine', text: 'Vine woven tight enough to walk on.' },
    { id: 'door', text: 'A door you can open with an elbow.' },
    { id: 'sky', text: 'One small skylight, about the size of a postage stamp.' }
  ];
  var BIN_LABEL = { needs: 'Needs', materials: 'Materials', details: 'Interesting details' };

  var state = empty();
  var undo = null;
  var saveTimer = 0;
  var saveError = '';
  var wallet = {
    status: 'checking',
    address: '',
    chainId: '',
    error: '',
    prompted: false,
    showFull: false
  };

  function empty() {
    return {
      v: 1,
      title: '',
      jobNote: '',
      ideas: [],
      bins: { unsorted: [], needs: [], materials: [], details: [] },
      steps: [],
      sections: { job: '', needs: '', materials: '', details: '', order: '' },
      sectionsDirty: false,
      lastStep: 'job',
      seen: { job: false, ideas: false, sketch: false, build: false },
      updatedAt: 0
    };
  }

  function nid() {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'readOnly') el.readOnly = !!v;
        else if (k === 'disabled' || k === 'hidden' || k === 'checked') el[k] = !!v;
        else if (k === 'value') { el.value = String(v); }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    kids.flat(Infinity).forEach(function (kid) {
      if (kid == null || kid === false) return;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return el;
  }

  function say(msg) {
    var live = document.getElementById('live');
    if (live) live.textContent = msg || '';
  }

  function ideaById(id) {
    for (var i = 0; i < state.ideas.length; i++) if (state.ideas[i].id === id) return state.ideas[i];
    return null;
  }

  function binOf(id) {
    var keys = ['unsorted', 'needs', 'materials', 'details'];
    for (var i = 0; i < keys.length; i++) {
      if (state.bins[keys[i]].indexOf(id) !== -1) return keys[i];
    }
    return 'unsorted';
  }

  function pull(id) {
    Object.keys(state.bins).forEach(function (k) {
      state.bins[k] = state.bins[k].filter(function (x) { return x !== id; });
    });
  }

  function normalize(data) {
    var s = empty();
    if (!data || typeof data !== 'object') return s;
    s.title = String(data.title || '');
    s.jobNote = String(data.jobNote || '');
    s.sectionsDirty = !!data.sectionsDirty;
    s.lastStep = ['job', 'ideas', 'sketch', 'build'].indexOf(data.lastStep) !== -1 ? data.lastStep : 'job';
    s.updatedAt = Number(data.updatedAt) || 0;
    if (data.seen && typeof data.seen === 'object') {
      Object.keys(s.seen).forEach(function (k) { s.seen[k] = !!data.seen[k]; });
    }
    if (data.sections && typeof data.sections === 'object') {
      Object.keys(s.sections).forEach(function (k) { s.sections[k] = String(data.sections[k] || ''); });
    }
    var ids = {};
    (Array.isArray(data.ideas) ? data.ideas : []).forEach(function (item) {
      if (!item || typeof item !== 'object') return;
      var id = String(item.id || nid());
      if (ids[id]) return;
      ids[id] = true;
      s.ideas.push({
        id: id,
        text: String(item.text || ''),
        cardId: item.cardId ? String(item.cardId) : null,
        cardText: item.cardId ? String(item.cardText || '') : null
      });
    });
    var placed = {};
    var bins = data.bins || {};
    ['unsorted', 'needs', 'materials', 'details'].forEach(function (k) {
      (Array.isArray(bins[k]) ? bins[k] : []).forEach(function (id) {
        id = String(id);
        if (!ids[id] || placed[id]) return;
        s.bins[k].push(id);
        placed[id] = true;
      });
    });
    s.ideas.forEach(function (idea) {
      if (!placed[idea.id]) s.bins.unsorted.push(idea.id);
    });
    (Array.isArray(data.steps) ? data.steps : []).forEach(function (st) {
      if (!st || typeof st !== 'object') return;
      s.steps.push({
        id: String(st.id || nid()),
        text: String(st.text || ''),
        borrowed: !!st.borrowed,
        borrowedText: st.borrowed ? String(st.borrowedText || '') : ''
      });
    });
    return s;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      state = raw ? normalize(JSON.parse(raw)) : empty();
    } catch (e) {
      state = empty();
    }
  }

  function meaningful(s) {
    s = s || state;
    if (s.title.trim() || s.jobNote.trim() || s.ideas.length || s.steps.length) return true;
    if (s.sectionsDirty) {
      return Object.keys(s.sections).some(function (k) { return String(s.sections[k] || '').trim(); });
    }
    return false;
  }

  function paintSaved(msg) {
    var el = document.getElementById('savestatus');
    if (el) el.textContent = msg || '';
  }

  function saveNow() {
    clearTimeout(saveTimer);
    if (!meaningful(state)) {
      try { localStorage.removeItem(KEY); } catch (e) { /* private mode */ }
      saveError = '';
      paintSaved('');
      return;
    }
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      saveError = '';
      paintSaved('Saved on this device.');
    } catch (e) {
      saveError = 'This browser did not store the draft. Copy it before you leave.';
      paintSaved(saveError);
    }
  }

  function touch() {
    state.updatedAt = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
    paintSaved('Saving on this device…');
  }

  function linesFrom(bin) {
    return state.bins[bin].map(ideaById).filter(Boolean).map(function (idea) {
      return idea.text.trim();
    }).filter(Boolean).map(function (t) { return '- ' + t; }).join('\n');
  }

  function stepLines() {
    var n = 0;
    return state.steps.map(function (st) { return st.text.trim(); }).filter(Boolean).map(function (t) {
      n += 1;
      return n + '. ' + t;
    }).join('\n');
  }

  function compose() {
    return {
      job: state.jobNote.trim(),
      needs: linesFrom('needs'),
      materials: linesFrom('materials'),
      details: linesFrom('details'),
      order: stepLines()
    };
  }

  function currentSections() {
    return state.sectionsDirty ? state.sections : compose();
  }

  function words(text) {
    var m = String(text || '').trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  function stepIsTheirs(st) {
    var t = st.text.trim();
    if (!t) return false;
    if (!st.borrowed) return true;
    return t !== st.borrowedText;
  }

  function userWrote() {
    if (state.jobNote.trim()) return true;
    if (state.ideas.some(function (i) { return i.text.trim() && (!i.cardId || i.text.trim() !== i.cardText); })) return true;
    if (state.steps.some(stepIsTheirs)) return true;
    if (state.sectionsDirty) {
      var c = compose();
      return Object.keys(c).some(function (k) {
        return String(state.sections[k] || '').trim() !== String(c[k] || '').trim();
      });
    }
    return false;
  }

  function filledCount(bin) {
    return state.bins[bin].filter(function (id) {
      var idea = ideaById(id);
      return idea && idea.text.trim();
    }).length;
  }

  function assess() {
    var lines = [];
    var counts = { needs: filledCount('needs'), materials: filledCount('materials'), details: filledCount('details') };
    var sorted = counts.needs + counts.materials + counts.details;
    var loose = state.bins.unsorted.filter(function (id) {
      var idea = ideaById(id);
      return idea && idea.text.trim();
    }).length;
    var steps = state.steps.filter(function (s) { return s.text.trim(); }).length;
    var title = state.title.trim();
    var sec = currentSections();
    var body = [sec.job, sec.needs, sec.materials, sec.details, sec.order].join('\n');
    var chars = (title + body).length;
    var wc = words(title + '\n' + body);
    lines.push(
      (title ? 'Title in place.' : 'No title yet. A plain one is enough.') +
      ' ' + counts.needs + ' needs, ' + counts.materials + ' materials, ' + counts.details + ' details, ' +
      steps + (steps === 1 ? ' step.' : ' steps.')
    );
    var emptyBuild = !sorted && !state.jobNote.trim() && !steps && !body.trim();
    if (emptyBuild) lines.push('The description is still open. The template has not invented any sentences.');
    if (loose) {
      lines.push(loose + (loose === 1 ? ' line is' : ' lines are') + ' still loose on the sketchbook. They stay saved. They are not in the description until you file them or type them in.');
    }
    var used = ['needs', 'materials', 'details'].filter(function (k) { return counts[k] > 0; });
    if (sorted > 1 && used.length === 1) {
      lines.push('Everything you filed is in ' + BIN_LABEL[used[0]] + '. A second pocket would add a layer, if you want one.');
    }
    if (!steps) lines.push('There is no sequence yet. One step is enough to start, and the order is yours.');
    if (!emptyBuild) {
      if (userWrote()) lines.push('Your wording is in this build.');
      else if (sorted || steps) lines.push('These lines still match the suggestion cards. Change any word that is not what you meant.');
    }
    if (state.sectionsDirty) {
      lines.push('You edited the arranged description. Sketchbook changes will not overwrite it unless you choose Replace with sketchbook text.');
    }
    if (state.jobNote.trim() && state.sectionsDirty && state.sections.job.trim() !== state.jobNote.trim()) {
      lines.push('The job paragraph on this page no longer matches the note on The Job. Both are saved.');
    }
    if (chars >= 1200 || wc >= 180) {
      lines.push('This is a long piece (' + wc + ' words, ' + chars + ' characters). Copy and download keep all of it.');
    }
    var ready = !!(title && sorted && steps);
    lines.push('Nothing here is graded, and there is no single correct plan.');
    lines.push(ready ? 'This is complete enough to copy. You can keep editing.' : 'You can copy at any time.');
    return lines;
  }

  function exportText() {
    var sec = currentSections();
    var title = state.title.trim() || 'Untitled';
    var blocks = [
      ['The job', sec.job],
      ['What it needs', sec.needs],
      ['Made from', sec.materials],
      ['Details worth keeping', sec.details],
      ['How it goes up', sec.order]
    ];
    var out = title + '\n\n';
    blocks.forEach(function (b) { out += b[0] + '\n' + String(b[1] || '').trim() + '\n\n'; });
    out += '—\nBanyan Builders · Red bough · Nim\'s Rain Porch\n';
    out += 'This file is your text. It was not uploaded.\n';
    out += 'The picture of builders at a treehouse is a preset drawing. It is not a picture of these words.\n';
    return out;
  }

  function showManual(text) {
    var box = document.getElementById('fallback');
    var area = document.getElementById('fallback-text');
    var note = document.getElementById('copy-note');
    if (!box || !area) return;
    box.hidden = false;
    area.value = text;
    area.focus();
    area.select();
    try { area.setSelectionRange(0, text.length); } catch (e) { /* some browsers */ }
    if (note) note.textContent = 'The full text is selected below. If Copy is blocked, press Ctrl+C or Command+C, or use Download.';
  }

  function onCopy() {
    var text = exportText();
    var note = document.getElementById('copy-note');
    var manual = /(?:\?|&)copy=manual(?:&|$)/.test(location.search);
    if (manual) {
      showManual(text);
      say('The full text is selected so you can copy it.');
      return;
    }
    var clip = navigator.clipboard && navigator.clipboard.writeText;
    if (!clip) {
      showManual(text);
      say('Copy is blocked in this browser. The text is selected, or use Download.');
      return;
    }
    clip.call(navigator.clipboard, text).then(function () {
      var box = document.getElementById('fallback');
      if (box) box.hidden = true;
      if (note) note.textContent = 'Copied the full text.';
      say('Copied the full text.');
    }).catch(function () {
      showManual(text);
      say('Copy is blocked in this browser. The text is selected, or use Download.');
    });
  }

  function onDownload() {
    var text = exportText();
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: 'banyan-red-bough.txt' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    say('Download started. The file is the full text.');
  }

  function grow(el) {
    el.style.height = 'auto';
    var next = Math.max(el.scrollHeight, 48);
    el.style.height = Math.min(next, 420) + 'px';
  }

  function originLabel(idea) {
    if (!idea.cardId) return 'Yours';
    if (idea.text.trim() === idea.cardText) return 'Suggestion';
    return 'Suggestion, edited';
  }

  function planOverlay() {
    var wrap = document.createElement('div');
    wrap.className = 'planoverlay';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<svg viewBox="0 0 400 220" preserveAspectRatio="none">' +
      '<path d="M8 48 C 70 18, 130 92, 210 46 S 330 24, 392 68" fill="none" stroke="#1E4A8C" stroke-width="0.7"/>' +
      '<path d="M0 130 C 70 108, 120 160, 200 136 S 320 112, 400 150" fill="none" stroke="#1E4A8C" stroke-width="0.45"/>' +
      '<path d="M20 188 C 100 160, 160 210, 250 176" fill="none" stroke="#1E4A8C" stroke-width="0.35"/>' +
      '<circle cx="362" cy="36" r="12" fill="none" stroke="#1E4A8C" stroke-width="0.6"/>' +
      '<path d="M362 22 v28 M348 36 h28" stroke="#1E4A8C" stroke-width="0.45"/>' +
      '</svg>';
    return wrap;
  }

  function sheet() {
    var kids = Array.prototype.slice.call(arguments);
    return h('div', { class: 'sheet' }, planOverlay(), h('div', { class: 'sheetbody' }, kids));
  }

  function heroFigure(mode) {
    var fig = h('figure', { class: mode === 'home' ? 'herofig' : 'preset' });
    var img = h('img', {
      src: 'img/banyan_home_hero.jpg',
      alt: 'Ant builders with short rounded faces, no wings and no scarves, at a treehouse in a banyan. One draws on a blueprint. Others carry wood along the roots.',
      width: '1280',
      height: '720'
    });
    var caption = h('figcaption');
    caption.textContent = mode === 'home'
      ? 'Builders on a banyan: wingless, short rounded faces, no scarves, plans in hand. This picture does not change when you write.'
      : 'Preset picture, drawn earlier. This is not a picture of your text. The demo does not generate art from what you write, and it does not build a 3D model.';
    fig.append(img, caption);
    return fig;
  }

  function placeById(id) {
    for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) return PLACES[i];
    return null;
  }

  function dots(markRed) {
    return h('span', { class: 'dots', 'aria-hidden': 'true' }, PLACES.map(function (p) {
      return h('i', { class: 'dot dot-' + p.dot + (markRed && p.id === 'red' ? ' now' : '') });
    }));
  }

  function shortAddr(a) {
    if (!a || a.length < 12) return a || '';
    return a.slice(0, 6) + '…' + a.slice(-4);
  }

  function shortErr(e) {
    var m = (e && (e.message || String(e))) || 'Unknown wallet error';
    return String(m).slice(0, 180);
  }

  function isDecline(e) {
    if (!e) return false;
    if (e.code === 4001) return true;
    return /reject|denied|declin|closed/i.test(String(e.message || e));
  }

  function chainId() {
    var eth = window.ethereum;
    if (!eth) return Promise.resolve('');
    return eth.request({ method: 'eth_chainId' }).then(function (id) {
      return typeof id === 'string' ? id : '';
    }).catch(function () { return ''; });
  }

  function walletBody() {
    var panel = h('div', { class: 'wpanel' });
    if (wallet.status === 'checking') {
      panel.append(h('p', null, 'Looking for a wallet already permitted in this browser. This does not open a prompt.'));
      return panel;
    }
    if (wallet.status === 'no-provider') {
      panel.append(h('p', null, 'No injected wallet was found in this browser. Writing does not need one. Nothing was signed, sent, or stored.'));
    } else if (wallet.status === 'connecting') {
      panel.append(h('p', null, 'Waiting for the wallet window.'));
    } else if (wallet.status === 'declined') {
      panel.append(h('p', null, 'The wallet window was closed or the request was declined. No address was shared.'));
    } else if (wallet.status === 'error') {
      panel.append(h('p', null, 'The wallet returned an error: ' + (wallet.error || 'Unknown wallet error')));
    } else if (wallet.status === 'connected' && wallet.address) {
      panel.append(h('p', null, 'Connected. The wallet shared an address.'));
      panel.append(h('p', null, wallet.prompted
        ? 'The address was shared after you chose Connect. No transaction was sent and no message was signed.'
        : 'This address was already permitted. This page did not open a new prompt.'));
      panel.append(h('p', null, 'Address shared: ' + shortAddr(wallet.address)));
      if (wallet.showFull) panel.append(h('code', { class: 'code' }, wallet.address));
      panel.append(h('p', null, wallet.chainId
        ? 'Chain id reported by the wallet: ' + wallet.chainId + '. This page did not choose it and does not use it.'
        : 'Chain id was not returned. This page did not choose a chain or a token contract.'));
    } else {
      panel.append(h('p', null, 'Not connected. If you connect, the wallet may share an address. This page will not send a transaction or ask for a signature.'));
    }
    panel.append(h('p', null, 'Token balance: not checked. This is not a balance of zero. No balance was read.'));
    panel.append(h('ul', null,
      h('li', null, 'Founding-member voting — not built'),
      h('li', null, 'Burns — not built'),
      h('li', null, 'Revenue share — not built')
    ));
    var buttons = h('div', { class: 'rowbtns' });
    if (wallet.status === 'connected' && wallet.address) {
      buttons.append(h('button', { type: 'button', class: 'btn secondary', onclick: function () {
        wallet.showFull = !wallet.showFull;
        refreshWallet(false);
      } }, wallet.showFull ? 'Hide full address' : 'Show full address'));
      buttons.append(h('button', { type: 'button', class: 'btn quiet', onclick: forgetWallet }, 'Forget address on this page'));
      panel.append(buttons);
      panel.append(h('p', { class: 'hint' }, 'Forgetting clears the address from this page only. The wallet may still list the site. This page cannot disconnect the wallet for you.'));
    } else if (wallet.status === 'idle' || wallet.status === 'declined' || wallet.status === 'error') {
      buttons.append(h('button', {
        type: 'button',
        class: 'btn secondary',
        onclick: connectWallet
      }, wallet.status === 'idle' ? 'Connect a wallet' : 'Try again'));
      panel.append(buttons);
    }
    return panel;
  }

  function walletMount(compact) {
    var host = h('div', { id: 'wallet-host', 'aria-live': 'polite' }, walletBody());
    if (!compact) return host;
    return h('details', { class: 'wallet', id: 'wallet-details' },
      h('summary', null, 'Adult wallet, optional'),
      h('p', { class: 'hint' }, 'Not used for writing. Connection only. No token is selected.'),
      host);
  }

  function refreshWallet(focus) {
    var host = document.getElementById('wallet-host');
    if (!host) return;
    host.replaceChildren(walletBody());
    if (focus) {
      var el = host.querySelector('button, p');
      if (el && el.focus) el.focus();
    }
  }

  function setupWalletListeners() {
    var eth = window.ethereum;
    if (!eth || eth.__bb || typeof eth.on !== 'function') return;
    eth.__bb = true;
    eth.on('accountsChanged', function (acc) {
      wallet.address = (acc && acc[0]) || '';
      wallet.prompted = false;
      wallet.status = wallet.address ? 'connected' : (window.ethereum ? 'idle' : 'no-provider');
      if (!wallet.address) wallet.chainId = '';
      var pending = wallet.address ? chainId() : Promise.resolve('');
      pending.then(function (id) {
        if (wallet.address) wallet.chainId = id;
        refreshWallet(false);
      });
    });
    eth.on('chainChanged', function (id) {
      wallet.chainId = id ? String(id) : '';
      refreshWallet(false);
    });
  }

  function probeWallet() {
    var eth = window.ethereum;
    if (!eth) {
      wallet.status = 'no-provider';
      wallet.address = '';
      wallet.chainId = '';
      refreshWallet(false);
      return;
    }
    eth.request({ method: 'eth_accounts' }).then(function (acc) {
      wallet.address = (acc && acc[0]) || '';
      wallet.prompted = false;
      if (!wallet.address) {
        wallet.status = 'idle';
        wallet.chainId = '';
        refreshWallet(false);
        return '';
      }
      wallet.status = 'connected';
      return chainId();
    }).then(function (id) {
      if (wallet.address && typeof id === 'string') wallet.chainId = id;
      refreshWallet(false);
    }).catch(function (e) {
      wallet.status = 'error';
      wallet.error = shortErr(e);
      wallet.address = '';
      refreshWallet(false);
    });
  }

  function connectWallet() {
    var eth = window.ethereum;
    if (!eth) {
      wallet.status = 'no-provider';
      refreshWallet(true);
      return;
    }
    wallet.status = 'connecting';
    wallet.error = '';
    refreshWallet(false);
    eth.request({ method: 'eth_requestAccounts' }).then(function (acc) {
      wallet.address = (acc && acc[0]) || '';
      wallet.prompted = true;
      wallet.status = wallet.address ? 'connected' : 'idle';
      if (!wallet.address) {
        refreshWallet(true);
        return '';
      }
      return chainId();
    }).then(function (id) {
      if (wallet.address && typeof id === 'string') wallet.chainId = id;
      refreshWallet(true);
      if (wallet.address) say('Wallet connected. No transaction was sent.');
    }).catch(function (e) {
      wallet.address = '';
      wallet.chainId = '';
      wallet.prompted = false;
      if (isDecline(e)) {
        wallet.status = 'declined';
        wallet.error = '';
      } else {
        wallet.status = 'error';
        wallet.error = shortErr(e);
      }
      refreshWallet(true);
    });
  }

  function forgetWallet() {
    wallet.address = '';
    wallet.chainId = '';
    wallet.prompted = false;
    wallet.showFull = false;
    wallet.error = '';
    wallet.status = window.ethereum ? 'idle' : 'no-provider';
    refreshWallet(true);
    say('This page forgot the address. The wallet app was not changed.');
  }

  function resetState() {
    state = empty();
    undo = null;
    saveError = '';
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    say('Draft cleared on this device.');
    go('#/bough/red/job');
  }

  function resetDialog() {
    var d = h('dialog', { id: 'resetdlg' });
    d.append(
      h('p', null, 'Clear the red bough draft on this device? The text cannot be restored.'),
      h('div', { class: 'dlgbtns' },
        h('button', { type: 'button', class: 'btn secondary', onclick: function () { d.close(); } }, 'Keep it'),
        h('button', { type: 'button', class: 'btn', onclick: function () { d.close(); resetState(); } }, 'Clear draft'))
    );
    return d;
  }

  function openReset() {
    var d = document.getElementById('resetdlg');
    if (d && d.showModal) d.showModal();
    else if (window.confirm('Clear the red bough draft on this device? The text cannot be restored.')) resetState();
  }

  function fileInto(id, bin) {
    pull(id);
    state.bins[bin].push(id);
    undo = null;
    touch();
    render(false);
    var el = document.querySelector('[data-idea="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"] textarea');
    if (el) el.focus();
  }

  function addIdea(text, card) {
    var t = String(text || '').trim();
    if (!t) { say('Write a line first.'); return; }
    if (card && state.ideas.some(function (i) { return i.cardId === card.id; })) {
      say('That suggestion is already in the box.');
      return;
    }
    var idea = {
      id: nid(),
      text: t,
      cardId: card ? card.id : null,
      cardText: card ? card.text : null
    };
    state.ideas.push(idea);
    state.bins.unsorted.push(idea.id);
    touch();
    render(false);
    say(card ? 'Borrowed a suggestion. You can edit it.' : 'Added your line.');
    var el = document.querySelector('[data-idea="' + idea.id + '"] textarea');
    if (el) el.focus();
  }

  function removeIdea(id) {
    var idea = ideaById(id);
    if (!idea) return;
    undo = { kind: 'idea', idea: idea, bin: binOf(id) };
    state.ideas = state.ideas.filter(function (i) { return i.id !== id; });
    pull(id);
    touch();
    render(false);
    say('Removed a line. Undo is available.');
  }

  function addStep(text, borrowed, borrowedText) {
    var t = String(text || '').trim();
    if (!t) { say('Write the step first.'); return; }
    state.steps.push({
      id: nid(),
      text: t,
      borrowed: !!borrowed,
      borrowedText: borrowed ? String(borrowedText || '') : ''
    });
    touch();
    render(false);
    say('Step added. You can edit it.');
  }

  function removeStep(index) {
    var step = state.steps[index];
    if (!step) return;
    undo = { kind: 'step', step: step, index: index };
    state.steps.splice(index, 1);
    touch();
    render(false);
    say('Removed a step. Undo is available.');
  }

  function moveStep(index, dir) {
    var j = index + dir;
    if (j < 0 || j >= state.steps.length) return;
    var sp = state.steps.splice(index, 1)[0];
    state.steps.splice(j, 0, sp);
    touch();
    render(false);
  }

  function doUndo() {
    if (!undo) return;
    if (undo.kind === 'idea') {
      state.ideas.push(undo.idea);
      var bin = state.bins[undo.bin] ? undo.bin : 'unsorted';
      state.bins[bin].push(undo.idea.id);
    } else if (undo.kind === 'step') {
      var i = Math.min(undo.index, state.steps.length);
      state.steps.splice(i, 0, undo.step);
    }
    undo = null;
    touch();
    render(false);
    say('Restored.');
  }

  function bindIdeaText(area, idea) {
    area.addEventListener('input', function () {
      idea.text = area.value;
      var lab = area.parentNode && area.parentNode.querySelector('.origin');
      if (lab) lab.textContent = originLabel(idea);
      grow(area);
      touch();
    });
  }

  function slip(idea, mode) {
    var area = h('textarea', { rows: '2', 'aria-label': 'Line' }, idea.text);
    bindIdeaText(area, idea);
    var node = h('div', { class: 'slip', 'data-idea': idea.id },
      h('p', { class: 'origin' }, originLabel(idea)),
      area);
    if (mode === 'sketch') {
      var segs = h('div', { class: 'segs' });
      [['needs', 'Need'], ['materials', 'Material'], ['details', 'Detail']].forEach(function (pair) {
        var on = binOf(idea.id) === pair[0];
        segs.append(h('button', {
          type: 'button',
          class: 'seg' + (on ? ' on' : ''),
          'aria-pressed': on ? 'true' : 'false',
          onclick: function () { fileInto(idea.id, on ? 'unsorted' : pair[0]); }
        }, pair[1]));
      });
      segs.append(h('button', { type: 'button', class: 'textbtn', onclick: function () {
        var same = !!(idea.cardId && idea.text.trim() === idea.cardText);
        addStep(idea.text, same, idea.cardText);
      } }, 'Use as a step'));
      node.append(segs);
    }
    node.append(h('div', { class: 'segs' }, h('button', {
      type: 'button', class: 'textbtn', onclick: function () { removeIdea(idea.id); }
    }, 'Remove line')));
    return node;
  }

  function stepRow(st, index) {
    var area = h('textarea', { rows: '2', 'aria-label': 'Step ' + (index + 1) }, st.text);
    area.addEventListener('input', function () {
      st.text = area.value;
      grow(area);
      touch();
    });
    return h('div', { class: 'steprow' },
      area,
      h('div', { class: 'stepops' },
        h('button', { type: 'button', disabled: index === 0, onclick: function () { moveStep(index, -1); } }, 'Up'),
        h('button', { type: 'button', disabled: index === state.steps.length - 1, onclick: function () { moveStep(index, 1); } }, 'Down'),
        h('button', { type: 'button', onclick: function () { removeStep(index); } }, 'Remove step')));
  }

  function addForm(placeholder, label, onAdd) {
    var input = h('input', { type: 'text', placeholder: placeholder, 'aria-label': placeholder, autocomplete: 'off' });
    return h('form', { class: 'addline', onsubmit: function (e) {
      e.preventDefault();
      onAdd(input.value);
      input.value = '';
    } }, input, h('button', { type: 'submit', class: 'btn secondary' }, label));
  }

  function undoBar() {
    if (!undo) return null;
    return h('p', null, h('button', { type: 'button', class: 'btn quiet', onclick: doUndo }, 'Undo remove'));
  }

  function drawHome() {
    document.title = 'Banyan Builders';
    var resume = meaningful(state);
    var grid = h('div', { class: 'tgrid', role: 'navigation', 'aria-label': 'Boughs' }, PLACES.map(function (p) {
      var open = p.playable;
      var label = p.name + ', ' + p.piece + '. ' + (open
        ? (resume ? 'Resume the writing build.' : 'Open. Starts the writing build.')
        : 'Future preview. Not playable.');
      return h('a', {
        class: 'tcard' + (open ? ' open' : ' later'),
        href: open ? '#/bough/red' : '#/bough/' + p.id,
        'aria-label': label
      },
        h('span', { class: 'tpic' }, h('img', { src: p.file, alt: p.alt, width: '600', height: '600' })),
        h('span', { class: 'tbody' },
          h('span', { class: 'thead' },
            h('i', { class: 'dot dot-' + p.dot, 'aria-hidden': 'true' }),
            h('span', { class: 'tnum' }, p.name)),
          h('span', { class: 'tname' }, p.piece),
          h('span', { class: 'pill ' + (open ? 'open' : 'later') }, open ? (resume ? 'Resume' : 'Open') : 'Future preview')));
    }));
    var barLabel = resume
      ? ('Resume: Red bough' + (state.title.trim() ? ' · ' + state.title.trim() : ''))
      : "Open bough: Red bough · Nim's Rain Porch";
    return h('div', { class: 'screen home' },
      h('div', { class: 'wrap homewrap' },
        h('header', { class: 'brand' },
          h('h1', null, 'Banyan Builders'),
          h('p', { class: 'tag' }, 'Build a thought. Create a world.')),
        h('a', { class: 'youbar', href: '#/bough/red' },
          h('span', { class: 'ytext' }, barLabel),
          dots(true)),
        h('div', { class: 'homelay' },
          h('aside', { class: 'homeside' },
            heroFigure('home'),
            h('div', { class: 'homeutils' },
              h('a', { class: 'btn secondary aboutbtn', href: '#/about' }, 'About'),
              h('nav', { class: 'ministeps', 'aria-label': 'The open build' },
                h('p', { class: 'hint' }, 'One build, four pages. The words stay yours.'),
                h('ol', null, STEPS.map(function (s) {
                  return h('li', null, h('a', { href: '#/bough/red/' + s.id }, s.label));
                }))),
              walletMount(true))),
          grid)),
      resetDialog());
  }

  function para(text) { return h('p', null, text); }

  function drawAbout() {
    document.title = 'About · Banyan Builders';
    return h('div', { class: 'screen' }, h('div', { class: 'wrap' },
      h('div', { class: 'topbar' }, h('a', { class: 'btn secondary', href: '#/home' }, 'Home')),
      h('article', { class: 'about' },
        h('h1', null, 'About Banyan Builders'),
        h('p', { class: 'tag' }, 'Build a thought. Create a world.'),
        h('h2', null, 'What this is'),
        para('Banyan Builders is a private demo for adults who want to organize their own thoughts, ideas, descriptions, and stories. You collect lines, sort them, put them in an order, and leave with one description you can still edit.'),
        para('The template only arranges lines you already wrote, or borrowed and then changed. It does not supply a correct answer, and it does not call an AI service.'),
        h('h2', null, 'What you do'),
        para("The red bough is the one complete build. Nim, a carpenter ant, needs a sheltered room so a plan stays dry when rain runs down the roots. You decide what that room needs, what it is made of, which details matter, and the order of the work."),
        para('The pages are The Job, Idea Box, Sketchbook, and Build & Try. They are one activity, not four assignments.'),
        h('h2', null, 'What this is not'),
        para('This demo does not teach reading, and it does not use the characters or exercises from the reading app. It does not grade your wording. The paintings do not animate. Text you type is not turned into a new picture or into a model you can walk through. The builder portrait, when the file is present, was drawn earlier.'),
        h('h2', null, 'A separate app for children'),
        para('Adult supporters are meant, later, to help fund a separate writing app for children. That app is not this one. This demo does not advertise it, does not link to it, and does not collect anything about a child. A wallet here is for an adult, and it is optional.'),
        h('h2', null, 'A proposed supporter circle'),
        para('If a circle of adult founding members is formed later, they might be invited to vote on which bough opens next, and on whether any expansion includes an NFT project. That vote is a proposal only. The editor keeps the final decision.'),
        para('Nothing on this page creates a financial right. Connecting a wallet does not make you a member. It does not mint, sell, burn, or pay.'),
        h('h2', null, 'Where your words go'),
        para('Drafts are saved in this browser only, on this device. They are not uploaded. Clear saved draft deletes them here. Copy and Download are how you take the text with you.'),
        h('h2', null, 'The paintings'),
        para('The eight pictures are original paintings, shown in this order and in these colors: red, coral, orange, yellow, green, light blue, dark blue, and purple. They are not recolored. The picture that came immediately before this series is not included. Seven boughs are future previews. Only the red bough can be written in.'),
        h('h2', null, 'Wallet'),
        para('Connection is optional and sits outside the writing. A connected status means an injected wallet shared an address, or had already permitted one. It is not a token balance, a vote, a burn, or a payment.'),
        walletMount(false),
        h('h2', null, 'Type'),
        para('The text face is Andika, licensed under the SIL Open Font License. A copy of that notice is in fonts/Andika-OFL-NOTE.txt.'))));
  }

  function drawFuture(place) {
    document.title = place.name + ' · Banyan Builders';
    return h('div', { class: 'screen' }, h('div', { class: 'wrap narrow' },
      h('div', { class: 'topbar' }, h('a', { class: 'btn secondary', href: '#/home' }, 'Home')),
      h('p', { class: 'ribbon' }, 'Future preview. This bough is not playable.'),
      h('header', { class: 'pagehead' },
        h('p', { class: 'kicker' }, place.name),
        h('h1', null, place.piece)),
      h('img', { class: 'futurepic', src: place.file, alt: place.alt, width: '600', height: '600' }),
      para(place.blurb),
      para('You can look at the painting. You cannot write a draft here yet. The red bough is the one complete build.'),
      h('div', { class: 'rowbtns' },
        h('a', { class: 'btn secondary', href: '#/home' }, 'Back to the boughs'),
        h('a', { class: 'btn', href: '#/bough/red' }, 'Open the red bough'))));
  }

  function activityChrome(step) {
    var red = PLACES[0];
    return [
      h('div', { class: 'topbar' },
        h('a', { class: 'btn secondary', href: '#/home' }, 'Home'),
        h('p', { class: 'savestatus', id: 'savestatus' }, saveError || (meaningful(state) ? 'Saved on this device.' : 'Not saved yet. A draft is kept on this device when you write.')),
        meaningful(state) ? h('button', { type: 'button', class: 'btn quiet', onclick: openReset }, 'Clear saved draft') : null),
      h('div', { class: 'placehead' },
        h('img', { src: red.file, alt: red.alt, width: '600', height: '600' }),
        h('div', null,
          h('p', { class: 'kicker' }, 'Red bough'),
          h('h1', null, "Nim's Rain Porch"))),
      h('nav', { class: 'stepper', 'aria-label': 'Build steps' }, STEPS.map(function (s, i) {
        return h('a', {
          class: 'step' + (s.id === step ? ' now' : ''),
          href: '#/bough/red/' + s.id,
          'aria-current': s.id === step ? 'step' : null
        }, h('span', { class: 'sn', 'aria-hidden': 'true' }, String(i + 1)), s.label);
      })),
      undoBar()
    ];
  }

  function drawJob() {
    var title = h('input', {
      type: 'text', autocomplete: 'off', value: state.title,
      'aria-label': 'Working title', placeholder: 'A name you would actually use'
    });
    title.addEventListener('input', function () { state.title = title.value; touch(); });
    var note = h('textarea', { rows: '5', placeholder: 'What should this room do, in your words?' }, state.jobNote);
    note.addEventListener('input', function () { state.jobNote = note.value; grow(note); touch(); });
    return h('div', { class: 'prose' },
      h('div', { class: 'jobgrid' },
        h('figure', { class: 'placefig' },
          h('img', { src: PLACES[0].file, alt: PLACES[0].alt, width: '600', height: '600' }),
          h('figcaption', null, 'The red bough, from the original painting. It marks the place.')),
        h('div', null,
          para('Nim is a carpenter ant on the red bough. When the cliff wind turns, rain runs down the hanging roots and across the open platform. That is where Nim unrolls paper. The sheet cockles. The pencil rolls off. People stop by with half an idea and leave it in a heap.'),
          para('Nim wants a small sheltered room in the tree: dry enough for a plan, open enough to see the valley, and plain enough that one finished description can live there.'),
          para('There is no correct list of parts. Write what you would build, or borrow a suggestion and change it until it sounds like you. A picture of a finished treehouse is on the last page. It was drawn earlier. Your words will not change it, and they will not produce a model you can walk through.'),
          h('label', { class: 'field' },
            h('span', null, 'Working title'),
            title,
            h('span', { class: 'hint' }, 'You can change this later. It does not have to include Nim.')),
          h('label', { class: 'field' },
            h('span', null, 'In your words, what should the room do?'),
            note))),
      h('div', { class: 'rowbtns' },
        h('a', { class: 'btn', href: '#/bough/red/ideas' }, 'Continue to Idea Box')));
  }

  function drawIdeas() {
    return h('div', null,
      h('section', { 'aria-label': 'Suggestions' },
        h('h2', null, 'Suggestion cards'),
        h('p', { class: 'hint' }, 'Optional. Borrow a line and edit it, or ignore the cards and write your own. None of these is the right answer.'),
        h('div', { class: 'cards' }, CARDS.map(function (card) {
          var used = state.ideas.some(function (i) { return i.cardId === card.id; });
          return h('article', { class: 'sug' },
            h('p', null, card.text),
            h('button', {
              type: 'button',
              class: 'btn secondary',
              disabled: used,
              'aria-label': used ? ('Already in the box: ' + card.text) : ('Borrow this suggestion: ' + card.text),
              onclick: function () { addIdea(card.text, card); }
            }, used ? 'In the box' : 'Borrow'));
        }))),
      h('section', { 'aria-label': 'Your lines' },
        h('h2', null, 'Your lines'),
        state.ideas.length
          ? h('div', null, state.ideas.map(function (idea) { return slip(idea, 'box'); }))
          : h('p', { class: 'empty' }, 'The box is empty. Write a line, or borrow a card and change it.'),
        addForm('Add your own line', 'Add a line', function (v) { addIdea(v, null); })),
      h('div', { class: 'rowbtns' },
        h('a', { class: 'btn secondary', href: '#/bough/red/job' }, 'Back'),
        h('a', { class: 'btn', href: '#/bough/red/sketch' }, 'Continue to Sketchbook')));
  }

  function pocket(bin, hint) {
    var ideas = state.bins[bin].map(ideaById).filter(Boolean);
    return h('section', { class: 'pocket', 'aria-label': BIN_LABEL[bin] },
      h('h3', null, BIN_LABEL[bin]),
      h('p', { class: 'hint' }, hint),
      ideas.length ? ideas.map(function (idea) { return slip(idea, 'sketch'); }) : h('p', { class: 'empty' }, 'Nothing filed here.'));
  }

  function drawSketch() {
    var loose = state.bins.unsorted.map(ideaById).filter(Boolean);
    return h('div', null,
      sheet(
        h('h2', null, 'Sketchbook'),
        h('p', { class: 'hint' }, 'Needs: what the room must do. Materials: what it is made of. Details: the part you would hate to lose. The blue lines are a blank plan, not a picture of your build.'),
        h('h3', null, 'Not filed yet'),
        loose.length ? loose.map(function (idea) { return slip(idea, 'sketch'); }) : h('p', { class: 'empty' }, 'Nothing loose. Add a line, or take one back out of a pocket.'),
        addForm('Add your own line', 'Add a line', function (v) { addIdea(v, null); }),
        h('div', { class: 'pockets' },
          pocket('needs', 'What has to be true.'),
          pocket('materials', 'What you would build with.'),
          pocket('details', 'What you would hate to lose.')),
        h('div', { class: 'seq' },
          h('h3', null, 'Sequence'),
          h('p', { class: 'hint' }, 'Put the work in the order you want it done. Up and down only change the order.'),
          state.steps.length
            ? state.steps.map(stepRow)
            : h('p', { class: 'empty' }, 'No steps yet. One is enough to start.'),
          addForm('Then what happens?', 'Add a step', function (v) { addStep(v, false, ''); }))
      ),
      h('div', { class: 'rowbtns' },
        h('a', { class: 'btn secondary', href: '#/bough/red/ideas' }, 'Back'),
        h('a', { class: 'btn', href: '#/bough/red/build' }, 'Continue to Build & Try')));
  }

  function sectionField(key, label, value) {
    var area = h('textarea', { rows: '4', 'aria-label': label }, value);
    if (!value) area.setAttribute('placeholder', 'This part is empty. Write it here, or file a line on the sketchbook.');
    area.addEventListener('input', function () {
      if (!state.sectionsDirty) {
        state.sections = compose();
        state.sectionsDirty = true;
      }
      state.sections[key] = area.value;
      grow(area);
      touch();
      paintFeedback();
    });
    return h('label', { class: 'field' }, h('span', null, label), area);
  }

  function paintFeedback() {
    var host = document.getElementById('shape');
    if (!host) return;
    host.replaceChildren.apply(host, assess().map(function (line) { return h('li', null, line); }));
  }

  function drawBuild() {
    var sec = currentSections();
    var title = h('input', {
      type: 'text', autocomplete: 'off', value: state.title,
      'aria-label': 'Title', placeholder: 'A name you would actually use'
    });
    title.addEventListener('input', function () {
      state.title = title.value;
      touch();
      paintFeedback();
    });
    var red = PLACES[0];
    return h('div', { class: 'buildgrid' },
      h('div', null,
        sheet(
          h('h2', null, 'Your page'),
          h('p', { class: 'hint' }, 'Arranged from your notes. Edit any line. Dashes and numbers are only there to keep a list readable. The paper does not grade you.'),
          h('label', { class: 'field' }, h('span', null, 'Title'), title),
          sectionField('job', 'The job', sec.job),
          sectionField('needs', 'What it needs', sec.needs),
          sectionField('materials', 'Made from', sec.materials),
          sectionField('details', 'Details worth keeping', sec.details),
          sectionField('order', 'How it goes up', sec.order)
        ),
        h('div', { class: 'rowbtns' },
          h('button', { type: 'button', class: 'btn', onclick: onCopy }, 'Copy text'),
          h('button', { type: 'button', class: 'btn secondary', onclick: onDownload }, 'Download .txt'),
          h('button', { type: 'button', class: 'btn quiet', onclick: function () { showManual(exportText()); say('The full text is selected.'); } }, 'Select the text instead'),
          h('button', { type: 'button', class: 'btn quiet', onclick: function () {
            var dirty = state.sectionsDirty;
            state.sections = compose();
            state.sectionsDirty = false;
            saveNow();
            render(false);
            say(dirty ? 'The description now matches the sketchbook.' : 'It already matches the sketchbook.');
          } }, 'Replace with sketchbook text')),
        h('p', { id: 'copy-note', class: 'hint' }, 'Copy keeps every character, including a long line.'),
        h('div', { id: 'fallback', class: 'fallback', hidden: true },
          h('p', null, 'Copy is blocked in this browser, or you asked to select the text. It is in the box below. Press Ctrl+C or Command+C. Download works either way.'),
          h('textarea', { id: 'fallback-text', readOnly: true, 'aria-label': 'Full text to copy' }))),
      h('div', { class: 'sidefig' },
        h('section', { class: 'shape', 'aria-label': 'Shape of the writing' },
          h('h2', null, 'Shape of the writing'),
          h('ul', { id: 'shape' }, assess().map(function (line) { return h('li', null, line); }))),
        heroFigure('preset'),
        h('figure', { class: 'placefig' },
          h('img', { src: red.file, alt: red.alt, width: '600', height: '600' }),
          h('figcaption', null, 'The red bough painting marks the place. It is not a picture of your paragraph.'))));
  }

  function drawActivity(step) {
    var labels = { job: 'The Job', ideas: 'Idea Box', sketch: 'Sketchbook', build: 'Build & Try' };
    document.title = labels[step] + ' · Banyan Builders';
    var body = step === 'ideas' ? drawIdeas() : step === 'sketch' ? drawSketch() : step === 'build' ? drawBuild() : drawJob();
    return h('div', { class: 'screen' }, h('div', { class: 'wrap narrow' }, activityChrome(step), body), resetDialog());
  }

  function parse() {
    var raw = (location.hash || '#/home').replace(/^#/, '');
    var q = raw.indexOf('?');
    if (q !== -1) raw = raw.slice(0, q);
    var parts = raw.split('/').filter(Boolean);
    if (!parts.length || parts[0] === 'home') return { name: 'home' };
    if (parts[0] === 'about') return { name: 'about' };
    if (parts[0] === 'bough' && parts[1]) {
      var place = placeById(parts[1]);
      if (!place) return { name: 'home' };
      if (!place.playable) return { name: 'future', place: place };
      var step = ['job', 'ideas', 'sketch', 'build'].indexOf(parts[2]) !== -1 ? parts[2] : (state.lastStep || 'job');
      return { name: 'activity', place: place, step: step };
    }
    return { name: 'home' };
  }

  function render(moveFocus) {
    var route = parse();
    if (route.name === 'activity') {
      state.lastStep = route.step;
      state.seen[route.step] = true;
    }
    var app = document.getElementById('app');
    var node = route.name === 'about' ? drawAbout()
      : route.name === 'future' ? drawFuture(route.place)
      : route.name === 'activity' ? drawActivity(route.step)
      : drawHome();
    app.replaceChildren(node);
    app.querySelectorAll('textarea').forEach(grow);
    if (route.name === 'activity' && meaningful(state)) saveNow();
    if (moveFocus) {
      window.scrollTo(0, 0);
      var head = app.querySelector('h1');
      if (head) { head.tabIndex = -1; head.focus(); }
    }
  }

  function go(hash) {
    if (location.hash === hash) render(true);
    else location.hash = hash;
  }

  function init() {
    load();
    if (!location.hash) history.replaceState(null, '', '#/home');
    render(false);
    window.addEventListener('hashchange', function () { saveNow(); render(true); });
    window.addEventListener('pagehide', saveNow);
    window.addEventListener('error', function () {
      var n = document.getElementById('apperr');
      if (n) n.hidden = false;
    });
    setupWalletListeners();
    probeWallet();
    window.addEventListener('ethereum#initialized', function () {
      setupWalletListeners();
      probeWallet();
    }, { once: true });
    setTimeout(function () {
      if (wallet.status === 'no-provider' && window.ethereum) {
        setupWalletListeners();
        probeWallet();
      }
    }, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
