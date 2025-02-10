import React from 'react';
import { Button, Form, Input, Select, Space, notification, App as AntdApp } from 'antd';
import { useLocation, useNavigate } from "react-router-dom";

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const ResourceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resourceData, isEditing } = location.state || {};
  const [form] = Form.useForm();

  // Stato per le aree
  const [areas, setAreas] = React.useState([]);

  // Recupero delle aree al caricamento del componente
  React.useEffect(() => {
    const fetchAreas = async () => {
    const token = localStorage.getItem("authToken");
      try {
        const response = await fetch('http://localhost:8080/BookingRooms/api/v1/areas', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
        if (response.ok) {
          const data = await response.json();
          const options = data.map(area => ({
            value: area.areaId,
            label: area.title,
          }));
          setAreas(options);
        } else {
          notification.error({
            message: 'Errore nel caricamento delle aree',
            description: 'Qualcosa è andato storto nel recuperare i dati delle aree.',
            placement: 'bottomRight',
          });
        }
      } catch (error) {
        notification.error({
          message: 'Errore',
          description: 'Oops! Qualcosa è andato storto durante il recupero delle aree.',
          placement: 'bottomRight',
        });
      }
    };

    fetchAreas();

    // Pre-popolazione dei campi del form
    if (isEditing && resourceData) {
      form.setFieldsValue({
        id: resourceData.resourceId,
        name: resourceData.name,
        area: resourceData.areaInfo?.areaId,
      });
      console.log(resourceData)
    }
  }, [resourceData, isEditing, form]);

  const onFinish = async (values) => {
    const token = localStorage.getItem("authToken");

    const payload = isEditing
      ? {
          id: resourceData.resourceId,
          name: values.name,
          areaId: values.area, // id dell'area selezionata
        }
      : {
          id: null,
          name: values.name,
          areaId: values.area,
        };

    try {
      const response = await fetch('http://localhost:8080/BookingRooms/api/v1/save/resource', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        notification.success({
          message: isEditing ? 'Risorsa salvata!' : 'Risorsa creata!',
          description: isEditing
            ? "La risorsa è stata salvata con successo"
            : 'La nuova risorsa è stata creata con successo',
          placement: 'bottomRight',
        });
        if (!isEditing) form.resetFields();
        navigate("/resources");
      } else {
        notification.error({
          message: 'Errore',
          description: 'Oops! Qualcosa è andato storto',
          placement: 'bottomRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Errore',
        description: 'Oops! Qualcosa è andato storto',
        placement: 'bottomRight',
      });
    }
  };

  return (
    <AntdApp>
      <h1 style={{ textAlign: "center", marginBottom: "50px" }}>
        {isEditing ? "Resource Update Form" : "Resource Creation Form"}
      </h1>

      <Form
        {...layout}
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        style={{
          maxWidth: 450,
          marginLeft: 100,
        }}
      >
        <Form.Item
          name="name"
          label="Nome risorsa"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="area"
          label="Associato all'area"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            placeholder="Seleziona un'area"
            style={{ width: '100%' }}
            options={areas} // Impostiamo le opzioni recuperate dall'API
          />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit">
              {isEditing ? "Salva" : "Crea"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </AntdApp>
  );
};

export default ResourceForm;