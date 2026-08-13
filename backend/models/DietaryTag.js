import mongoose from 'mongoose';

const dietaryTagSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
    },
    nameAm: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

const DietaryTag = mongoose.model('DietaryTag', dietaryTagSchema);
export default DietaryTag;
