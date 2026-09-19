(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------- 1. Lenis smooth scroll (site-wide) ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7 });
  window.lenis = lenis; // exposed for poking at in devtools
  const samePageHash = (a) => { // "#x" or "index.html#x" while on index -> the hash; another page -> null
    const u = new URL(a.href, location.href); const here = location.pathname.replace(/\/$/, '/index.html');
    return u.hash && u.pathname.replace(/\/$/, '/index.html') === here ? u.hash : null;
  };
  lenis.on('scroll', ScrollTrigger.update);
  // Site nav: transparent over the hero, frosted + dark once the page has moved.
  const siteNav = document.getElementById('siteNav');
  const navState = () => siteNav.classList.toggle('scrolled', window.scrollY > siteNav.parentElement.offsetHeight);
  lenis.on('scroll', navState); navState();
  // Active nav item: the link whose section is nearest the top of the viewport (kit State=Active)
  const navLinks = Array.from(document.querySelectorAll('.nav-list a'));
  const navTargets = navLinks.map(a => { const h = samePageHash(a); return h && document.querySelector(h); }).filter(Boolean);
  const navActive = () => {
    let cur = null;
    for (const t of navTargets) if (t.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = t;
    navLinks.forEach(a => a.classList.toggle('active', !!cur && samePageHash(a) === '#' + cur.id));
  };
  lenis.on('scroll', navActive); navActive();
  // Dropdowns: open on hover or focus, close 200ms after the pointer leaves (grace to reach the panel), on Escape, or on a pick
  document.querySelectorAll('.has-sub').forEach(item => {
    const toggle = item.querySelector('.nav-sub-toggle, .tray-toggle'); let t;
    const isOpen = () => item.classList.contains('is-open');
    const open = () => { clearTimeout(t); item.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); };
    const close = (now) => { clearTimeout(t); t = setTimeout(() => { item.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }, now ? 0 : 200); };
    item.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') open(); });
    item.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') close(); });
    if (toggle.tagName === 'BUTTON') { // tray accordion: a tap or keypress toggles; a mouse click just keeps it open (hover already opened it)
      let pt = ''; toggle.addEventListener('pointerdown', (e) => { pt = e.pointerType; });
      toggle.addEventListener('click', () => { if (pt === 'mouse') open(); else (isOpen() ? close(true) : open()); pt = ''; });
    } else { // desktop dropdown: keyboard focus opens, leaving closes
      item.addEventListener('focusin', open); item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(true); });
    }
    item.querySelectorAll('.nav-sub a').forEach(a => a.addEventListener('click', () => close(true)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(true); });
  });
  // Full-screen menu: columns wipe down, links rise in; close reverses. Any link closes then scrolls.
  const menuBtn = document.getElementById('menuBtn'), navModal = document.getElementById('navModal');
  const mScrim = document.getElementById('menuScrim'), mTray = navModal.querySelector('.nav-modal-tray'), mIns = navModal.querySelectorAll('.mask .in');
  const mTop = navModal.querySelector('.nav-modal-top'), mFoot = navModal.querySelector('.nav-modal-foot');
  let menuOpen = false, menuBusy = false, menuThen = null;
  const openMenu = () => {
    if (menuOpen || menuBusy) return;
    menuOpen = true; menuBusy = true; navModal.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); lenis.stop();
    if (reduceMotion) { gsap.set(mScrim, { opacity: 1 }); gsap.set(mTray, { xPercent: 0 }); gsap.set(mIns, { yPercent: 0 }); gsap.set([mTop, mFoot], { opacity: 1 }); menuBusy = false; return; }
    gsap.timeline({ onComplete: () => { menuBusy = false; } })
      .fromTo(mScrim, { opacity: 0 }, { opacity: 1, duration: .6, ease: 'power2.out' }, 0)
      .fromTo(mTray, { xPercent: 100 }, { xPercent: 0, duration: .75, ease: 'power3.out' }, 0) // tray slides in from the right
      .fromTo(mTop, { opacity: 0 }, { opacity: 1, duration: .5 }, .3)
      .fromTo(mIns, { yPercent: 120 }, { yPercent: 0, duration: .8, ease: 'power3.out', stagger: .06 }, .25) // links rise as the tray lands
      .fromTo(mFoot, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out' }, .55);
  };
  const closeMenu = () => {
    if (!menuOpen || menuBusy) return;
    menuBusy = true;
    const done = () => {
      navModal.hidden = true; menuOpen = false; menuBusy = false; menuBtn.setAttribute('aria-expanded', 'false'); lenis.start();
      if (menuThen) { const t = menuThen; menuThen = null; lenis.scrollTo(t, { duration: 1.2 }); }
    };
    if (reduceMotion) { done(); return; }
    gsap.timeline({ onComplete: done })
      .to(mTray, { xPercent: 100, duration: .55, ease: 'power3.in' }, 0) // tray slides back out, contents ride with it
      .to(mScrim, { opacity: 0, duration: .45, ease: 'power2.in' }, .1);
  };
  menuBtn.addEventListener('click', openMenu);
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  mScrim.addEventListener('click', closeMenu);
  navModal.querySelectorAll('a[href*="#"]').forEach(a => a.addEventListener('click', (e) => {
    const hash = samePageHash(a); if (!hash) return; // another page: let it navigate
    e.preventDefault(); menuThen = document.querySelector(hash); closeMenu();
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links go through Lenis so they decelerate too
  document.querySelectorAll('a[href*="#"]').forEach(a => {
    if (a.closest('.nav-modal')) return; // the menu closes first, then scrolls
    a.addEventListener('click', (e) => {
      const hash = samePageHash(a); const target = hash && document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.2 });
    });
  });

  /* ---------- 0. Page entrance: nav and hero copy rise in (no loader) ----------
     Skipped under reduced motion. Resolves `introDone` so the fact counters wait for it. */
  let introResolve; const introDone = new Promise(r => { introResolve = r; });
  if (reduceMotion) { introResolve(); }
  else {
    document.documentElement.classList.add('js-motion');
    const heroBits = [...document.querySelectorAll('.hero-copy .headline > *, .hero .facts, [data-entrance]')]; // home hero, or anything a page marks data-entrance
    gsap.timeline({ onComplete: () => { introResolve(); ScrollTrigger.refresh(); } })
      .fromTo('.site-nav', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power2.out', clearProps: 'transform' }, .15)
      .fromTo(heroBits, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: .09, clearProps: 'transform' }, .1);
  }

  /* ---------- 0b. Scroll reveals: anything with data-reveal rises in once as it enters ---------- */
  if (!reduceMotion) {
    document.documentElement.classList.add('js-motion');
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08, overwrite: true }), // no clearProps: the CSS start state (28px low) would come back
    });
  }

  /* ---------- 1a. Hero data-points animation ----------
     A sequencing-readout texture on a canvas behind the copy (bands drifting
     sideways, after the 03 clip), masked so it fades out toward the headline.
     The helix is a separate WebGL layer (1b). Pauses off-screen. */
  const mountViz = (canvas) => {
    const ctx = canvas.getContext('2d');
    const card = canvas.parentElement;
    let W = 0, H = 0, dpr = 1, lanes = [], raf = 0, visible = true, last = 0;

    const rnd = (a, b) => a + Math.random() * (b - a);
    // band colours: brand blues on the light hero card, pale cyan on the dark mission ground
    const hues = canvas.dataset.tone === 'light' ? ['78,168,194', '0,119,160'] : ['78,168,194', '184,229,237'];
    const dense = parseFloat(canvas.dataset.density || '1'); // >1 = tighter rows and shorter gaps (hero)
    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = card.clientWidth; H = card.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // readout lanes across the right ~60% of the card
      lanes = [];
      // readout rows: irregular spacing, denser toward the bottom, bands drift sideways
      let y = rnd(10, 40);
      while (y < H + 40) {
        const segs = [];
        let x = -rnd(0, 120);
        while (x < W + 120) { const w = rnd(8, 70); segs.push({ x, w, a: rnd(0.2, 1) }); x += w + rnd(28, 110) / dense; }
        lanes.push({ y, h: rnd(3, 6), speed: rnd(6, 28), segs, hue: hues[Math.random() < 0.7 ? 0 : 1] });
        y += Math.max(26, (34 + rnd(0, 40) * (1.8 - 1.2 * (y / H))) / dense); // >= band + halo apart: no overlaps; sparser at the top
      }
    };

    const drawLanes = (dt) => {
      ctx.globalCompositeOperation = 'lighter';
      for (const l of lanes) {
        for (const sg of l.segs) {
          sg.x += l.speed * dt;
          if (sg.x > W + 120) { sg.x = -rnd(20, 140); sg.w = rnd(8, 70); sg.a = rnd(0.2, 1); }
          // soft capsule with a wide halo, like a lit band on a gel
          ctx.fillStyle = `rgba(${l.hue},${0.08 * sg.a})`;
          ctx.beginPath(); ctx.roundRect(sg.x - 5, l.y - l.h * 1.5, sg.w + 10, l.h * 4, l.h * 2); ctx.fill();
          ctx.fillStyle = `rgba(${l.hue},${0.38 * sg.a})`;
          ctx.beginPath(); ctx.roundRect(sg.x, l.y, sg.w, l.h, l.h / 2); ctx.fill();
        }
      }
    };

    const maskCanvas = document.createElement('canvas');
    const mask = () => {
      // clear only where the copy sits (top-left corner); texture runs under it lower down
      const mc = maskCanvas.getContext('2d');
      maskCanvas.width = W; maskCanvas.height = H;
      const gx = mc.createLinearGradient(0, 0, W, 0);
      gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.3, 'rgba(0,0,0,1)'); gx.addColorStop(0.68, 'rgba(0,0,0,0)');
      mc.fillStyle = gx; mc.fillRect(0, 0, W, H);
      mc.globalCompositeOperation = 'destination-in';
      const gy = mc.createLinearGradient(0, 0, 0, H);
      gy.addColorStop(0, 'rgba(0,0,0,1)'); gy.addColorStop(0.42, 'rgba(0,0,0,1)'); gy.addColorStop(0.7, 'rgba(0,0,0,0)');
      mc.fillStyle = gy; mc.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(maskCanvas, 0, 0);
      // and a light lift off the very top edge so the lead copy stays clean
      ctx.globalCompositeOperation = 'destination-in';
      const gt = ctx.createLinearGradient(0, 0, 0, H);
      gt.addColorStop(0, 'rgba(0,0,0,0.15)'); gt.addColorStop(0.42, 'rgba(0,0,0,1)');
      ctx.fillStyle = gt; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, W, H);
      drawLanes(dt); mask();
      if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    build();
    if (reduceMotion) { frame(performance.now()); return; } // one static frame
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(card);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 120); });
  };
  document.querySelectorAll('.hero-viz').forEach(mountViz);

  /* ---------- 2. Panel stacking (any page) ---------- */
  // Each .stack-wrap holds a .stack-panel that pins (sticky) while the next
  // sibling .stack-over section slides up over it; the covered panel recedes,
  // scrubbed to exactly that overlap. All breakpoints (a panel taller than the
  // viewport pins on its bottom edge). data-slide on the .stack-over (0-1) slows the cover to that
  // fraction of scroll speed (the pin holds longer to compensate), by
  // translating the wrapper's inner section while it slides.
  const stacks = [...document.querySelectorAll('.stack-wrap')].map(wrap => {
    const panel = wrap.querySelector('.stack-panel'), over = wrap.nextElementSibling;
    return panel && over && over.classList.contains('stack-over') ? { panel, wrap, over } : null;
  }).filter(Boolean);
  stacks.forEach((s, i) => {
    s.over.style.position = 'relative'; if (!s.over.style.zIndex) s.over.style.zIndex = i + 2; // each cover paints above what it covers
    if (!s.wrap.style.zIndex && !getComputedStyle(s.wrap).zIndex.match(/^\d/)) s.wrap.style.zIndex = i + 1;
    s.slide = parseFloat(s.over.dataset.slide) || 1;
    s.inner = s.over.firstElementChild;
    // y0: where the next section's top sits (in the viewport) the instant the
    // panel pins; D: scroll distance the cover takes at this slide speed.
    s.y0 = () => Math.min(window.innerHeight, s.panel.offsetHeight);
    s.D  = () => s.y0() / s.slide;
  });
  const layoutStacks = () => stacks.forEach(s => {
    // If this panel itself slid in slowed (it is the inner of a previous
    // stack), it carries a permanent translateY once its slide completes.
    // Sticky offsets are computed in layout space, so shift the pin `top` by
    // that amount to keep the visual pin position correct.
    const prev = stacks.find(o => o.inner === s.panel);
    const offset = prev ? prev.D() - prev.y0() : 0;
    s.panel._slideOffset = offset;
    // A panel taller than the viewport pins on its bottom edge, not its top.
    s.panel.style.top = (Math.min(0, window.innerHeight - s.panel.offsetHeight) - offset) + 'px';
    s.wrap.style.setProperty('--spacer', s.D() + 'px');   // pin range
    s.over.style.marginTop = -s.D() + 'px';               // pull the next section up over it
    s.over.style.paddingBottom = (s.D() - s.y0()) + 'px'; // room for the slowed section's final offset
  });

  ScrollTrigger.config({ ignoreMobileResize: true }); // the address bar showing / hiding is not a layout change
  const mmStack = gsap.matchMedia();
  mmStack.add('(min-width: 0px)', () => {
    layoutStacks();
    ScrollTrigger.addEventListener('refreshInit', layoutStacks); // re-measure before ST measures
    stacks.forEach(s => {
      const st = () => ({
        trigger: s.over,
        start: () => `top ${s.y0()}px`,          // the instant the panel pins
        end:   () => `top ${s.y0() - s.D()}px`,  // the next section has fully covered it
        invalidateOnRefresh: true,
      });
      gsap.to(s.panel, { scale: 0.9, borderRadius: 40, opacity: 0.35, ease: 'none', scrollTrigger: { ...st(), scrub: 1 } });
      if (s.slide < 1) {
        gsap.fromTo(s.inner, { y: 0 }, { y: () => s.D() - s.y0(), ease: 'none', scrollTrigger: { ...st(), scrub: true } });
      }
    });
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', layoutStacks);
      stacks.forEach(s => {
        s.panel.style.top = ''; s.wrap.style.removeProperty('--spacer');
        s.over.style.marginTop = ''; s.over.style.paddingBottom = '';
        gsap.set([s.panel, s.inner], { clearProps: 'all' });
      });
    };
  });

  window.FGI = { lenis, reduceMotion, introDone, mountViz }; // page scripts build on these
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
