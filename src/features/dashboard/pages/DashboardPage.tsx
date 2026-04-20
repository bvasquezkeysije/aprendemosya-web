import { useState } from "react";
import "../styles/dashboard-page.css";

const navigationItems = [
  { label: "Inicio" },
  { label: "Examenes" },
  { label: "Cursos" },
  { label: "Horario" },
];

export function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "is-open" : "is-collapsed"}`}
      >
        <div
          className={`dashboard-sidebar__toggle-row ${
            sidebarOpen ? "align-end" : "align-center"
          }`}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="dashboard-sidebar__toggle"
            aria-label={sidebarOpen ? "Cerrar panel lateral" : "Abrir panel lateral"}
          >
            {sidebarOpen ? "X" : "="}
          </button>
        </div>

        <div className="dashboard-sidebar__profile">
          <div className={`dashboard-avatar ${sidebarOpen ? "is-large" : "is-small"}`}>JR</div>
          {sidebarOpen && (
            <>
              <span className="dashboard-sidebar__name">Juan Rodriguez</span>
              <span className="dashboard-sidebar__badge">Administrador</span>
            </>
          )}
        </div>

        <nav className="dashboard-sidebar__nav">
          {navigationItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`dashboard-sidebar__nav-item ${
                sidebarOpen ? "is-open" : "is-collapsed"
              }`}
            >
              <span className="dashboard-sidebar__nav-icon" aria-hidden="true" />
              {sidebarOpen && <span className="dashboard-sidebar__nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          <button
            type="button"
            className={`dashboard-sidebar__nav-item ${
              sidebarOpen ? "is-open" : "is-collapsed"
            }`}
          >
            <span className="dashboard-sidebar__nav-icon" aria-hidden="true" />
            {sidebarOpen && (
              <span className="dashboard-sidebar__nav-label">Configuracion</span>
            )}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <span className="dashboard-topbar__title">Inicio</span>

          <div className="dashboard-topbar__actions">
            <button type="button" className="dashboard-topbar__icon-button" aria-label="Notificaciones">
              <span className="dashboard-topbar__icon-dot" />
            </button>

            <button
              type="button"
              className="dashboard-topbar__avatar-button"
              onClick={() => setDropdownOpen((value) => !value)}
              aria-label="Abrir menu de usuario"
            >
              JR
            </button>
          </div>

          {dropdownOpen && (
            <div className="dashboard-dropdown">
              <div className="dashboard-dropdown__header">
                <div className="dashboard-avatar is-medium">JR</div>
                <div className="dashboard-dropdown__identity">
                  <p className="dashboard-dropdown__name">Juan Rodriguez</p>
                  <p className="dashboard-dropdown__user">@juan_rodriguez</p>
                  <button type="button" className="dashboard-dropdown__link">
                    Ver perfil
                  </button>
                </div>
              </div>

              <div className="dashboard-dropdown__actions">
                <button type="button" className="dashboard-dropdown__action">
                  <span className="dashboard-dropdown__action-icon" aria-hidden="true" />
                  Mi cuenta
                </button>
                <button type="button" className="dashboard-dropdown__action">
                  <span className="dashboard-dropdown__action-icon" aria-hidden="true" />
                  Cambiar cuenta
                </button>
                <div className="dashboard-dropdown__divider" />
                <button type="button" className="dashboard-dropdown__action">
                  <span className="dashboard-dropdown__action-icon" aria-hidden="true" />
                  Cerrar sesion
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="dashboard-content"></main>
      </div>
    </div>
  );
}
