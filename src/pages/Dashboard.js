import React from 'react';
import NumberUsers from "../components/dashboard/NumberUsers";
import CustomCalendarWrapper from "../components/dashboard/CustomCalendarWrapper";

const Dashboard: React.FC = () => (
    <>
      <NumberUsers />
      <CustomCalendarWrapper />
    </>
);

export default Dashboard;