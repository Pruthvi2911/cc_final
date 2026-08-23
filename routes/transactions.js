const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions - Fetch all transactions with filtering
router.get('/', async (req, res) => {
  try {
    const { type, category, search } = req.query;
    let query = {};

    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/transactions/summary - Aggregated stats for KPI cards & charts
router.get('/summary', async (req, res) => {
  try {
    const transactions = await Transaction.find({});

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += Number(t.amount);
      } else if (t.type === 'expense') {
        totalExpense += Number(t.amount);
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate: Number(savingsRate),
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({ success: false, error: 'Please provide title, amount, type, and category' });
    }

    const transaction = await Transaction.create({
      title,
      amount: Number(amount),
      type,
      category,
      date: date || new Date(),
      notes
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
