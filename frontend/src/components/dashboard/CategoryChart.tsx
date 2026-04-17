import React from "react";
import { Card, Typography, Skeleton } from "antd";
import { Pie } from "@ant-design/charts";
import { useCategoryBreakdown } from "../../hooks/useReports";
import dayjs from "dayjs";

const { Text } = Typography;

const CategoryChart: React.FC = () => {
  const month = dayjs().month() + 1;
  const year = dayjs().year();
  const { data: breakdown, isLoading } = useCategoryBreakdown(month, year);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const chartData = (breakdown || []).map((item: any) => ({
    name: `${item.icon} ${item.name}`,
    value: item.amount,
    color: item.color,
  }));

  const config = {
    data: chartData,
    angleField: "value",
    colorField: "name",
    innerRadius: 0.6,
    autoFit: true,
    label: {
      text: "name",
      position: "outside" as const,
      style: {
        fontSize: 10,
      }
    },
    tooltip: {
      items: [
        {
          channel: "y",
          valueFormatter: (v: number) => formatRupiah(v),
        },
      ],
    },
    legend: {
      position: "bottom" as const,
      layout: "horizontal" as const,
    },
    annotations: [
      {
        type: "text" as const,
        style: {
          text: "Breakdown",
          x: "50%",
          y: "50%",
          textAlign: "center" as const,
          fontSize: 12,
          fill: "#64748b",
        },
      },
    ],
  };

  return (
    <Card title="Komposisi Pengeluaran" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16, height: "100%" }}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : chartData.length > 0 ? (
        <Pie {...config} height={300} />
      ) : (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <Text type="secondary">Belum ada data pengeluaran bulan ini.</Text>
        </div>
      )}
    </Card>
  );
};

export default CategoryChart;
