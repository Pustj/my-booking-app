import React from "react";
import { useNavigate } from "react-router-dom";
import CustomCalendar from "./CustomCalendar";

const CustomCalendarWrapper = () => {
  const navigate = useNavigate(); // Usa navigate all'interno di un componente funzionale
  return <CustomCalendar navigate={navigate} />;
};

export default CustomCalendarWrapper;