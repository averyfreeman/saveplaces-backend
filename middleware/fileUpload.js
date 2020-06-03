const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
}

const fileUpload = multer({
  limit: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `submitted-${Date.now()}.${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // !! converts null/udef to false
    let error = isValid ? null : new Error('Invalid mime type, please upload supported file');
    cb(error, isValid);
  }
});

// const avatarUpload = (path, name) => {
//   fileUpload
// }

module.exports = fileUpload;