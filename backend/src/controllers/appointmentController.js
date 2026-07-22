const Appointment = require('../models/Appointment');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// Helper to format HTTP error
const createError = (msg, status = 400) => {
  const err = new Error(msg);
  err.statusCode = status;
  return err;
};

// POST /api/v1/appointments/request (Create PENDING appointment request)
const requestAppointment = async (req, res) => {
  const { property_id, propertyId, requested_date, requestedDate, time_slot, requestedTimeSlot, message, notes } = req.body;
  const targetPropId = property_id || propertyId || req.params.id;
  const targetDate = requested_date || requestedDate;
  const targetSlot = time_slot || requestedTimeSlot;
  const targetMessage = message || notes || null;

  if (!targetPropId) throw createError('Property ID is required.', 400);
  if (!targetDate) throw createError('Requested appointment date is required.', 400);
  if (!targetSlot) throw createError('Requested time slot is required.', 400);

  const parsedDate = new Date(targetDate);
  if (isNaN(parsedDate.getTime())) throw createError('Invalid date format.', 400);

  const property = await Property.findById(targetPropId);
  if (!property) throw createError('Property not found.', 404);

  const owner_id = property.seller_id || property.seller;
  if (!owner_id) throw createError('Property owner details not found.', 400);

  // Prevent property owner from requesting appointment on own property
  if (String(owner_id) === String(req.user._id)) {
    throw createError('Property owners cannot request appointments for their own listings.', 400);
  }

  // Prevent duplicate PENDING request for same property, date, slot by same buyer
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingPending = await Appointment.findOne({
    property_id: targetPropId,
    buyer_id: req.user._id,
    requested_date: { $gte: startOfDay, $lte: endOfDay },
    time_slot: targetSlot,
    status: 'PENDING',
  });

  if (existingPending) {
    throw createError('You already have a pending appointment request for this property, date, and time slot.', 400);
  }

  // Check if slot is already ACCEPTED by any buyer
  const existingAccepted = await Appointment.findOne({
    property_id: targetPropId,
    requested_date: { $gte: startOfDay, $lte: endOfDay },
    time_slot: targetSlot,
    status: 'ACCEPTED',
  });

  if (existingAccepted) {
    throw createError('This time slot is already booked and accepted for another buyer. Please select another slot.', 400);
  }

  const appointment = await Appointment.create({
    property_id: targetPropId,
    buyer_id: req.user._id,
    owner_id: owner_id,
    requested_date: parsedDate,
    time_slot: targetSlot,
    message: targetMessage,
    status: 'PENDING',
  });

  await appointment.populate([
    { path: 'property_id' },
    { path: 'buyer_id', select: '-password_hash' },
    { path: 'owner_id', select: '-password_hash' },
  ]);

  // Create in-app notification for property owner
  const dateStr = parsedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const buyerName = req.user.full_name || req.user.name || 'A buyer';
  await Notification.create({
    user_id: owner_id,
    sender_id: req.user._id,
    title: 'New Appointment Request 📅',
    message: `${buyerName} requested a site visit for "${property.title}" on ${dateStr} at ${targetSlot}.`,
    type: 'APPOINTMENT_REQUEST',
    link: '/appointments/owner',
  });

  res.status(201).json(appointment.toJSON());
};

// GET /api/v1/appointments/owner (Appointments requested for owner's properties)
const getOwnerAppointments = async (req, res) => {
  const { status } = req.query;
  const filter = { owner_id: req.user._id };
  if (status && status !== 'ALL') {
    filter.status = status.toUpperCase();
  }

  const appointments = await Appointment.find(filter)
    .populate('property_id')
    .populate('buyer_id', '-password_hash')
    .populate('owner_id', '-password_hash')
    .sort({ created_at: -1 });

  res.json(appointments.map((a) => a.toJSON()));
};

// GET /api/v1/appointments/buyer (Appointments requested by buyer)
const getBuyerAppointments = async (req, res) => {
  const appointments = await Appointment.find({ buyer_id: req.user._id })
    .populate('property_id')
    .populate('buyer_id', '-password_hash')
    .populate('owner_id', '-password_hash')
    .sort({ created_at: -1 });

  res.json(appointments.map((a) => a.toJSON()));
};

// PATCH /api/v1/appointments/:id/accept (Owner accepts request)
const acceptAppointment = async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id).populate('property_id');
  if (!appointment) throw createError('Appointment request not found.', 404);

  // Authorization check: logged in user must be property owner
  if (String(appointment.owner_id) !== String(req.user._id)) {
    throw createError('You are not authorized to accept this appointment request.', 403);
  }

  // Prevent accepting two requests for same property, date & time slot
  const startOfDay = new Date(appointment.requested_date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointment.requested_date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAccepted = await Appointment.findOne({
    property_id: appointment.property_id._id || appointment.property_id,
    requested_date: { $gte: startOfDay, $lte: endOfDay },
    time_slot: appointment.time_slot,
    status: 'ACCEPTED',
    _id: { $ne: appointment._id },
  });

  if (existingAccepted) {
    throw createError('This time slot has already been accepted for another buyer.', 400);
  }

  appointment.status = 'ACCEPTED';
  await appointment.save();

  await appointment.populate([
    { path: 'property_id' },
    { path: 'buyer_id', select: '-password_hash' },
    { path: 'owner_id', select: '-password_hash' },
  ]);

  // Create notification for buyer
  const dateStr = new Date(appointment.requested_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const propTitle = appointment.property_id?.title || 'the property';
  await Notification.create({
    user_id: appointment.buyer_id._id || appointment.buyer_id,
    sender_id: req.user._id,
    title: 'Appointment Accepted 🎉',
    message: `Your site visit request for "${propTitle}" on ${dateStr} at ${appointment.time_slot} has been ACCEPTED by the owner!`,
    type: 'APPOINTMENT_ACCEPTED',
    link: '/appointments/buyer',
  });

  res.json(appointment.toJSON());
};

// PATCH /api/v1/appointments/:id/reject (Owner rejects request with reason)
const rejectAppointment = async (req, res) => {
  const { id } = req.params;
  const { reason, rejection_reason } = req.body;
  const rejectReason = reason || rejection_reason;

  if (!rejectReason || !rejectReason.trim()) {
    throw createError('A rejection reason is required when declining an appointment.', 400);
  }

  const appointment = await Appointment.findById(id).populate('property_id');
  if (!appointment) throw createError('Appointment request not found.', 404);

  // Authorization check
  if (String(appointment.owner_id) !== String(req.user._id)) {
    throw createError('You are not authorized to reject this appointment request.', 403);
  }

  appointment.status = 'REJECTED';
  appointment.rejection_reason = rejectReason.trim();
  await appointment.save();

  await appointment.populate([
    { path: 'property_id' },
    { path: 'buyer_id', select: '-password_hash' },
    { path: 'owner_id', select: '-password_hash' },
  ]);

  // Create notification for buyer
  const propTitle = appointment.property_id?.title || 'the property';
  await Notification.create({
    user_id: appointment.buyer_id._id || appointment.buyer_id,
    sender_id: req.user._id,
    title: 'Appointment Declined',
    message: `Your site visit request for "${propTitle}" was declined. Reason: "${rejectReason.trim()}".`,
    type: 'APPOINTMENT_REJECTED',
    link: '/appointments/buyer',
  });

  res.json(appointment.toJSON());
};

// PATCH /api/v1/appointments/:id/cancel (Buyer cancels own request)
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id).populate('property_id');
  if (!appointment) throw createError('Appointment request not found.', 404);

  // Authorization check: logged in user must be buyer
  if (String(appointment.buyer_id) !== String(req.user._id)) {
    throw createError('Only the buyer who requested this appointment can cancel it.', 403);
  }

  appointment.status = 'CANCELLED';
  await appointment.save();

  await appointment.populate([
    { path: 'property_id' },
    { path: 'buyer_id', select: '-password_hash' },
    { path: 'owner_id', select: '-password_hash' },
  ]);

  // Create notification for owner
  const propTitle = appointment.property_id?.title || 'the property';
  const buyerName = req.user.full_name || req.user.name || 'Buyer';
  await Notification.create({
    user_id: appointment.owner_id,
    sender_id: req.user._id,
    title: 'Appointment Cancelled',
    message: `${buyerName} cancelled their appointment request for "${propTitle}".`,
    type: 'APPOINTMENT_CANCELLED',
    link: '/appointments/owner',
  });

  res.json(appointment.toJSON());
};

module.exports = {
  requestAppointment,
  getOwnerAppointments,
  getBuyerAppointments,
  acceptAppointment,
  rejectAppointment,
  cancelAppointment,
};
