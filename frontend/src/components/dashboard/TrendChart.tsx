import React from "react";
import { Card, Typography } from "antd";
import { Line } from "@ant-design/charts";
import { useTrend } from "../../hooks/useReports";

const { Text } = Typography;

const TrendChart: React.FC = () => {
  const { data: trendData, isLoading } = useTrend(6);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const chartData = (trendData || []).flatMap((item: any) => [
    { month: item.monthLabel, value: item.income, type: "Pemasukan" },
    { month: item.monthLabel, value: item.expense, type: "Pengeluaran" },
  ]);

  const config = {
    data: chartData,
    xField: "month",
    yField: "value",
    colorField: "type",
    smooth: true,
    style: {
      lineWidth: 2.5,
    },
    scale: {
      color: {
        range: ["#22c55e", "#ef4444"],
      },
    },
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
      items: [
        {
          channel: "y",
          valueFormatter: (v: number) => formatRupiah(v),
        },
      ],
    },
    interaction: {
      tooltip: { render: undefined },
    },
  };

  return (
    <Card title="Tren Keuangan (6 Bulan)" loading={isLoading} style={{ borderRadius: 16 }}>
      {chartData.length > 0 ? (
        <Line {...config} height={300} />
      ) : (
        <Text type="secondary">Belum ada data untuk ditampilkan.</Text>
      )}
    </Card>
  );
};

export default TrendChart;
