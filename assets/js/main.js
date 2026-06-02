/* ========================================
   Le Jardin de Chine — Main Application
   ======================================== */

(function () {
  'use strict';

  // --- State ---
  let config = null;
  let currentLang = 'fr';
  let currentMenuCategory = null;
  let menuCategoryItems = {};

  // --- DOM refs (populated on init) ---
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  // --- Load config ---
  async function loadConfig () {
    try {
      const resp = await fetch('data/config.json?v=' + (window.CACHE_VER || Date.now()));
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      config = await resp.json();
      return true;
    } catch (err) {
      console.error('Failed to load config:', err);
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center;color:#a0a090;">
          <div>
            <h2 style="font-size:1.5rem;margin-bottom:0.5rem;">⚠️</h2>
            <p>Unable to load restaurant data.<br>Please make sure <code>data/config.json</code> is accessible.</p>
          </div>
        </div>`;
      return false;
    }
  }

  // --- i18n helper ---
  function t (obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.fr || obj.en || Object.values(obj)[0] || '';
  }

  // --- Language switcher ---
  function initLanguageSwitcher () {
    const btns = $$('.lang-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang === currentLang) return;
        currentLang = lang;
        btns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // --- Render all dynamic content ---
  function renderAll () {
    if (!config) return;
    renderHero();
    renderOverview();
    renderMenu();
    renderContact();
    renderReviews();
    renderSEO();
    renderFooter();
    // Re-trigger scroll reveals
    observeReveals();
  }

  // --- Hero ---
  function renderHero () {
    const c = config;
    document.title = t(c.seo.title);

    const badge = $('.hero-badge');
    const titleFr = $('.hero-title-fr');
    const titleCn = $('.hero-title-cn');
    const subtitle = $('.hero-subtitle');
    const cta = $('.hero-cta');

    // Badge laissé en HTML ("Cuisine d'Asie Centrale · Halal")
    if (titleFr) titleFr.textContent = c.restaurant.name[currentLang] || c.restaurant.name.fr;
    if (titleCn) titleCn.textContent = c.restaurant.name.cn;
    // Subtitle laissé en HTML (adresse postale)
    if (cta) cta.innerHTML = `${t(c.hero.cta)} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>`;
  }

  // --- Overview ---
  function renderOverview () {
    const section = $('#section-overview');
    if (!section || !config.sections.overview.enabled) return;

    const title = $('.section-title', section);
    const titleCn = $('.section-title-cn', section);
    const bio = $('.overview-bio', section);
    const bioExtra = $('.overview-bio-extra', section);
    const yearBadge = $('.year-badge', section);
    const statNumbers = $$('.stat-number', section);

    if (title) title.textContent = t(config.sections.overview.title);
    if (titleCn) titleCn.textContent = config.restaurant.name.cn;
    if (bio) bio.textContent = t(config.restaurant.shortBio);
    if (bioExtra) bioExtra.textContent = currentLang === 'cn'
      ? '我们的厨师传承古老技艺：手工拉面、木炭烤羊肉串、慢炖菜肴。每一道菜都讲述着一个被热情守护的文化故事。'
      : currentLang === 'en'
        ? 'Our chefs carry on ancestral know-how: hand-pulled noodles, lamb skewers grilled over wood fire, slow-cooked stews. Every dish tells the story of a culture preserved with passion.'
        : 'Nos chefs perpétuent un savoir-faire ancestral : nouilles tirées à la main, brochettes d\'agneau grillées au feu de bois, ragoûts mijotés longuement. Chaque plat raconte l\'histoire d\'une culture préservée avec passion.';
    if (yearBadge) yearBadge.textContent = `Since ${config.restaurant.yearEstablished}`;
    if (statNumbers.length >= 3) {
      statNumbers[0].textContent = currentLang === 'cn' ? '100%清真' : '100% Halal';
      statNumbers[1].textContent = '50+';
      statNumbers[2].textContent = '📍 Paris 2e';
    }
  }

  // --- Menu ---
  function renderMenu () {
    const container = $('.menu-grid');
    const tabsContainer = $('.menu-tabs');
    if (!container || !tabsContainer) {
      // Menu carousel mode — no text menu rendered
      return;
    }

    const categories = config.sections.menu.categories;

    // Build tab-index per category
    menuCategoryItems = {};
    categories.forEach((cat, idx) => {
      menuCategoryItems[cat.id] = cat.items;
    });

    if (!currentMenuCategory) {
      currentMenuCategory = categories[0].id;
    }

    // Render tabs
    tabsContainer.innerHTML = categories.map(cat => `
      <button class="menu-tab ${cat.id === currentMenuCategory ? 'active' : ''}"
              data-category="${cat.id}">
        ${t(cat.name)}
      </button>
    `).join('');

    // Tab click listeners
    $$('.menu-tab', tabsContainer).forEach(tab => {
      tab.addEventListener('click', () => {
        const catId = tab.dataset.category;
        if (catId === currentMenuCategory) return;
        currentMenuCategory = catId;
        $$('.menu-tab', tabsContainer).forEach(t => t.classList.toggle('active', t.dataset.category === catId));
        renderMenuItems();
      });
    });

    renderMenuItems();
  }

  function renderMenuItems () {
    const container = $('.menu-grid');
    if (!container) return;

    const items = menuCategoryItems[currentMenuCategory] || [];

    if (items.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:var(--color-text-muted);grid-column:1/-1;padding:2rem;">${currentLang === 'cn' ? '暂无菜品' : currentLang === 'en' ? 'No items available' : 'Aucun article disponible'}</p>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="menu-card reveal reveal-delay-1">
        <div class="menu-card-header">
          <div class="menu-card-name">
            ${t(item.name)}
            <span class="menu-card-name-cn">${item.name.cn || ''}</span>
          </div>
          <span class="menu-card-price">${item.price}</span>
        </div>
        <p class="menu-card-desc">${t(item.desc)}</p>
        ${item.badge ? `<span class="menu-card-badge">${item.badge}</span>` : ''}
      </div>
    `).join('');

    // Reveal new items
    observeReveals();
  }

  // --- Contact ---
  function renderContact () {
    const section = $('#section-contact');
    if (!section || !config.sections.contact.enabled) return;

    const c = config.sections.contact;

    const title = $('.section-title', section);
    const titleCn = $('.section-title-cn', section);
    if (title) title.textContent = t(c.title);
    if (titleCn) titleCn.textContent = config.restaurant.name.cn;

    // Address
    const addrEl = $('.contact-address');
    if (addrEl) addrEl.textContent = t(c.address.full);

    // Phone
    const phoneEl = $('.contact-phone');
    if (phoneEl) {
      phoneEl.textContent = c.phone;
      phoneEl.href = `tel:${c.phone.replace(/\s+/g, '')}`;
    }

    // Email
    const emailEl = $('.contact-email');
    if (emailEl) {
      emailEl.textContent = c.email;
      emailEl.href = `mailto:${c.email}`;
    }

    // Hours
    const hoursContainer = $('.hours-grid');
    if (hoursContainer) {
      hoursContainer.innerHTML = c.hours.map(h => `
        <div class="hours-row">
          <span class="hours-days">${t(h.days)}</span>
          <span class="hours-time">${t(h.hours)}</span>
        </div>
      `).join('');
    }

    // Map
    const mapFrame = $('.contact-map iframe');
    if (mapFrame) {
      mapFrame.src = c.mapsEmbedUrl;
    }

    // Social
    const socialsContainer = $('.social-row');
    if (socialsContainer && c.socials) {
      const socialMap = {
        instagram: '📷 Instagram',
        facebook: '👍 Facebook',
        wechat: '💬 WeChat'
      };
      socialsContainer.innerHTML = Object.entries(c.socials).map(([key, val]) => {
        const label = socialMap[key] || key;
        const isWechat = key === 'wechat';
        return isWechat
          ? `<span class="social-link">${label} : ${val}</span>`
          : `<a href="${val}" class="social-link" target="_blank" rel="noopener">${label}</a>`;
      }).join('');
    }
  }

  // --- SEO (JSON-LD + meta) ---
  function renderSEO () {
    const c = config;
    const url = window.location.href;

    // Meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t(c.seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = t(c.seo.title);
    if (ogDesc) ogDesc.content = t(c.seo.description);

    // JSON-LD
    const hoursStr = c.contact.hours.map(h => {
      const days = t(h.days);
      const hrs = t(h.hours);
      return `${days} ${hrs}`;
    }).join('; ');

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: c.restaurant.name.fr,
      alternateName: [c.restaurant.name.en, c.restaurant.name.cn],
      description: t(c.seo.description),
      url: url,
      telephone: c.contact.phone,
      email: c.contact.email,
      servesCuisine: c.seo.cuisine,
      priceRange: c.seo.priceRange,
      areaServed: c.seo.areaServed,
      foundingDate: String(c.restaurant.yearEstablished),
      image: c.seo.image,
      address: {
        '@type': 'PostalAddress',
        streetAddress: c.contact.address.street,
        addressLocality: c.contact.address.city,
        postalCode: c.contact.address.postalCode,
        addressCountry: c.contact.address.country
      },
      openingHoursSpecification: c.contact.hours.map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.en || h.days.fr,
        opens: '',
        closes: ''
      })),
      geo: {
        '@type': 'GeoCoordinates'
      },
      sameAs: Object.values(c.contact.socials).filter(v => v.startsWith('http'))
    };

    let script = document.querySelector('#json-ld-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
  }

  // --- Reviews (extracted from Google Places API) ---
  function renderReviews () {
    const c = config.sections.contact;
    const grid = $('#reviews-grid');
    if (!grid) return;

    const ratingEl = $('#google-rating');
    const starsEl = $('#google-stars');
    const countEl = $('#google-reviews-count');
    const linkEl = $('#google-page-link');

    // Set link
    if (linkEl) linkEl.href = c.googlePage || '#';

    // Show static rating as placeholder
    if (ratingEl) ratingEl.textContent = c.googleRating.toFixed(1);
    if (starsEl) starsEl.textContent = '★'.repeat(Math.round(c.googleRating)) + '☆'.repeat(5 - Math.round(c.googleRating));
    if (countEl) {
      countEl.textContent = currentLang === 'cn'
        ? `${c.googleReviewsCount} 条评价`
        : currentLang === 'en'
          ? `${c.googleReviewsCount} reviews`
          : `${c.googleReviewsCount} avis`;
    }

    // --- Extract Place ID from URL ---
    let placeId = c.googlePlaceId || '';
    if (!placeId && c.googlePage) {
      const m = c.googlePage.match(/!1s([a-zA-Z0-9_:\-]+)/);
      if (m) placeId = m[1];
    }

    // --- Fetch reviews via Google Places API ---
    if (!c.googleApiKey) {
      grid.innerHTML = `<div class="review-card" style="grid-column:1/-1;text-align:center;padding:2rem;">
        <p style="color:var(--color-text-muted);font-size:0.9rem;">
          ⚠️ ${currentLang === 'cn' ? '请在 config.json 中配置 googleApiKey' : currentLang === 'en' ? 'Please configure googleApiKey in config.json' : 'Veuillez configurer googleApiKey dans config.json'}
        </p>
      </div>`;
      return;
    }

    if (!placeId) {
      grid.innerHTML = `<div class="review-card" style="grid-column:1/-1;text-align:center;padding:2rem;">
        <p style="color:var(--color-text-muted);font-size:0.9rem;">
          ⚠️ ${currentLang === 'cn' ? '无法提取 Google Place ID' : currentLang === 'en' ? 'Could not extract Google Place ID' : 'Impossible d\'extraire le Google Place ID'}
        </p>
      </div>`;
      return;
    }

    // Show loading
    grid.innerHTML = `<div class="review-card" style="grid-column:1/-1;text-align:center;padding:2rem;">
      <p style="color:var(--color-text-muted);font-size:0.9rem;">
        ${currentLang === 'cn' ? '正在加载评价...' : currentLang === 'en' ? 'Loading reviews...' : 'Chargement des avis...'}
      </p>
    </div>`;

    // Load Google Maps API dynamically
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      loadGooglePlacesAPI(c.googleApiKey, () => fetchGoogleReviews(placeId, grid));
    } else {
      fetchGoogleReviews(placeId, grid);
    }
  }

  function loadGooglePlacesAPI (apiKey, callback) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googlePlacesCallback`;
    script.async = true;
    script.defer = true;
    window.__googlePlacesCallback = callback;
    document.head.appendChild(script);
  }

  function fetchGoogleReviews (placeId, grid) {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      grid.innerHTML = `<div class="review-card" style="grid-column:1/-1;text-align:center;padding:2rem;">
        <p style="color:var(--color-text-muted);font-size:0.9rem;">
          ⚠️ ${currentLang === 'cn' ? 'Google API 加载失败' : currentLang === 'en' ? 'Google API failed to load' : 'Échec du chargement de l\'API Google'}
        </p>
      </div>`;
      return;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({
      placeId: placeId,
      fields: ['reviews', 'rating', 'user_ratings_total', 'url']
    }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // Update rating with real data
        const ratingEl = $('#google-rating');
        const starsEl = $('#google-stars');
        const countEl = $('#google-reviews-count');
        const linkEl = $('#google-page-link');

        const realRating = place.rating || config.sections.contact.googleRating;
        const realCount = place.user_ratings_total || config.sections.contact.googleReviewsCount;

        if (ratingEl) ratingEl.textContent = realRating.toFixed(1);
        if (starsEl) starsEl.textContent = '★'.repeat(Math.round(realRating)) + '☆'.repeat(5 - Math.round(realRating));
        if (countEl) {
          countEl.textContent = currentLang === 'cn'
            ? `${realCount} 条评价`
            : currentLang === 'en'
              ? `${realCount} reviews`
              : `${realCount} avis`;
        }
        if (linkEl && place.url) linkEl.href = place.url;

        // Render reviews
        if (place.reviews && place.reviews.length > 0) {
          // Take up to 8 reviews, sort by most recent first
          const reviews = place.reviews.slice(0, 8);
          grid.innerHTML = reviews.map((review, idx) => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const delay = idx < 4 ? 'reveal-delay-' + (idx + 1) : '';
            return `
              <div class="review-card reveal ${delay}">
                <div class="review-card-header">
                  <span class="review-card-author">${escapeHtml(review.author_name)}</span>
                  <span class="review-card-stars">${stars}</span>
                </div>
                <div class="review-card-date">${review.relative_time_description || ''}</div>
                <p class="review-card-text">${escapeHtml(review.text)}</p>
              </div>
            `;
          }).join('');
        } else {
          grid.innerHTML = `<div class="review-card" style="grid-column:1/-1;text-align:center;padding:2rem;">
            <p style="color:var(--color-text-muted);font-size:0.9rem;">
              ${currentLang === 'cn' ? '暂无评价' : currentLang === 'en' ? 'No reviews yet' : 'Aucun avis pour le moment'}
            </p>
          </div>`;
        }
      } else {
        grid.innerHTML = `<div class="review-card" style="grid-column:1/-1;text-align:center;padding:2rem;">
          <p style="color:var(--color-text-muted);font-size:0.9rem;">
            ⚠️ ${currentLang === 'cn' ? '无法获取评价' : currentLang === 'en' ? 'Could not fetch reviews' : 'Impossible de récupérer les avis'} (${status})
          </p>
        </div>`;
      }
      observeReveals();
    });
  }

  // Simple HTML escape
  function escapeHtml (str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Footer ---
  function renderFooter () {
    const footerName = $('.footer-logo');
    const footerYear = $('.footer-year');
    const footerLoc = $('.footer-location');
    if (footerName) footerName.textContent = config.restaurant.name[currentLang] || config.restaurant.name.fr;
    if (footerYear) footerYear.textContent = new Date().getFullYear();
    if (footerLoc) footerLoc.textContent = config.contact.address.city;
  }

  // --- Scroll Reveal (Intersection Observer) ---
  function observeReveals () {
    const els = $$('.reveal');
    if (els.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(el => observer.observe(el));
  }

  // --- Nav: scroll spy + header style ---
  function initNav () {
    const header = $('.site-header');
    const links = $$('.nav-links a[href^="#"]');
    const sections = $$('section[id]');

    // Scroll event
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          header.classList.toggle('scrolled', scrollY > 60);

          // Active link
          let currentId = '';
          sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (scrollY >= top) currentId = sec.id;
          });
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
          });

          ticking = false;
        });
        ticking = true;
      }
    });

    // Smooth scroll on click
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Close mobile nav
        if (window.toggleMobileMenu && document.querySelector('.nav-links.open')) {
          window.toggleMobileMenu();
        }
      });
    });

    // CTA button
    const cta = $('.hero-cta');
    if (cta) {
      cta.addEventListener('click', e => {
        e.preventDefault();
        const menuSection = $('#section-menu');
        if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  // --- Mobile nav (inline onclick, works on all mobile browsers) ---
  window.toggleMobileMenu = function () {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const body = document.body;
    if (!nav || !hamburger) return;

    const isOpen = nav.classList.contains('open');

    if (isOpen) {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      if (overlay) overlay.classList.remove('open');
      body.style.overflow = '';
    } else {
      nav.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      if (overlay) overlay.classList.add('open');
      body.style.overflow = 'hidden';
    }
  };

  // Close nav when a link is clicked
  function initMobileNavLinks () {
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        const nav = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        const overlay = document.querySelector('.nav-overlay');
        if (nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Close nav on resize to desktop
  function initMobileResize () {
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (window.innerWidth > 768) {
          const nav = document.querySelector('.nav-links');
          const hamburger = document.querySelector('.hamburger');
          const overlay = document.querySelector('.nav-overlay');
          if (nav) nav.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      }, 200);
    });
  }

  // ========================================
  // MENU CAROUSEL
  // ========================================
  var currentMenuSlide = 0;
  var totalMenuSlides = 0;

  function initMenuCarousel () {
    var imgs = document.querySelectorAll('.menu-carousel .carousel-img');
    totalMenuSlides = imgs.length;
    var totalEl = document.getElementById('menu-total');
    if (totalEl) totalEl.textContent = totalMenuSlides;
  }

  window.changeMenuSlide = function (direction) {
    var imgs = document.querySelectorAll('.menu-carousel .carousel-img');
    if (imgs.length === 0) return;
    
    // Hide current
    imgs[currentMenuSlide].classList.remove('active');
    
    // Calculate next
    currentMenuSlide = (currentMenuSlide + direction + imgs.length) % imgs.length;
    
    // Show next
    imgs[currentMenuSlide].classList.add('active');
    
    // Update indicator
    var currentEl = document.getElementById('menu-current');
    if (currentEl) currentEl.textContent = currentMenuSlide + 1;
  };

  // Keyboard navigation for carousel
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') window.changeMenuSlide(-1);
    if (e.key === 'ArrowRight') window.changeMenuSlide(1);
  });

  // Touch swipe for carousel
  var touchStartX = 0;
  var touchEndX = 0;
  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      window.changeMenuSlide(diff > 0 ? 1 : -1);
    }
  }, { passive: true });

  // ========================================
  // INIT
  // ========================================
  async function init () {
    const ok = await loadConfig();
    if (!ok) return;

    initLanguageSwitcher();
    renderAll();
    initNav();
    initMobileNavLinks();
    initMobileResize();
    initMenuCarousel();

    console.log(`🍜 ${config.restaurant.name.fr} loaded — ${currentLang}`);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
