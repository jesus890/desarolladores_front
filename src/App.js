import React, { memo, useState, useEffect } from "react";
import {
  Grid, styled, Button, Alert, AlertTitle, Snackbar, Stack, Typography,
  Table, TableBody, TableContainer, TableFooter, TableHead, TableRow,
  TablePagination, Paper, Card, CardContent, Box, Modal,  TextField, FormControl, FormGroup
} from "@mui/material";
import { Controller, useForm } from 'react-hook-form';
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import DesarrolladorService from "./app/services/DesarrolladorService";
import TablePaginationActions from "./app/main/utils/TablePaginationActions";
import FadeLoader from "react-spinners/FadeLoader";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './App.css';


function App() {

  //estilos
  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "black",
      color: "white",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  //listado de desarrolladores
  const [listDesarrolladores, setDesarrolladores] = useState([]);

  //paginacion
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(-1);

  //spinner
  const [loading, setLoading] = useState(true);

  //alertas
  const [alertVisible, setAlertVisible] = useState(false);

  //modal
  const [showModal, setShowModal] = useState(false);

  //state error de  API
  const [showError, setShowError] = React.useState({
    open: false,
    message: ''
  });

  //datos del desarrollador
  const defaultValues = {
    id: '',
    nombre: '',
    edad: '',
    habilidades: ''
  };

  // Definir el esquema de validación
  const schema = yup.object().shape({
    nombre: yup
      .string() 
      .required("El nombre es requerido") 
      .min(2, "Mínimo 2 caracteres"), 

    edad: yup
      .number()
      .typeError('Solo se permiten valores numéricos'),

    habilidades: yup.string()
      .required("Las habilidades son requeridas")
      .min(2, "Mínimo 2 caracteres"),
  });


  //react-forms-hooks
  const {
    register, unregister, control, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });


  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listDesarrolladores.length) : 0;

  //muestra el listado
  useEffect(() => {
    getData();
  }, [])

  // si ocurre una inserccion, actualizacion, eliminacion, actualiza el listado
  useEffect(() => {
    if (alertVisible === true) {
      setTimeout(() => { setAlertVisible(false); }, 3000);

      //return data updated
      getData();
    }
  }, [alertVisible]);


  //llena el listado consultando la api
  const getData = async () => {
    try {
      const request = await DesarrolladorService.obtenerDesarrolladores();
      setDesarrolladores(request);
      setLoading(false);
    }
    catch (ex) {
      console.log(ex);
      setShowError({ open: true, message: ex.message })
    }
  }

  //paginacion
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  //alerta sucess
  function ShowAlert() {
    return (
      <div className="alignToLeft">
        <Alert severity="success" sx={{ marginTop: "10px", marginBottom: "20px", width: "350px" }} onClose={() => setAlertVisible(false)} >
          <AlertTitle> Exitó </AlertTitle>
          <strong>  La información ha sido actualizada </strong>
        </Alert>
      </div>
    )
  }

  //cierra alerta error
  const closeSnack = () => {
    setShowError({ open: false, message: "" });
  };

  //cierra el modal
  const closeModal = () => {
    setShowModal(false);
  };


  //actualiza o inserta un desarrollador
  const onSubmit = async (data, e) => {
    try 
    {
      e.preventDefault();
      
      //si existe id actualiza
      if (data.id)  //update
      {
        const request = await DesarrolladorService.actualizarDesarrollador(data, data.id);

        //si todo salio bien
        if (request.status === 200) 
        {
          setAlertVisible(true);
        }
        else //error en la api
        {
          setShowError({ open: true, message: request.message })
        }
      } 
      else //insert
      {
        const request = await DesarrolladorService.crearDesarrollador(data);

        //si todo salio bien
        if (request.status === 201) 
        {
          setAlertVisible(true);
        }
        else //error en la api
        {
          setShowError({ open: true, message: request.message })
        }
      }

      //limpia los valores a los establecidos por defecto
      setValue("id", "");
      setValue("nombre", "");
      setValue("edad", "");
      setValue("habilidades", "");
    } 
    catch (ex) 
    {
      console.log(ex);
      setShowError({open: true, message : ex.message})
    }
  };


  //elimina el usuario seleccionado
  const onDelete = async (id, e) => {
    try 
    {
    
      const request = await DesarrolladorService.eliminarDesarollador(id);

      //si todo salio bien
      if (request.status === 200) 
      {
        setAlertVisible(true);
      }
      else //error en la api
      {
        setShowError({ open: true, message: request.message })
      }
     
      //limpia los valores a los establecidos por defecto
      setValue("id", "");
      setValue("nombre", "");
      setValue("edad", "");
      setValue("habilidades", "");

      //cierra el modal
      setShowModal(false);

      //carga el listadcd 
      getData();
    } 
    catch (ex) 
    {
      console.log(ex);
      setShowError({open: true, message : ex.message})
    }
  };



  //filas del listado
  function PrintRows({ item, index, setValue }) {

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    }));

    //selecciona la fila
    const seleccionarElemento = async (item) => {
      setValue("id", item.id);
      setValue("nombre", item.nombre);
      setValue("edad", item.edad);
      setValue("habilidades", item.habilidades);
    }

    return (
      <React.Fragment>

        <StyledTableRow>

          <TableCell component="th" scope="row" align="right" width="5%"> {index + 1} </TableCell>
          <TableCell component="th" align="center" width="20%" style={{ textAlign: "center" }}> {item.nombre} </TableCell>
          <TableCell component="th" align="center" width="20%" style={{ textAlign: "center" }}> {item.edad} </TableCell>
          <TableCell component="th" align="center" width="20%" style={{ textAlign: "center" }}> {item.habilidades} </TableCell>


          <TableCell component="th" align="center" width="15%">
            <Button
              variant="outlined"
              endIcon={<EditIcon className="icon" />}
              onClick={() => seleccionarElemento(item)}
            >
              Editar
            </Button>
          </TableCell>

          <TableCell component="th" align="center" width="15%">
            <div style={{ display: "flex" }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => { seleccionarElemento(item); setShowModal(true)} }
                endIcon={<DeleteForeverIcon className="icon" />}
              >
                Eliminar
              </Button>
            </div>
          </TableCell>


        </StyledTableRow>

      </React.Fragment>
    );
  }



  return (
    <div style={{ border: '20px solid #51888e', padding: '10px', minHeight: '94vh' }}>

      {/*Snackbar error*/}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center', }}
        open={showError.open}
        onClose={closeSnack}
        message={showError.message}
        style={{ marginBottom: "5%", zIndex: "1000" }}
      />

      {/*Spinner*/}
      <div className="spinner">
        <FadeLoader color="#202020" loading={loading} height={18} width={6} radius={2} margin={2} speedMultiplier="1" />
      </div>

      {alertVisible === true ? <ShowAlert /> : null}
      
      <Grid container spacing={2}>

        {/*Formulario*/}
        <Grid item xs={4}>
          <Card className="cardsStyle" sx={{marginTop: "50px"}}>
            <CardContent>
              <FormControl sx={{ width: "95%", maxWidth: "100%" }}>
                <FormGroup>

                  <h1>Datos</h1>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    
                    <Controller
                      name="nombre"
                      control={control}
                      defaultValue={""}
                      render={({ field }) => (
                        <>
                          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
                            Nombre
                          </Typography>

                          <TextField
                            {...field}
                            placeholder={"Escribe tu nombre"}
                            error={!!errors.nombre}
                            helperText={errors?.nombre?.message}
                            variant="outlined"
                            style={{ marginTop: "10px", width: "100%" }}
                          />
                        </>
                      )}
                    />

                    <Controller
                      name="edad"
                      control={control}
                      defaultValue={""}
                      render={({ field }) => (
                        <>
                          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
                            Edad
                          </Typography>

                          <TextField
                            {...field}
                            placeholder={"Escribe tu edad"}
                            error={!!errors.edad}
                            helperText={errors?.edad?.message}
                            variant="outlined"
                            style={{ marginTop: "10px", width: "100%" }}
                          />
                        </>
                      )}
                    />

                    <Controller
                      name="habilidades"
                      control={control}
                      defaultValue={""}
                      render={({ field }) => (
                        <>
                          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
                            habilidades
                          </Typography>

                          <TextField
                            {...field}
                            placeholder={"Escribe tus habilidades"}
                            error={!!errors.habilidades}
                            helperText={errors?.habilidades?.message}
                            variant="outlined"
                            style={{ marginTop: "10px", width: "100%" }}
                          />
                        </>
                      )}
                    />

                    <Button 
                      type="submit"
                      startIcon={<SaveIcon />} 
                      variant="outlined"
                      sx={{ width: '100%', marginTop: "10px" }}
                    >
                      Guardar
                    </Button>
                      
                  </form>
                </FormGroup>
              </FormControl>

            </CardContent>
          </Card>
        </Grid>

        {/*Listado de desarrolladores*/}
        <Grid item xs={8}>
          <h1>Lista de desarrolladores</h1>
          <TableContainer component={Paper}>
            <Table sx={{ Width: 600 }} aria-label="customized table collapsible table" >
              <TableHead sx={{ backgroundColor: 'blue' }}>
                <TableRow>
                  <StyledTableCell width="5%" align="left">  No </StyledTableCell>
                  <StyledTableCell align="right" width="20%" style={{ textAlign: "center" }}> Nombre  </StyledTableCell>
                  <StyledTableCell align="right" width="20%" style={{ textAlign: "center" }}> Edad </StyledTableCell>
                  <StyledTableCell align="left" width="20%"> Habilidades  </StyledTableCell>
                  <StyledTableCell align="right" width="15%"> Opciones </StyledTableCell>
                  <StyledTableCell align="right" width="15%">  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(rowsPerPage > 0 ? listDesarrolladores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : listDesarrolladores).map((item, index) => (
                  <PrintRows key={item._id} {...{ item, index, setValue }} />
                ))}

                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={3} />
                  </TableRow>
                )}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[3, 6, 12, { label: "Todos", value: -1 }]}
                    count={listDesarrolladores.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

        </Grid>

      </Grid>

      <Modal
        open={showModal}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
      >
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4}}
        >
          <h2>¿Deseas borrar al usuario:  {getValues("nombre")} ?</h2>

          <Button
            variant="outlined"
            color="error"
            onClick={() => onDelete(getValues("id"))}
            endIcon={<DeleteForeverIcon className="icon" />}
            sx={{ width: '100%', marginTop: "10px" }}
          >
            Eliminar
          </Button>

        </Box>
      </Modal>

    </div>
  );
}

export default App;
