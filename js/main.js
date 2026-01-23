/**
 * ORIGYN - Main JavaScript
 * Handles interactivity, cart, mobile menu, and general UI
 */

// ============================================
// State Management
// ============================================

const state = {
  cart: JSON.parse(localStorage.getItem('origyn_cart')) || [],
  isMenuOpen: false,
  isCartOpen: false
};

// ============================================
// DOM Ready
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCart();
  initNewsletterForm();
  initSmoothScroll();
  initLazyLoading();
  initAnimations();
});

// ============================================
// Header Scroll Effect
// ============================================

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class when scrolled past 50px
    if (currentScroll > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ============================================
// Mobile Menu
// ============================================

function initMobileMenu() {
  // Support both .header and .nav navigation systems
  const menuToggle = document.getElementById('menu-toggle') || document.getElementById('navToggle');
  const navLinks = document.querySelector('.header__nav-links') || document.querySelector('.nav-links');

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    state.isMenuOpen = !state.isMenuOpen;

    menuToggle.classList.toggle('is-active', state.isMenuOpen);
    navLinks.classList.toggle('is-open', state.isMenuOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const navContainer = document.querySelector('.header__nav') || document.querySelector('.nav');
    const toggleButton = document.querySelector('.header__menu-toggle') || document.querySelector('.nav-toggle');

    if (state.isMenuOpen && !e.target.closest('.header__nav') && !e.target.closest('.nav') &&
        !e.target.closest('.header__menu-toggle') && !e.target.closest('.nav-toggle')) {
      state.isMenuOpen = false;
      menuToggle.classList.remove('is-active');
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
}

// ============================================
// Shopping Cart
// ============================================

function initCart() {
  updateCartCount();

  // Quick add buttons
  document.querySelectorAll('.product-card__quick-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get product info from parent card
      const card = btn.closest('.product-card');
      const productId = card.dataset.productId || 'demo-product';
      const productName = card.querySelector('.product-card__title')?.textContent || 'Product';
      const productPrice = card.querySelector('.product-card__price')?.textContent || '$0';

      addToCart({
        id: productId,
        name: productName,
        price: parseFloat(productPrice.replace('$', '')),
        quantity: 1,
        size: 'M', // Default size for quick add
        image: card.querySelector('img')?.src || ''
      });

      // Visual feedback
      btn.textContent = 'Added!';
      btn.style.backgroundColor = 'var(--color-gold)';
      setTimeout(() => {
        btn.textContent = 'Quick Add';
        btn.style.backgroundColor = '';
      }, 1500);
    });
  });
}

function addToCart(item) {
  // Check if item already exists
  const existingIndex = state.cart.findIndex(
    cartItem => cartItem.id === item.id && cartItem.size === item.size
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += item.quantity;
  } else {
    state.cart.push(item);
  }

  saveCart();
  updateCartCount();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartCount();
}

function updateCartQuantity(index, quantity) {
  if (quantity <= 0) {
    removeFromCart(index);
  } else {
    state.cart[index].quantity = quantity;
    saveCart();
    updateCartCount();
  }
}

function saveCart() {
  localStorage.setItem('origyn_cart', JSON.stringify(state.cart));
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems > 0) {
    countEl.textContent = totalItems;
    countEl.style.display = 'flex';
  } else {
    countEl.style.display = 'none';
  }
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ============================================
// Newsletter Form
// ============================================

function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!email) return;

    // Disable form during submission
    emailInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';

    // Simulate API call (replace with actual newsletter service integration)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Success state
    submitBtn.textContent = 'Subscribed!';
    submitBtn.style.backgroundColor = 'var(--color-forest)';
    emailInput.value = '';

    // Reset after delay
    setTimeout(() => {
      emailInput.disabled = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
      submitBtn.style.backgroundColor = '';
    }, 3000);
  });
}

// ============================================
// Smooth Scroll
// ============================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// Lazy Loading Images
// ============================================

function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// ============================================
// Scroll Animations
// ============================================

function initAnimations() {
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements with animation classes
    document.querySelectorAll('.card, .product-card, .step, .story-section, .story-image, .story-quote').forEach(el => {
      el.classList.add('animate-ready');
      animationObserver.observe(el);
    });
  }
}

// ============================================
// Product Page Functions
// ============================================

function initProductPage() {
  // Size selector
  document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', function() {
      if (this.classList.contains('size-option--unavailable')) return;

      document.querySelectorAll('.size-option').forEach(opt => {
        opt.classList.remove('size-option--selected');
      });
      this.classList.add('size-option--selected');
    });
  });

  // Color selector
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('color-option--selected');
      });
      this.classList.add('color-option--selected');
    });
  });

  // Image gallery
  document.querySelectorAll('.product-gallery__thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
      const mainImage = document.querySelector('.product-gallery__main img');
      const newSrc = this.querySelector('img').src;

      mainImage.src = newSrc;

      document.querySelectorAll('.product-gallery__thumb').forEach(t => {
        t.classList.remove('product-gallery__thumb--active');
      });
      this.classList.add('product-gallery__thumb--active');
    });
  });

  // Add to cart
  const addToCartBtn = document.querySelector('.add-to-cart__btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      const productInfo = document.querySelector('.product-info');
      const selectedSize = document.querySelector('.size-option--selected');
      const selectedColor = document.querySelector('.color-option--selected');

      if (!selectedSize) {
        alert('Please select a size');
        return;
      }

      addToCart({
        id: productInfo.dataset.productId || 'product',
        name: productInfo.querySelector('.product-info__title')?.textContent || 'Product',
        price: parseFloat(productInfo.querySelector('.product-info__price')?.textContent.replace('$', '') || 0),
        quantity: 1,
        size: selectedSize.textContent,
        color: selectedColor?.dataset.color || 'default',
        image: document.querySelector('.product-gallery__main img')?.src || ''
      });

      this.textContent = 'Added to Cart!';
      setTimeout(() => {
        this.textContent = 'Add to Cart';
      }, 2000);
    });
  }
}

// ============================================
// Story Page Functions
// ============================================

function initStoryPage() {
  // Audio player
  document.querySelectorAll('.story-audio').forEach(audioSection => {
    const playBtn = audioSection.querySelector('.story-audio__play');
    const audio = audioSection.querySelector('audio');

    if (playBtn && audio) {
      playBtn.addEventListener('click', () => {
        if (audio.paused) {
          audio.play();
          playBtn.textContent = 'Pause';
        } else {
          audio.pause();
          playBtn.textContent = 'Play';
        }
      });
    }
  });

  // Image lightbox
  document.querySelectorAll('.story-image__figure').forEach(figure => {
    figure.addEventListener('click', () => {
      const img = figure.querySelector('img');
      if (img) {
        openLightbox(img.src, figure.querySelector('.story-image__caption')?.textContent);
      }
    });
  });
}

function openLightbox(src, caption) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox__overlay"></div>
    <div class="lightbox__content">
      <button class="lightbox__close">&times;</button>
      <img src="${src}" alt="${caption || ''}" class="lightbox__image">
      ${caption ? `<p class="lightbox__caption">${caption}</p>` : ''}
    </div>
  `;

  document.body.appendChild(lightbox);
  document.body.style.overflow = 'hidden';

  lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);

  function closeLightbox() {
    lightbox.remove();
    document.body.style.overflow = '';
  }
}

// ============================================
// Shopify Buy Button Integration (Placeholder)
// ============================================

// This will be replaced with actual Shopify Buy Button SDK integration
// when you have your Shopify store set up

/*
To integrate Shopify Buy Buttons:

1. In your Shopify admin, go to Sales channels > Buy Button
2. Create a Buy Button for each product
3. Get your Storefront Access Token
4. Replace the code below with your actual credentials

const shopifyClient = ShopifyBuy.buildClient({
  domain: 'your-store.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token'
});

// Then you can fetch products, create checkout, etc.
*/

// ============================================
// Utility Functions
// ============================================

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

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

// ============================================
// Export for use in other scripts
// ============================================

window.ORIGYN = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCartTotal,
  state
};
