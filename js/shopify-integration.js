/**
 * ORIGYN Shopify Integration
 *
 * Setup Instructions:
 * 1. Go to Shopify Admin → Apps → Develop apps
 * 2. Create a new app called "ORIGYN Website"
 * 3. Enable Storefront API with these permissions:
 *    - Read products, variants, and collections
 *    - Read and modify checkouts
 *    - Read and modify cart
 * 4. Copy your Storefront API access token
 * 5. Replace the placeholders below with your actual values
 */

// ============================================
// CONFIGURATION - Replace these values
// ============================================
const SHOPIFY_CONFIG = {
  domain: 'YOUR-STORE.myshopify.com', // Replace with your Shopify store domain
  storefrontAccessToken: 'YOUR_STOREFRONT_ACCESS_TOKEN', // Replace with your token
};

// ============================================
// Shopify Buy SDK Initialization
// ============================================
let ShopifyBuy;
let client;
let cart;

// Initialize Shopify when page loads
function initializeShopify() {
  if (typeof ShopifyBuy === 'undefined') {
    console.error('Shopify Buy SDK not loaded. Make sure the script is included.');
    return;
  }

  // Build the Shopify client
  client = ShopifyBuy.buildClient({
    domain: SHOPIFY_CONFIG.domain,
    storefrontAccessToken: SHOPIFY_CONFIG.storefrontAccessToken,
  });

  // Initialize or retrieve existing cart
  if (localStorage.getItem('shopify-cart-id')) {
    const cartId = localStorage.getItem('shopify-cart-id');
    client.checkout.fetch(cartId).then((checkout) => {
      cart = checkout;
      updateCartUI();
    }).catch(() => {
      // Cart doesn't exist anymore, create new one
      createNewCart();
    });
  } else {
    createNewCart();
  }
}

// Create a new cart
function createNewCart() {
  client.checkout.create().then((checkout) => {
    cart = checkout;
    localStorage.setItem('shopify-cart-id', cart.id);
    updateCartUI();
  });
}

// ============================================
// Add to Cart Functionality
// ============================================
function addToCart(variantId, quantity = 1) {
  if (!cart) {
    console.error('Cart not initialized');
    return;
  }

  const lineItemsToAdd = [{
    variantId: variantId,
    quantity: parseInt(quantity)
  }];

  client.checkout.addLineItems(cart.id, lineItemsToAdd).then((checkout) => {
    cart = checkout;
    updateCartUI();
    showCartNotification();
  }).catch((error) => {
    console.error('Error adding to cart:', error);
    alert('Error adding item to cart. Please try again.');
  });
}

// ============================================
// Update Cart UI
// ============================================
function updateCartUI() {
  if (!cart) return;

  const cartCount = cart.lineItems.reduce((total, item) => total + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('#cart-count, .cart-count, .header__cart-count');

  cartCountElements.forEach(element => {
    element.textContent = cartCount;
    element.style.display = cartCount > 0 ? 'flex' : 'none';
  });
}

// ============================================
// Show Cart Notification
// ============================================
function showCartNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div class="cart-notification__content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>Added to cart!</span>
      <button onclick="window.location.href='${cart.webUrl}'" class="cart-notification__checkout">
        View Cart
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);

  // Hide and remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// Cart Button Click Handler
// ============================================
function setupCartButton() {
  const cartButtons = document.querySelectorAll('#cart-btn, .header__cart-btn, .cart-btn');

  cartButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (cart && cart.webUrl) {
        window.location.href = cart.webUrl;
      } else {
        alert('Your cart is empty');
      }
    });
  });
}

// ============================================
// Product Buy Button Setup
// ============================================
function setupBuyButtons() {
  // Quick Add buttons on product cards
  document.querySelectorAll('.product-card__quick-add').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const variantId = button.getAttribute('data-variant-id');
      if (variantId) {
        addToCart(variantId);
      } else {
        console.error('No variant ID found for product');
      }
    });
  });

  // Add to cart forms (on product pages)
  document.querySelectorAll('.product-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const variantId = form.querySelector('[name="variant-id"]').value;
      const quantity = form.querySelector('[name="quantity"]')?.value || 1;

      if (variantId) {
        addToCart(variantId, quantity);
      }
    });
  });
}

// ============================================
// Load Products from Shopify
// ============================================
async function loadProducts(collectionHandle = null) {
  if (!client) {
    console.error('Shopify client not initialized');
    return [];
  }

  try {
    let products;

    if (collectionHandle) {
      // Fetch products from specific collection
      const collection = await client.collection.fetchByHandle(collectionHandle);
      products = collection.products;
    } else {
      // Fetch all products
      products = await client.product.fetchAll();
    }

    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// ============================================
// Render Products to Page
// ============================================
function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products.map(product => {
    const firstVariant = product.variants[0];
    const price = firstVariant.price.amount;
    const imageUrl = product.images[0]?.src || 'https://via.placeholder.com/400x500?text=No+Image';

    return `
      <a href="/product/${product.handle}.html" class="product-card">
        <div class="product-card__image">
          <img src="${imageUrl}" alt="${product.title}" loading="lazy">
          <button class="product-card__quick-add" data-variant-id="${firstVariant.id}">
            Quick Add
          </button>
        </div>
        <div class="product-card__content">
          <p class="product-card__collection">${product.productType || 'The Shoals'}</p>
          <h3 class="product-card__title">${product.title}</h3>
          <p class="product-card__price">$${price}</p>
        </div>
      </a>
    `;
  }).join('');

  // Setup buy buttons after rendering
  setupBuyButtons();
}

// ============================================
// Initialize when DOM is ready
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeShopify();
    setupCartButton();
    setupBuyButtons();
  });
} else {
  initializeShopify();
  setupCartButton();
  setupBuyButtons();
}

// ============================================
// Export functions for use in other scripts
// ============================================
window.ORIGYN = window.ORIGYN || {};
window.ORIGYN.shop = {
  addToCart,
  loadProducts,
  renderProducts,
  getCart: () => cart,
};
