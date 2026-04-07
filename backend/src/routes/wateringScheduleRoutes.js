const express = require('express');
const WateringSchedule = require('../models/WateringSchedule');
const Plant = require('../models/Plant');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

async function authorizePlantOwner(user, plantId) {
  const plant = await Plant.findById(plantId);
  if (!plant) {
    const error = new Error('Plant not found');
    error.status = 404;
    throw error;
  }
  if (user.role !== 'admin' && plant.userId.toString() !== user.id) {
    const error = new Error('Not authorized for this plant');
    error.status = 403;
    throw error;
  }
  return plant;
}

router.post('/', authenticate, async (req, res, next) => {
  try {
    await authorizePlantOwner(req.user, req.body.plantId);
    const schedule = await WateringSchedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      const userPlants = await Plant.find({ userId: req.user.id }).select('_id');
      query.plantId = { $in: userPlants.map((p) => p._id) };
    }
    const schedules = await WateringSchedule.find(query).populate('plantId');
    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const schedule = await WateringSchedule.findById(req.params.id).populate('plantId');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (req.user.role !== 'admin' && schedule.plantId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this schedule' });
    }
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const schedule = await WateringSchedule.findById(req.params.id).populate('plantId');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (req.user.role !== 'admin' && schedule.plantId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this schedule' });
    }
    Object.assign(schedule, req.body);
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const schedule = await WateringSchedule.findById(req.params.id).populate('plantId');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (req.user.role !== 'admin' && schedule.plantId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this schedule' });
    }
    await WateringSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
