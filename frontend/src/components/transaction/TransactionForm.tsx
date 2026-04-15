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
  Divider
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
      width={520}
      okText={editingTransaction ? "Simpan Perubahan" : "Tambah"}
      cancelText="Batal"
      centered
      bodyStyle={{ paddingTop: 16 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: "expense", transactionDate: dayjs() }}
      >
        <Form.Item name="type" label="Tipe Transaksi">
          <Radio.Group buttonStyle="solid" style={{ width: "100%" }}>
            <Radio.Button value="income" style={{ width: "33.33%", textAlign: "center" }}>
              <ArrowUpOutlined /> Pemasukan
            </Radio.Button>
            <Radio.Button value="expense" style={{ width: "33.33%", textAlign: "center" }}>
              <ArrowDownOutlined /> Pengeluaran
            </Radio.Button>
            <Radio.Button value="transfer" style={{ width: "33.33%", textAlign: "center" }}>
              <SwapOutlined /> Transfer
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Space style={{ display: "flex", width: "100%" }} size="large">
          <Form.Item 
            name="amount" 
            label="Jumlah" 
            rules={[{ required: true, message: "Jumlah wajib diisi" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/Rp\s?|(,*)/g, "") as any}
              min={1}
              size="large"
            />
          </Form.Item>

          <Form.Item 
            name="transactionDate" 
            label="Tanggal" 
            rules={[{ required: true, message: "Tanggal wajib diisi" }]}
            style={{ width: 180 }}
          >
            <DatePicker style={{ width: "100%" }} size="large" format="DD MMM YYYY" />
          </Form.Item>
        </Space>

        <Divider style={{ margin: "12px 0 24px" }} />

        <Form.Item 
          name="accountId" 
          label={type === "transfer" ? "Rekening Sumber" : "Rekening"} 
          rules={[{ required: true, message: "Pilih rekening" }]}
        >
          <Select placeholder="Pilih rekening">
            {accounts?.map((acc: any) => (
              <Select.Option key={acc.id} value={acc.id}>
                {acc.name} (Saldo: {acc.balance})
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
            <Select placeholder="Pilih rekening tujuan">
              {accounts?.map((acc: any) => (
                <Select.Option key={acc.id} value={acc.id}>
                  {acc.name}
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
          <Select placeholder="Pilih kategori" showSearch optionFilterProp="label">
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
          <Input.TextArea rows={3} placeholder="Makan malam, bayar kos, dll..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransactionForm;
