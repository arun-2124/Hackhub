const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve upload directory
const uploadDir = path.join(__dirname, '..', 'uploads', 'submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    cb(null, `sub_${uniqueSuffix}${sanitizedExt}`);
  }
});

// Allowed file types: PDF, PPT, PPTX
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.ppt', '.pptx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/octet-stream' // Some browsers send binary stream for pptx
  ];

  if (allowedExtensions.includes(ext) && (allowedMimeTypes.includes(file.mimetype) || ext === '.pptx' || ext === '.ppt')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF (.pdf) and PowerPoint (.ppt, .pptx) files are permitted.'), false);
  }
};

// Maximum file size: 10 MB
const maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

module.exports = upload;
