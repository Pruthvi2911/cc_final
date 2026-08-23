const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['income', 'expense'],
      lowercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Salary',
        'Freelance',
        'Investment',
        'Housing',
        'Food & Dining',
        'Transportation',
        'Utilities',
        'Entertainment',
        'Shopping',
        'Health & Medical',
        'Education',
        'Other'
      ]
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters']
    }
  },
  {
    timestamps: true
  }
);

// Index for fast query filtering
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
