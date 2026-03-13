require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');
const { startScheduler } = require('./scheduler');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);


async function start() {
  try {
    await initDB();
    startScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
