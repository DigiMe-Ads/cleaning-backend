const userService = require('../services/user.service');
const { validationResult } = require('express-validator');

const createCleaner = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, name } = req.body;
    const cleaner = await userService.createCleaner(email, password, name);
    return res.status(201).json(cleaner);
  } catch (err) {
    next(err);
  }
};

const getCleaners = async (req, res, next) => {
  try {
    const cleaners = await userService.getCleaners();
    return res.status(200).json(cleaners);
  } catch (err) {
    next(err);
  }
};

const updateCleaner = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email } = req.body;
    const cleaner = await userService.updateCleaner(req.params.id, { name, email });
    return res.status(200).json(cleaner);
  } catch (err) {
    next(err);
  }
};

const updateCleanerPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const result = await userService.updateCleanerPassword(req.params.id, password);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteCleaner = async (req, res, next) => {
  try {
    const result = await userService.deleteCleaner(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCleaner,
  getCleaners,
  updateCleaner,
  updateCleanerPassword,
  deleteCleaner,
};