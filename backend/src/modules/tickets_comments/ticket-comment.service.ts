import { emitTicketChanged } from "../../config/socket.js";
import { createComment } from "./ticket-comment.repository.js";

export const createCommentService = async (
  ticketId: number,
  userId: number,
  content: string,
  isInternal: boolean,
) => {
  const comment = await createComment(ticketId, userId, content, isInternal);

  emitTicketChanged(ticketId, { commentId: comment.id });

  return comment;
};
