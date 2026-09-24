import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error(
    "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env",
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export const TICKET_UPLOAD_FOLDER = "fixflow/tickets";

export interface UploadedAsset {
  url: string;
  publicId: string;
  bytes: number;
  format: string | undefined;
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: { folder: string; fileName: string },
): Promise<UploadedAsset> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "auto",
        public_id: options.fileName.replace(/\.[^.]+$/, ""),
        unique_filename: true,
        use_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary returned no result"));

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      },
    );

    stream.end(buffer);
  });

export const destroyCloudinaryAsset = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
};

export default cloudinary;
