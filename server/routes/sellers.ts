import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db';
import { Seller, User } from '../models/types';

const router = Router();

// Get all sellers
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    
    const sellers = await db.collection<Seller>('sellers').find(filter).toArray();
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// Get single seller
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const seller = await db.collection<Seller>('sellers').findOne({ id: req.params.id });
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

// Register as seller
router.post('/register', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { userId, ...sellerData } = req.body;
    
    // Check if user already has a seller account
    const existingSeller = await db.collection<Seller>('sellers').findOne({ userId });
    if (existingSeller) {
      return res.status(400).json({ error: 'User already registered as seller' });
    }
    
    const seller: Seller = {
      id: new ObjectId().toString(),
      userId,
      ...sellerData,
      rating: 0,
      totalReviews: 0,
      totalSales: 0,
      status: 'pending',
      commission: 10, // Default 10% commission
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection<Seller>('sellers').insertOne(seller);
    
    // Update user role
    await db.collection<User>('users').updateOne(
      { id: userId },
      { 
        $set: { 
          role: 'seller',
          sellerId: seller.id,
          updatedAt: new Date()
        } 
      }
    );
    
    const newSeller = await db.collection<Seller>('sellers').findOne({ _id: result.insertedId });
    res.status(201).json(newSeller);
  } catch (error) {
    console.error('Error registering seller:', error);
    res.status(500).json({ error: 'Failed to register seller' });
  }
});

// Update seller
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { id, _id, createdAt, userId, ...updateData } = req.body;
    
    const result = await db.collection<Seller>('sellers').findOneAndUpdate(
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
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating seller:', error);
    res.status(500).json({ error: 'Failed to update seller' });
  }
});

// Approve/suspend seller (admin only)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status } = req.body;
    
    if (!['approved', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.collection<Seller>('sellers').findOneAndUpdate(
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
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating seller status:', error);
    res.status(500).json({ error: 'Failed to update seller status' });
  }
});

// Get seller by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const seller = await db.collection<Seller>('sellers').findOne({ userId: req.params.userId });
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Error fetching seller by user:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

export default router;
