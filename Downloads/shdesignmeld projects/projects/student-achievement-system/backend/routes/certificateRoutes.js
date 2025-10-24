const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const certificateController = require('../controllers/certificateController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and PDFs only!');
    }
  }
});

router.get('/', auth, certificateController.getCertificates);
router.get('/:id', auth, certificateController.getCertificate);
router.post('/', auth, upload.single('file'), certificateController.createCertificate);
router.put('/:id', auth, upload.single('file'), certificateController.updateCertificate);
router.delete('/:id', auth, certificateController.deleteCertificate);

module.exports = router;