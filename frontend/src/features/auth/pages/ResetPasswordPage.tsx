import { useTranslation } from "react-i18next";

import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { AuthCard } from "./_AuthCard";

const ResetPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <AuthCard
      title={t("auth.resetPasswordTitle")}
      subtitle={t("auth.resetPasswordSubtitle")}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
};

export default ResetPasswordPage;
