import express, { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

const router = express.Router();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && cloudApiKey && cloudApiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
  });
}

// Configure multer for file uploads
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpg, jpeg, png, gif) and videos (mp4, mov, avi) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const requireCloudinary = (res: Response) => {
  if (!cloudName || !cloudApiKey || !cloudApiSecret) {
    res.status(500).json({
      error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME (or VITE_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env',
    });
    return false;
  }
  return true;
};

const uploadToCloudinary = (file: Express.Multer.File) => {
  const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'mobilemaster-pro',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from([file.buffer]).pipe(stream);
  });
};

// Upload single file
router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype
  });
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 5), (req: Request, res: Response) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = (req.files as Express.Multer.File[]).map(file => ({
    fileUrl: `/uploads/${file.filename}`,
    fileName: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  }));

  res.json({
    success: true,
    files
  });
});

// Upload single file to Cloudinary
router.post('/cloudinary', memoryUpload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!requireCloudinary(res)) return;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file);
    res.json({
      success: true,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      bytes: result.bytes,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload to Cloudinary' });
  }
});

// Upload multiple files to Cloudinary
router.post('/cloudinary-multiple', memoryUpload.array('files', 5), async (req: Request, res: Response) => {
  try {
    if (!requireCloudinary(res)) return;
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const results = await Promise.all(files.map(uploadToCloudinary));

    res.json({
      success: true,
      files: results.map((result, idx) => ({
        fileUrl: result.secure_url,
        publicId: result.public_id,
        originalName: files[idx].originalname,
        mimeType: files[idx].mimetype,
        bytes: result.bytes,
        resourceType: result.resource_type,
      })),
    });
  } catch (error) {
    console.error('Cloudinary upload-multiple error:', error);
    res.status(500).json({ error: 'Failed to upload to Cloudinary' });
  }
});

// Delete file
router.delete('/delete/:fileName', (req: Request, res: Response) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to delete file' });
    }
    res.json({ success: true, message: 'File deleted successfully' });
  });
});

export default router;
