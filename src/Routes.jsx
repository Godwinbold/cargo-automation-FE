import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Home from "./components/landing/Home";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./pages/auth/Register";
import AcceptInvite from "./pages/auth/AcceptInvite";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/app/Dashboard";
import Documents from "./components/app/Documents";
import ManageShipping from "./components/app/ManageShipping";
import DashboardLayout from "./components/app/DashboardLayout";
import ExecutiveDashboard from "./components/app/ExecutiveDashboard";
import ExecutiveLogin from "./components/auth/ExecutiveLogin";
import ExecutiveForgotPasswordPage from "./components/auth/ExecutiveForgotPassword";
import ExecutiveLayout from "./components/app/ExecutiveLayout";
import ExecutiveAnalytical from "./components/app/ExecutiveAnalytical";
import AuthGuard from "./components/auth/AuthGuard";
import AdminLogin from "./components/auth/AdminLogin";
import AdminLayout from "./components/app/admin/AdminLayout";
import AdminDashboard from "./components/app/admin/AdminDashboard";
import AdminAirlines from "./components/app/admin/AdminAirlines";
import AdminAuditLogs from "./components/app/admin/AdminAuditLogs";
import NotFound from "./pages/NotFound";
import ChangePasswordPage from "./components/auth/ChangePassword";
import FinancialDetailsPage from "./components/app/FinancialDetailsPage";
import ShipmentDetailsPage from "./components/app/ShipmentDetailsPage";
import { useGetAllAirlines } from "./hooks/useGeneral";
import airlineMetadata from "./components/landing/AirlineMetadata";

const ShipmentRedirect = () => {
  const [searchParams] = useSearchParams();
  const airlineId =
    searchParams.get("airlineId") || localStorage.getItem("airlineId");
  const { data: airlinesData, isLoading } = useGetAllAirlines({
    enabled: !!airlineId,
  });

  const slugToDashboard = {
    turkish: "/turkish-dashboard",
    rwandair: "/rwanda-dashboard",
    united: "/united-dashboard",
    southafrica: "/south-africa-dashboard",
    codiv: "/cotedivoire-dashboard",
  };

  if (!airlineId) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DA5E0]"></div>
      </div>
    );
  }

  const airline = airlinesData?.data?.find((a) => a.id === airlineId);
  const metadata = airline
    ? airlineMetadata[airline.airlineName] || {
        slug: airline.airlineName.toLowerCase().replace(/\s+/g, ""),
      }
    : null;

  const dashboardPrefix = metadata?.slug
    ? slugToDashboard[metadata.slug] || `/${metadata.slug}-dashboard`
    : "/united-dashboard";

  return (
    <Navigate
      to={`${dashboardPrefix}/shipment?airlineId=${airlineId}`}
      replace
    />
  );
};

const AppRoutes = () => {
  return (
    <main>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/executive-login" element={<ExecutiveLogin />} />

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
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>

        <Route
          path="/shipment"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <ShipmentRedirect />
            </AuthGuard>
          }
        />

        <Route
          path="/united-dashboard"
          element={
            <AuthGuard allowedRoles={["USER"]}>
              <DashboardLayout color={"#04549B"} name="united" />
            </AuthGuard>
          }
        >
          <Route
            index
            element={<ManageShipping color={"#04549B"} name="united" />}
          />
          <Route
            path="shipment"
            element={<ManageShipping color={"#04549B"} name="united" />}
          />
          <Route
            path="shipment/:id"
            element={
              <ShipmentDetailsPage color={"#04549B"} name="united" />
            }
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#04549B"} name="united" />}
          />
          <Route
            path="manage-shipping/:id"
            element={
              <ShipmentDetailsPage color={"#04549B"} name="united" />
            }
          />
          <Route
            path="financials"
            element={<Dashboard color={"#04549B"} name="united" />}
          />
          <Route
            path="financials/:id"
            element={
              <FinancialDetailsPage color={"#04549B"} name="united" />
            }
          />
          <Route
            path="financial-details/:id"
            element={
              <FinancialDetailsPage color={"#04549B"} name="united" />
            }
          />
          <Route
            path="financial"
            element={<Dashboard color={"#04549B"} name="united" />}
          />
          <Route
            path="document"
            element={<Documents color={"#04549B"} name="united" />}
          />
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
            element={<ManageShipping color={"#CA0D11"} name="turkish" />}
          />
          <Route
            path="shipment"
            element={<ManageShipping color={"#CA0D11"} name="turkish" />}
          />
          <Route
            path="shipment/:id"
            element={
              <ShipmentDetailsPage color={"#CA0D11"} name="turkish" />
            }
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#CA0D11"} name="turkish" />}
          />
          <Route
            path="manage-shipping/:id"
            element={
              <ShipmentDetailsPage color={"#CA0D11"} name="turkish" />
            }
          />
          <Route
            path="financials"
            element={<Dashboard color={"#CA0D11"} name="turkish" />}
          />
          <Route
            path="financials/:id"
            element={
              <FinancialDetailsPage color={"#CA0D11"} name="turkish" />
            }
          />
          <Route
            path="financial-details/:id"
            element={
              <FinancialDetailsPage color={"#CA0D11"} name="turkish" />
            }
          />
          <Route
            path="financial"
            element={<Dashboard color={"#CA0D11"} name="turkish" />}
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
            element={<ManageShipping color={"#1C7A39"} name="cotedivoire" />}
          />
          <Route
            path="shipment"
            element={<ManageShipping color={"#1C7A39"} name="cotedivoire" />}
          />
          <Route
            path="shipment/:id"
            element={
              <ShipmentDetailsPage color={"#1C7A39"} name="cotedivoire" />
            }
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#1C7A39"} name="cotedivoire" />}
          />
          <Route
            path="manage-shipping/:id"
            element={
              <ShipmentDetailsPage color={"#1C7A39"} name="cotedivoire" />
            }
          />
          <Route
            path="financials"
            element={<Dashboard color={"#1C7A39"} name="cotedivoire" />}
          />
          <Route
            path="financials/:id"
            element={
              <FinancialDetailsPage color={"#1C7A39"} name="cotedivoire" />
            }
          />
          <Route
            path="financial-details/:id"
            element={
              <FinancialDetailsPage color={"#1C7A39"} name="cotedivoire" />
            }
          />
          <Route
            path="financial"
            element={<Dashboard color={"#1C7A39"} name="cotedivoire" />}
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
          <Route
            index
            element={
              <ManageShipping color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="shipment"
            element={
              <ManageShipping color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="shipment/:id"
            element={
              <ShipmentDetailsPage color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="manage-shipping"
            element={
              <ManageShipping color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="manage-shipping/:id"
            element={
              <ShipmentDetailsPage color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="financials"
            element={<Dashboard color={"#003EA5"} name="south-africa" />}
          />
          <Route
            path="financials/:id"
            element={
              <FinancialDetailsPage color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="financial-details/:id"
            element={
              <FinancialDetailsPage color={"#003EA5"} name="south-africa" />
            }
          />
          <Route
            path="financial"
            element={<Dashboard color={"#003EA5"} name="south-africa" />}
          />
          <Route
            path="document"
            element={<Documents color={"#003EA5"} name="south-africa" />}
          />
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
            element={<ManageShipping color={"#045195"} name="rwanda" />}
          />
          <Route
            path="shipment"
            element={<ManageShipping color={"#045195"} name="rwanda" />}
          />
          <Route
            path="shipment/:id"
            element={
              <ShipmentDetailsPage color={"#045195"} name="rwanda" />
            }
          />
          <Route
            path="manage-shipping"
            element={<ManageShipping color={"#045195"} name="rwanda" />}
          />
          <Route
            path="manage-shipping/:id"
            element={
              <ShipmentDetailsPage color={"#045195"} name="rwanda" />
            }
          />
          <Route
            path="financials"
            element={<Dashboard color={"#045195"} name="rwanda" />}
          />
          <Route
            path="financials/:id"
            element={
              <FinancialDetailsPage color={"#045195"} name="rwanda" />
            }
          />
          <Route
            path="financial-details/:id"
            element={
              <FinancialDetailsPage color={"#045195"} name="rwanda" />
            }
          />
          <Route
            path="financial"
            element={<Dashboard color={"#045195"} name="rwanda" />}
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
