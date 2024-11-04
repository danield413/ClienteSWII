import React, { useEffect, useState } from "react";
import apiClient from "../../api/api";
import { Button, Form } from "react-bootstrap"

const PageVendedor = ({ role, user }) => {
  const [sucursales, setSucursales] = useState([]); // Nuevo estado para sucursales
  const [catalogo, setCatalogo] = useState([]); // Nuevo estado para el catálogo
  const [inventario, setInventario] = useState([]); // Nuevo estado para el inventario

  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

   //* formulario
   const [cedula, setCedula] = useState('')
   const [cantidad, setCantidad] = useState(1)
   const [productoSeleccionado, setProductoSeleccionado] = useState([])

  const getSucursales = async () => {
    try {
      const response = await apiClient.get("/sucursals");
      setSucursales(response.data); // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching sucursales:", error);
    }
  };

  const getCatalogo = async () => {
    try {
      const response = await apiClient.get("/catalogos");
      setCatalogo(response.data); // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching catalogo:", error);
    }
  };


  // const getInventario = async (sucursalId) => {
  //   try {
  //     const response = await apiClient.get(`/sucursals/${sucursalId}/inventarios`);
  //     setInventario(response.data[0]); // Almacena los datos en el estado
  //   } catch (error) {
  //     console.error("Error fetching inventario:", error);
  //   }
  // }

  const getCatalogoInventario = async (sucursalId) => {
    try {

      const response1 = await apiClient.get(`/sucursals/${sucursalId}/inventarios`);
      const inventario = response1.data[0]

      const response = await apiClient.get(`/inventario-catalogos`);
      const idInventario = inventario._id
      // console.log(response.data)
      const catalogoInventario = response.data.filter((item) => item.inventarioId === idInventario)

      console.log("CATALOGO", catalogoInventario)
      
      const nuevoCatalogo = []
      catalogoInventario.forEach(item => {
        const producto = catalogo.find((prod) => prod._id === item.catalogoId)
        if (!producto) {
          return;
        }
        nuevoCatalogo.push({
          ...producto,
          catalogoId: item.catalogoId,
          inventarioId: item.inventarioId,
          cantidad: item.cantidad
        })
      })

      setInventario(nuevoCatalogo); // Almacena los datos en el estado
      console.log(nuevoCatalogo)

    } catch (error) {
      console.error("Error fetching inventario:", error);
    }
  }

  const handleAgregarProducto = (nuevoProducto) => {
    setProductoSeleccionado((prevProductos) => [...prevProductos, nuevoProducto]);
  };

  const handleCrearVenta = async () => {
    console.log("crear venta")
    console.log(productoSeleccionado)
  //   let obj = {
  //     fecha: `${new Date()}`,
  //     tipoventa: "VENTA_EN_SUCURSAL",
  //     totalPagado: productoSeleccionado.reduce((acc, item) => acc + item.precio, 0),
  //     vendedorId: user._id,
  //     clienteId: ,
  //     sucuarsalId: sucursalSeleccionada,
  //   }
  }
  

  useEffect(() => {
    getSucursales();
    getCatalogo();
  }, []);

  // console.log("sucursales", sucursales);
  // console.log("catalogo", catalogo);
  // console.log("inventario", inventario);

  console.log("productoSeleccionado", productoSeleccionado)

  return (
    <div>
      <div className="px-4">
      <h4>Seleccione su sucursal</h4>
        <select
          className="form-select"
          style={{ width: "300px" }}
          value={sucursalSeleccionada}
          onChange={(e) => {
            setSucursalSeleccionada(e.target.value)
            // getInventario(e.target.value)
            getCatalogoInventario(e.target.value)
          }} 
        >
          <option value="">Seleccione una sucursal</option>
          {sucursales.map((sucursal) => (
            <option key={sucursal._id} value={sucursal._id}>
              {sucursal.nombre}
            </option>
          ))}
        </select>
      </div>

      <hr />
      <div className="grid-ventas">
        <div className="p-4">
          <h2>Realizar una venta</h2>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Cédula</Form.Label>
            <Form.Control
              type="text"
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)} // Actualiza el estado de correo
            />
          </Form.Group>

          <h4>Productos del inventario</h4>
          {inventario.map((producto) => (
            
            <div key={producto._id} className="producto mb-2">
              <p>{producto.nombre} -  <strong>${producto.precio}</strong></p>
              <p>Cantidad seleccionada: {cantidad}</p>
              <Button variant="success" size="sm" 
                onClick={() => handleAgregarProducto(producto)}
              >agregar</Button>
            </div>
          ))}
          <p className="my-2">Total: {productoSeleccionado.reduce((acc, item) => acc + item.precio, 0)}</p>
          <Button
            onClick={handleCrearVenta}
          >Realizar Venta</Button>
          
        </div>
        <div>
          <h2>Listado de ventas</h2>
        </div>
      </div>
    </div>
  );
};

export default PageVendedor;
