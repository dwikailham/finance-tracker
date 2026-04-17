import React, { useState } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  DatePicker, 
  Button, 
  Space, 
  List, 
  Avatar,
  Popconfirm,
  Empty,
  Skeleton
} from "antd";
import { 
  PlusOutlined, 
  CopyOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useBudgetSummary, useCreateBudget, useUpdateBudget, useDeleteBudget, useCopyBudget } from "../hooks/useBudgets";

import BudgetProgressBar from "../components/budget/BudgetProgressBar";
import BudgetForm from "../components/budget/BudgetForm";
import CopyBudgetModal from "../components/budget/CopyBudgetModal";

const { Title, Text } = Typography;

const BudgetPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const month = selectedDate.month() + 1;
  const year = selectedDate.year();

  const { data: summary, isLoading, refetch } = useBudgetSummary(month, year);
  
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const copyBudget = useCopyBudget();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const handleCreateOrUpdate = async (values: any) => {
    if (editingBudget) {
      await updateBudget.mutateAsync({ id: editingBudget.id, amount: values.amount });
    } else {
      await createBudget.mutateAsync({
        categoryId: values.categoryId || null,
        month,
        year,
        amount: values.amount
      });
    }
    setIsFormVisible(false);
    refetch();
  };

  const handleCopyBudget = async (fromMonth: number, fromYear: number, toMonth: number, toYear: number) => {
    await copyBudget.mutateAsync({ fromMonth, fromYear, toMonth, toYear });
    setIsCopyModalVisible(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteBudget.mutateAsync(id);
    refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };


  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Budgeting</Title>
          <Text type="secondary">Monitor dan kelola anggaran pengeluaran Anda</Text>
        </div>
        <Space wrap size="small">
          <DatePicker 
            picker="month" 
            value={selectedDate} 
            onChange={(date) => date && setSelectedDate(date)} 
            allowClear={false}
            size="large"
            style={{ borderRadius: 10, width: 160 }}
          />
          <Button 
            type="default" 
            size="large"
            icon={<CopyOutlined />}
            onClick={() => setIsCopyModalVisible(true)}
            style={{ borderRadius: 10 }}
          >
            Copy
          </Button>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBudget(null);
              setIsFormVisible(true);
            }}
            style={{ 
              borderRadius: 12, 
              background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
            }}
          >
            Set Budget
          </Button>
        </Space>
      </div>

      {isLoading ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <Col xs={24} md={8} key={i}>
              <Card style={{ borderRadius: 16 }}><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card className="glass-effect" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>Total Anggaran</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(summary?.totalBudget || 0)}</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="glass-effect" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>Terpakai ({summary?.percentage.toFixed(0) || 0}%)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: summary?.status === 'over' ? "var(--color-over)" : summary?.status === 'warning' ? "var(--color-warning)" : "var(--color-safe)" }}>
                {formatCurrency(summary?.totalSpent || 0)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="glass-effect" styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, marginBottom: 4 }}>Sisa Anggaran</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(summary?.totalRemaining || 0)}</div>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="glass-effect" style={{ borderRadius: 16, marginBottom: 24 }}>
        <Title level={5} style={{ marginTop: 0, fontSize: 14, color: "var(--text-secondary)" }}>PROGRESS TOTAL</Title>
        {isLoading ? <Skeleton.Button active block style={{ height: 20 }} /> : (
          <BudgetProgressBar 
            budget={summary?.totalBudget || 0} 
            spent={summary?.totalSpent || 0} 
            status={summary?.status || 'safe'} 
          />
        )}
      </Card>

      <Card className="glass-effect" style={{ borderRadius: 16 }} styles={{ body: { padding: "0 24px" } }}>
        <List
          loading={isLoading}
          dataSource={summary?.categories || []}
          locale={{ emptyText: <Empty description="Belum ada budget yang di-set" style={{ padding: "40px 0" }} /> }}
          renderItem={(item) => (
            <List.Item
              style={{ padding: "24px 0" }}
              actions={[
                <Button 
                  type="text" 
                  size="small"
                  icon={<EditOutlined />} 
                  onClick={() => {
                    setEditingBudget(item);
                    setIsFormVisible(true);
                  }} 
                />,
                <Popconfirm
                  title="Hapus budget?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Hapus"
                  cancelText="Batal"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar 
                    style={{ backgroundColor: item.category?.color || "#6366f1", boxShadow: `0 4px 10px ${item.category?.color}33` }}
                    size="large"
                  >
                    {item.category?.icon || "📦"}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text strong style={{ fontSize: 14 }}>{item.category?.name || "Kategori Umum"}</Text>
                      <Text strong style={{ fontSize: 13 }}>
                        {formatCurrency(item.spent)} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>/ {formatCurrency(item.amount)}</span>
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>{item.percentage.toFixed(0)}% telah digunakan</Text>
                  </div>
                </div>
                <BudgetProgressBar 
                  budget={item.amount} 
                  spent={item.spent} 
                  status={item.status} 
                />
              </div>
            </List.Item>
          )}
        />
      </Card>

      <BudgetForm
        visible={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onSubmit={handleCreateOrUpdate}
        editingId={editingBudget?.id}
        initialValues={editingBudget ? {
          categoryId: editingBudget.categoryId,
          amount: editingBudget.amount
        } : undefined}
        loading={createBudget.isPending || updateBudget.isPending}
      />

      <CopyBudgetModal
        visible={isCopyModalVisible}
        onCancel={() => setIsCopyModalVisible(false)}
        onConfirm={handleCopyBudget}
        loading={copyBudget.isPending}
      />
    </div>
  );
};

export default BudgetPage;
