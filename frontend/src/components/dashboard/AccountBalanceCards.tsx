import React from "react";
import { Card, Row, Col, Typography, Skeleton, Empty } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Text } = Typography;

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number | string;
}

interface AccountBalanceCardsProps {
  accounts: Account[];
  loading?: boolean;
}

const AccountBalanceCards: React.FC<AccountBalanceCardsProps> = ({ accounts, loading }) => {
  const navigate = useNavigate();
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <Card
      title="Saldo Rekening"
      extra={<a onClick={() => navigate("/accounts")}>Lihat semua</a>}
      style={{ borderRadius: 16, height: "100%" }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : accounts.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada rekening" />
      ) : (
        <Row gutter={[8, 8]}>
          {accounts.map((acc) => (
            <Col xs={24} key={acc.id}>
              <Card
                size="small"
                styles={{ body: { padding: 12 } }}
                style={{ borderRadius: 12, cursor: "pointer", background: "#f8fafc" }}
                onClick={() => navigate("/accounts")}
                hoverable
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ padding: 8, background: "rgba(99, 102, 241, 0.1)", borderRadius: 8 }}>
                      <BankOutlined style={{ fontSize: 18, color: "#6366f1" }} />
                    </div>
                    <div>
                      <Text strong>{acc.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{acc.type}</Text>
                    </div>
                  </div>
                  <Text strong style={{ color: "var(--color-income)" }}>{formatRupiah(Number(acc.balance))}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default AccountBalanceCards;
