import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Drawer } from "antd";
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
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize for mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/transactions", icon: <TransactionOutlined />, label: "Transaksi" },
    { key: "/accounts", icon: <BankOutlined />, label: "Rekening" },
    { key: "/budget", icon: <WalletOutlined />, label: "Budgeting" },
    { key: "/reports", icon: <PieChartOutlined />, label: "Laporan" },
    { key: "/categories", icon: <TagsOutlined />, label: "Kategori" },
    { key: "/settings", icon: <SettingOutlined />, label: "Pengaturan" },
  ];

  const userMenuItems: any[] = [
    {
      key: "settings-nav",
      icon: <UserOutlined />,
      label: "Profil Saya",
      onClick: () => navigate("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Keluar",
      danger: true,
      onClick: () => logout(),
    },
  ];

  const SidebarContent = (
    <>
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
        {(!collapsed || isMobile) && <Title level={4} style={{ margin: 0, fontSize: 18 }}>FinTrack</Title>}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) setDrawerVisible(false);
        }}
        style={{ borderRight: 0, padding: "0 8px" }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          theme="light"
          style={{
            boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
            height: "100vh",
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 100,
          }}
        >
          {SidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={260}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          {SidebarContent}
        </Drawer>
      )}
      
      <Layout style={{ transition: "all 0.2s", minHeight: "100vh" }}>
        <Header style={{ 
          padding: isMobile ? "0 16px" : "0 24px", 
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
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 40, height: 40 }}
          />
          
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right", display: isMobile ? "none" : "block" }}>
                <Text strong style={{ display: "block", lineHeight: "1.2" }}>{user?.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>Premium Account</Text>
              </div>
              <Avatar 
                size={isMobile ? "default" : "large"} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: "#6366f1" }} 
              />
            </div>
          </Dropdown>
        </Header>

        <Content style={{ 
          margin: isMobile ? "16px" : "24px", 
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
        .page-fade-enter {
          opacity: 0;
          transform: translateY(10px);
        }
        .page-fade-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }
      `}</style>
    </Layout>
  );
};

export default AppLayout;

