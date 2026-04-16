import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import AppLayout from "./components/common/AppLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TransactionListPage from "./pages/TransactionListPage";
import AccountListPage from "./pages/AccountListPage";
import BudgetPage from "./pages/BudgetPage";
import DashboardPage from "./pages/DashboardPage";
import CategoryListPage from "./pages/CategoryListPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionListPage />} />
            <Route path="accounts" element={<AccountListPage />} />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="reports" element={<div>Laporan</div>} />
            <Route path="settings" element={<div>Pengaturan</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>

      <style>{`
        .page-header {
          margin-bottom: 24px;
        }
        .page-header h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }
      `}</style>
    </BrowserRouter>
  );
};

export default App;
