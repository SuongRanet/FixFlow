import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-6 text-center">
      <p className="font-heading text-[64px] leading-none text-primary">404</p>
      <div>
        <h1 className="font-heading text-[24px] text-main">
          {t("errors.notFoundTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("errors.notFoundBody")}</p>
      </div>
      <Link to="/dashboard">
        <Button>{t("errors.goHome")}</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
