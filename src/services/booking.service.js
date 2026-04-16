const supabase = require('../config/supabase');

const createBooking = async ({ property_id, checkin_date, checkin_time, checkout_date, checkout_time, notes, client_id }) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      property_id, checkin_date, checkin_time,
      checkout_date, checkout_time, notes, client_id,
      cleaning_status: 'unassigned',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      users!bookings_client_id_fkey(name, email),
      properties(name, location),
      cleaners:users!bookings_cleaner_id_fkey(id, name, email)
    `)
    .order('checkout_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getClientBookings = async (clientId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties(name, location),
      cleaners:users!bookings_cleaner_id_fkey(id, name, email)
    `)
    .eq('client_id', clientId)
    .order('checkout_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getCleanerBookings = async (cleanerId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties(name, location),
      users!bookings_client_id_fkey(name, email)
    `)
    .eq('cleaner_id', cleanerId)
    .order('checkout_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getBookingsByDate = async (date) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      users!bookings_client_id_fkey(name, email),
      properties(name, location),
      cleaners:users!bookings_cleaner_id_fkey(id, name, email)
    `)
    .eq('checkout_date', date)
    .order('checkout_time', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getCleanerBookingsByDate = async (date, cleanerId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties(name, location),
      users!bookings_client_id_fkey(name, email)
    `)
    .eq('checkout_date', date)
    .eq('cleaner_id', cleanerId)
    .order('checkout_time', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const updateBooking = async (id, updates, userId, userRole) => {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (userRole === 'client' && booking.client_id !== userId) {
    const error = new Error('You do not have permission to update this booking');
    error.status = 403;
    throw error;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const updateCleaningStatus = async (id, cleaning_status, userId, userRole) => {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (userRole === 'cleaner' && booking.cleaner_id !== userId) {
    const error = new Error('You can only update cleaning status for your assigned bookings');
    error.status = 403;
    throw error;
  }

  // If cleaning is done, silently mark booking as completed
  const extraUpdates = cleaning_status === 'done' ? { status: 'completed' } : {};

  const { data, error } = await supabase
    .from('bookings')
    .update({ cleaning_status, ...extraUpdates })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const deleteBooking = async (id, userId, userRole) => {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (userRole === 'client' && booking.client_id !== userId) {
    const error = new Error('You do not have permission to delete this booking');
    error.status = 403;
    throw error;
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { message: 'Booking deleted successfully' };
};

module.exports = {
  createBooking,
  getAllBookings,
  getClientBookings,
  getCleanerBookings,
  getBookingsByDate,
  getCleanerBookingsByDate,
  updateBooking,
  updateCleaningStatus,
  deleteBooking,
};