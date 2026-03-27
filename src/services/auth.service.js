const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

const createUser = async (email, password, name, role = 'client') => {
  const existing = await findByEmail(email);
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, name, role })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const generateToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const signup = async (email, password, name) => {
  const user = await createUser(email, password, name, 'client');
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

const login = async (email, password) => {
  const user = await findByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

const createAdmin = async (email, password, name) => {
  const user = await createUser(email, password, name, 'admin');
  return sanitizeUser(user);
};

module.exports = { signup, login, createAdmin, findByEmail, findById };