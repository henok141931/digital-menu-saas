import mongoose from 'mongoose';
import { updateDietaryTag } from './controllers/menuController.js';
import DietaryTag from './models/DietaryTag.js';
import MenuItem from './models/MenuItem.js';

const MONGODB_URI = 'mongodb+srv://henokniguse19_db_user:Djg37vr6S4C8gz37@cluster0.ylgfu0p.mongodb.net/digital_menu_prod?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const tag = await DietaryTag.findOne();
    if (!tag) {
      console.log('No tag found');
      return;
    }
    
    // Mock req and res
    const req = {
      params: { id: tag._id.toString() },
      body: { name: tag.name + ' Mocked' },
      user: { role: 'SUPER_ADMIN' }
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log(`Response [${this.statusCode}]:`, data);
      }
    };
    
    await updateDietaryTag(req, res);
    
    // revert
    tag.name = tag.name.replace(' Mocked', '');
    await tag.save();
    await MenuItem.updateMany(
      {},
      { $set: { "dietaryTags.$[elem]": tag.name } },
      { arrayFilters: [{ "elem": tag.name + ' Mocked' }] }
    );
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
