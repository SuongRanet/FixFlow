import { useTranslation } from "react-i18next";

import { RegisterForm } from "../components/RegisterForm";
import { AuthCard } from "./_AuthCard";

const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <AuthCard title={t("auth.register")} subtitle={t("auth.registerSubtitle")}>
      <RegisterForm />
    </AuthCard>
  );
};

export default RegisterPage;
