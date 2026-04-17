import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Radio } from "antd";

interface CategoryFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  editingCategory?: any;
  loading?: boolean;
}

const COMMON_ICONS = ["📦", "🍔", "🚗", "🛒", "💡", "🏥", "🎮", "📚", "🏠", "👕", "💝", "📊", "💼", "💻", "🏪", "📈", "🎁", "💰", "✈️", "☕", "🎬", "🎸", "🔋", "🛠️"];
const COMMON_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#3b82f6", "#64748b", "#ec4899", "#14b8a6", "#f97316"];

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
       form.setFieldsValue({
         type: "expense",
         icon: "📦",
         color: "#6366f1"
       });
    }
  }, [visible, editingCategory, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={editingCategory ? "Ubah Kategori" : "Buat Kategori Baru"}
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
        <Form.Item
          name="name"
          label="Nama Kategori"
          rules={[{ required: true, message: "Mohon isi nama kategori" }]}
        >
          <Input placeholder="Contoh: Belanja Bulanan, Gaji, dsb." size="large" style={{ borderRadius: 10 }} />
        </Form.Item>

        <Form.Item
          name="type"
          label="Tipe Kategori"
          rules={[{ required: true }]}
        >
          <Radio.Group size="large" buttonStyle="solid" style={{ width: "100%", display: "flex" }} disabled={!!editingCategory}>
            <Radio.Button value="income" style={{ flex: 1, textAlign: "center", borderRadius: "10px 0 0 10px" }}>Pemasukan</Radio.Button>
            <Radio.Button value="expense" style={{ flex: 1, textAlign: "center", borderRadius: "0 10px 10px 0" }}>Pengeluaran</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            name="icon"
            label="Pilih Ikon"
            rules={[{ required: true, message: "Pilih ikon" }]}
          >
            <Select size="middle" placeholder="Emoji" showSearch style={{ borderRadius: 10 }}>
              {COMMON_ICONS.map(icon => (
                <Select.Option key={icon} value={icon}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Warna"
            rules={[{ required: true, message: "Pilih warna" }]}
          >
            <Select size="middle" placeholder="Warna" style={{ borderRadius: 10 }}>
              {COMMON_COLORS.map(color => (
                <Select.Option key={color} value={color}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color }} />
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
