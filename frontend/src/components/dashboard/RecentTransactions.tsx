import React from "react";
import { Card, List, Typography, Avatar } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

const { Text } = Typography;

interface RecentTransactionsProps {
  transactions: any[];
  loading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, loading }) => {
  const navigate = useNavigate();
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <Card
      title="Transaksi Terakhir"
      extra={<a onClick={() => navigate("/transactions")}>Lihat semua →</a>}
      loading={loading}
      style={{ borderRadius: 16, height: "100%" }}
      bodyStyle={{ padding: "0 16px" }}
    >
      <List
        dataSource={transactions}
        renderItem={(item: any) => (
          <List.Item style={{ padding: "12px 0" }}>
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: item.category?.color || "#6366f1" }}>
                  {item.category?.icon || "💰"}
                </Avatar>
              }
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {item.category?.name || "Tanpa Kategori"}
                  </Text>
                  <Text
                    strong
                    style={{
                      color: item.type === "income" ? "#22c55e" : "#ef4444",
                      fontSize: 13,
                    }}
                  >
                    {item.type === "income" ? "+" : "-"}{formatRupiah(Number(item.amount))}
                  </Text>
                </div>
              }
              description={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.description || "-"} • {item.account?.name || ""}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.transactionDate).format("DD MMM")}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: !loading ? "Belum ada transaksi." : " " }}
      />
    </Card>
  );
};

export default RecentTransactions;
