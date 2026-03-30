const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const bookingValidation = [
  body('property_id').notEmpty().withMessage('Property ID is required'),
  body('checkin_date').optional().isDate().withMessage('Valid checkin date required'),
  body('checkin_time').optional().notEmpty().withMessage('Checkin time required'),
  body('checkout_date').isDate().withMessage('Valid checkout date is required'),
  body('checkout_time').notEmpty().withMessage('Checkout time is required'),
];

// Client routes
router.post('/', protect, allowRoles('client', 'admin'), bookingValidation, bookingController.createBooking);
router.get('/my-bookings', protect, allowRoles('client'), bookingController.getMyBookings);

// Cleaner routes
router.get('/my-assignments', protect, allowRoles('cleaner'), bookingController.getMyCleanerBookings);
router.get('/my-assignments/by-date', protect, allowRoles('cleaner'), bookingController.getCleanerBookingsByDate);

// Shared — cleaner or admin can update cleaning status
router.patch('/:id/cleaning-status', protect, allowRoles('cleaner', 'admin'), bookingController.updateCleaningStatus);

// Client or admin
router.delete('/:id', protect, allowRoles('client', 'admin'), bookingController.deleteBooking);
router.patch('/:id', protect, allowRoles('client', 'admin'), bookingController.updateBooking);

// Admin only
router.get('/by-date', protect, allowRoles('admin'), bookingController.getBookingsByDate);
router.get('/', protect, allowRoles('admin'), bookingController.getAllBookings);

module.exports = router;