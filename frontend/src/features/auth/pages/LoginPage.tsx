import { useTranslation } from "react-i18next";

import { LoginForm } from "../components/LoginForm";
import { AuthCard } from "./_AuthCard";

export const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <AuthCard title={t("auth.signIn")} subtitle={t("auth.signInSubtitle")}>
      <LoginForm />
    </AuthCard>
  );
};

export default LoginPage;
