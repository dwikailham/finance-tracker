import React from "react";
import { Form, Input, Button, Card, Typography, Space } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { Link, Navigate } from "react-router";
import { useLogin } from "../hooks/useAuth";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { mutate: login, isPending } = useLogin();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onFinish = (values: any) => {
    login(values);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card glassmorphism">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
            FinTrack
          </Title>
          <Text type="secondary">Kelola keuangan Anda dengan lebih cerdas</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email wajib diisi" },
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password wajib diisi" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isPending}
              icon={<LoginOutlined />}
              style={{
                height: 48,
                borderRadius: 8,
                background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                border: "none",
                fontWeight: 600,
              }}
            >
              Masuk
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Space>
            <Text type="secondary">Belum punya akun?</Text>
            <Link to="/register" style={{ color: "#6366f1", fontWeight: 600 }}>
              Daftar Sekarang
            </Link>
          </Space>
        </div>
      </Card>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at top left, #eef2ff 0%, #f5f3ff 50%, #faf5ff 100%);
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
        }
        .ant-input-affix-wrapper {
          border-radius: 8px !important;
          padding: 10px 14px !important;
          border: 1px solid #e5e7eb !important;
        }
        .ant-input-affix-wrapper-focused {
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
          border-color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
