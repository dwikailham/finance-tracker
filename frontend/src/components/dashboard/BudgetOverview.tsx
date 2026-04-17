import React from "react";
import { Card, Progress, Typography, Alert, Space, Skeleton, Empty } from "antd";
import { useNavigate } from "react-router";
import { useBudgetSummary } from "../../hooks/useBudgets";
import dayjs from "dayjs";

const { Text } = Typography;

const BudgetOverview: React.FC = () => {
  const month = dayjs().month() + 1;
  const year = dayjs().year();
  const navigate = useNavigate();
  const { data, isLoading } = useBudgetSummary(month, year);


  const statusColor: Record<string, string> = {
    safe: "var(--color-income)",
    warning: "var(--color-warning)",
    over: "var(--color-over)",
  };

  const categories = data?.categories || [];
  const topCategories = [...categories]
    .sort((a: any, b: any) => b.percentage - a.percentage)
    .slice(0, 3);

  const hasOver = categories.some((c: any) => c.status === "over");

  return (
    <Card
      title="Budget Bulan Ini"
      extra={<a onClick={() => navigate("/budget")}>Rincian</a>}
      styles={{ body: { padding: 24 } }}
      style={{ borderRadius: 16, height: "100%" }}
    >
      {isLoading ? (
        <Skeleton active />
      ) : categories.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada budget" />
      ) : (
        <>
          {hasOver && (
            <Alert
              message="Ouch, ada budget yang jebol!"
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 12, fontSize: 13 }}
            />
          )}

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {topCategories.map((cat: any) => (
              <div key={cat.id || cat.categoryId}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>
                    {cat.category?.icon} {cat.category?.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {cat.percentage.toFixed(0)}%
                  </Text>
                </div>
                <Progress
                  percent={Math.min(cat.percentage, 100)}
                  strokeColor={statusColor[cat.status] || "#6366f1"}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Space>
        </>
      )}
    </Card>
  );
};

export default BudgetOverview;
