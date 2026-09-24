import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { authApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import { Button } from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import { FormError, FormSuccess } from "../../../components/ui/States";

export const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [formError, setFormError] = useState<string>();
  const [isDone, setIsDone] = useState(false);

  const schema = z
    .object({
      newPassword: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ newPassword }: FormValues) => {
    setFormError(undefined);
    try {
      await authApi.resetPassword(token, newPassword);
      setIsDone(true);
    } catch (error) {
      setFormError(
        isNetworkError(error)
          ? t("common.networkError")
          : (getApiErrorMessage(error) ?? t("common.unknownError")),
      );
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <FormError message={t("auth.missingToken")} />
        <Link
          to="/forgot-password"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          {t("auth.sendResetLink")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <FormError message={formError} />
      {isDone && <FormSuccess message={t("auth.resetSuccess")} />}

      <Field
        label={t("auth.newPassword")}
        htmlFor="newPassword"
        error={errors.newPassword?.message}
      >
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          hasError={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
      </Field>

      <Field
        label={t("auth.confirmPassword")}
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          hasError={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>

      <Button
        type="submit"
        isLoading={isSubmitting}
        icon={<KeyRound className="size-4" />}
      >
        {t("auth.resetPassword")}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link to="/login" className="font-medium text-primary hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
};
