/**
 * ORIGYN - Main JavaScript
 * Handles navigation, cart, lightbox, forms, and animations
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initCartDrawer();
  initLightbox();
  initForms();
  initScrollAnimations();
  initMapPins();
  initCategoryFilter();
  initReadingProgress();
  initReadingTime();
});

/**
 * Navigation
 */
function initNavigation() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Scroll effect for nav
  if (nav) {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  }
}

/**
 * Cart Drawer
 */
function initCartDrawer() {
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartClose = document.getElementById('cartClose');

  if (cartBtn && cartDrawer && cartBackdrop) {
    // Open cart
    cartBtn.addEventListener('click', function() {
      cartDrawer.classList.add('active');
      cartBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close cart
    function closeCart() {
      cartDrawer.classList.remove('active');
      cartBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (cartClose) {
      cartClose.addEventListener('click', closeCart);
    }

    cartBackdrop.addEventListener('click', closeCart);

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && cartDrawer.classList.contains('active')) {
        closeCart();
      }
    });
  }
}

/**
 * Lightbox for galleries
 */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || !lightboxImage) return;

  // Open lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-item-caption');

      if (img) {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
      }

      if (caption && lightboxCaption) {
        lightboxCaption.textContent = caption.textContent;
      }

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/**
 * Form handling - Now configured for Netlify Forms
 * Forms with data-netlify="true" will be automatically handled by Netlify
 * We keep JS handlers for enhanced UX (success messages)
 */
function initForms() {
  // Newsletter form - Netlify handles submission, we show success message
  const newsletterForms = document.querySelectorAll('#newsletterForm, .newsletter-form');
  newsletterForms.forEach(form => {
    // Skip if already configured for Netlify (has action attribute)
    if (form.hasAttribute('data-netlify')) {
      form.addEventListener('submit', handleNetlifyFormSubmit);
      return;
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (email && email.value) {
        // Simulate success for demo - Netlify will handle actual submission
        showFormSuccess(form, 'Thanks for subscribing! You\'ll be the first to know about new story drops.');
        email.value = '';
      }
    });
  });

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    if (contactForm.hasAttribute('data-netlify')) {
      contactForm.addEventListener('submit', handleNetlifyFormSubmit);
    } else {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showFormSuccess(contactForm, 'Thanks for reaching out! We\'ll get back to you within 24-48 hours.');
        contactForm.reset();
      });
    }
  }

  // Story submission form
  const storyForm = document.getElementById('storyForm');
  if (storyForm) {
    if (storyForm.hasAttribute('data-netlify')) {
      storyForm.addEventListener('submit', handleNetlifyFormSubmit);
    } else {
      storyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showFormSuccess(storyForm, 'Thank you for sharing! We\'ll review your submission and reach out if we have questions.');
        storyForm.reset();
      });
    }
  }

  // Request town form
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    if (requestForm.hasAttribute('data-netlify')) {
      requestForm.addEventListener('submit', handleNetlifyFormSubmit);
    } else {
      requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showFormSuccess(requestForm, 'Thanks for the nomination! We\'ll add it to our list and let you know if we feature it.');
        requestForm.reset();
      });
    }
  }
}

/**
 * Handle Netlify form submission with AJAX
 */
async function handleNetlifyFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  try {
    const formData = new FormData(form);
    const response = await fetch(form.action || '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });

    if (response.ok) {
      const formName = form.getAttribute('name') || 'form';
      let message = 'Thanks! Your submission has been received.';

      if (formName.includes('newsletter')) {
        message = 'Thanks for subscribing! You\'ll be the first to know about new story drops.';
      } else if (formName.includes('contact')) {
        message = 'Thanks for reaching out! We\'ll get back to you within 24-48 hours.';
      } else if (formName.includes('story')) {
        message = 'Thank you for sharing! We\'ll review your submission and reach out if we have questions.';
      } else if (formName.includes('request')) {
        message = 'Thanks for the nomination! We\'ll add it to our list and let you know if we feature it.';
      }

      showFormSuccess(form, message);
      form.reset();
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showFormError(form, 'Something went wrong. Please try again.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

/**
 * Show form success message
 */
function showFormSuccess(form, message) {
  // Remove any existing messages
  const existingMsg = form.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();

  const msgEl = document.createElement('div');
  msgEl.className = 'form-message form-message--success';
  msgEl.textContent = message;
  msgEl.style.cssText = 'background: var(--color-sage); color: white; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;';
  form.appendChild(msgEl);

  // Remove after 5 seconds
  setTimeout(() => msgEl.remove(), 5000);
}

/**
 * Show form error message
 */
function showFormError(form, message) {
  const existingMsg = form.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();

  const msgEl = document.createElement('div');
  msgEl.className = 'form-message form-message--error';
  msgEl.textContent = message;
  msgEl.style.cssText = 'background: #c0392b; color: white; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;';
  form.appendChild(msgEl);

  setTimeout(() => msgEl.remove(), 5000);
}

/**
 * Scroll animations
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (animatedElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Map pin interactions
 */
function initMapPins() {
  const pins = document.querySelectorAll('.map-pin');

  pins.forEach(pin => {
    // Keyboard accessibility
    pin.setAttribute('tabindex', '0');
    pin.setAttribute('role', 'button');

    pin.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pin.click();
      }
    });

    // Click handler for active pins
    if (pin.classList.contains('active')) {
      pin.style.cursor = 'pointer';
    }
  });
}

/**
 * Audio Player (for Florence page)
 */
function initAudioPlayer() {
  const playBtn = document.getElementById('audioPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const progressBar = document.getElementById('audioProgress');
  const timeDisplay = document.getElementById('audioTime');

  if (!playBtn) return;

  let isPlaying = false;
  let currentTime = 0;
  const duration = 225; // 3:45 in seconds

  playBtn.addEventListener('click', function() {
    isPlaying = !isPlaying;

    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      // In production, this would actually play audio
      startProgressSimulation();
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      stopProgressSimulation();
    }
  });

  let progressInterval;

  function startProgressSimulation() {
    progressInterval = setInterval(() => {
      if (currentTime < duration) {
        currentTime++;
        updateProgress();
      } else {
        stopProgressSimulation();
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        currentTime = 0;
        updateProgress();
      }
    }, 1000);
  }

  function stopProgressSimulation() {
    clearInterval(progressInterval);
  }

  function updateProgress() {
    const percent = (currentTime / duration) * 100;
    if (progressBar) {
      progressBar.style.width = percent + '%';
    }
    if (timeDisplay) {
      const currentMin = Math.floor(currentTime / 60);
      const currentSec = currentTime % 60;
      const durationMin = Math.floor(duration / 60);
      const durationSec = duration % 60;
      timeDisplay.textContent = `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${durationMin}:${durationSec.toString().padStart(2, '0')}`;
    }
  }
}

// Initialize audio player if on Florence page
if (document.getElementById('audioPlayBtn')) {
  initAudioPlayer();
}

/**
 * Smooth scroll for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = document.getElementById('nav')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Category Filter for Stories
 */
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.category-filter__btn');
  const storyCards = document.querySelectorAll('.story-card[data-category]');

  if (filterBtns.length === 0 || storyCards.length === 0) return;

  // Check for URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const matchingBtn = document.querySelector(`.category-filter__btn[data-filter="${hash}"]`);
    if (matchingBtn) {
      filterStories(hash, filterBtns, storyCards);
      matchingBtn.classList.add('active');
      document.querySelector('.category-filter__btn[data-filter="all"]')?.classList.remove('active');
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.dataset.filter;

      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update URL hash
      if (filter === 'all') {
        history.replaceState(null, '', window.location.pathname);
      } else {
        history.replaceState(null, '', `#${filter}`);
      }

      // Filter stories
      filterStories(filter, filterBtns, storyCards);
    });
  });
}

function filterStories(filter, filterBtns, storyCards) {
  storyCards.forEach(card => {
    const categories = card.dataset.category.split(' ');

    if (filter === 'all' || categories.includes(filter)) {
      card.classList.remove('filtered-out');
      // Reset position for animation
      setTimeout(() => {
        card.style.position = '';
        card.style.visibility = '';
      }, 10);
    } else {
      card.classList.add('filtered-out');
    }
  });
}

/**
 * Reading Progress Bar
 */
function initReadingProgress() {
  const progressBar = document.querySelector('.reading-progress__bar');
  const article = document.querySelector('.article-body, .place-story');

  if (!progressBar || !article) return;

  function updateProgress() {
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollPos = window.scrollY;

    // Calculate progress
    const start = articleTop - windowHeight;
    const end = articleTop + articleHeight - windowHeight;
    const progress = Math.min(Math.max((scrollPos - start) / (end - start) * 100, 0), 100);

    progressBar.style.width = `${progress}%`;
  }

  window.addEventListener('scroll', debounce(updateProgress, 10));
  updateProgress(); // Initial call
}

/**
 * Reading Time Calculator
 */
function initReadingTime() {
  const article = document.querySelector('.article-body, .place-story');
  const readingTimeEl = document.querySelector('.reading-time, [data-reading-time]');

  if (!article) return;

  // Get text content and count words
  const text = article.textContent || article.innerText;
  const wordCount = text.trim().split(/\s+/).length;

  // Average reading speed: 200-250 words per minute
  const readingTime = Math.ceil(wordCount / 225);

  // Update all reading time elements
  const readingTimeEls = document.querySelectorAll('.reading-time, [data-reading-time]');
  readingTimeEls.forEach(el => {
    el.textContent = `${readingTime} min read`;
  });

  // Also update byline reading time if present
  const bylineReadingTime = document.querySelector('.byline__reading-time');
  if (bylineReadingTime) {
    bylineReadingTime.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${readingTime} min read`;
  }
}

/**
 * Console greeting
 */
console.log('%cORIGYN', 'font-size: 24px; font-weight: bold; color: #A45A3D;');
console.log('%cEvery place has a story worth wearing.', 'font-size: 12px; color: #5C4033;');
