const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const propertyController = require('../controllers/property.controller');
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const propertyValidation = [
  body('name').notEmpty().withMessage('Property name is required'),
  body('location').notEmpty().withMessage('Property location is required'),
];

// Client routes
router.post('/', protect, allowRoles('client', 'admin'), propertyValidation, propertyController.createProperty);
router.get('/my-properties', protect, allowRoles('client'), propertyController.getMyProperties);
router.delete('/:id', protect, allowRoles('client', 'admin'), propertyController.deleteProperty);

// Admin routes
router.get('/', protect, allowRoles('admin'), propertyController.getAllProperties);

module.exports = router;