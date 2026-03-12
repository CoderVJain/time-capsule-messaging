const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.post('/', authMiddleware, messageController.createMessage);
router.get('/', authMiddleware, messageController.getMessages);

module.exports = router;
