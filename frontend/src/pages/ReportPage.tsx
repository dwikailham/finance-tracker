import React, { useState } from "react";
import { Typography, Row, Col, Card, DatePicker, Button, Table, Progress, Space, Skeleton, Empty } from "antd";
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, BarChartOutlined } from "@ant-design/icons";
import { Column, Pie } from "@ant-design/charts";
import { useMonthlyReport, useCategoryBreakdown, useBudgetVsActual } from "../hooks/useReports";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const month = selectedDate.month() + 1;
  const year = selectedDate.year();

  const { data: monthlyReport, isLoading: loadingMonthly } = useMonthlyReport(month, year);
  const { data: categoryBreakdown, isLoading: loadingCategory } = useCategoryBreakdown(month, year);
  const { data: budgetVsActual, isLoading: loadingBudget } = useBudgetVsActual(month, year);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);


  const totalIncome = monthlyReport?.totalIncome || 0;
  const totalExpense = monthlyReport?.totalExpense || 0;
  const netBalance = monthlyReport?.netBalance || 0;

  // Weekly bar chart data
  const weeklyChartData = (monthlyReport?.weeklyBreakdown || []).flatMap((w: any) => [
    { week: `W${w.week}`, value: w.income, type: "Pemasukan" },
    { week: `W${w.week}`, value: w.expense, type: "Pengeluaran" },
  ]);

  const barConfig = {
    data: weeklyChartData,
    xField: "week",
    yField: "value",
    colorField: "type",
    group: true,
    autoFit: true,
    scale: { color: { range: ["var(--color-income)", "var(--color-expense)"] } },
    axis: {
      y: {
        labelFormatter: (v: number) => {
          if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
          if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
          return String(v);
        },
      },
    },
    tooltip: {
      items: [{ channel: "y", valueFormatter: (v: number) => formatRupiah(v) }],
    },
  };

  // Donut chart data
  const donutData = (categoryBreakdown || []).map((item: any) => ({
    name: `${item.icon || "📦"} ${item.name}`,
    value: item.amount,
  }));

  const donutConfig = {
    data: donutData,
    angleField: "value",
    colorField: "name",
    innerRadius: 0.6,
    autoFit: true,
    label: { 
      text: "name", 
      position: "outside" as const,
      style: { fontSize: 10 }
    },
    tooltip: {
      items: [{ channel: "y", valueFormatter: (v: number) => formatRupiah(v) }],
    },
    legend: { 
      position: "bottom" as const,
      layout: "horizontal" as const,
    },
  };

  // Top 5 expense categories table
  const topExpenseColumns = [
    { 
      title: "#", dataIndex: "rank", key: "rank", width: 50,
      render: (v: number) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>
    },
    {
      title: "Kategori", dataIndex: "name", key: "name",
      render: (_: any, record: any) => <Space><span style={{ fontSize: 16 }}>{record.icon}</span> <Text style={{ fontSize: 13 }}>{record.name}</Text></Space>
    },
    {
      title: "Jumlah", dataIndex: "amount", key: "amount", align: "right" as const,
      render: (val: number) => <Text strong style={{ fontSize: 13 }}>{formatRupiah(val)}</Text>
    },
  ];

  const topExpenseData = (monthlyReport?.topExpenseCategories || []).map((c: any, i: number) => ({
    ...c, rank: i + 1, key: c.categoryId || i,
  }));

  // Budget vs actual table
  const budgetColumns = [
    {
      title: "Kategori", key: "name",
      render: (_: any, r: any) => <Space><span>{r.icon}</span> <Text style={{ fontSize: 13 }}>{r.name}</Text></Space>
    },
    { title: "Budget", dataIndex: "budget", key: "budget", align: "right" as const, render: (v: number) => <Text type="secondary" style={{ fontSize: 13 }}>{formatRupiah(v)}</Text> },
    { title: "Aktual", dataIndex: "actual", key: "actual", align: "right" as const, render: (v: number) => <Text strong style={{ fontSize: 13 }}>{formatRupiah(v)}</Text> },
    {
      title: "Status", dataIndex: "percentage", key: "progress", width: 140,
      render: (v: number) => (
        <Progress
          percent={Math.min(v, 100)}
          strokeColor={v < 80 ? "var(--color-safe)" : v < 100 ? "var(--color-warning)" : "var(--color-over)"}
          size="small"
          showInfo={false}
        />
      )
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Laporan Bulanan</Title>
          <Text type="secondary">Analisis keuangan untuk {selectedDate.format("MMMM YYYY")}</Text>
        </div>
        <Space wrap>
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            allowClear={false}
            size="large"
            style={{ borderRadius: 10, width: 160 }}
          />
          <Button icon={<DownloadOutlined />} size="large" style={{ borderRadius: 10 }} disabled>
            Export
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      {loadingMonthly ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {[1, 2, 3].map(i => <Col xs={24} sm={8} key={i}><Card style={{ borderRadius: 16 }}><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>)}
        </Row>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card className="glass-effect" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>Total Pemasukan</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-income)", display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowUpOutlined style={{ fontSize: 18 }} /> {formatRupiah(totalIncome)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="glass-effect" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>Total Pengeluaran</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-expense)", display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowDownOutlined style={{ fontSize: 18 }} /> {formatRupiah(totalExpense)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="glass-effect" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>Selisih (Bersih)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: netBalance >= 0 ? "var(--color-income)" : "var(--color-expense)", display: "flex", alignItems: "center", gap: 8 }}>
                 {formatRupiah(netBalance)}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Weekly Bar Chart */}
      <Card title={<Space><BarChartOutlined /> <Text style={{ fontSize: 14 }}>Perbandingan Mingguan</Text></Space>} className="glass-effect" style={{ borderRadius: 16, marginBottom: 16 }}>
        {loadingMonthly ? <Skeleton active paragraph={{ rows: 6 }} /> : weeklyChartData.length > 0 ? (
          <Column {...barConfig} height={300} />
        ) : (
          <Empty description="Belum ada data transaksi" />
        )}
      </Card>

      {/* Category Donut + Top 5 Expense */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card title={<Text style={{ fontSize: 14 }}>Proporsi Pengeluaran</Text>} className="glass-effect" style={{ borderRadius: 16, height: "100%" }}>
            {loadingCategory ? <Skeleton active paragraph={{ rows: 6 }} /> : donutData.length > 0 ? (
              <Pie {...donutConfig} height={300} />
            ) : (
              <Empty description="Belum ada data" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<Text style={{ fontSize: 14 }}>Pengeluaran Terbesar</Text>} className="glass-effect" style={{ borderRadius: 16, height: "100%" }} bodyStyle={{ padding: 0 }}>
            {loadingMonthly ? <div style={{ padding: 24 }}><Skeleton active /></div> : (
              <Table 
                columns={topExpenseColumns} 
                dataSource={topExpenseData} 
                pagination={false} 
                size="middle"
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Budget vs Actual */}
      <Card title={<Text style={{ fontSize: 14 }}>Budget vs Realisasi</Text>} className="glass-effect" style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        {loadingBudget ? <div style={{ padding: 24 }}><Skeleton active /></div> : (budgetVsActual?.items || []).length > 0 ? (
          <Table
            columns={budgetColumns}
            dataSource={(budgetVsActual?.items || []).map((i: any) => ({ ...i, key: i.categoryId }))}
            pagination={false}
            size="middle"
            scroll={{ x: 600 }}
          />
        ) : (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Empty description="Belum ada budget untuk bulan ini" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportPage;
