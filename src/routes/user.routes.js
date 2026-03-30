const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const cleanerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
];

const createValidation = [
  ...cleanerValidation,
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/create-cleaner', protect, allowRoles('admin'), createValidation, userController.createCleaner);
router.get('/cleaners', protect, allowRoles('admin'), userController.getCleaners);
router.patch('/cleaners/:id', protect, allowRoles('admin'), cleanerValidation, userController.updateCleaner);
router.patch('/cleaners/:id/password', protect, allowRoles('admin'), userController.updateCleanerPassword);
router.delete('/cleaners/:id', protect, allowRoles('admin'), userController.deleteCleaner);

module.exports = router;