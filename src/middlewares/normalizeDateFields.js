function normalizeDateFields(req, res, next) {
  try {
    const { start, end } = req.body;

    // Guardamos la hora tal cual viene
    if (start) {
      req.body.startUTC = new Date(start);  // ← guarda hora local sin convertir a UTC
    }

    if (end) {
      req.body.endUTC = new Date(end);
    }

    next();
  } catch (error) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }
}
