import React from "react";
import { useNavigate } from "react-router-dom";
import ReadOnlyCalendar from "./ReadOnlyCalendar";

const ReadOnlyCalendarWrapper = () => {
  const navigate = useNavigate(); // Usa navigate all'interno di un componente funzionale
  return <ReadOnlyCalendar navigate={navigate} />;
};

export default ReadOnlyCalendarWrapper;