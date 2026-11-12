(() => {
  /* ===== Where every "Order online" button goes =====
     Paste PizzaBurg's exact foodpanda restaurant link here, e.g.
     'https://www.foodpanda.com.bd/restaurant/xxxx/pizzaburg-mirpur' */
  const ORDER_URL = 'https://www.foodpanda.com.bd/';
  const PB = window.PB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tk = n => '৳' + Number(n).toLocaleString('en-IN');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const star = '<svg aria-label="Fan favourite"><use href="#i-star"/></svg>';
  const IMG = 'assets/img/';
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  $$('[data-order]').forEach(a => a.href = ORDER_URL);

  /* ---------------- MENU ---------------- */
  const G = PB.groups;
  const nice = { 'COMBO PACK!': 'Combo Packs', 'Cola': 'Cold Drinks', 'HOT COFFEE': 'Hot Coffee', 'ICED DRINKS': 'Iced Drinks', 'Krusher': 'Krushers', 'Milk Shake': 'Milk Shakes' };
  function catBlock(title, items, cols) {
    const head = cols ? `<div class="mcat__cols">${cols.map(c => `<span data-s="${({ Chicken: 'Chkn' })[c] || c}">${c}</span>`).join('')}</div>` : `<div class="mcat__cols"><span>Price</span></div>`;
    const rows = items.map(it => {
      let price;
      if (cols) {
        const m = Object.fromEntries(it.prices.map(([o, p]) => [o.toLowerCase(), p]));
        price = `<div class="mrow__p">${cols.map(c => `<span>${m[c.toLowerCase()] != null ? m[c.toLowerCase()] : '–'}</span>`).join('')}</div>`;
      } else if (it.prices.length > 1) {
        price = `<div class="mrow__p single"><span>${it.prices.map(([o, p]) => `${esc(o)} ${p}`).join(' · ')}</span></div>`;
      } else price = `<div class="mrow__p"><span>${it.prices[0][1]}</span></div>`;
      const desc = [it.desc, it.note && ('Choice of ' + it.note)].filter(Boolean).join(' · ');
      return `<div class="mrow reveal"><div class="mrow__t"><div class="mrow__n">${esc(it.name)}${it.star ? star : ''}</div>${desc ? `<div class="mrow__d">${esc(desc)}</div>` : ''}</div>${price}</div>`;
    }).join('');
    return `<div class="mcat"><div class="mcat__head"><span class="dot"></span><h3>${esc(title)}</h3>${head}</div>${rows}</div>`;
  }
  const sizes = ['Small', 'Medium', 'Large', 'Family'];
  const addons = PB.pizzaAddons.map(a => ({ name: a.name, desc: 'Per pizza', prices: sizes.map(s => [s, a.prices[s]]).filter(x => x[1] != null) }));
  $('#menuMain').innerHTML =
    `<div class="mcol">${catBlock('Pizzas', G['Pizza'], ['S', 'M', 'L', 'Family'].map((c, i) => c)).replace(/<div class="mcat__cols">.*?<\/div>/, `<div class="mcat__cols"><span data-s="S">Small</span><span data-s="M">Med</span><span data-s="L">Large</span><span data-s="F">Family</span></div>`)}
      ${catBlock('Pizza Add-ons', addons, ['Small', 'Medium', 'Large', 'Family']).replace(/<div class="mcat__cols">.*?<\/div>/, `<div class="mcat__cols"><span data-s="S">Small</span><span data-s="M">Med</span><span data-s="L">Large</span><span data-s="F">Family</span></div>`)}</div>
     <div class="mcol">${catBlock('Burgers', G['Burger'], ['Chicken', 'Beef'])}
      ${catBlock('Combo Packs', G['COMBO PACK!'])}
      ${catBlock('Set Menu & Platters', G['Set Menu & Platters'])}</div>`;
  // fix pizza price column mapping (sizes are Small/Medium/Large/Family in data)
  $$('#menuMain .mcol:first-child .mcat').forEach((cat, ci) => {
    const list = ci === 0 ? G['Pizza'] : addons;
    $$('.mrow__p', cat).forEach((p, i) => {
      const m = Object.fromEntries(list[i].prices.map(([o, v]) => [o.toLowerCase(), v]));
      p.innerHTML = sizes.map(s => `<span>${m[s.toLowerCase()] ?? '–'}</span>`).join('');
    });
  });
  const drinks = ['Sides', 'Cola', 'Krusher', 'Coffee', 'HOT COFFEE', 'Iced Coffee', 'ICED DRINKS', 'Milk Shake', 'Mocktails'];
  const cols3 = [[], [], []];
  drinks.forEach((k, i) => G[k] && cols3[i % 3].push(catBlock(nice[k] || k, G[k])));
  $('#menuDrinks').innerHTML = cols3.map(c => `<div class="mcol">${c.join('')}</div>`).join('');

  /* ---------------- TOP PICKS ---------------- */
  const pickDefs = [
    { name: 'Kebab Cocktail', img: 'pizza_kebab_cocktail.png', bg: '#ED1A24', r: -4 },
    { name: 'The Everything', img: 'pizza_the_everything.png', bg: '#3A1A06', r: 3 },
    { name: 'Cheese Volcano', img: 'burger_cheese_volcano.png', bg: '#FFC23A', r: -2, burger: true },
    { name: 'Mac and cheese', img: 'pizza_mac_and_cheese.png', bg: '#55301A', r: 4 },
  ];
  const all = Object.values(G).flat();
  $('#picks').innerHTML = pickDefs.map(p => {
    const it = all.find(x => x.name.toLowerCase() === p.name.toLowerCase());
    const pr = it ? it.prices.map(([o, v]) => `<span>${o ? o[0].toUpperCase() + (p.burger ? o.slice(1) : '') + ' ' : ''}${tk(v)}</span>`).join('') : '';
    return `<a class="pick reveal" href="${ORDER_URL}" target="_blank" rel="noopener">
      <div class="pick__card" style="--r:${p.r}deg;--bg:${p.bg}">
        ${it && it.star ? `<span class="pick__badge">${star}Fan fav</span>` : ''}
        <img src="${IMG + p.img}" alt="${esc(p.name)}" loading="lazy"><span class="pick__cta">Order on foodpanda</span></div>
      <div class="pick__name">${esc(it ? it.name : p.name)}</div><div class="pick__price">${pr}</div></a>`;
  }).join('');

  /* ---------------- DEALS (real menu items & prices) ---------------- */
  const find = n => all.find(x => x.name.toLowerCase() === n.toLowerCase());
  const deals = [
    { k: 'For two', t: 'Couple Combo', item: 'Couple combo 2', img: 'combo_pack__couple_combo_2.jpg', cls: 'deal--stripe', from: false },
    { k: 'Squad night', t: 'Combo for 4', item: 'Combo for 4', img: 'combo_pack__combo_for_4.jpg', cls: 'deal--dark', from: false },
    { k: 'Lunch time', t: 'Set Menus', item: 'Set Menu-1', img: 'luncheon_set_menu__set_menu_3.jpg', cls: 'deal--brown', from: true, desc: 'Rice, sides and mains on one plate. Six set menus to pick from.' },
    { k: 'Go big', t: 'Fat Boy Meal', item: 'Fat Boy Meal', img: 'luncheon_set_menu__fat_boy_meal.jpg', cls: 'deal--red', from: false },
    { k: 'Feast mode', t: 'Premium Platter', item: 'Premium Platter 1', img: 'new_rice_combo_premium_platter_2.jpg', cls: 'deal--dark', from: false },
  ];
  $('#deals').innerHTML = deals.map(d => {
    const it = find(d.item); const price = it ? it.prices[0][1] : '';
    const desc = d.desc || (it ? [it.desc, it.note && 'Choice of ' + it.note].filter(Boolean).join(' · ') : '');
    return `<a class="deal ${d.cls}" href="${ORDER_URL}" target="_blank" rel="noopener">
      <img src="${IMG + d.img}" alt="${esc(d.t)}" loading="lazy">
      <div><div class="deal__kicker">${esc(d.k)}</div><h3 class="deal__title">${esc(d.t)}</h3></div>
      <p class="deal__desc">${esc(desc.slice(0, 120))}${desc.length > 120 ? '…' : ''}</p>
      <div class="deal__price">${d.from ? '<small>from</small>' : ''}${tk(price)}</div></a>`;
  }).join('');
  const scrollByCard = (el, dir) => el.scrollBy({ left: dir * (el.firstElementChild.getBoundingClientRect().width + 28), behavior: 'smooth' });
  $('#dealPrev').onclick = () => scrollByCard($('#deals'), -1);
  $('#dealNext').onclick = () => scrollByCard($('#deals'), 1);

  /* ---------------- PHOTO STRIP ---------------- */
  const shots = ['fb_03.jpg', 'fb_06.jpg', 'combo_pack__couple_combo_2.jpg', 'fb_04.jpg', 'fb_07.jpg', 'fb_08.jpg', 'fb_05.jpg', 'fb_09.jpg', 'fb_10.jpg', 'new_rice_combo_premium_platter_2.jpg'];
  const rots = [-6, 4, -3, 7, -5, 3, -7, 5, -2, 6];
  const shotHTML = shots.map((s, i) => `<figure class="shot" style="--r:${rots[i]}deg;margin-top:${i % 2 ? 40 : 0}px"><img src="${IMG + s}" alt="PizzaBurg moments" loading="lazy"></figure>`).join('');
  $('#stripTrack').innerHTML = shotHTML + shotHTML;

  /* ---------------- TICKER ---------------- */
  const facts = ['19 branches across Bangladesh', 'Burgers from ৳209', 'Set menus from ৳229', 'Family size pizzas from ৳1,079', 'Open 11 AM to 11 PM', 'Order on foodpanda for delivery', 'Hotline +880 1404-461200'];
  $('#ticker').innerHTML = [...facts, ...facts].map(f => `<span>${esc(f)}</span>`).join('');

  /* ---------------- BRANCHES ---------------- */
  const br = PB.branches.slice();
  const tag = (on, l) => `<span class="btag ${on ? 'btag--on' : ''}">${on ? '✓ ' : ''}${l}</span>`;
  $('#branchRow').innerHTML =
    `<div class="bcard bcard--cta"><h3>Order Your<br>Fresh Pizza Now</h3><p>Craving pizza? Order PizzaBurg on foodpanda and get it delivered from your nearest branch.</p>
      <a class="pill pill--panda" href="${ORDER_URL}" target="_blank" rel="noopener">Order on foodpanda</a></div>` +
    br.map(b => `<div class="bcard"><h3>PizzaBurg ${esc(b.name)}</h3>
      <div class="bline"><svg><use href="#i-pin"/></svg><span>${esc(b.area || b.name)}</span></div>
      <div class="bline"><svg><use href="#i-phone"/></svg><a href="tel:+8801404461200">+880 1404-461200</a></div>
      <div class="bline"><svg><use href="#i-clock"/></svg><span>Mon to Sun: ${esc(b.hours_bst.replace(/^0/, '').replace(' - 0', ' to ').replace(' - ', ' to '))}</span></div>
      <div class="btags">${tag(b.pickup, 'Pickup')}${tag(b.delivery, 'Delivery')}</div>
      <a class="pill" href="${b.google_maps}" target="_blank" rel="noopener">View on map</a></div>`).join('');
  $('#brPrev').onclick = () => scrollByCard($('#branchRow'), -1);
  $('#brNext').onclick = () => scrollByCard($('#branchRow'), 1);
  $('#branchSelect').innerHTML = '<option value="">Choose a branch</option>' + br.filter(b => b.pickup).map(b => `<option>${esc(b.name)}</option>`).join('');

  /* ---------------- RESERVATION FORM ---------------- */
  // No backend: opens the visitor's email app with the booking pre-filled to PizzaBurg's email.
  const dateIn = $('#resForm [name=date]'); dateIn.min = new Date().toISOString().slice(0, 10);
  $('#resForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const body = `Table reservation request\n\nName: ${f.name}\nPhone: ${f.phone}\nBranch: ${f.branch}\nGuests: ${f.guests}\nDate: ${f.date}\nTime: ${f.time}\nNotes: ${f.notes || '-'}`;
    location.href = `mailto:${PB.brand.contact.email}?subject=${encodeURIComponent('Table reservation: ' + f.branch + ', ' + f.date)}&body=${encodeURIComponent(body)}`;
    $('#resMsg').textContent = 'Your email app is opening with the booking details. Or call +880 1404-461200.';
  });

  /* ---------------- SPLIT HEADINGS + REVEAL ---------------- */
  $$('.split').forEach(h => {
    h.innerHTML = h.innerHTML.split(/(<br>)/).map(part => part === '<br>' ? part :
      part.split(/\s+/).filter(Boolean).map(w => `<span class="w"><span>${w}</span></span>`).join(' ')).join('');
    $$('.w>span', h).forEach((s, i) => s.style.transitionDelay = (i * 0.07) + 's');
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.split,.reveal').forEach((el, i) => {
    if (el.classList.contains('reveal') && el.parentElement) {
      const sib = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = Math.min(sib.indexOf(el) * 0.05, 0.4) + 's';
    }
    io.observe(el);
  });

  /* ---------------- NAV: burger + scrollspy ---------------- */
  const burger = $('#burger'), mnav = $('#mnav');
  burger.onclick = () => { const o = mnav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  $$('.mnav a').forEach(a => a.onclick = () => { mnav.classList.remove('open'); burger.setAttribute('aria-expanded', false); });
  const spyLinks = $$('[data-spy]');
  const spyIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) spyLinks.forEach(l => l.classList.toggle('is-active', l.dataset.spy === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'about', 'menu', 'reserve', 'branches'].forEach(id => spyIO.observe(document.getElementById(id)));

  /* ---------------- ORDER NOW popup ---------------- */
  const order = $('#order'), obtn = $('#orderBtn');
  obtn.onclick = e => { e.stopPropagation(); const o = order.classList.toggle('open'); obtn.setAttribute('aria-expanded', o); };
  document.addEventListener('click', e => { if (!order.contains(e.target)) { order.classList.remove('open'); obtn.setAttribute('aria-expanded', false); } });
  $$('#orderPop a').forEach(a => a.addEventListener('click', () => { order.classList.remove('open'); obtn.setAttribute('aria-expanded', false); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { order.classList.remove('open'); mnav.classList.remove('open'); } });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------------- HERO: slice-pull loop ---------------- */
  // Wedge between angles A1..A2 (degrees, 0 = right, clockwise) is cut from the base and pulled outward.
  const A1 = -3, A2 = 41, R = 75; // matches the angle of the slice in the hand photo // R in % (beyond the circle edge, which is transparent)
  const pt = a => { const r = a * Math.PI / 180; return `${50 + R * Math.cos(r)}% ${50 + R * Math.sin(r)}%`; };
  // the slice layer overlaps the cut by ~1° on each side so no seam shows at rest
  const wedge = ['50% 50%']; for (let a = A1 - 1.2; a <= A2 + 1.2; a += 9) wedge.push(pt(a)); wedge.push(pt(A2 + 1.2));
  const rest = ['50% 50%']; for (let a = A2; a <= A1 + 360; a += 15) rest.push(pt(a)); rest.push(pt(A1 + 360));
  const base = $('#hpBase'), slice = $('#hpSlice');
  base.style.clipPath = `polygon(${rest.join(',')})`;
  slice.style.clipPath = `polygon(${wedge.join(',')})`;
  const mid = (A1 + A2) / 2 * Math.PI / 180, dx = Math.cos(mid), dy = Math.sin(mid);
  // slice + hand move together as one group (#hpGrp); the movement is driven only by scrolling
  const grp = $('#hpGrp');
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ---------------- SCROLL-LINKED MOTION ---------------- */
  const hero = $('#home'), pizza = $('#heroPizza');
  const ings = $$('.ing');
  const mqL = $('.mq--l'), mqR = $('.mq--r');
  const floats = $$('[data-speed]');
  const strip = $('#strip'), stripTrack = $('#stripTrack');
  let vh = innerHeight; addEventListener('resize', () => vh = innerHeight);
  const t0 = performance.now();
  const ingCfg = {
    pepper: { x: [-120, 40], y: [80, -140], r: [-40, 20] },
    basil: { x: [140, -30], y: [60, -200], r: [30, -15] },
    olive: { x: [-60, 30], y: [0, -380], r: [0, 220] },
    basil2: { x: [80, -60], y: [20, -420], r: [-10, 60] },
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  function frame(now) {
    const y = scrollY;
    const hh = hero.offsetHeight;
    const p = clamp(y / (hh * 0.8)); // hero progress
    if (y < hh + 50) {
      // 1) first part of the scroll: the hand pulls the slice out of the pizza
      // 2) then it carries the slice away down-right while the pizza rises
      const pw = pizza.offsetWidth;
      const pull = easeOut(clamp(p / 0.32));          // 0..1
      const carry = ease(clamp((p - 0.32) / 0.6));    // 0..1
      const dist = pw * (0.15 * pull + 0.45 * carry);
      const rise = p * vh * 0.55;                     // how far the pizza moves up
      grp.style.transform = `translate(${dx * dist}px, ${dy * dist + rise * 0.85 * carry}px) rotate(${pull * 4 + carry * 8}deg)`;
      grp.style.opacity = 1 - clamp((p - 0.55) / 0.35);
      slice.style.filter = pull > 0.01 ? `drop-shadow(${-8 * pull}px ${12 * pull}px ${14 * pull}px rgba(60,0,0,${0.4 * pull}))` : 'none';
      pizza.style.transform = `translateY(${-rise}px) scale(${1 - p * 0.08})`; // rises, no rolling
      mqL.style.transform = `translateX(${-p * 18}vw)`;
      mqR.style.transform = `translateX(${p * 18}vw)`;
      ings.forEach(el => {
        const c = ingCfg[el.dataset.ing]; const q = ease(clamp(p * 1.6));
        el.style.transform = `translate(${lerp(c.x[0], c.x[1], q)}px, ${lerp(c.y[0], c.y[1], p)}px) rotate(${lerp(c.r[0], c.r[1], p)}deg)`;
        el.style.opacity = clamp(p * 4);
      });
    }
    // parallax floats / notes
    for (const el of floats) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const d = (r.top + r.height / 2 - vh / 2);
      const s = parseFloat(el.dataset.speed), rot = parseFloat(el.dataset.rot || 0);
      const baseR = getComputedStyle(el).getPropertyValue('--r') || '0deg';
      el.style.transform = `translateY(${d * s}px) rotate(calc(${baseR} + ${rot * d / vh}deg))`;
    }
    // photo strip moves sideways with scroll
    const sr = strip.getBoundingClientRect();
    if (sr.bottom > 0 && sr.top < vh) {
      const q = (vh - sr.top) / (vh + sr.height);
      stripTrack.style.transform = `translateX(${-q * stripTrack.scrollWidth * 0.28}px)`;
    }
    requestAnimationFrame(frame);
  }
  if (reduce) {
    base.style.clipPath = 'none'; grp.style.display = 'none';
    ings.forEach(el => el.style.opacity = 1);
  } else requestAnimationFrame(frame);
})();
