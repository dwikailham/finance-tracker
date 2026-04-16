import React from "react";
import { Typography, Row, Col, Spin } from "antd";
import { useDashboardSummary } from "../hooks/useReports";
import SummaryCards from "../components/dashboard/SummaryCards";
import AccountBalanceCards from "../components/dashboard/AccountBalanceCards";
import BudgetOverview from "../components/dashboard/BudgetOverview";
import TrendChart from "../components/dashboard/TrendChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const { 
    accounts = [], 
    totalBalance = 0, 
    currentMonth = { income: 0, expense: 0 }, 
    recentTransactions = [] 
  } = data || {};

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Ringkasan keuangan Anda hari ini.</Text>
      </div>

      {/* Row 1: Summary Cards */}
      <div style={{ marginBottom: 16 }}>
        <SummaryCards
          totalBalance={totalBalance}
          income={currentMonth.income}
          expense={currentMonth.expense}
          loading={isLoading}
        />
      </div>

      {/* Row 2: Account Balance + Budget Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <AccountBalanceCards accounts={accounts} loading={isLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <BudgetOverview />
        </Col>
      </Row>

      {/* Row 3: Trend Chart */}
      <div style={{ marginBottom: 16 }}>
        <TrendChart />
      </div>

      {/* Row 4: Category Chart + Recent Transactions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <CategoryChart />
        </Col>
        <Col xs={24} lg={14}>
          <RecentTransactions transactions={recentTransactions} loading={isLoading} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
