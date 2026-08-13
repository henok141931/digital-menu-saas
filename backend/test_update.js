import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';

const MONGODB_URI = 'mongodb+srv://henokniguse19_db_user:Djg37vr6S4C8gz37@cluster0.ylgfu0p.mongodb.net/digital_menu_prod?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Create a mock update
    const updateQuery = {};
    const oldName = "Vegan";
    const newName = "Vegan Updated";

    const res = await MenuItem.updateMany(
      updateQuery,
      { $set: { "dietaryTags.$[elem]": newName } },
      { arrayFilters: [{ "elem": oldName }] }
    );
    console.log('Update result:', res);
  } catch (err) {
    console.error('Error during updateMany:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
