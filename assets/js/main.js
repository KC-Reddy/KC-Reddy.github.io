(function () {
  "use strict";

  /**
   * Preloader
   */
  var preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      preloader.style.opacity = "0";
      setTimeout(function () {
        preloader.remove();
      }, 400);
    });
  }

  /**
   * Scroll top button
   */
  var scrollTop = document.querySelector(".scroll-top");
  function toggleScrollTop() {
    if (!scrollTop) return;
    window.scrollY > 100 ? scrollTop.classList.add("active") : scrollTop.classList.remove("active");
  }
  if (scrollTop) {
    scrollTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * Sidebar: mobile off-canvas toggle
   */
  var sidebar = document.getElementById("sidebar");
  var sidebarToggle = document.getElementById("sidebarToggle");
  var sidebarBackdrop = document.getElementById("sidebarBackdrop");

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("sidebar-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("is-visible");
    if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("sidebar-locked");
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("sidebar-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("is-visible");
    if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("sidebar-locked");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      if (sidebar && sidebar.classList.contains("sidebar-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeSidebar);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSidebar();
  });

  /**
   * Section router: sidebar links swap which section is visible in the
   * content panel (no page reload)
   */
  var contentSections = Array.prototype.slice.call(document.querySelectorAll(".content-panel > .content-section"));
  var sidebarLinks = Array.prototype.slice.call(document.querySelectorAll(".sidebar-link"));
  var sectionIds = contentSections.map(function (sec) {
    return sec.id;
  });
  var defaultSectionId = sectionIds[0] || "about";

  function showSection(id, options) {
    options = options || {};
    if (sectionIds.indexOf(id) === -1) id = defaultSectionId;

    contentSections.forEach(function (sec) {
      sec.classList.toggle("active", sec.id === id);
    });
    sidebarLinks.forEach(function (link) {
      var isActive = link.getAttribute("data-section") === id;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    var activeSection = document.getElementById(id);
    if (activeSection) {
      activeSection.querySelectorAll("[data-aos]").forEach(function (el) {
        el.classList.add("aos-animate");
      });
    }

    if (id === "testimonials" && window.testimonialsSwiper) {
      window.testimonialsSwiper.update();
    }

    if (!options.skipScroll) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  if (contentSections.length && sidebarLinks.length) {
    sidebarLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var id = link.getAttribute("data-section");
        if (history.pushState) {
          history.pushState(null, "", "#" + id);
        } else {
          window.location.hash = id;
        }
        showSection(id);
        closeSidebar();
      });
    });

    window.addEventListener("hashchange", function () {
      var id = window.location.hash.replace("#", "");
      showSection(id);
    });

    var initialId = window.location.hash.replace("#", "") || defaultSectionId;
    showSection(initialId, { skipScroll: true });
  }

  /**
   * Animate skill progress bars when scrolled into view
   */
  var progressBars = document.querySelectorAll(".progress-bar[data-width]");
  if ("IntersectionObserver" in window && progressBars.length) {
    var barObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var bar = entry.target;
            bar.style.width = bar.getAttribute("data-width") + "%";
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.4 }
    );
    progressBars.forEach(function (bar) {
      barObserver.observe(bar);
    });
  } else {
    progressBars.forEach(function (bar) {
      bar.style.width = bar.getAttribute("data-width") + "%";
    });
  }

  /**
   * Animated count-up for stat numbers
   */
  var counters = document.querySelectorAll("[data-countup]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1200;
    var startTime = null;

    function step(ts) {
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(runCounter);
  }

  /**
   * Init Typed.js on the sidebar title
   */
  var typedEl = document.querySelector(".typed");
  if (typedEl && window.Typed) {
    var items = typedEl.getAttribute("data-typed-items");
    new window.Typed(".typed", {
      strings: items ? items.split(",") : [],
      loop: true,
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 1800,
    });
  }

  /**
   * Init AOS
   */
  if (window.AOS) {
    window.AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }

  /**
   * Init GLightbox for achievement photo galleries
   */
  if (window.GLightbox) {
    window.GLightbox({ selector: ".glightbox" });
  }

  /**
   * Tab-toggle groups with fade transition (Projects: Research vs Industry;
   * Publications & Research: Publications vs Research Collaboration).
   * Each group is scoped to its own button/panel selectors so switching tabs
   * in one section never touches another section's tab state.
   */
  function initTabGroup(buttonSelector, panelSelector) {
    var tabButtons = document.querySelectorAll(buttonSelector);
    var tabPanels = document.querySelectorAll(panelSelector);
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab-target");
        if (btn.classList.contains("active")) return;

        tabButtons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        tabPanels.forEach(function (panel) {
          if (panel.getAttribute("data-tab-panel") === target) {
            panel.hidden = false;
            requestAnimationFrame(function () {
              panel.classList.add("is-visible");
            });
          } else {
            panel.classList.remove("is-visible");
            setTimeout(function () {
              panel.hidden = true;
            }, 300);
          }
        });
      });
    });
  }

  initTabGroup(".projects-tab-btn", ".projects-tab-panel");
  initTabGroup(".pubs-tab-btn", ".pubs-tab-panel");

  /**
   * Certifications: populate and open the certificate modal from the
   * clicked thumbnail's data-cert-* attributes
   */
  var certModal = document.getElementById("certModal");
  if (certModal) {
    certModal.addEventListener("show.bs.modal", function (event) {
      var btn = event.relatedTarget;
      if (!btn) return;
      var img = btn.getAttribute("data-cert-img");
      var name = btn.getAttribute("data-cert-name");
      var meta = btn.getAttribute("data-cert-meta");
      var desc = btn.getAttribute("data-cert-desc");

      certModal.querySelector("#certModalLabel").textContent = name;
      var modalImg = certModal.querySelector("#certModalImg");
      modalImg.setAttribute("src", img);
      modalImg.setAttribute("alt", name);
      certModal.querySelector("#certModalMeta").textContent = meta;
      certModal.querySelector("#certModalDesc").textContent = desc;
      certModal.querySelector("#certModalView").setAttribute("href", img);
      certModal.querySelector("#certModalDownload").setAttribute("href", img);
    });
  }

  /**
   * Init Swiper testimonials
   */
  var testimonialsEl = document.querySelector(".testimonials-swiper");
  if (window.Swiper && testimonialsEl) {
    var slideCount = testimonialsEl.querySelectorAll(".swiper-slide").length;
    window.testimonialsSwiper = new window.Swiper(testimonialsEl, {
      loop: slideCount > 1,
      speed: 600,
      autoplay: slideCount > 1 ? { delay: 5000, disableOnInteraction: false } : false,
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true,
      },
    });
  }
})();
