import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Table, Tag, notification, Input, Button, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

const UsersTable = () => {
  const [data, setData] = useState([]); // Dati originali
  const [filteredData, setFilteredData] = useState([]); // Dati filtrati
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const [searchText, setSearchText] = useState(""); // Stato per il testo di ricerca
  const navigate = useNavigate(); // Hook per navigare

  const fetchUsers = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const users = await response.json();

        const formattedData = users.map((user, index) => ({
          key: index+1, // Chiave per la tabella
          id: user.userId, // ID dell'utente (necessario per identificare e cancellare)
          username: user.username,
          email: user.email,
          createdAt: user.createdAt || "Data non disponibile",
          role: user.role?.role.replace("ROLE_", "") || "Ruolo non specificato",
        }));

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
    fetchUsers();
  }, []);

  // Funzione di gestione della ricerca
  const handleSearch = (e) => {
    const searchString = e.target.value.toLowerCase();
    setSearchText(searchString); // Aggiorna lo stato del testo di ricerca

    const filtered = data.filter((item) => {
      return (
        item.username.toLowerCase().includes(searchString) ||
        item.email.toLowerCase().includes(searchString) ||
        item.role.toLowerCase().includes(searchString)
      );
    });

    setFilteredData(filtered); // Aggiorna i dati filtrati
  };

  // Funzione per eliminare un utente
  const deleteUser = async (userId) => {
    const token = localStorage.getItem("authToken");
    const url = `http://localhost:8080/BookingRooms/api/v1/delete/user/${userId}`;

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
        const updatedData = data.filter((user) => user.id !== userId);
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

  const editUser = async (userId) => {

  try {
    // Effettua una chiamata GET al backend per ottenere i dettagli dell'utente
    const response = await fetch(`http://localhost:8080/BookingRooms/api/v1/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json(); // Ottieni i dati dell'utente

      // Naviga alla pagina "UserForm" con i dati utente
      navigate("/update/user", { state: { userData, isEditing: true  } });
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
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Data di Creazione",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) =>
        dayjs(createdAt).locale("it").format("DD MMMM YYYY, HH:mm"),
    },
    {
      title: "Ruolo",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={getTagColor(role)}>{role}</Tag>,
    },
    {
      title: "Azioni", // Colonna per le azioni
      key: "actions",
      render: (_, record) => (
      <Space>
       <Button
          color="cyan"
          variant="outlined"
          onClick={() => editUser(record.id)} // Funzione per la modifica
          disabled={record.role === "ADMIN"} // Disabilitato per ADMIN
        >
          Modifica
        </Button>

        <Popconfirm
          title="Sei sicuro di voler eliminare questo utente?"
          onConfirm={() => deleteUser(record.id)} // Conferma l'eliminazione
          okText="Sì"
          cancelText="No"
          disabled={record.role === "ADMIN"} // Non disponibile per ADMIN
        >
          <Button
            danger
            disabled={record.role === "ADMIN"} // Disabilitato per ADMIN
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
      case "ADMIN":
        return "geekblue";
      case "USER":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <div>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Users</h1>

      <Input
        placeholder="Cerca per username, email o ruolo"
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

export default UsersTable;