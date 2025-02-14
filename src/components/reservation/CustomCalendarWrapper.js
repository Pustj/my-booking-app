import React from "react";
import { useNavigate } from "react-router-dom";
import CustomCalendarMassages from "./CustomCalendarMassages";
import CustomCalendarPilates from "./CustomCalendarPilates";
import CustomCalendar from "./CustomCalendar";

const CustomCalendarWrapper = (calendarType) => {
  const navigate = useNavigate(); // Usa navigate all'interno di un componente funzionale
    console.log(calendarType)

  switch (calendarType.calendarType) {
      case "massages":
        return <CustomCalendarMassages navigate={navigate}/>; // Mostra il calendario dei massaggi
      case "pilates":
        return <CustomCalendarPilates navigate={navigate}/>; // Mostra il calendario di pilates
      default:
        return <CustomCalendar navigate={navigate}/>; // Mostra il calendario generale
    }

};

export default CustomCalendarWrapper;