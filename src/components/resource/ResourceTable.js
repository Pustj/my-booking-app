import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Table, Tag, notification, Input, Button, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

const ResourceTable = () => {
  const [data, setData] = useState([]); // Dati originali
  const [filteredData, setFilteredData] = useState([]); // Dati filtrati
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const [searchText, setSearchText] = useState(""); // Stato per il testo di ricerca
  const navigate = useNavigate(); // Hook per navigare

  const fetchResources = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/resources", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const resources = await response.json();

        const formattedData = resources.map((resource, index) => ({
          key: index+1, // Chiave per la tabella
          id: resource.resourceId, // ID dell'utente (necessario per identificare e cancellare)
          name: resource.name,
          areaId: resource.area.areaId,
          areaName: resource.area.title,
          areaColor: resource.area.colorHEX,
          createdAt: resource.createdAt || "Data non disponibile",
        }));
        console.log(formattedData);
        setData(formattedData);
        console.log("Dati elaborati per la tabella:", formattedData);

        setFilteredData(formattedData); // Assegniamo inizialmente tutti i dati anche a quelli filtrati
      } else {
        notification.error({
          message: "Errore nel recupero dei dati",
          description: "Impossibile recuperare i dati degli utenti dal server.",
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
    fetchResources();
  }, []);

  // Funzione di gestione della ricerca
  const handleSearch = (e) => {
    const searchString = e.target.value.toLowerCase();
    setSearchText(searchString); // Aggiorna lo stato del testo di ricerca

    const filtered = data.filter((item) => {
      return (
        item.resourcename.toLowerCase().includes(searchString) ||
        item.email.toLowerCase().includes(searchString) ||
        item.role.toLowerCase().includes(searchString)
      );
    });

    setFilteredData(filtered); // Aggiorna i dati filtrati
  };

  // Funzione per eliminare un utente
  const deleteResource = async (resourceId) => {
    const token = localStorage.getItem("authToken");
    const url = `http://localhost:8080/BookingRooms/api/v1/delete/resource/${resourceId}`;

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
          message: "Utente eliminato",
          description: "L'utente è stato eliminato con successo.",
        });

        // Aggiorna i dati nella tabella dopo la cancellazione
        const updatedData = data.filter((resource) => resource.id !== resourceId);
        setData(updatedData);
        setFilteredData(updatedData);
      } else {
        notification.error({
          message: "Errore nell'eliminazione",
          description: "Impossibile eliminare l'utente.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Errore di rete",
        description: "Errore durante l'eliminazione dell'utente.",
      });
    }
  };

  const editResource = async (resourceId) => {

  try {
    // Effettua una chiamata GET al backend per ottenere i dettagli dell'utente
    const response = await fetch(`http://localhost:8080/BookingRooms/api/v1/resource/${resourceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const resourceData = await response.json(); // Ottieni i dati dell'utente

      // Naviga alla pagina "ResourceForm" con i dati utente
      navigate("/update/resource", { state: { resourceData, isEditing: true  } });
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
      title: "Nome risorsa",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Associato all'area",
      dataIndex: "areaName",
      key: "areaName",
      render: (_, record) => (<Tag color={record.areaColor}>{record.areaName}</Tag>),
    },
    {
      title: "Azioni", // Colonna per le azioni
      key: "actions",
      render: (_, record) => (
      <Space>
       <Button
          color="cyan"
          variant="outlined"
          onClick={() => editResource(record.id)} // Funzione per la modifica
        >
          Modifica
        </Button>

        <Popconfirm
          title="Sei sicuro di voler eliminare questo utente?"
          onConfirm={() => deleteResource(record.id)} // Conferma l'eliminazione
          okText="Sì"
          cancelText="No">
          <Button danger >
            Elimina
          </Button>
        </Popconfirm>
        </Space>

      ),
    },
  ];

  // Funzione per colorare i Tag in base al ruolo
  const getTagColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "geekblue";
      case "RESOURCE":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <div>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Resources</h1>

      <Input
        placeholder="Cerca per resourcename, email o ruolo"
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

export default ResourceTable;