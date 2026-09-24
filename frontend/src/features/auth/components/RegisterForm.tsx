import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import { Button } from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import { FormError } from "../../../components/ui/States";

export const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();

  // Mirrors registerSchema in backend/src/modules/auth/auth.schema.ts.
  const schema = z.object({
    firstName: z.string().trim().min(2, t("validation.firstNameMin")),
    lastName: z.string().trim().min(2, t("validation.lastNameMin")),
    username: z.string().trim().min(3, t("validation.usernameMin")),
    email: z.string().trim().email(t("validation.emailInvalid")),
    password: z.string().min(8, t("validation.passwordMin")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(undefined);
    try {
      await authApi.register(values);
      navigate("/login", { replace: true });
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("auth.firstName")}
          htmlFor="firstName"
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
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
            autoComplete="family-name"
            hasError={Boolean(errors.lastName)}
            {...register("lastName")}
          />
        </Field>
      </div>

      <Field
        label={t("auth.username")}
        htmlFor="username"
        error={errors.username?.message}
      >
        <Input
          id="username"
          autoComplete="username"
          hasError={Boolean(errors.username)}
          {...register("username")}
        />
      </Field>

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

      <Button
        type="submit"
        isLoading={isSubmitting}
        icon={<UserPlus className="size-4" />}
      >
        {t("auth.register")}
      </Button>

      <p className="text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
};
