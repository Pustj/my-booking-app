import React, { useState, useEffect } from "react";
import { Select } from "antd";

const { Option } = Select;

const RoleSelector = ({ value, onChange }) => {
  const [roles, setRoles] = useState([]); // Stato per memorizzare i ruoli
  const [loading, setLoading] = useState(false); // Stato per il caricamento

/* Funzione per recuperare il token JWT
const getToken = () => {
  return localStorage.getItem("authToken"); // Recupera il token JWT da localStorage (o altra fonte)
};*/

useEffect(() => {
  let isMounted = true; // Controlla se il componente è ancora montato
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch("http://localhost:8080/BookingRooms/api/v1/roles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Errore durante il recupero dei ruoli");
      }
      const data = await response.json();
      console.log(data);
      if (isMounted) {
        setRoles(data); // Aggiorna i dati solo se montato
      }
    } catch (error) {
      console.error("Errore nella fetch:", error);
    } finally {
      if (isMounted) {
        setLoading(false); // Aggiorna lo stato solo se montato
      }
    }
  };

  fetchRoles();
  return () => {
    // Cleanup: impedisce l'aggiornamento di stato se il componente si smonta
    isMounted = false;
  };
}, []);


  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder="Select a role"
      loading={loading} // Mostra lo stato di caricamento
      style={{ width: 200 }}
      defaultValue="-"
    >
      {roles.map((role) => (
        <Option key={role.roleId} value={role.roleId}>
          {role.role.replace("ROLE_", "")}
        </Option>
      ))}
    </Select>
  );
};

export default RoleSelector;
