/* eslint-disable no-return-await */
import axios from "axios";

export default {

  crearDesarrollador: async (data) => {
    return await axios.post(`http://127.0.0.1:8000/api/desarrolladores/crear/`, data);
  },

  actualizarDesarrollador : async(data, id) => {
    return await axios.post(`http://127.0.0.1:8000/api/desarrolladores/actualizar/` + id, data);
  },

  obtenerDesarrolladores : async() => {
    const response = await axios.get(`http://127.0.0.1:8000/api/desarrolladores/listado`);
    const data = await response.data;
    return data;
  },

  eliminarDesarollador: async (id) => {
    const response = await axios.delete(`http://127.0.0.1:8000/api/desarrolladores/eliminar/` + id, {
    });
    const data = await response.data;
    return data;
  },

};
