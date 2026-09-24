import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { DepartmentSelect } from "../../../components/common/OptionSelect";
import { Button } from "../../../components/ui/Button";
import { Field, Input, Select } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { FormError } from "../../../components/ui/States";
import { userApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import type { User, UserRole } from "../../../types/api";

const ROLES: UserRole[] = ["USER", "IT_SUPPORT", "ADMIN"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Present when editing; omitted when creating. */
  user?: User;
}

export const UserFormModal = ({ isOpen, onClose, onSaved, user }: Props) => {
  const { t } = useTranslation();
  const isEdit = Boolean(user);
  const [formError, setFormError] = useState<string>();

  // createSchema requires a password and email; updateUserSchema takes neither.
  const schema = z.object({
    firstName: z.string().trim().min(2, t("validation.firstNameMin")),
    lastName: z.string().trim().min(2, t("validation.lastNameMin")),
    username: z.string().trim().min(3, t("validation.usernameMin")),
    email: isEdit
      ? z.string().optional()
      : z.string().trim().email(t("validation.emailInvalid")),
    password: isEdit
      ? z.string().optional()
      : z.string().min(8, t("validation.passwordMin")),
    role: z.enum(["ADMIN", "IT_SUPPORT", "USER"]),
    departmentId: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  // The parent mounts this modal per user, so defaults are set once here
  // instead of being re-synced by an effect.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "USER",
      departmentId: user?.department_id ? String(user.department_id) : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(undefined);

    // An empty box means "leave the department alone", so send undefined
    // rather than null (see updateRepository's departmentId handling).
    const departmentId =
      values.departmentId === "" || values.departmentId === undefined
        ? undefined
        : Number(values.departmentId);

    try {
      if (user) {
        await userApi.update(user.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          departmentId,
          role: values.role,
        });
      } else {
        await userApi.create({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email as string,
          password: values.password as string,
          role: values.role,
          departmentId: departmentId ?? null,
        });
      }
      onSaved();
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
      onClose={onClose}
      title={isEdit ? t("users.editTitle") : t("users.createTitle")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button form="user-form" type="submit" isLoading={isSubmitting}>
            {isEdit ? t("common.save") : t("common.create")}
          </Button>
        </>
      }
    >
      <form
        id="user-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={formError} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("auth.firstName")}
            htmlFor="firstName"
            error={errors.firstName?.message}
          >
            <Input
              id="firstName"
              hasError={Boolean(errors.firstName)}
              {...register("firstName")}
            />
          </Field>

          <Field
            label={t("auth.lastName")}
            htmlFor="lastName"
            error={errors.lastName?.message}
          >
            <Input
              id="lastName"
              hasError={Boolean(errors.lastName)}
              {...register("lastName")}
            />
          </Field>
        </div>

        <Field
          label={t("users.username")}
          htmlFor="username"
          error={errors.username?.message}
        >
          <Input
            id="username"
            hasError={Boolean(errors.username)}
            {...register("username")}
          />
        </Field>

        <Field
          label={t("users.email")}
          htmlFor="email"
          error={errors.email?.message}
          hint={isEdit ? t("users.departmentHint") : undefined}
        >
          <Input
            id="email"
            type="email"
            // The update endpoint has email commented out, so it is read-only here.
            disabled={isEdit}
            hasError={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        {!isEdit && (
          <Field
            label={t("auth.password")}
            htmlFor="password"
            error={errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              hasError={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("users.role")} htmlFor="role">
            <Select id="role" {...register("role")}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`role.${role}`)}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={t("users.department")}
            htmlFor="departmentId"
            hint={isEdit ? t("users.departmentHint") : t("common.optional")}
          >
            <DepartmentSelect
              id="departmentId"
              placeholder={
                isEdit ? t("users.departmentHint") : t("users.noDepartment")
              }
              {...register("departmentId")}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
};
