# Product Management System Documentation

This document outlines the features and functionality of the product management system within the Koopi platform.

## 1. Product Overview

The product management system allows store owners to create, manage, and organize their products effectively. It supports physical goods, digital products, and services.

### Key Features:
- **Product Listing:** A centralized view of all products, with search and filtering capabilities.
- **Product Creation:** A guided, multi-step process to add new products.
- **Product Editing:** A comprehensive interface for updating all aspects of a product.
- **Inventory Management:** Tools to track stock levels for products and their variants.
- **Product Variants:** Support for products with multiple options, such as size, color, or material.
- **Media Management:** Upload and manage multiple images for each product.
- **Pricing:** Set product prices, "compare at" prices, and tax settings.
- **Organization:** Categorize products, add tags, and specify vendors.
- **Related Products:** Recommend other products to customers.
- **Product Reviews:** Manage customer reviews for each product.

## 2. Product Data Model

The following fields constitute the product data model:

| Field | Type | Description |
|---|---|---|
| `name` / `title` | String | The name of the product. |
| `description` | String | A detailed description of the product. |
| `status` | String | The status of the product (`Active` or `Draft`). |
| `type` | String | The type of product (e.g., "Physical", "Digital", "Service"). |
| `vendor` | String | The brand or vendor of the product. |
| `tags` | Array of Strings | Keywords to help with product discovery. |
| `category` | String | The category the product belongs to. |
| `price` | Number | The selling price of the product. |
| `compareAtPrice` | Number | The original price, used to show a discount. |
| `quantity` | Number | The total stock quantity. |
| `inventoryTracked`| Boolean | Whether to track inventory for this product. |
| `lowStockThreshold`| Number | The stock level at which to trigger a low stock alert. |
| `chargeTax` | Boolean | Whether sales tax should be applied to this product. |
| `variants` | Array of Objects | Product options like size and color. Each object has a `name` and an array of `options`. |
| `relatedProducts` | Array of Strings | A list of product IDs to be displayed as related products. |
| `images` | Array of Strings | URLs of the product images. |
| `variantStock` | Object | A map of variant combinations to their respective stock levels. |
| `storeId` | String | The ID of the store the product belongs to (user's UID). |
| `averageRating` | Number | The average customer rating for the product. |
| `reviewCount` | Number | The total number of reviews for the product. |

## 3. Core Functionalities

### 3.1. Product Listing Page

- **Location:** `/dashboard/products`
- **Functionality:**
    - Displays a paginated and searchable table of all products for the current user's store.
    - Each row shows the product name, status, inventory count, type, and vendor.
    - Provides quick actions to **Edit** or **Delete** a product.
    - A prominent "Add Product" button links to the product creation page.
    - An empty state prompts the user to add their first product.

### 3.2. Add New Product Page

- **Location:** `/dashboard/products/new`
- **Functionality:**
    - A three-step wizard guides the user through creating a new product.
    - **Step 1: Basic Info:** Collects the product title, description, category, and tags.
    - **Step 2: Media & Inventory:** Allows uploading product images and configuring variants and stock tracking.
    - **Step 3: Pricing:** Sets the price, compare-at price, and tax options.
    - The system prefills the product type based on the user's onboarding choices.
    - Upon adding the first product, a celebratory animation is displayed.

### 3.3. Edit Product Page

- **Location:** `/dashboard/products/[productId]`
- **Functionality:**
    - Mirrors the structure of the "Add New Product" page, but is pre-filled with the existing product's data.
    - Allows modification of all product attributes across the three steps.
    - Includes a section for managing existing product images (viewing and deleting).
    - Integrates a `ReviewManagement` component to handle customer reviews.
    - Allows selection of related products.

## 4. Advanced Features

### 4.1. Variants

- Products can have multiple variants (e.g., a T-shirt with different sizes and colors).
- The UI allows for defining variant names (e.g., "Size") and their options (e.g., "S", "M", "L").
- If inventory tracking is enabled for a product with variants, stock levels can be set for each unique combination of variants (e.g., "Size: S / Color: Red").

### 4.2. Inventory Tracking

- Users can enable or disable inventory tracking on a per-product basis.
- When enabled, the system decrements the stock count upon a sale.
- A "Low Stock Threshold" can be set to notify the store owner when inventory is running low.
- If inventory tracking is disabled, the product is considered to have unlimited stock.

### 4.3. Related Products

- Store owners can manually select other products from their store to be displayed as "related products" on a product's page.
- This feature helps in cross-selling and increasing the average order value.
