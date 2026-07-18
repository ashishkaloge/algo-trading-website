// Shared Tradign site shell.
// Keeps the static pages no-build and file:// friendly while avoiding copied
// header/footer markup across every generated page.
(function () {
  "use strict";

  var navGroups = [
    {
      title: "Platform",
      base: "platform",
      items: [
        ["About us", "Why Tradign exists", "platform/about/index.html"],
        ["Plans", "Free to build, pay to go live", "platform/plans/index.html"],
        ["System", "Reliability and status", "platform/system/index.html"],
        [
          "Security",
          "Keys, custody and approvals",
          "platform/security/index.html",
        ],
        [
          "Exchanges",
          "Binance, Bybit, OKX, Bitget, KuCoin",
          "platform/exchanges/index.html",
        ],
      ],
    },
    {
      title: "Solutions",
      base: "solutions",
      items: [
        ["AI", "Plain English to strategy", "solutions/ai/index.html"],
        [
          "AI Agents",
          "Agents that watch your strategies",
          "solutions/ai-agents/index.html",
          "Soon",
        ],
        [
          "Drag & drop",
          "Visual strategy builder",
          "solutions/drag-and-drop/index.html",
        ],
        [
          "Community",
          "Strategies with verified proof",
          "solutions/community/index.html",
        ],
      ],
    },
    {
      title: "Resources",
      base: "resources",
      items: [
        ["Docs", "How everything works", "resources/docs/index.html"],
        ["Guides", "From idea to live strategy", "resources/guides/index.html"],
        ["FAQ", "Questions traders ask first", "resources/faq/index.html"],
        ["Changelog", "What shipped lately", "resources/changelog/index.html"],
      ],
    },
  ];

  var footerGroups = [
    ["Platform", navGroups[0].items],
    ["Solutions", navGroups[1].items],
    [
      "Resources",
      navGroups[2].items.concat([
        ["Proof", "", "https://tradign.com/proof", "", true],
      ]),
    ],
  ];

  function currentPrefix() {
    var script =
      document.currentScript ||
      document.querySelector('script[src*="site.js"]');
    var src = script ? script.getAttribute("src") || "" : "";
    src = src.split("#")[0].split("?")[0];
    return src.replace(/_landing\/js\/site\.js$/, "");
  }

  var prefix = currentPrefix();

  function pagePath() {
    var path = window.location.pathname.replace(/\/$/, "/index.html");
    return decodeURIComponent(path);
  }

  function isCurrent(path) {
    if (/^https?:\/\//.test(path)) return false;
    var current = pagePath();
    return current.endsWith("/" + path) || current.endsWith(path);
  }

  function href(path) {
    return /^https?:\/\//.test(path) ? path : prefix + path;
  }

  function externalAttrs(path) {
    return /^https?:\/\//.test(path) ? ' target="_blank" rel="noopener"' : "";
  }

  function caretSvg() {
    return (
      '<svg class="nav-caret" viewBox="0 0 24 24" aria-hidden="true">' +
      '<polyline points="6 9 12 15 18 9"></polyline></svg>'
    );
  }

  function labelWithBadge(label, badge) {
    return label + (badge ? '<em class="nav-soon">' + badge + "</em>" : "");
  }

  function renderNavGroup(group) {
    var current = group.items.some(function (item) {
      return isCurrent(item[2]);
    });
    var links = group.items
      .map(function (item) {
        var active = isCurrent(item[2]);
        return (
          '<a class="nav-panel-link' +
          (active ? " nav-panel-link--current" : "") +
          '" href="' +
          href(item[2]) +
          '"' +
          (active ? ' aria-current="page"' : "") +
          ">" +
          '<span class="nav-panel-label">' +
          labelWithBadge(item[0], item[3]) +
          "</span>" +
          '<span class="nav-panel-desc">' +
          item[1] +
          "</span></a>"
        );
      })
      .join("");

    return (
      '<div class="nav-item' +
      (current ? " nav-item--current" : "") +
      '" data-nav-item>' +
      '<button class="nav-trigger" type="button" aria-expanded="false" data-nav-trigger>' +
      group.title +
      caretSvg() +
      "</button>" +
      '<div class="nav-panel">' +
      '<span class="nav-panel-title">' +
      group.title +
      "</span>" +
      links +
      "</div></div>"
    );
  }

  function renderHeader(root) {
    root.classList.add("header");
    root.innerHTML =
      '<a class="skip-link" href="#main-content">Skip to content</a>' +
      '<div class="header-inner container">' +
      '<a class="logo" href="' +
      href("index.html") +
      '">tradign<span class="logo-tld">.com</span></a>' +
      '<nav class="nav" aria-label="Main">' +
      navGroups.map(renderNavGroup).join("") +
      '<a class="nav-link' +
      (isCurrent("platform/plans/index.html") ? " nav-link--current" : "") +
      '" href="' +
      href("platform/plans/index.html") +
      '"' +
      (isCurrent("platform/plans/index.html") ? ' aria-current="page"' : "") +
      '>Pricing</a>' +
      '<a class="nav-link" href="https://tradign.com/proof" target="_blank" rel="noopener">Proof</a>' +
      '<a class="nav-cta button button-light" href="https://tradign.com/ai" target="_blank" rel="noopener">Start building</a>' +
      "</nav>" +
      '<button class="nav-burger" type="button" data-nav-burger aria-label="Open menu" aria-expanded="false">' +
      '<svg class="nav-burger-lines" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"></path></svg>' +
      '<svg class="nav-burger-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>' +
      "</button>" +
      "</div>";
  }

  function renderFooterLink(item) {
    return (
      '<a href="' +
      href(item[2]) +
      '"' +
      externalAttrs(item[2]) +
      ">" +
      labelWithBadge(item[0], item[3]) +
      "</a>"
    );
  }

  function renderFooter(root) {
    root.classList.add("footer");
    root.innerHTML =
      '<div class="container">' +
      '<div class="footer-top">' +
      '<div class="footer-brand">' +
      '<a class="logo" href="' +
      href("index.html") +
      '">tradign<span class="logo-tld">.com</span></a>' +
      '<p class="footer-tag">The AI for traders. Plain English in, running strategy out.</p>' +
      '<a class="button button-light" href="https://tradign.com/ai" target="_blank" rel="noopener">Start building</a>' +
      "</div>" +
      '<div class="footer-cols">' +
      footerGroups
        .map(function (group) {
          return (
            '<div class="footer-col"><span class="footer-col-title">' +
            group[0] +
            "</span>" +
            group[1].map(renderFooterLink).join("") +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      "</div>" +
      '<div class="footer-word" aria-hidden="true">tradign</div>' +
      '<div class="footer-base">' +
      "<span>&copy; 2026 Tradign. All rights reserved.</span>" +
      '<span class="footer-base-links">' +
      '<a href="' +
      href("legal/privacy/index.html") +
      '">Privacy policy</a>' +
      '<a href="' +
      href("legal/terms/index.html") +
      '">Terms &amp; conditions</a>' +
      '<a href="' +
      href("legal/risk/index.html") +
      '">Risk disclosure</a>' +
      '<a href="https://t.me/tradign_free" target="_blank" rel="noopener">Telegram</a>' +
      '<a href="https://tradign.com/help" target="_blank" rel="noopener">Contact</a>' +
      '<a href="https://tradign.com/proof" target="_blank" rel="noopener">Verify proof</a>' +
      "</span>" +
      "</div>" +
      "</div>";
  }

  function initAuthAwareCtas() {
    var host = window.location.hostname;
    if (host !== "tradign.com" && host !== "www.tradign.com") return;
    if (!window.fetch) return;

    var links = [].slice.call(
      document.querySelectorAll('a[href="https://tradign.com/ai"]'),
    );
    if (!links.length) return;

    function pointToAuth() {
      links.forEach(function (link) {
        link.setAttribute("href", "https://tradign.com/auth");
      });
    }

    function hasSessionHint() {
      try {
        if (document.cookie) return true;
        var storageKeys = [];
        if (window.localStorage) {
          for (var i = 0; i < window.localStorage.length; i += 1) {
            storageKeys.push(window.localStorage.key(i) || "");
          }
        }
        if (window.sessionStorage) {
          for (var j = 0; j < window.sessionStorage.length; j += 1) {
            storageKeys.push(window.sessionStorage.key(j) || "");
          }
        }
        return storageKeys.some(function (key) {
          return /auth|session|tradign/i.test(key);
        });
      } catch (error) {
        return false;
      }
    }

    if (!hasSessionHint()) {
      pointToAuth();
      return;
    }

    fetch("/api/v1/auth/me", {
      credentials: "include",
      cache: "no-store",
    })
      .then(function (res) {
        if (res.ok) return;
        pointToAuth();
      })
      .catch(function () {
        // Leave CTAs on /ai; the app can still handle auth redirects.
      });
  }

  function initHeader(root) {
    var items = [].slice.call(root.querySelectorAll("[data-nav-item]"));
    var burger = root.querySelector("[data-nav-burger]");
    var hoverCapable =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove("nav-item--open");
        item
          .querySelector("[data-nav-trigger]")
          .setAttribute("aria-expanded", "false");
      });
    }

    items.forEach(function (item) {
      var trigger = item.querySelector("[data-nav-trigger]");
      trigger.addEventListener("click", function (event) {
        if (hoverCapable) return;
        event.stopPropagation();
        var open = item.classList.toggle("nav-item--open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        closeAll(item);
      });
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) closeAll(null);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeAll(null);
      if (root.classList.contains("header--open")) {
        root.classList.remove("header--open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
      }
    });

    burger.addEventListener("click", function () {
      var open = root.classList.toggle("header--open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  var main = document.querySelector("main");
  if (main) {
    if (!main.id) main.id = "main-content";
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
  }

  var header = document.querySelector("[data-site-header]");
  if (header) {
    renderHeader(header);
    initHeader(header);
  }

  var footer = document.querySelector("[data-site-footer]");
  if (footer) renderFooter(footer);

  initAuthAwareCtas();
})();
