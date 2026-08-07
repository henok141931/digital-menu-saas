import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    customerName: {
      type: String,
      default: 'Anonymous',
    }
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
