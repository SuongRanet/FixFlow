import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

import { authApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import { Button } from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import { FormError, FormSuccess } from "../../../components/ui/States";

export const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string>();
  const [isSent, setIsSent] = useState(false);

  const schema = z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormValues) => {
    setFormError(undefined);
    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      setFormError(
        isNetworkError(error)
          ? t("common.networkError")
          : (getApiErrorMessage(error) ?? t("common.unknownError")),
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <FormError message={formError} />
      {isSent && <FormSuccess message={t("auth.resetLinkSent")} />}

      <Field
        label={t("auth.email")}
        htmlFor="email"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Button
        type="submit"
        isLoading={isSubmitting}
        icon={<Mail className="size-4" />}
      >
        {t("auth.sendResetLink")}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link to="/login" className="font-medium text-primary hover:underline">
          {t("common.back")} — {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
};
