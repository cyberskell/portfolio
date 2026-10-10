(function () {
  "use strict";

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll-spy active nav link ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var linkMap = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    linkMap[a.getAttribute("href").replace("#", "")] = a;
  });

  function onScrollSpy() {
    var scrollPos = window.scrollY + 120;
    var current = sections[0] && sections[0].id;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    Object.keys(linkMap).forEach(function (id) {
      linkMap[id].classList.toggle("is-active", id === current);
    });
  }
  window.addEventListener("scroll", onScrollSpy, { passive: true });
  onScrollSpy();

  /* ---------- hero network diagram: draw-in animation ---------- */
  function animateTopology() {
    var links = document.querySelectorAll(".topo .link");
    links.forEach(function (path, i) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      // force reflow so the browser registers the starting state before transitioning
      path.getBoundingClientRect();
      setTimeout(function () {
        path.style.strokeDashoffset = "0";
      }, 120 + i * 160);
    });
  }
  if (document.querySelector(".topo")) {
    if (document.readyState === "complete") {
      animateTopology();
    } else {
      window.addEventListener("load", animateTopology);
    }
  }

  /* ---------- contact form (static-site friendly mailto fallback) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = "Please fill in every field before sending.";
        status.className = "form-status err";
        return;
      }

      var subject = encodeURIComponent("Portfolio contact from " + name);
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      var mailto = "mailto:ehas2026@gmail.com?subject=" + subject + "&body=" + body;

      window.location.href = mailto;
      status.textContent = "Opening your email client…";
      status.className = "form-status ok";
    });
  }
})();
