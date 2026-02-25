(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const headerEl = document.querySelector(".header");
  const heroEl = document.querySelector(".hero");

  if (headerEl) {
    const syncHeaderOffset = () => {
      document.documentElement.style.setProperty("--header-offset", `${headerEl.offsetHeight}px`);
    };
    syncHeaderOffset();
    window.addEventListener("resize", syncHeaderOffset);
  }

  if (headerEl && heroEl) {
    const syncHeaderTheme = () => {
      const switchPoint = Math.max(40, heroEl.offsetHeight - headerEl.offsetHeight - 10);
      const isLight = window.scrollY > switchPoint;
      headerEl.classList.toggle("header--light", isLight);
    };

    syncHeaderTheme();
    window.addEventListener("scroll", syncHeaderTheme, { passive: true });
    window.addEventListener("resize", syncHeaderTheme);
  }

  // Basic form validation (client-side)
  const form = document.getElementById("quoteForm");
  const note = document.getElementById("formNote");

  function setError(fieldName, message) {
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function isEmailValid(email) {
    if (!email) return true; // optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const email = String(data.get("email") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();

      // reset errors
      ["name", "phone", "email", "service", "message"].forEach((k) => setError(k, ""));

      let ok = true;

      if (name.length < 2) { setError("name", "Please enter your full name."); ok = false; }
      if (phone.length < 7) { setError("phone", "Please enter a valid phone / WhatsApp number."); ok = false; }
      if (!isEmailValid(email)) { setError("email", "Please enter a valid email address."); ok = false; }
      if (!service) { setError("service", "Please select a service."); ok = false; }
      if (message.length < 10) { setError("message", "Please add a short message (at least 10 characters)."); ok = false; }

      if (!ok) {
        if (note) note.textContent = "Please fix the highlighted fields and submit again.";
        return;
      }

      // Demo submission (replace with your backend endpoint)
      // Options:
      // - Cloudflare Pages Functions / Workers endpoint
      // - Formspree / Getform
      // - Your own server API
      if (note) note.textContent = "Submitting...";

      try {
        // Example placeholder:
        // await fetch("/api/quote", { method: "POST", body: data });

        // For now: simulate success
        await new Promise((r) => setTimeout(r, 600));
        form.reset();
        if (note) note.textContent = "Submitted successfully. Weâ€™ll reach out shortly with a clear plan.";
      } catch (err) {
        if (note) note.textContent = "Submission failed. Please call/WhatsApp us instead.";
      }
    });
  }

  // Gentle reveal animation on scroll
  const revealTargets = document.querySelectorAll(
    ".hero__content, .section-media, .card, .tool, .step, .price, .info-card"
  );

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }
})();

(() => {
  const hero = document.querySelector(".hero");
  const messageEl = document.getElementById("heroMessage");
  const titleEl = document.getElementById("heroTitle");
  const textEl = document.getElementById("heroText");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  const dots = Array.from(document.querySelectorAll(".hero__dot"));

  if (!hero || !messageEl || !titleEl || !textEl || !prevBtn || !nextBtn || dots.length !== 4) return;

  const slides = [
    {
      title: "We bring cutting-edge digital solutions to life.",
      text: "Websites, marketing, training, and production — fused into one execution engine. We help businesses and individuals look credible, operate smarter, and grow faster.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80"
    },
    {
      title: "We design digital experiences that convert.",
      text: "Every website, campaign, and piece of content is structured to drive clear outcomes — stronger trust, higher engagement, and measurable business growth across your digital channels.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80"
    },
    {
      title: "We build platforms you can rely on.",
      text: "Our solutions are engineered for performance, stability, and basic security best practices, ensuring your digital presence remains dependable as your operations and audience scale.",
      image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1800&q=80"
    },
    {
      title: "We help you scale with clarity and confidence.",
      text: "From launch to continuous improvement, we provide the structure, tools, and support needed to evolve your digital presence as your goals, market, and organization grow.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80"
    }
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const FADE_MS = 420;
  const AUTOPLAY_MS = 10000;
  const RESUME_AFTER_MS = 10000;

  let current = 0;
  let autoplayId = null;
  let resumeId = null;
  let hoverPaused = false;
  let inView = true;
  let resizeId = null;

  function setDots(index) {
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function applySlide(index, { animate = true } = {}) {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];

    const update = () => {
      titleEl.textContent = slide.title;
      textEl.textContent = slide.text;
      hero.style.backgroundImage = `url("${slide.image}")`;
      setDots(current);
    };

    if (!animate || reduceMotion.matches) {
      update();
      return;
    }

    messageEl.classList.add("is-fading");
    window.setTimeout(() => {
      update();
      messageEl.classList.remove("is-fading");
    }, FADE_MS);
  }

  function next(opts) {
    applySlide(current + 1, opts);
  }

  function prev(opts) {
    applySlide(current - 1, opts);
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    if (reduceMotion.matches || autoplayId || hoverPaused || !inView) return;
    autoplayId = window.setInterval(() => next({ animate: true }), AUTOPLAY_MS);
  }

  function pauseAndResumeLater() {
    stopAutoplay();
    window.clearTimeout(resumeId);
    resumeId = window.setTimeout(() => {
      if (!hoverPaused && inView && !reduceMotion.matches) startAutoplay();
    }, RESUME_AFTER_MS);
  }

  function computeMinHeight() {
    const initialTitle = titleEl.textContent;
    const initialText = textEl.textContent;
    const hadFade = messageEl.classList.contains("is-fading");
    messageEl.classList.remove("is-fading");

    let max = 0;
    slides.forEach((slide) => {
      titleEl.textContent = slide.title;
      textEl.textContent = slide.text;
      max = Math.max(max, messageEl.offsetHeight);
    });

    titleEl.textContent = initialTitle;
    textEl.textContent = initialText;
    if (hadFade) messageEl.classList.add("is-fading");
    messageEl.style.minHeight = `${max}px`;
  }

  prevBtn.addEventListener("click", () => {
    prev({ animate: true });
    pauseAndResumeLater();
  });

  nextBtn.addEventListener("click", () => {
    next({ animate: true });
    pauseAndResumeLater();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = Number(dot.dataset.slide);
      if (!Number.isNaN(target)) applySlide(target, { animate: true });
      pauseAndResumeLater();
    });
  });

  document.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const isTyping =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable);

    if (isTyping) return;

    if (event.key === "ArrowLeft") {
      prev({ animate: true });
      pauseAndResumeLater();
    } else if (event.key === "ArrowRight") {
      next({ animate: true });
      pauseAndResumeLater();
    }
  });

  messageEl.addEventListener("mouseenter", () => {
    hoverPaused = true;
    stopAutoplay();
  });

  messageEl.addEventListener("mouseleave", () => {
    hoverPaused = false;
    if (!reduceMotion.matches && inView) startAutoplay();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView) {
            if (!reduceMotion.matches && !hoverPaused) startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(hero);
  }

  const onMotionChange = () => {
    stopAutoplay();
    window.clearTimeout(resumeId);
    if (!reduceMotion.matches && inView && !hoverPaused) startAutoplay();
  };

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", onMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(onMotionChange);
  }

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeId);
    resizeId = window.setTimeout(computeMinHeight, 120);
  });

  slides.forEach((slide) => {
    const img = new Image();
    img.src = slide.image;
  });

  applySlide(0, { animate: false });
  computeMinHeight();
  if (!reduceMotion.matches) startAutoplay();
})();

