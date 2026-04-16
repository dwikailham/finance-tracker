import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface SummaryCardsProps {
  totalBalance: number;
  income: number;
  expense: number;
  loading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalBalance, income, expense, loading }) => {
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card loading={loading} style={{ borderRadius: 16, background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)", border: "none" }}>
          <Statistic
            title={<span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Total Saldo</span>}
            value={totalBalance}
            formatter={(val) => <span style={{ color: "#fff" }}>{formatRupiah(Number(val))}</span>}
            prefix={<WalletOutlined style={{ color: "#fff" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card loading={loading} style={{ borderRadius: 16, border: "none" }}>
          <Statistic
            title={<span style={{ fontSize: 14 }}>Pemasukan Bulan Ini</span>}
            value={income}
            formatter={(val) => formatRupiah(Number(val))}
            prefix={<ArrowUpOutlined />}
            valueStyle={{ color: "#22c55e" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card loading={loading} style={{ borderRadius: 16, border: "none" }}>
          <Statistic
            title={<span style={{ fontSize: 14 }}>Pengeluaran Bulan Ini</span>}
            value={expense}
            formatter={(val) => formatRupiah(Number(val))}
            prefix={<ArrowDownOutlined />}
            valueStyle={{ color: "#ef4444" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;
