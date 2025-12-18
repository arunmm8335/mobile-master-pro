import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db';
import { Product } from '../models/types';

const router = Router();

// Get all products with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { 
      category, 
      sellerId, 
      status = 'approved', 
      minPrice, 
      maxPrice, 
      search,
      brand,
      featured,
      sortBy = 'recent'
    } = req.query;
    
    const filter: any = {};
    
    // Only show approved products for customers, all for admin
    if (status) filter.status = status;
    
    if (category) filter.category = category;
    if (sellerId) filter.sellerId = sellerId;
    if (brand) filter.brand = brand;
    if (featured === 'true') filter.featured = true;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    let sortCriteria: any = { createdAt: -1 };
    if (sortBy === 'price-low') sortCriteria = { price: 1 };
    else if (sortBy === 'price-high') sortCriteria = { price: -1 };
    else if (sortBy === 'rating') sortCriteria = { rating: -1 };
    else if (sortBy === 'popular') sortCriteria = { totalSales: -1 };
    
    const products = await db.collection<Product>('products')
      .find(filter)
      .sort(sortCriteria)
      .toArray();
      
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const product = await db.collection<Product>('products').findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const productData: Product = {
      ...req.body,
      id: new ObjectId().toString(),
      rating: 0,
      totalReviews: 0,
      totalSales: 0,
      status: req.body.status || 'pending', // Needs admin approval
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection<Product>('products').insertOne(productData);
    const newProduct = await db.collection<Product>('products').findOne({ _id: result.insertedId });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { id, _id, createdAt, ...updateData } = req.body;
    
    const result = await db.collection<Product>('products').findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Approve/reject product (admin only)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status } = req.body;
    
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.collection<Product>('products').findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: { 
          status,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const result = await db.collection<Product>('products').deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
