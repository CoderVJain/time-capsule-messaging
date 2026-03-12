const { pool } = require('../database');

exports.createMessage = async (req, res) => {
  try {
    const { recipient_email, message, deliver_at } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!recipient_email || !message || !deliver_at) {
      return res.status(400).json({ error: 'recipient_email, message, and deliver_at are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient_email)) {
      return res.status(400).json({ error: 'Invalid recipient email format' });
    }

    // Validate message length
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message must be 500 characters or less' });
    }

    // Validate deliver_at is in the future
    const deliverDate = new Date(deliver_at);
    if (isNaN(deliverDate.getTime())) {
      return res.status(400).json({ error: 'Invalid deliver_at date format' });
    }
    if (deliverDate <= new Date()) {
      return res.status(400).json({ error: 'deliver_at must be in the future' });
    }

    const result = await pool.query(
      `INSERT INTO messages (user_id, recipient_email, message, deliver_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, recipient_email, message, deliver_at, status, created_at, delivered_at`,
      [userId, recipient_email, message, deliverDate.toISOString()]
    );

    return res.status(201).json({
      message: 'Message scheduled successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Create message error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, recipient_email, message, deliver_at, status, created_at, delivered_at
       FROM messages
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
