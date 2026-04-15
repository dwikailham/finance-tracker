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
  Radio
} from "antd";
import { 
  PlusOutlined, 
  BankOutlined, 
  WalletOutlined, 
  CreditCardOutlined, 
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { useAccounts, useCreateAccount, useUpdateAccount, useArchiveAccount } from "../hooks/useAccounts";
import { formatCurrency } from "../utils/formatCurrency";
import type { AccountType } from "../types/account.types";

const { Title, Text } = Typography;

const AccountListPage: React.FC = () => {
  const { data: accounts } = useAccounts();
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
    <div>
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
            borderRadius: 8, 
            height: 44,
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
            border: "none"
          }}
        >
          Tambah Rekening
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {accounts?.map((account: any) => (
          <Col xs={24} sm={12} lg={8} key={account.id}>
            <Card 
              className="glassmorphism account-card"
              actions={[
                <Tooltip title="Riwayat">
                  <HistoryOutlined key="history" onClick={() => {}} />
                </Tooltip>,
                <Tooltip title="Edit">
                  <EditOutlined key="edit" onClick={() => handleOpenModal(account)} />
                </Tooltip>,
                <Popconfirm
                  title="Arsipkan rekening?"
                  description="Rekening tidak akan muncul di pilihan transaksi."
                  onConfirm={() => archiveAccount(account.id)}
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
                  borderRadius: 12, 
                  background: account.color || "#6366f1",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 24
                }}>
                  {getAccountIcon(account.type)}
                </div>
                <Badge count={getTypeLabel(account.type)} style={{ backgroundColor: "#f0f0f0", color: "#8c8c8c" }} />
              </div>

              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{account.name}</Text>
                <Title level={4} style={{ margin: "4px 0 0" }}>{formatCurrency(Number(account.balance))}</Title>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingAccount ? "Edit Rekening" : "Tambah Rekening Baru"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ type: "bank", initialBalance: 0 }}
        >
          <Form.Item name="name" label="Nama Rekening" rules={[{ required: true, message: "Nama wajib diisi" }]}>
            <Input placeholder="Contoh: BCA Tabungan, Dompet Utama, dll" />
          </Form.Item>

          <Form.Item name="type" label="Tipe" rules={[{ required: true }]}>
            <Select options={[
              { label: "Bank", value: "bank" },
              { label: "Tunai / Cash", value: "cash" },
              { label: "E-Wallet", value: "e_wallet" },
              { label: "Kartu Kredit", value: "credit_card" },
              { label: "Lainnya", value: "other" },
            ]} />
          </Form.Item>

          {!editingAccount && (
            <Form.Item name="initialBalance" label="Saldo Awal" rules={[{ required: true }]}>
              <InputNumber 
                style={{ width: "100%" }} 
                formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/Rp\s?|(,*)/g, "")}
              />
            </Form.Item>
          )}

          <Form.Item name="color" label="Warna Identitas">
            <Radio.Group>
              <Radio value="#6366f1"><div style={{ width: 20, height: 20, background: "#6366f1", borderRadius: "50%" }} /></Radio>
              <Radio value="#10b981"><div style={{ width: 20, height: 20, background: "#10b981", borderRadius: "50%" }} /></Radio>
              <Radio value="#f59e0b"><div style={{ width: 20, height: 20, background: "#f59e0b", borderRadius: "50%" }} /></Radio>
              <Radio value="#ef4444"><div style={{ width: 20, height: 20, background: "#ef4444", borderRadius: "50%" }} /></Radio>
              <Radio value="#a855f7"><div style={{ width: 20, height: 20, background: "#a855f7", borderRadius: "50%" }} /></Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .account-card {
          border-radius: 20px !important;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .account-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AccountListPage;
