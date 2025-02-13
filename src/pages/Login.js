import React from 'react';
import { Button, Checkbox, Form, Input, ConfigProvider} from 'antd';
import '../Deseo.css'


const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};
const onFinish = async (values) => {
  //console.log('Success:', values); // Visualizza i valori inseriti dall'utente

  try {
    const response = await fetch('http://localhost:8080/BookingRooms/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed! Verifica le credenziali.');
    }

    const data = await response.json();

    // Gestisci il caso di successo
    console.log('Login successful:', data);

    // Esempio: Salva il token di autenticazione
    localStorage.setItem('authToken', data.token);

    // Reindirizza l'utente alla pagina home
    window.location.href = '/dashboard';
  } catch (error) {
    // Gestisci eventuali errori
    console.error('Errore durante il login:', error.message);
    //alert('Credenziali errate o errore di connessione.');
  }
};

const Login = () => (
 <ConfigProvider
             theme={{
                 token: {
                     colorPrimary: '#D78E49',
                     colorTextBase: '#fff'
                 },
             }}
 >

     <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: '#1E0407',

          }}
     >

        <img alt="logo" src="/assets/deseo-logo-1500x430-full-transp-alt9.webp" style={{ width: '40%', height: 'auto', marginBottom: '40px' }}/>

          <Form
            name="basic"
            initialValues={{
                remember: false
              }}
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}

            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item

              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
            >
                      <Input style={{ color: '#000' }} />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                    ]}
                >
              <Input.Password style={{ color: '#000' }}

                />
            </Form.Item>

                <Form.Item name="remember" valuePropName="checked" label={null}>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
  </ConfigProvider>
);
export default Login;