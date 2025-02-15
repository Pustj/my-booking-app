import React from 'react';
import { Button, Form, Input, Space, notification, App as AntdApp } from 'antd';
import RoleSelector from './RoleSelector'
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
const UserForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, isEditing } = location.state || {};
  const [form] = Form.useForm();

// Pre-popolazione dei campi del form al caricamento
  React.useEffect(() => {
      if (isEditing && userData) {
      console.log(userData);
        form.setFieldsValue({
          id: userData.userId,
          username: userData.username,
          email: userData.email,
          role: userData.role?.roleId,
        });
      }
    }, [userData, isEditing, form]);



  const onFinish = async (values) => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

       if (isEditing) {
           const payload = {
                           id:userData.userId,
                           username: values.username,
                           email: values.email,
                           role: values.role,
                         };
           try {
                  const response = await fetch('http://localhost:8080/BookingRooms/api/v1/save/user', {
                                method: 'POST',
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                              });


                   if (response.ok) {
                    notification.success({
                                     message: 'Utente salvato!',
                                     description: "L'utente è stato salvato con successo",
                                     placement: 'bottomRight',
                                   });

                    navigate("/users");

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
              username: values.username,
              email: values.email,
              role: values.role,
              password: values.password,
            };

          try {
            const response = await fetch('http://localhost:8080/BookingRooms/api/v1/save/user', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });


            if (response.ok) {
             notification.success({
                              message: 'Utente creato!',
                              description: 'Il nuovo utente è stato creato con successo',
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


    <h1 style={{ textAlign: "center", marginBottom: "50px" }}>User Registration Form</h1>


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
              name="username"
              label="Username"
              rules={[
                {
                  required: true,
                }
              ]}
       >
        <Input />
       </Form.Item>
       <Form.Item
               name="email"
               label="Email"
               rules={[
                 {
                     required: true,
                 },
                 {
                     type: "email",
                     message: "Enter a valid email",
                 }
               ]}
       >
        <Input />
       </Form.Item>
      <Form.Item
        name="role"
        label="Ruolo"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <RoleSelector />

      </Form.Item>
      {!isEditing && (
              <>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: "Inserisci la password" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Conferma Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Conferma la password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Le password non corrispondono"));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}


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
export default UserForm;