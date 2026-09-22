import { createAttachmentRepository, getAttachmentsByTicketRepository } from "./ticketAttachment.repository.js";

export const createAttachmentService = async (
  ticketId: number,
  commentId: number | null,
  uploadedBy: number,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new Error("File is required");
  }

  const filePath = `/uploads/tickets/${file.filename}`;

  const attachment = await createAttachmentRepository(
    ticketId,
    commentId,
    uploadedBy,
    file.originalname,
    filePath,
    file.mimetype,
    file.size,
  );

  return attachment;
};
export const getAttachmentsByTicketService = async (ticketId: number) => {
  return await getAttachmentsByTicketRepository(ticketId);
};
