import React from 'react';
import { Button, ColorPicker, Form, Input, Space,Select,  notification, App as AntdApp } from 'antd';
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
const AreaForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { areaData, isEditing } = location.state || {};
  const [form] = Form.useForm();

// Pre-popolazione dei campi del form al caricamento
  React.useEffect(() => {
  console.log(isEditing);
  console.log("TEST "+areaData);
      if (isEditing && areaData) {
        form.setFieldsValue({
          id: areaData.areaId,
          title: areaData.title,
          typeArea: areaData.typeArea,
          colorValue: areaData.colorHEX,
        });
      }
    }, [areaData, isEditing, form]);



  const onFinish = async (values) => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

       if (isEditing) {

           if(typeof(values.colorValue)==="object"){
            values.colorValue = values.colorValue.toHexString();
           }
           const payload = {
                           id: areaData.areaId,
                           title: values.title,
                           typeArea: values.typeArea,
                           colorValue: values.colorValue,
                         };
           try {
                  const response = await fetch('http://localhost:8080/BookingRooms/api/v1/save/area', {
                                method: 'POST',
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                              });


                   if (response.ok) {
                    notification.success({
                                     message: 'Zona salvata!',
                                     description: "La zona è stato salvato con successo",
                                     placement: 'bottomRight',
                                   });

                    navigate("/areas");

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
       } else {
          const payload = {
              id:null,
              title: values.title,
              typeArea: values.typeArea,
              colorValue: values.colorValue.toHexString(),
            };
          try {
            const response = await fetch('http://localhost:8080/BookingRooms/api/v1/save/area', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });


            if (response.ok) {
             notification.success({
                              message: 'Zona creata!',
                              description: 'La nuova zona è stata creata con successo',
                              placement: 'bottomRight',
                            });
             form.resetFields();


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
      }
};


  return (
    <AntdApp>


    <h1 style={{ textAlign: "center", marginBottom: "50px" }}>{isEditing ? "Area Update Form" : "Area Creation Form"}</h1>


    <Form
      {...layout}
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      style={{
        maxWidth: 450,
        marginLeft: 100,
      }}>

      <Form.Item
              name="title"
              label="Nome Zona"
              rules={[
                {
                  required: true,
                }
              ]}
       >
        <Input />
       </Form.Item>

      <Form.Item
        name="colorValue"
        label="Colore zona"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <ColorPicker  showText />

      </Form.Item>
      <Form.Item
        name="typeArea"
        label="Tipo zona"
        rules={[
          {
            required: true,
          },
        ]}
      >
       <Select
             defaultValue="-"
             style={{ width: 120 }}
             options={[
               { value: 'MASSAGGIO', label: 'Massaggio' },
               { value: 'PILATES', label: 'Pilates' },
             ]}
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
export default AreaForm;