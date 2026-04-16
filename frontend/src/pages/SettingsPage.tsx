import React, { useEffect } from "react";
import { Typography, Card, Form, Input, Button, Descriptions, message, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [loadingPassword, setLoadingPassword] = React.useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({ name: user.name });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (values: any) => {
    setLoadingProfile(true);
    try {
      await apiClient.put("/auth/profile", { name: values.name });
      message.success("Nama berhasil diperbarui");
      if (refreshUser) refreshUser();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordUpdate = async (values: any) => {
    setLoadingPassword(true);
    try {
      await apiClient.put("/auth/profile", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Password berhasil diperbarui");
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Gagal memperbarui password");
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Pengaturan</Title>
        <Text type="secondary">Kelola profil dan keamanan akun Anda.</Text>
      </div>

      {/* Info Akun */}
      <Card title="Informasi Akun" style={{ borderRadius: 16, marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Mata Uang">{user.currency || "IDR"}</Descriptions.Item>
          <Descriptions.Item label="Terdaftar Sejak">{dayjs(user.createdAt).format("DD MMMM YYYY")}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Edit Profil */}
      <Card title="Edit Profil" style={{ borderRadius: 16, marginBottom: 16 }}>
        <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
          <Form.Item name="name" label="Nama" rules={[{ required: true, message: "Nama wajib diisi" }]}>
            <Input prefix={<UserOutlined />} placeholder="Nama lengkap" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loadingProfile} style={{ borderRadius: 8, background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", border: "none" }}>
            Simpan Perubahan
          </Button>
        </Form>
      </Card>

      {/* Ganti Password */}
      <Card title="Ganti Password" style={{ borderRadius: 16 }}>
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
          <Form.Item name="currentPassword" label="Password Lama" rules={[{ required: true, message: "Masukkan password lama" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password saat ini" size="large" />
          </Form.Item>
          <Form.Item name="newPassword" label="Password Baru" rules={[{ required: true, min: 8, message: "Minimal 8 karakter" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password baru" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Konfirmasi Password Baru"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Konfirmasi password baru" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Password tidak cocok"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Ulangi password baru" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loadingPassword} danger style={{ borderRadius: 8 }}>
            Ganti Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
