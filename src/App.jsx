import { useState } from 'react';
import './App.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import apiClient from '../api/api'
import PageVendedor from './components/PageVendedor'
import PageAdmin from './components/PageAdmin'

function App() {
  const [isLogged, setIsLogged] = useState({
    isLogged: false,
    correo: '',
    id: '',
    token: ''
  });

  const [correo, setCorreo] = useState('daniel@gmail.com');
  const [clave, setClave] = useState('12345678');
  const [role, setRole] = useState('');
  const [userLogged, setUserLogged] = useState(null);

  const handleLoginVendedor = async () => {
    console.log("Iniciar Sesión como vendedor");
    console.log('Correo:', correo);
    console.log('Clave:', clave);

    // Realizar la petición POST a la API
    const resp = await apiClient.post('/vendedors/login', {
      correo: correo,
      clave: clave
    })

    setUserLogged({...resp.data, role: 'VENDEDOR'});
  };

  const handleLoginAdministrador = async () => {
    console.log("Iniciar Sesión como administrador");
    console.log('Correo:', correo);
    console.log('Clave:', clave);

    // Realizar la petición POST a la API
    const resp = await apiClient.post('/administradors/login', {
      correo: correo,
      clave: clave
    })

    setUserLogged({...resp.data, role: 'ADMINISTRADOR'});
  }

  return (
    <div>
      {
        JSON.stringify(userLogged) !== 'null' && (
          userLogged.role === 'ADMINISTRADOR' ? (
            <PageAdmin role={userLogged.role} user={userLogged}  setUserLogged={setUserLogged}/>
          ) : (
            <PageVendedor role={userLogged.role} user={userLogged} setRole={setRole} setUserLogged={setUserLogged}/>
          )
        )
      }

      {
        !userLogged && (
          <div className='contenedor-login'>
            <Row>
              <Col>
                <div className="p-4 border rounded shadow-sm bg-dark text-white">
                  <h3 className="text-center mb-4">Inicio de Sesión</h3>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="nombre@ejemplo.com"
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)} // Actualiza el estado de correo
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        required
                        value={clave}
                        onChange={(e) => setClave(e.target.value)} // Actualiza el estado de clave
                      />
                    </Form.Group>

                    <div className="text-center mb-2">
                      <Button variant="outline-primary" type="submit" className="w-100" onClick={handleLoginAdministrador}>
                        Iniciar Sesión como administrador
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button variant="outline-primary" type="button" className="w-100" onClick={handleLoginVendedor}>
                        Iniciar Sesión como vendedor
                      </Button>
                    </div>
                </div>
              </Col>
            </Row>
          </div>
        )
      }

      
    </div>
  );
}

export default App;
