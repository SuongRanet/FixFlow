import {
  destroyCloudinaryAsset,
  TICKET_UPLOAD_FOLDER,
  uploadBufferToCloudinary,
} from "../../config/cloudinary.js";
import {
  createAttachmentRepository,
  getAttachmentsByTicketRepository,
} from "./ticketAttachment.repository.js";

export const createAttachmentService = async (
  ticketId: number,
  commentId: number | null,
  uploadedBy: number,
  file: Express.Multer.File,
) => {
  if (!file?.buffer) {
    throw new Error("File is required");
  }

  const asset = await uploadBufferToCloudinary(file.buffer, {
    folder: `${TICKET_UPLOAD_FOLDER}/${ticketId}`,
    fileName: file.originalname,
  });

  try {
    // file_path now holds the Cloudinary URL instead of a local path.
    const attachment = await createAttachmentRepository(
      ticketId,
      commentId,
      uploadedBy,
      file.originalname,
      asset.url,
      file.mimetype,
      asset.bytes || file.size,
    );

    return attachment;
  } catch (error) {
    // Don't leave an orphaned asset behind if the row can't be written.
    await destroyCloudinaryAsset(asset.publicId).catch(() => undefined);
    throw error;
  }
};

export const getAttachmentsByTicketService = async (ticketId: number) => {
  return await getAttachmentsByTicketRepository(ticketId);
};
