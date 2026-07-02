/* =============================================================================
   Abrar Samin — Portfolio · script.js  (vanilla JS, no dependencies)
   Features:
     · Dark / light theme toggle (persisted)      · Scroll-reveal animations
     · Mobile navigation drawer                    · Active-link scroll spy
     · Typing effect in the hero                   · Publication filtering
     · Copy-citation buttons                       · Scroll-to-top button
     · Contact form → mailto composer             · Dynamic footer year
   ========================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* --------------------------- 1. Theme toggle ---------------------------- */
  var themeToggle = $("#theme-toggle");
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "light"; }
  function applyTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    // Only persist on an explicit user action; a system-derived boot theme must
    // stay non-sticky so the page keeps following OS light/dark changes.
    if (persist) { try { localStorage.setItem("theme", theme); } catch (e) {} }
    if (themeToggle) {
      var next = theme === "dark" ? "light" : "dark";
      themeToggle.setAttribute("aria-label", "Switch to " + next + " theme");
    }
  }
  if (themeToggle) {
    applyTheme(currentTheme(), false); // sync the aria-label to the boot theme (no persist)
    themeToggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  /* ------------------------- 2. Mobile navigation ------------------------- */
  var header = $(".site-header");
  var navToggle = $("#nav-toggle");
  var navMenu = $("#nav-menu");
  function closeNav() {
    if (!header) return;
    header.classList.remove("nav-open");
    if (navToggle) { navToggle.setAttribute("aria-expanded", "false"); navToggle.setAttribute("aria-label", "Open menu"); }
  }
  function toggleNav() {
    var open = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (navToggle && header) {
    navToggle.addEventListener("click", toggleNav);
    // Close when a link is tapped, on Escape, or when clicking outside the header
    $$(".nav-link", navMenu).forEach(function (link) { link.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    document.addEventListener("click", function (e) {
      if (header.classList.contains("nav-open") && !header.contains(e.target)) closeNav();
    });
  }

  /* --------------------------- 3. Typing effect --------------------------- */
  var typingEl = $("#typing");
  if (typingEl) {
    var roles = [
      "Computer Science graduate",
      "AI/ML researcher",
      "computer vision enthusiast",
      "teaching assistant",
      "lifelong learner"
    ];
    if (prefersReducedMotion) {
      typingEl.textContent = roles[0] + ".";
    } else {
      var rIndex = 0, cIndex = 0, deleting = false;
      var typeLoop = function () {
        var word = roles[rIndex];
        typingEl.textContent = word.substring(0, cIndex);
        var delay;
        if (!deleting) {
          cIndex++;
          delay = 70;
          if (cIndex > word.length) { deleting = true; delay = 1500; } // pause at full word
        } else {
          cIndex--;
          delay = 38;
          if (cIndex === 0) { deleting = false; rIndex = (rIndex + 1) % roles.length; delay = 350; }
        }
        window.setTimeout(typeLoop, delay);
      };
      typeLoop();
    }
  }

  /* ----------------------- 4. Scroll-reveal (IO) -------------------------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* --------------------- 5. Active-link scroll spy ------------------------ */
  var navLinks = $$(".nav-link");
  var linkById = {};
  var spySections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    var section = document.getElementById(id);
    if (section) { linkById[id] = link; spySections.push(section); }
  });
  function setActive(id) {
    navLinks.forEach(function (l) { l.classList.remove("active"); l.removeAttribute("aria-current"); });
    if (linkById[id]) { linkById[id].classList.add("active"); linkById[id].setAttribute("aria-current", "true"); }
  }
  if ("IntersectionObserver" in window && spySections.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
    spySections.forEach(function (s) { spyIO.observe(s); });
  }

  /* ----------------------- 6. Publication filtering ----------------------- */
  var filterBtns = $$(".filter-btn");
  var pubCards = $$(".pub-card");
  var pubEmpty = $(".pub-empty");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("is-active"); btn.setAttribute("aria-pressed", "true");
      var shown = 0;
      pubCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-type") === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      if (pubEmpty) pubEmpty.hidden = shown !== 0;
    });
  });

  /* ------------------------- 7. Copy citation ----------------------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta); resolve();
      } catch (e) { reject(e); }
    });
  }
  var citeStatus = $("#cite-status");
  $$(".cite-copy").forEach(function (btn) {
    var label = $(".cite-label", btn);
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-citation") || "").then(function () {
        btn.classList.add("copied");
        if (label) label.textContent = "Copied!";
        if (citeStatus) citeStatus.textContent = "Citation copied to clipboard.";
        window.setTimeout(function () { btn.classList.remove("copied"); if (label) label.textContent = "Copy citation"; }, 2000);
      }).catch(function () {
        if (label) label.textContent = "Press Ctrl/Cmd+C";
        if (citeStatus) citeStatus.textContent = "Copy failed — press Ctrl or Cmd + C to copy.";
      });
    });
  });

  /* --------------- 8. Scroll-driven UI (header + to-top) ------------------ */
  var toTop = $("#to-top");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------- 9. Contact form → mailto ------------------------ */
  var form = $("#contact-form");
  if (form) {
    var note = $("#form-note");
    var EMAIL = "rsgidristee@gmail.com";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // NB: use getElementById — `form.name` resolves to the form's own `name`
      // property, not the <input name="name">, so read the fields explicitly.
      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var message = document.getElementById("cf-message").value.trim();
      if (!name || !email || !message) {
        if (note) { note.textContent = "Please fill in your name, email, and a message."; note.className = "form-note err"; }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (note) { note.textContent = "That email address doesn't look right."; note.className = "form-note err"; }
        return;
      }
      var subject = "Portfolio enquiry from " + name;
      var body = message + "\n\n— " + name + " (" + email + ")";
      var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      window.location.href = href;
      if (note) { note.textContent = "Opening your email app…"; note.className = "form-note ok"; }
      form.reset();
    });
  }

  /* --------------------------- 10. Footer year ---------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
