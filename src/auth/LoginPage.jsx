import { useState } from 'react'
import { login, saveUser } from './authService'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Usuario y contraseña son requeridos')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await login({ username, password })
      saveUser(res.data)
      onLogin(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ minWidth: 360 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-building fs-1 text-primary" />
            <h4 className="fw-bold mt-2 mb-0">Condominio</h4>
            <p className="text-muted small">Sistema de Administración</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">
              <i className="bi bi-exclamation-circle me-1" />{error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold">Usuario</label>
            <input
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Ingresa tu usuario"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button
            className="btn btn-primary w-100"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Ingresando...</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Ingresar</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}