import { React , useState, useEffect } from 'react';
import { Line } from '@ant-design/plots';

const EarningsPlot = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/BookingRooms/api/v1/statistic/monthly-earnings", {
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
    xField: 'month',
    yField: 'earnings',
    sizeField: 'earnings',
    legend: { size: false },
    axis: {
          y: { title: 'CHF' },
        },
    colorField: 'username',
    style: {
          lineWidth: 2,
          lineDash: (data) => {
            if (data[0].username === 'Tutti') return [4, 4];
          },

        },
  };
  return <Line {...config} />;
};

export default EarningsPlot;