'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Book, Search, ChevronRight, ChevronDown, Home, Package, Palette, ShoppingCart, Tags, Users, Mail, Code, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Real documentation content based on actual Koopi features
const documentation = {
  'getting-started': {
    title: 'Getting Started',
    icon: Home,
    color: 'blue',
    articles: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        content: `## Welcome to Koopi!

Get your e-commerce store up and running in under 5 minutes.

### Step 1: Create Your Account
1. Click "Start for Free" on the homepage
2. Enter your email and password
3. Choose a unique store name (this will be your URL: /store/yourname)
4. Complete the registration

### Step 2: Set Up Your Store Profile
- Add your store description
- Upload a logo (recommended: 200x60px PNG or SVG)
- Choose your primary business category

### Step 3: Add Your First Product
Navigate to **Dashboard → Products → Add Product**

### What's Next?
- Customize your website appearance
- Create discount codes
- Enable your public storefront

**Congratulations!** You're ready to start selling. 🎉`
      },
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        content: `## Understanding Your Dashboard

Your Koopi dashboard is your command center for managing your entire store.

### Main Sections

**Home Dashboard**
- Quick look at orders, revenue, and products
- Recent activity feed
- Quick action buttons

**Orders**
- View all customer orders
- Filter by status: Pending, Processing, Shipped, Delivered, Cancelled
- Search by order number or customer name
- Update order status
- Print invoices

**Products**
- Manage your product catalog
- Add, edit, or delete products
- Track inventory levels
- View product performance

**Promotions**
- Create and manage discount codes
- Track promotion usage
- Set conditions and limits

**Website**
- Customize your store appearance
- Choose themes and colors
- Manage store sections
- Enable/disable public access

**Customers**
- View customer list
- See order history per customer

**Settings**
- Store information
- Payment settings
- Notification preferences

### Navigation Tips
- Use the sidebar for quick access to all sections
- Dashboard is mobile-responsive - works great on all devices
- Unsaved changes are highlighted with a blue dot`
      },
      {
        id: 'first-product',
        title: 'Adding Your First Product',
        content: `## Create Your First Product

Follow this 3-step process to add products to your store.

### Step 1: Basic Information

**Product Title** (Required)
- Clear, descriptive name
- Example: "Premium Cotton T-Shirt - Blue"

**Description** (Required - Min 20 words)
- Describe your product in detail
- Highlight key features and benefits
- Tell customers what makes it special
- Use clear, engaging language

**Category** (Required)
Choose from:
- Fashion & Apparel
- Electronics
- Home & Garden
- Art & Crafts
- Toys & Games
- Other

**Tags** (Required - Min 4 tags)
- Add comma-separated tags
- Example: "summer, cotton, casual, comfortable"
- Helps customers find your products

### Step 2: Media & Inventory

**Product Images**
- Upload multiple images (PNG, JPG, GIF up to 10MB)
- First image becomes the main product photo
- Drag and drop to reorder
- Minimum 1 image recommended

**Product Variants** (Optional)
- Add size options: Small, Medium, Large, XL
- Add color options: Red, Blue, Green, etc.
- Create custom variants: Material, Style, etc.
- Each variant can have its own price

**Inventory Tracking**
- Toggle on to track stock levels
- Set quantity for simple products
- Set stock per variant for variable products
- Receive low-stock alerts automatically

### Step 3: Pricing

**Price** (Required - Min LKR 100.00)
- Set your product price
- Currency: Sri Lankan Rupees (LKR)
- Must be at least LKR 100.00

**Compare at Price** (Optional)
- Show original price for discounts
- Creates "Save X%" display for customers

**Tax Settings**
- Check "Charge tax on this product"
- Tax calculated based on customer location

### Save Your Product

Click **Save Product** to publish. Your first product will trigger a celebration animation! 🎊

### Pro Tips
- Use high-quality images for better conversions
- Write detailed descriptions (customers can't touch the product)
- Use all variant options to reduce SKU count
- Enable inventory tracking to prevent overselling`
      }
    ]
  },
  'products': {
    title: 'Product Management',
    icon: Package,
    color: 'purple',
    articles: [
      {
        id: 'product-variants',
        title: 'Product Variants',
        content: `## Managing Product Variants

Variants let you sell different versions of the same product.

### What Are Variants?

Variants are different options for the same product:
- **Size:** Small, Medium, Large, XL, XXL
- **Color:** Red, Blue, Green, Black, White
- **Material:** Cotton, Polyester, Silk, Wool
- **Style:** Classic, Modern, Vintage

### Creating Variants

1. Navigate to Step 2 in the product form
2. Click "Add Variant Option"
3. Enter variant name (e.g., "Size")
4. Add values: Small, Medium, Large
5. Click "Add Another Option" for more variant types

### Variant Combinations

Koopi automatically generates all combinations:

**Example:**
- Variant 1: Size (Small, Medium, Large)
- Variant 2: Color (Red, Blue)

**Generated Combinations:**
1. Small / Red
2. Small / Blue
3. Medium / Red
4. Medium / Blue
5. Large / Red
6. Large / Blue

### Variant-Specific Inventory

When inventory tracking is enabled:
- Set stock quantity for each variant combination
- Track inventory separately per variant
- Receive low-stock alerts per variant

### Variant Pricing

Currently, all variants share the same price. Individual variant pricing is coming soon!

### Best Practices

✅ **Do:**
- Use consistent naming (Small, Medium, Large vs S, M, L)
- Add all relevant variant options upfront
- Keep variant names short and clear

❌ **Avoid:**
- Too many variants (keep under 50 combinations)
- Unclear variant names ("Option 1", "Type A")
- Mixing variant types (Size + Price in one variant)`
      },
      {
        id: 'inventory-management',
        title: 'Inventory Management',
        content: `## Inventory Tracking

Keep track of your stock levels and prevent overselling.

### Enabling Inventory Tracking

1. Go to Step 2 when creating/editing a product
2. Toggle on "Track Inventory"
3. Enter quantity in stock

### How It Works

**For Simple Products:**
- Set one quantity for the entire product
- Stock decreases automatically when orders are placed
- Increases when orders are cancelled

**For Products with Variants:**
- Set quantity for each variant combination
- Each variant tracks stock independently
- Total stock = sum of all variant stock

### Low Stock Alerts

**Automatic Notifications When:**
- Product stock falls below 10 units
- Any variant stock falls below 10 units

**You'll Receive:**
- Email notification
- In-dashboard notification badge
- Alert shown in Products list

### Out of Stock Behavior

**When stock reaches 0:**
- Product shows "Out of Stock" on storefront
- Add to Cart button is disabled
- Customers can't place orders
- Product remains visible (unless you manually hide it)

### Manual Stock Adjustments

1. Go to Products
2. Click Edit on the product
3. Navigate to Step 2
4. Update the quantity
5. Save changes

### Inventory Reports

View stock levels:
- Products page shows current stock
- Filter products by low stock
- Export inventory reports (coming soon)

### Best Practices

- Enable tracking for physical products
- Set up low-stock alerts
- Regular stock audits
- Restock before items hit zero
- Use variant tracking for complex products`
      },
      {
        id: 'product-categories',
        title: 'Product Categories',
        content: `## Product Categories

Organize your products for easy browsing.

### Available Categories

**Physical Products:**
- Fashion & Apparel
- Electronics
- Home & Garden
- Art & Crafts
- Toys & Games
- Other

**Digital Products:**
- E-books
- Online Courses
- Software
- Templates
- Music & Audio
- Graphics & Design

**Services:**
- Consulting
- Coaching
- Design Services
- Development
- Marketing
- Other Services

### Setting Categories

1. When creating a product, select from the Category dropdown
2. Category is required for all products
3. Choose the most relevant category

### How Customers Use Categories

- Browse products by category
- Filter search results
- Discover similar products

### Category Best Practices

✅ Choose the most specific category
✅ Use consistent categorization
✅ Review categories periodically

❌ Don't put products in wrong categories
❌ Don't skip category selection`
      }
    ]
  },
  'website': {
    title: 'Website Customization',
    icon: Palette,
    color: 'green',
    articles: [
      {
        id: 'themes',
        title: 'Choosing a Theme',
        content: `## Store Themes

Koopi offers 4 professional themes for your store.

### Available Themes

**1. Classic Theme**
- Traditional e-commerce layout
- Clean and professional
- Black and white color scheme
- Perfect for: Formal businesses, professional products

**2. Modern Theme**
- Contemporary design
- Bold colors and gradients
- Eye-catching layouts
- Perfect for: Fashion, lifestyle products

**3. Minimalist Theme**
- Simple and elegant
- Lots of white space
- Focus on products
- Perfect for: Art, photography, premium products

**4. Bold Theme**
- Vibrant and energetic
- Strong visual elements
- High contrast
- Perfect for: Youth products, electronics, sports

### How to Change Theme

1. Go to **Dashboard → Website**
2. Scroll to "Templates" section
3. Click on a theme preview
4. Theme installs automatically with default colors
5. Click **Save Changes**

### Customizing Your Theme

After selecting a theme, customize:
- Primary color
- Accent color
- Background color
- Text color
- Font family

### Theme Preview

Use the Live Preview section to see changes in real-time before saving.

### Switching Themes

You can switch themes anytime:
- Content (products, orders) remains unchanged
- Only visual appearance changes
- Custom colors are reset to theme defaults
- Hero section content is preserved`
      },
      {
        id: 'customization',
        title: 'Store Customization',
        content: `## Customize Your Store

Make your store reflect your brand identity.

### Logo Upload

**Requirements:**
- Format: PNG or SVG recommended
- Size: 200x60 pixels ideal
- Max file size: 5MB
- Transparent background recommended

**How to Upload:**
1. Go to Website → Logo & Branding
2. Click "Upload" button
3. Select your logo file
4. Logo appears immediately
5. Save changes

### Color Customization

**Primary Color**
- Main brand color
- Used for buttons, links, headers
- Choose a color that represents your brand

**Accent Color**
- Secondary highlight color
- Used for hover states, badges
- Should complement primary color

**Background Color**
- Main page background
- Usually white or light gray
- Affects overall feel

**Text Color**
- Main text color
- Usually dark gray or black
- Must have good contrast with background

### Hero Section

**Hero Title**
- Main headline on your store
- Example: "Welcome to [Your Store]"
- Keep it short and impactful

**Hero Subtitle**
- Supporting text
- 1-2 sentences
- Explain what you sell or your value proposition

**CTA Button Text**
- Call-to-action button text
- Default: "Shop Now"
- Other options: "Explore Products", "Start Shopping"

**Background Image** (Optional)
- Add a background image URL
- Use high-quality images (1920x1080 recommended)
- Keep it subtle - don't overpower text

**Content Alignment**
- Left: Traditional layout
- Center: Modern, symmetrical look

### About Section

**Show/Hide Toggle**
- Enable to show About section
- Disable to hide it

**Section Title**
- Default: "About [Your Store]"
- Customize to your preference

**Content**
- Tell your brand story
- Explain what makes you unique
- Build trust with customers
- 2-3 paragraphs recommended

### Font Selection

**Available Fonts:**
- **Inter:** Modern, clean, highly readable
- **System Default:** Uses visitor's system font
- **Serif:** Classic, traditional, elegant
- **Monospace:** Technical, unique, modern

### Footer Customization

**Custom Footer Text**
- Add copyright notice
- Example: "© 2025 Your Store. All rights reserved."

**"Powered by Koopi"**
- Toggle to show/hide
- Free users: Must keep enabled
- Pro users: Can be hidden

### Live Preview

All changes appear in real-time in the Live Preview section. Review before saving!

### Section Ordering

Drag and drop sections to reorder:
- Hero Section
- About Section
- Products (automatically added)
- Footer (always at bottom)`
      }
    ]
  },
  'orders': {
    title: 'Orders & Fulfillment',
    icon: ShoppingCart,
    color: 'amber',
    articles: [
      {
        id: 'order-management',
        title: 'Managing Orders',
        content: `## Order Management

Efficiently process and track customer orders.

### Order Statuses

**Pending**
- Order just placed by customer
- Payment confirmed (for COD)
- Waiting for you to process
- **Action:** Review and accept order

**Processing**
- Order confirmed and accepted
- Preparing items for shipment
- Packaging in progress
- **Action:** Prepare shipment

**Shipped**
- Package sent to customer
- In transit
- Add tracking number if available
- **Action:** Wait for delivery confirmation

**Delivered**
- Customer received the package
- Order complete
- Transaction finished
- **Action:** Follow up for review

**Cancelled**
- Order cancelled by you or customer
- Refund processed if applicable
- Inventory restored
- **Action:** None (archived)

### Viewing Orders

1. Go to **Dashboard → Orders**
2. See all orders in a table view
3. Filter by status using tabs
4. Search by order number or customer name

### Order Details

Click "View" on any order to see:
- Order number
- Customer information
- Shipping address
- Items ordered (with variants)
- Pricing breakdown
- Discount codes applied
- Payment method
- Order timeline

### Updating Order Status

1. Open order details
2. Click "Update Status" dropdown
3. Select new status
4. Customer receives email notification automatically
5. Save changes

### Printing Invoices

1. Open order details
2. Click "Print Invoice" button
3. Professional PDF invoice generated
4. Print or save for records

### Buyer-Seller Chat

**Real-time messaging per order:**
- Open order details
- Use chat box at bottom
- Send messages to customer
- Customer can reply
- Both parties receive notifications

**Use chat for:**
- Order clarifications
- Shipping updates
- Address confirmations
- Customer service

### Order Search & Filters

**Filter by Status:**
- All Orders
- Pending
- Processing
- Shipped
- Delivered
- Cancelled

**Search by:**
- Order number (#KOO-12345)
- Customer name
- Customer email
- Phone number

### Bulk Actions

Coming soon:
- Export orders to CSV
- Bulk status updates
- Print multiple invoices

### Best Practices

✅ Update order status promptly
✅ Communicate with customers proactively
✅ Verify addresses before shipping
✅ Add tracking numbers when available
✅ Respond to chat messages within 24 hours

❌ Don't leave orders in Pending too long
❌ Don't skip status updates
❌ Don't ignore customer messages`
      }
    ]
  },
  'promotions': {
    title: 'Promotions & Marketing',
    icon: Tags,
    color: 'pink',
    articles: [
      {
        id: 'discount-codes',
        title: 'Creating Discount Codes',
        content: `## Discount Codes

Boost sales with strategic promotions and discount codes.

### Types of Discounts

**1. Percentage Off**
- Example: 20% off, 50% off
- Applied to order subtotal or specific products
- Value: 1-100%

**2. Fixed Amount Off**
- Example: LKR 500 off, LKR 1000 off
- Flat discount in rupees
- Applied to order total

**3. Free Shipping**
- Removes shipping charges
- Great for first-time customers
- Encourages larger orders

### Creating a Promotion

1. Go to **Dashboard → Promotions**
2. Click "Create Promotion"
3. Fill in the form:

**Discount Code**
- Unique code customers will enter
- Example: SUMMER2025, WELCOME50
- Auto-generate or create custom
- Case-insensitive for customers

**Promotion Name**
- Internal name for tracking
- Example: "Summer Sale", "Black Friday"

**Description** (Optional)
- Internal notes
- Not visible to customers

**Discount Type & Value**
- Choose type (percentage/fixed/free shipping)
- Enter discount value
- For percentage: 1-100
- For fixed: Amount in LKR

### Application Settings

**Applies To:**

**Option 1: Entire Order**
- Discount applies to all items in cart
- Simplest option
- Most popular with customers

**Option 2: Specific Products**
- Select which products qualify
- Great for clearing specific inventory
- Can select multiple products
- Note: Must have products created first

### Conditions & Limits

**Minimum Purchase Amount**
- Order must be at least X amount
- Example: LKR 2000 minimum
- Encourages larger orders

**Start Date & Time**
- When promotion becomes active
- Leave empty for immediate activation

**End Date & Time**
- When promotion expires
- Leave empty for no expiration

**Maximum Total Uses**
- How many times code can be used across all customers
- Example: First 100 customers
- Leave empty for unlimited

**Maximum Uses Per Customer**
- How many times one customer can use it
- Usually 1 for customer acquisition
- Leave empty for unlimited

**New Products Only**
- Apply only to products less than 30 days old
- Automatic based on product creation date
- Great for promoting new launches

### Managing Promotions

**View All Promotions:**
- Active/Inactive status
- Usage statistics
- Total uses
- Total discount given

**Edit Promotion:**
- Click edit icon
- Modify any setting
- Save changes

**Activate/Deactivate:**
- Toggle status on/off
- Deactivated codes can't be used
- Reactivate anytime

**Delete Promotion:**
- Permanently remove
- Cannot be undone
- Usage history is lost

### Promotion Statistics

**Dashboard Stats:**
- Total promotion codes
- Active codes
- Expired codes
- Total times used

**Per-Promotion Stats:**
- Current uses
- Usage limit
- Customers who used it
- Revenue impact

### Best Practices

**Code Creation:**
✅ Make codes memorable (SUMMER2025)
✅ Use urgency (FLASH24, WEEKEND50)
✅ Brand-specific codes (KOOPI20)
❌ Avoid confusing codes (XY7ZK9P2)

**Discount Strategy:**
✅ Start with 10-20% for testing
✅ Use free shipping for cart abandonment
✅ Create urgency with time limits
✅ Promote on social media
❌ Don't give too high discounts (hurts margins)
❌ Don't make codes permanent (loses urgency)

**Conditions:**
✅ Set minimum purchase to increase AOV
✅ Limit uses to control costs
✅ Set expiration dates for urgency
❌ Don't make conditions too strict

### Common Promotion Strategies

**Welcome Discount**
- 10-15% off for new customers
- Code: WELCOME10 or FIRST15
- Max 1 use per customer

**Seasonal Sales**
- 20-30% off during holidays
- Code: SUMMER25, NEWYEAR30
- Time-limited (1-7 days)

**Free Shipping**
- Free shipping on orders over LKR 2000
- Code: FREESHIP
- Increases average order value

**Product Launch**
- 15% off new products only
- Code: LAUNCH15
- First 100 customers
- Enable "New Products Only" checkbox

**Flash Sale**
- 30-50% off for 24 hours
- Code: FLASH24
- Create urgency
- Heavy promotion needed

**Cart Abandonment**
- 10% off sent via email
- Unique codes per customer
- Recovers lost sales`
      }
    ]
  },
  'technical': {
    title: 'Technical Details',
    icon: Code,
    color: 'cyan',
    articles: [
      {
        id: 'tech-stack',
        title: 'Technology Stack',
        content: `## Koopi Technology Stack

### Frontend Framework
**Next.js 15.5**
- React 19
- Server-side rendering
- Turbopack for fast builds
- App Router architecture

### Styling
**Tailwind CSS 4**
- Utility-first CSS
- Custom color system
- Responsive design built-in
- Glassmorphism aesthetic

### Backend & Database
**Firebase**
- **Authentication:** Secure user management
- **Firestore:** Real-time NoSQL database
- **Storage:** Image and file hosting
- **Security Rules:** Protected data access

### Email Service
**SendGrid**
- Transactional emails
- Order confirmations
- Status update notifications
- Low stock alerts

### UI Components
**Framer Motion**
- Smooth animations
- Page transitions
- Interactive elements

**Lucide React**
- Icon library
- Consistent iconography

### Features
- **Drag & Drop:** @dnd-kit/core
- **State Management:** React Context
- **Form Handling:** Native React
- **Type Safety:** TypeScript

### Performance
- Image optimization
- Code splitting
- Lazy loading
- GPU-accelerated animations

### Hosting
- Vercel deployment
- Edge network CDN
- Automatic SSL
- Global distribution`
      },
      {
        id: 'requirements',
        title: 'Product Requirements',
        content: `## Product Requirements Reference

### Required Fields

**Product Title**
- Must not be empty
- Clear and descriptive
- Recommended: Include key features

**Description**
- **Minimum: 20 words**
- Tell customers about the product
- Highlight benefits and features
- Use clear, engaging language
- Counter shows current word count

**Category**
- **Required:** Must select a category
- Choose most relevant category
- Helps with product organization

**Tags**
- **Minimum: 4 tags**
- Comma-separated
- Example: "summer, cotton, casual, comfortable"
- Counter shows current tag count
- Helps with search and discovery

**Price**
- **Minimum: LKR 100.00**
- Currency: Sri Lankan Rupees (LKR)
- Can include decimals
- Example: 1250.00

### Optional Fields

**Compare At Price**
- Show original price
- Creates "Save X%" display
- Must be higher than regular price

**Vendor**
- Brand or manufacturer name
- Optional for most stores

**Type**
- Product classification
- Auto-filled based on store type

**Inventory Tracking**
- Optional but recommended
- Prevents overselling
- Triggers low stock alerts

**Product Variants**
- Optional but powerful
- Reduces SKU complexity
- Per-variant inventory tracking

**Related Products**
- Optional cross-selling
- Recommend similar items
- Select from existing products

### Image Requirements

**Format**
- PNG, JPG, JPEG, GIF
- Multiple images supported

**Size**
- Maximum: 10MB per image
- Recommended: 1000x1000px or larger
- Square images work best

**Quantity**
- Minimum: 1 image recommended
- Maximum: Unlimited
- First image = main product image

### Validation Rules

When you click "Save Product", Koopi checks:

✅ Title is not empty
✅ Description has at least 20 words
✅ Category is selected
✅ At least 4 tags provided
✅ Price is at least LKR 100.00

If any validation fails, you'll see an alert with specific issue.

### Best Practices

**Descriptions:**
- 50-150 words ideal
- Break into paragraphs
- Use bullet points for features
- Include dimensions, materials, care instructions

**Tags:**
- Use 6-10 tags
- Mix generic and specific
- Include: category, color, season, style, material
- Example: "dress, summer, blue, casual, cotton, maxi"

**Pricing:**
- Research competitor prices
- Factor in all costs
- Leave room for discounts
- Consider psychology (999 vs 1000)`
      }
    ]
  }
};

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: Array<{ categoryId: string; articleId: string; matches: number }> = [];

    Object.entries(documentation).forEach(([categoryId, category]) => {
      category.articles.forEach(article => {
        const titleMatch = article.title.toLowerCase().includes(query) ? 2 : 0;
        const contentMatch = article.content.toLowerCase().includes(query) ? 1 : 0;
        const matches = titleMatch + contentMatch;

        if (matches > 0) {
          results.push({ categoryId, articleId: article.id, matches });
        }
      });
    });

    return results.sort((a, b) => b.matches - a.matches);
  }, [searchQuery]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectArticle = (categoryId: string, articleId: string) => {
    setSelectedCategory(categoryId);
    setSelectedArticle(articleId);
    setSearchQuery('');
    if (!expandedSections.includes(categoryId)) {
      setExpandedSections(prev => [...prev, categoryId]);
    }
  };

  const currentArticle = useMemo(() => {
    if (!selectedCategory || !selectedArticle) return null;
    const category = documentation[selectedCategory as keyof typeof documentation];
    return category?.articles.find(a => a.id === selectedArticle) || null;
  }, [selectedCategory, selectedArticle]);

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-bold text-gray-900 mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6 text-gray-700 leading-relaxed mb-1">
            {line.replace('- ', '').replace(/\*\*/g, '')}
          </li>
        );
      }
      if (line.startsWith('✅') || line.startsWith('❌')) {
        return (
          <div key={index} className="flex items-start gap-2 ml-4 mb-2">
            <span className="mt-1">{line.substring(0, 2)}</span>
            <span className="text-gray-700 leading-relaxed">{line.substring(2)}</span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-3">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Koopi Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to know to run your store
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/70 border border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-base"
              />
            </div>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mt-4 backdrop-blur-xl bg-white/90 rounded-[20px] border border-white/50 shadow-xl p-4"
              >
                <p className="text-sm text-gray-600 mb-3">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((result, index) => {
                    const category = documentation[result.categoryId as keyof typeof documentation];
                    const article = category.articles.find(a => a.id === result.articleId);
                    if (!article) return null;

                    return (
                      <button
                        key={index}
                        onClick={() => selectArticle(result.categoryId, result.articleId)}
                        className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          <span className="font-semibold text-gray-900 group-hover:text-blue-500">
                            {article.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6 mt-1">{category.title}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contents</h3>
                <nav className="space-y-1">
                  {Object.entries(documentation).map(([categoryId, category]) => {
                    const Icon = category.icon;
                    const isExpanded = expandedSections.includes(categoryId);

                    return (
                      <div key={categoryId}>
                        <button
                          onClick={() => toggleSection(categoryId)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-colors group"
                        >
                          <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                          <span className="flex-1 text-left">{category.title}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-6 mt-1 space-y-1 overflow-hidden"
                            >
                              {category.articles.map(article => (
                                <button
                                  key={article.id}
                                  onClick={() => selectArticle(categoryId, article.id)}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                    selectedArticle === article.id
                                      ? 'bg-blue-500 text-white font-medium'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {article.title}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Article Content */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-xl p-8 sm:p-12">
                {currentArticle ? (
                  <motion.div
                    key={currentArticle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
                      {currentArticle.title}
                    </h1>
                    <div className="prose prose-gray max-w-none">
                      {renderContent(currentArticle.content)}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome to Koopi Documentation
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Select a guide from the sidebar to get started
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button
                        onClick={() => selectArticle('getting-started', 'quick-start')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                      >
                        Quick Start Guide
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all shadow-lg active:scale-95 border border-gray-300"
                      >
                        Create Your Store
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
