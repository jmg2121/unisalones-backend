const dayjs = require('dayjs');
const { Reservation } = require('../models');
const { createReservation, cancelReservation, modifyReservation, joinWaitlist } = require('../services/reservation.service');

async function create(req, res, next) {
  try {
    const start = dayjs(req.body.start).toDate();
    const end = dayjs(req.body.end).toDate();
    const { conflict, reservation } = await createReservation({ spaceId: req.body.spaceId, userId: req.user.id, start, end });
    if (conflict) return res.status(409).json({ conflict: true, message: 'Espacio ocupado. Puede unirse a la lista de espera.' });
    res.status(201).json(reservation);
  } catch (e) { next(e); }
}

async function modify(req, res, next) {
  try {
    const newStart = dayjs(req.body.start).toDate();
    const newEnd = dayjs(req.body.end).toDate();
    const resv = await modifyReservation({ reservationId: req.params.id, userId: req.user.id, isAdmin: req.user.role === 'admin', newStart, newEnd });
    res.json(resv);
  } catch (e) { next(e); }
}

async function cancelCtrl(req, res, next) {
  try {
    const resv = await cancelReservation({ reservationId: req.params.id, userId: req.user.id, isAdmin: req.user.role === 'admin' });
    res.json(resv);
  } catch (e) { next(e); }
}

async function myHistory(req, res, next) {
  try {
    const list = await Reservation.findAll({ where: { user_id: req.user.id }, order: [['start_time','DESC']] });
    res.json(list);
  } catch (e) { next(e); }
}

async function joinWaitlistCtrl(req, res, next) {
  try {
    const start = dayjs(req.body.start).toDate();
    const end = dayjs(req.body.end).toDate();
    const entry = await joinWaitlist({ spaceId: req.body.spaceId, userId: req.user.id, start, end });
    res.status(201).json(entry);
  } catch (e) { next(e); }
}

module.exports = { create, modify, cancelCtrl, myHistory, joinWaitlistCtrl };
