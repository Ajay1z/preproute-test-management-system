import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CreateTest from "../pages/CreateTest";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Preview from "../pages/Preview";
import Questions from "../pages/Questions";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tests/create" element={<CreateTest />} />
        <Route path="/tests/:id/questions" element={<Questions />} />
        <Route path="/tests/:id/preview" element={<Preview />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
