export interface TicketAttachment {
  id: number;
  ticketId: number;
  commentId: number | null;
  uploadedBy: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}
export interface Notification {
  id: number;
  userId: number;
  ticketId: number | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
export interface CreateNotificationInput {
  userId: number;
  ticketId?: number | null;
  title: string;
  message: string;
}