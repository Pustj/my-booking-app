import React from 'react';
import NumberUsers from "../components/dashboard/NumberUsers";
import CustomCalendarWrapper from "../components/dashboard/ReadOnlyCalendarWrapper";
import BookingsPlot from "../components/dashboard/BookingsPlot";

const Dashboard: React.FC = () => (
    <>
      <NumberUsers />
      <CustomCalendarWrapper />
      <BookingsPlot />
    </>
);

export default Dashboard;