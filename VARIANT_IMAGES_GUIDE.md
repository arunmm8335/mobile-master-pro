# Product Variants with Images - Usage Guide

## Overview
The system now supports product variants with unique images for each color, RAM, and storage combination - just like Amazon!

## How It Works

### 1. **Frontend Experience**
When a customer selects different options (e.g., "Blue" color or "8GB" RAM), the product images automatically update to show that specific variant.

### 2. **Data Structure**
Products can now have a `variants` array where each variant specifies:
- **color**: The color option (e.g., "Blue", "Black")
- **ram**: The RAM option (e.g., "8GB", "12GB")
- **storage**: The storage option (e.g., "128GB", "256GB")
- **images**: Array of image URLs for this specific combination
- **price** (optional): Override price for this variant
- **stock** (optional): Specific stock for this variant

### 3. **Example Product with Variants**

```json
{
  "id": "iphone15-pro",
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "price": 999,
  "colors": ["Black", "Blue", "Natural Titanium"],
  "ramOptions": ["8GB"],
  "storageOptions": ["128GB", "256GB", "512GB"],
  "variants": [
    {
      "color": "Black",
      "storage": "128GB",
      "images": [
        "https://example.com/iphone-black-1.jpg",
        "https://example.com/iphone-black-2.jpg",
        "https://example.com/iphone-black-3.jpg"
      ]
    },
    {
      "color": "Blue",
      "storage": "128GB",
      "images": [
        "https://example.com/iphone-blue-1.jpg",
        "https://example.com/iphone-blue-2.jpg",
        "https://example.com/iphone-blue-3.jpg"
      ]
    },
    {
      "color": "Natural Titanium",
      "storage": "256GB",
      "images": [
        "https://example.com/iphone-titanium-1.jpg",
        "https://example.com/iphone-titanium-2.jpg"
      ],
      "price": 1099
    }
  ]
}
```

## Adding Products with Variants

### Method 1: Directly in MongoDB

```javascript
db.products.insertOne({
  id: "samsung-s24-ultra",
  name: "Samsung Galaxy S24 Ultra",
  brand: "Samsung",
  price: 1199,
  sellerId: "seller123",
  sellerName: "Tech Store",
  rating: 0,
  totalReviews: 0,
  totalSales: 0,
  status: "approved",
  category: "phone",
  specs: ["Snapdragon 8 Gen 3", "200MP Camera", "S Pen"],
  description: "Premium flagship smartphone",
  image: "https://example.com/s24-default.jpg",
  colors: ["Titanium Gray", "Titanium Black", "Titanium Violet"],
  ramOptions: ["12GB"],
  storageOptions: ["256GB", "512GB", "1TB"],
  stock: 50,
  variants: [
    {
      color: "Titanium Gray",
      ram: "12GB",
      storage: "256GB",
      images: [
        "https://example.com/s24-gray-front.jpg",
        "https://example.com/s24-gray-back.jpg",
        "https://example.com/s24-gray-side.jpg"
      ],
      stock: 20
    },
    {
      color: "Titanium Black",
      ram: "12GB",
      storage: "256GB",
      images: [
        "https://example.com/s24-black-front.jpg",
        "https://example.com/s24-black-back.jpg"
      ],
      stock: 15
    },
    {
      color: "Titanium Violet",
      ram: "12GB",
      storage: "512GB",
      images: [
        "https://example.com/s24-violet-front.jpg",
        "https://example.com/s24-violet-back.jpg",
        "https://example.com/s24-violet-detail.jpg"
      ],
      price: 1299,
      stock: 15
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Method 2: Via API (for Sellers)

```javascript
// POST /api/products
const productData = {
  name: "Google Pixel 8 Pro",
  brand: "Google",
  price: 899,
  category: "phone",
  specs: ["Tensor G3", "50MP Camera", "AI Features"],
  description: "Google's flagship with advanced AI",
  image: "https://example.com/pixel8-default.jpg",
  colors: ["Obsidian", "Porcelain", "Bay"],
  ramOptions: ["12GB"],
  storageOptions: ["128GB", "256GB"],
  variants: [
    {
      color: "Obsidian",
      storage: "128GB",
      images: [
        "https://example.com/pixel-obsidian-1.jpg",
        "https://example.com/pixel-obsidian-2.jpg"
      ]
    },
    {
      color: "Porcelain",
      storage: "128GB",
      images: [
        "https://example.com/pixel-porcelain-1.jpg",
        "https://example.com/pixel-porcelain-2.jpg"
      ]
    },
    {
      color: "Bay",
      storage: "256GB",
      images: [
        "https://example.com/pixel-bay-1.jpg",
        "https://example.com/pixel-bay-2.jpg"
      ],
      price: 999
    }
  ]
};

await db.addProduct(productData);
```

## Image Naming Convention (Recommended)

For better organization, use a consistent naming pattern:

```
{brand}-{model}-{color}-{angle}-{size}.jpg

Examples:
- apple-iphone15pro-black-front-800x800.jpg
- apple-iphone15pro-black-back-800x800.jpg
- apple-iphone15pro-black-side-800x800.jpg
- apple-iphone15pro-blue-front-800x800.jpg
- samsung-s24ultra-gray-display-800x800.jpg
```

## Image Requirements

### Best Practices:
1. **Resolution**: Minimum 800x800px, recommended 1200x1200px
2. **Format**: JPG or PNG (JPG preferred for smaller file size)
3. **Aspect Ratio**: Square (1:1) works best
4. **Background**: White or transparent for consistency
5. **File Size**: Keep under 500KB per image (optimize before upload)
6. **Quantity**: 3-6 images per variant showing different angles

### Recommended Angles:
1. **Front view** - Main product image
2. **Back view** - Show rear design/camera
3. **Side view** - Display thickness/ports
4. **Detail shot** - Highlight unique features
5. **In-hand** - Show size comparison (optional)
6. **UI screenshot** - For phones (optional)

## Variant Matching Logic

The system automatically matches variants based on selected options:

1. **Exact Match**: Finds variant with matching color, RAM, and storage
2. **Partial Match**: Finds variant matching available options
3. **Fallback**: Uses default product images if no variant matches

```typescript
// Example matching logic
const currentVariant = product.variants?.find(variant => {
  const colorMatch = !variant.color || variant.color === selectedColor;
  const ramMatch = !variant.ram || variant.ram === selectedRam;
  const storageMatch = !variant.storage || variant.storage === selectedStorage;
  return colorMatch && ramMatch && storageMatch;
});
```

## Upload Methods

### 1. Using FileUpload Component (Admin/Seller Dashboard)
- Drag & drop images
- Automatic upload to server
- Returns image URLs to use in variants

### 2. External URLs (Easiest for Quick Setup)
- Use images hosted on Cloudinary, AWS S3, or similar
- Direct URLs work immediately
- No upload needed

### 3. Upload to /uploads Directory
```bash
# Copy images to uploads folder
cp product-images/* /home/roy1916/Downloads/mobilemaster-pro/uploads/

# Access via URL
http://localhost:5173/uploads/iphone-black-1.jpg
```

## Testing Variant Images

### 1. Create a Test Product:

```javascript
// In MongoDB or via API
{
  "name": "Test Phone",
  "brand": "TestBrand",
  "price": 500,
  "sellerId": "test-seller",
  "status": "approved",
  "category": "phone",
  "colors": ["Red", "Blue"],
  "storageOptions": ["64GB", "128GB"],
  "variants": [
    {
      "color": "Red",
      "storage": "64GB",
      "images": [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400"
      ]
    },
    {
      "color": "Blue",
      "storage": "128GB",
      "images": [
        "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400",
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400"
      ]
    }
  ]
}
```

### 2. Browse to Product Page:
- Navigate to the product
- Select "Red" color → Images change to red phone
- Select "Blue" color → Images change to blue phone
- Select "128GB" → If blue variant, shows blue images

## Tips for Sellers

### Organizing Variants:
1. **Start with common combinations** - Don't create variants for every possible combination
2. **Focus on visual differences** - Only create variants for options that look different
3. **Reuse images when appropriate** - If 128GB and 256GB look the same, use same images

### Example Strategy:
```
Product: iPhone 15 Pro
- Create variants for each COLOR (they look different)
- Don't create separate variants for each STORAGE (they look the same)
- Result: 3 variants (one per color), not 9 (3 colors × 3 storage options)
```

### Efficient Variant Structure:
```json
{
  "colors": ["Black", "Blue", "Titanium"],
  "storageOptions": ["128GB", "256GB", "512GB"],
  "variants": [
    {"color": "Black", "images": ["black-1.jpg", "black-2.jpg"]},
    {"color": "Blue", "images": ["blue-1.jpg", "blue-2.jpg"]},
    {"color": "Titanium", "images": ["titanium-1.jpg", "titanium-2.jpg"]}
  ]
}
```

## Advanced: Different Prices per Variant

```json
{
  "name": "Premium Phone",
  "price": 999,
  "variants": [
    {
      "color": "Standard",
      "storage": "128GB",
      "images": ["..."],
      "price": 999
    },
    {
      "color": "Special Edition",
      "storage": "512GB",
      "images": ["..."],
      "price": 1299
    }
  ]
}
```

## Troubleshooting

### Images Not Changing?
1. Check browser console for errors
2. Verify variant structure matches selected options
3. Ensure images array is not empty
4. Clear cache and reload

### Images Not Loading?
1. Verify image URLs are accessible
2. Check CORS settings if using external URLs
3. Ensure images are in `/uploads` folder if using local images
4. Check file permissions

### No Variants Showing?
1. Verify `colors`, `ramOptions`, or `storageOptions` arrays exist
2. Check that `variants` array is defined in product
3. Ensure product status is "approved"

## API Reference

### Get Product with Variants
```javascript
const product = await db.getProduct(productId);
// Returns product with variants array
```

### Add Product with Variants
```javascript
await db.addProduct({
  name: "...",
  // ... other fields
  variants: [...]
});
```

### Update Product Variants
```javascript
await db.updateProduct(productId, {
  variants: [
    // Updated variants array
  ]
});
```

## Migration for Existing Products

If you have existing products without variants, you can add them:

```javascript
// Update existing product
db.products.updateOne(
  { id: "existing-product-id" },
  {
    $set: {
      variants: [
        {
          color: "Default",
          images: ["existing-image-1.jpg", "existing-image-2.jpg"]
        }
      ]
    }
  }
);
```

## Summary

✅ **Variants system is ready to use!**
✅ **Images change automatically when options are selected**
✅ **Works with colors, RAM, storage, or any combination**
✅ **Supports different prices per variant**
✅ **Backward compatible with products without variants**

For questions or support, refer to the main [MARKETPLACE_REVAMP.md](MARKETPLACE_REVAMP.md) documentation.
