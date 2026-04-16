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
  Avatar
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
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (text: string, record: Category) => (
        <Avatar size="large" style={{ backgroundColor: record.color || "#ccc" }}>
          {text}
        </Avatar>
      ),
    },
    {
      title: "Nama Kategori",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Category) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.isDefault && <Tag color="blue" style={{ marginTop: 4 }}>System Default</Tag>}
        </Space>
      )
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Badge 
          status={type === "income" ? "success" : "error"} 
          text={type === "income" ? "Pemasukan" : "Pengeluaran"} 
        />
      ),
      filters: [
        { text: 'Pemasukan', value: 'income' },
        { text: 'Pengeluaran', value: 'expense' },
      ],
      onFilter: (value: boolean | React.Key, record: Category) => record.type === value,
    },
    {
      title: "Dibuat Tanggal",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      render: (_: any, record: Category) => {
        if (record.isDefault) {
          return <Text type="secondary" style={{ fontSize: "12px" }}>Bawaan Sistem</Text>;
        }
        return (
          <Space size="middle">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingCategory(record);
                setIsFormVisible(true);
              }} 
            />
            <Popconfirm
              title="Hapus Kategori"
              description="Apakah Anda yakin ingin menghapus kategori ini? (Bisa jadi terdapat transaksi yang terhubung)"
              onConfirm={() => handleDelete(record.id)}
              okText="Hapus"
              cancelText="Batal"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
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
            borderRadius: 8, 
            height: 44,
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            border: "none"
          }}
        >
          Kategori Baru
        </Button>
      </div>

      <Card className="glassmorphism" style={{ borderRadius: 16, overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={categories} 
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 15 }}
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
