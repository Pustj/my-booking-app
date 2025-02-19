import React from 'react';
import NumberUsers from "../components/dashboard/NumberUsers";
import CalendarTest from "../components/dashboard/CalendarTest";
import BookingsPlot from "../components/dashboard/BookingsPlot";
import EarningsPlot from "../components/dashboard/EarningsPlot";

const Dashboard: React.FC = () => (
    <>
      <NumberUsers />
      <BookingsPlot />
      <EarningsPlot />
    </>
);

export default Dashboard;