import { Routes, Route } from "react-router-dom";
import Home from "./components/landing/Home";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./pages/auth/Register";
import AcceptInvite from "./pages/auth/AcceptInvite";
import Dashboard from "./pages/app/Dashboard";
import Documents from "./components/app/Documents";
import ManageShipping from "./components/app/ManageShipping";
import DashboardLayout from "./components/app/DashboardLayout";
import ExecutiveDashboard from "./components/app/ExecutiveDashboard";
import ExecutiveSignup from "./components/auth/ExecutiveSignup";
import ExecutiveLogin from "./components/auth/ExecutiveLogin";
import ExecutiveForgotPasswordPage from "./components/auth/ExecutiveForgotPassword";
import ExecutiveLayout from "./components/app/ExecutiveLayout";
import ExecutiveAnalytical from "./components/app/ExecutiveAnalytical";
import AuthGuard from "./components/auth/AuthGuard";
import AdminLogin from "./components/auth/AdminLogin";
import AdminLayout from "./components/app/admin/AdminLayout";
import AdminDashboard from "./components/app/admin/AdminDashboard";
import AdminAirlines from "./components/app/admin/AdminAirlines";
import NotFound from "./pages/NotFound";
import ChangePasswordPage from "./components/auth/ChangePassword";

const AppRoutes = () => {
  return (
    <main>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/executive-login" element={<ExecutiveLogin />} />

        <Route path="/executive-signup" element={<ExecutiveSignup />} />
        <Route
          path="/executive-forgot-password"
          element={<ExecutiveForgotPasswordPage />}
        />
        <Route
          path="/executive-dashboard"
          element={
            <AuthGuard allowedRoles={["EXECUTIVE"]}>
              <ExecutiveLayout />
            </AuthGuard>
          }
        >
          <Route index element={<ExecutiveDashboard />} />
          <Route path="analytical" element={<ExecutiveAnalytical />} />
        </Route>

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin-dashboard"
          element={
            <AuthGuard allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="airlines" element={<AdminAirlines />} />
        </Route>

        <Route
          path="/united-dashboard"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <DashboardLayout color={"#04549B"} name="united" />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard color={"#04549B"} />} />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#04549B"} />}
          />
          <Route path="document" element={<Documents color={"#04549B"} />} />
        </Route>
        <Route
          path="/turkish-dashboard"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <DashboardLayout color={"#CA0D11"} name="turkish" />
            </AuthGuard>
          }
        >
          <Route
            index
            element={<Dashboard color={"#CA0D11"} name="turkish" />}
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#CA0D11"} name="turkish" />}
          />
          <Route
            path="document"
            element={<Documents color={"#CA0D11"} name="turkish" />}
          />
        </Route>
        <Route
          path="/cotedivoire-dashboard"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <DashboardLayout color={"#1C7A39"} name="cotedivoire" />
            </AuthGuard>
          }
        >
          <Route
            index
            element={<Dashboard color={"#1C7A39"} name="cotedivoire" />}
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#1C7A39"} name="cotedivoire" />}
          />
          <Route
            path="document"
            element={<Documents color={"#1C7A39"} name="cotedivoire" />}
          />
        </Route>
        <Route
          path="/south-africa-dashboard"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <DashboardLayout color={"#003EA5"} name="south-africa" />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard color={"#003EA5"} />} />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#003EA5"} />}
          />
          <Route path="document" element={<Documents color={"#003EA5"} />} />
        </Route>
        <Route
          path="/rwanda-dashboard"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <DashboardLayout color={"#045195"} name="rwanda" />
            </AuthGuard>
          }
        >
          <Route
            index
            element={<Dashboard color={"#045195"} name="rwanda" />}
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#045195"} name="rwanda" />}
          />
          <Route
            path="document"
            element={<Documents color={"#045195"} name="rwanda" />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
};

export default AppRoutes;
