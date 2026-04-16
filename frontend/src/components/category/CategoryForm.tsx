import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Radio } from "antd";

interface CategoryFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  editingCategory?: any;
  loading?: boolean;
}

const COMMON_ICONS = ["📦", "🍔", "🚗", "🛒", "💡", "🏥", "🎮", "📚", "🏠", "👕", "💝", "📊", "💼", "💻", "🏪", "📈", "🎁", "💰", "✈️", "☕"];
const COMMON_COLORS = ["#6B7280", "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#22C55E", "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E"];

const CategoryForm: React.FC<CategoryFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  editingCategory,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && editingCategory) {
      form.setFieldsValue({
        ...editingCategory,
      });
    } else if (!visible) {
      form.resetFields();
    } else if (visible && !editingCategory) {
       // defaults
       form.setFieldsValue({
         type: "expense",
         icon: "📦",
         color: "#6B7280"
       });
    }
  }, [visible, editingCategory, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={editingCategory ? "Edit Kategori" : "Tambah Kategori Secara Manual"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Nama Kategori"
          rules={[{ required: true, message: "Masukkan nama kategori" }]}
        >
          <Input placeholder="Contoh: Belanja Bulanan" size="large" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Tipe Kategori"
          rules={[{ required: true }]}
        >
          <Radio.Group size="large" buttonStyle="solid" disabled={!!editingCategory}>
            <Radio.Button value="income">Pemasukan</Radio.Button>
            <Radio.Button value="expense">Pengeluaran</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="icon"
          label="Pilih Icon"
          rules={[{ required: true, message: "Pilih icon" }]}
        >
          <Select size="large" placeholder="Pilih Emoji Icon" showSearch>
            {COMMON_ICONS.map(icon => (
              <Select.Option key={icon} value={icon}>
                {icon}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="color"
          label="Pilih Warna"
          rules={[{ required: true, message: "Pilih warna" }]}
        >
          <Select size="large" placeholder="Pilih warna untuk badge">
            {COMMON_COLORS.map(color => (
              <Select.Option key={color} value={color}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: color }} />
                  {color}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default CategoryForm;
