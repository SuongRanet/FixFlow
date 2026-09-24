import multer from "multer";

/**
 * Files are held in memory and streamed to Cloudinary by the attachment
 * service, so nothing is written to the server's disk.
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
