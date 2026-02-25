(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Header offset sync (used by nav positioning + hero height)
  const headerEl = $(".header");
  const syncHeaderOffset = () => {
    if (!headerEl) return;
    document.documentElement.style.setProperty("--header-offset", `${headerEl.offsetHeight}px`);
  };
  syncHeaderOffset();
  window.addEventListener("resize", syncHeaderOffset);

  // Mobile menu (overlay + close patterns)
  const navEl = $("#siteNav");
  const navToggleEl = $("#navToggle");
  const MOBILE_BREAKPOINT = 760;

  // Backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  backdrop.hidden = true;
  document.body.appendChild(backdrop);

  const setMenuState = (open) => {
    if (!navEl || !navToggleEl) return;
    navEl.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    navToggleEl.setAttribute("aria-expanded", open ? "true" : "false");
    navToggleEl.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    backdrop.hidden = !open;
    backdrop.classList.toggle("is-open", open);
    syncHeaderOffset();
  };

  const closeMenu = () => setMenuState(false);

  if (navEl && navToggleEl) {
    navToggleEl.addEventListener("click", () => {
      const open = navEl.classList.contains("is-open");
      setMenuState(!open);
    });

    backdrop.addEventListener("click", closeMenu);

    // Close on nav click (mobile)
    $$("a", navEl).forEach((a) => a.addEventListener("click", () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) closeMenu();
    }));

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Resize to desktop closes
    window.addEventListener("resize", () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu();
    });

    // Click outside closes
    document.addEventListener("click", (e) => {
      if (!navEl.classList.contains("is-open")) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest("#siteNav")) return;
      if (t.closest("#navToggle")) return;
      closeMenu();
    });
  }

  // Reveal animations
  const revealTargets = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${(i % 6) * 70}ms`);
      observer.observe(el);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  // Form validation (frontend only; wire to backend endpoint when ready)
  const form = $("#quoteForm");
  const note = $("#formNote");

  const setError = (fieldName, message) => {
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.textContent = message || "";
  };

  const isEmailValid = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const email = String(data.get("email") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();

      ["name", "phone", "email", "service", "message"].forEach((k) => setError(k, ""));

      let ok = true;
      if (name.length < 2) { setError("name", "Please enter your full name."); ok = false; }
      if (phone.length < 7) { setError("phone", "Please enter a valid phone / WhatsApp number."); ok = false; }
      if (!isEmailValid(email)) { setError("email", "Please enter a valid email address."); ok = false; }
      if (!service) { setError("service", "Please select a service."); ok = false; }
      if (message.length < 10) { setError("message", "Please add a short brief (at least 10 characters)."); ok = false; }

      if (!ok) {
        if (note) note.textContent = "Please fix the highlighted fields and submit again.";
        return;
      }

      if (note) note.textContent = "Submitting...";

      try {
        // TODO: Replace with your real endpoint, e.g. Cloudflare Pages Functions / Workers
        // await fetch("/api/quote", { method: "POST", body: data });

        await new Promise((r) => setTimeout(r, 450));
        form.reset();
        if (note) note.textContent = "Submitted successfully. We’ll reach out shortly with a clear plan.";
      } catch {
        if (note) note.textContent = "Submission failed. Please call/WhatsApp us instead.";
      }
    });
  }

})();
