import React from 'react';
import NumberUsers from "../components/dashboard/NumberUsers";
import CalendarTest from "../components/dashboard/CalendarTest";
import BookingsPlot from "../components/dashboard/BookingsPlot";

const Dashboard: React.FC = () => (
    <>
      <NumberUsers />
      <CalendarTest />
      <BookingsPlot />
    </>
);

export default Dashboard;