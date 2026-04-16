import React, { useEffect } from "react";
import { Modal, Form, Select, InputNumber } from "antd";
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
      title={editingId ? "Edit Budget Kategori" : "Set Budget Kategori"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {!editingId && (
          <Form.Item
            name="categoryId"
            label="Kategori"
            rules={[{ required: true, message: "Pilih kategori" }]}
          >
            <Select
              placeholder="Pilih Kategori Pengeluaran"
              loading={loadingCategories}
              showSearch
              optionFilterProp="children"
            >
              {expenseCategories.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item
          name="amount"
          label="Jumlah Anggaran (Rp)"
          rules={[{ required: true, message: "Masukkan jumlah anggaran" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) => `${value || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            parser={(value) => value ? Number(value.replace(/\./g, "")) : 0}
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
