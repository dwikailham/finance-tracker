import React, { useState } from "react";
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tag,
  Popconfirm,
  Badge,
  Avatar,
  Empty
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../hooks/useCategories";
import CategoryForm from "../components/category/CategoryForm";
import type { Category } from "../types/category.types";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const CategoryListPage: React.FC = () => {
  const { data: categories, isLoading } = useCategories();
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreateOrUpdate = async (values: any) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ 
        id: editingCategory.id, 
        data: { 
          name: values.name, 
          icon: values.icon, 
          color: values.color 
        } 
      });
    } else {
      await createCategory.mutateAsync({
        name: values.name,
        type: values.type,
        icon: values.icon,
        color: values.color
      });
    }
    setIsFormVisible(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory.mutateAsync(id);
  };

  const columns = [
    {
      title: "Kategori",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string, record: Category) => (
        <Space size="middle">
          <Avatar size="large" style={{ backgroundColor: record.color || "#6366f1", boxShadow: `0 4px 10px ${record.color}44` }}>
            {record.icon}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: 13 }}>{text}</Text>
            {record.isDefault && <Tag color="blue" bordered={false} style={{ fontSize: 10, marginTop: 2 }}>Sistem</Tag>}
          </Space>
        </Space>
      )
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Badge 
          status={type === "income" ? "success" : "error"} 
          text={<span style={{ fontSize: 13 }}>{type === "income" ? "Pemasukan" : "Pengeluaran"}</span>} 
        />
      ),
      filters: [
        { text: 'Pemasukan', value: 'income' },
        { text: 'Pengeluaran', value: 'expense' },
      ],
      onFilter: (value: boolean | React.Key, record: Category) => record.type === value,
    },
    {
      title: "Tanggal",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format("DD MMM YYYY")}</Text>,
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: Category) => {
        if (record.isDefault) {
          return <Text type="secondary" style={{ fontSize: "11px" }}>Bawaan Sistem</Text>;
        }
        return (
          <Space size="small">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingCategory(record);
                setIsFormVisible(true);
              }} 
            />
            <Popconfirm
              title="Hapus Kategori?"
              description="Pastikan tidak ada transaksi aktif di kategori ini."
              onConfirm={() => handleDelete(record.id)}
              okText="Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Daftar Kategori</Title>
          <Text type="secondary">Kelola kategori untuk transaksi dan budgeting Anda.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            setIsFormVisible(true);
          }}
          style={{ 
            borderRadius: 12, 
            height: 44,
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
          }}
        >
          Kategori Baru
        </Button>
      </div>

      <Card className="glass-effect" style={{ borderRadius: 16, overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={categories} 
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 600 }}
          size="middle"
          pagination={{ pageSize: 10, size: "small", position: ["bottomCenter"] }}
          locale={{ emptyText: <Empty description="Belum ada kategori kustom" style={{ padding: "40px 0" }} /> }}
        />
      </Card>

      <CategoryForm
        visible={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onSubmit={handleCreateOrUpdate}
        editingCategory={editingCategory}
        loading={createCategory.isPending || updateCategory.isPending}
      />
    </div>
  );
};

export default CategoryListPage;
