const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const createCleaner = async (email, password, name) => {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, name, role: 'cleaner' })
    .select('id, email, name, role, created_at')
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const getCleaners = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, created_at')
    .eq('role', 'cleaner')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const updateCleaner = async (id, { name, email }) => {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .neq('id', id)
    .single();

  if (existing) {
    const error = new Error('Email already in use by another user');
    error.status = 409;
    throw error;
  }

  const { data, error } = await supabase
    .from('users')
    .update({ name, email })
    .eq('id', id)
    .eq('role', 'cleaner')
    .select('id, email, name, role, created_at')
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Cleaner not found');
    err.status = 404;
    throw err;
  }
  return data;
};

const updateCleanerPassword = async (id, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id', id)
    .eq('role', 'cleaner')
    .select('id, email, name, role')
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Cleaner not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Password updated successfully' };
};

const deleteCleaner = async (id) => {
  const { data: cleaner, error: fetchError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', id)
    .single();

  if (fetchError || !cleaner) {
    const error = new Error('Cleaner not found');
    error.status = 404;
    throw error;
  }

  if (cleaner.role !== 'cleaner') {
    const error = new Error('User is not a cleaner');
    error.status = 400;
    throw error;
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { message: 'Cleaner deleted successfully' };
};

module.exports = {
  createCleaner,
  getCleaners,
  updateCleaner,
  updateCleanerPassword,
  deleteCleaner,
};