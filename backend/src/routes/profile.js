const router    = require('express').Router();
const multer    = require('multer');
const path      = require('path');
const requireAuth = require('../middleware/auth');
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/profileController');

// ─── Multer config for avatar uploads ────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'));
    }
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────
router.get('/',       requireAuth, getProfile);
router.put('/',       requireAuth, updateProfile);
router.post('/avatar', requireAuth, upload.single('avatar'), uploadAvatar);

module.exports = router;
