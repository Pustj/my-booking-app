import React from 'react';
import CalendarTest from "../components/dashboard/CalendarTest";
import CalendarTestMassage from "../components/dashboard/CalendarTestMassage";
import CalendarTestPilates from "../components/dashboard/CalendarTestPilates";

const Dashboard: React.FC = () => (
    <>
      <h2>Calendar con tutte le riservazioni</h2>
      <CalendarTest />

      <h2>Calendar con riservazioni Massaggi</h2>
      <CalendarTestMassage />

      <h2>Calendar con riservazioni Pilates</h2>
      <CalendarTestPilates />
    </>
);

export default Dashboard;