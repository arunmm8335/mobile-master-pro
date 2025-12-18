import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { User } from '../models/types.js';

const router = Router();

// Get all users (admin only - add auth middleware later)
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const users = await db.collection<User>('users')
      .find({}, { projection: { password: 0 } }) // Exclude password
      .toArray();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const user = await db.collection<User>('users')
      .findOne({ id: req.params.id }, { projection: { password: 0 } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (registration)
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { email, password, name, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const userData: User = {
      id: new ObjectId().toString(),
      name,
      email,
      password, // In production, hash this with bcrypt
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection<User>('users').insertOne(userData);
    const newUser = await db.collection<User>('users')
      .findOne({ _id: result.insertedId }, { projection: { password: 0 } });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const result = await db.collection<User>('users').deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user profile
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { name, email, phone, address, city, state, pincode, profileImage } = req.body;
    
    console.log('Updating user:', req.params.id);
    console.log('Update data received:', { name, email, phone, address, city, state, pincode, imageSize: profileImage?.length });
    
    // First, check if user exists
    const existingUser = await db.collection<User>('users').findOne({ id: req.params.id });
    console.log('Existing user found:', existingUser ? 'yes' : 'no');
    if (existingUser) {
      console.log('Existing user data:', { id: existingUser.id, name: existingUser.name, email: existingUser.email });
    }
    
    const updateData: any = {
      name,
      email,
      updatedAt: new Date()
    };
    
    // Add optional fields if provided
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    // Update the user
    await db.collection<User>('users').updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    // Fetch the updated user
    const updatedUser = await db.collection<User>('users').findOne(
      { id: req.params.id },
      { projection: { password: 0 } }
    );
    
    if (!updatedUser) {
      console.error('User not found after update:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', updatedUser.id);
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

export default router;
