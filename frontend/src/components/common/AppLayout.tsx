import React, { useState } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from "antd";
import {
  DashboardOutlined,
  TransactionOutlined,
  BankOutlined,
  TagsOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  PieChartOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useLogout } from "../../hooks/useAuth";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/transactions",
      icon: <TransactionOutlined />,
      label: "Transaksi",
    },
    {
      key: "/accounts",
      icon: <BankOutlined />,
      label: "Rekening",
    },
    {
      key: "/budget",
      icon: <WalletOutlined />,
      label: "Budgeting",
    },
    {
      key: "/reports",
      icon: <PieChartOutlined />,
      label: "Laporan",
    },
    {
      key: "/categories",
      icon: <TagsOutlined />,
      label: "Kategori",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Pengaturan",
    },
  ];

  const userMenuItems: any[] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil Saya",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Keluar",
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth={0}
        theme="light"
        width={260}
        style={{
          boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
          height: "100vh",
          position: "sticky", // Changed from fixed to sticky
          top: 0,
          left: 0,
          overflow: "auto",
          zIndex: 100,
        }}
      >
        <div style={{ padding: "24px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", 
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontWeight: "bold"
          }}>F</div>
          {!collapsed && <Title level={4} style={{ margin: 0, fontSize: 18 }}>FinTrack</Title>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, padding: "0 8px" }}
        />
      </Sider>
      
      <Layout style={{ transition: "all 0.2s", minHeight: "100vh" }}>
        <Header style={{ 
          padding: "0 24px", 
          background: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(8px)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 99,
          boxShadow: "0 1px 0 rgba(0,0,0,0.05)"
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 40, height: 40 }}
          />
          
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }} className="hide-on-mobile">
                <Text strong style={{ display: "block", lineHeight: "1.2" }}>{user?.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Premium User</Text>
              </div>
              <Avatar 
                size="large" 
                icon={<UserOutlined />} 
                style={{ backgroundColor: "#6366f1" }} 
              />
            </div>
          </Dropdown>
        </Header>

        <Content style={{ 
          margin: "24px", 
          padding: 0, 
          minHeight: 280,
          borderRadius: 16
        }}>
          <Outlet />
        </Content>
      </Layout>

      <style>{`
        .ant-menu-item {
          border-radius: 8px !important;
          margin-bottom: 4px !important;
        }
        .ant-menu-item-selected {
          background: rgba(99, 102, 241, 0.08) !important;
          color: #6366f1 !important;
        }
        .ant-menu-item-selected .ant-menu-item-icon {
          color: #6366f1 !important;
        }
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
          .ant-layout-content {
            margin: 16px !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AppLayout;
