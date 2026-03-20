/* ================================================
   LAVISH CLEANING SERVICES — Enhanced Experience
   ================================================ */

(function () {
  "use strict";

  function safeInit(fn, name) {
    try { fn(); }
    catch (err) { console.error("Init failed:", name, err); }
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer:fine)").matches;
  const header = document.querySelector(".header");
  const form = document.getElementById("quoteForm");
  const estimateValue = document.getElementById("estimateValue");
  const estimateBreakdown = document.getElementById("estimateBreakdown");
  const formMessage = document.getElementById("formMessage");

  function currency(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  /* ---------- CINEMATIC LOAD + PAGE TRANSITION ---------- */
  function initCinematicLoading() {
    if (prefersReducedMotion) {
      document.body.classList.add("anim-ready");
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "site-loading-overlay";
    overlay.innerHTML =
      "<div class=\"site-loader-card\">" +
      "<h2 class=\"site-loader-title\">Lavish Cleaning Services</h2>" +
      "<p class=\"site-loader-sub\">Preparing your luxurious experience...</p>" +
      "<div class=\"site-loader-bar\"><div class=\"site-loader-fill\"></div></div>" +
      "</div>";

    document.body.classList.add("site-loading");
    document.body.appendChild(overlay);

    const minMs = 1100;
    const start = performance.now();
    let loaded = document.readyState === "complete";

    function finish() {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minMs - elapsed);
      setTimeout(function () {
        overlay.classList.add("is-fading");
        document.body.classList.remove("site-loading");
        document.body.classList.add("anim-ready");
        setTimeout(function () { overlay.remove(); }, 540);
      }, wait);
    }

    if (loaded) finish();
    window.addEventListener("load", function () {
      if (!loaded) {
        loaded = true;
        finish();
      }
    }, { once: true });
  }

  function initPageTransitions() {
    if (prefersReducedMotion) return;
    let transitioning = false;
    document.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href") || "";
        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) return;

        let targetUrl;
        try { targetUrl = new URL(href, window.location.href); }
        catch (_e) { return; }
        if (targetUrl.origin !== window.location.origin) return;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (transitioning) return;

        transitioning = true;
        e.preventDefault();
        const wipe = document.createElement("div");
        wipe.className = "site-transition-overlay";
        wipe.innerHTML =
          "<div class=\"site-loader-card\">" +
          "<h2 class=\"site-loader-title\">Loading</h2>" +
          "<div class=\"site-loader-bar\"><div class=\"site-loader-fill\"></div></div>" +
          "</div>";
        document.body.appendChild(wipe);
        setTimeout(function () { window.location.href = targetUrl.href; }, 520);
      });
    });
  }

  /* ---------- TRULY INTERACTIVE CANVAS BACKGROUND ---------- */
  function initInteractiveBackground() {
    if (prefersReducedMotion) return;

    const spotlight = document.createElement("div");
    spotlight.className = "lux-bg-spotlight";
    spotlight.setAttribute("aria-hidden", "true");

    const canvas = document.createElement("canvas");
    canvas.className = "lux-bg-canvas";
    canvas.id = "luxBgCanvas";
    canvas.style.pointerEvents = "auto";
    document.body.prepend(canvas);
    document.body.prepend(spotlight);

    const noise = document.createElement("div");
    noise.className = "lux-bg-noise";
    document.body.prepend(noise);

    const overlay = document.createElement("div");
    overlay.className = "lux-bg-overlay";
    document.body.prepend(overlay);

    const vignette = document.createElement("div");
    vignette.className = "lux-bg-vignette";
    vignette.setAttribute("aria-hidden", "true");
    document.body.prepend(vignette);

    function updateSpotlight(x, y) {
      spotlight.style.setProperty("--mouse-x", x + "px");
      spotlight.style.setProperty("--mouse-y", y + "px");
    }
    window.addEventListener("mousemove", function (e) {
      updateSpotlight(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (e.touches.length) updateSpotlight(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    const ctx = canvas.getContext("2d");
    const particles = [];
    const ripples = [];
    const trails = [];
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, active: false };
    let scrollY = window.scrollY;
    const aurora = [
      { x: 0.18, y: 0.22, r: 0.32, hue: "212,175,55", speed: 0.00018, phase: Math.random() * 10 },
      { x: 0.76, y: 0.16, r: 0.38, hue: "139,92,246", speed: 0.00022, phase: Math.random() * 10 },
      { x: 0.58, y: 0.78, r: 0.34, hue: "196,181,253", speed: 0.00015, phase: Math.random() * 10 },
      { x: 0.40, y: 0.50, r: 0.22, hue: "212,175,55", speed: 0.00012, phase: Math.random() * 10 },
    ];
    let w = 0;
    let h = 0;
    let rafId = 0;
    let lastTime = 0;
    let lastTrailTime = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle() {
      var roll = Math.random();
      var color = roll > 0.6 ? "212,175,55" : roll > 0.25 ? "139,92,246" : "196,181,253";
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: color,
        drift: (Math.random() - 0.5) * 0.05,
        baseAlpha: 0.25 + Math.random() * 0.25,
      };
    }

    function populate() {
      particles.length = 0;
      var count = Math.min(200, Math.floor((w * h) / 9000));
      for (var i = 0; i < count; i += 1) particles.push(createParticle());
    }

    function drawAurora(time) {
      var scrollOff = scrollY * 0.0003;
      for (var i = 0; i < aurora.length; i += 1) {
        var blob = aurora[i];
        var pointerPullX = (pointer.x / w - 0.5) * 0.06;
        var pointerPullY = (pointer.y / h - 0.5) * 0.04;
        var px = (blob.x + Math.sin(time * blob.speed + blob.phase + scrollOff) * 0.07 + pointerPullX) * w;
        var py = (blob.y + Math.cos(time * blob.speed + blob.phase + scrollOff) * 0.05 + pointerPullY) * h;
        var grad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(w, h) * blob.r);
        grad.addColorStop(0, "rgba(" + blob.hue + ",0.24)");
        grad.addColorStop(0.5, "rgba(" + blob.hue + ",0.09)");
        grad.addColorStop(1, "rgba(" + blob.hue + ",0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    function drawPointerGlow() {
      if (!pointer.active) return;
      var grad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
      grad.addColorStop(0, "rgba(212,175,55,0.12)");
      grad.addColorStop(0.3, "rgba(139,92,246,0.07)");
      grad.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
    }

    function drawRipples() {
      for (var i = ripples.length - 1; i >= 0; i -= 1) {
        var r = ripples[i];
        r.radius += 1.8;
        r.alpha *= 0.96;
        if (r.alpha < 0.015) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.strokeStyle = "rgba(" + r.color + "," + r.alpha.toFixed(3) + ")";
        ctx.lineWidth = 1.8;
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawTrails() {
      for (var i = trails.length - 1; i >= 0; i -= 1) {
        var t = trails[i];
        t.alpha *= 0.92;
        t.r += 0.15;
        if (t.alpha < 0.01) {
          trails.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + t.color + "," + t.alpha.toFixed(3) + ")";
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var ATTRACT_RADIUS = 260;
    var ATTRACT_FORCE = 0.014;
    var CONNECT_DIST = 130;

    function tick(time) {
      if (!lastTime) lastTime = time;
      var dt = Math.min(time - lastTime, 32);
      lastTime = time;
      var dtFactor = dt / 16;

      ctx.clearRect(0, 0, w, h);
      drawAurora(time);
      drawPointerGlow();

      if (pointer.active && time - lastTrailTime > 40) {
        lastTrailTime = time;
        trails.push({
          x: pointer.x + (Math.random() - 0.5) * 14,
          y: pointer.y + (Math.random() - 0.5) * 14,
          r: Math.random() * 2.5 + 0.8,
          alpha: 0.28,
          color: Math.random() > 0.5 ? "212,175,55" : "139,92,246",
        });
      }

      for (var i = 0; i < particles.length; i += 1) {
        var p = particles[i];
        var dx = pointer.x - p.x;
        var dy = pointer.y - p.y;
        var dist = Math.hypot(dx, dy) || 1;

        if (dist < ATTRACT_RADIUS && pointer.active) {
          var force = ((ATTRACT_RADIUS - dist) / ATTRACT_RADIUS);
          force = force * force;
          p.vx += (dx / dist) * force * ATTRACT_FORCE;
          p.vy += (dy / dist) * force * ATTRACT_FORCE;
        }

        p.x += p.vx * dtFactor;
        p.y += (p.vy + p.drift) * dtFactor;
        p.vx *= 0.982;
        p.vy *= 0.982;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        var proxAlpha = pointer.active && dist < ATTRACT_RADIUS
          ? p.baseAlpha + (1 - dist / ATTRACT_RADIUS) * 0.4
          : p.baseAlpha;

        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.color + "," + proxAlpha.toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 1;
      for (var i2 = 0; i2 < particles.length; i2 += 1) {
        var a = particles[i2];
        for (var j = i2 + 1; j < particles.length; j += 1) {
          var b = particles[j];
          var d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECT_DIST) {
            var lineAlpha = 0.18 * (1 - d / CONNECT_DIST);
            var midX = (a.x + b.x) * 0.5;
            var midY = (a.y + b.y) * 0.5;
            var dMouse = Math.hypot(pointer.x - midX, pointer.y - midY);
            if (pointer.active && dMouse < ATTRACT_RADIUS) {
              lineAlpha += 0.15 * (1 - dMouse / ATTRACT_RADIUS);
            }
            ctx.strokeStyle = "rgba(196,181,253," + lineAlpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      drawTrails();
      drawRipples();

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
      if (e.touches.length) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.active = true;
      }
    }, { passive: true });

    window.addEventListener("mouseleave", function () {
      pointer.active = false;
    });

    canvas.addEventListener("click", function (e) {
      var rect = canvas.getBoundingClientRect();
      var cx = e.clientX - rect.left;
      var cy = e.clientY - rect.top;
      for (var k = 0; k < 3; k += 1) {
        ripples.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          radius: 4 + Math.random() * 6,
          alpha: 0.5,
          color: Math.random() > 0.5 ? "212,175,55" : "139,92,246",
        });
      }
      for (var k2 = 0; k2 < 8; k2 += 1) {
        var angle = (Math.PI * 2 / 8) * k2;
        var speed = 1.4 + Math.random() * 1.2;
        var pi = particles.length > 0 ? Math.floor(Math.random() * particles.length) : -1;
        if (pi >= 0) {
          particles[pi].vx += Math.cos(angle) * speed * 0.5;
          particles[pi].vy += Math.sin(angle) * speed * 0.5;
        }
      }
    });

    window.addEventListener("scroll", function () {
      scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener("resize", function () {
      resize();
      populate();
    });

    resize();
    populate();
    tick();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(rafId);
      else { lastTime = 0; tick(); }
    });
  }

  /* ---------- CLEANER CURSOR FOLLOWER ---------- */
  function initCleanerCursor() {
    if (prefersReducedMotion || !finePointer) return;

    const cleaner = document.createElement("div");
    cleaner.className = "cursor-cleaner";
    cleaner.textContent = "\uD83E\uDDF9";
    document.body.appendChild(cleaner);

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let lastSpark = 0;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      cleaner.classList.add("active");
    }, { passive: true });

    window.addEventListener("mouseleave", function () {
      cleaner.classList.remove("active");
    });

    function spark(px, py) {
      const s = document.createElement("span");
      s.className = "cursor-sparkle";
      s.style.left = px + "px";
      s.style.top = py + "px";
      s.style.setProperty("--sx", (Math.random() * 20 - 10) + "px");
      s.style.setProperty("--sy", (Math.random() * 20 - 10) + "px");
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 450);
    }

    function animate(t) {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      cleaner.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%) rotate(" + ((x + y) % 8 - 4) + "deg)";
      if (t - lastSpark > 120 && cleaner.classList.contains("active")) {
        lastSpark = t;
        spark(x - 10, y + 10);
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* ---------- OFF+BRAND STYLE REVEAL + COUNTERS ---------- */
  function initRevealAnimations() {
    assignDirectionalReveals();

    const revealElements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach(function (el) { el.classList.add("visible"); });
      return;
    }

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

    revealElements.forEach(function (el) { revealObserver.observe(el); });

    const counters = document.querySelectorAll(".counter");
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.45 });

    counters.forEach(function (c) { counterObserver.observe(c); });

    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.visible)").forEach(function (el) {
        el.classList.add("visible");
      });
    }, 2200);
  }

  function assignDirectionalReveals() {
    var grids = document.querySelectorAll(
      ".card-grid, .review-grid, .commercial-grid, .addon-showcase, .steps-row"
    );
    grids.forEach(function (grid) {
      var kids = grid.querySelectorAll(":scope > .reveal, :scope > article.reveal, :scope > div.reveal, :scope > blockquote.reveal");
      kids.forEach(function (child, idx) {
        if (!child.classList.contains("reveal-left") &&
            !child.classList.contains("reveal-right") &&
            !child.classList.contains("reveal-scale")) {
          child.classList.remove("reveal-delay-1", "reveal-delay-2");
          if (idx % 3 === 0) child.classList.add("reveal-left");
          else if (idx % 3 === 1) child.classList.add("reveal-scale");
          else child.classList.add("reveal-right");
          if (idx > 0) child.classList.add("reveal-delay-" + Math.min(idx, 5));
        }
      });
    });

    var splitGrids = document.querySelectorAll(".service-detail-grid, .split-grid, .quote-grid, .hero-grid");
    splitGrids.forEach(function (grid) {
      var kids = grid.querySelectorAll(":scope > .reveal");
      kids.forEach(function (child, idx) {
        if (!child.classList.contains("reveal-left") &&
            !child.classList.contains("reveal-right")) {
          child.classList.remove("reveal-delay-1", "reveal-delay-2");
          if (idx === 0) child.classList.add("reveal-left");
          else {
            child.classList.add("reveal-right");
            child.classList.add("reveal-delay-2");
          }
        }
      });
    });

    var faqs = document.querySelectorAll(".faq-list details.reveal");
    faqs.forEach(function (det, idx) {
      det.classList.add(idx % 2 === 0 ? "reveal-left" : "reveal-right");
      det.classList.add("reveal-delay-" + Math.min(idx, 5));
    });

    document.querySelectorAll(".section-head.reveal").forEach(function (head) {
      if (!head.classList.contains("reveal-scale")) {
        head.classList.add("reveal-scale");
      }
    });
  }

  /* ---------- LOGO MORPH INTRO ---------- */
  function initLogoMorphIntro() {
    if (prefersReducedMotion) return;
    const navLogo = document.querySelector(".brand-logo");
    if (!navLogo) return;

    const src = navLogo.getAttribute("src");
    if (!src) return;

    let hasPlayed = false;
    function run() {
      if (hasPlayed || !document.body.classList.contains("anim-ready")) return;
      hasPlayed = true;

      const stage = document.createElement("div");
      stage.className = "logo-morph-overlay";
      const morphLogo = document.createElement("img");
      morphLogo.className = "logo-morph-logo";
      morphLogo.src = src;
      morphLogo.alt = "Lavish Cleaning Services";
      stage.appendChild(morphLogo);
      document.body.appendChild(stage);

      const target = navLogo.getBoundingClientRect();
      requestAnimationFrame(function () {
        morphLogo.style.left = (target.left + target.width / 2) + "px";
        morphLogo.style.top = (target.top + target.height / 2) + "px";
        morphLogo.style.width = target.width + "px";
        morphLogo.style.height = target.height + "px";
        morphLogo.style.borderRadius = "12px";
        morphLogo.classList.add("is-morphing");
      });

      setTimeout(function () {
        stage.classList.add("is-done");
        setTimeout(function () { stage.remove(); }, 450);
      }, 920);
    }

    const waitForReady = setInterval(function () {
      if (!document.body) return;
      if (document.body.classList.contains("anim-ready")) {
        clearInterval(waitForReady);
        run();
      }
    }, 80);
    setTimeout(function () {
      clearInterval(waitForReady);
      run();
    }, 2600);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1700;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- HEADER + MOBILE NAV ---------- */
  function initHeaderNav() {
    window.addEventListener("scroll", function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 30);
    }, { passive: true });

    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("mainNav");
    if (hamburger && nav) {
      hamburger.addEventListener("click", function () {
        hamburger.classList.toggle("active");
        nav.classList.toggle("open");
        document.body.style.overflow = nav.classList.contains("open") ? "hidden" : "";
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          hamburger.classList.remove("active");
          nav.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------- CART ---------- */
  const CART_KEY = "lavishCartV1";
  const cart = {
    items: [],
    load: function () {
      try {
        const raw = localStorage.getItem(CART_KEY);
        this.items = raw ? JSON.parse(raw) : [];
      } catch (_e) {
        this.items = [];
      }
    },
    save: function () {
      localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    },
    add: function (item) {
      this.items.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: item.name,
        price: Number(item.price) || 0,
        quoted: !!item.quoted,
      });
      this.save();
    },
    remove: function (id) {
      this.items = this.items.filter(function (i) { return i.id !== id; });
      this.save();
    },
    clear: function () {
      this.items = [];
      this.save();
    },
    count: function () { return this.items.length; },
    total: function () {
      return this.items.reduce(function (sum, i) { return sum + (i.quoted ? 0 : i.price); }, 0);
    }
  };

  let cartNodes = null;

  function initCartUI() {
    cart.load();
    buildCartUI();
    bindCartButtons();
    syncCartSummaryOnQuotePage();
    renderCart();
  }

  function buildCartUI() {
    if (document.getElementById("lavishCartFab")) {
      cartNodes = {
        fab: document.getElementById("lavishCartFab"),
        count: document.getElementById("lavishCartCount"),
        panel: document.getElementById("lavishCartPanel"),
        backdrop: document.getElementById("lavishCartBackdrop"),
        items: document.getElementById("lavishCartItems"),
        total: document.getElementById("lavishCartTotal"),
        clear: document.getElementById("lavishCartClear"),
        checkout: document.getElementById("lavishCartCheckout"),
      };
      return;
    }

    const fab = document.createElement("button");
    fab.id = "lavishCartFab";
    fab.className = "lavish-cart-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "Open shopping cart");
    fab.innerHTML = "\uD83D\uDED2<span id=\"lavishCartCount\" class=\"lavish-cart-count\">0</span>";

    const backdrop = document.createElement("div");
    backdrop.id = "lavishCartBackdrop";
    backdrop.className = "lavish-cart-backdrop";

    const panel = document.createElement("aside");
    panel.id = "lavishCartPanel";
    panel.className = "lavish-cart-panel";
    panel.innerHTML =
      "<div class=\"lavish-cart-head\">" +
      "<h3>Your Cart</h3>" +
      "<button id=\"lavishCartClose\" class=\"lavish-cart-close\" type=\"button\" aria-label=\"Close cart\">\u00D7</button>" +
      "</div>" +
      "<ul id=\"lavishCartItems\" class=\"lavish-cart-items\"></ul>" +
      "<div class=\"lavish-cart-foot\">" +
      "<div id=\"lavishCartTotal\" class=\"lavish-cart-total\">Total: $0</div>" +
      "<div class=\"lavish-cart-actions\">" +
      "<button id=\"lavishCartCheckout\" class=\"btn btn-solid btn-block\" type=\"button\">Checkout to Quote</button>" +
      "<button id=\"lavishCartClear\" class=\"btn btn-ghost btn-block\" type=\"button\">Clear Cart</button>" +
      "</div>" +
      "</div>";

    document.body.appendChild(fab);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    cartNodes = {
      fab: fab,
      count: panel.ownerDocument.getElementById("lavishCartCount"),
      panel: panel,
      backdrop: backdrop,
      close: panel.querySelector("#lavishCartClose"),
      items: panel.querySelector("#lavishCartItems"),
      total: panel.querySelector("#lavishCartTotal"),
      clear: panel.querySelector("#lavishCartClear"),
      checkout: panel.querySelector("#lavishCartCheckout"),
    };

    fab.addEventListener("click", openCart);
    backdrop.addEventListener("click", closeCart);
    cartNodes.close.addEventListener("click", closeCart);
    cartNodes.clear.addEventListener("click", function () {
      cart.clear();
      renderCart();
      syncCartSummaryOnQuotePage();
    });
    cartNodes.checkout.addEventListener("click", function () {
      window.location.href = "./quote.html?fromCart=1";
    });
    cartNodes.items.addEventListener("click", function (e) {
      const btn = e.target.closest(".lavish-cart-remove");
      if (!btn) return;
      cart.remove(btn.dataset.id);
      renderCart();
      syncCartSummaryOnQuotePage();
    });
  }

  function openCart() {
    document.body.classList.add("lavish-cart-open");
  }
  function closeCart() {
    document.body.classList.remove("lavish-cart-open");
  }

  function renderCart() {
    if (!cartNodes) return;
    cartNodes.count.textContent = String(cart.count());

    if (!cart.items.length) {
      cartNodes.items.innerHTML = "<li class=\"lavish-cart-item\"><small>No items added yet.</small></li>";
      cartNodes.total.textContent = "Total: $0";
      return;
    }

    cartNodes.items.innerHTML = cart.items.map(function (i) {
      return "<li class=\"lavish-cart-item\">" +
        "<div><h5>" + i.name + "</h5><small>" + (i.quoted ? "Quoted" : currency(i.price)) + "</small></div>" +
        "<button class=\"lavish-cart-remove\" type=\"button\" data-id=\"" + i.id + "\">Remove</button>" +
        "</li>";
    }).join("");

    cartNodes.total.textContent = "Total: " + currency(cart.total()) + (cart.items.some(function (i) { return i.quoted; }) ? " + quoted items" : "");
  }

  function bindCartButtons() {
    document.querySelectorAll(".cart-add-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cart.add({
          id: btn.dataset.cartId,
          name: btn.dataset.cartName || "Service Item",
          price: Number(btn.dataset.cartPrice) || 0,
          quoted: String(btn.dataset.cartPrice) === "0",
        });
        renderCart();
        openCart();
        syncCartSummaryOnQuotePage();
      });
    });

    const addOnsBtn = document.getElementById("addAddonsToCart");
    if (addOnsBtn) {
      addOnsBtn.addEventListener("click", function () {
        if (!form) return;
        const data = new FormData(form);
        let added = 0;

        data.getAll("addon").forEach(function (addon) {
          const map = {
            fridge: { name: "Add-on: Inside Fridge", price: 35, quoted: false },
            oven: { name: "Add-on: Inside Oven", price: 35, quoted: false },
            cabinets: { name: "Add-on: Cabinet Fronts/Detail", price: 30, quoted: false },
            windows: { name: "Add-on: Interior Windows", price: 45, quoted: false },
          };
          if (!map[addon]) return;
          cart.add(map[addon]);
          added += 1;
        });

        const bedCount = Number(data.get("bedCount") || 0);
        const bedSize = String(data.get("bedSize") || "queen");
        const bedPrices = { twin: 12, full: 15, queen: 18, king: 22 };
        if (bedCount > 0) {
          const price = (bedPrices[bedSize] || 18) * bedCount;
          cart.add({ name: "Add-on: Wash & Change Beds (" + bedCount + " " + bedSize + ")", price: price, quoted: false });
          added += 1;
        }

        if (added > 0) {
          renderCart();
          openCart();
          syncCartSummaryOnQuotePage();
        }
      });
    }
  }

  function syncCartSummaryOnQuotePage() {
    const summary = document.getElementById("cartSummaryText");
    if (!summary) return;

    if (!cart.items.length) {
      summary.textContent = "No items in cart yet.";
      return;
    }

    const text = cart.items.map(function (i) {
      return i.name + " (" + (i.quoted ? "Quoted" : currency(i.price)) + ")";
    }).join(", ");
    summary.textContent = text;

    const params = new URLSearchParams(window.location.search);
    const fromCart = params.get("fromCart");
    const notes = form ? form.querySelector('[name="notes"]') : null;
    if (fromCart === "1" && notes && !notes.value.trim()) {
      notes.value = "Cart items: " + text;
    }
  }

  /* ---------- QUOTE FORM + CALCULATOR ---------- */
  const ADDON_PRICES = { fridge: 35, oven: 35, cabinets: 30, windows: 45 };
  const BED_SIZE_PRICES = { twin: 12, full: 15, queen: 18, king: 22 };
  const SERVICE_FEE = 15;
  const PACKAGE_OPTIONS = {
    once: [
      { id: "oneTimeDesign", label: "Design with Time" },
      { id: "oneTimeDeep", label: "Deep Clean" },
      { id: "oneTimeMove", label: "Move In/Move Out" },
    ],
    weekly: [
      { id: "weeklyPremium", label: "Premium Weekly" },
      { id: "weeklyAlternating", label: "Alternating Weekly" },
    ],
    biweekly: [
      { id: "biweeklyPremium", label: "Premium Biweekly" },
      { id: "biweeklyAlternating", label: "Alternating Biweekly" },
    ],
    monthly: [{ id: "monthlyPremium", label: "Premium Monthly" }],
  };
  const CALIBRATED_MODELS = {
    oneTimeDesign: [141.1986, -7.4310, -4.6371, 16.2329, -0.5823, 17.4742, 9.5590, 4.4657, 2.5121, -7.1000, -2.5695],
    oneTimeDeep: [90.3572, -15.9162, 31.3769, 25.3710, 36.8735, 156.3205, -21.9529, 22.4323, 6.0718, -8.3355, -11.9819],
    oneTimeMove: [185.8269, 8.6806, -29.9659, -9.7947, 26.5605, 145.1181, 5.3334, -8.9342, 9.8493, 8.4683, -18.6732],
    weeklyPremium: [118.8521, -1.2127, -0.2170, -5.9703, 3.1225, 1.4344, -0.8899, 2.4776, 1.5359, 5.2378, -2.0899],
    weeklyAlternating: [95.9955, -4.0359, 2.9264, -3.2072, -3.5782, 20.0235, -2.1320, 3.2438, -1.2087, 2.6445, 2.7825],
    biweeklyPremium: [121.2093, -0.4011, 5.2416, -5.7905, -1.0847, 3.4572, -1.7814, 2.7150, 0.1298, 5.2609, 0.0580],
    biweeklyAlternating: [98.5149, -2.4799, 6.9087, -3.5855, -5.4093, 19.3015, -2.3081, 2.9721, -2.0853, 3.1249, 3.2330],
    monthlyPremium: [80.8578, 6.8789, 30.3675, -19.9420, 11.8003, 60.9471, -12.7935, 2.4103, -0.1186, 8.3477, -6.9278],
  };

  function rebuildPackageOptions(serviceType, preserveValue) {
    if (!form) return;
    const packageSelect = form.querySelector('[name="cleaningPackage"]');
    if (!packageSelect) return;
    const options = PACKAGE_OPTIONS[serviceType] || [];
    packageSelect.innerHTML = "<option value=\"\">Select package</option>" + options.map(function (opt) {
      return "<option value=\"" + opt.id + "\">" + opt.label + "</option>";
    }).join("");
    if (preserveValue && options.some(function (opt) { return opt.id === preserveValue; })) {
      packageSelect.value = preserveValue;
    }
  }

  function predictBasePrice(d) {
    const coeffs = CALIBRATED_MODELS[d.cleaningPackage];
    if (!coeffs) return null;
    const s = d.sqft / 1000;
    const x = [1, d.rooms, d.bathrooms, d.people, d.pets, s, d.rooms * d.bathrooms, d.rooms * s, d.bathrooms * s, d.people * s, d.pets * s];
    const raw = x.reduce(function (sum, v, idx) { return sum + v * coeffs[idx]; }, 0);
    return Math.max(85, Math.round(raw));
  }

  function getFormData() {
    if (!form) return null;
    const d = new FormData(form);
    const selectedService = String(d.get("serviceType") || "");
    const serviceMap = {
      deluxe: "once",
      move: "once",
      recurring: "biweekly",
    };
    const normalizedService = serviceMap[selectedService] || selectedService;
    return {
      service: normalizedService,
      cleaningPackage: String(d.get("cleaningPackage") || ""),
      rooms: Math.max(1, parseInt(d.get("rooms"), 10) || 1),
      bathrooms: Math.max(1, parseInt(d.get("bathrooms"), 10) || 1),
      sqft: Math.max(400, parseInt(d.get("sqft"), 10) || 1000),
      people: Math.max(1, parseInt(d.get("people"), 10) || 1),
      pets: Math.max(0, parseInt(d.get("pets"), 10) || 0),
      addons: d.getAll("addon"),
      bedCount: Math.max(0, parseInt(d.get("bedCount"), 10) || 0),
      bedSize: d.get("bedSize") || "queen",
    };
  }

  function lineItem(label, amount, rawText) {
    if (rawText) return "<div class=\"line-item\"><span>" + label + "</span><span>" + rawText + "</span></div>";
    const sign = amount < 0 ? "\u2212" : "";
    const display = sign + currency(Math.abs(amount));
    const style = amount < 0 ? " style=\"color:#5bc27c\"" : "";
    return "<div class=\"line-item\"><span>" + label + "</span><span" + style + ">" + display + "</span></div>";
  }

  function calculateEstimate() {
    if (!form || !estimateValue) return;
    const d = getFormData();

    if (!d.service) {
      estimateValue.textContent = "Select a cleaning type above";
      if (estimateBreakdown) estimateBreakdown.innerHTML = "";
      return;
    }
    if (!d.cleaningPackage) {
      estimateValue.textContent = "Select a cleaning package";
      if (estimateBreakdown) estimateBreakdown.innerHTML = "";
      return;
    }

    const baseCost = predictBasePrice(d);
    if (baseCost === null) {
      estimateValue.textContent = "Unable to calculate this package";
      if (estimateBreakdown) estimateBreakdown.innerHTML = "";
      return;
    }

    const option = (PACKAGE_OPTIONS[d.service] || []).find(function (p) { return p.id === d.cleaningPackage; });

    let addonTotal = 0;
    let html = "";
    html += lineItem("Package (" + (option ? option.label : d.cleaningPackage) + ")", baseCost);
    html += lineItem("Home Profile", 0, d.rooms + " bd • " + d.bathrooms + " ba • " + d.people + " people • " + d.pets + " pets");
    html += lineItem("Square Footage", 0, d.sqft.toLocaleString() + " sq ft");

    d.addons.forEach(function (addon) {
      if (ADDON_PRICES[addon]) {
        addonTotal += ADDON_PRICES[addon];
        html += lineItem("Add-on: " + addon.charAt(0).toUpperCase() + addon.slice(1), ADDON_PRICES[addon]);
      }
    });

    if (d.bedCount > 0) {
      const bedCost = d.bedCount * (BED_SIZE_PRICES[d.bedSize] || 18);
      addonTotal += bedCost;
      html += lineItem("Wash & Change Beds (" + d.bedCount + " " + d.bedSize + ")", bedCost);
    }

    const visitSubtotal = baseCost + addonTotal;
    const grandTotal = visitSubtotal + SERVICE_FEE;
    html += lineItem("Service fee", SERVICE_FEE);

    if (estimateBreakdown) estimateBreakdown.innerHTML = html;
    estimateValue.textContent = currency(grandTotal);
  }

  function validateForm() {
    if (!form) return false;
    const required = form.querySelectorAll("[required]");
    for (let i = 0; i < required.length; i += 1) {
      const field = required[i];
      if (!String(field.value || "").trim()) {
        field.focus();
        if (formMessage) {
          formMessage.textContent = "Please complete all required fields.";
          formMessage.style.color = "#ef4444";
        }
        return false;
      }
    }
    const email = String(new FormData(form).get("email") || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (formMessage) {
        formMessage.textContent = "Please enter a valid email address.";
        formMessage.style.color = "#ef4444";
      }
      return false;
    }
    return true;
  }

  function confettiBurst() {
    if (prefersReducedMotion) return;
    const colors = ["#d4af37", "#f0d477", "#8b5cf6", "#c4b5fd", "#ffffff"];
    const layer = document.createElement("div");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
    document.body.appendChild(layer);
    for (let i = 0; i < 56; i += 1) {
      const p = document.createElement("div");
      p.style.cssText =
        "position:absolute;top:-10px;left:" + (Math.random() * 100) + "%;" +
        "width:" + (Math.random() * 8 + 4) + "px;height:" + (Math.random() * 8 + 4) + "px;" +
        "background:" + colors[Math.floor(Math.random() * colors.length)] + ";" +
        "border-radius:" + (Math.random() > 0.5 ? "50%" : "2px") + ";" +
        "animation:confetti-fall " + (Math.random() * 1.6 + 1.4) + "s " + (Math.random() * 0.3) + "s ease-out forwards";
      layer.appendChild(p);
    }
    if (!document.getElementById("confetti-style")) {
      const style = document.createElement("style");
      style.id = "confetti-style";
      style.textContent = "@keyframes confetti-fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}";
      document.head.appendChild(style);
    }
    setTimeout(function () { layer.remove(); }, 3200);
  }

  function initFormBehavior() {
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const preService = params.get("service");
    const serviceSelect = form.querySelector('[name="serviceType"]');
    const packageSelect = form.querySelector('[name="cleaningPackage"]');
    const prefillMap = { deluxe: "once", move: "once", recurring: "biweekly", oneTime: "once" };

    if (serviceSelect) {
      rebuildPackageOptions(serviceSelect.value || "", "");
      serviceSelect.addEventListener("change", function () {
        var current = packageSelect ? packageSelect.value : "";
        rebuildPackageOptions(serviceSelect.value || "", current);
        calculateEstimate();
      });
    }

    if (preService && serviceSelect) {
      serviceSelect.value = prefillMap[preService] || preService;
      rebuildPackageOptions(serviceSelect.value || "", "");
      if (packageSelect && packageSelect.options.length > 1) {
        packageSelect.selectedIndex = 1;
      }
    }

    const dateInput = form.querySelector('[name="date"]');
    if (dateInput) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      dateInput.min = t.toISOString().split("T")[0];
    }

    calculateEstimate();
    form.addEventListener("input", calculateEstimate);
    form.addEventListener("change", calculateEstimate);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const bot = form.querySelector('input[name="company"]');
      if (bot && bot.value) return;
      if (!validateForm()) return;

      const firstName = String(new FormData(form).get("firstName") || "there");
      if (formMessage) {
        formMessage.textContent = "Thanks, " + firstName + "! Your quote request is in. We\u2019ll contact you shortly.";
        formMessage.style.color = "#5bc27c";
      }
      confettiBurst();
      ["firstName", "lastName", "phone", "email", "notes"].forEach(function (name) {
        const input = form.elements[name];
        if (input) input.value = "";
      });
    });
  }

  /* ---------- SERVICE BUTTON PREFILL ---------- */
  function initServicePrefillButtons() {
    document.querySelectorAll("[data-service]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        const service = btn.dataset.service;
        const select = document.querySelector('[name="serviceType"]');
        if (select) {
          e.preventDefault();
          const prefillMap = { deluxe: "once", move: "once", recurring: "biweekly", oneTime: "once" };
          select.value = prefillMap[service] || service;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          const f = document.getElementById("quoteForm");
          if (f) f.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          e.preventDefault();
          window.location.href = "./quote.html?service=" + encodeURIComponent(service);
        }
      });
    });
  }

  /* ---------- SMOOTH IN-PAGE ANCHORS ---------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        const href = a.getAttribute("href");
        if (!href || href.length < 2 || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = header ? header.offsetHeight + 10 : 80;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: "smooth"
        });
      });
    });
  }

  /* ---------- HERO PARALLAX ---------- */
  function initHeroParallax() {
    const glow = document.querySelector(".hero-bg-glow");
    if (!glow || prefersReducedMotion) return;
    window.addEventListener("scroll", function () {
      if (window.scrollY < 900) glow.style.transform = "translateY(" + (window.scrollY * 0.2) + "px)";
    }, { passive: true });
  }

  /* ---------- LETTER HOVER GLOW (Cntrl-X inspired) ---------- */
  function setupGlobalLetterGlow() {
    if (prefersReducedMotion || !finePointer) return;
    var SELECTORS = [
      "main h1", "main h2", "main h3", "main h4",
      ".card h4", ".service-card h3", ".commercial-card h3",
      ".step-card strong", "blockquote cite",
      ".hero-copy h1", ".section-head h2", ".section-head .subcopy",
      ".eyebrow", ".brand-text strong", "summary",
      ".footer h3", ".announcement p"
    ].join(", ");
    var targets = document.querySelectorAll(SELECTORS);
    if (!targets.length) return;

    function splitEl(el) {
      if (el.getAttribute("data-glow-ready")) return;
      el.setAttribute("data-glow-ready", "1");
      var html = "";
      var text = el.textContent || "";
      var words = text.split(/(\s+)/);
      words.forEach(function (word) {
        if (/^\s+$/.test(word)) {
          html += "<span class=\"glow-letter-space\"> </span>";
        } else {
          html += "<span class=\"glow-word\">";
          for (var i = 0; i < word.length; i++) {
            html += "<span class=\"glow-letter\">" + word[i] + "</span>";
          }
          html += "</span>";
        }
      });
      el.innerHTML = html;
    }

    targets.forEach(splitEl);

    var activeNodes = [];
    var rAF = null;
    var mx = -9999;
    var my = -9999;
    var RADIUS = 90;

    function updateGlow() {
      rAF = null;
      for (var n = 0; n < activeNodes.length; n++) {
        var letters = activeNodes[n].querySelectorAll(".glow-letter");
        for (var i = 0; i < letters.length; i++) {
          var span = letters[i];
          var rect = span.getBoundingClientRect();
          var cx = rect.left + rect.width * 0.5;
          var cy = rect.top + rect.height * 0.5;
          var d = Math.hypot(mx - cx, my - cy);
          var g = d < RADIUS ? +(1 - d / RADIUS).toFixed(3) : 0;
          span.style.setProperty("--g", g);
        }
      }
    }

    targets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (activeNodes.indexOf(el) === -1) activeNodes.push(el);
      });
      el.addEventListener("mouseleave", function () {
        var idx = activeNodes.indexOf(el);
        if (idx > -1) activeNodes.splice(idx, 1);
        var letters = el.querySelectorAll(".glow-letter");
        for (var i = 0; i < letters.length; i++) letters[i].style.setProperty("--g", "0");
      });
    });

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (activeNodes.length && !rAF) rAF = requestAnimationFrame(updateGlow);
    }, { passive: true });
  }

  /* ---------- MAGNETIC CONTROLS (Cntrl-X inspired) ---------- */
  function setupMagneticControls() {
    if (prefersReducedMotion || !finePointer) return;
    var ELS = document.querySelectorAll("nav a, .btn, .cart-toggle, .addon-card .btn-outline, .commercial-card .btn");
    var PULL = 0.24;

    ELS.forEach(function (el) {
      el.classList.add("magnetic");
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width * 0.5);
        var dy = e.clientY - (rect.top + rect.height * 0.5);
        el.style.transform = "translate(" + (dx * PULL) + "px," + (dy * PULL) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- 3D CARD TILT (Cntrl-X inspired) ---------- */
  function setup3DCardTilt() {
    if (prefersReducedMotion || !finePointer) return;
    var CARDS = document.querySelectorAll(
      ".service-card, blockquote, .quote-form, .addon-card, .step-card, .commercial-card, " +
      ".hero-card, .trust-grid article, details, .footer-social a"
    );
    var MAX_ROT = 8;

    CARDS.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var ry = ((x - 0.5) * MAX_ROT * 2).toFixed(2);
        var rx = ((0.5 - y) * MAX_ROT * 2).toFixed(2);
        card.style.setProperty("--ry", ry + "deg");
        card.style.setProperty("--rx", rx + "deg");
        card.style.setProperty("--shine-x", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--shine-y", (y * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--shine-x", "50%");
        card.style.setProperty("--shine-y", "50%");
      });
    });
  }

  /* ---------- OFF+BRAND FLOATING BLOBS ---------- */
  function initOffbrandBlobs() {
    if (prefersReducedMotion) return;

    var blob1 = document.createElement("div");
    blob1.className = "offbrand-blob";
    blob1.setAttribute("aria-hidden", "true");
    var blob2 = document.createElement("div");
    blob2.className = "offbrand-blob-2";
    blob2.setAttribute("aria-hidden", "true");
    document.body.prepend(blob2);
    document.body.prepend(blob1);

    var mx = window.innerWidth * 0.4;
    var my = window.innerHeight * 0.35;
    var bx1 = mx, by1 = my;
    var bx2 = mx + 160, by2 = my + 80;
    var scrollOff = 0;
    var LERP1 = 0.025;
    var LERP2 = 0.015;

    function tick() {
      bx1 += (mx - bx1) * LERP1;
      by1 += (my + scrollOff * 0.35 - by1) * LERP1;
      bx2 += (mx + 120 - bx2) * LERP2;
      by2 += (my + scrollOff * 0.55 + 100 - by2) * LERP2;

      blob1.style.setProperty("--blob-x", (bx1 - 210) + "px");
      blob1.style.setProperty("--blob-y", (by1 - 210) + "px");
      blob2.style.setProperty("--blob2-x", (bx2 - 150) + "px");
      blob2.style.setProperty("--blob2-y", (by2 - 150) + "px");

      requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (e.touches.length) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }
    }, { passive: true });
    window.addEventListener("scroll", function () {
      scrollOff = window.scrollY;
    }, { passive: true });

    tick();
  }

  /* ---------- TEXT HOVER COLOR SWEEP (all body text) ---------- */
  function setupTextHoverFade() {
    if (prefersReducedMotion || !finePointer) return;
    var SELECTORS = [
      "main p", "main li", "main small",
      ".service-card li", ".service-card p", ".price",
      "blockquote p", ".card-tagline",
      ".hero-card p", ".step-card p",
      ".commercial-card p",
      "details p", ".microcopy",
      ".footer p", ".footer a", ".footer small",
      ".footer-bottom", ".announcement p"
    ].join(", ");

    var targets = document.querySelectorAll(SELECTORS);
    if (!targets.length) return;

    function splitLetters(el) {
      if (el.getAttribute("data-fade-ready")) return;
      if (el.getAttribute("data-glow-ready")) return;
      if (el.querySelector("a, button, input, select, .btn")) return;
      el.setAttribute("data-fade-ready", "1");
      el.classList.add("text-hover-fade");

      var childNodes = Array.prototype.slice.call(el.childNodes);
      var frag = document.createDocumentFragment();
      var idx = 0;

      childNodes.forEach(function (node) {
        if (node.nodeType === 3) {
          var text = node.textContent;
          var words = text.split(/(\s+)/);
          words.forEach(function (word) {
            if (/^\s+$/.test(word)) {
              var space = document.createTextNode(" ");
              frag.appendChild(space);
            } else {
              var wordSpan = document.createElement("span");
              wordSpan.className = "text-fade-word";
              for (var j = 0; j < word.length; j++) {
                var ls = document.createElement("span");
                ls.className = "text-fade-letter";
                ls.style.setProperty("--letter-index", idx);
                ls.textContent = word[j];
                wordSpan.appendChild(ls);
                idx++;
              }
              frag.appendChild(wordSpan);
            }
          });
        } else {
          frag.appendChild(node.cloneNode(true));
        }
      });

      el.innerHTML = "";
      el.appendChild(frag);
    }

    targets.forEach(splitLetters);
  }

  /* ---------- INIT ---------- */
  safeInit(initCinematicLoading, "cinematicLoading");
  safeInit(initLogoMorphIntro, "logoMorphIntro");
  safeInit(initRevealAnimations, "revealAnimations");
  safeInit(initInteractiveBackground, "interactiveBackground");
  safeInit(initCleanerCursor, "cleanerCursor");
  safeInit(initHeaderNav, "headerNav");
  safeInit(initCartUI, "cartUI");
  safeInit(initFormBehavior, "formBehavior");
  safeInit(initServicePrefillButtons, "servicePrefillButtons");
  safeInit(initSmoothAnchors, "smoothAnchors");
  safeInit(initHeroParallax, "heroParallax");
  safeInit(initPageTransitions, "pageTransitions");
  safeInit(initOffbrandBlobs, "offbrandBlobs");
  safeInit(setupGlobalLetterGlow, "letterGlow");
  safeInit(setupTextHoverFade, "textHoverFade");
  safeInit(setupMagneticControls, "magneticControls");
  safeInit(setup3DCardTilt, "3DCardTilt");
})();
