import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../../components/ui/Button";
import { Field, Input, Select } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { FormError } from "../../../components/ui/States";
import { ticketApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import type { TicketStatus } from "../../../types/api";

const STATUSES: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

interface BaseProps {
  ticketId: number;
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}

/** PATCH /ticket/:id/assign — the API takes a raw user id. */
export const AssignTicketModal = ({
  ticketId,
  isOpen,
  onClose,
  onDone,
}: BaseProps) => {
  const { t } = useTranslation();
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const userId = Number(assignedTo);
    if (!userId || userId < 1) {
      setError(t("validation.numberPositive"));
      return;
    }

    setError(undefined);
    setIsSaving(true);
    try {
      await ticketApi.assign(ticketId, userId);
      setAssignedTo("");
      onDone();
      onClose();
    } catch (requestError) {
      setError(
        isNetworkError(requestError)
          ? t("common.networkError")
          : (getApiErrorMessage(requestError) ?? t("common.unknownError")),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("tickets.assignTitle")}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} isLoading={isSaving}>
            {t("tickets.assign")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label={t("tickets.assignToUserId")} htmlFor="assignedTo">
          <Input
            id="assignedTo"
            type="number"
            min={1}
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            hasError={Boolean(error)}
          />
        </Field>
      </div>
    </Modal>
  );
};

/** PATCH /ticket/:id/status */
export const UpdateStatusModal = ({
  ticketId,
  isOpen,
  onClose,
  onDone,
  currentStatus,
}: BaseProps & { currentStatus: TicketStatus }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    setError(undefined);
    setIsSaving(true);
    try {
      await ticketApi.updateStatus(ticketId, status);
      onDone();
      onClose();
    } catch (requestError) {
      setError(
        isNetworkError(requestError)
          ? t("common.networkError")
          : (getApiErrorMessage(requestError) ?? t("common.unknownError")),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("tickets.statusTitle")}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} isLoading={isSaving}>
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label={t("tickets.status")} htmlFor="status">
          <Select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as TicketStatus)}
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {t(`status.${option}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
};
