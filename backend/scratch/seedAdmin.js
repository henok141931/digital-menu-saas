import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const RESTAURANT_ID = '6a7477e60e6f65690e77710f';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const existing = await User.findOne({ username: 'admin1' });
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    await User.create({
      username: 'admin1',
      password: 'password123',
      role: 'ADMIN',
      restaurantId: RESTAURANT_ID,
    });

    console.log('Successfully seeded admin user (username: admin1, password: password123)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
