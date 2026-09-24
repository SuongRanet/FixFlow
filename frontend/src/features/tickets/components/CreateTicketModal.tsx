import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "../../../components/ui/Button";
import {
  CategorySelect,
  DepartmentSelect,
} from "../../../components/common/OptionSelect";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { FormError } from "../../../components/ui/States";
import { ticketApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import type { TicketPriority } from "../../../types/api";

const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateTicketModal = ({ isOpen, onClose, onCreated }: Props) => {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string>();

  // Mirrors createTicketSchema in backend/src/modules/tickets/ticket.schema.ts.
  const schema = z.object({
    title: z.string().trim().min(1, t("validation.titleRequired")).max(255),
    description: z.string().trim().min(1, t("validation.descriptionRequired")),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    // <select> values are strings; they are converted just before the request.
    categoryId: z
      .string()
      .refine((value) => Number(value) > 0, t("validation.selectCategory")),
    departmentId: z
      .string()
      .refine((value) => Number(value) > 0, t("validation.selectDepartment")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM", categoryId: "", departmentId: "" },
  });

  const close = () => {
    reset();
    setFormError(undefined);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    setFormError(undefined);
    try {
      await ticketApi.create({
        ...values,
        categoryId: Number(values.categoryId),
        departmentId: Number(values.departmentId),
      });
      reset();
      onCreated();
      onClose();
    } catch (error) {
      setFormError(
        isNetworkError(error)
          ? t("common.networkError")
          : (getApiErrorMessage(error) ?? t("common.unknownError")),
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={t("tickets.createTitle")}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            form="create-ticket-form"
            type="submit"
            isLoading={isSubmitting}
          >
            {t("common.create")}
          </Button>
        </>
      }
    >
      <form
        id="create-ticket-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={formError} />

        <Field
          label={t("tickets.ticketTitle")}
          htmlFor="title"
          error={errors.title?.message}
        >
          <Input
            id="title"
            hasError={Boolean(errors.title)}
            {...register("title")}
          />
        </Field>

        <Field
          label={t("tickets.description")}
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea
            id="description"
            rows={4}
            hasError={Boolean(errors.description)}
            {...register("description")}
          />
        </Field>

        <Field
          label={t("tickets.priority")}
          htmlFor="priority"
          error={errors.priority?.message}
        >
          <Select id="priority" {...register("priority")}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t(`priority.${priority}`)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("tickets.category")}
            htmlFor="categoryId"
            error={errors.categoryId?.message}
          >
            <CategorySelect
              id="categoryId"
              hasError={Boolean(errors.categoryId)}
              {...register("categoryId")}
            />
          </Field>

          <Field
            label={t("tickets.department")}
            htmlFor="departmentId"
            error={errors.departmentId?.message}
          >
            <DepartmentSelect
              id="departmentId"
              hasError={Boolean(errors.departmentId)}
              {...register("departmentId")}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
};
