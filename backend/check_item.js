import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';

const MONGODB_URI = 'mongodb+srv://henokniguse19_db_user:Djg37vr6S4C8gz37@cluster0.ylgfu0p.mongodb.net/digital_menu_prod?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    const item = await MenuItem.findOne();
    console.log('Sample item:', item);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
