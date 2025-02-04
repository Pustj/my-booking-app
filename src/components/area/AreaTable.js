import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Table, ColorPicker, notification, Input, Button, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

const AreaTable = () => {
  const [data, setData] = useState([]); // Dati originali
  const [filteredData, setFilteredData] = useState([]); // Dati filtrati
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const [searchText, setSearchText] = useState(""); // Stato per il testo di ricerca
  const navigate = useNavigate(); // Hook per navigare

  const fetchAreas = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/areas", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const areas = await response.json();

        const formattedData = areas.map((area, index) => ({
          key: index+1, // Chiave per la tabella
          id: area.areaId, // ID dell'utente (necessario per identificare e cancellare)
          name: area.name,
          colorValue: area.colorHEX,
          createdAt: area.createdAt || "Data non disponibile",
        }));

        setData(formattedData);
        console.log("Dati elaborati per la tabella:", formattedData);

        setFilteredData(formattedData); // Assegniamo inizialmente tutti i dati anche a quelli filtrati
      } else {
        notification.error({
          message: "Errore nel recupero dei dati",
          description: "Impossibile recuperare i dati delle stanze dal server.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Errore",
        description: "Problemi di rete o errore nel server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Funzione di gestione della ricerca
  const handleSearch = (e) => {
    const searchString = e.target.value.toLowerCase();
    setSearchText(searchString); // Aggiorna lo stato del testo di ricerca

    const filtered = data.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchString)
      );
    });

    setFilteredData(filtered); // Aggiorna i dati filtrati
  };

  // Funzione per eliminare un utente
  const deleteArea = async (areaId) => {
    const token = localStorage.getItem("authToken");
    const url = `http://localhost:8080/BookingRooms/api/v1/delete/area/${areaId}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        notification.success({
          message: "Stanza eliminata",
          description: "La stanza è stata eliminata con successo.",
        });

        // Aggiorna i dati nella tabella dopo la cancellazione
        const updatedData = data.filter((area) => area.id !== areaId);
        setData(updatedData);
        setFilteredData(updatedData);
      } else {
        notification.error({
          message: "Errore nell'eliminazione",
          description: "Impossibile eliminare la stanza.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Errore di rete",
        description: "Errore durante l'eliminazione della stanza.",
      });
    }
  };

  const editArea = async (areaId) => {

  try {
    // Effettua una chiamata GET al backend per ottenere i dettagli dell'utente
    const response = await fetch(`http://localhost:8080/BookingRooms/api/v1/area/${areaId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const areaData = await response.json(); // Ottieni i dati dell'utente

      // Naviga alla pagina "AreaForm" con i dati utente
      navigate("/update/area", { state: { areaData, isEditing: true  } });
    } else {
      console.error("Errore nel recuperare i dettagli dell'utente.");
    }
  } catch (error) {
    console.error("Errore nella chiamata al backend:", error);
  }
};

  // Colonne della tabella
  const columns = [
    {
      title: "Nome stanza",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Colore",
      dataIndex: "colorValue",
      key: "colorValue",
      render: (colorValue) =>
                    <ColorPicker defaultValue={colorValue} showText disabled />
    },
    {
            title: "Data di Creazione",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (createdAt) =>
              dayjs(createdAt).locale("it").format("DD MMMM YYYY"),
          },
    {
      title: "Azioni", // Colonna per le azioni
      key: "actions",
      render: (_, record) => (
      <Space>
       <Button
          color="cyan"
          variant="outlined"
          onClick={() => editArea(record.id)} // Funzione per la modifica
          disabled={record.role === "ADMIN"} // Disabilitato per ADMIN
        >
          Modifica
        </Button>

        <Popconfirm
          title="Sei sicuro di voler eliminare questo utente?"
          onConfirm={() => deleteArea(record.id)} // Conferma l'eliminazione
          okText="Sì"
          cancelText="No"
        >
          <Button
            danger
          >
            Elimina
          </Button>
        </Popconfirm>
        </Space>

      ),
    },
  ];

  return (
    <div>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>areas</h1>

      <Input
        placeholder="Cerca per nome"
        value={searchText} // Testo di ricerca
        onChange={handleSearch} // Si attiva su ogni carattere digitato
        allowClear
        size="large"
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      {/* Tabella */}
      <Table
        columns={columns}
        dataSource={filteredData} // Usa i dati filtrati
        loading={loading} // Mostra stato di caricamento
        pagination={{ pageSize: 5 }} // Paginazione
      />
    </div>
  );
};

export default AreaTable;