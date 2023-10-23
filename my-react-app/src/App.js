//import logo from './logo.svg';
import "./App.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";

//Iconos fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//Iconos material UI
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CardTravelIcon from "@mui/icons-material/CardTravel";

import {
  TextField,
  InputAdornment,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { Component } from "react";

//Url para las peticiones
const url = "https://localhost:7051/ProductAll";
const urlPost = "https://localhost:7051/Product";

class App extends Component {
  state = {
    //almacena los datos del producto
    data: [],

    modalInsertar: false,
    modalEliminar: false,
    modalInfo: false,
    modalFactura: false,

    //maneja el producto seleccionado
    selectedProduct: null,

    //Maneja los datos obtenidos de la API
    form: {
      id: "",
      name: "",
      category: "",
      description: "",
      stock: "",
      price: "",
      tipoModal: "",
    },
    //Maneja las letras introducidas en el input search
    searchTerm: "",
    error: false,
  };

  //calcula el total de todo el inventario para la ventana modalFactura
  calcularCostoTotal() {
    let costoTotal = 0;
    this.state.data.forEach((producto) => {
      costoTotal += producto.price * producto.stock;
    });
    return costoTotal;
  }

  openInfoModal = (producto) => {
    this.setState({
      selectedProduct: producto,
      modalInfo: true,
    });
  };

  closeInfoModal = () => {
    this.setState({
      selectedProduct: null,
      modalInfo: false,
    });
  };

  openFacturaModal = () => {
    this.setState({
      modalFactura: true,
    });
  };

  closeFacturaModal = () => {
    this.setState({
      modalFactura: false,
    });
  };

  peticionGet = () => {
    axios
      .get(url)
      .then((response) => {
        this.setState({ data: response.data });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };


  // Peticion POST para agregar un producto
  async peticionPost() {
    //verifica valores negativos en los input
    if (!this.validarCamposNegativos()) {
      return; // Detén la operación si hay campos negativos
    }
    // Verifica si algún campo requerido está vacío
    if (
      !this.state.form ||
      !this.state.form.name ||
      !this.state.form.category ||
      !this.state.form.stock ||
      !this.state.form.price
    ) {
      Swal.fire({
        title: "Campos incompletos",
        icon: "error",
        text: "Por favor, complete todos los campos requeridos.",
      });
      return;
    }

    // Elimina el atributo `id` del formulario, ya que la API lo generará automáticamente.
    delete this.state.form.id;
    // Convierte el formulario a un objeto JSON.
    const jsonData = JSON.stringify(this.state.form);

    // Realiza la solicitud POST a la API, enviando los datos JSON en el encabezado `Content-Type`.
    await axios
      .post(urlPost, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // Si la solicitud fue exitosa, muestra una alerta usando SweetAlert2
        Swal.fire({
          title: "Producto agregado con éxito",
          icon: "success",
          text: "El producto ha sido agregado exitosamente a la base de datos.",
        });

        // Cierra la ventana modal
        this.modalInsertar();

        // Actualiza la lista de productos
        this.peticionGet();
      })
      .catch((error) => {
        // Si la solicitud falla, muestra una alerta usando SweetAlert2
        Swal.fire({
          title: "Error al agregar el producto",
          icon: "error",
          text: error.message,
        });
      });
  }
  validarCamposNegativos = () => {
    if (this.state.form.stock < 0 || this.state.form.price <= 0) {
      Swal.fire({
        title: "No se pueden agregar valores negativos",
        icon: "error",
        text: "Asegúrate de que el stock y el precio sean números no negativos.",
      });
      return false; // Devuelve false si hay valores negativos o que el price sea 0
    }
    return true; // Devuelve true si todo está bien
  };

  obtenerProximoID = () => {
    const maxID = Math.max(...this.state.data.map((producto) => producto.id));
    return maxID + 1;
  };

  async peticionPut() {
    //valida que no haya valores negativos en el input
    if (!this.validarCamposNegativos()) {
      return; // Detén la operación si hay campos negativos
    }
    // Convierte el formulario a un objeto JSON.
    const jsonData = JSON.stringify(this.state.form);

    // Realiza la solicitud PUT a la API, enviando los datos JSON en el encabezado `Content-Type`.
    await axios
      .put(
        `https://localhost:7051/ProductStock?id=${this.state.form.id}&newStock=${this.state.form.stock}`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // Si la solicitud fue exitosa, muestra una alerta usando SweetAlert2
        if (this.state.tipoModal === "actualizar") {
          Swal.fire({
            title: "Stock del producto editado correctamente",
            icon: "success",
            text: "El stock del producto se ha editado correctamente.",
          });
        }

        // Cierra la ventana modal
        this.modalInsertar();
        // Actualiza la lista de productos
        this.peticionGet();
      })
      .catch((error) => {
        // Si la solicitud falla, muestra una alerta usando SweetAlert2
        if (this.state.tipoModal === "actualizar") {
          Swal.fire({
            title: "Ocurrió un error al actualizar el stock de tu producto",
            icon: "error",
            text: "Valor introduccido como STOCK no valido",
          });
        }
      });
  }

  peticionDelete = () => {
    axios
      .delete(`https://localhost:7051/ProductId?id=${this.state.form.id}`)
      .then((response) => {
        this.setState({ modalEliminar: false });
        this.peticionGet();
      });
  };

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  };

  seleccionarProducto = (producto) => {
    this.setState({
      tipoModal: "actualizar",
      form: {
        id: producto.id,
        name: producto.name,
        category: producto.category,
        description: producto.description,
        stock: producto.stock,
        price: producto.price,
      },
    });
  };

  getMensajeActualizacion = () => {
    if (this.state.tipoModal === "actualizar") {
      return (
        <div className="alert alert-info">Sólo se puede modificar el stock</div>
      );
    }
  };

  handleChange = async (e) => {
    e.persist();
    await this.setState({
      form: {
        //heredar todos los atributos
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });

    console.log(this.state.form);
  };

  // Método para manejar el cambio en el campo de búsqueda
  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });

    const searchTerm = e.target.value;
    this.setState({ searchTerm, error: true });

    // Filtrar los productos según el término de búsqueda
    const filteredData = this.state.data.filter(
      (producto) =>
        producto.id.toString().includes(searchTerm) ||
        producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredData.length > 0) {
      // Si se encuentran productos, establece el estado de error en falso.
      this.setState({ error: false });
    }
    this.setState({ searchTerm });
  };

  componentDidMount() {
    this.peticionGet();
  }
  render() {
    const { form, searchTerm, selectedProduct } = this.state;

    // Filtrar los productos según el término de búsqueda
    const filteredData = this.state.data.filter(
      (producto) =>
        producto.id.toString().includes(searchTerm) ||
        producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.appBarStyle = {
      backgroundColor: "darkslategray", // Cambia el color de la navBar
    };

    return (
      <div className="App">
        {/* header */}
        <AppBar position="static" sx={this.appBarStyle}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", m: 2 }}>
              <LocalGroceryStoreIcon sx={{ fontSize: 25, marginRight: 2 }} />
              <Typography variant="h7" sx={{ textAlign: "center" }}>
                CRUD ADMINISTRADOR DE PRODUCTOS
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <br />
        <Grid
          container
          spacing={2}
          sx={{ justifyContent: "center", textAlign: "center", mt: 1 }}
        >
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center" // Centrar horizontalmente
            style={{ paddingBottom: "20px" }} // Centrar verticalmente
          >
            <Grid item>
              <Button
                className="black-button btn btn-success"
                onClick={this.openFacturaModal}
              >
                <Typography
                  sx={{
                    display: "inline-block",
                    marginRight: "5px",
                    margin: "0 auto",
                  }}
                >
                  Generar Factura:
                </Typography>
                <ReceiptIcon sx={{ fontSize: 20 }} />
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  const nextID = this.obtenerProximoID();
                  this.setState({
                    form: {
                      id: nextID,
                      name: "",
                      category: "",
                      description: "",
                      stock: "",
                      price: "",
                    },
                    tipoModal: "insertar",
                    error: false,
                  });
                  this.modalInsertar();
                }}
              >
                Agregar Producto
                <AddIcon sx={{ fontSize: 20, marginRight: "5px" }} />
              </Button>
            </Grid>
          </Grid>

          <TextField
            className="search-container"
            size="small"
            id="inputGroup-sizing-sm"
            label="Buscar Producto"
            variant="outlined"
            value={searchTerm}
            onChange={this.handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            }}
            error={this.state.error}
            helperText={this.state.error ? "Producto no encontrado" : ""}
          />
        </Grid>
        <br /> <br />
        <table className="table table-responsive">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Aqui se genera la tabla */}
            {filteredData.map((producto, index) => (
              <tr
                key={producto.id}
                className={this.state.error ? "" : "fade-in"}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <td>[{producto.id}]</td>
                <td>{producto.name}</td>
                <td>{producto.description}</td>
                <td>{producto.category}</td>
                <td>[{producto.stock}]</td>
                <td>
                  ${new Intl.NumberFormat("en-EN").format(producto.price)}
                </td>
                <td>
                  <Button
                    className="black-button btn btn-success"
                    onClick={() => {
                      this.openInfoModal(producto);
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  </Button>
                  {"   "}
                  <button
                    className="btn btn-primary "
                    onClick={() => {
                      this.seleccionarProducto(producto);
                      this.modalInsertar();
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  {"  "}
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      this.seleccionarProducto(producto);
                      this.setState({ modalEliminar: true });
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Todas las ventanas modales del proyecto */}
        <Modal
          isOpen={this.state.modalInsertar}
          className="my-modal"
          style={{}}
        >
          <ModalHeader style={{ display: "block" }}>
            <p>Agrega tu producto:</p>
            {this.getMensajeActualizacion()}
          </ModalHeader>

          <ModalBody>
            <div className="form-group table-responsive ">
              <label htmlFor="id">ID:</label>
              <input
                className="form-control"
                type="text"
                name="id"
                id="id"
                readOnly
                onChange={this.handleChange}
                value={this.state.form.id}
              />
              <br />
              <label htmlFor="name">Name:</label>
              <input
                className="form-control "
                readOnly={this.state.tipoModal === "actualizar"}
                type="text"
                name="name"
                id="name"
                onChange={this.handleChange}
                value={form ? form.name : ""}
              />
              <br />
              <label htmlFor="description">Description:</label>
              <input
                className="form-control"
                readOnly={this.state.tipoModal === "actualizar"}
                type="text"
                name="description"
                id="description"
                onChange={this.handleChange}
                value={form ? form.description : ""}
              />
              <br />
              <label htmlFor="category">Category:</label>
              <input
                className="form-control"
                readOnly={this.state.tipoModal === "actualizar"}
                type="text"
                name="category"
                id="category"
                onChange={this.handleChange}
                value={form ? form.category : ""}
              />
              <br />
              <label htmlFor="stock">Stock:</label>
              <input
                className="form-control"
                type="text"
                name="stock"
                id="stock"
                onChange={this.handleChange}
                value={form ? form.stock : ""}
              />
              <br />
              <label htmlFor="price">Price:</label>
              <input
                className="form-control"
                readOnly={this.state.tipoModal === "actualizar"}
                type="text"
                name="price"
                id="price"
                onChange={this.handleChange}
                value={form ? form.price : ""}
              />
              <br />
            </div>
          </ModalBody>

          <ModalFooter>
            {this.state.tipoModal === "insertar" ? (
              <button
                className="btn btn-success"
                onClick={() => this.peticionPost()}
              >
                Insertar
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => this.peticionPut()}
              >
                Actualizar
              </button>
            )}

            <button
              className="btn btn-danger"
              onClick={() => this.modalInsertar()}
            >
              Cancelar
            </button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
            Estás seguro que deseas eliminar este Producto{" "}
            <strong>{form && form.name}</strong>
          </ModalBody>
          <ModalFooter>
            <button
              className="btn btn-danger"
              onClick={() => this.peticionDelete()}
            >
              Sí
            </button>
            <button
              className="btn btn-secundary"
              onClick={() => this.setState({ modalEliminar: false })}
            >
              No
            </button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.modalInfo} className="my-modal">
          <ModalHeader>
            <Typography variant="h6">Información del Producto:</Typography>
          </ModalHeader>
          <ModalBody>
            <Box sx={{ fontSize: 48, textAlign: "center" }}>
              <ProductionQuantityLimitsIcon sx={{ fontSize: 60 }} />
            </Box>

            {selectedProduct && (
              <div>
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
                    fontWeight: "700",
                  }}
                >
                  ID:{selectedProduct.id}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                  Nombre: {selectedProduct.name}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                  Categoría: {selectedProduct.category}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                  Descripción: {selectedProduct.description}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                  Stock: {selectedProduct.stock}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                  Precio: $
                  {new Intl.NumberFormat("en-EN").format(selectedProduct.price)}
                </Typography>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="contained"
              color="danger"
              onClick={this.closeInfoModal}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.modalFactura}>
          <ModalHeader>Factura</ModalHeader>
          <ModalBody>
            
            <Table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {this.state.data.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.name}</td>
                    <td>${producto.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.closeFacturaModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
        {/*MODAL FACTURA*/}
        <Modal isOpen={this.state.modalFactura}>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item>
              <CardTravelIcon sx={{ fontSize: 60 }} />
            </Grid>
            <Grid item>
              <ModalHeader style={{ textAlign: "center" }}>
                {" "}
                Factura:
              </ModalHeader>
            </Grid>
          </Grid>
          <ModalBody>
            
            <Table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>ID</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {this.state.data.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.name}</td>
                    <td>{producto.id}</td>
                    <td>${producto.price}</td>
                    <td>[{producto.stock}]</td>
                    <td>${producto.price * producto.stock}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p>
              Total del Inventario:{" "}
              <strong>
                $
                {new Intl.NumberFormat("en-EN").format(
                  this.calcularCostoTotal()
                )}
              </strong>{" "}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={this.closeFacturaModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default App;
