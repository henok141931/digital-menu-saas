import mongoose from 'mongoose';
import DietaryTag from './models/DietaryTag.js';
import MenuItem from './models/MenuItem.js';

const MONGODB_URI = 'mongodb+srv://henokniguse19_db_user:Djg37vr6S4C8gz37@cluster0.ylgfu0p.mongodb.net/digital_menu_prod?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const tag = await DietaryTag.findOne();
    if (!tag) {
      console.log('No tag found');
      return;
    }
    
    console.log('Tag found:', tag);
    
    const oldName = tag.name;
    const newName = tag.name + ' Updated';
    tag.name = newName;
    const updatedTag = await tag.save();
    
    console.log('Tag updated to:', updatedTag.name);

    if (oldName !== updatedTag.name) {
      const updateQuery = {};
      
      const res = await MenuItem.updateMany(
        updateQuery,
        { $set: { "dietaryTags.$[elem]": updatedTag.name } },
        { arrayFilters: [{ "elem": oldName }] }
      );
      console.log('MenuItem update result:', res);
    }
    
    // revert
    tag.name = oldName;
    await tag.save();
    await MenuItem.updateMany(
        {},
        { $set: { "dietaryTags.$[elem]": oldName } },
        { arrayFilters: [{ "elem": newName }] }
      );
      console.log('Reverted');
  } catch (err) {
    console.error('Error during updateDietaryTag simulation:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
