import axios from "axios";

const API_URL = "https://localhost:44352/Banco";

export const getBancos = async () => {
    return await axios.get(`${API_URL}/get-all-banco`);
};

export const getBancoId = async () => {
    return await axios.get(`${API_URL}/get-id-banco`);
};

export const getBancoNombre = async () => {
    return await axios.get(`${API_URL}/get-nombre-banco`);
};

export const createBanco = async (data) => {
    return await axios.post(`${API_URL}/create-banco`, data);
};

export const updateBanco = async (id, data) => {
    return await axios.put(`${API_URL}/update-banco/${id}`, data);
};

export const deleteBanco = async (id) => {
    return await axios.delete(`${API_URL}/detele-banco/${id}`);
};
