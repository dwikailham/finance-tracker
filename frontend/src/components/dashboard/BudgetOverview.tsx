import React from "react";
import { Card, Progress, Typography, Alert, Space } from "antd";
import { useNavigate } from "react-router";
import { useBudgetSummary } from "../../hooks/useBudgets";
import dayjs from "dayjs";

const { Text } = Typography;

const BudgetOverview: React.FC = () => {
  const month = dayjs().month() + 1;
  const year = dayjs().year();
  const navigate = useNavigate();
  const { data, isLoading } = useBudgetSummary(month, year);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const statusColor: Record<string, string> = {
    safe: "#22c55e",
    warning: "#f59e0b",
    over: "#ef4444",
  };

  const categories = data?.categories || [];
  const topCategories = [...categories]
    .sort((a: any, b: any) => b.percentage - a.percentage)
    .slice(0, 3);

  const hasOver = categories.some((c: any) => c.status === "over");

  return (
    <Card
      title="Budget Bulan Ini"
      extra={<a onClick={() => navigate("/budget")}>Lihat semua →</a>}
      loading={isLoading}
      style={{ borderRadius: 16, height: "100%" }}
    >
      {hasOver && (
        <Alert
          message="Ada kategori yang melebihi budget!"
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {topCategories.map((cat: any) => (
          <div key={cat.id || cat.categoryId}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Text>
                {cat.category?.icon || "📦"} {cat.category?.name || "Tanpa Kategori"}
              </Text>
              <Text type="secondary">
                {formatRupiah(cat.spent)} / {formatRupiah(cat.amount)}
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

        {topCategories.length === 0 && !isLoading && (
          <Text type="secondary">Belum ada budget untuk bulan ini.</Text>
        )}
      </Space>
    </Card>
  );
};

export default BudgetOverview;
