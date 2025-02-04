import React, { useEffect, useState } from "react";
import { ArrowUpOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, notification } from 'antd';

const NumberUsers = () => {
  const [activeUsers, setActiveUsers] = useState(null); // Stato per il numero di utenti attivi
  const [upcomingBookings, setUpcomingBookings] = useState(null); // Stato per il numero di prenotazioni imminenti
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(true); // Stato di caricamento per utenti attivi
  const [loadingBookings, setLoadingBookings] = useState(true); // Stato di caricamento per prenotazioni imminenti

  // Funzione per ottenere il numero di utenti attivi
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/BookingRooms/api/v1/statistic/usersActive");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Supponendo che l'API restituisca semplicemente un numero
        setActiveUsers(data); // Imposta il valore nello stato
      } catch (error) {
        console.error("Errore durante il recupero degli utenti:", error);
        notification.error({
          message: "Errore API",
          description: "Si è verificato un errore durante la chiamata all'API Users Active.",
        });
      } finally {
        setLoadingActiveUsers(false); // Fine del caricamento
      }
    };

    fetchActiveUsers();
  }, []); // Chiamata API al montaggio del componente

  // Funzione per ottenere il numero di prenotazioni imminenti
  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/BookingRooms/api/v1/statistic/upcomingBookings");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Supponendo che l'API restituisca semplicemente un numero
        setUpcomingBookings(data); // Imposta il valore nello stato
      } catch (error) {
        console.error("Errore durante il recupero delle prenotazioni:", error);
        notification.error({
          message: "Errore API",
          description: "Si è verificato un errore durante la chiamata all'API Upcoming Bookings.",
        });
      } finally {
        setLoadingBookings(false); // Fine del caricamento
      }
    };

    fetchUpcomingBookings();
  }, []); // Chiamata API al montaggio del componente

  return (
    <Row gutter={16}>
      {/* Card per gli utenti attivi */}
      <Col span={12}>
        <Card bordered={false}>
          <Statistic
            title="Utenti attivi"
            value={loadingActiveUsers ? "Loading..." : activeUsers} // Mostra "Loading..." durante il caricamento
            valueStyle={{ color: '#3f8600' }}
            prefix={<ArrowUpOutlined />}
          />
        </Card>
      </Col>

      {/* Card per le prenotazioni imminenti */}
      <Col span={12}>
        <Card bordered={false}>
          <Statistic
            title="Appuntamenti programmati"
            value={loadingBookings ? "Loading..." : upcomingBookings} // Mostra "Loading..." durante il caricamento
            valueStyle={{  }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default NumberUsers;
