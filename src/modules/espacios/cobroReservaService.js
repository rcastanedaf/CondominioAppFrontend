import axios from 'axios'
// Cobro de reservas generalmente va sobre la propia ReservaEspacio con un monto
// Si no hay controller dedicado, se gestiona actualizando la reserva con estado COBRADO
const BASE = 'https://localhost:44352/ReservaEspacio'
export const getReservasParaCobro = () =>
  axios.get(`${BASE}/get-all`).then(r => ({
    ...r,
    data: { ...r.data, data: (r.data?.data ?? []).filter(rv => rv.estado === 'CONFIRMADA') }
  }))
export const marcarCobrada = (id, data) => axios.put(`${BASE}/update/${id}`, data)