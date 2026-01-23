# Shopify Integration Setup Guide

## Overview
Your ORIGYN website is now configured with Shopify integration. Follow these steps to connect your Shopify store.

---

## Step 1: Get Your Shopify Credentials

### 1.1 Access Shopify Admin
1. Log in to your Shopify store admin panel
2. Go to **Settings** (bottom left)

### 1.2 Create a Custom App
1. Click **Apps and sales channels**
2. Click **Develop apps** (or **Develop apps for your store**)
3. Click **Create an app**
4. Name it: `ORIGYN Website Integration`
5. Click **Create app**

### 1.3 Configure Storefront API
1. Click **Configure Storefront API scopes**
2. Enable these permissions:
   - ✅ `unauthenticated_read_product_listings` - Read products
   - ✅ `unauthenticated_read_product_inventory` - Read inventory
   - ✅ `unauthenticated_read_checkouts` - Read checkouts
   - ✅ `unauthenticated_write_checkouts` - Create checkouts
   - ✅ `unauthenticated_read_content` - Read collections
3. Click **Save**

### 1.4 Install the App
1. Click **Install app** at the top right
2. Confirm installation

### 1.5 Get Your Access Token
1. Click **API credentials** tab
2. Under **Storefront API access token**, click **Reveal token once**
3. **COPY THIS TOKEN** - You'll need it in the next step!
4. Your Shopify domain is: `your-store-name.myshopify.com`

---

## Step 2: Update Website Configuration

### 2.1 Edit the Integration File
Open the file: `/js/shopify-integration.js`

### 2.2 Replace Placeholder Values
Find this section at the top:

```javascript
const SHOPIFY_CONFIG = {
  domain: 'YOUR-STORE.myshopify.com', // Replace with your Shopify store domain
  storefrontAccessToken: 'YOUR_STOREFRONT_ACCESS_TOKEN', // Replace with your token
};
```

Replace with your actual values:

```javascript
const SHOPIFY_CONFIG = {
  domain: 'your-actual-store.myshopify.com',
  storefrontAccessToken: 'your-actual-access-token-here',
};
```

### 2.3 Save the File

---

## Step 3: Add Product Variant IDs

To make the "Quick Add" buttons work, you need to add Shopify product variant IDs to your product cards.

### 3.1 Get Variant IDs from Shopify
1. In Shopify Admin, go to **Products**
2. Click on a product
3. Scroll to **Variants**
4. The variant ID is shown (usually a long number like `41234567890123`)

### 3.2 Add to Product Cards
In your HTML files (like `index.html`), find product cards and add the variant ID:

```html
<a href="/product/florence-heritage-tee.html" class="product-card">
  <div class="product-card__image">
    <img src="..." alt="Florence Heritage Tee">
    <!-- Add data-variant-id here -->
    <button class="product-card__quick-add" data-variant-id="41234567890123">
      Quick Add
    </button>
  </div>
  ...
</a>
```

---

## Step 4: Test the Integration

### 4.1 Test Locally
1. Open your website in a browser
2. Click a "Quick Add" button
3. You should see:
   - A notification: "Added to cart!"
   - Cart count badge appears (top right)

### 4.2 Test Checkout
1. Click the cart icon (top right)
2. You should be redirected to Shopify checkout
3. Complete a test order (use Shopify test payment methods)

---

## Step 5: Customize Product Display (Optional)

### 5.1 Load Products Dynamically
You can load products from Shopify automatically using JavaScript:

```javascript
// Load all products
ORIGYN.shop.loadProducts().then(products => {
  ORIGYN.shop.renderProducts(products, 'product-container');
});

// Or load from a specific collection
ORIGYN.shop.loadProducts('florence-collection').then(products => {
  ORIGYN.shop.renderProducts(products, 'product-container');
});
```

### 5.2 Create Collections in Shopify
1. In Shopify Admin, go to **Products > Collections**
2. Create collections like:
   - `florence-collection`
   - `the-shoals`
   - `apparel`
3. Add products to collections

---

## Troubleshooting

### Cart doesn't update
- Check browser console for errors (F12 → Console)
- Verify your access token is correct
- Make sure Storefront API permissions are enabled

### Products don't load
- Verify your Shopify domain is correct (include `.myshopify.com`)
- Check that products are published to "Online Store" sales channel
- Verify API permissions include product reading

### Checkout doesn't work
- Verify checkout permissions are enabled
- Make sure your Shopify store checkout is active
- Test in incognito mode (clears cache)

---

## Security Notes

⚠️ **Important:**
- The Storefront API access token is PUBLIC and safe to use in your website code
- DO NOT use Admin API tokens in your website code
- Only use Storefront API tokens
- These tokens have limited permissions and are designed for public use

---

## Support

Need help? Check these resources:
- [Shopify Storefront API Documentation](https://shopify.dev/docs/api/storefront)
- [Shopify Buy SDK Documentation](https://shopify.github.io/js-buy-sdk/)

---

## What's Already Set Up

✅ Shopify Buy SDK loaded
✅ Cart functionality implemented
✅ "Add to Cart" buttons configured
✅ Cart notification animations
✅ Cart count badge (header)
✅ Checkout redirect
✅ Product loading functions

🔧 **You need to configure:**
- Shopify credentials in `shopify-integration.js`
- Product variant IDs on product cards
