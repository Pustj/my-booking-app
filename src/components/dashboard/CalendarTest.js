import React, { useState, useRef, useEffect, useCallback } from "react";
import { Calendar, dayjsLocalizer  } from "react-big-calendar";
import { notification, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';

import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import "dayjs/locale/it";
dayjs.locale("it");

const localizer = dayjsLocalizer(dayjs)

const CalendarTest = () => {
  const [eventsData, setEventsData] = useState([]); // Stato iniziale vuoto per gli eventi
 const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const navigate = useNavigate();


  // Funzione per recuperare i dati dall'API
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/bookings/future", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Invia il token di autorizzazione
        },
      });

      if (!response.ok) {
        throw new Error("Errore nel recupero degli eventi dal server");
      }

      const data = await response.json();

      // Trasforma i dati ricevuti in un formato compatibile con react-big-calendar
      const transformedEvents = data.map((booking) => ({
        id: booking.bookingId,
        title: booking.title + ` - ${booking.user?.username || "Utente"}`, // Titolo con opzione dell'utente
        start: new Date(booking.fromDateTime), // Assicurati che i dati siano in formato Date
        end: new Date(booking.toDateTime),
        colorBg: booking.resource.areaInfo.colorHEX || "#FFD700",
      }));

      setEventsData(transformedEvents); // Aggiorna lo stato con gli eventi trasformati
    } catch (error) {
      console.error("Errore durante il caricamento degli eventi:", error);
      alert("Errore durante il caricamento degli eventi. Riprovare più tardi.");
    }
  }, [token]);

  // Effettua la chiamata API al caricamento iniziale del componente
  useEffect(() => {
    fetchEvents();
    return () => {
              window.clearTimeout(clickRef?.current)
    }
  }, [fetchEvents]); // L'array vuoto come dipendenza assicura che l'effetto venga eseguito una sola volta

  // Funzione per gestire la selezione di una nuova slot
  /*const handleSelect = ({ start, end }) => {
    console.log(start);
    console.log(end);
    const title = window.prompt("New Event name");
    if (title)
      setEventsData([
        ...eventsData,
        {
          start,
          end,
          title,
        },
      ]);
  };*/

  const newEvent = (event) => {
    const now = dayjs();
    console.log(event.start);
    console.log(event.end);
    if (dayjs(event.start).isBefore(now) || dayjs(event.end).isBefore(now)) {
      notification.warning({
        message: "Attenzione",
        description: "Non è possibile creare eventi nel passato.",
      });
      return;
    }

    const newEvent = {
      title: "New event you just created",
      start: event.start,
      end: event.end,
      bgColor: "purple",
    };

    navigate("/reservation", { state: { eventData: newEvent } });
  };
      const clickRef = useRef(null)

      const onSelectEvent = useCallback((calEvent) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const decoded = jwtDecode(token);
        const isAdmin = decoded.role === "ROLE_ADMIN"; // Esempio, verifica che l'utente sia ADMIN
        if (!isAdmin) {
             notification.warning({
                message: "Permesso negato",
                description: "Non sei autorizzato a eliminare gli eventi.",
            });
            return;
        }

        window.clearTimeout(clickRef?.current)
        clickRef.current = window.setTimeout(() => {
                  Modal.confirm({
                    title: "Conferma eliminazione",
                    content: "Sei sicuro di voler eliminare questo evento?",
                    onOk: async () => {

                      try {
                        // Elimina l'evento dal backend
                        const response = await fetch(
                          `http://localhost:8080/BookingRooms/api/v1/delete/booking/${calEvent.id}`,
                          {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        if (!response.ok) {
                          throw new Error("Errore durante l'eliminazione dell'evento.");
                        }

                        // Aggiorna lo stato del calendario rimuovendo l'evento locale

                        const updatedEvents = eventsData.filter(
                          (e) => e.id !== calEvent.id
                        );
                        setEventsData(updatedEvents)

                        notification.success({
                          message: "Evento eliminato",
                          description: "L'evento è stato rimosso con successo.",
                        });
                      } catch (error) {
                        console.error("Errore durante l'eliminazione:", error);
                        notification.error({
                          message: "Errore",
                          description: "Non è stato possibile eliminare l'evento. Riprova più tardi.",
                        });
                      }
                    },
                    onCancel: () => {
                      notification.info({
                        message: "Eliminazione annullata",
                        description: "L'evento non è stato eliminato.",
                      });
                    },
                  });
        }, 250)
      }, [eventsData])

      const onDoubleClickEvent = useCallback((calEvent) => {
        /**
         * Notice our use of the same ref as above.
         */
        window.clearTimeout(clickRef?.current)
        clickRef.current = window.setTimeout(() => {
         alert("Doppio click")
        }, 250)
      }, [])

  return (
    <div className="App">
      <Calendar
        views={["agenda","day", "week", "month"]}
        selectable
        dayLayoutAlgorithm={'no-overlap'}
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="week"
        events={eventsData} // Usa gli eventi dallo stato
        style={{ height: "100vh", marginTop: "20px" }}
        onSelectEvent={onSelectEvent} // Apre un alert con il titolo dell'evento selezionato
        onDoubleClickEvent = {onDoubleClickEvent}
        onSelectSlot={newEvent} // Gestisce l'aggiunta di un nuovo evento
        eventPropGetter={(myEventsList) => {
                    const backgroundColor = myEventsList.colorBg ? myEventsList.colorBg : 'blue';
                    return { style: { backgroundColor} }
                  }}
      />
    </div>
  );
}

export default CalendarTest;