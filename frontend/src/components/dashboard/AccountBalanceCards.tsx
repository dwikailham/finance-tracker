import React from "react";
import { Card, Row, Col, Typography } from "antd";
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
      extra={<a onClick={() => navigate("/accounts")}>Lihat semua →</a>}
      loading={loading}
      style={{ borderRadius: 16, height: "100%" }}
    >
      <Row gutter={[8, 8]}>
        {accounts.map((acc) => (
          <Col xs={24} key={acc.id}>
            <Card
              size="small"
              style={{ borderRadius: 12, cursor: "pointer", background: "#fafafa" }}
              onClick={() => navigate("/accounts")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BankOutlined style={{ fontSize: 18, color: "#6366f1" }} />
                  <div>
                    <Text strong>{acc.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{acc.type}</Text>
                  </div>
                </div>
                <Text strong style={{ color: "#22c55e" }}>{formatRupiah(Number(acc.balance))}</Text>
              </div>
            </Card>
          </Col>
        ))}
        {accounts.length === 0 && !loading && (
          <Col span={24}><Text type="secondary">Belum ada rekening.</Text></Col>
        )}
      </Row>
    </Card>
  );
};

export default AccountBalanceCards;
