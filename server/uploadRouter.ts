import express from 'express';
import multer from 'multer';
import { parseMultipleFiles } from './fileParser';
import path from 'path';
import { mkdir } from 'fs/promises';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/pdf',
      'text/plain',
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(docx|doc|pdf|txt)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only .docx, .doc, .pdf, and .txt files are allowed'));
    }
  }
});

/**
 * POST /api/upload/documents
 * Upload multiple documents and extract text
 */
router.post('/documents', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      path: file.path,
      mimeType: file.mimetype,
    }));

    // Parse all files and extract text
    const extractedTexts = await parseMultipleFiles(files);

    if (extractedTexts.length === 0) {
      return res.status(400).json({ error: 'Failed to extract text from any files' });
    }

    res.json({
      success: true,
      documentsText: extractedTexts,
      filesProcessed: extractedTexts.length,
    });

  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({
      error: 'Failed to process documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
