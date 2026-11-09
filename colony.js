(function () {
  'use strict';

  var KEY = 'colony-review-v1';
  var state = load();
  var watch = 0;
  var watchTimer = 0;

  var places = [
    ['home', 'Home'],
    ['workshop', 'Workshop'],
    ['greenhouse', 'Greenhouse'],
    ['cinema', 'Cinema'],
    ['treehouse', 'Treehouse']
  ];

  function fresh() {
    return {
      v: 1,
      ants: 10,
      solar: 'folded',
      water: 'none',
      rawTried: false,
      kit: false,
      sprouts: false,
      gust: false,
      receipts: [{
        item: 'Review-draft jar',
        change: 10,
        note: 'Starter demo ANTS. Not wages. Not money.'
      }],
      line: 'Brick sets the jar on the rail. Ten demo ANTS. Enough for the first mess, not for a kingdom.'
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      var data = JSON.parse(raw);
      if (!data || data.v !== 1) return fresh();
      return data;
    } catch (e) {
      return fresh();
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function say(text) {
    state.line = text;
  }

  function spend(cost, item, note) {
    if (state.ants < cost) {
      say('The jar is short by ' + (cost - state.ants) + '. Demo ANTS do not lend.');
      save();
      return false;
    }
    state.ants -= cost;
    state.receipts.unshift({ item: item, change: -cost, note: note });
    return true;
  }

  function growIfReady() {
    if (state.kit && state.water === 'clean' && state.solar === 'lit' && !state.sprouts) {
      state.sprouts = true;
      state.gust = true;
      state.solar = 'dusty';
      say('A sprout stands up. Then a gust uses the panel as a shelf. The green stayed. The power did not.');
    }
  }

  function solarWord() {
    if (state.solar === 'lit') return 'Lit';
    if (state.solar === 'dusty') return 'Dusty';
    return 'Folded';
  }
  function waterWord() {
    if (state.water === 'clean') return 'Clear';
    if (state.water === 'dusty') return 'Orange';
    return 'Empty';
  }
  function gardenWord() {
    if (state.sprouts) return 'Sprouting';
    if (state.kit) return 'Kit waiting';
    return 'Bare dust';
  }

  function ribbon() {
    return '<div class="ribbon" aria-label="Habitat right now">' +
      '<div><span>Sun</span><strong>' + solarWord() + '</strong></div>' +
      '<div><span>Water</span><strong>' + waterWord() + '</strong></div>' +
      '<div><span>Garden</span><strong>' + gardenWord() + '</strong></div>' +
      '<div><span>Demo ANTS</span><strong>' + state.ants + '</strong></div>' +
      '</div>';
  }

  function lineBlock() {
    return '<div class="say" role="status">' + escapeHtml(state.line) + '</div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function receipts() {
    var items = state.receipts.slice(0, 6).map(function (r) {
      var sign = r.change > 0 ? '+' + r.change : String(r.change);
      return '<li><span>' + escapeHtml(r.item) + '</span><strong>' + sign + ' demo ANTS</strong><small>' + escapeHtml(r.note) + '</small></li>';
    }).join('');
    return '<h2>Receipts in this browser</h2><ul class="receipts">' + items + '</ul>';
  }

  function antSvg(extra, body, mid, head) {
    return '<svg class="walker ' + extra + '" viewBox="0 0 86 48" aria-hidden="true">' +
      '<g fill="none" stroke="#2a1c14" stroke-width="1.4" stroke-linecap="round">' +
      '<path class="leg" d="M30 30 q-8 8-14 6"/><path class="leg b" d="M34 32 q-2 10 6 10"/>' +
      '<path class="leg" d="M38 31 q8 8 14 5"/><path class="leg b" d="M28 28 q-12 2-16-4"/>' +
      '<path class="leg" d="M42 28 q10 0 14-6"/><path class="leg b" d="M36 27 q2-8 10-8"/>' +
      '</g>' +
      '<ellipse cx="34" cy="28" rx="12" ry="8" fill="' + body + '"/>' +
      '<ellipse cx="48" cy="26" rx="8" ry="6.5" fill="' + mid + '"/>' +
      '<circle cx="60" cy="23" r="6.5" fill="' + head + '"/>' +
      '<circle cx="62" cy="22" r="1.2" fill="#f6edd9"/>' +
      '<path d="M57 18 q6-12 10-8M59 18 q8-14 12-6" fill="none" stroke="#2a1c14" stroke-width="1.2"/>' +
      '</svg>';
  }

  function home() {
    return '<section class="home">' +
      '<div class="lede">' +
      '<p class="kicker">Inside one engineered dome</p>' +
      '<h1>Building a new world. Bringing the same old problems.</h1>' +
      '<p class="sub">Join Brick, Dash and an ambitious colony of ants as they use real science to build a home on Mars. Every invention solves a problem. Sometimes it creates another.</p>' +
      '<p class="note">Dust, window-light, and the walking ants are ambient animation. They are not a finished cartoon. The four places below are all part of this one corner.</p>' +
      '</div>' +
      '<figure class="stage"><div class="stage-art">' +
      '<img class="panorama" src="assets/panorama.jpg" width="1280" height="720" alt="Golden-dusk panorama of a lush planted dome on barren Mars. Ants gather by an outdoor screen, a crane, a treehouse stair, and a small supply shop, with red rock outside the ribs.">' +
      '<div class="glow" aria-hidden="true"></div>' +
      '<div class="motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="walkers" aria-hidden="true">' + antSvg('', '#c4623a', '#a84e30', '#d36a42') + antSvg('two', '#3a342f', '#2a2624', '#4a433e') + '</div>' +
      '<div class="spots">' +
      '<a class="spot cinema" href="#/cinema">Cinema<small>Watch / Read</small></a>' +
      '<a class="spot workshop" href="#/workshop">Workshop<small>Power and water</small></a>' +
      '<a class="spot treehouse" href="#/treehouse">Treehouse<small>Cast and mission</small></a>' +
      '<a class="spot greenhouse" href="#/greenhouse">Greenhouse<small>Food, not dust</small></a>' +
      '</div></div>' +
      '<figcaption>The clear ribs are story art. In the tale, this shell is sealed, pressurized, insulated, and shielded. Ordinary glass would not keep air, heat, or radiation in line. Outside is still Mars.</figcaption>' +
      '</figure></section>';
  }

  function portraits() {
    return '<div class="cast">' +
      '<img src="assets/brick.jpg" width="490" height="620" alt="Brick, a broad coral ant with a short rounded face, six limbs, no wings and no scarf, in a stitched tool vest with a mallet.">' +
      '<p><strong>Brick</strong> measures twice and still finds a joke in the second measurement. The vest holds the mallet. The mallet is for taps, not for triumph.</p>' +
      '</div><div class="cast">' +
      '<img src="assets/dash.jpg" width="560" height="650" alt="Dash, a slimmer coral ant with a short rounded face and six limbs, no wings and no scarf, running with a lit lantern.">' +
      '<p><strong>Dash</strong> tries the interesting thing immediately, then helps clean up. The lantern is for looking, not for pretending the Sun is optional.</p>' +
      '</div>';
  }

  function treehouse() {
    var ending = (state.sprouts && state.water === 'clean' && state.solar === 'lit')
      ? '<div class="say">The corner is better. It is not finished. The tank is not a magic well, the sprout is not a new sky, and the dust will find the panel again. That is the job: cooperation, maintenance, and no victory parade.</div>'
      : '<div class="say">Mission, if you want one: light the panel, clean the meltwater, and grow something in washed grit. Leave the red dust in the tray where it belongs.</div>';
    return '<article class="sheet">' +
      '<p class="kicker">Treehouse</p>' +
      '<h1>Two ants and a corner of Mars</h1>' +
      portraits() +
      '<p>They are not here to paint the planet green. They are here to keep one engineered room kind enough for work: power from the weaker sunlight, water that is actually water, and food that did not come out of untreated regolith.</p>' +
      '<p>A builder\'s habit they borrowed, in the spirit of Buckminster Fuller: do more with less, and connect the pieces. A bigger pile of gadgets is not a home. A dome is not a utopia. Somebody still takes out the dust.</p>' +
      ending +
      '<div class="row"><a class="btn" href="#/workshop">Start with the Sun</a><a class="btn secondary" href="#/cinema">Hear the sunset joke</a></div>' +
      '</article>';
  }

  function workshop() {
    return '<article class="sheet">' +
      '<p class="kicker">Workshop</p>' +
      '<h1>Sun first. Then the water.</h1>' +
      ribbon() +
      '<div class="machine"><div class="rig" aria-hidden="true">' +
      '<div class="solar ' + state.solar + '"></div>' +
      '<div class="tank ' + state.water + '"><i></i></div>' +
      '</div><div>' +
      '<p>The panel drinks the afternoon. Mars gets less sunlight than Earth, and dust can sit on the glass. The tank is meltwater from ice, which starts full of iron-oxide dust. Clear water is a filtered result, not a miracle.</p>' +
      lineBlock() +
      '<div class="row">' +
      '<button type="button" class="btn" id="act-unfold">Unfold the panel</button>' +
      '<button type="button" class="btn" id="act-melt">Melt a scoop of ice</button>' +
      '<button type="button" class="btn" id="act-filter">Run the recycler · 3 demo ANTS</button>' +
      '<button type="button" class="btn secondary" id="act-brush">Brush the panel · 2 demo ANTS</button>' +
      '</div></div></div>' +
      receipts() +
      '</article>';
  }

  function greenhouse() {
    var sprouts = state.sprouts
      ? '<i class="sprout a"></i><i class="sprout b"></i><i class="sprout c"></i>'
      : '';
    return '<article class="sheet">' +
      '<p class="kicker">Greenhouse</p>' +
      '<h1>Do not pot a seed in the red dust.</h1>' +
      ribbon() +
      '<div class="beds">' +
      '<div class="bed"><strong>Raw regolith</strong><p>Rusty, salty, and not a garden. The seed can refuse.</p></div>' +
      '<div class="bed ' + (state.sprouts ? 'live' : '') + '"><strong>' + (state.sprouts ? 'Washed grit, fed and watered' : 'Prepared bed') + '</strong><p>' + (state.sprouts ? 'A small green opinion. Not a closed loop.' : 'Waiting for a kit, clear water, and a lit panel.') + '</p>' + sprouts + '</div>' +
      '</div>' +
      lineBlock() +
      '<div class="row">' +
      '<button type="button" class="btn secondary" id="act-raw">Try the red dust</button>' +
      '<button type="button" class="btn" id="act-kit">Buy a growing kit · 4 demo ANTS</button>' +
      '<button type="button" class="btn secondary" id="act-check">Check the bed</button>' +
      '</div>' +
      '<p>The kit is washed mineral grit, a measured nutrient mix, and seeds. It is not a sack of Mars dirt. Plants also need light and clean water. Waste still has to be dealt with later. Nothing here runs forever by itself.</p>' +
      '</article>';
  }

  function panel(n, sky, bubble, caption, who) {
    return '<figure class="panel' + (watch === n ? ' on' : '') + '" data-panel="' + n + '">' +
      '<div class="sky ' + sky + '">' + who + '<p class="bubble">' + bubble + '</p></div>' +
      '<figcaption>' + caption + '</figcaption></figure>';
  }

  function cinema() {
    var brick = '<img class="who brick" src="assets/brick.jpg" alt="">';
    var dash = '<img class="who dash" src="assets/dash.jpg" alt="">';
    return '<article class="sheet" id="cinema-sheet">' +
      '<p class="kicker">Cinema · illustrated scene</p>' +
      '<h1>Wrong planet?!</h1>' +
      '<p>Four panels to read, or one at a time. This is a still scene with optional stepping. It is not a finished cartoon, and the walking ants outside are only ambient motion.</p>' +
      '<div class="row">' +
      '<button type="button" class="btn" id="mode-read">Read all</button>' +
      '<button type="button" class="btn secondary" id="mode-watch">Watch one by one</button>' +
      '<button type="button" class="btn secondary" id="mode-next">Next panel</button>' +
      '</div>' +
      '<div class="comic" id="comic">' +
      panel(0, 'bluehour', 'Wrong planet?!', 'The blue sits on the Sun. Dash takes it personally.', dash) +
      panel(1, 'bluehour', 'The dust is the filter.', 'Fine dust scatters blue forward. The rest of the sky stays butterscotch.', brick) +
      panel(2, 'noon', 'Noon is still butterscotch.', 'Dash painted the door blue at lunch. The sky declined to match.', brick + dash) +
      panel(3, 'noon', 'Every fix starts another chore.', 'The door is half blue. The dust still needs a brush. A sprout is not a new atmosphere.', '<div class="door" aria-hidden="true"></div>' + dash) +
      '</div></article>';
  }

  function support() {
    return '<article class="support">' +
      '<p class="kicker">Adult note · not part of the story</p>' +
      '<h1>Nothing here is launched</h1>' +
      '<p>This page is for adults checking the draft. Brick and Dash never mention it.</p>' +
      '<ul>' +
      '<li>Demo ANTS are a browser counter for this review. They have no cash value, no blockchain, and no wallet. Spending them only changes pictures on this page.</li>' +
      '<li>No memecoin is launched here. This is not an offer, a sale, or a treasury. There is no link to $ARGON. ARGON is a different project. These ants are not that project.</li>' +
      '<li>The pictures were supplied for this review. They are not claimed as public-domain, and this unpublished draft is not a release of those rights.</li>' +
      '<li>The earlier writing demo is a separate page in this repository: <a href="writing/index.html">writing/index.html</a>. It is not part of the colony story.</li>' +
      '</ul>' +
      '<div class="row"><button type="button" class="btn secondary" id="act-reset">Clear this browser\'s colony draft</button></div>' +
      '</article>';
  }

  function render(focus) {
    var name = (location.hash || '#/home').replace(/^#\//, '').split('/')[0] || 'home';
    if (['home', 'workshop', 'greenhouse', 'cinema', 'treehouse', 'support'].indexOf(name) === -1) name = 'home';
    var main = document.getElementById('main');
    var html = name === 'workshop' ? workshop()
      : name === 'greenhouse' ? greenhouse()
      : name === 'cinema' ? cinema()
      : name === 'treehouse' ? treehouse()
      : name === 'support' ? support()
      : home();
    main.innerHTML = html;
    document.querySelectorAll('.places a').forEach(function (a) {
      var on = a.getAttribute('href') === '#/' + name;
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var jar = document.getElementById('jar');
    jar.textContent = 'Demo ANTS: ' + state.ants;
    document.title = (name === 'home' ? 'The Colony' : name.charAt(0).toUpperCase() + name.slice(1) + ' · The Colony');
    bind(name);
    if (focus) {
      var h = main.querySelector('h1');
      if (h) { h.tabIndex = -1; h.focus(); }
    }
  }

  function act(fn) {
    fn();
    save();
    render(false);
  }

  function bind(name) {
    var map = {
      'act-unfold': function () {
        if (state.solar === 'dusty') { say('Unfolding a dusty panel just shows you the dust. Brush it.'); return; }
        state.solar = 'lit';
        say('The panel opens. Weaker than an Earth noon, and still the best power in the room.');
        growIfReady();
      },
      'act-melt': function () {
        if (state.solar !== 'lit') { say(state.solar === 'dusty' ? 'The heater clicks and gives up. Dust is sitting on the power.' : 'The ice thanked them for the attention and stayed ice. Unfold the panel.'); return; }
        state.water = 'dusty';
        say('Orange water. Brick calls it sunset soup. Nobody drinks sunset soup.');
      },
      'act-filter': function () {
        if (state.water === 'clean') { say('The tank is already clear. Running it again would only spend demo ANTS on a finished chore.'); return; }
        if (state.water !== 'dusty') { say('There is nothing in the tank but hope. Melt a scoop of ice first.'); return; }
        if (state.solar !== 'lit') { say('The pump coughed. It wants a lit panel, not a folded one and not a dusty one.'); return; }
        if (!spend(3, 'Water recycler', 'Orange water went in. Clear water came out. The dust stayed in the tray.')) return;
        state.water = 'clean';
        say('Three demo ANTS. The receipt is ruder than the price, and the water is finally water.');
        growIfReady();
      },
      'act-brush': function () {
        if (state.solar !== 'dusty') { say('The glass is already clear. Save the demo ANTS.'); return; }
        if (!spend(2, 'Panel brush', 'A gust had used the panel as a shelf. The brush put the Sun back to work.')) return;
        state.solar = 'lit';
        say('Dash sneezes rust-colored. The panel drinks light again. This will not be the last time.');
        growIfReady();
      },
      'act-raw': function () {
        state.rawTried = true;
        say('The seed looked at the red dust and declined. Rusty, salty, and not a snack. Washed grit is the bed. The lab note is in Sources.');
      },
      'act-kit': function () {
        if (state.kit) { say('The kit is already on the bench.'); growIfReady(); return; }
        if (!spend(4, 'Growing kit', 'Washed grit, added nutrients, and seeds. Not a bag of raw regolith.')) return;
        state.kit = true;
        say('Four demo ANTS for grit, food, and seeds. Still no sprout until the water is clear and the panel is lit.');
        growIfReady();
      },
      'act-check': function () {
        var before = state.sprouts;
        growIfReady();
        if (state.sprouts && !before) return;
        if (state.sprouts) { say('Still a sprout. Still not a finished atmosphere. Somebody has a dust chore.'); return; }
        if (!state.kit) { say('There is no kit yet. Raw dust does not count.'); return; }
        say('The seeds are patient and specific. They want clear water and a lit panel.');
      },
      'act-reset': function () {
        state = fresh();
        say('Draft cleared in this browser. The jar is back to ten demo ANTS.');
      }
    };
    Object.keys(map).forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.addEventListener('click', function () { act(map[id]); });
    });
    if (name === 'cinema') bindCinema();
  }

  function bindCinema() {
    var comic = document.getElementById('comic');
    function show(mode) {
      comic.classList.toggle('watch-on', mode === 'watch');
      comic.querySelectorAll('.panel').forEach(function (p, i) {
        p.classList.toggle('on', i === watch);
      });
    }
    document.getElementById('mode-read').addEventListener('click', function () {
      clearInterval(watchTimer);
      comic.classList.remove('watch-on');
      say('All four panels are on the page.');
    });
    document.getElementById('mode-next').addEventListener('click', function () {
      watch = (watch + 1) % 4;
      show('watch');
    });
    document.getElementById('mode-watch').addEventListener('click', function () {
      var calm = document.documentElement.dataset.calm === '1' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      show('watch');
      clearInterval(watchTimer);
      if (calm) {
        say('Calm motion is on, so the panels wait for Next. Nothing plays by itself.');
        return;
      }
      watchTimer = setInterval(function () {
        watch = (watch + 1) % 4;
        show('watch');
      }, 3200);
      say('Stepping through the still panels. This is not a film.');
    });
  }

  function paintJar() {
    document.getElementById('jar').textContent = 'Demo ANTS: ' + state.ants;
  }

  document.getElementById('open-sources').addEventListener('click', function () {
    document.getElementById('drawer').showModal();
  });
  document.getElementById('close-sources').addEventListener('click', function () {
    document.getElementById('drawer').close();
  });
  document.getElementById('calm').addEventListener('click', function () {
    var on = document.documentElement.dataset.calm === '1';
    if (on) delete document.documentElement.dataset.calm;
    else document.documentElement.dataset.calm = '1';
    this.setAttribute('aria-pressed', on ? 'false' : 'true');
    this.textContent = on ? 'Calm motion' : 'Motion calmed';
  });

  window.addEventListener('hashchange', function () {
    clearInterval(watchTimer);
    render(true);
  });
  render(false);
  paintJar();
})();
