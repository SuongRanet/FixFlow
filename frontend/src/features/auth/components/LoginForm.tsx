import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { authApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import { useAuthStore } from "../../../stores/auth.store";
import { Button } from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import { FormError } from "../../../components/ui/States";
import { connectSocket } from "../../../lib/socket";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signIn = useAuthStore((state) => state.signIn);

  const [formError, setFormError] = useState<string | undefined>(
    searchParams.get("expired") ? t("auth.sessionExpired") : undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormValues) => {
    setFormError(undefined);
    try {
      const response = await authApi.login(email, password);
      signIn(response.data, response.token);
      connectSocket();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFormError(
        isNetworkError(error)
          ? t("common.networkError")
          : (getApiErrorMessage(error) ?? t("auth.invalidCredentials")),
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

      <Field
        label={t("auth.email")}
        htmlFor="email"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
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
          autoComplete="current-password"
          placeholder="••••••••"
          hasError={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("auth.forgotPassword")}
        </Link>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        icon={<LogIn className="size-4" />}
      >
        {t("auth.signIn")}
      </Button>

      <p className="text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          {t("auth.register")}
        </Link>
      </p>
    </form>
  );
};
