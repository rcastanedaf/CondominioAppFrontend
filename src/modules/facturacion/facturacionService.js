import axios from 'axios'

const API_URL = 'https://localhost:44352' // ajusta al puerto de tu backend

// ── Facturas (encabezados) ──────────────────────────────────────
export const getFacturas     = ()        => axios.get(`${API_URL}/Factura/get-all-factura`).then(r => r.data.data ?? r.data)
export const createFactura   = (data) => axios.post(`${API_URL}/Factura/create-factura`, data).then(r => r.data)
export const updateFactura   = (id, p)   => axios.put(`${API_URL}/Factura/update-factura/${id}`, p).then(r => r.data)
export const deleteFactura   = (id)      => axios.delete(`${API_URL}/Factura/delete-factura/${id}`).then(r => r.data)

// ── Detalle de factura (posiciones) ────────────────────────────
export const getDetalleByFactura = (facturaId) =>
  axios.get(`${BASE}/DetalleFactura/factura/${facturaId}`).then(r => r.data.data ?? r.data)
export const createDetalle   = (data) => axios.post(`${API_URL}/DetalleFactura/create-detalle-factura`, data).then(r => r.data)
export const updateDetalle   = (id, p)   => axios.put(`${API_URL}/DetalleFactura/update-detalle-factura/${id}`, p).then(r => r.data)
export const deleteDetalle   = (id)      => axios.delete(`${API_URL}/DetalleFactura/delete-detalle-factura/${id}`).then(r => r.data)