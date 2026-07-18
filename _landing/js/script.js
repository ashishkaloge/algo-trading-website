// Tradign landing JS.
// Live candlestick chart. The rightmost candle forms in real time the way a
// real one does: it opens at the current price, its body grows/shrinks and
// flips green/red as the live price crosses the open, and the wicks extend on
// new highs/lows. At the end of each period it locks in, the chart scrolls one
// slot left, and a fresh candle opens at that close.
(function () {
  "use strict";
  var chart = document.querySelector(".chart");
  if (!chart) return;
  var g = chart.querySelector(".candles");
  if (!g) return;
  var NS = "http://www.w3.org/2000/svg";

  var VIS = 15,
    baseY = 274,
    topY = 46,
    padX = 24;
  var slot = (480 - padX * 2) / VIS;
  var bw = Math.min(8, slot * 0.38);
  // Product chart colors: charts color positive/negative with the theme's
  // success/error tokens, which flip with the device color scheme.
  var UP, DOWN;
  function syncChartColors() {
    var cs = getComputedStyle(document.documentElement);
    UP = cs.getPropertyValue("--success").trim() || "#22c55e";
    DOWN = cs.getPropertyValue("--error").trim() || "#f87171";
  }
  syncChartColors();

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function step(p) {
    return clamp(
      p + (Math.random() - 0.46) * 0.085 + (0.5 - p) * 0.008,
      0.08,
      0.92,
    );
  }

  // y-scale follows the visible candles so the chart always fills its frame,
  // instead of the random walk hugging a thin band around the midline.
  var scaleLo = 0,
    scaleHi = 1;
  function rescale(list) {
    var lo = Infinity,
      hi = -Infinity;
    for (var i = 0; i < list.length; i++) {
      lo = Math.min(lo, list[i].l);
      hi = Math.max(hi, list[i].h);
    }
    var pad = Math.max((hi - lo) * 0.28, 0.04);
    scaleLo = lo - pad;
    scaleHi = hi + pad;
  }
  function yOf(p) {
    return baseY - ((p - scaleLo) / (scaleHi - scaleLo)) * (baseY - topY);
  }

  // seed a finished candle that opens at `open`
  function seed(open) {
    var c = open,
      hi = open,
      lo = open,
      ticks = 16 + ((Math.random() * 8) | 0);
    for (var t = 0; t < ticks; t++) {
      c = step(c);
      hi = Math.max(hi, c);
      lo = Math.min(lo, c);
    }
    return { o: open, h: hi, l: lo, c: c };
  }

  var data = [],
    price = 0.45;
  for (var i = 0; i < VIS + 1; i++) {
    var d = seed(price);
    data.push(d);
    price = d.c;
  }

  // one reusable <g> (wick + body) per slot
  var slots = [];
  for (i = 0; i < VIS + 1; i++) {
    var grp = document.createElementNS(NS, "g");
    grp.setAttribute("class", "candle");
    var wick = document.createElementNS(NS, "line");
    wick.setAttribute("stroke-width", "1.5");
    wick.setAttribute("stroke-linecap", "round");
    var body = document.createElementNS(NS, "rect");
    body.setAttribute("rx", "1.5");
    body.setAttribute("width", bw.toFixed(1));
    grp.appendChild(wick);
    grp.appendChild(body);
    g.appendChild(grp);
    slots.push({ wick: wick, body: body });
  }

  var overlay = document.createElementNS(NS, "g");
  overlay.setAttribute("class", "strategy-overlay");
  g.appendChild(overlay);

  function paint(i, d) {
    var cx = padX + slot * (i + 0.5);
    var col = d.c >= d.o ? UP : DOWN;
    var oY = yOf(d.o),
      cY = yOf(d.c),
      hY = yOf(d.h),
      lY = yOf(d.l);
    var s = slots[i];
    s.wick.setAttribute("x1", cx.toFixed(1));
    s.wick.setAttribute("x2", cx.toFixed(1));
    s.wick.setAttribute("y1", hY.toFixed(1));
    s.wick.setAttribute("y2", lY.toFixed(1));
    s.wick.setAttribute("stroke", col);
    s.body.setAttribute("x", (cx - bw / 2).toFixed(1));
    s.body.setAttribute("y", Math.min(oY, cY).toFixed(1));
    s.body.setAttribute("height", Math.max(1.5, Math.abs(oY - cY)).toFixed(1));
    s.body.setAttribute("fill", col);
  }
  function paintAll() {
    rescale(data);
    for (var i = 0; i < data.length; i++) paint(i, data[i]);
    paintStrategyOverlay();
  }

  function label(x, y, text, klass) {
    return (
      '<g class="strategy-label ' +
      klass +
      '" transform="translate(' +
      x.toFixed(1) +
      " " +
      y.toFixed(1) +
      ')"><rect x="0" y="-16" width="62" height="22" rx="7"></rect>' +
      '<text x="31" y="-1" text-anchor="middle">' +
      text +
      "</text></g>"
    );
  }

  function paintStrategyOverlay() {
    if (!overlay) return;
    var entryIndex = data.length - 5;
    var entry = data[entryIndex];
    if (!entry) return;

    var range = scaleHi - scaleLo;
    var entryPrice = entry.c;
    var tp = clamp(entryPrice + range * 0.22, scaleLo + range * 0.08, scaleHi - range * 0.06);
    var sl = clamp(entryPrice - range * 0.16, scaleLo + range * 0.06, scaleHi - range * 0.08);
    var entryX = padX + slot * (entryIndex + 0.5);
    var rightX = 462;
    var labelX = rightX - 64;
    var entryY = yOf(entryPrice);
    var tpY = yOf(tp);
    var slY = yOf(sl);
    var longY = Math.max(26, entryY - 24);
    var zoneY = Math.min(tpY, slY);
    var zoneH = Math.max(8, Math.abs(slY - tpY));

    overlay.innerHTML =
      '<rect class="strategy-zone" x="' +
      entryX.toFixed(1) +
      '" y="' +
      zoneY.toFixed(1) +
      '" width="' +
      (rightX - entryX).toFixed(1) +
      '" height="' +
      zoneH.toFixed(1) +
      '"></rect>' +
      '<line class="strategy-level strategy-level--tp" x1="' +
      entryX.toFixed(1) +
      '" x2="' +
      rightX +
      '" y1="' +
      tpY.toFixed(1) +
      '" y2="' +
      tpY.toFixed(1) +
      '"></line>' +
      '<line class="strategy-level strategy-level--entry" x1="' +
      (entryX - 18).toFixed(1) +
      '" x2="' +
      rightX +
      '" y1="' +
      entryY.toFixed(1) +
      '" y2="' +
      entryY.toFixed(1) +
      '"></line>' +
      '<line class="strategy-level strategy-level--sl" x1="' +
      entryX.toFixed(1) +
      '" x2="' +
      rightX +
      '" y1="' +
      slY.toFixed(1) +
      '" y2="' +
      slY.toFixed(1) +
      '"></line>' +
      label(labelX, tpY - 5, "TP 2.2R", "strategy-label--tp") +
      label(labelX, slY + 18, "SL -0.8R", "strategy-label--sl") +
      '<circle class="strategy-entry-ring" cx="' +
      entryX.toFixed(1) +
      '" cy="' +
      entryY.toFixed(1) +
      '" r="10"></circle>' +
      '<circle class="strategy-entry-dot" cx="' +
      entryX.toFixed(1) +
      '" cy="' +
      entryY.toFixed(1) +
      '" r="4"></circle>' +
      '<g class="strategy-long" transform="translate(' +
      (entryX - 24).toFixed(1) +
      " " +
      longY.toFixed(1) +
      ')"><rect x="0" y="-16" width="48" height="22" rx="7"></rect>' +
      '<text x="24" y="-1" text-anchor="middle">LONG</text></g>';
  }
  paintAll();

  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", function () {
        syncChartColors();
        paintAll();
      });
  }

  // reduced motion: leave the static chart, no ticking
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  // start the rightmost candle fresh (just opened)
  var liveIdx = data.length - 1;
  var live = { o: data[liveIdx - 1].c, h: 0, l: 0, c: 0 };
  live.c = live.h = live.l = live.o;
  data[liveIdx] = live;
  paint(liveIdx, live);

  var TICK = 165,
    PERIOD = 22,
    ticks = 0,
    scrolling = false;

  setInterval(function () {
    if (scrolling) return;
    live.c = step(live.c);
    live.h = Math.max(live.h, live.c);
    live.l = Math.min(live.l, live.c);
    if (live.h > scaleHi || live.l < scaleLo) paintAll();
    else paint(liveIdx, live);

    if (++ticks >= PERIOD) {
      ticks = 0;
      scrolling = true;
      g.style.transition = "transform 0.6s ease";
      g.style.transform = "translateX(" + (-slot).toFixed(1) + "px)";
      setTimeout(function () {
        g.style.transition = "none";
        g.style.transform = "translateX(0)";
        data.shift();
        live = { o: data[data.length - 1].c, h: 0, l: 0, c: 0 };
        live.c = live.h = live.l = live.o;
        data.push(live);
        paintAll();
        scrolling = false;
      }, 620);
    }
  }, TICK);
})();

// Trust carousel ("built for trust"). Six safeguard slides with prev/next
// arrows and a counter. Auto-advances gently while on screen; the first
// manual interaction hands control to the reader for good.
(function () {
  "use strict";
  var root = document.querySelector("[data-tcar]");
  if (!root) return;

  var slides = [].slice.call(root.querySelectorAll(".tcar-slide"));
  var counter = root.querySelector("[data-tcar-cur]");
  var prevBtn = root.querySelector("[data-tcar-prev]");
  var nextBtn = root.querySelector("[data-tcar-next]");

  var index = 0;
  var autoRotate = !(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  var visible = false;
  var timer = null;

  function show(next, fromLeft) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("tcar-slide--left", fromLeft);
      slide.classList.toggle("tcar-slide--active", i === index);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    counter.textContent =
      index + 1 < 10 ? "0" + (index + 1) : String(index + 1);
  }

  function syncAuto() {
    if (visible && autoRotate && !timer) {
      // Re-check the flag inside the callback: a tick already queued when the
      // reader takes over must not advance the slide under them.
      timer = setInterval(function () {
        if (autoRotate) show(index + 1, false);
      }, 6500);
    } else if ((!visible || !autoRotate) && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  prevBtn.addEventListener("click", function () {
    autoRotate = false;
    syncAuto();
    show(index - 1, true);
  });
  nextBtn.addEventListener("click", function () {
    autoRotate = false;
    syncAuto();
    show(index + 1, false);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        visible = entries[0].isIntersecting;
        syncAuto();
      },
      { threshold: 0.35 },
    ).observe(root);
  } else {
    visible = true;
    syncAuto();
  }
})();

// Plans page: monthly/yearly billing toggle. Swaps each card's displayed
// price and alt-currency line between its data-m (monthly) and data-y (yearly)
// values. Pure display; checkout still happens in the app.
(function () {
  "use strict";
  var billing = document.querySelector("[data-billing]");
  if (!billing) return;

  var buttons = [].slice.call(billing.querySelectorAll("[data-interval]"));
  var swaps = [].slice.call(
    document.querySelectorAll("[data-price], [data-cycle]"),
  );

  function apply(interval) {
    buttons.forEach(function (b) {
      b.classList.toggle(
        "is-active",
        b.getAttribute("data-interval") === interval,
      );
    });
    swaps.forEach(function (el) {
      el.innerHTML = el.getAttribute("data-" + interval);
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      apply(b.getAttribute("data-interval"));
    });
  });
})();

// Plans page: detail rows + preview carousel.
(function () {
  "use strict";
  var root = document.querySelector("[data-plan-carousel]");
  if (!root) return;

  var rows = [].slice.call(root.querySelectorAll("[data-plan-select]"));
  var slides = [].slice.call(root.querySelectorAll("[data-plan-slide]"));
  var dots = [].slice.call(root.querySelectorAll("[data-plan-dot]"));
  var prev = root.querySelector("[data-plan-prev]");
  var next = root.querySelector("[data-plan-next]");
  var index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    rows.forEach(function (row, i) {
      row.classList.toggle("is-active", i === index);
    });
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  rows.forEach(function (row, i) {
    row.addEventListener("click", function () {
      show(i);
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
    });
  }
})();

// Docs page: category tabs. Clicking a category in the sidebar swaps the
// visible article panel. No-op on pages without the doc tree.
(function () {
  "use strict";
  var nav = document.querySelector("[data-doc-tabs]");
  if (!nav) return;
  var tabs = [].slice.call(nav.querySelectorAll("[data-doc-key]"));
  var panels = [].slice.call(document.querySelectorAll("[data-doc-panel]"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-doc-key");
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
      });
      panels.forEach(function (p) {
        p.classList.toggle(
          "is-active",
          p.getAttribute("data-doc-panel") === key,
        );
      });
    });
  });
})();

// FAQ page: category sidebar + live search + accordion, mirroring the app's
// Help layout. Category pills scope the list; search overrides with global
// matches; clicking a question expands its answer. No-op without the FAQ list.
(function () {
  "use strict";
  var root = document.querySelector("[data-faq-page]");
  if (!root) return;

  var search = document.querySelector("[data-faq-search]");
  var pills = [].slice.call(root.querySelectorAll("[data-faq-cat]"));
  var items = [].slice.call(root.querySelectorAll(".px-faq-item"));
  var titleEl = root.querySelector("[data-faq-title]");
  var empty = root.querySelector("[data-faq-empty]");
  var firstPill = pills[0];
  var activeCat = firstPill ? firstPill.getAttribute("data-faq-cat") : "all";
  var activeTitle = firstPill ? firstPill.textContent.trim() : "";

  items.forEach(function (item) {
    item._searchText = item.textContent.toLowerCase();
    var q = item.querySelector(".px-faq-q");
    q.addEventListener("click", function () {
      item.classList.toggle("is-open");
    });
  });

  function render() {
    var term = search ? (search.value || "").trim().toLowerCase() : "";
    var any = false;
    items.forEach(function (item) {
      var show = term
        ? (item._searchText || "").indexOf(term) !== -1
        : activeCat === "all" || item.getAttribute("data-cat") === activeCat;
      item.style.display = show ? "" : "none";
      if (show) any = true;
      if (term && show) item.classList.add("is-open");
      if (!term) item.classList.remove("is-open");
    });
    if (titleEl) titleEl.textContent = term ? "Search results" : activeTitle;
    if (empty) empty.hidden = any;
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      activeCat = pill.getAttribute("data-faq-cat");
      activeTitle = pill.textContent.trim();
      pills.forEach(function (p) {
        p.classList.toggle("is-active", p === pill);
      });
      if (search) search.value = "";
      render();
    });
  });

  if (search) search.addEventListener("input", render);
  render();
})();

// Legal ToC scroll-spy: highlights the section link currently in view so the
// reader always knows their place in a long document, and keeps the active
// link visible within the sticky ToC. No-op without a ToC.
(function () {
  "use strict";
  var toc = document.querySelector(".px-toc");
  if (!toc) return;

  var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  var byId = {};
  var headings = [];
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var h = document.getElementById(id);
    if (h) {
      byId[id] = a;
      headings.push(h);
    }
  });
  if (!headings.length) return;

  var current = null;
  function setActive(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href").slice(1) === id);
    });
    if (byId[id]) byId[id].scrollIntoView({ block: "nearest" });
  }

  // The reading line sits just below the sticky header; the active section is
  // the last heading whose top has passed it.
  var scroller = document.querySelector(".site-frame") || window;
  var headerH =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      10,
    ) || 60;
  var line = headerH + 40;
  var ticking = false;

  function update() {
    ticking = false;
    var id = headings[0].id;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top <= line) id = headings[i].id;
      else break;
    }
    setActive(id);
  }

  scroller.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
})();
