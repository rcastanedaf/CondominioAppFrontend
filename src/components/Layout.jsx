import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);

    // Leer usuario desde localStorage
    const usuario = (() => {
        try {
            return JSON.parse(localStorage.getItem('usuario') ?? '{}');
        } catch {
            return {};
        }
    })();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', background: '#f4f6fb' }}>

            {/* Sidebar */}
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(p => !p)}
            />

            {/* Contenido principal */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Topbar */}
                <Topbar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(p => !p)}
                    usuario={usuario}
                />

                {/* Página activa */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '0 0 32px' }}>
                    <Outlet />
                </main>

            </div>
        </div>
    );
}