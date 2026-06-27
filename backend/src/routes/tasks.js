const router    = require('express').Router();
const requireAuth = require('../middleware/auth');
const {
  getTasks, createTask, updateTask, toggleComplete, deleteTask,
} = require('../controllers/taskController');

router.get('/',                requireAuth, getTasks);
router.post('/',               requireAuth, createTask);
router.put('/:id',             requireAuth, updateTask);
router.patch('/:id/complete',  requireAuth, toggleComplete);
router.delete('/:id',          requireAuth, deleteTask);

module.exports = router;
