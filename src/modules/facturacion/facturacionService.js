import axios from 'axios'
const BASE = 'https://localhost:44352'

// Facturas
export const getFacturas            = ()          => axios.get(`${BASE}/Factura/get-all`)
export const getFacturaById         = (id)        => axios.get(`${BASE}/Factura/get-by-id/${id}`)
export const getFacturasByPropiedad = (id)        => axios.get(`${BASE}/Factura/get-by-propiedad/${id}`)
export const createFactura          = (data)      => axios.post(`${BASE}/Factura/create`, data)
export const updateFactura          = (data)      => axios.put(`${BASE}/Factura/update`, data)   // id en body
export const deleteFactura          = (id)        => axios.delete(`${BASE}/Factura/delete/${id}`)

// Detalle de Factura
export const getDetalles          = ()         => axios.get(`${BASE}/DetalleFactura/get-all`)
export const getDetalleById       = (id)       => axios.get(`${BASE}/DetalleFactura/get-by-id/${id}`)
export const getDetallesByFactura = (id)       => axios.get(`${BASE}/DetalleFactura/get-by-factura/${id}`)
export const createDetalle        = (data)     => axios.post(`${BASE}/DetalleFactura/create`, data)
export const updateDetalle        = (data)     => axios.put(`${BASE}/DetalleFactura/update`, data)   // id en body
export const deleteDetalle        = (id)       => axios.delete(`${BASE}/DetalleFactura/delete/${id}`)
