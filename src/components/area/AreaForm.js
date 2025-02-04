import React from 'react';
import { Button, ColorPicker, Form, Input, InputNumber, Space, notification, App as AntdApp } from 'antd';
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
      if (isEditing && areaData) {
        form.setFieldsValue({
          id: areaData.areaId,
          name: areaData.name,
          colorValue: areaData.colorHEX,
        });
      }
    }, [areaData, isEditing, form]);



  const onFinish = async (values) => {
      const token = localStorage.getItem("authToken");

       if (isEditing) {
           if(typeof(values.colorValue)==="object"){
            values.colorValue = values.colorValue.toHexString();
           }
           const payload = {
                           id:areaData.areaId,
                           name: values.name,
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
                                     message: 'Stanza salvata!',
                                     description: "La stanza è stato salvato con successo",
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
              name: values.name,
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
                              message: 'Stanza creata!',
                              description: 'La nuova stanza è stata creata con successo',
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
              name="name"
              label="Nome stanza"
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
        label="Colore stanza"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <ColorPicker  showText />

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