import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";

import { Table, Spin, notification, ColorPicker, Space, Button, Popconfirm, Tag } from 'antd';
import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

const AreaTable = () => {
  const [areas, setAreas] = useState([]); // Dati per la tabella
  const [loading, setLoading] = useState(false); // Loader per la tabella
  const [resources, setResources] = useState({}); // Risorse caricate per area_id
  const [expandedRows, setExpandedRows] = useState([]); // Lista delle righe espanse
  const navigate = useNavigate(); // Hook per navigare

  const token = localStorage.getItem("authToken");

  // Recupera le aree da un endpoint
  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/BookingRooms/api/v1/areas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json(); // Assuming the backend returns a JSON array
        setAreas(data);
      } else {
        notification.error({
          message: 'Errore',
          description: 'Impossibile caricare le aree.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Errore',
        description: 'Si è verificato un errore durante il caricamento delle aree.',
      });
    }
    setLoading(false);
  }, [token]);

  // Recupera i resources associati a un'area
  const fetchResources = async (areaId) => {
    if (resources[areaId]) {
      // Se i resources sono già stati caricati, restituiscili
      return resources[areaId];
    }

    try {
      const response = await fetch(`http://localhost:8080/BookingRooms/api/v1/resources/area?area_id=${areaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json(); // Assuming the backend returns a JSON array
        setResources((prev) => ({ ...prev, [areaId]: data })); // Salva i risultati nella mappa resources
        return data;
      } else {
        notification.error({
          message: 'Errore',
          description: `Impossibile caricare i resources per l'area ${areaId}`,
        });
        return [];
      }
    } catch (error) {
      notification.error({
        message: 'Errore',
        description: `Errore durante il caricamento dei resources per l'area ${areaId}`,
      });
      return [];
    }
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
            message: "Utente eliminato",
            description: "L'utente è stato eliminato con successo.",
          });

          // Aggiorna i dati nella tabella dopo la cancellazione
          const updatedData = areas.filter((area) => area.areaId !== areaId);
          setAreas(updatedData);
          //setFilteredData(updatedData);
        } else if(response.status === 406) {
            notification.warning({
                    message: "Attenzione",
                    description: "Questa area ha delle risorse associate.",
                  });
        } else {
          notification.error({
            message: "Errore nell'eliminazione",
            description: "Impossibile eliminare l'area.",
          });
        }
      } catch (error) {
        notification.error({
          message: "Errore di rete",
          description: "Errore durante l'eliminazione dell'area.",
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
        console.error("Errore nel recuperare i dettagli dell'area.");
      }
    } catch (error) {
      console.error("Errore nella chiamata al backend:", error);
    }
  };

  // Listener per gestire l'espansione delle righe
  const onExpand = async (expanded, record) => {

    if (expanded) {
      // Carica le risorse se non sono già disponibili
      await fetchResources(record.areaId);
      setExpandedRows((prev) => [...prev, record.areaId]); // Aggiungi l'id dell'area alle righe espanse
    } else {
      setExpandedRows((prev) => prev.filter((id) => id !== record.areaId)); // Rimuovi la riga dall'elenco espanso
    }
  };

// Effettua la chiamata fetch al caricamento del componente
  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Configurazione delle colonne della tabella
  const columns = [
    {
      title: 'Nome Area',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tipo Area',
      dataIndex: 'typeArea',
      key: 'typeArea',
      render: (typeArea) =><Tag color={getTagColor(typeArea)}>{typeArea}</Tag>
    },
    {
        title: "Colore",
        dataIndex: "colorHEX",
        key: "colorHEX",
        render: (colorHEX) =>
            <ColorPicker defaultValue={colorHEX} showText disabled />
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
                onClick={() => editArea(record.areaId)} // Funzione per la modifica
              >
                Modifica
              </Button>

              <Popconfirm
                title="Sei sicuro di voler eliminare questo utente?"
                onConfirm={() => deleteArea(record.areaId)} // Conferma l'eliminazione
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

  // Funzione per colorare i Tag in base al ruolo
    const getTagColor = (role) => {
      switch (role) {
        case "MASSAGGIO":
          return "geekblue";
        case "PILATES":
          return "volcano";
        default:
          return "gray";
      }
    };
    const columnsExpanded = [
    {
      title: 'Nome Risorsa',
      dataIndex: 'name',
      key: 'name',
    },
  ];




  // Configurazione delle righe espandibili
  const expandable = {

    expandedRowRender: (record) => {
        console.log(record);
      const areaResources = resources[record.areaId]; // Recupera le risorse per questa area
      if (!areaResources) {
        return <Spin />;
      }

      return (
       <Table
          columns={columnsExpanded}
          dataSource={areaResources}
          pagination={false}
        />
      );
    },
    rowExpandable: () => true, // Consenti di espandere tutte le righe
  };

  return (
    <div>
      <h1>Elenco delle Aree</h1>
      <Table
        columns={columns} // Colonne configurate
        dataSource={areas} // Dati della tabella
        loading={loading} // Mostra lo spinner se i dati non sono stati caricati
        rowKey="areaId" // Chiave unica per ogni riga
        expandable={expandable} // Configurazione dell'espandibilità
        expandedRowKeys={expandedRows} // Righe attualmente espanse
        onExpand={onExpand} // Listener per gestire l'espansione
      />
    </div>
  );
};

export default AreaTable;






