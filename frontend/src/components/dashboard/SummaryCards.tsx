import { Row, Col, Card, Skeleton } from "antd";
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { formatCurrency } from "../../utils/formatCurrency";



interface SummaryCardsProps {
  totalBalance: number;
  income: number;
  expense: number;
  loading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalBalance, income, expense, loading }) => {
  const CardContent = ({ title, value, prefix, color, isWhite }: any) => (
    <div>
      <div style={{ color: isWhite ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20, color: isWhite ? "#fff" : color || "inherit", display: "flex" }}>{prefix}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: isWhite ? "#fff" : "inherit" }}>
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card 
          styles={{ body: { padding: 24 } }} 
          style={{ borderRadius: 16, background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)", border: "none" }}
        >
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} /> : (
            <CardContent title="Total Saldo" value={totalBalance} prefix={<WalletOutlined />} isWhite />
          )}
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} /> : (
            <CardContent title="Pemasukan Bulan Ini" value={income} prefix={<ArrowUpOutlined />} color="#22c55e" />
          )}
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} /> : (
            <CardContent title="Pengeluaran Bulan Ini" value={expense} prefix={<ArrowDownOutlined />} color="#ef4444" />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;
