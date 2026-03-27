const supabase = require('../config/supabase');

const createProperty = async ({ name, location, owner_id }) => {
  const { data, error } = await supabase
    .from('properties')
    .insert({ name, location, owner_id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const getPropertiesByOwner = async (owner_id) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', owner_id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const getAllProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const deleteProperty = async (id, owner_id) => {
  const { data: property, error: findError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !property) {
    const error = new Error('Property not found');
    error.status = 404;
    throw error;
  }

  if (property.owner_id !== owner_id) {
    const error = new Error('You do not have permission to delete this property');
    error.status = 403;
    throw error;
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { message: 'Property deleted successfully' };
};

module.exports = {
  createProperty,
  getPropertiesByOwner,
  getAllProperties,
  deleteProperty,
};