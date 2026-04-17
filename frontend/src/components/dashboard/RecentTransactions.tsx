import React from "react";
import { Card, List, Typography, Avatar, Skeleton, Empty } from "antd";
import dayjs from "dayjs";


interface RecentTransactionsProps {
  transactions: any[];
  loading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, loading }) => {
  const { Text } = Typography;
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <Card title="Transaksi Terakhir" styles={{ body: { padding: "0 16px" } }} style={{ borderRadius: 16, height: "100%" }}>
      {loading ? (
        <div style={{ padding: "16px 0" }}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: "40px 0" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada transaksi" />
        </div>
      ) : (
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
                        color: item.type === "income" ? "var(--color-income)" : "var(--color-expense)",
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
                      {item.description || "Tanpa deskripsi"} • {item.account?.name || ""}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.transactionDate).format("DD MMM")}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RecentTransactions;
