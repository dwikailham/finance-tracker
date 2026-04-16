import React from "react";
import { Progress, Tag, Space, Typography } from "antd";

const { Text } = Typography;

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  status: "safe" | "warning" | "over";
  showLabel?: boolean;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  spent,
  budget,
  status,
  showLabel = true,
}) => {
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  
  let strokeColor = "#22C55E"; // safe (hijau)
  if (status === "warning") strokeColor = "#EAB308"; // warning (kuning)
  if (status === "over") strokeColor = "#EF4444"; // over (merah)

  return (
    <div style={{ width: "100%" }}>
      <Progress
        percent={percent}
        strokeColor={strokeColor}
        showInfo={false}
        status={status === "over" ? "exception" : "normal"}
      />
      {showLabel && (
        <Space style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {percent.toFixed(0)}% Terpakai
          </Text>
          {status === "over" && (
            <Tag color="error" bordered={false}>
              OVER BUDGET
            </Tag>
          )}
        </Space>
      )}
    </div>
  );
};

export default BudgetProgressBar;
