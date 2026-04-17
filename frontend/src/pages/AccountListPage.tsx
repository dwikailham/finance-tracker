import React, { useState } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Badge, 
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Radio,
  Empty,
  Skeleton
} from "antd";
import { 
  PlusOutlined, 
  BankOutlined, 
  WalletOutlined, 
  CreditCardOutlined, 
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  MobileOutlined
} from "@ant-design/icons";
import { useAccounts, useCreateAccount, useUpdateAccount, useArchiveAccount } from "../hooks/useAccounts";
import { formatCurrency } from "../utils/formatCurrency";
import type { AccountType } from "../types/account.types";

const { Title, Text } = Typography;

const AccountListPage: React.FC = () => {
  const { data: accounts, isLoading } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();
  const { mutate: archiveAccount } = useArchiveAccount();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (account?: any) => {
    if (account) {
      setEditingAccount(account);
      form.setFieldsValue(account);
    } else {
      setEditingAccount(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFinish = (values: any) => {
    if (editingAccount) {
      updateAccount({ id: editingAccount.id, data: values }, {
        onSuccess: () => setIsModalVisible(false)
      });
    } else {
      createAccount(values, {
        onSuccess: () => setIsModalVisible(false)
      });
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case "bank": return <BankOutlined />;
      case "cash": return <WalletOutlined />;
      case "credit_card": return <CreditCardOutlined />;
      case "e_wallet": return <MobileOutlined />;
      default: return <WalletOutlined />;
    }
  };

  const getTypeLabel = (type: AccountType) => {
    switch (type) {
      case "bank": return "Rekening Bank";
      case "cash": return "Tunai / Cash";
      case "credit_card": return "Kartu Kredit";
      case "e_wallet": return "E-Wallet";
      default: return "Lainnya";
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Rekening Saya</Title>
          <Text type="secondary">Kelola semua dompet dan rekening bank Anda di satu tempat</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          style={{ 
            borderRadius: 12, 
            height: 44,
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
          }}
        >
          Tambah Rekening
        </Button>
      </div>

      {isLoading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map(i => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card style={{ borderRadius: 16 }}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : accounts?.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="Belum ada rekening terdaftar"
          style={{ marginTop: 60 }}
        >
          <Button type="primary" onClick={() => handleOpenModal()}>Buat Rekening Pertama</Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {accounts?.map((account: any) => (
            <Col xs={24} sm={12} lg={8} key={account.id}>
              <Card 
                className="glass-effect"
                style={{ borderRadius: 20 }}
                actions={[
                  <Tooltip title="Riwayat">
                    <HistoryOutlined key="history" />
                  </Tooltip>,
                  <Tooltip title="Edit">
                    <EditOutlined key="edit" onClick={() => handleOpenModal(account)} />
                  </Tooltip>,
                  <Popconfirm
                    title="Arsipkan rekening?"
                    description="Rekening tidak akan muncul di pilihan transaksi."
                    onConfirm={() => archiveAccount(account.id)}
                    okText="Ya, Arsipkan"
                    cancelText="Batal"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Arsipkan">
                      <DeleteOutlined key="archive" />
                    </Tooltip>
                  </Popconfirm>
                ]}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 14, 
                    background: account.color || "#6366f1",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 24,
                    boxShadow: `0 4px 12px ${account.color}44`
                  }}>
                    {getAccountIcon(account.type)}
                  </div>
                  <Badge count={getTypeLabel(account.type)} style={{ backgroundColor: "#f1f5f9", color: "#64748b", fontWeight: 500 }} />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{account.name}</Text>
                  <Title level={4} style={{ margin: "4px 0 0", color: "var(--color-income)" }}>{formatCurrency(Number(account.balance))}</Title>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingAccount ? "Edit Rekening" : "Tambah Rekening Baru"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        width={480}
        style={{ top: 40 }}
        styles={{ mask: { backdropFilter: "blur(4px)" } }}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ type: "bank", initialBalance: 0 }}
        >
          <Form.Item name="name" label="Nama Rekening" rules={[{ required: true, message: "Mohon isi nama rekening" }]}>
            <Input placeholder="Contoh: Tabungan BCA, Dompet, dsb." size="large" />
          </Form.Item>

          <Form.Item name="type" label="Tipe" rules={[{ required: true, message: "Pilih tipe rekening" }]}>
            <Select size="large" options={[
              { label: "Bank", value: "bank" },
              { label: "Tunai / Cash", value: "cash" },
              { label: "E-Wallet", value: "e_wallet" },
              { label: "Kartu Kredit", value: "credit_card" },
              { label: "Lainnya", value: "other" },
            ]} />
          </Form.Item>

          {!editingAccount && (
            <Form.Item name="initialBalance" label="Saldo Awal" rules={[{ required: true, message: "Isi saldo awal" }]}>
              <InputNumber 
                size="large"
                style={{ width: "100%" }} 
                formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                parser={(value) => value!.replace(/Rp\s?|(\.*)/g, "")}
              />
            </Form.Item>
          )}

          <Form.Item name="color" label="Warna Identitas">
            <Radio.Group style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#3b82f6", "#64748b"].map(color => (
                <Radio.Button key={color} value={color} style={{ padding: 4, borderRadius: 8, height: "auto" }}>
                  <div style={{ width: 24, height: 24, background: color, borderRadius: 6 }} />
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountListPage;
