import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const RESTAURANT_ID = '6a7477e60e6f65690e77710f';

const seedWaiter = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if waiter exists
    const existing = await User.findOne({ username: 'waiter1' });
    if (existing) {
      console.log('Waiter user already exists.');
      process.exit(0);
    }

    await User.create({
      username: 'waiter1',
      password: 'password123',
      role: 'WAITER',
      restaurantId: RESTAURANT_ID,
    });

    console.log('Successfully seeded waiter user (username: waiter1, password: password123)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding waiter:', error);
    process.exit(1);
  }
};

seedWaiter();
