import { React , useState, useEffect } from 'react';
import { Column } from '@ant-design/plots';

const BookingsPlot = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/BookingRooms/api/v1/bookings/monthly", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          // Controlla se la risposta è valida
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json(); // Converte la risposta in JSON
          setData(result); // Aggiorna l'array "data" con la risposta
        } catch (err) {
          console.error("Errore durante il fetch:", err);
          setError(err.message); // Memorizza l'errore per mostrarlo eventualmente
        }
      };

      fetchData(); // Effettua la chiamata HTTP
    }, []);

  const config = {
    data: data,
          /*data: {
      type: 'fetch',
      value: 'http://localhost:8080/BookingRooms/api/v1/bookings/monthly',
      //value: 'https://gw.alipayobjects.com/os/antfincdn/iPY8JFnxdb/dodge-padding.json',
    },*/

    xField: 'mese',
    yField: 'value',
    colorField: 'name',
    group: true,
    style: {
      inset: 5,
    },
    onReady: ({ chart }) => {
      try {
        chart.on('afterrender', () => {
          chart.emit('legend:filter', {
            data: { channel: 'color', values: ['Tutti'] },
          });
        });
      } catch (e) {
        console.error(e);
      }
    },
  };
  return <Column {...config} />;
};

export default BookingsPlot;