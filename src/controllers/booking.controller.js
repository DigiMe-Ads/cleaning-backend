const bookingService = require('../services/booking.service');
const { validationResult } = require('express-validator');

const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_id, checkin_date, checkin_time, checkout_date, checkout_time, notes } = req.body;

    const booking = await bookingService.createBooking({
      property_id,
      checkin_date,
      checkin_time,
      checkout_date,
      checkout_time,
      notes,
      client_id: req.user.id,
    });

    return res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getClientBookings(req.user.id);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

const getMyCleanerBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getCleanerBookings(req.user.id);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

const getBookingsByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date query parameter is required' });
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    const bookings = await bookingService.getBookingsByDate(date);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

const getCleanerBookingsByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date query parameter is required' });
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    const bookings = await bookingService.getCleanerBookingsByDate(date, req.user.id);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBooking(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    return res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

const updateCleaningStatus = async (req, res, next) => {
  try {
    const { cleaning_status } = req.body;

    if (!cleaning_status) {
      return res.status(400).json({ message: 'cleaning_status is required' });
    }

    const allowed = ['unassigned', 'assigned', 'in_progress', 'done'];
    if (!allowed.includes(cleaning_status)) {
      return res.status(400).json({ message: `cleaning_status must be one of: ${allowed.join(', ')}` });
    }

    const booking = await bookingService.updateCleaningStatus(
      req.params.id,
      cleaning_status,
      req.user.id,
      req.user.role
    );
    return res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const result = await bookingService.deleteBooking(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getMyCleanerBookings,
  getBookingsByDate,
  getCleanerBookingsByDate,
  updateBooking,
  updateCleaningStatus,
  deleteBooking,
};