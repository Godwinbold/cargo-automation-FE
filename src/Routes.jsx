import { Routes, Route } from "react-router-dom";
import Home from "./components/landing/Home";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/app/Dashboard";
import Documents from "./components/app/Documents";
import ManageShipping from "./components/app/ManageShipping";
import DashboardLayout from "./components/app/DashboardLayout";

const AppRoutes = () => {
  return (
    <main>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/united-dashboard"
          element={<DashboardLayout color={"#04549B"} name="united" />}
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
          element={<DashboardLayout color={"#CA0D11"} name="turkish" />}
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
          element={<DashboardLayout color={"#1C7A39"} name="cotedivoire" />}
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
          element={<DashboardLayout color={"#003EA5"} name="south-africa" />}
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
          element={<DashboardLayout color={"#045195"} name="rwanda" />}
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
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </main>
  );
};

export default AppRoutes;
