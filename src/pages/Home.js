import React, { useState,useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import PrivateRoute from "../PrivateRoute";
import UserForm from "../components/user/UserForm";
import AreaForm from "../components/area/AreaForm";
import UserTable from "../components/user/UserTable";
import AreaTable from "../components/area/AreaTable";
import ResourceForm from "../components/resource/ResourceForm";
import ResourceTable from "../components/resource/ResourceTable";
import EventForm from "../components/reservation/EventForm";
import EventFormFiltered from "../components/reservation/EventFormFiltered";
import CustomCalendarWrapper from "../components/reservation/CustomCalendarWrapper";
//import Dashboard from "../pages/Dashboard";
import DashboardDemo from "../pages/DashboardDemo";
import { AuthProvider, useAuth } from '../AuthContext';
import {jwtDecode} from 'jwt-decode';
import '../Deseo.css';

import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  UserAddOutlined,
  BorderlessTableOutlined,
  BorderOutlined,
  LogoutOutlined,
  AppstoreAddOutlined,
  HarmonyOSOutlined,
  HeartOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';


import { Button, Layout, Menu, theme, ConfigProvider } from 'antd';

const { Header, Sider, Content } = Layout;

const Home: React.FC = () => {

const { logout } = useAuth();
const navigate = useNavigate();

const [collapsed, setCollapsed] = useState(false);
const [userName, setUserName] = useState("Anonimo");
const [userRole, setUserRole] = useState(null);

useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      console.error("Token non trovato. Reindirizzamento al login.");
      navigate("/login", { replace: true }); // Usa navigate con `replace` per evitare loop
      return;
    }

    try {
      const decoded = jwtDecode(token); // Decodifica il token
      setUserName(decoded?.sub || "Anonimo");
      setUserRole(decoded?.role || null);
      console.log(decoded?.role)

    } catch (err) {
      console.error("Token non valido:", err.message);
      navigate("/login", { replace: true }); // Reindirizza se il token è invalido
    }
  }, [navigate]);


const handleUserDetail = () => {
    console.log("Mostra dettagli user")
};

const handleLogout = async () => { // Dichiarata come async
  await logout(); // Ora puoi utilizzare await senza problemi
  navigate("/login"); // Reindirizza dopo che logout è completato
};


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
                    siderBg: '#1E0407',
                    darkItemBg: '#1E0407',
                  },
                }}
        >
          <Sider trigger={null} collapsible collapsed={collapsed} style={{background: '#1E0407'}}>
            <img className="demo-logo-vertical" alt="logo" src="/assets/deseo-logo-1500x430-full-transp-alt9.webp" style={{ width: '100%', height: 'auto' }}/>
            <Menu
              theme="dark"
              style={{  display: 'flex', flexDirection: 'column', background: '#1E0407' }}
              mode="inline"
              defaultSelectedKeys={['1']}
              items={[
               {
                  key: '1',
                  icon: <DashboardOutlined />,
                  label: <Link to="/dashboard">Dashboard</Link>,
               },
               ...(userRole === "ROLE_ADMIN"
               ? [

               {
                  key: '2',
                  icon: <UserOutlined />,
                  label: "Utenti",
                  children: [
                        { key: '21', label: <Link to="/users">Gestisci utenti</Link>, icon: <BorderlessTableOutlined /> },
                        { key: '22', label: <Link to="/create/user">Crea utente</Link>, icon: <UserAddOutlined /> },
                  ],
                },

                {
                  key: '3',
                  icon: <BorderOutlined />,
                  label: "Area/Zone",
                  children: [
                        { key: '31', label: <Link to="/areas">Lista area/zone</Link>, icon: <BorderlessTableOutlined /> },
                        { key: '32', label: <Link to="/create/area">Crea area/zona</Link>, icon: <AppstoreAddOutlined /> },
                        { key: '33', label: <Link to="/resources">Lista risorse</Link>, icon: <BorderlessTableOutlined /> },
                        { key: '34', label: <Link to="/create/resource">Crea risorsa</Link>, icon: <AppstoreAddOutlined /> },
                  ],
                },]: []),
                {
                  key: '4',
                  icon: <HarmonyOSOutlined />,
                  label: "Massaggi",
                  children: [
                        { key: '41', label: <Link to="/massages/booknow">Prenota ora</Link>, icon: <ScheduleOutlined  /> },
                  ],
                },
                {
                  key: '5',
                  icon: <HeartOutlined />,
                  label: "Pilates",
                  children: [
                        { key: '51', label: <Link to="/pilates/booknow">Prenota ora</Link>, icon: <ScheduleOutlined  /> },
                  ],
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
                  height: 40,
                }}
              />

             <div style={{ display: 'flex', gap: '15px' }}>
                 <Button type="text" onClick={handleUserDetail}>
                   {userName}
                 </Button>
                 <Button
                   type="text"
                   onClick={handleLogout}
                   icon={<LogoutOutlined />}
                 >
                   Logout
                 </Button>
               </div>


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
                  <Route path="/dashboard" element={<PrivateRoute><DashboardDemo /></PrivateRoute>} />
                  <Route path="/users" element={<PrivateRoute><UserTable /></PrivateRoute>} />
                  <Route path="/create/user" element={<PrivateRoute><UserForm /></PrivateRoute>} />
                  <Route path="/update/user" element={<PrivateRoute><UserForm /></PrivateRoute>} />
                  <Route path="/areas" element={<PrivateRoute><AreaTable /></PrivateRoute>} />
                  <Route path="/create/area" element={<PrivateRoute><AreaForm /></PrivateRoute>} />
                  <Route path="/update/area" element={<PrivateRoute><AreaForm /></PrivateRoute>} />
                  <Route path="/create/resource" element={<PrivateRoute><ResourceForm /></PrivateRoute>} />
                  <Route path="/update/resource" element={<PrivateRoute><ResourceForm /></PrivateRoute>} />
                  <Route path="/resources" element={<PrivateRoute><ResourceTable /></PrivateRoute>} />
                  <Route path="/reservation" element={<PrivateRoute><EventForm /></PrivateRoute>} />
                  <Route path="/reservationFiltered" element={<PrivateRoute><EventFormFiltered /></PrivateRoute>} />
                  <Route path="/pilates/booknow" element={<PrivateRoute><CustomCalendarWrapper calendarType="pilates" /></PrivateRoute>} />
                  <Route path="/massages/booknow" element={<PrivateRoute><CustomCalendarWrapper calendarType="massages" /></PrivateRoute>} />
                  <Route path="/booknow" element={<PrivateRoute><CustomCalendarWrapper/></PrivateRoute>} />
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