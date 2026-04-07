const express = require('express');
const Plant = require('../models/Plant');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Create plant (authenticated users)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const payload = { ...req.body, userId: req.user.id };
    const plant = await Plant.create(payload);
    res.status(201).json(plant);
  } catch (error) {
    next(error);
  }
});

// Get all plants (admin) or own plants
router.get('/', authenticate, async (req, res, next) => {
  try {
    let plants;
    if (req.user.role === 'admin') {
      plants = await Plant.find();
    } else {
      plants = await Plant.find({ userId: req.user.id });
    }
    res.json(plants);
  } catch (error) {
    next(error);
  }
});

// Get plant by id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('userId', 'username email');
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    if (req.user.role !== 'admin' && plant.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this plant' });
    }
    res.json(plant);
  } catch (error) {
    next(error);
  }
});

// Update plant
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    if (req.user.role !== 'admin' && plant.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this plant' });
    }
    Object.assign(plant, req.body);
    await plant.save();
    res.json(plant);
  } catch (error) {
    next(error);
  }
});

// Delete plant
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    if (req.user.role !== 'admin' && plant.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this plant' });
    }
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plant deleted' });
  } catch (error) {
    next(error);
  }
});

// Upload plant image
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/:id/image', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    if (req.user.role !== 'admin' && plant.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to upload image for this plant' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    plant.imageUrl = imageUrl;
    await plant.save();
    res.json({ message: 'Image uploaded', imageUrl });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
