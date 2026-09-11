import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Upload single file (image or document)
// @route   POST /api/uploads
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for upload',
      });
    }

    const file = req.file;
    const isImage = file.mimetype.startsWith('image/');
    let fileUrl = '';

    if (isCloudinaryConfigured()) {
      try {
        const uploadOptions = {
          folder: 'talkative',
          resource_type: isImage ? 'image' : 'auto',
        };

        const result = await cloudinary.uploader.upload(file.path, uploadOptions);
        fileUrl = result.secure_url;

        // Clean up temp file on local disk
        fs.unlink(file.path, (err) => {
          if (err) console.error('[Upload] Error deleting temp file:', err);
        });
      } catch (cloudErr) {
        console.error('[Cloudinary Upload Error]', cloudErr);
        // Fall back to local path if Cloudinary API call errors
        const host = req.get('host');
        fileUrl = `${req.protocol}://${host}/uploads/${file.filename}`;
      }
    } else {
      // Local storage fallback
      const host = req.get('host');
      fileUrl = `${req.protocol}://${host}/uploads/${file.filename}`;
    }

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};
