/**
 * Portfolio — Ephraim Wayanga Bolingo
 * script.js — Vanilla ES6, aucune dépendance externe.
 *
 * Organisation par responsabilité :
 *   01. initSite              — point d'entrée
 *   02. initHeroEntrance      — chorégraphie d'apparition du Hero au chargement
 *   03. initScrollReveals     — révélations au scroll via Intersection Observer
 *   04. initHeaderBehavior    — header intelligent (hide on scroll down / reveal up)
 *   05. initActiveNav         — lien de navigation actif selon la section visible
 *   06. initMobileMenu        — menu mobile plein écran
 *   07. initContactLinks      — construit dynamiquement les liens de contact depuis .env
 *   08. initSmoothAnchors     — défilement doux vers les ancres internes
 *   09. initFooterYear        — année dynamique du footer
 *   10. initReducedMotion     — respect de prefers-reduced-motion
 */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     01 — Initialisation
     --------------------------------------------------------- */
  function initSite() {
    const doc = document.documentElement;
    // Marque le document comme prêt pour déclencher les animations du Hero
    requestAnimationFrame(() => doc.classList.add("is-ready"));

    initHeroEntrance();
    initScrollReveals();
    initHeaderBehavior();
    initActiveNav();
    initMobileMenu();
    initContactLinks();
    initBrevets();
    initSmoothAnchors();
    initFooterYear();
  }

  /* ---------------------------------------------------------
     07b — Miniatures de brevets — overlay d'agrandissement
     Agrandit l'image au survol / clic et l'affiche centrée.
     --------------------------------------------------------- */
  function initBrevets() {
    const thumbnails = document.querySelectorAll('.brevet__thumb');
    if (!thumbnails.length) return;

    // Création de l'overlay global
    const overlay = document.createElement('div');
    overlay.className = 'brevet-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<img alt="Aperçu agrandi" />';
    document.body.appendChild(overlay);
    const overlayImg = overlay.querySelector('img');

    function show(src) {
      overlayImg.src = src;
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
    }

    function hide() {
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      overlayImg.src = '';
    }

    thumbnails.forEach((img) => {
      const src = img.dataset.full || img.src;
      img.addEventListener('focus', () => show(src));
      img.addEventListener('blur', hide);
      // Pour les écrans tactiles et la souris : ouverture au clic
      img.addEventListener('click', (e) => {
        e.preventDefault();
        show(src);
      });
    });

    // Clic sur l'overlay pour fermer
    overlay.addEventListener('click', hide);
    // Échapp pour fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-visible')) hide();
    });
  }

  /* ---------------------------------------------------------
     02 — Chorégraphie d'apparition du Hero
     Les délais sont lus depuis l'attribut data-delay (en ms)
     afin d'éviter toute sensation mécanique.
     --------------------------------------------------------- */
  function initHeroEntrance() {
    initHeroNameAnimation();

    const els = document.querySelectorAll("[data-hero]");
    if (!els.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    els.forEach((el) => {
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });
    // .is-ready sur <html> déclenche les transitions CSS.
    if (reduce) document.documentElement.classList.add("is-ready");
  }

  function initHeroNameAnimation() {
    const heroName = document.querySelector('.hero__name');
    if (!heroName) return;

    heroName.querySelectorAll('.ln').forEach((line, lineIndex) => {
      const text = line.textContent.trim();
      line.innerHTML = '';

      [...text].forEach((char, charIndex) => {
        const span = document.createElement('span');
        span.className = 'hero__char';
        span.textContent = char;

        const offsetX = Math.round((Math.random() - 0.5) * 260);
        const offsetY = Math.round((Math.random() - 0.5) * 220);
        const rotation = Math.round((Math.random() - 0.5) * 40);
        const isI = char.toLowerCase() === 'i';
        const delay = 220 + charIndex * 50 + lineIndex * 70 + (isI ? 140 : 0);

        if (isI) {
          span.classList.add('hero__char--i-bounce');
        }

        span.style.setProperty('--offset-x', `${offsetX}px`);
        span.style.setProperty('--offset-y', `${isI ? offsetY - 120 : offsetY}px`);
        span.style.setProperty('--rotate-start', `${rotation}deg`);
        span.style.setProperty('--delay', `${delay}ms`);

        line.appendChild(span);
      });
    });
  }

  /* ---------------------------------------------------------
     03 — Révélations au scroll (Intersection Observer)
     Transforme exclusivement opacity + transform (GPU).
     --------------------------------------------------------- */
  function initScrollReveals() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
            if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    els.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     04 — Header intelligent
     Disparaît au scroll vers le bas, réapparaît vers le haut.
     --------------------------------------------------------- */
  function initHeaderBehavior() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;
    const threshold = 8;

    function update() {
      const y = window.scrollY;
      if (y > lastY + threshold && y > 120) {
        header.classList.add("is-hidden");
      } else if (y < lastY - threshold || y < 60) {
        header.classList.remove("is-hidden");
      }
      header.classList.toggle("is-scrolled", y > 24);
      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     05 — Lien de navigation actif selon la section visible
     --------------------------------------------------------- */
  function initActiveNav() {
    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll(".nav__link[data-nav]");
    if (!sections.length || !links.length) return;

    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute("data-nav");
      if (id) map.set(id, link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            const link = map.get(entry.target.id);
            if (link) link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* ---------------------------------------------------------
     06 — Menu mobile plein écran
     --------------------------------------------------------- */
  function initMobileMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function open() {
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });

    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", close)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });
  }

  /* ---------------------------------------------------------
     07 — Liens de contact construits depuis les variables d'environnement
     Les valeurs ne sont jamais codées en dur dans le HTML.
     Vite expose les variables préfixées par VITE_ sur import.meta.env.
     Un fallback window.__ENV permet une surcharge éventuelle.
     --------------------------------------------------------- */
  function initContactLinks() {
    // Lecture des variables publiques (Vite les inline au build).
    const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
    const win = window.__ENV || {};

    const data = {
      phone:    env.VITE_PHONE    || win.PHONE    || "",
      whatsapp: env.VITE_WHATSAPP || win.WHATSAPP || "",
      facebook: env.VITE_FACEBOOK || win.FACEBOOK || "",
      linkedin: env.VITE_LINKEDIN || win.LINKEDIN || "",
      github:   env.VITE_GITHUB   || win.GITHUB   || "",
      email:    env.VITE_EMAIL    || win.EMAIL    || "",
    };

    const links = document.querySelectorAll("[data-contact]");
    links.forEach((slot) => {
      const key = slot.getAttribute("data-contact");
      const value = data[key];
      const anchor = slot.querySelector("a");
      if (!anchor) return;

      if (!value) {
        // Affiche les canaux même si aucune valeur n'est renseignée,
        // pour éviter une section totalement vide.
        anchor.setAttribute("href", "#");
        return;
      }

      const href = buildContactHref(key, value);
      anchor.setAttribute("href", href);
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");

      // Pour certains canaux, on affiche la valeur lisible de façon discrète.
      const valueEl = slot.querySelector("[data-contact-value]");
      if (valueEl) valueEl.textContent = displayValue(key, value);
    });
  }

  /** Construit l'URL appropriée pour chaque canal de contact. */
  function buildContactHref(key, value) {
    switch (key) {
      case "phone":
        return `tel:${value.replace(/\s+/g, "")}`;
      case "whatsapp": {
        const num = value.replace(/[^\d]/g, "");
        return `https://wa.me/${num}`;
      }
      case "email":
        return `mailto:${value}`;
      default:
        return value.startsWith("http") ? value : `https://${value}`;
    }
  }

  /** Affichage discret de la valeur (masque partiellement le téléphone). */
  function displayValue(key, value) {
    if (key === "phone") {
      // Conserve le format lisible sans tout révéler dans le DOM texte.
      return value;
    }
    if (key === "email") return value;
    // Pour les réseaux sociaux, on affiche seulement le dernier segment.
    if (["facebook", "linkedin", "github"].includes(key)) {
      const parts = value.replace(/\/$/, "").split("/");
      return parts[parts.length - 1] || value;
    }
    if (key === "whatsapp") return value;
    return value;
  }

  /* ---------------------------------------------------------
     08 — Ancres internes — défilement doux natif
     (scroll-behavior: smooth gère le CSS ; on ajoute la fermeture
      du menu mobile et le focus pour l'accessibilité clavier).
     --------------------------------------------------------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Déplace le focus pour l'accessibilité sans rechasser le scroll.
        window.setTimeout(() => {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, 400);
      });
    });
  }

  /* ---------------------------------------------------------
     09 — Année dynamique du footer
     --------------------------------------------------------- */
  function initFooterYear() {
    const els = document.querySelectorAll("[data-year]");
    const year = new Date().getFullYear();
    els.forEach((el) => (el.textContent = String(year)));
  }

  /* ---------------------------------------------------------
     10 — Préférences d'accessibilité (respect via CSS principalement)
     On force la visibilité des éléments si reduced-motion.
     --------------------------------------------------------- */
  function initReducedMotion() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      document.querySelectorAll("[data-reveal], [data-hero]").forEach((el) => {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------------------------------------------------------
     Démarrage — après le DOM, et une fois le reduced-motion vérifié.
     --------------------------------------------------------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initSite();
      initReducedMotion();
    });
  } else {
    initSite();
    initReducedMotion();
  }
})();
