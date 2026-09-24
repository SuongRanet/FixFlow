import { Paperclip, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../../components/ui/Button";
import { Card, CardHeader } from "../../../components/ui/Card";
import { Modal } from "../../../components/ui/Modal";
import {
  EmptyState,
  ErrorState,
  FormError,
  LoadingBlock,
} from "../../../components/ui/States";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { attachmentApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import env from "../../../config/env";
import { formatDateTime, formatFileSize } from "../../../lib/format";
import type { TicketAttachment } from "../../../types/api";

const MAX_BYTES = 10 * 1024 * 1024; // matches multer's limit

/**
 * Cloudinary rows hold an absolute URL; rows from before the switch hold
 * a server path like /uploads/tickets/x.png, which the API serves
 * statically. Both resolve to something the browser can open.
 */
const fileUrl = (attachment: TicketAttachment) => {
  const filePath = attachment.file_path;
  if (!filePath) return undefined;
  if (filePath.startsWith("http")) return filePath;

  return new URL(filePath, new URL(env.apiUrl).origin).href;
};

const isImage = (attachment: TicketAttachment) =>
  attachment.file_type?.startsWith("image/") ?? false;


/**
 * Shows the picture itself for image attachments, falling back to the
 * paperclip when the file is not an image or the URL cannot be loaded.
 */
const AttachmentThumb = ({ attachment }: { attachment: TicketAttachment }) => {
  const [failed, setFailed] = useState(false);

  const url = fileUrl(attachment);
  const showImage = Boolean(url) && isImage(attachment) && !failed;

  if (!showImage) {
    return (
      <span
        className="flex size-12 shrink-0 items-center justify-center border border-border text-muted"
        aria-hidden
      >
        <Paperclip className="size-4" />
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={attachment.file_name}
      className="shrink-0 border border-border transition-colors hover:border-primary"
    >
      <img
        src={url}
        alt={attachment.file_name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="size-12 object-cover"
      />
    </a>
  );
};


/**
 * Preview of the file waiting to be sent. Images get a real thumbnail via
 * an object URL, which is revoked as soon as the dialog closes.
 */
const PendingPreview = ({ file }: { file: File }) => {
  const [objectUrl, setObjectUrl] = useState<string>();

  // The URL has to be created and revoked inside the same effect run:
  // StrictMode mounts effects twice, and a memoised URL would be revoked
  // by the first cleanup while the second run still pointed at it.
  useEffect(() => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the blob URL must be created and revoked in the same effect run
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex items-center gap-3">
      {objectUrl ? (
        <img
          src={objectUrl}
          alt={file.name}
          className="size-16 shrink-0 border border-border object-cover"
        />
      ) : (
        <span
          className="flex size-16 shrink-0 items-center justify-center border border-border text-muted"
          aria-hidden
        >
          <Paperclip className="size-5" />
        </span>
      )}

      <div className="min-w-0">
        <p className="truncate text-sm text-main">{file.name}</p>
        <p className="text-xs text-muted">
          {formatFileSize(file.size)} · {file.type || "—"}
        </p>
      </div>
    </div>
  );
};

export const TicketAttachments = ({ ticketId }: { ticketId: number }) => {
  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error, reload } = useApiRequest(
    () => attachmentApi.list(ticketId),
    [ticketId],
  );

  const [uploadError, setUploadError] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  // The chosen file waits here until the person confirms the upload.
  const [pending, setPending] = useState<File>();

  /** Clears the staged file and lets the same file be picked again. */
  const clearPending = () => {
    setPending(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSelect = (file: File) => {
    if (file.size > MAX_BYTES) {
      setUploadError(t("tickets.fileTooLarge"));
      clearPending();
      return;
    }

    setUploadError(undefined);
    setPending(file);
  };

  const confirmUpload = async () => {
    if (!pending) return;

    setUploadError(undefined);
    setIsUploading(true);
    try {
      await attachmentApi.upload(ticketId, pending);
      clearPending();
      reload();
    } catch (requestError) {
      setUploadError(
        isNetworkError(requestError)
          ? t("common.networkError")
          : (getApiErrorMessage(requestError) ?? t("common.unknownError")),
      );
      clearPending();
    } finally {
      setIsUploading(false);
    }
  };

  const attachments = data ?? [];

  return (
    <Card>
      <CardHeader
        title={t("tickets.attachments")}
        subtitle={t("tickets.dropFile")}
        action={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.txt,.csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleSelect(file);
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              icon={<Upload className="size-4" />}
            >
              {t("tickets.uploadFile")}
            </Button>
          </>
        }
      />

      {uploadError && (
        <div className="px-4 pt-4 sm:px-5">
          <FormError message={uploadError} />
        </div>
      )}

      {isLoading && <LoadingBlock />}

      {!isLoading && error && <ErrorState message={error} onRetry={reload} />}

      {!isLoading && !error && attachments.length === 0 && (
        <EmptyState
          icon={<Paperclip className="size-5" />}
          title={t("tickets.noAttachments")}
        />
      )}

      {!isLoading && !error && attachments.length > 0 && (
        <ul className="divide-y divide-border">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-3 px-4 py-3 sm:px-5"
            >
              <AttachmentThumb attachment={attachment} />
              <div className="min-w-0 flex-1">
                {/* Cloudinary rows carry an absolute URL; older local
                    paths are shown as plain text. */}
                {fileUrl(attachment) ? (
                  <a
                    href={fileUrl(attachment)}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm text-primary hover:underline"
                  >
                    {attachment.file_name}
                  </a>
                ) : (
                  <p className="truncate text-sm text-main">
                    {attachment.file_name}
                  </p>
                )}
                <p className="truncate text-xs text-muted">
                  {formatFileSize(attachment.file_size)} ·{" "}
                  {t("tickets.uploadedBy", {
                    name: attachment.uploaded_by_username ?? "—",
                  })}{" "}
                  · {formatDateTime(attachment.created_at, i18n.language)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={Boolean(pending)}
        onClose={clearPending}
        title={t("tickets.confirmUploadTitle")}
        description={t("tickets.confirmUploadBody")}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={clearPending}
              disabled={isUploading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={confirmUpload}
              isLoading={isUploading}
              icon={<Upload className="size-4" />}
            >
              {t("tickets.uploadFile")}
            </Button>
          </>
        }
      >
        {pending && <PendingPreview file={pending} />}
      </Modal>
    </Card>
  );
};
