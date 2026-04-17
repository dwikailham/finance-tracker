import React from "react";
import { Typography, Row, Col } from "antd";
import { useDashboardSummary } from "../hooks/useReports";
import SummaryCards from "../components/dashboard/SummaryCards";
import AccountBalanceCards from "../components/dashboard/AccountBalanceCards";
import BudgetOverview from "../components/dashboard/BudgetOverview";
import TrendChart from "../components/dashboard/TrendChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import ErrorBoundary from "../components/common/ErrorBoundary";

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { data, isLoading } = useDashboardSummary();

  const { 
    accounts = [], 
    totalBalance = 0, 
    currentMonth = { income: 0, expense: 0 }, 
    recentTransactions = [] 
  } = data || {};

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }} className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Ringkasan keuangan Anda hari ini.</Text>
      </div>

      {/* Row 1: Summary Cards */}
      <div style={{ marginBottom: 16 }}>
        <ErrorBoundary fallbackTitle="Kartu Ringkasan Gagal Dimuat">
          <SummaryCards
            totalBalance={totalBalance}
            income={currentMonth.income}
            expense={currentMonth.expense}
            loading={isLoading}
          />
        </ErrorBoundary>
      </div>

      {/* Row 2: Account Balance + Budget Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <ErrorBoundary fallbackTitle="Saldo Rekening Gagal Dimuat">
            <AccountBalanceCards accounts={accounts} loading={isLoading} />
          </ErrorBoundary>
        </Col>
        <Col xs={24} lg={12}>
          <ErrorBoundary fallbackTitle="Ringkasan Budget Gagal Dimuat">
            <BudgetOverview />
          </ErrorBoundary>
        </Col>
      </Row>

      {/* Row 3: Trend Chart */}
      <div style={{ marginBottom: 16 }}>
        <ErrorBoundary fallbackTitle="Grafik Tren Gagal Dimuat">
          <TrendChart />
        </ErrorBoundary>
      </div>

      {/* Row 4: Category Chart + Recent Transactions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ErrorBoundary fallbackTitle="Grafik Kategori Gagal Dimuat">
            <CategoryChart />
          </ErrorBoundary>
        </Col>
        <Col xs={24} lg={14}>
          <ErrorBoundary fallbackTitle="Transaksi Terbaru Gagal Dimuat">
            <RecentTransactions transactions={recentTransactions} loading={isLoading} />
          </ErrorBoundary>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
