const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

const LOG_FILE = path.join(__dirname, 'delivery.log');

function appendLog(entry) {
  fs.appendFileSync(LOG_FILE, entry + '\n', 'utf8');
}

async function deliverPendingMessages() {
  const client = await pool.connect();
  try {
    // Find all messages that are due for delivery
    const result = await client.query(
      `SELECT id, recipient_email, message FROM messages
       WHERE status = 'pending' AND deliver_at <= NOW()`
    );

    if (result.rows.length === 0) return;

    console.log(`[Scheduler] Found ${result.rows.length} message(s) to deliver`);

    for (const msg of result.rows) {
      const now = new Date().toISOString();

      await client.query(
        `UPDATE messages SET status = 'delivered', delivered_at = $1 WHERE id = $2`,
        [now, msg.id]
      );

      const logEntry = `[${now}] Delivered message ${msg.id} to ${msg.recipient_email}`;
      appendLog(logEntry);
      console.log(logEntry);
    }
  } catch (err) {
    console.error('[Scheduler] Error delivering messages:', err);
  } finally {
    client.release();
  }
}

function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    deliverPendingMessages();
  });

  console.log('Delivery scheduler started (runs every minute)');

  // Also run immediately on startup to catch any messages missed during downtime
  deliverPendingMessages();
}

module.exports = { startScheduler };
