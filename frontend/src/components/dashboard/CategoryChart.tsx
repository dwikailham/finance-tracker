import React from "react";
import { Card, Typography } from "antd";
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
    label: {
      text: "name",
      position: "outside" as const,
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
    },
    annotations: [
      {
        type: "text" as const,
        style: {
          text: "Pengeluaran",
          x: "50%",
          y: "50%",
          textAlign: "center" as const,
          fontSize: 14,
          fill: "#999",
        },
      },
    ],
  };

  return (
    <Card title="Komposisi Pengeluaran" loading={isLoading} style={{ borderRadius: 16, height: "100%" }}>
      {chartData.length > 0 ? (
        <Pie {...config} height={300} />
      ) : (
        <Text type="secondary">Belum ada data pengeluaran bulan ini.</Text>
      )}
    </Card>
  );
};

export default CategoryChart;
