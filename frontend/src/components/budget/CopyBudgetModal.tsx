import React, { useState } from "react";
import { Modal, DatePicker, message } from "antd";
import dayjs from "dayjs";

interface CopyBudgetModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (fromMonth: number, fromYear: number, toMonth: number, toYear: number) => void;
  loading?: boolean;
}

const CopyBudgetModal: React.FC<CopyBudgetModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  const [sourceDate, setSourceDate] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, 'month'));
  const [targetDate, setTargetDate] = useState<dayjs.Dayjs | null>(dayjs());

  const handleConfirm = () => {
    if (!sourceDate || !targetDate) {
      message.error("Silakan pilih bulan sumber dan tujuan");
      return;
    }
    
    // Antd DatePicker month is 0-indexed, but our api expects 1-indexed
    onConfirm(
      sourceDate.month() + 1,
      sourceDate.year(),
      targetDate.month() + 1,
      targetDate.year()
    );
  };

  return (
    <Modal
      title="Copy Budget"
      open={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      confirmLoading={loading}
      okText="Copy Budget"
      cancelText="Batal"
      centered
    >
      <div style={{ marginBottom: 16 }}>
        <p>Bulan Sumber (Copy Dari)</p>
        <DatePicker
          picker="month"
          value={sourceDate}
          onChange={(date) => setSourceDate(date)}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <p>Bulan Tujuan (Copy Ke)</p>
        <DatePicker
          picker="month"
          value={targetDate}
          onChange={(date) => setTargetDate(date)}
          style={{ width: "100%" }}
        />
      </div>
    </Modal>
  );
};

export default CopyBudgetModal;
