import { Outlet } from "react-router-dom";

const ErrorLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default ErrorLayout;