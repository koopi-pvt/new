'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Search, ChevronDown, ChevronRight, Headphones, Mail, MessageCircle, Book, HelpCircle, Package, CreditCard, Settings, Store, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Real FAQ content based on actual Koopi features
const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    color: 'blue',
    faqs: [
      {
        id: 'create-account',
        question: 'How do I create a Koopi store?',
        answer: `Creating your Koopi store is simple and free:

1. Click "Start for Free" on the homepage
2. Enter your email and create a password
3. Choose a unique store name (this becomes your URL: /store/yourname)
4. Complete the registration form
5. Verify your email address

Your store is created instantly! You can start adding products right away.`
      },
      {
        id: 'store-name',
        question: 'Can I change my store name after registration?',
        answer: `Currently, store names cannot be changed after registration because they become part of your store URL (/store/yourname) and are used across the platform.

Choose your store name carefully during registration. Tips:
- Keep it short and memorable
- Use your brand name
- Avoid numbers and special characters
- Make it easy to spell

If you absolutely need to change it, contact support@koopi.lk and we'll help you.`
      },
      {
        id: 'first-steps',
        question: 'What should I do after creating my account?',
        answer: `Follow these steps to get your store ready:

1. **Add Products** (Dashboard → Products → Add Product)
   - You need at least 1 product to enable your website

2. **Customize Your Store** (Dashboard → Website)
   - Upload your logo
   - Choose a theme
   - Set your brand colors
   - Write your hero section text

3. **Enable Your Website** (Dashboard → Website)
   - Toggle "Enable Website" to make your store public

4. **Set Up Notifications** (Dashboard → Settings)
   - Configure email notifications
   - Set up low-stock alerts

5. **Create Promotions** (Dashboard → Promotions)
   - Add discount codes to attract customers

6. **Share Your Store**
   - Your URL: yoursite.com/store/yourname
   - Share on social media
   - Add to your bio/website`
      },
      {
        id: 'free-forever',
        question: 'Is Koopi really free forever?',
        answer: `Yes! Koopi's core platform is 100% free with:

✓ Unlimited products
✓ Unlimited orders
✓ All core features
✓ Website customization
✓ Order management
✓ Discount codes
✓ Email notifications
✓ Customer chat
✓ No transaction fees on COD

We believe every entrepreneur should have access to professional e-commerce tools without barriers.

Optional paid features (coming soon):
- Online payment processing (Stripe/PayPal fees apply)
- Premium themes
- Advanced analytics
- Custom domain names`
      }
    ]
  },
  {
    id: 'products',
    title: 'Products & Inventory',
    icon: Package,
    color: 'purple',
    faqs: [
      {
        id: 'product-requirements',
        question: 'What are the requirements for adding a product?',
        answer: `Every product must meet these requirements:

**Required Fields:**
- Title: Clear product name
- Description: Minimum 20 words
- Category: Must select one
- Tags: Minimum 4 tags (comma-separated)
- Price: Minimum LKR 100.00

**Recommended:**
- At least 1 product image
- Enable inventory tracking
- Add product variants if applicable

The system will validate these requirements and show specific errors if something is missing.`
      },
      {
        id: 'product-images',
        question: 'What are the image requirements?',
        answer: `Product Image Guidelines:

**Formats Accepted:**
- PNG, JPG, JPEG, GIF
- Maximum 10MB per image

**Recommended Specs:**
- Size: 1000x1000 pixels or larger
- Aspect Ratio: Square (1:1) works best
- Background: White or transparent
- Quality: High resolution for zoom

**Best Practices:**
- Upload multiple angles (front, back, side, detail)
- Show product in use when possible
- Use good lighting
- Keep backgrounds clean
- First image = main product photo
- Drag and drop to reorder images

**Tip:** Better images = higher conversion rates!`
      },
      {
        id: 'variants',
        question: 'How do product variants work?',
        answer: `Variants let you sell different versions of the same product.

**Common Variant Types:**
- Size: Small, Medium, Large, XL, XXL
- Color: Red, Blue, Green, Black, White
- Material: Cotton, Polyester, Silk
- Style: Classic, Modern, Vintage

**How to Create:**
1. Go to Step 2 when adding/editing product
2. Click "Add Variant Option"
3. Enter variant name (e.g., "Size")
4. Add values: Small, Medium, Large
5. Add more variant types if needed

**Automatic Combinations:**
If you add Size (S, M, L) and Color (Red, Blue):
- Small / Red
- Small / Blue
- Medium / Red
- Medium / Blue
- Large / Red
- Large / Blue

**Inventory per Variant:**
Enable inventory tracking to set stock for each combination separately.

**Current Limitation:**
All variants share the same price. Variant-specific pricing coming soon!`
      },
      {
        id: 'inventory-tracking',
        question: 'How does inventory tracking work?',
        answer: `Inventory tracking helps you manage stock and prevent overselling.

**Enable Tracking:**
1. Toggle "Track Inventory" in Step 2
2. Enter quantity in stock
3. For variants: Set stock per combination

**How It Works:**
- Stock decreases automatically when orders are placed
- Stock increases when orders are cancelled
- "Out of Stock" shown when stock reaches 0
- Customers can't order out-of-stock items

**Low Stock Alerts:**
Automatic notifications when stock falls below 10 units:
- Email notification sent to you
- Dashboard notification badge
- Alert shown in Products list

**Best Practices:**
- Enable for all physical products
- Disable for digital products (unlimited)
- Set realistic stock levels
- Restock before hitting zero
- Monitor low-stock alerts regularly`
      },
      {
        id: 'delete-product',
        question: 'Can I delete or hide products?',
        answer: `Yes, you have full control over your products.

**To Delete a Product:**
1. Go to Dashboard → Products
2. Click Edit on the product
3. Scroll to bottom
4. Click "Delete Product" button
5. Confirm deletion

⚠️ Warning: Deletion is permanent and cannot be undone!

**To Hide Instead of Delete:**
1. Edit the product
2. Change Status to "Inactive" or "Draft"
3. Save changes
4. Product won't show on storefront
5. Can be reactivated anytime

**When to Delete vs Hide:**
- Delete: Product is permanently discontinued
- Hide: Temporarily out of stock or seasonal item

**Impact on Orders:**
Past orders with deleted products are not affected. Order history remains intact.`
      }
    ]
  },
  {
    id: 'orders',
    title: 'Orders & Fulfillment',
    icon: CreditCard,
    color: 'green',
    faqs: [
      {
        id: 'order-status',
        question: 'What do the different order statuses mean?',
        answer: `Understanding Order Statuses:

**Pending** (Yellow)
- Order just placed by customer
- Awaiting your confirmation
- Payment method: COD
- Action: Review and accept order

**Processing** (Blue)
- Order confirmed by you
- Preparing items for shipment
- Packing in progress
- Action: Pack and prepare shipping

**Shipped** (Purple)
- Package sent to customer
- In transit to delivery address
- Add tracking number if available
- Action: Monitor delivery

**Delivered** (Green)
- Customer received package
- Order completed successfully
- Transaction finished
- Action: Request review (optional)

**Cancelled** (Red)
- Order cancelled by seller or buyer
- Inventory restored automatically
- No further action needed
- Action: Archive

**Changing Status:**
1. Open order details
2. Click "Update Status" dropdown
3. Select new status
4. Customer receives automatic email
5. Save changes

**Best Practice:**
Update status promptly so customers know what's happening with their order.`
      },
      {
        id: 'buyer-seller-chat',
        question: 'How does the buyer-seller chat work?',
        answer: `Built-in chat for each order helps you communicate directly with customers.

**Where to Find It:**
1. Dashboard → Orders
2. Click "View" on any order
3. Scroll to bottom for chat box

**Features:**
- Real-time messaging
- Chat history saved per order
- Both parties get notifications
- Mobile-friendly interface

**Common Uses:**
- Confirm delivery address
- Answer product questions
- Provide shipping updates
- Resolve issues
- Thank customers

**Response Time:**
Try to respond within 24 hours for best customer experience.

**Professional Tips:**
- Be polite and friendly
- Use proper grammar
- Provide clear information
- Set expectations clearly
- Thank customers for their patience

**Privacy:**
Chats are private between you and the customer. No other buyers can see the conversation.`
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Pricing',
    icon: CreditCard,
    color: 'amber',
    faqs: [
      {
        id: 'payment-methods',
        question: 'What payment methods does Koopi support?',
        answer: `Currently Available:

**Cash on Delivery (COD)**
✓ Currently active
✓ Customer pays when they receive
✓ No online transaction fees
✓ Available for all stores
✓ Most popular in Sri Lanka

**Coming Soon:**

**Stripe Integration**
- Credit/debit cards
- International payments
- Automatic processing
- 2.9% + LKR 30 per transaction

**PayPal Integration**
- PayPal balance
- Credit/debit cards via PayPal
- International payments
- ~3.5% + fees per transaction

**How COD Works:**
1. Customer places order
2. You receive notification
3. Process and ship order
4. Customer pays delivery person
5. You mark as delivered

**Note:** Online payment processing fees are charged by Stripe/PayPal, not by Koopi.`
      },
      {
        id: 'minimum-price',
        question: 'Why is there a minimum price of LKR 100?',
        answer: `The minimum price of LKR 100.00 exists to:

**Reasons:**
1. Cover basic transaction costs
2. Ensure quality product listings
3. Prevent spam/low-value items
4. Maintain platform standards
5. Support sustainable businesses

**If Your Product Costs Less:**
- Bundle multiple items together
- Offer as add-on to other products
- Create multi-packs
- Add value through packaging

**Examples:**
- Instead of: 1 sticker for LKR 50
- Try: 3-pack stickers for LKR 150

**Exemptions:**
Currently no exemptions. All products must be priced at minimum LKR 100.00.`
      }
    ]
  },
  {
    id: 'website',
    title: 'Website & Customization',
    icon: Store,
    color: 'indigo',
    faqs: [
      {
        id: 'enable-website',
        question: 'How do I make my store public?',
        answer: `Enable your public storefront:

**Requirements:**
- At least 1 product added
- Product must be active (not draft)

**Steps to Enable:**
1. Go to Dashboard → Website
2. Find "Store Website Status" card
3. Toggle "Enable Website"
4. Click "Save Changes"
5. Store is now live!

**Your Store URL:**
yoursite.com/store/yourname

**Before Going Live Checklist:**
✓ Add at least 3-5 products
✓ Upload store logo
✓ Customize hero section
✓ Choose a theme
✓ Set brand colors
✓ Write About section
✓ Test on mobile
✓ Check product images
✓ Set up discount codes
✓ Configure notifications

**Tip:**
Take time to customize before going live. First impressions matter!`
      },
      {
        id: 'themes',
        question: 'What themes are available?',
        answer: `Koopi offers 4 professional themes:

**1. Classic Theme**
- Traditional e-commerce layout
- Black and white color scheme
- Professional and clean
- Best for: Formal businesses, B2B

**2. Modern Theme**
- Contemporary design
- Bold colors and animations
- Eye-catching layouts
- Best for: Fashion, lifestyle

**3. Minimalist Theme**
- Simple and elegant
- Lots of white space
- Product-focused
- Best for: Art, photography, premium

**4. Bold Theme**
- Vibrant and energetic
- High contrast colors
- Dynamic elements
- Best for: Electronics, sports, youth

**How to Change:**
1. Dashboard → Website
2. Scroll to "Templates"
3. Click theme preview
4. Auto-installs with defaults
5. Customize colors
6. Save changes`
      }
    ]
  },
  {
    id: 'promotions',
    title: 'Promotions & Marketing',
    icon: Settings,
    color: 'pink',
    faqs: [
      {
        id: 'create-promo',
        question: 'How do I create a discount code?',
        answer: `Create promotional discount codes:

**Steps:**
1. Dashboard → Promotions
2. Click "Create Promotion"
3. Fill in the form

**Required Fields:**
- Discount Code (e.g., SUMMER2025)
- Promotion Name (internal)
- Discount Type (percentage/fixed/free shipping)
- Discount Value (if applicable)
- Applies To (entire order or specific products)

**Optional Conditions:**
- Minimum Purchase Amount
- Start & End Dates
- Usage Limits (total and per customer)
- New Products Only checkbox

4. Click "Create Promotion"

**Discount Types:**
- **Percentage:** 20% off
- **Fixed Amount:** LKR 500 off
- **Free Shipping:** Remove shipping cost

**Best Practices:**
✓ Create memorable codes
✓ Set expiration dates
✓ Limit uses to control costs
✓ Track performance`
      }
    ]
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: Array<{ categoryId: string; faqId: string; score: number }> = [];

    helpCategories.forEach(category => {
      category.faqs.forEach(faq => {
        const questionMatch = faq.question.toLowerCase().includes(query) ? 3 : 0;
        const answerMatch = faq.answer.toLowerCase().includes(query) ? 1 : 0;
        const score = questionMatch + answerMatch;

        if (score > 0) {
          results.push({ categoryId: category.id, faqId: faq.id, score });
        }
      });
    });

    return results.sort((a, b) => b.score - a.score);
  }, [searchQuery]);

  const toggleFaq = (faqId: string) => {
    setOpenFaqs(prev =>
      prev.includes(faqId) ? prev.filter(id => id !== faqId) : [...prev, faqId]
    );
  };

  const filteredCategories = useMemo(() => {
    if (!selectedCategory) return helpCategories;
    return helpCategories.filter(cat => cat.id === selectedCategory);
  }, [selectedCategory]);

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600' },
      green: { bg: 'bg-green-500', text: 'text-green-600' },
      amber: { bg: 'bg-amber-500', text: 'text-amber-600' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500 mb-6 shadow-2xl"
            >
              <Headphones className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Search our knowledge base or browse categories below
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-lg"
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.slice(0, 10).map((result, index) => {
                    const category = helpCategories.find(c => c.id === result.categoryId);
                    const faq = category?.faqs.find(f => f.id === result.faqId);
                    if (!category || !faq) return null;

                    return (
                      <div
                        key={index}
                        className="text-left p-4 rounded-lg bg-white border border-gray-200"
                      >
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory(result.categoryId);
                            toggleFaq(result.faqId);
                          }}
                          className="w-full flex items-start justify-between group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="font-semibold text-gray-900 group-hover:text-blue-500 text-left">
                                {faq.question}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{category.title}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: Book,
                title: 'Documentation',
                desc: 'Complete guides',
                href: '/docs',
                color: 'blue',
              },
              {
                icon: MessageCircle,
                title: 'Community',
                desc: 'Ask the community',
                href: '/community',
                color: 'purple',
              },
              {
                icon: Mail,
                title: 'Email Support',
                desc: 'support@koopi.lk',
                href: 'mailto:support@koopi.lk',
                color: 'green',
              },
              {
                icon: AlertCircle,
                title: 'System Status',
                desc: 'Check uptime',
                href: '/status',
                color: 'amber',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              const colors = getColorClasses(item.color);

              return (
                <motion.a
                  key={index}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-xl p-6 hover:shadow-2xl transition-all hover:scale-105"
                >
                  <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.a>
              );
            })}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                !selectedCategory
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              All Categories
            </button>
            {helpCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="backdrop-blur-xl bg-white/70 rounded-[24px] border border-white/50 shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-600">{category.faqs.length} articles</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {category.faqs.map((faq) => {
                      const isOpen = openFaqs.includes(faq.id);

                      return (
                        <div
                          key={faq.id}
                          className="bg-white/50 rounded-xl border border-gray-200/50 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full flex items-center justify-between text-left p-5 hover:bg-white/80 transition-colors group"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <HelpCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                              <span className="font-semibold text-gray-900 group-hover:text-blue-500">
                                {faq.question}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 pl-14">
                                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                    {faq.answer}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Still Need Help */}
          <div className="mt-16 text-center backdrop-blur-xl bg-blue-500 rounded-[24px] p-12 shadow-2xl">
            <Mail className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Our support team is here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@koopi.lk"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg active:scale-95"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </a>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg active:scale-95 border-2 border-white/20"
              >
                <Book className="w-5 h-5" />
                View Documentation
              </Link>
            </div>
            <p className="text-blue-100 text-sm mt-6">
              Response time: 24-48 hours • Monday-Saturday
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
