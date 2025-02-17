import React, { Component, createRef } from "react";
import { notification, Modal } from "antd";
import { Scheduler, SchedulerData, ViewType, DATE_FORMAT } from "react-big-schedule";
import dayjs from "dayjs";
import "dayjs/locale/it";
import "react-big-schedule/dist/css/style.css";
import "../../calendar.css";
import {jwtDecode} from 'jwt-decode';

dayjs.locale("it");

class CustomCalendar extends Component {
  constructor(props) {
    super(props);

    // Crea un'istanza di SchedulerData
    const schedulerData = new SchedulerData(
      dayjs().format(DATE_FORMAT),
      ViewType.Day,
      false,
      false,
      {
        responsiveByParent: true,
        localeDayjs: dayjs,
        startResizable: false,
        endResizable: false,
      },
    );
    schedulerData.config.dragAndDropEnabled = false;
    // Stato iniziale
    this.state = {
      schedulerData,
      resources: [], // Popolato al momento della creazione
      loading: true, // Stato di caricamento
      error: null,   // Per eventuale gestione errori
    };

    this.parentRef = createRef(); // Creazione riferimento al DOM

    // Chiama fetchResources per popolare le risorse all'avvio
    this.fetchResources();
    this.fetchFutureBookings();
  }
    fetchFutureBookings = async () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      try {
        const response = await fetch(
          "http://localhost:8080/BookingRooms/api/v1/bookings/future",
          {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
          }
        );
        if (!response.ok) {
          throw new Error("Errore nel recupero dei dati dal server");
        }

        const data = await response.json();

        // Trasforma i dati: mappa da JSON a oggetti compatibili con schedulerData
        const transformedEvents = data.map((booking) => ({
          id: booking.bookingId,
          start: booking.fromDateTime.replace("T", " "), // Trasforma in formato richiesto
          end: booking.toDateTime.replace("T", " "),
          resourceId: `resource${booking.resource.resourceId}`,
          title:  booking.title + " - " + booking.user?.username,
          bgColor: booking.resource.areaInfo.colorHEX || "#FFD700", // Usa un colore predefinito se non disponibile
        }));

        
        // Aggiorna lo stato e le risorse nello scheduler
                this.setState({ transformedEvents, loading: false }, () => {
                  const { schedulerData } = this.state;
                  schedulerData.setEvents(transformedEvents); // Imposta le risorse nello scheduler
                  this.setState({ schedulerData }); // Aggiorna il modello con le modifiche
                });
      } catch (error) {
        console.error("Errore nella chiamata API:", error);
        notification.error({
          message: "Errore nel caricamento",
          description:
            "Non è stato possibile caricare gli eventi. Riprova più tardi.",
        });
        window.location.href = "/login";
      }
    };
    updateSchedulerEvents = (schedulerData) => {
        const { transformedEvents } = this.state; // Lista degli eventi dallo stato
        schedulerData.setEvents(transformedEvents); // Imposta gli eventi nello scheduler
        this.setState({ schedulerData }); // Aggiorna lo stato
    };


  fetchResources = async () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    try {
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/areas-with-resources", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
      const resources = [];


        const res = await response.json();
        res.forEach((area) => {
            // Aggiungi l'area come gruppo
            resources.push({
              id: `area${area.areaId}`, // ID unico dell'area
              name: area.title,         // Nome dell'area (es. "Stanza Rossa")
              title: area.title,        // Titolo dell'area
              groupOnly: true,          // Imposta come gruppo
            });

            // Aggiungi le risorse dell'area come figli
            area.resources.forEach((resource) => {
              resources.push({
                id: `resource${resource.resourceId}`,           // ID unico della risorsa
                name: resource.name,                           // Nome della risorsa
                parentId: `area${resource.areaInfo.areaId}`,                // Collega alla sua area come parentId
              });
            });

            // Separare risorse con e senza `parentId`.
            const withParent = resources.filter((resource) => resource.parentId);
            const withoutParent = resources.filter((resource) => !resource.parentId);

            // Ordinare solo le risorse con `parentId` per il nome.
            withParent.sort((a, b) => a.name.localeCompare(b.name));

            // Combinare mantenendo l'ordine: prima quelle senza `parentId`, poi quelle ordinate con `parentId`.
            const sortedResources = [...withoutParent, ...withParent];

            // Aggiorna lo stato e le risorse nello scheduler
            this.setState({ resources, loading: false }, () => {
              const { schedulerData } = this.state;
              schedulerData.setResources(sortedResources); // Imposta le risorse nello scheduler
              this.setState({ schedulerData }); // Aggiorna il modello con le modifiche
            });
      });
       }else {
        notification.error({
          message: "Errore nel recupero dei dati",
          description: "Impossibile recuperare le risorse dal server.",
        });
        this.setState({ loading: false });
      }
    } catch (error) {
      notification.error({
        message: "Errore di rete",
        description: "Problema di comunicazione con il server. Riprova più tardi.",
      });
      this.setState({ loading: false, error });
    }
  };

  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    const now = dayjs();
    if (dayjs(start).isBefore(now) || dayjs(end).isBefore(now)) {
      notification.warning({
        message: "Attenzione",
        description: "Non è possibile creare eventi nel passato.",
      });
      return;
    }

    const hasOverlap = schedulerData.events.some((event) => {
      if (event.resourceId === slotId) {
        return (
          (start >= event.start && start < event.end) ||
          (end > event.start && end <= event.end) ||
          (start <= event.start && end >= event.end)
        );
      }
      return false;
    });

    if (hasOverlap) {
      notification.warning({
        message: "Attenzione",
        description: "Questa risorsa è già riservata.",
      });
      return;
    }

    const newEvent = {
      title: "New event you just created",
      start,
      end,
      resourceId: slotId,
      bgColor: "purple",
    };
    console.log(newEvent);
    const { navigate } = this.props; // Navigate passato dalle props
    navigate("/reservationFiltered", { state: { eventData: newEvent } });
  };

  prevClick = (schedulerData) => {
    schedulerData.prev();
    this.updateSchedulerEvents(schedulerData);
    this.setState({ schedulerData });
  };

  nextClick = (schedulerData) => {
    schedulerData.next();
    this.updateSchedulerEvents(schedulerData);
    this.setState({ schedulerData });
  };

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    this.updateSchedulerEvents(schedulerData);
    this.setState({ schedulerData });
  };

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    this.updateSchedulerEvents(schedulerData);
    this.setState({ schedulerData });
  };
  toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };

  onEventClick = (schedulerData, event) => {
        // Verifica se l'utente è un amministratore
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

        // Chiedi conferma all'utente
        Modal.confirm({
          title: "Conferma eliminazione",
          content: "Sei sicuro di voler eliminare questo evento?",
          onOk: async () => {

            try {
              // Elimina l'evento dal backend
              const response = await fetch(
                `http://localhost:8080/BookingRooms/api/v1/delete/booking/${event.id}`,
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
              const { schedulerData, transformedEvents } = this.state;
              const updatedEvents = transformedEvents.filter(
                (e) => e.id !== event.id
              );
              schedulerData.setEvents(updatedEvents); // Aggiorna gli eventi visibili
              this.setState({ schedulerData, transformedEvents: updatedEvents });

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
      };

  render() {
    const { schedulerData, loading } = this.state;

    return (
      <div>
        {loading ? (
          <p>Caricamento risorse in corso...</p>
        ) : (
          <div>
            <div ref={this.parentRef}>
              <Scheduler
                parentRef={this.parentRef}
                schedulerData={schedulerData}
                prevClick={this.prevClick}
                nextClick={this.nextClick}
                onSelectDate={this.onSelectDate}
                onViewChange={this.onViewChange}
                newEvent={this.newEvent}
                toggleExpandFunc={this.toggleExpandFunc}
                eventItemClick={this.onEventClick}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CustomCalendar;
