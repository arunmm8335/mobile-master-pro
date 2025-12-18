import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db';
import { Order, Product } from '../models/types';

const router = Router();

// Get all orders (admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status, sellerId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (sellerId) {
      filter['items.sellerId'] = sellerId;
    }
    
    const orders = await db
      .collection<Order>('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const orders = await db
      .collection<Order>('orders')
      .find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const order = await db.collection<Order>('orders').findOne({ id: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create an order
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    
    const orderData: Order = {
      ...req.body,
      id: new ObjectId().toString(),
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'pending',
      trackingUpdates: [{
        status: 'pending',
        message: 'Order placed successfully',
        timestamp: now
      }],
      estimatedDelivery,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<Order>('orders').insertOne(orderData);
    const newOrder = await db.collection<Order>('orders').findOne({ _id: result.insertedId });

    // Best-effort stock decrement and sales count
    try {
      const items = Array.isArray(orderData.items) ? orderData.items : [];
      for (const item of items) {
        if (!item?.productId || typeof item.quantity !== 'number') continue;
        await db.collection<Product>('products').updateOne(
          { id: item.productId },
          { 
            $inc: { 
              stock: -Math.max(0, Math.floor(item.quantity)),
              totalSales: Math.max(0, Math.floor(item.quantity))
            }, 
            $set: { updatedAt: new Date() } 
          }
        );
      }
    } catch (e) {
      console.warn('Stock decrement failed (non-fatal):', e);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status with tracking
router.patch('/:orderId/status', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { status, message, location, updatedBy } = req.body;
    
    // First get the current order
    const order = await db.collection<Order>('orders').findOne({ id: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const trackingUpdate = {
      status,
      message: message || `Order status updated to ${status}`,
      location,
      timestamp: new Date(),
      updatedBy
    };
    
    // Update trackingStages based on status
    const updatedStages = order.trackingStages?.map(stage => {
      const stageStatusMap: { [key: string]: string } = {
        'Order Placed': 'pending',
        'Confirmed': 'confirmed',
        'Shipped': 'shipped',
        'Out for Delivery': 'out_for_delivery',
        'Delivered': 'delivered'
      };
      
      const stageStatus = stageStatusMap[stage.stage];
      
      // Mark stage as completed if current status matches or is past this stage
      if (stageStatus) {
        const statusOrder = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
        const currentStatusIndex = statusOrder.indexOf(status);
        const stageStatusIndex = statusOrder.indexOf(stageStatus);
        
        if (currentStatusIndex >= stageStatusIndex) {
          return { ...stage, completed: true, timestamp: stage.timestamp || new Date() };
        }
      }
      
      return stage;
    }) || [];
    
    const result = await db.collection<Order>('orders').findOneAndUpdate(
      { id: req.params.orderId },
      { 
        $set: { 
          status,
          trackingStages: updatedStages,
          updatedAt: new Date()
        },
        $push: {
          trackingUpdates: trackingUpdate
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Cancel order
router.patch('/:orderId/cancel', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { reason } = req.body;
    
    const order = await db.collection<Order>('orders').findOne({ id: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }
    
    const result = await db.collection<Order>('orders').findOneAndUpdate(
      { id: req.params.orderId },
      { 
        $set: { 
          status: 'cancelled',
          cancellationReason: reason,
          updatedAt: new Date()
        },
        $push: {
          trackingUpdates: {
            status: 'cancelled',
            message: `Order cancelled. Reason: ${reason || 'Not specified'}`,
            timestamp: new Date()
          }
        }
      },
      { returnDocument: 'after' }
    );
    
    // Restore stock
    try {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        if (!item?.productId || typeof item.quantity !== 'number') continue;
        await db.collection<Product>('products').updateOne(
          { id: item.productId },
          { 
            $inc: { 
              stock: Math.max(0, Math.floor(item.quantity)),
              totalSales: -Math.max(0, Math.floor(item.quantity))
            }, 
            $set: { updatedAt: new Date() } 
          }
        );
      }
    } catch (e) {
      console.warn('Stock restoration failed (non-fatal):', e);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Assign delivery person to order
router.patch('/:orderId/assign-delivery', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { deliveryPersonId, deliveryPersonName } = req.body;
    
    // First get the order to check current trackingStages
    const order = await db.collection<Order>('orders').findOne({ id: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update tracking stages - mark Confirmed as complete
    const updatedStages = order.trackingStages?.map(stage => {
      if (stage.stage === 'Confirmed') {
        return { ...stage, completed: true, timestamp: new Date() };
      }
      return stage;
    }) || [];

    const result = await db.collection<Order>('orders').findOneAndUpdate(
      { id: req.params.orderId },
      { 
        $set: { 
          deliveryPersonId,
          deliveryPersonName,
          status: 'confirmed',
          trackingStages: updatedStages,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    // Update delivery person's current orders
    await db.collection('delivery_persons').updateOne(
      { id: deliveryPersonId },
      { 
        $inc: { currentOrders: 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error assigning delivery person:', error);
    res.status(500).json({ error: 'Failed to assign delivery person' });
  }
});

// Generate OTP for delivery
router.post('/:orderId/generate-otp', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const result = await db.collection<Order>('orders').findOneAndUpdate(
      { id: req.params.orderId },
      { 
        $set: { 
          deliveryOtp: otp,
          status: 'out_for_delivery',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update tracking stages
    const stages = result.trackingStages || [];
    const updatedStages = stages.map(stage => {
      if (stage.stage === 'Out for Delivery') {
        return { ...stage, completed: true, timestamp: new Date() };
      }
      return stage;
    });
    
    await db.collection<Order>('orders').updateOne(
      { id: req.params.orderId },
      { $set: { trackingStages: updatedStages } }
    );
    
    res.json({ otp });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Confirm delivery (after OTP verification)
router.post('/:orderId/confirm-delivery', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    const order = await db.collection<Order>('orders').findOne({ id: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    const stages = order.trackingStages || [];
    const updatedStages = stages.map(stage => {
      if (stage.stage === 'Delivered') {
        return { ...stage, completed: true, timestamp: new Date() };
      }
      return stage;
    });
    
    const result = await db.collection<Order>('orders').findOneAndUpdate(
      { id: req.params.orderId },
      { 
        $set: { 
          status: 'delivered',
          deliveryOtp: null,
          deliveredAt: new Date(),
          trackingStages: updatedStages,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    // Update delivery person stats
    if (order.deliveryPersonId) {
      await db.collection('delivery_persons').updateOne(
        { id: order.deliveryPersonId },
        { 
          $inc: { 
            currentOrders: -1,
            completedDeliveries: 1,
            earnings: order.total * 0.05 // 5% commission
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // Update seller stats
    if (order.sellerId) {
      await db.collection('sellers').updateOne(
        { id: order.sellerId },
        { 
          $inc: { totalSales: 1 },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({ error: 'Failed to confirm delivery' });
  }
});

export default router;

