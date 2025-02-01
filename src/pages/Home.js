import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import PrivateRoute from "../PrivateRoute";
import { AuthProvider, useAuth } from '../AuthContext';

import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CarryOutOutlined,
  UserOutlined,
  BorderOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

import UsersList from '../component';

import { Button, Layout, Menu, theme, ConfigProvider } from 'antd';

const { Header, Sider, Content } = Layout;

const Home: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = () => {
    logout(); // Chiama la funzione logout
    navigate("/login"); // Reindirizza alla pagina di login
  };
 const { logout } = useAuth(); // Accedi al metodo logout dal contesto
  const navigate = useNavigate(); // Hook di React Router per la navigazione
  const {

    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
      <div>
        <Layout
        style={{
            minHeight: '100vh'
        }}>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#FDB84F',
                    siderBg: '#1E0407'  // Colore di sfondo base
                  },
                }}
        >
          <Sider trigger={null} collapsible collapsed={collapsed} style={{background: '#1E0407'}}>
            <img className="demo-logo-vertical" alt="logo" src="/assets/deseo-logo-1500x430-full-transp-alt9.webp" style={{ width: '100%', height: 'auto' }}/>
            <Menu
              theme="dark"
              style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1E0407' }}

              mode="inline"
              defaultSelectedKeys={['1']}
              items={[
               {
                  key: '1',
                  icon: <DashboardOutlined />,
                  label: <Link to="/dashboard">Dashboard</Link>,
               },
               {
                  key: '2',
                  icon: <UserOutlined />,
                  label: <Link to="/users">Utenti</Link>,
                },
                {
                  key: '3',
                  icon: <BorderOutlined />,
                  label: <Link to="/rooms">Stanze</Link>,
                },
                {
                  key: '4',
                  icon: <CarryOutOutlined />,
                  label: <Link to="/reservations">Prenotazioni</Link>,
                },

              ]}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Pulsante a sinistra */}
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

             <Button
               type="text"
               onClick={handleLogout}
               icon={<LogoutOutlined />}
             >
               Logout
             </Button>

            </Header>


            <Content
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
            <AuthProvider>
                <Routes>
                  <Route path="/users" element={<PrivateRoute><UsersList /></PrivateRoute>} />
                  <Route path="/rooms" element={<PrivateRoute><UsersList /></PrivateRoute>} />
                  <Route path="/reservations" element={<PrivateRoute><UsersList /></PrivateRoute>} />
                </Routes>
            </AuthProvider>
            </Content>
          </Layout>
          </ConfigProvider>
        </Layout>
      </div>
  );
};

export default Home;