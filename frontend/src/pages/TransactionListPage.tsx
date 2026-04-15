import React, { useState } from "react";
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Select, 
  DatePicker, 
  Popconfirm,
  Tooltip
} from "antd";
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useTransactions, useDeleteTransaction } from "../hooks/useTransactions";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import TransactionForm from "../components/transaction/TransactionForm";
import type { TransactionFilters, TransactionType } from "../types/transaction.types";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TransactionListPage: React.FC = () => {
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    sortBy: "transactionDate",
    sortOrder: "desc",
  });

  const { data, isLoading } = useTransactions(filters);
  const { mutate: deleteTransaction } = useDeleteTransaction();

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || "transactionDate",
      sortOrder: sorter.order === "ascend" ? "asc" : "desc",
    }));
  };

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "transactionDate",
      key: "transactionDate",
      sorter: true,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      render: (category: any) => (
        <Space>
          <span style={{ fontSize: 18 }}>{category.icon}</span>
          <Text>{category.name}</Text>
        </Space>
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "-",
    },
    {
      title: "Rekening",
      dataIndex: "account",
      key: "account",
      render: (account: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>{account.name}</Text>
          {record.type === "transfer" && record.toAccount && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              <SwapOutlined /> Ke: {record.toAccount.name}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Jumlah",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      align: "right" as const,
      render: (amount: number, record: any) => {
        let color = "#ff4d4f";
        let prefix = "-";
        let icon = <ArrowDownOutlined />;

        if (record.type === "income") {
          color = "#52c41a";
          prefix = "+";
          icon = <ArrowUpOutlined />;
        } else if (record.type === "transfer") {
          color = "#1890ff";
          prefix = "";
          icon = <SwapOutlined />;
        }

        return (
          <Text style={{ color, fontWeight: 600 }}>
            {icon} {prefix}{formatCurrency(amount)}
          </Text>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingTransaction(record);
                setIsFormVisible(true);
              }} 
            />
          </Tooltip>
          <Popconfirm
            title="Hapus transaksi?"
            description="Tindakan ini akan mengembalikan saldo rekening Anda."
            onConfirm={() => deleteTransaction(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Tooltip title="Hapus">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Daftar Transaksi</Title>
          <Text type="secondary">Lihat dan kelola semua histori finansial Anda</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTransaction(null);
            setIsFormVisible(true);
          }}
          style={{ 
            borderRadius: 8, 
            height: 44,
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            border: "none"
          }}
        >
          Tambah Transaksi
        </Button>
      </div>

      <TransactionForm 
        visible={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        editingTransaction={editingTransaction}
      />

      <Card className="glassmorphism" style={{ marginBottom: 24, borderRadius: 16 }}>
        <Space wrap size="middle">
          <Input 
            placeholder="Cari deskripsi..." 
            prefix={<SearchOutlined />} 
            style={{ width: "100%", maxWidth: 220 }}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
          <Select
            placeholder="Tipe"
            allowClear
            style={{ width: "100%", maxWidth: 160 }}
            options={[
              { label: "Pemasukan", value: "income" },
              { label: "Pengeluaran", value: "expense" },
              { label: "Transfer", value: "transfer" },
            ]}
            onChange={(val) => setFilters(prev => ({ ...prev, type: val as TransactionType, page: 1 }))}
          />
          <RangePicker 
            style={{ width: "100%", maxWidth: 300 }}
            onChange={(dates) => {
              setFilters(prev => ({
                ...prev,
                startDate: dates ? dates[0]?.toISOString() : undefined,
                endDate: dates ? dates[1]?.toISOString() : undefined,
                page: 1
              }));
            }}
          />
        </Space>
      </Card>

      <Card className="glassmorphism" style={{ borderRadius: 16, overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={data?.data} 
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          rowKey="id"
          pagination={{
            current: data?.meta?.page,
            pageSize: data?.meta?.limit,
            total: data?.meta?.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <style>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        }
        .ant-table {
          background: transparent !important;
        }
        .ant-table-thead > tr > th {
          background: rgba(0, 0, 0, 0.02) !important;
        }
      `}</style>
    </div>
  );
};

export default TransactionListPage;
