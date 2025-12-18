import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Review, Product } from '../models/types.js';

const router = Router();

// Get all reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { sortBy = 'recent' } = req.query;
    
    let sortCriteria: any = { createdAt: -1 }; // Default: most recent
    
    if (sortBy === 'helpful') {
      sortCriteria = { helpful: -1 };
    } else if (sortBy === 'rating-high') {
      sortCriteria = { rating: -1 };
    } else if (sortBy === 'rating-low') {
      sortCriteria = { rating: 1 };
    }
    
    const reviews = await db.collection<Review>('reviews')
      .find({ productId: req.params.productId })
      .sort(sortCriteria)
      .toArray();
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get single review
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const review = await db.collection<Review>('reviews').findOne({ id: req.params.id });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Create review
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { productId, userId, orderId } = req.body;
    
    // Check if user already reviewed this product for this order
    const existingReview = await db.collection<Review>('reviews').findOne({ 
      productId, 
      userId, 
      orderId 
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    const review: Review = {
      id: new ObjectId().toString(),
      ...req.body,
      helpful: 0,
      verified: true, // Since linked to order
      createdAt: new Date()
    };
    
    const result = await db.collection<Review>('reviews').insertOne(review);
    
    // Update product rating and review count
    await updateProductRating(productId);
    
    const newReview = await db.collection<Review>('reviews').findOne({ _id: result.insertedId });
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { id, _id, createdAt, productId, userId, orderId, helpful, ...updateData } = req.body;
    
    const result = await db.collection<Review>('reviews').findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Recalculate product rating
    if (result.productId) {
      await updateProductRating(result.productId);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const review = await db.collection<Review>('reviews').findOne({ id: req.params.id });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await db.collection<Review>('reviews').deleteOne({ id: req.params.id });
    
    // Recalculate product rating
    await updateProductRating(review.productId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    const result = await db.collection<Review>('reviews').findOneAndUpdate(
      { id: req.params.id },
      { $inc: { helpful: 1 } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ error: 'Failed to mark review helpful' });
  }
});

// Add seller response to review
router.post('/:id/response', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { message } = req.body;
    
    const result = await db.collection<Review>('reviews').findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: { 
          sellerResponse: {
            message,
            respondedAt: new Date()
          }
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error adding seller response:', error);
    res.status(500).json({ error: 'Failed to add seller response' });
  }
});

// Helper function to update product rating
async function updateProductRating(productId: string) {
  const db = getDB();
  
  const reviews = await db.collection<Review>('reviews')
    .find({ productId })
    .toArray();
  
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;
  
  await db.collection<Product>('products').updateOne(
    { id: productId },
    { 
      $set: { 
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        updatedAt: new Date()
      } 
    }
  );
}

export default router;
