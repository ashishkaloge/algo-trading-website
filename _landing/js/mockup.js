/*
 * Core-product mockup (viewport 3).
 * A scripted, non-interactive demo that autoplays on loop through 5 example
 * strategies, each walking the real product flow:
 *   chat (Trading AI + builder proposal) -> drag & drop strategy graph
 *   -> inspector (node settings -> backtest -> deploy checklist)
 *   -> Telegram approval (approval-mode strategies) -> community
 * Layout, chrome and copy are an illustrative representation of the Tradign
 * workspace: dock tabs,
 * setup flags, block palette, canvas controls, the deploy inspector's real
 * readiness rows (Strategy logic / Coins & timeframe / Mode & alerts /
 * Exchange), the builder backtest metrics (Trades / Win rate / Net P&L /
 * Max DD), the real Telegram approval message shape with its
 * "Execute on exchange" / "Execute on paper" buttons, and the proof-verified
 * community feed. A fake cursor marks every "click" so the sequence reads as
 * someone actually using the product.
 *
 * The whole scene is designed once at 760x506 and scaled to the frame width
 * (the product is desktop web; small screens get a faithful scaled-down shot).
 * The loop starts when the section first scrolls into view and pauses while
 * off-screen. Reduced-motion users get a single composed still instead.
 */
(function () {
  var root = document.getElementById("build-mockup");
  var items = document.querySelectorAll(".build-item");
  if (!root || root.dataset.mockupInit) return;
  root.dataset.mockupInit = "true";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.innerHTML =
    '<div class="mock-content" data-content></div>' +
    '<div class="mock-cursor" data-cursor>' +
    '<svg class="mock-cursor-arrow" viewBox="0 0 16 20" aria-hidden="true">' +
    '<path d="M1 1 L1 14.8 L4.9 11.9 L7.4 17.7 L10.1 16.5 L7.6 10.7 L13.2 10.3 Z"></path>' +
    "</svg>" +
    '<span class="mock-cursor-ring"></span>' +
    "</div>";
  var content = root.querySelector("[data-content]");
  var cursor = root.querySelector("[data-cursor]");
  var cursorPlaced = false;

  /* ---- design-size scaling (scene designed at 760x506) ---- */
  var DESIGN_W = 760;
  var mockScale = 1;
  function sizeFrame() {
    mockScale = (root.clientWidth || DESIGN_W) / DESIGN_W;
    root.style.setProperty("--mock-scale", mockScale);
  }
  sizeFrame();
  if (window.ResizeObserver) new ResizeObserver(sizeFrame).observe(root);
  else window.addEventListener("resize", sizeFrame);

  /* ---- data ---- */
  var CATEGORY_LABEL = {
    indicator: "Indicator",
    filter: "Filter",
    logic: "Logic",
    risk: "Risk",
    entry: "Entry",
  };

  // Real block names from the product's 50+ block palette catalog.
  var PALETTE = [
    "RSI",
    "MACD",
    "Supertrend",
    "Volume Filter",
    "ATR Stop",
    "Trailing Stop",
    "Take Profit",
    "Cooldown",
  ];

  var COMMANDS = ["/new-strategy", "/backtest", "/deploy-check"];

  var DOCK_TABS = [
    { key: "my-space", label: "My Space" },
    { key: "community", label: "Community" },
    { key: "chat", label: "Chat" },
    { key: "dnd", label: "D&amp;D" },
  ];

  // Trending posts show the real snapshot templates: win-rate gauge and
  // profit-factor KPI card (the featured post carries the equity chart).
  var TRENDING_POSTS = [
    {
      handle: "quant_lee",
      time: "2h",
      type: "Strategy",
      title: "RSI Drift Reset",
      market: "BTC/USDT",
      tf: "1H",
      likes: 4,
      replies: 2,
      pill: "RSI Drift",
      media: { kind: "gauge", value: 64 },
      reply: {
        handle: "sarah_fx",
        text: "Running it on 1H. Clean entries so far.",
      },
    },
    {
      handle: "kai_trades",
      time: "8h",
      type: "Backtest",
      title: "SOL Scalper",
      market: "SOL/USDT",
      tf: "15m",
      likes: 5,
      replies: 1,
      media: {
        kind: "kpi",
        label: "Profit factor",
        value: "2.41",
        trend: "↑ 212 trades · costs included",
      },
    },
  ];

  var STRATEGIES = [
    {
      prompt: "Build a BTC trend strategy with RSI and Telegram approval",
      reply:
        "Trend confirmation with a volume filter, and every entry waits for your Telegram approval.",
      title: "BTC RSI Trend",
      market: "BTC/USDT",
      timeframe: "4H",
      exchange: "Binance",
      mode: ["Approval", "Telegram DM", "DM"],
      params: [
        ["RSI Period", "14"],
        ["Threshold", "30"],
      ],
      backtest: {
        winRate: "63%",
        profitFactor: "2.18",
        trades: "148",
        netPnl: "+29.4%",
        maxDD: "-6.4%",
      },
      approval: {
        entry: "67,420",
        sl: "66,180",
        tp: "69,910",
        strength: "78",
        tag: "T-0418",
      },
      curve: "0,50 30,42 60,44 90,30 120,32 150,18 180,20 200,8",
      dragBlock: "ATR Stop",
      graph: {
        nodes: [
          { id: "n0", label: "RSI(14) < 30", x: 16, y: 30, type: "indicator" },
          { id: "n1", label: "Volume Filter", x: 16, y: 64, type: "filter" },
          { id: "entry", label: "Entry Long", x: 48, y: 47, type: "entry" },
          { id: "n3", label: "ATR Stop · TP 5%", x: 80, y: 47, type: "risk" },
        ],
        lines: [
          ["n0", "entry"],
          ["n1", "entry"],
          ["entry", "n3"],
        ],
      },
    },
    {
      prompt: "Trade ETH with an EMA ribbon trend filter",
      reply:
        "An EMA ribbon confirms direction, an ADX filter avoids chop, and a trailing stop protects the trend.",
      title: "ETH EMA Ribbon",
      market: "ETH/USDT",
      timeframe: "1D",
      exchange: "Bybit",
      mode: ["Direct", "Email alerts", "Email"],
      params: [
        ["Fast EMA", "21"],
        ["Slow EMA", "55"],
      ],
      backtest: {
        winRate: "57%",
        profitFactor: "2.42",
        trades: "86",
        netPnl: "+24.1%",
        maxDD: "-5.8%",
      },
      curve: "0,52 40,40 80,36 120,24 160,20 200,10",
      dragBlock: "Trailing Stop",
      graph: {
        nodes: [
          {
            id: "n0",
            label: "EMA Ribbon Aligned",
            x: 14,
            y: 47,
            type: "indicator",
          },
          { id: "n1", label: "ADX > 20", x: 35, y: 47, type: "filter" },
          { id: "entry", label: "Entry Long", x: 55, y: 47, type: "entry" },
          { id: "n3", label: "Trailing Stop", x: 82, y: 47, type: "risk" },
        ],
        lines: [
          ["n0", "n1"],
          ["n1", "entry"],
          ["entry", "n3"],
        ],
      },
    },
    {
      prompt: "Build a mean reversion strategy for BTC using Bollinger Bands",
      reply:
        "Price below the lower band or an oversold RSI signals reversion, with the exit back at the midline.",
      title: "BTC Mean Reversion",
      market: "BTC/USDT",
      timeframe: "1H",
      exchange: "OKX",
      mode: ["Direct", "Email alerts", "Email"],
      params: [
        ["BB Period", "20"],
        ["Std Dev", "2.0"],
      ],
      backtest: {
        winRate: "66%",
        profitFactor: "1.98",
        trades: "412",
        netPnl: "+18.7%",
        maxDD: "-7.6%",
      },
      curve: "0,48 25,52 50,38 75,44 100,30 125,34 150,22 175,26 200,14",
      dragBlock: "Take Profit",
      graph: {
        nodes: [
          {
            id: "n0",
            label: "Price < Lower Band",
            x: 15,
            y: 28,
            type: "indicator",
          },
          { id: "n1", label: "RSI Oversold", x: 15, y: 66, type: "indicator" },
          { id: "gate", label: "OR", x: 38, y: 47, type: "logic" },
          { id: "entry", label: "Entry Long", x: 60, y: 47, type: "entry" },
          {
            id: "n4",
            label: "Take Profit · Midline",
            x: 85,
            y: 47,
            type: "risk",
          },
        ],
        lines: [
          ["n0", "gate"],
          ["n1", "gate"],
          ["gate", "entry"],
          ["entry", "n4"],
        ],
      },
    },
    {
      prompt: "Create a range breakout strategy with volume confirmation",
      reply:
        "A range breakout, a volume spike and a higher-timeframe filter all have to agree before entry.",
      title: "SOL Range Breakout",
      market: "SOL/USDT",
      timeframe: "15m",
      exchange: "Bitget",
      mode: ["Direct", "Email alerts", "Email"],
      params: [
        ["Lookback", "20"],
        ["Vol Mult", "1.8"],
      ],
      backtest: {
        winRate: "54%",
        profitFactor: "2.61",
        trades: "620",
        netPnl: "+22.3%",
        maxDD: "-6.2%",
      },
      curve: "0,55 50,50 100,48 130,40 160,20 200,6",
      dragBlock: "ATR Stop",
      graph: {
        nodes: [
          {
            id: "n0",
            label: "Range Breakout",
            x: 15,
            y: 22,
            type: "indicator",
          },
          { id: "n1", label: "Volume Spike", x: 15, y: 47, type: "filter" },
          { id: "n2", label: "Higher Timeframe", x: 15, y: 72, type: "filter" },
          { id: "gate", label: "AND", x: 39, y: 47, type: "logic" },
          { id: "entry", label: "Entry Long", x: 61, y: 47, type: "entry" },
          { id: "n5", label: "ATR Stop", x: 85, y: 47, type: "risk" },
        ],
        lines: [
          ["n0", "gate"],
          ["n1", "gate"],
          ["n2", "gate"],
          ["gate", "entry"],
          ["entry", "n5"],
        ],
      },
    },
    {
      prompt:
        "Build a Supertrend strategy on SOL with Telegram approval before every trade",
      reply:
        "A Supertrend flip filtered by the higher timeframe, and every entry waits for your Telegram approval.",
      title: "SOL Supertrend Flip",
      market: "SOL/USDT",
      timeframe: "1H",
      exchange: "KuCoin",
      mode: ["Approval", "Telegram DM", "DM"],
      params: [
        ["ATR Period", "10"],
        ["Multiplier", "3.0"],
      ],
      backtest: {
        winRate: "60%",
        profitFactor: "2.24",
        trades: "301",
        netPnl: "+16.9%",
        maxDD: "-7.1%",
      },
      approval: {
        entry: "156.40",
        sl: "151.80",
        tp: "164.90",
        strength: "72",
        tag: "T-0563",
      },
      curve: "0,50 40,36 80,42 120,26 160,30 200,12",
      dragBlock: "Cooldown",
      graph: {
        nodes: [
          {
            id: "n0",
            label: "Supertrend Flip",
            x: 16,
            y: 30,
            type: "indicator",
          },
          { id: "n1", label: "Higher Timeframe", x: 16, y: 64, type: "filter" },
          { id: "entry", label: "Entry Long", x: 48, y: 47, type: "entry" },
          { id: "n3", label: "Cooldown", x: 80, y: 47, type: "risk" },
        ],
        lines: [
          ["n0", "entry"],
          ["n1", "entry"],
          ["entry", "n3"],
        ],
      },
    },
  ];

  /* ---- helpers ---- */
  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // The loop only advances while the section is on screen: every sleep waits
  // out its delay, then blocks until the demo is visible again.
  var demoVisible = false;
  var visibilityWaiters = [];
  function whenVisible() {
    if (demoVisible) return Promise.resolve();
    return new Promise(function (resolve) {
      visibilityWaiters.push(resolve);
    });
  }
  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    }).then(whenVisible);
  }

  function setActiveItem(key) {
    items.forEach(function (item) {
      item.classList.toggle(
        "build-item--active",
        item.getAttribute("data-mockup") === key,
      );
    });
  }

  function stage(activeTab, bodyHtml) {
    var tabs = DOCK_TABS.map(function (tab) {
      return (
        '<span class="mock-tab' +
        (tab.key === activeTab ? " mock-tab--active" : "") +
        '">' +
        tab.label +
        "</span>"
      );
    }).join("");
    content.innerHTML =
      '<div class="mock-topbar">' +
      '<span class="mock-topbar-brand">tradign<span>.com</span></span>' +
      '<span class="mock-topbar-path">/ai</span>' +
      '<nav class="mock-topbar-tabs">' +
      tabs +
      "</nav>" +
      "</div>" +
      '<div class="mock-stage" data-stage>' +
      bodyHtml +
      "</div>";
    cursor.classList.remove("mock-cursor--visible");
    cursor.style.transform = "translate(-9999px, -9999px)";
    cursorPlaced = false;
    return content.querySelector("[data-stage]");
  }

  function el(html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function moveCursorTo(targetEl, xRatio, yRatio) {
    var frameRect = root.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var x =
      targetRect.left +
      targetRect.width * (xRatio == null ? 0.5 : xRatio) -
      frameRect.left;
    var y =
      targetRect.top +
      targetRect.height * (yRatio == null ? 0.5 : yRatio) -
      frameRect.top;
    var transform =
      "translate(" + x + "px," + y + "px) scale(var(--mock-scale, 1))";

    if (!cursorPlaced) {
      cursor.style.transition = "none";
      cursor.style.transform = transform;
      cursor.classList.add("mock-cursor--visible");
      void cursor.offsetWidth;
      cursor.style.transition = "";
      cursorPlaced = true;
      return;
    }

    cursor.classList.add("mock-cursor--visible");
    cursor.style.transform = transform;
  }

  async function clickAt(targetEl, xRatio, yRatio) {
    moveCursorTo(targetEl, xRatio, yRatio);
    await sleep(650);
    cursor.classList.remove("mock-cursor--click");
    void cursor.offsetWidth;
    cursor.classList.add("mock-cursor--click");
    await sleep(320);
  }

  // .mock-bubble / .mock-post fade in via a one-shot `animation` (mock-fade-up,
  // forwards). Pin the settled state as inline styles once it's done so the
  // element stays visible regardless of whatever classes get toggled later.
  function settleFadeIn(target, delay) {
    if (!target) return;
    setTimeout(function () {
      target.style.opacity = "1";
      target.style.transform = "translateY(0)";
    }, delay || 400);
  }

  async function typeIntoTextarea(textarea, text) {
    for (var i = 1; i <= text.length; i++) {
      textarea.value = text.slice(0, i);
      await sleep(34);
    }
  }

  async function streamText(target, text) {
    for (var i = 1; i <= text.length; i++) {
      target.textContent = text.slice(0, i);
      await sleep(26);
    }
  }

  /* ---- shared fragments ---- */
  var ACTION_ICONS = {
    like: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    reply:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      "</svg>",
  };

  function actionIcon(name, count) {
    return (
      '<span class="mock-action">' +
      ACTION_ICONS[name] +
      (count != null ? "<em>" + count + "</em>" : "") +
      "</span>"
    );
  }

  // Canvas control icons match the real builder's controls (fit / zoom / tidy).
  var CANVAS_CONTROLS =
    '<span class="mock-controls" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>' +
    '<svg viewBox="0 0 24 24"><path d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM11 8v6M8 11h6M16 16l4 4"/></svg>' +
    '<svg viewBox="0 0 24 24"><path d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM8 11h6M16 16l4 4"/></svg>' +
    '<svg viewBox="0 0 24 24"><path d="M5 7h6M5 12h10M5 17h14M17 5l2 2-2 2M17 10l2 2-2 2M17 15l2 2-2 2"/></svg>' +
    "</span>";

  // Edges run port to port (right edge of the source card to the left edge of
  // the target card), so lines meet the port dots instead of emerging from
  // underneath the cards. Measured after render; offset* values are design-px
  // and unaffected by the frame scale transform.
  function wireLines(stageEl, graph, visible) {
    var graphEl = stageEl.querySelector("[data-graph]");
    var svg = graphEl.querySelector(".mock-graph-lines");
    svg.setAttribute(
      "viewBox",
      "0 0 " + graphEl.clientWidth + " " + graphEl.clientHeight,
    );
    var ports = {};
    graph.nodes.forEach(function (node) {
      var nodeEl = stageEl.querySelector('[data-node-id="' + node.id + '"]');
      ports[node.id] = {
        x: nodeEl.offsetLeft,
        y: nodeEl.offsetTop,
        halfW: nodeEl.offsetWidth / 2,
      };
    });
    svg.innerHTML = graph.lines
      .map(function (pair, i) {
        var from = ports[pair[0]],
          to = ports[pair[1]];
        var x1 = from.x + from.halfW,
          y1 = from.y;
        var x2 = to.x - to.halfW,
          y2 = to.y;
        var midX = (x1 + x2) / 2;
        return (
          '<path class="mock-line' +
          (visible ? " mock-line--visible" : "") +
          '" data-line="' +
          i +
          '" d="M' +
          x1 +
          "," +
          y1 +
          " C" +
          midX +
          "," +
          y1 +
          " " +
          midX +
          "," +
          y2 +
          " " +
          x2 +
          "," +
          y2 +
          '"></path>'
        );
      })
      .join("");
  }

  // Port dots render only where an edge actually connects (left dot needs an
  // incoming line, right dot an outgoing one). No dangling ports.
  function nodeHtml(node, visible, hasIn, hasOut) {
    var category =
      node.type === "logic"
        ? ""
        : '<span class="mock-node-cat">' +
          CATEGORY_LABEL[node.type] +
          "</span>";
    return (
      '<div class="mock-node mock-node--' +
      node.type +
      (visible ? " mock-node--visible" : "") +
      (hasIn ? " mock-node--in" : "") +
      (hasOut ? " mock-node--out" : "") +
      '"' +
      ' data-node-id="' +
      node.id +
      '" style="left:' +
      node.x +
      "%;top:" +
      node.y +
      '%">' +
      '<span class="mock-node-title">' +
      esc(node.label) +
      "</span>" +
      category +
      "</div>"
    );
  }

  // Setup flags mirror the real builder's setup-flag row (Market / Mode /
  // Exchange / Backtest / Deploy), each with a live summary.
  function canvasHtml(strategy, revealAll) {
    var graph = strategy.graph;
    var hasIn = {},
      hasOut = {};
    graph.lines.forEach(function (pair) {
      hasOut[pair[0]] = true;
      hasIn[pair[1]] = true;
    });
    var nodesHtml = graph.nodes
      .map(function (node) {
        return nodeHtml(node, revealAll, hasIn[node.id], hasOut[node.id]);
      })
      .join("");
    var flags = [
      ["market", "Market", strategy.timeframe + " · " + strategy.market],
      ["mode", "Mode", strategy.mode[0] + " · " + strategy.mode[2]],
      ["exchange", "Exchange", strategy.exchange],
      ["backtest", "Backtest", "Run"],
      ["deploy", "Deploy", "Review"],
    ]
      .map(function (flag) {
        return (
          '<span class="mock-flag" data-flag="' +
          flag[0] +
          '">' +
          "<strong>" +
          flag[1] +
          "</strong><span data-flag-summary>" +
          flag[2] +
          "</span>" +
          "</span>"
        );
      })
      .join("");
    var pills = PALETTE.map(function (label) {
      return (
        '<span class="mock-pill" data-pill="' + label + '">' + label + "</span>"
      );
    }).join("");

    return (
      '<div class="mock-canvas" data-canvas>' +
      '<div class="mock-flags" data-flags>' +
      flags +
      CANVAS_CONTROLS +
      "</div>" +
      '<div class="mock-graph" data-graph>' +
      '<svg class="mock-graph-lines" preserveAspectRatio="none"></svg>' +
      nodesHtml +
      "</div>" +
      '<div class="mock-palette" data-palette>' +
      '<span class="mock-palette-label">Blocks <em>51</em></span>' +
      '<div class="mock-palette-pills">' +
      pills +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  // Real deploy-inspector readiness rows: Strategy logic, Coins & timeframe,
  // Mode & alerts, Exchange.
  function checklistRows(strategy) {
    return [
      ["Strategy logic", "Signal ready"],
      ["Coins & timeframe", strategy.timeframe + " · " + strategy.market],
      ["Mode & alerts", strategy.mode[0] + " · " + strategy.mode[1]],
      ["Execution account", strategy.exchange + " · prepared example"],
    ];
  }

  /* ---- act 1: chat ---- */
  async function playChat(strategy) {
    setActiveItem("chat");
    var stageEl = stage(
      "chat",
      '<div class="mock-chat">' +
        '<div class="mock-chat-thread" data-thread>' +
        '<div class="mock-chat-empty" data-empty>' +
        '<p class="mock-chat-empty-title">What can I help with?</p>' +
        '<p class="mock-chat-empty-sub">Ask me anything about your trading workflow</p>' +
        "</div>" +
        "</div>" +
        '<div class="mock-commands">' +
        COMMANDS.map(function (c) {
          return '<span class="mock-command">' + c + "</span>";
        }).join("") +
        "</div>" +
        '<div class="mock-composer" data-composer>' +
        '<textarea class="mock-composer-input" data-input placeholder="Message Trading AI..." rows="1" readonly></textarea>' +
        '<div class="mock-composer-toolbar">' +
        '<div class="mock-composer-toolbar-left"><span class="mock-composer-model">Auto<i></i></span></div>' +
        '<div class="mock-composer-send" data-send>↗</div>' +
        "</div>" +
        "</div>" +
        "</div>",
    );

    await sleep(700);
    var composer = stageEl.querySelector("[data-composer]");
    var textarea = stageEl.querySelector("[data-input]");
    var sendBtn = stageEl.querySelector("[data-send]");

    await clickAt(textarea, 0.3, 0.5);
    composer.classList.add("mock-composer--focused");
    await typeIntoTextarea(textarea, strategy.prompt);
    sendBtn.classList.add("mock-composer-send--active");
    await sleep(420);

    await clickAt(sendBtn);
    composer.classList.remove("mock-composer--focused");

    var thread = stageEl.querySelector("[data-thread]");
    var emptyState = stageEl.querySelector("[data-empty]");
    if (emptyState) emptyState.remove();

    var userBubble = el(
      '<div class="mock-bubble mock-bubble--user"><p>' +
        esc(strategy.prompt) +
        "</p></div>",
    );
    thread.appendChild(userBubble);
    settleFadeIn(userBubble);
    textarea.value = "";
    sendBtn.classList.remove("mock-composer-send--active");
    thread.scrollTop = thread.scrollHeight;
    await sleep(550);

    var replyBubble = el(
      '<div class="mock-bubble mock-bubble--assistant">' +
        '<span class="mock-bubble-eyebrow">Trading AI <span class="mock-typing-indicator" data-typing><span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span></span></span>' +
        "<p data-reply></p>" +
        "</div>",
    );
    thread.appendChild(replyBubble);
    settleFadeIn(replyBubble);
    thread.scrollTop = thread.scrollHeight;
    await sleep(1200);

    replyBubble.querySelector("[data-typing]").remove();
    await streamText(replyBubble.querySelector("[data-reply]"), strategy.reply);
    thread.scrollTop = thread.scrollHeight;
    await sleep(450);

    // Builder proposal card: the real product's chat -> builder handoff.
    var proposalRows = strategy.graph.nodes
      .slice(0, 3)
      .map(function (node) {
        return (
          '<div class="mock-proposal-row">' +
          "<span>" +
          CATEGORY_LABEL[node.type] +
          "</span><strong>" +
          esc(node.label) +
          "</strong>" +
          "</div>"
        );
      })
      .join("");
    var proposal = el(
      '<div class="mock-proposal">' +
        '<div class="mock-proposal-head">' +
        '<span class="mock-proposal-eyebrow">Builder proposal</span>' +
        '<span class="mock-proposal-confidence">' +
        strategy.timeframe +
        " · " +
        esc(strategy.market) +
        "</span>" +
        "</div>" +
        '<p class="mock-proposal-title">' +
        esc(strategy.title) +
        "</p>" +
        '<div class="mock-proposal-rows">' +
        proposalRows +
        "</div>" +
        '<div class="mock-proposal-actions">' +
        '<span class="mock-proposal-btn">Confirm &amp; deploy</span>' +
        '<span class="mock-proposal-btn mock-proposal-btn--accent" data-open-canvas>Open canvas</span>' +
        "</div>" +
        "</div>",
    );
    thread.appendChild(proposal);
    settleFadeIn(proposal);
    thread.scrollTop = thread.scrollHeight;
    await sleep(850);

    await clickAt(proposal.querySelector("[data-open-canvas]"));
    await sleep(300);
  }

  /* ---- act 2: drag & drop graph ---- */
  async function playGraph(strategy) {
    setActiveItem("dragdrop");
    var graph = strategy.graph;
    var stageEl = stage("dnd", canvasHtml(strategy, false));
    wireLines(stageEl, graph, false);

    await sleep(600);

    // Reveal every node except the final risk block. That one gets dragged
    // in from the palette, the way you'd actually extend a strategy.
    var dragIdx = graph.nodes.length - 1;
    var revealed = {};
    function showConnectedLines() {
      graph.lines.forEach(function (pair, li) {
        if (revealed[pair[0]] && revealed[pair[1]]) {
          var lineEl = stageEl.querySelector('[data-line="' + li + '"]');
          if (lineEl) lineEl.classList.add("mock-line--visible");
        }
      });
    }
    for (var i = 0; i < dragIdx; i++) {
      var node = graph.nodes[i];
      stageEl
        .querySelector('[data-node-id="' + node.id + '"]')
        .classList.add("mock-node--visible");
      revealed[node.id] = true;
      showConnectedLines();
      await sleep(430);
    }
    await sleep(350);

    // Drag the last block from the palette onto the canvas.
    var dragNode = graph.nodes[dragIdx];
    var targetEl = stageEl.querySelector(
      '[data-node-id="' + dragNode.id + '"]',
    );
    var pill = stageEl.querySelector(
      '[data-pill="' + strategy.dragBlock + '"]',
    );
    var canvas = stageEl.querySelector("[data-canvas]");

    await clickAt(pill);
    pill.classList.add("mock-pill--grabbed");

    var canvasRect = canvas.getBoundingClientRect();
    var pillRect = pill.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var ghost = el(
      '<span class="mock-pill mock-pill--ghost">' +
        strategy.dragBlock +
        "</span>",
    );
    ghost.style.left =
      (pillRect.left + pillRect.width / 2 - canvasRect.left) / mockScale + "px";
    ghost.style.top =
      (pillRect.top + pillRect.height / 2 - canvasRect.top) / mockScale + "px";
    canvas.appendChild(ghost);
    void ghost.offsetWidth;
    ghost.classList.add("mock-pill--ghost-move");
    moveCursorTo(targetEl);
    ghost.style.left =
      (targetRect.left + targetRect.width / 2 - canvasRect.left) / mockScale +
      "px";
    ghost.style.top =
      (targetRect.top + targetRect.height / 2 - canvasRect.top) / mockScale +
      "px";
    await sleep(780);

    ghost.remove();
    pill.classList.remove("mock-pill--grabbed");
    targetEl.classList.add("mock-node--visible");
    revealed[dragNode.id] = true;
    showConnectedLines();
    await sleep(850);

    return stageEl;
  }

  /* ---- act 3: inspector (node settings -> backtest -> deploy) ---- */
  async function playDeploy(stageEl, strategy) {
    setActiveItem("deploy");
    var graph = strategy.graph;
    var cfgNode = graph.nodes[0];
    var cfgEl = stageEl.querySelector('[data-node-id="' + cfgNode.id + '"]');
    var canvas = stageEl.querySelector("[data-canvas]");
    var graphEl = stageEl.querySelector("[data-graph]");

    // Zoom toward the configured node, panning it clear of the panel.
    canvas.classList.add("mock-canvas--panel");
    graphEl.style.transformOrigin = cfgNode.x + "% " + cfgNode.y + "%";
    graphEl.classList.add("mock-graph--zoomed");
    graphEl.style.transform =
      "translate(" +
      (24 - cfgNode.x) +
      "%, " +
      (47 - cfgNode.y) +
      "%) scale(1.28)";
    await sleep(420);

    await clickAt(cfgEl);
    cfgEl.classList.add("mock-node--selected");

    var panel = el(
      '<div class="mock-panel" data-panel>' +
        '<div class="mock-panel-head"><span class="mock-panel-kicker">Inspector</span><span class="mock-panel-close">✕</span></div>' +
        '<div class="mock-panel-body" data-panel-body></div>' +
        "</div>",
    );
    canvas.appendChild(panel);
    void panel.offsetWidth;
    panel.classList.add("mock-panel--open");
    var body = panel.querySelector("[data-panel-body]");

    // Step 1: node settings.
    body.innerHTML =
      '<p class="mock-panel-title">' +
      esc(cfgNode.label) +
      "</p>" +
      '<p class="mock-panel-sub">' +
      CATEGORY_LABEL[cfgNode.type] +
      " settings</p>" +
      strategy.params
        .map(function (param, i) {
          return (
            '<div class="mock-panel-row"><span>' +
            param[0] +
            '</span><strong data-field="' +
            i +
            '"></strong></div>'
          );
        })
        .join("");
    await sleep(550);
    body.querySelector('[data-field="0"]').textContent = strategy.params[0][1];
    await sleep(380);
    body.querySelector('[data-field="1"]').textContent = strategy.params[1][1];
    await sleep(750);

    // Step 2: backtest.
    var btFlag = stageEl.querySelector('[data-flag="backtest"]');
    await clickAt(btFlag);
    btFlag.classList.add("mock-flag--active");
    body.innerHTML =
      '<p class="mock-panel-title">Backtest</p>' +
      '<p class="mock-panel-sub">' +
      strategy.market +
      " · " +
      strategy.timeframe +
      " · illustrative sample</p>" +
      '<div class="mock-progress"><span class="mock-progress-fill" data-progress></span></div>' +
      '<p class="mock-panel-note" data-bt-note>Running backtest…</p>' +
      '<div class="mock-metrics" data-metrics></div>';
    void body.offsetWidth;
    body.querySelector("[data-progress]").style.width = "100%";
    await sleep(1500);

    body.querySelector("[data-bt-note]").textContent =
      "Completed · costs included";
    // The builder backtest inspector's real headline fields.
    var metrics = [
      ["Trades", strategy.backtest.trades],
      ["Win rate", strategy.backtest.winRate],
      ["Net P&L", strategy.backtest.netPnl],
      ["Max DD", strategy.backtest.maxDD],
    ];
    var metricsEl = body.querySelector("[data-metrics]");
    metricsEl.innerHTML = metrics
      .map(function (m) {
        return (
          '<div class="mock-metric"><span>' +
          m[0] +
          "</span><strong>" +
          m[1] +
          "</strong></div>"
        );
      })
      .join("");
    metricsEl.classList.add("mock-metrics--visible");
    btFlag.querySelector("[data-flag-summary]").textContent =
      strategy.backtest.winRate + " WR";
    await sleep(1500);

    // Step 3: deploy checklist, straight from the real deploy inspector.
    btFlag.classList.remove("mock-flag--active");
    var deployFlag = stageEl.querySelector('[data-flag="deploy"]');
    await clickAt(deployFlag);
    deployFlag.classList.add("mock-flag--active");
    body.innerHTML =
      '<p class="mock-panel-title">Deploy <span class="mock-panel-badge">Review</span></p>' +
      '<p class="mock-panel-sub">Deployment checklist</p>' +
      '<div class="mock-checklist" data-checklist></div>' +
      '<div class="mock-panel-footer" data-footer>' +
      '<span class="mock-deploy-btn" data-deploy>Confirm deploy</span>' +
      "</div>";
    var checklist = body.querySelector("[data-checklist]");
    var rows = checklistRows(strategy);
    for (var r = 0; r < rows.length; r++) {
      var row = el(
        '<div class="mock-check-row"><span class="mock-check-dot"></span>' +
          '<span class="mock-check-label">' +
          rows[r][0] +
          "</span>" +
          '<strong class="mock-check-value">' +
          rows[r][1] +
          "</strong></div>",
      );
      checklist.appendChild(row);
      settleFadeIn(row, 300);
      await sleep(240);
    }
    body.querySelector(".mock-panel-badge").textContent = "Ready";
    await sleep(450);

    var deployBtn = body.querySelector("[data-deploy]");
    await clickAt(deployBtn);
    deployBtn.classList.add("mock-deploy-btn--busy");
    deployBtn.textContent = "Deploying…";
    await sleep(850);

    deployBtn.classList.remove("mock-deploy-btn--busy");
    deployBtn.classList.add("mock-deploy-btn--done");
    deployBtn.textContent = "✓ Deployed";
    deployFlag.querySelector("[data-flag-summary]").textContent = "Active";
    deployFlag.classList.add("mock-flag--live");
    var statusLine = el(
      '<p class="mock-panel-status">' +
        (strategy.mode[0] === "Approval"
          ? "Live: entries wait for your Telegram approval"
          : "Live: executing signals directly") +
        "</p>",
    );
    body.querySelector("[data-footer]").insertBefore(statusLine, deployBtn);
    await sleep(950);

    var share = el(
      '<span class="mock-panel-share" data-share>Share verified result →</span>',
    );
    body.querySelector("[data-footer]").appendChild(share);
    await sleep(420);
    await clickAt(share);
    await sleep(300);
  }

  /* ---- act 3.5: Telegram approval (approval-mode strategies only) ----
     Mirrors the real approval request: SYMBOL • SIDE headline, Strategy /
     Trade # / Entry / Stop Loss / Take Profit / Strength rows, and the real
     inline buttons "Execute on exchange ⚡" and "Execute on paper 🧪". */
  async function playApproval(strategy) {
    setActiveItem("deploy");
    var a = strategy.approval;
    var rows = [
      ["Strategy", esc(strategy.title), false],
      ["Trade #", a.tag, true],
      ["Entry", a.entry, true],
      ["Stop Loss", a.sl, true],
      ["Take Profit", a.tp, true],
      ["Strength", a.strength + "/100", true],
    ]
      .map(function (row) {
        return (
          '<div class="mock-tg-row"><span>' +
          row[0] +
          "</span>" +
          (row[2] ? "<code>" + row[1] + "</code>" : "<strong>" + row[1] + "</strong>") +
          "</div>"
        );
      })
      .join("");

    var stageEl = stage(
      "dnd",
      '<div class="mock-approve">' +
        '<div class="mock-tg">' +
        '<div class="mock-tg-head">' +
        '<span class="mock-tg-avatar" aria-hidden="true">t</span>' +
        '<span class="mock-tg-name">Tradign <em>· Telegram</em></span>' +
        '<span class="mock-tg-badge">Approval mode</span>' +
        "</div>" +
        '<div class="mock-tg-thread" data-tg-thread></div>' +
        "</div>" +
        '<p class="mock-approve-note">Nothing fires without you: the entry waits in your DM.</p>' +
        "</div>",
    );

    await sleep(500);
    var thread = stageEl.querySelector("[data-tg-thread]");
    var msg = el(
      '<div class="mock-tg-msg">' +
        '<p class="mock-tg-title">' +
        esc(strategy.market) +
        " • LONG</p>" +
        rows +
        '<div class="mock-tg-actions">' +
        '<span class="mock-tg-btn mock-tg-btn--primary" data-tg-exec>Execute on exchange ⚡</span>' +
        '<span class="mock-tg-btn" data-tg-paper>Execute on paper 🧪</span>' +
        "</div>" +
        "</div>",
    );
    thread.appendChild(msg);
    settleFadeIn(msg);
    await sleep(1400);

    var execBtn = msg.querySelector("[data-tg-exec]");
    await clickAt(execBtn);
    execBtn.classList.add("mock-tg-btn--done");
    execBtn.textContent = "✓ Executing on " + strategy.exchange;
    await sleep(900);

    var fill = el(
      '<div class="mock-tg-msg mock-tg-msg--fill">' +
        '<p class="mock-tg-fill-line">Approval submitted</p>' +
        '<p class="mock-tg-fill-sub">Venue result and position status return here</p>' +
        "</div>",
    );
    thread.appendChild(fill);
    settleFadeIn(fill);
    await sleep(1700);
  }

  /* ---- act 4: community ---- */
  // Snapshot media variants from the real renderer: win-rate gauge, KPI card.
  function postMedia(media) {
    if (media.kind === "gauge") {
      return (
        '<div class="mock-post-media mock-post-media--sm">' +
        '<div class="mock-gauge">' +
        '<svg viewBox="0 0 36 36"><path class="mock-gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>' +
        '<path class="mock-gauge-fill" style="stroke-dasharray:' +
        media.value +
        ', 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path></svg>' +
        '<span class="mock-gauge-value">' +
        media.value +
        "%</span>" +
        '<span class="mock-gauge-label">Win rate</span>' +
        "</div>" +
        "</div>"
      );
    }
    if (media.kind === "kpi") {
      return (
        '<div class="mock-post-media mock-post-media--sm">' +
        '<div class="mock-kpi">' +
        '<span class="mock-kpi-label">' +
        media.label +
        "</span>" +
        '<strong class="mock-kpi-value">' +
        media.value +
        "</strong>" +
        '<span class="mock-kpi-trend">' +
        media.trend +
        "</span>" +
        "</div>" +
        "</div>"
      );
    }
    return "";
  }

  function compactPost(post) {
    var pills = post.pill
      ? '<div class="mock-post-pills"><span class="mock-post-pill">' +
        post.pill +
        '</span><span class="mock-post-pick">Pick</span></div>'
      : "";
    var reply = post.reply
      ? '<div class="mock-post-reply"><span>@' +
        post.reply.handle +
        "</span><p>" +
        post.reply.text +
        "</p></div>"
      : "";
    return (
      '<article class="mock-post mock-post--compact">' +
      '<div class="mock-post-head">' +
      '<span class="mock-post-handle">@' +
      post.handle +
      "</span>" +
      '<span class="mock-post-time">' +
      post.time +
      "</span>" +
      '<span class="mock-post-type">' +
      post.type +
      "</span>" +
      "</div>" +
      '<p class="mock-post-title">' +
      post.title +
      "</p>" +
      (post.media ? postMedia(post.media) : "") +
      '<p class="mock-post-meta">' +
      post.market +
      " · " +
      post.tf +
      ' · <span class="mock-post-proof">Verify proof</span></p>' +
      pills +
      reply +
      '<div class="mock-post-actions">' +
      actionIcon("like", post.likes) +
      actionIcon("reply", post.replies) +
      '<span class="mock-post-follow">Follow</span>' +
      "</div>" +
      "</article>"
    );
  }

  function featuredPost(strategy) {
    return (
      '<article class="mock-post mock-post--featured">' +
      '<div class="mock-post-head">' +
      '<span class="mock-post-handle mock-post-handle--you">@you</span>' +
      '<span class="mock-post-new">New</span>' +
      '<span class="mock-post-time">Just now</span>' +
      '<span class="mock-post-type">Strategy</span>' +
      "</div>" +
      '<p class="mock-post-body">' +
      esc(strategy.prompt) +
      "</p>" +
      '<div class="mock-post-media">' +
      '<svg viewBox="0 0 200 60" preserveAspectRatio="none"><polyline points="' +
      strategy.curve +
      '"></polyline></svg>' +
      '<span class="mock-post-badge">✓ Proof verified</span>' +
      "</div>" +
      '<p class="mock-post-meta">' +
      strategy.market +
      " · " +
      strategy.timeframe +
      " · Win rate " +
      strategy.backtest.winRate +
      " · PF " +
      strategy.backtest.profitFactor +
      ' · <span class="mock-post-proof">Verify proof</span></p>' +
      '<div class="mock-post-actions">' +
      actionIcon("like", 0) +
      actionIcon("star", 0) +
      actionIcon("reply", 0) +
      "</div>" +
      "</article>"
    );
  }

  async function playCommunity(strategy) {
    setActiveItem("community");
    var stageEl = stage(
      "community",
      '<div class="mock-community">' +
        '<div class="mock-community-tabs">' +
        '<span class="mock-community-tab mock-community-tab--active">For you</span>' +
        '<span class="mock-community-tab">Builders</span>' +
        "</div>" +
        '<div class="mock-community-columns">' +
        '<section class="mock-community-col mock-community-col--main">' +
        '<div class="mock-community-col-head"><span>Just shared</span></div>' +
        "<div data-featured></div>" +
        "</section>" +
        '<section class="mock-community-col">' +
        '<div class="mock-community-col-head"><span>Trending</span><strong>' +
        TRENDING_POSTS.length +
        "</strong></div>" +
        "<div data-trending></div>" +
        "</section>" +
        "</div>" +
        "</div>",
    );

    var featured = el(featuredPost(strategy));
    stageEl.querySelector("[data-featured]").appendChild(featured);
    settleFadeIn(featured);

    var trendingEl = stageEl.querySelector("[data-trending]");
    TRENDING_POSTS.forEach(function (post, i) {
      var card = el(compactPost(post));
      card.style.animationDelay = 120 + i * 90 + "ms";
      trendingEl.appendChild(card);
      settleFadeIn(card, 700);
    });

    // Follow a builder: the community is a loop, not a gallery.
    await sleep(2400);
    var follow = trendingEl.querySelector(".mock-post-follow");
    if (follow) {
      await clickAt(follow);
      follow.classList.add("mock-post-follow--on");
      follow.textContent = "Following";
    }
    await sleep(3200);
  }

  /* ---- static still for reduced motion ---- */
  function renderStatic() {
    var strategy = STRATEGIES[0];
    setActiveItem("deploy");
    var stageEl = stage("dnd", canvasHtml(strategy, true));
    wireLines(stageEl, strategy.graph, true);
    var canvas = stageEl.querySelector("[data-canvas]");
    canvas.classList.add("mock-canvas--panel");
    var deployFlag = stageEl.querySelector('[data-flag="deploy"]');
    deployFlag.classList.add("mock-flag--active", "mock-flag--live");
    deployFlag.querySelector("[data-flag-summary]").textContent = "Active";

    var rows = checklistRows(strategy)
      .map(function (row) {
        return (
          '<div class="mock-check-row" style="opacity:1;transform:none">' +
          '<span class="mock-check-dot"></span>' +
          '<span class="mock-check-label">' +
          row[0] +
          "</span>" +
          '<strong class="mock-check-value">' +
          row[1] +
          "</strong></div>"
        );
      })
      .join("");
    var panel = el(
      '<div class="mock-panel mock-panel--open">' +
        '<div class="mock-panel-head"><span class="mock-panel-kicker">Inspector</span><span class="mock-panel-close">✕</span></div>' +
        '<div class="mock-panel-body">' +
        '<p class="mock-panel-title">Deploy <span class="mock-panel-badge">Ready</span></p>' +
        '<p class="mock-panel-sub">Deployment checklist</p>' +
        '<div class="mock-checklist">' +
        rows +
        "</div>" +
        '<div class="mock-panel-footer">' +
        '<p class="mock-panel-status">Live: entries wait for your Telegram approval</p>' +
        '<span class="mock-deploy-btn mock-deploy-btn--done">✓ Deployed</span>' +
        "</div>" +
        "</div>" +
        "</div>",
    );
    canvas.appendChild(panel);
  }

  /* ---- loop ----
     `data-only` restricts the loop to one act so the same engine can power the
     focused demos on the solution pages: "chat" on /solutions/ai, "graph" on
     /solutions/drag-and-drop, "community" on /solutions/community. Unset (the
     homepage) plays the full four-act sequence. */
  var onlyPhase = root.dataset.only || "";

  async function playLoop() {
    var index = 0;
    while (true) {
      var strategy = STRATEGIES[index % STRATEGIES.length];
      if (onlyPhase === "chat") {
        await playChat(strategy);
      } else if (onlyPhase === "graph") {
        var g1 = await playGraph(strategy);
        await playDeploy(g1, strategy);
      } else if (onlyPhase === "community") {
        await playCommunity(strategy);
      } else {
        await playChat(strategy);
        var stageEl = await playGraph(strategy);
        await playDeploy(stageEl, strategy);
        if (strategy.approval) await playApproval(strategy);
        await playCommunity(strategy);
      }
      index++;
    }
  }

  if (reduceMotion) {
    renderStatic();
    return;
  }

  // Start on first sight so viewers always enter at act 1; pause off-screen.
  var started = false;
  function handleVisibility(isVisible) {
    demoVisible = isVisible;
    if (!isVisible) return;
    visibilityWaiters.splice(0).forEach(function (resolve) {
      resolve();
    });
    if (!started) {
      started = true;
      playLoop();
    }
  }
  if ("IntersectionObserver" in window) {
    var ioDelivered = false;
    var io = new IntersectionObserver(
      function (entries) {
        ioDelivered = true;
        handleVisibility(entries[0].isIntersecting);
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    // The spec guarantees an initial entry right after observe(). If the
    // environment never delivers one (broken/stubbed observer), degrade to
    // always-visible so the demo can never end up as a blank frame.
    setTimeout(function () {
      if (!ioDelivered) {
        io.disconnect();
        handleVisibility(true);
      }
    }, 1500);
  } else {
    handleVisibility(true);
  }
})();
