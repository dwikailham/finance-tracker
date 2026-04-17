import React, { useEffect } from "react";
import { Modal, Form, Select, InputNumber, Space } from "antd";
import { useCategories } from "../../hooks/useCategories";

interface BudgetFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  editingId?: string;
  initialValues?: any;
  loading?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  editingId,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { data: categoriesResponse, isLoading: loadingCategories } = useCategories();
  const categories = categoriesResponse || [];
  
  const expenseCategories = categories.filter((c: any) => c.type === "expense");

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={editingId ? "Ubah Anggaran" : "Atur Anggaran Kategori"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={480}
      style={{ top: 40 }}
      styles={{ mask: { backdropFilter: "blur(4px)" } }}
      okText="Simpan"
      cancelText="Batal"
      centered
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish}
        requiredMark={false}
      >
        {!editingId && (
          <Form.Item
            name="categoryId"
            label="Kategori"
            rules={[{ required: true, message: "Mohon pilih kategori" }]}
          >
            <Select
              placeholder="Pilih Kategori Pengeluaran"
              loading={loadingCategories}
              showSearch
              size="large"
              style={{ borderRadius: 10 }}
              optionFilterProp="children"
            >
              {expenseCategories.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>
                  <Space>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    {cat.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item
          name="amount"
          label="Jumlah Anggaran"
          rules={[{ required: true, message: "Mohon isi nominal anggaran" }]}
        >
          <InputNumber
            style={{ borderRadius: 10, width: "100%" }}
            formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            parser={(value) => value!.replace(/Rp\s?|(\.*)/g, "") as any}
            min={1}
            size="large"
            placeholder="0"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BudgetForm;
