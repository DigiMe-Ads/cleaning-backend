const propertyService = require('../services/property.service');
const { validationResult } = require('express-validator');

const createProperty = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location } = req.body;
    const property = await propertyService.createProperty({
      name,
      location,
      owner_id: req.user.id,
    });

    return res.status(201).json(property);
  } catch (err) {
    next(err);
  }
};

const getMyProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getPropertiesByOwner(req.user.id);
    return res.status(200).json(properties);
  } catch (err) {
    next(err);
  }
};

const getAllProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getAllProperties();
    return res.status(200).json(properties);
  } catch (err) {
    next(err);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const result = await propertyService.deleteProperty(
      req.params.id,
      req.user.id
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  getAllProperties,
  deleteProperty,
};