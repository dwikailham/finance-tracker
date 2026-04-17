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
  Empty,
  Result
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined
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

  const { data, isLoading, isError, error, refetch } = useTransactions(filters);
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

  if (isError) {
    return (
      <Result
        status="error"
        title="Gagal Memuat Transaksi"
        subTitle={error?.message || "Terjadi kesalahan saat mengambil data dari server."}
        extra={<Button type="primary" onClick={() => refetch()}>Coba Lagi</Button>}
      />
    );
  }

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "transactionDate",
      key: "transactionDate",
      sorter: true,
      width: 120,
      render: (date: string) => <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>,
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      render: (category: any) => (
        <Space>
          <span style={{ fontSize: 18 }}>{category?.icon || "💰"}</span>
          <Text style={{ fontSize: 13 }}>{category?.name || "Tanpa Kategori"}</Text>
        </Space>
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      render: (text: string) => <Text type="secondary" style={{ fontSize: 13 }}>{text || "-"}</Text>,
    },
    {
      title: "Rekening",
      dataIndex: "account",
      key: "account",
      render: (account: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13 }}>{account?.name}</Text>
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
        let className = "text-expense";
        let prefix = "-";
        
        if (record.type === "income") {
          className = "text-income";
          prefix = "+";
        } else if (record.type === "transfer") {
          className = "text-transfer";
          prefix = "";
        }

        return (
          <Text className={className} style={{ fontSize: 14 }}>
            {prefix}{formatCurrency(amount)}
          </Text>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTransaction(record);
              setIsFormVisible(true);
            }}
          />
          <Popconfirm
            title="Hapus transaksi?"
            description="Tindakan ini akan mengembalikan saldo rekening Anda."
            onConfirm={() => deleteTransaction(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const hasData = (data?.data?.length || 0) > 0;

  return (
    <div className="animate-fade-in">
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
            borderRadius: 12,
            height: 44,
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
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

      <Card className="glass-effect" style={{ marginBottom: 24, borderRadius: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="Cari deskripsi..."
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
          <Select
            placeholder="Tipe"
            allowClear
            style={{ width: 150 }}
            options={[
              { label: "Pemasukan", value: "income" },
              { label: "Pengeluaran", value: "expense" },
              { label: "Transfer", value: "transfer" },
            ]}
            onChange={(val) => setFilters(prev => ({ ...prev, type: val as TransactionType, page: 1 }))}
          />
          <RangePicker
            style={{ width: 280 }}
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

      <Card className="glass-effect" style={{ borderRadius: 16, overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
        {!isLoading && !hasData ? (
          <div style={{ padding: "60px 0" }}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={
                <span>
                  Belum ada transaksi ditemukan.<br/>
                  <Text type="secondary" style={{ fontSize: 12 }}>Coba ubah filter atau tambah transaksi baru.</Text>
                </span>
              } 
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data?.data}
            loading={isLoading}
            scroll={{ x: 800 }}
            size="middle"
            rowKey="id"
            pagination={{
              current: data?.meta?.page,
              pageSize: data?.meta?.limit,
              total: data?.meta?.total,
              showSizeChanger: true,
              size: "small",
              position: ["bottomCenter"]
            }}
            onChange={handleTableChange}
          />
        )}
      </Card>
    </div>
  );
};

export default TransactionListPage;
