const router    = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getUpcomingReminders, getAllReminders } = require('../controllers/reminderController');

router.get('/upcoming', requireAuth, getUpcomingReminders);
router.get('/',         requireAuth, getAllReminders);

module.exports = router;
