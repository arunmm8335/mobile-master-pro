import { Router, Request, Response } from 'express';
import { getDB } from '../db.js';
import { User } from '../models/types.js';

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { email, password } = req.body;
    
    // Find user by email
    const user = await db.collection<User>('users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user
    const userData: User = {
      id: new Date().getTime().toString(),
      name,
      email,
      password, // In production, hash with bcrypt
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection<User>('users').insertOne(userData);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;
    res.status(201).json({ 
      user: userWithoutPassword,
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Logout (client-side mainly, but can be used for session cleanup)
router.post('/logout', async (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

export default router;
