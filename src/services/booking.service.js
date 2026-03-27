const supabase = require('../config/supabase');

const createBooking = async ({ property_id, checkin_date, checkin_time, checkout_date, checkout_time, notes, client_id }) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      property_id,
      checkin_date,
      checkin_time,
      checkout_date,
      checkout_time,
      notes,
      client_id,
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
      users(name, email),
      properties(name, location)
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
      properties(name, location)
    `)
    .eq('client_id', clientId)
    .order('checkout_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getBookingsByDate = async (date) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      users(name, email),
      properties(name, location)
    `)
    .eq('checkout_date', date)
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

const deleteBooking = async (id, userId, userRole) => {
  // First fetch the booking
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

  // Clients can only delete their own bookings
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
  getBookingsByDate,
  updateBooking,
  deleteBooking,
};