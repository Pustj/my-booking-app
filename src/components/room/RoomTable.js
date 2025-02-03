import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Table, ColorPicker, notification, Input, Button, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

const RoomTable = () => {
  const [data, setData] = useState([]); // Dati originali
  const [filteredData, setFilteredData] = useState([]); // Dati filtrati
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const [searchText, setSearchText] = useState(""); // Stato per il testo di ricerca
  const navigate = useNavigate(); // Hook per navigare

  const fetchRooms = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/rooms", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const rooms = await response.json();

        const formattedData = rooms.map((room, index) => ({
          key: index+1, // Chiave per la tabella
          id: room.roomId, // ID dell'utente (necessario per identificare e cancellare)
          name: room.name,
          capacity: room.capacity,
          colorValue: room.colorHEX,
          createdAt: room.createdAt || "Data non disponibile",
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
    fetchRooms();
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
  const deleteRoom = async (roomId) => {
    const token = localStorage.getItem("authToken");
    const url = `http://localhost:8080/BookingRooms/api/v1/delete/room/${roomId}`;

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
        const updatedData = data.filter((room) => room.id !== roomId);
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

  const editRoom = async (roomId) => {

  try {
    // Effettua una chiamata GET al backend per ottenere i dettagli dell'utente
    const response = await fetch(`http://localhost:8080/BookingRooms/api/v1/room/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const roomData = await response.json(); // Ottieni i dati dell'utente

      // Naviga alla pagina "RoomForm" con i dati utente
      navigate("/update/room", { state: { roomData, isEditing: true  } });
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
      title: "Capacità",
      dataIndex: "capacity",
      key: "capacity",
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
          onClick={() => editRoom(record.id)} // Funzione per la modifica
          disabled={record.role === "ADMIN"} // Disabilitato per ADMIN
        >
          Modifica
        </Button>

        <Popconfirm
          title="Sei sicuro di voler eliminare questo utente?"
          onConfirm={() => deleteRoom(record.id)} // Conferma l'eliminazione
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
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>rooms</h1>

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

export default RoomTable;