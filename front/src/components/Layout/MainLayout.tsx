import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    BookOutlined,
    AuditOutlined,
    ScheduleOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {setCookie} from "cookies-next";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Menu items configuration
    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: <Link href="/">Dashboard</Link>,
        },
        {
            key: '/students',
            icon: <UserOutlined />,
            label: <Link href="/students">Étudiants</Link>,
        },
        {
            key: '/courses',
            icon: <BookOutlined />,
            label: <Link href="/courses">Cours</Link>,
        },
        {
            key: '/grades',
            icon: <AuditOutlined />,
            label: <Link href="/grades">Notes</Link>,
        },
        {
            key: '/schedule',
            icon: <ScheduleOutlined />,
            label: <Link href="/schedule">Emploi du temps</Link>,
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: <Link href="/settings">Paramètres</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                theme="light"
                className="main-sidebar"
                style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    zIndex: 10
                }}
            >
                <div className="logo">
                    <h2>{collapsed ? 'SI' : 'SchooInc'}</h2>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[router.pathname]}
                    items={menuItems}
                />
                <div className="sidebar-footer">
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        style={{ width: '100%', textAlign: 'left' }}
                        onClick={() => {
                            setCookie("JWT", "", {expires : new Date(Date.now() - 1)});
                            router.push('/login');
                        }}
                    >
                        {!collapsed && 'Déconnexion'}
                    </Button>
                </div>
            </Sider>
            <Layout>
                <Header style={{
                    padding: 0,
                    background: colorBgContainer,
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <div style={{ marginRight: 20 }}>
                        <span>John Doe</span>
                        <Button
                            type="text"
                            shape="circle"
                            icon={<UserOutlined />}
                            style={{ marginLeft: 10 }}
                        />
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;