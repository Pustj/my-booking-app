import React from 'react';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import NumberUsers from "../components/dashboard/NumberUsers";
import CustomCalendar from "../components/dashboard/CustomCalendar";
import { Card, Col, Row, Statistic } from 'antd';

const Dashboard: React.FC = () => (
    <>
      <NumberUsers />
      <CustomCalendar />
    </>
);

export default Dashboard;