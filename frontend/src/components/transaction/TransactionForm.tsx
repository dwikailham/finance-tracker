import React, { useEffect } from "react";
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Radio, 
  Space,
  Divider,
} from "antd";
import { 
  SwapOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined 
} from "@ant-design/icons";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories";
import { useCreateTransaction, useUpdateTransaction } from "../../hooks/useTransactions";
import dayjs from "dayjs";

interface TransactionFormProps {
  visible: boolean;
  onCancel: () => void;
  editingTransaction?: any;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  visible, 
  onCancel, 
  editingTransaction 
}) => {
  const [form] = Form.useForm();
  const type = Form.useWatch("type", form);
  
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();

  useEffect(() => {
    if (editingTransaction) {
      form.setFieldsValue({
        ...editingTransaction,
        transactionDate: dayjs(editingTransaction.transactionDate),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: "expense",
        transactionDate: dayjs(),
      });
    }
  }, [editingTransaction, visible, form]);

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      transactionDate: values.transactionDate.format("YYYY-MM-DD"),
    };

    if (editingTransaction) {
      updateTransaction({ id: editingTransaction.id, data: payload }, {
        onSuccess: () => onCancel(),
      });
    } else {
      createTransaction(payload, {
        onSuccess: () => onCancel(),
      });
    }
  };

  const filteredCategories = categories?.filter((c: any) => 
    type === "transfer" ? true : c.type === type
  );

  return (
    <Modal
      title={editingTransaction ? "Ubah Transaksi" : "Tambah Transaksi"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={isCreating || isUpdating}
      width={480}
      style={{ top: 40, maxWidth: "95vw" }}
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
      okText={editingTransaction ? "Simpan Perubahan" : "Tambah"}
      cancelText="Batal"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: "expense", transactionDate: dayjs() }}
        requiredMark={false}
      >
        <Form.Item name="type" label="Tipe Transaksi">
          <Radio.Group buttonStyle="solid" style={{ width: "100%", display: "flex" }}>
            <Radio.Button value="income" style={{ flex: 1, textAlign: "center", borderRadius: "10px 0 0 10px" }}>
              <ArrowUpOutlined /> <span className="hide-on-mobile">Pemasukan</span>
            </Radio.Button>
            <Radio.Button value="expense" style={{ flex: 1, textAlign: "center" }}>
              <ArrowDownOutlined /> <span className="hide-on-mobile">Pengeluaran</span>
            </Radio.Button>
            <Radio.Button value="transfer" style={{ flex: 1, textAlign: "center", borderRadius: "0 10px 10px 0" }}>
              <SwapOutlined /> <span className="hide-on-mobile">Transfer</span>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item 
            name="amount" 
            label="Jumlah" 
            rules={[{ required: true, message: "Mohon isi jumlah nominal" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              parser={(value) => value!.replace(/Rp\s?|(\.*)/g, "") as any}
              min={1}
              size="large"
              placeholder="0"
            />
          </Form.Item>

          <Form.Item 
            name="transactionDate" 
            label="Tanggal" 
            rules={[{ required: true, message: "Mohon isi tanggal" }]}
          >
            <DatePicker style={{ width: "100%" }} size="large" format="DD MMM YYYY" allowClear={false} />
          </Form.Item>
        </div>

        <Divider style={{ margin: "12px 0 24px" }} />

        <Form.Item 
          name="accountId" 
          label={type === "transfer" ? "Rekening Sumber" : "Rekening"} 
          rules={[{ required: true, message: "Pilih rekening" }]}
        >
          <Select placeholder="Pilih rekening" size="large">
            {accounts?.map((acc: any) => (
              <Select.Option key={acc.id} value={acc.id}>
                <Space>
                  <div style={{ width: 8, height: 8, background: acc.color, borderRadius: "50%" }} />
                  {acc.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {type === "transfer" && (
          <Form.Item 
            name="toAccountId" 
            label="Rekening Tujuan" 
            rules={[{ required: true, message: "Pilih rekening tujuan" }]}
          >
            <Select placeholder="Pilih rekening tujuan" size="large">
              {accounts?.map((acc: any) => (
                <Select.Option key={acc.id} value={acc.id}>
                  <Space>
                    <div style={{ width: 8, height: 8, background: acc.color, borderRadius: "50%" }} />
                    {acc.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item 
          name="categoryId" 
          label="Kategori" 
          rules={[{ required: true, message: "Pilih kategori" }]}
        >
          <Select placeholder="Pilih kategori" size="large" showSearch optionFilterProp="label">
            {filteredCategories?.map((cat: any) => (
              <Select.Option key={cat.id} value={cat.id} label={cat.name}>
                <Space>
                  <span>{cat.icon}</span>
                  {cat.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Catatan (Opsional)">
          <Input.TextArea rows={3} placeholder="Keterangan transaksi..." style={{ borderRadius: 10 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransactionForm;
