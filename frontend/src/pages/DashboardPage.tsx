import React from "react";
import { Card, Typography, Row, Col } from "antd";
import dayjs from "dayjs";
import { useBudgetSummary } from "../hooks/useBudgets";
import BudgetProgressBar from "../components/budget/BudgetProgressBar";

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const { data: budgetSummary, isLoading } = useBudgetSummary(currentMonth, currentYear);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Selamat datang di FinTrack.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Budget Bulan Ini" 
            className="glassmorphism" 
            style={{ borderRadius: 16 }}
            loading={isLoading}
          >
            {budgetSummary && (
              <BudgetProgressBar 
                budget={budgetSummary.totalBudget} 
                spent={budgetSummary.totalSpent} 
                status={budgetSummary.status} 
              />
            )}
            {!budgetSummary && !isLoading && (
              <Text type="secondary">Belum ada budget untuk bulan ini.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
