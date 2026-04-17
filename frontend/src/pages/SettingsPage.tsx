import React, { useEffect } from "react";
import { Typography, Card, Form, Input, Button, Descriptions, message, Spin, Row, Col, Space, Avatar } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, CalendarOutlined, GlobalOutlined } from "@ant-design/icons";
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
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Pengaturan Akun</Title>
        <Text type="secondary">Kelola profil, preferensi, dan keamanan akun Anda.</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Info Akun */}
            <Card className="glass-effect" style={{ borderRadius: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: "#6366f1", marginBottom: 16, boxShadow: "0 8px 16px rgba(99, 102, 241, 0.2)" }} 
                />
                <Title level={4} style={{ margin: 0 }}>{user.name}</Title>
                <Text type="secondary">{user.email}</Text>
              </div>
              
              <Descriptions column={1} size="small" colon={false} labelStyle={{ color: "var(--text-secondary)", fontSize: 13 }}>
                <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>{user.email}</Descriptions.Item>
                <Descriptions.Item label={<Space><GlobalOutlined /> Mata Uang</Space>}>{user.currency || "IDR"}</Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Bergabung</Space>}>{dayjs(user.createdAt).format("DD MMM YYYY")}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="glass-effect" style={{ borderRadius: 16 }}>
              <Title level={5} style={{ fontSize: 14, marginBottom: 16 }}>STATUS AKUN</Title>
              <div style={{ 
                padding: "12px 16px", 
                background: "rgba(34, 197, 94, 0.1)", 
                borderRadius: 12, 
                display: "flex", 
                alignItems: "center", 
                gap: 12 
              }}>
                <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%" }} />
                <Text strong style={{ color: "#166534" }}>Premium Active</Text>
              </div>
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={14}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Edit Profil */}
            <Card title="Profil & Personalisasi" className="glass-effect" style={{ borderRadius: 16 }}>
              <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
                <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true, message: "Nama tidak boleh kosong" }]}>
                  <Input placeholder="Masukkan nama Anda" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loadingProfile} 
                  style={{ 
                    borderRadius: 10, 
                    height: 40,
                    background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)", 
                    border: "none",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)"
                  }}
                >
                  Simpan Profil
                </Button>
              </Form>
            </Card>

            {/* Ganti Password */}
            <Card title="Keamanan Password" className="glass-effect" style={{ borderRadius: 16 }}>
              <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate}>
                <Form.Item name="currentPassword" label="Password Sekarang" rules={[{ required: true, message: "Masukkan password lama Anda" }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
                <Form.Item name="newPassword" label="Password Baru" rules={[{ required: true, min: 8, message: "Minimal 8 karakter" }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Minimal 8 karakter" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Konfirmasi Password Baru"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Ulangi password baru Anda" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                        return Promise.reject(new Error("Password baru tidak cocok"));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Ulangi password baru" size="large" style={{ borderRadius: 10 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loadingPassword} danger style={{ borderRadius: 10, height: 40 }}>
                  Perbarui Password
                </Button>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
