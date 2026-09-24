import { useTranslation } from "react-i18next";

import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { AuthCard } from "./_AuthCard";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <AuthCard
      title={t("auth.forgotPasswordTitle")}
      subtitle={t("auth.forgotPasswordSubtitle")}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
};

export default ForgotPasswordPage;
