import React, { useState } from "react";
import { Typography, Row, Col, Card, Statistic, DatePicker, Button, Table, Progress, Space } from "antd";
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
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
    { week: `Minggu ${w.week}`, value: w.income, type: "Pemasukan" },
    { week: `Minggu ${w.week}`, value: w.expense, type: "Pengeluaran" },
  ]);

  const barConfig = {
    data: weeklyChartData,
    xField: "week",
    yField: "value",
    colorField: "type",
    group: true,
    scale: { color: { range: ["#22c55e", "#ef4444"] } },
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
    name: `${item.icon} ${item.name}`,
    value: item.amount,
  }));

  const donutConfig = {
    data: donutData,
    angleField: "value",
    colorField: "name",
    innerRadius: 0.6,
    label: { text: "name", position: "outside" as const },
    tooltip: {
      items: [{ channel: "y", valueFormatter: (v: number) => formatRupiah(v) }],
    },
    legend: { position: "bottom" as const },
  };

  // Top 5 expense categories table
  const topExpenseColumns = [
    { title: "#", dataIndex: "rank", key: "rank", width: 40 },
    {
      title: "Kategori", dataIndex: "name", key: "name",
      render: (_: any, record: any) => <span>{record.icon} {record.name}</span>
    },
    {
      title: "Jumlah", dataIndex: "amount", key: "amount",
      render: (val: number) => formatRupiah(val)
    },
    {
      title: "%", dataIndex: "percentage", key: "percentage",
      render: (val: number) => `${val.toFixed(1)}%`
    },
  ];
  const topExpenseData = (monthlyReport?.topExpenseCategories || []).map((c: any, i: number) => ({
    ...c, rank: i + 1, key: c.categoryId || i,
  }));

  // Budget vs actual table
  const budgetColumns = [
    {
      title: "Kategori", key: "name",
      render: (_: any, r: any) => <span>{r.icon} {r.name}</span>
    },
    { title: "Budget", dataIndex: "budget", key: "budget", render: (v: number) => formatRupiah(v) },
    { title: "Aktual", dataIndex: "actual", key: "actual", render: (v: number) => formatRupiah(v) },
    {
      title: "Selisih", dataIndex: "difference", key: "difference",
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? "#22c55e" : "#ef4444" }}>
          {v >= 0 ? "+" : ""}{formatRupiah(v)}
        </Text>
      )
    },
    {
      title: "Progress", dataIndex: "percentage", key: "progress", width: 150,
      render: (v: number) => (
        <Progress
          percent={Math.min(v, 100)}
          strokeColor={v < 75 ? "#22c55e" : v < 100 ? "#f59e0b" : "#ef4444"}
          size="small"
        />
      )
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Laporan Bulanan</Title>
          <Text type="secondary">Analisis keuangan untuk {selectedDate.format("MMMM YYYY")}</Text>
        </div>
        <Space>
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            allowClear={false}
            size="large"
          />
          <Button icon={<DownloadOutlined />} size="large" disabled>
            Export CSV
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card loading={loadingMonthly} style={{ borderRadius: 16 }}>
            <Statistic title="Total Pemasukan" value={totalIncome} formatter={(v) => formatRupiah(Number(v))} prefix={<ArrowUpOutlined />} valueStyle={{ color: "#22c55e" }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loadingMonthly} style={{ borderRadius: 16 }}>
            <Statistic title="Total Pengeluaran" value={totalExpense} formatter={(v) => formatRupiah(Number(v))} prefix={<ArrowDownOutlined />} valueStyle={{ color: "#ef4444" }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loadingMonthly} style={{ borderRadius: 16 }}>
            <Statistic title="Selisih (Net)" value={netBalance} formatter={(v) => formatRupiah(Number(v))} valueStyle={{ color: netBalance >= 0 ? "#22c55e" : "#ef4444" }} />
          </Card>
        </Col>
      </Row>

      {/* Weekly Bar Chart */}
      <Card title="Pemasukan vs Pengeluaran per Minggu" loading={loadingMonthly} style={{ borderRadius: 16, marginBottom: 16 }}>
        {weeklyChartData.length > 0 ? (
          <Column {...barConfig} height={300} />
        ) : (
          <Text type="secondary">Belum ada data.</Text>
        )}
      </Card>

      {/* Category Donut + Top 5 Expense */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="Breakdown Pengeluaran" loading={loadingCategory} style={{ borderRadius: 16, height: "100%" }}>
            {donutData.length > 0 ? (
              <Pie {...donutConfig} height={300} />
            ) : (
              <Text type="secondary">Belum ada data.</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Top 5 Pengeluaran Terbesar" loading={loadingMonthly} style={{ borderRadius: 16, height: "100%" }}>
            <Table columns={topExpenseColumns} dataSource={topExpenseData} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>

      {/* Budget vs Actual */}
      <Card title="Budget vs Realisasi" loading={loadingBudget} style={{ borderRadius: 16 }}>
        {(budgetVsActual?.items || []).length > 0 ? (
          <Table
            columns={budgetColumns}
            dataSource={(budgetVsActual?.items || []).map((i: any) => ({ ...i, key: i.categoryId }))}
            pagination={false}
            size="small"
          />
        ) : (
          <Text type="secondary">Belum ada budget yang ditetapkan untuk bulan ini.</Text>
        )}
      </Card>
    </div>
  );
};

export default ReportPage;
