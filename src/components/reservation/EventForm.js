import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Space, Switch, App as AntdApp } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const EventForm = () => {
  const [form] = Form.useForm();
  const [resources, setResources] = useState([]); // Stato per memorizzare le risorse
  const navigate = useNavigate();
  const location = useLocation();

  const { eventData, areaId } = location.state || { eventData: null, areaId: null };

  // Funzione per chiamare l'API e ottenere la lista delle risorse
  const fetchResources = async () => {
    try {
    const resourceId = eventData.resourceId.replace("resource","")
      const response = await fetch(`http://localhost:8080/BookingRooms/api/v1/resources/same-area/${resourceId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

      if (!response.ok) {
        throw new Error("Errore durante il caricamento delle risorse");
      }
      const data = await response.json();
      setResources(data);

    } catch (error) {
      console.error("Errore nel caricamento delle risorse:", error);
    }
  };

  // Effetto per caricare le risorse all'avvio del componente
  useEffect(() => {
    fetchResources();
  }, []);

  // Precompila il form con i dati esistenti (se presenti)
  useEffect(() => {
  console.log(eventData)
    if (eventData) {
      form.setFieldsValue({
        title: eventData.title,
        dateRange: [
          dayjs(eventData.start, "YYYY-MM-DD HH:mm"),
          dayjs(eventData.end, "YYYY-MM-DD HH:mm"),
        ],
      });
    }
  }, [eventData, areaId, form]);

  // Gestione del submit del form
  const onFinish = (values) => {
    const { title, dateRange, areaId, resources } = values; // Ottieni i valori dal form
    const [startDate, endDate] = dateRange;

    console.log("Form Data Submitted:", {
      title,
      startDate: startDate.format("YYYY-MM-DD HH:mm"),
      endDate: endDate.format("YYYY-MM-DD HH:mm"),
      areaId,
      resources, // Stato degli Switch per ogni risorsa
    });
  };

  // Funzione "Annulla"
  const handleCancel = () => {
    form.resetFields(); // Resetta i campi
    navigate("/dashboard");
  };

  return (
    <AntdApp>
      <h1 style={{ textAlign: "center", marginBottom: "50px" }}>
        Reservation Form
      </h1>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          dateRange: [dayjs(), dayjs().add(1, "hour")],
          resources: {}, // Inizializza le risorse vuote
        }}
        style={{
          maxWidth: 450,
          marginLeft: 150,
        }}
      >
        {/* Campo per il Titolo */}
        <Form.Item
          name="title"
          label="Titolo"
          rules={[
            { required: true, message: "Inserisci il titolo dell'evento!" },
            { max: 100, message: "Il titolo non può superare i 100 caratteri!" },
          ]}
        >
          <Input placeholder="Inserisci il titolo dell'evento" />
        </Form.Item>

        {/* Campo per Data e Orario */}
        <Form.Item
          name="dateRange"
          label="Fascia oraria"
          rules={[
            { required: true, message: "Seleziona l'intervallo di tempo!" },
          ]}
        >
          <RangePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            placeholder={["Inizio", "Fine"]}
          />
        </Form.Item>

        {/* Campo nascosto per areaId */}
        <Form.Item name="areaId" style={{ display: "none" }} initialValue={areaId}>
          <Input type="hidden" />
        </Form.Item>

        {/* Switch per ogni risorsa */}
        {resources.map((resource) => (
          <Form.Item
            key={resource.id}
            name={["resources", resource.id]} // Nome per mantenere la struttura { id: true/false }
            label={resource.name}
            valuePropName="checked" // Permette il binding booleano con lo Switch
          >
            <Switch />
          </Form.Item>
        ))}

        {/* Bottoni */}
        <Form.Item style={{ marginTop: "20px" }}>
          <Space>
            <Button color="red" onClick={handleCancel}>
              Annulla
            </Button>
            <Button type="primary" htmlType="submit">
              Crea
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </AntdApp>
  );
};

export default EventForm;