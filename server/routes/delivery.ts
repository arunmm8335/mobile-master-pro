import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { DeliveryPerson, User, Order } from '../models/types.js';

const router = Router();

// Get all delivery personnel
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status, available } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (available !== undefined) filter.isAvailable = available === 'true';
    
    const deliveryPersons = await db.collection<DeliveryPerson>('delivery_persons').find(filter).toArray();
    res.json(deliveryPersons);
  } catch (error) {
    console.error('Error fetching delivery persons:', error);
    res.status(500).json({ error: 'Failed to fetch delivery persons' });
  }
});

// Get single delivery person
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const deliveryPerson = await db.collection<DeliveryPerson>('delivery_persons').findOne({ id: req.params.id });
    
    if (!deliveryPerson) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    res.json(deliveryPerson);
  } catch (error) {
    console.error('Error fetching delivery person:', error);
    res.status(500).json({ error: 'Failed to fetch delivery person' });
  }
});

// Register as delivery person
router.post('/register', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { userId, ...deliveryData } = req.body;
    
    // Check if user already registered as delivery person
    const existing = await db.collection<DeliveryPerson>('delivery_persons').findOne({ userId });
    if (existing) {
      return res.status(400).json({ error: 'User already registered as delivery person' });
    }
    
    const deliveryPerson: DeliveryPerson = {
      id: new ObjectId().toString(),
      userId,
      ...deliveryData,
      isAvailable: true,
      rating: 0,
      totalDeliveries: 0,
      status: 'pending',
      assignedOrders: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection<DeliveryPerson>('delivery_persons').insertOne(deliveryPerson);
    
    // Update user role
    await db.collection<User>('users').updateOne(
      { id: userId },
      { 
        $set: { 
          role: 'delivery',
          deliveryPersonId: deliveryPerson.id,
          updatedAt: new Date()
        } 
      }
    );
    
    const newDeliveryPerson = await db.collection<DeliveryPerson>('delivery_persons').findOne({ _id: result.insertedId });
    res.status(201).json(newDeliveryPerson);
  } catch (error) {
    console.error('Error registering delivery person:', error);
    res.status(500).json({ error: 'Failed to register delivery person' });
  }
});

// Update delivery person
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { id, _id, createdAt, userId, ...updateData } = req.body;
    
    const result = await db.collection<DeliveryPerson>('delivery_persons').findOneAndUpdate(
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
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating delivery person:', error);
    res.status(500).json({ error: 'Failed to update delivery person' });
  }
});

// Update location
router.patch('/:id/location', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { latitude, longitude } = req.body;
    
    const result = await db.collection<DeliveryPerson>('delivery_persons').findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: { 
          currentLocation: { latitude, longitude },
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Toggle availability
router.patch('/:id/availability', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { isAvailable } = req.body;
    
    const result = await db.collection<DeliveryPerson>('delivery_persons').findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: { 
          isAvailable,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Assign order to delivery person
router.post('/:id/assign-order', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { orderId } = req.body;
    const deliveryPersonId = req.params.id;
    
    // Get delivery person
    const deliveryPerson = await db.collection<DeliveryPerson>('delivery_persons').findOne({ id: deliveryPersonId });
    if (!deliveryPerson) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    // Update order with delivery person
    await db.collection<Order>('orders').updateOne(
      { id: orderId },
      { 
        $set: { 
          deliveryPersonId,
          deliveryPersonName: deliveryPerson.userId, // Should get actual name from user
          status: 'out_for_delivery',
          updatedAt: new Date()
        },
        $push: {
          trackingUpdates: {
            status: 'out_for_delivery',
            message: 'Order out for delivery',
            timestamp: new Date()
          }
        }
      }
    );
    
    // Add order to delivery person's assigned orders
    const result = await db.collection<DeliveryPerson>('delivery_persons').findOneAndUpdate(
      { id: deliveryPersonId },
      { 
        $addToSet: { assignedOrders: orderId },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({ error: 'Failed to assign order' });
  }
});

// Get assigned orders
router.get('/:id/orders', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const deliveryPerson = await db.collection<DeliveryPerson>('delivery_persons').findOne({ id: req.params.id });
    
    if (!deliveryPerson) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    // Find all orders assigned to this delivery person
    const orders = await db.collection<Order>('orders')
      .find({ deliveryPersonId: req.params.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    res.status(500).json({ error: 'Failed to fetch assigned orders' });
  }
});

// Get delivery person by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const deliveryPerson = await db.collection<DeliveryPerson>('delivery_persons').findOne({ userId: req.params.userId });
    
    if (!deliveryPerson) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    res.json(deliveryPerson);
  } catch (error) {
    console.error('Error fetching delivery person:', error);
    res.status(500).json({ error: 'Failed to fetch delivery person' });
  }
});

export default router;
