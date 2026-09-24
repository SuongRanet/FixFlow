import { emitTicketChanged } from "../../config/socket.js";
import { broadcastComment } from "../../realtime/broadcast.js";
import { createComment } from "./ticket-comment.repository.js";

export const createCommentService = async (
  ticketId: number,
  userId: number,
  content: string,
  isInternal: boolean,
) => {
  const comment = await createComment(ticketId, userId, content, isInternal);

  // Routed from the stored flag, never from anything the caller claimed.
  broadcastComment({
    id: comment.id,
    ticketId: comment.ticket_id,
    content: comment.content,
    isInternal: comment.is_internal,
    author: { id: comment.user_id, username: null },
    createdAt: comment.created_at,
  });

  // The "something changed" ping stays public: it carries no content, so
  // an internal note reveals nothing beyond the fact the ticket moved.
  if (!comment.is_internal) {
    emitTicketChanged(ticketId, { commentId: comment.id });
  }

  return comment;
};
