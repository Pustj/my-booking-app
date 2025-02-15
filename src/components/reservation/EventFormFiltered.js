import React, { useEffect,useCallback, useState } from "react";
import { Form, Input, Button, DatePicker, Space, Switch, notification, App as AntdApp } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import {jwtDecode} from 'jwt-decode';

const EventFormFiltered = () => {
  const [form] = Form.useForm();
  const [resources, setResources] = useState([]); // Stato per memorizzare le risorse
  const [toggleAll, setToggleAll] = useState(false); // Stato globale per abilitare/disabilitare tutti gli switch
  const navigate = useNavigate();
  const location = useLocation();

  const { eventData, areaId } = location.state || { eventData: null, areaId: null };

  // Funzione per chiamare l'API e ottenere la lista delle risorse
  const fetchResources = useCallback(async () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    try {
      const resourceId = eventData.resourceId.replace("resource", "");
      const response = await fetch(
        `http://localhost:8080/BookingRooms/api/v1/resources/same-area/${resourceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Errore durante il caricamento delle risorse");
      }
      const data = await response.json();

      // Preimpostare lo stato degli Switch basandosi su eventData
      const initialResourcesState = {}; // Usa un oggetto per mappare gli ID delle risorse
      data.forEach((resource) => {
        initialResourcesState[resource.resourceId] =
          String(resource.resourceId) === eventData.resourceId.replace("resource", ""); // Lo switch legato a eventData deve essere sempre `true`
      });

      form.setFieldsValue({
        resources: initialResourcesState, // Imposta lo stato iniziale delle risorse come oggetto
        areaId: data[0]?.areaInfo?.areaId, // Imposta l'areaId, se esistente
      });

      // Salva le risorse nel tuo stato locale per aggiornamenti successivi
      setResources(data);

    } catch (error) {
      console.error("Errore nel caricamento delle risorse:", error);
    }
  },[eventData.resourceId, form]);

  // Effetto per caricare le risorse all'avvio del componente
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleToggleAll = (checked) => {
    setToggleAll(checked); // Aggiorna lo stato globale

    // Usa un oggetto per costruire i valori delle risorse
    const updatedStates = resources.reduce((acc, resource) => {
      const isDisabled = String(resource.resourceId) === eventData.resourceId.replace("resource", "");
      acc[resource.resourceId] = isDisabled ? true : checked; // Assegna come oggetto { resourceId: value }
      return acc;
    }, {});
    console.log(updatedStates)
    form.setFieldsValue({ resources: updatedStates }); // Aggiorna i valori del form
    console.log(resources)
  };


  // Gestione del submit del form
  const onFinish = async (values) => {
    const { title, dateRange, areaId, resources } = values; // Ottieni i valori dal form
    const [startDate, endDate] = dateRange;
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const decoded = jwtDecode(token); // Decodifica il token
    const data = {
      title,
      startDate: startDate.format("YYYY-MM-DD HH:mm"),
      endDate: endDate.format("YYYY-MM-DD HH:mm"),
      areaId: areaId,
      username: decoded?.sub,
      resources, // Stato degli Switch per ogni risorsa
    };
    const trueIndexes = data.resources.reduce((acc, value, index) => {
      if (value === true) {
        acc.push(index);  // Aggiunge l'indice se il valore è `true`
      }
      return acc;
    }, []);
    data.resources = trueIndexes

    try{
        const response = await fetch('http://localhost:8080/BookingRooms/api/v1/save/reservation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
             console.log('Prenotazione salvata con successo');
                           notification.success({
                                               message: "Prenotazione salvata",
                                               description: "Prenotazione salvata.",
                                             });
                            navigate('/booknow'); // Torna alla dashboard dopo il salvataggio
            }else{
                notification.error({
                                        message: "Errore nel salvataggio della prenotazione",
                                        description: "Impossibile salvare la prenotazione.",
                                      });

            }
        } catch (error) {
              notification.error({
                message: "Errore di rete",
                description: "Problema di comunicazione con il server. Riprova più tardi.",
              });
              this.setState({ loading: false, error });
            }

    };

  // Funzione "Annulla"
  const handleCancel = () => {
    form.resetFields(); // Resetta i campi
    navigate("/dashboard");
  };

  return (
    <AntdApp>
      <h1 style={{ textAlign: "center", marginBottom: "50px" }}>Reservation Form</h1>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          dateRange: [
            dayjs(eventData?.start),
            dayjs(eventData?.end),
          ],
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
          <DatePicker.RangePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            placeholder={["Inizio", "Fine"]}
            disabled
          />
        </Form.Item>

        {/* Titolo per la sezione delle risorse */}
        <h3 style={{ marginTop: "50px", marginBottom: "20px" }}>
          Selezione delle Risorse
        </h3>
        {/* Campo nascosto per areaId */}
        <Form.Item name="areaId" style={{ display: "none" }} initialValue={areaId}>
          <Input type="hidden" />
        </Form.Item>
        {/* Switch generale per abilitare/disabilitare tutti gli Switch */}
        <Form.Item label="Seleziona/Deseleziona tutti">
            <Switch
                checked={toggleAll}
                onChange={handleToggleAll} // Cambia tutti gli switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
            />
        </Form.Item>
        {/* Switch per ogni risorsa */}
        {resources.map((resource) => (
          <Form.Item
            key={resource.resourceId}
            name={["resources", resource.resourceId]} // Nome per mantenere la struttura { id: true/false }
            label={resource.name}
            valuePropName="checked" // Permette il binding booleano con lo Switch
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              disabled={
                String(resource.resourceId) === eventData.resourceId.replace("resource", "")
              }
            />
          </Form.Item>
        ))}

        {/* Bottoni */}
        <Form.Item style={{ marginTop: "50px" }}>
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

export default EventFormFiltered;