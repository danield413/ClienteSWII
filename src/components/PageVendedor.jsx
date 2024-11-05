import React, { useEffect, useState } from "react";
import apiClient from "../../api/api";
import { Button, Form } from "react-bootstrap"

const PageVendedor = ({ role, user, setrole, setUserLogged }) => {
  const [sucursales, setSucursales] = useState([]); // Nuevo estado para sucursales
  const [catalogo, setCatalogo] = useState([]); // Nuevo estado para el catálogo
  const [inventario, setInventario] = useState([]); // Nuevo estado para el inventario
  const [ventas, setVentas] = useState([]); // Nuevo estado para las ventas

  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

   //* formulario
   const [cedula, setCedula] = useState('1054479437')
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

  const getVentas = async (idSucursal) => {
    try {
      const response = await apiClient.get(`/sucursals/${idSucursal}/ventas`);
      console.log(response.data)
      setVentas(response.data); // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching ventas:", error);
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

      console.log(inventario)

      const response = await apiClient.get(`/inventario-catalogos`);
      const idInventario = inventario._id
      // console.log(response.data)
      const catalogoInventario = response.data.filter((item) => item.inventarioId === idInventario)

      console.log("CATALOGO", catalogoInventario)
      
      const nuevoCatalogo = []
      catalogoInventario.forEach(item => {
        console.log("ITEM", item)
        const producto = catalogo.find((prod) => prod._id === item.catalogoId)
        if (!producto) {
          return;
        }
        nuevoCatalogo.push({
          ...producto,
          catalogoId: item.catalogoId,
          inventarioId: item.inventarioId,
          cantidad: item.cantidad,
          catalogoInventarioId: item._id
        })
      })

      setInventario(nuevoCatalogo); // Almacena los datos en el estado
      console.log(nuevoCatalogo)

    } catch (error) {
      console.error("Error fetching inventario:", error);
    }
  }

  const handleAgregarProducto = (nuevoProducto) => {
    // console.log("producto", nuevoProducto)
    if(productoSeleccionado.find((item) => item._id === nuevoProducto._id)) {
      alert("Producto ya seleccionado")
      return
    }
    setProductoSeleccionado((prevProductos) => [...prevProductos, nuevoProducto]);
  };

  const getClienteNombre = async (id) => {
    const resp = await apiClient.get(`/clientes/${id}`)
    return resp.data.nombre
  }

  const handleCrearVenta = async () => {

    if(productoSeleccionado.length === 0) {
      alert("No hay productos seleccionados")
      return
    }

    if(!sucursalSeleccionada) {
      alert("Seleccione una sucursal")
      return
    }

    if(!cedula) {
      alert("Ingrese la cédula del cliente")
      return
    }



    // console.log("crear venta")
    // console.log(productoSeleccionado)
    const resp = await apiClient.get(`/clientes/cedula/${cedula}`)
    // console.log(resp.data)
    let clienteId = resp.data._id
    let obj = {
      fecha: `${new Date()}`,
      tipoVenta: "VENTA_EN_SUCURSAL",
      totalPagado: productoSeleccionado.reduce((acc, item) => acc + item.precio, 0),
      vendedorId: user._id,
      clienteId: clienteId,
      sucursalId: sucursalSeleccionada,
    }

    const response = await apiClient.post('/ventas', obj)
    console.log(response.data)
    const ventaId = response.data._id

    console.log("productos seleccionados")
    productoSeleccionado.forEach(async (producto) => {
      console.log(producto)
      let obj = {
        ventaId: ventaId,
        subTotal: producto.precio,
        cantidad: 1,
        inventarioCatalogoId: producto.catalogoInventarioId
      }
     
      try {
        console.log(obj)
        const response = await apiClient.post('/sub-ventas', obj)
        console.log(response.data)
      } catch(e) {
        console.log(e)
      }
      
    })

    alert("Venta realizada con éxito")
  }

  const handleLogout = () => {
    console.log("cerrar sesión")

    setUserLogged(null)
    setrole('')
  }
  

  useEffect(() => {
    getSucursales();
    getCatalogo();
  }, []);


  return (
    <div>
      <div className="px-4 py-2 d-flex justify-content-between">
        <div>
        <h4>Seleccione su sucursal</h4>
        <select
          className="form-select"
          style={{ width: "300px" }}
          value={sucursalSeleccionada}
          onChange={(e) => {
            setSucursalSeleccionada(e.target.value)
            // getInventario(e.target.value)
            getCatalogoInventario(e.target.value)
            getVentas(e.target.value)

            setProductoSeleccionado([])
            setInventario([])
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
        <div>
          <Button variant="success mx-2" size="sm" style={{marginTop: '20px'}}
            onClick={handleLogout}
          >Cerrar sesión</Button>
        </div>
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
              >Agregar</Button>
            </div>
          ))}
          <p className="my-2">Total: {productoSeleccionado.reduce((acc, item) => acc + item.precio, 0)}</p>
          <Button
            onClick={handleCrearVenta}
          >Realizar Venta</Button>
          
        </div>
        <div>
          <h2>Listado de ventas</h2>
          {
            ventas.map((venta) => (
              <div key={venta._id} className="venta p-4" style={{border: '2px solid gray', borderRadius: '10px', width: '500px', marginBottom: '12px'}}>
                <p>Código de venta: {venta._id}</p>
                <p>Fecha: {new Date(venta.fecha).toLocaleDateString("es-ES")}</p>
                <p>Total: {venta.totalPagado}</p>
                <Button variant="success" size="sm">Ver detalles</Button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default PageVendedor;
