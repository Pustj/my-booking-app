import React, { Component, createRef } from "react";
import { notification } from "antd";
import { Scheduler, SchedulerData, ViewType, DATE_FORMAT, DemoData } from "react-big-schedule";
import dayjs from "dayjs";
import "dayjs/locale/it";
import "react-big-schedule/dist/css/style.css";
import "../../calendar.css";

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
      { responsiveByParent: true, localeDayjs: dayjs }
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
  }

  fetchResources = async () => {
    const token = localStorage.getItem("authToken");

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

        // Mappa le risorse dall'API
       /* const resources = res.map((resource) => ({
          id: resource.resourceId, // ID della risorsa
          name: resource.name,    // Nome della risorsa
        }));*/

        // Aggiorna lo stato e le risorse nello scheduler
        this.setState({ resources, loading: false }, () => {
          const { schedulerData } = this.state;
          schedulerData.setResources(resources); // Imposta le risorse nello scheduler
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
    navigate("/reservation", { state: { eventData: newEvent } });
  };

  prevClick = (schedulerData) => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    this.setState({ schedulerData });
  };

  nextClick = (schedulerData) => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    this.setState({ schedulerData });
  };

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    this.setState({ schedulerData });
  };

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    this.setState({ schedulerData });
  };

  render() {
    const { schedulerData, loading, resources } = this.state;

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
              />
            </div>
            <h3>Risorse Caricate:</h3>
            <ul>
              {resources.map((resource) => (
                <li key={resource.id}>{resource.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default CustomCalendar;
