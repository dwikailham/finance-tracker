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
  Statistic
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
  const month = selectedDate.month() + 1; // dayjs month is 0-indexed
  const year = selectedDate.year();

  const { data: summary, isLoading, refetch } = useBudgetSummary(month, year);
  
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const copyBudget = useCopyBudget();

  // Modal states
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const handleCreateOrUpdate = async (values: any) => {
    if (editingBudget) {
      // Update
      await updateBudget.mutateAsync({ id: editingBudget.id, amount: values.amount });
    } else {
      // Create
      await createBudget.mutateAsync({
        categoryId: values.categoryId || null,
        month,
        year,
        amount: values.amount
      });
    }
    setIsFormVisible(false);
    refetch(); // Refetch summary just in case
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
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Budget Bulan Ini</Title>
          <Text type="secondary">Monitor dan kelola anggaran pengeluaran Anda</Text>
        </div>
        <Space size="middle">
          <DatePicker 
            picker="month" 
            value={selectedDate} 
            onChange={(date) => date && setSelectedDate(date)} 
            allowClear={false}
            size="large"
          />
          <Button 
            type="default" 
            size="large"
            icon={<CopyOutlined />}
            onClick={() => setIsCopyModalVisible(true)}
          >
            Copy dari Bulan Lalu
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
              borderRadius: 8, 
              background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
              border: "none"
            }}
          >
            Set Budget
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card className="glassmorphism" style={{ borderRadius: 16 }}>
            <Statistic 
              title="Total Budget" 
              value={summary?.totalBudget || 0} 
              prefix="Rp"
              formatter={(val) => new Intl.NumberFormat('id-ID').format(val as number)}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glassmorphism" style={{ borderRadius: 16 }}>
            <Statistic 
              title={`Terpakai (${summary?.percentage.toFixed(0) || 0}%)`} 
              value={summary?.totalSpent || 0} 
              prefix="Rp"
              valueStyle={{ color: summary?.status === 'over' ? '#cf1322' : summary?.status === 'warning' ? '#d48806' : '#3f8600' }}
              formatter={(val) => new Intl.NumberFormat('id-ID').format(val as number)}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glassmorphism" style={{ borderRadius: 16 }}>
            <Statistic 
              title="Sisa Anggaran" 
              value={summary?.totalRemaining || 0} 
              prefix="Rp"
              formatter={(val) => new Intl.NumberFormat('id-ID').format(val as number)}
            />
          </Card>
        </Col>
      </Row>

      {/* Total Progress Bar */}
      <Card className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24 }}>
        <Title level={5} style={{ marginTop: 0 }}>Progress Total</Title>
        <BudgetProgressBar 
          budget={summary?.totalBudget || 0} 
          spent={summary?.totalSpent || 0} 
          status={summary?.status || 'safe'} 
        />
      </Card>

      {/* Categories List */}
      <Card className="glassmorphism" style={{ borderRadius: 16 }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Rincian Kategori</Title>
        
        <List
          loading={isLoading}
          dataSource={summary?.categories || []}
          locale={{ emptyText: "Belum ada budget yang di-set untuk bulan ini" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    setEditingBudget(item);
                    setIsFormVisible(true);
                  }} 
                />,
                <Popconfirm
                  title="Hapus budget?"
                  description="Apakah Anda yakin ingin menghapus budget ini?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Ya"
                  cancelText="Tidak"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar 
                    style={{ backgroundColor: item.category?.color || "#ccc" }}
                    size="large"
                  >
                    {item.category?.icon || "📦"}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.category?.name || "Kategori Umum"}</Text>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <Text type="secondary">Terpakai:</Text>
                      <Text strong>{formatCurrency(item.spent)} / {formatCurrency(item.amount)}</Text>
                    </div>
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

      {/* Modals */}
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
