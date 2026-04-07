const express = require('express');
const CareGuide = require('../models/CareGuide');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const guide = await CareGuide.create(req.body);
    res.status(201).json(guide);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const guides = await CareGuide.find();
    res.json(guides);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const guide = await CareGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Care guide not found' });
    res.json(guide);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const guide = await CareGuide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!guide) return res.status(404).json({ message: 'Care guide not found' });
    res.json(guide);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorizeRole('admin'), async (req, res, next) => {
  try {
    const guide = await CareGuide.findByIdAndDelete(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Care guide not found' });
    res.json({ message: 'Care guide deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
