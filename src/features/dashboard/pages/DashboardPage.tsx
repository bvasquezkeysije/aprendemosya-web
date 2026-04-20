import { useState } from "react";
import type { ReactNode } from "react";
import {
  getDisplayName,
  getUserInitials,
  type AuthUserProfile,
} from "../../auth/utils/auth-session";
import "../styles/dashboard-page.css";

const navigationItems = [
  { label: "Inicio", icon: "home" },
  { label: "Examenes", icon: "clipboard" },
  { label: "Cursos", icon: "book" },
  { label: "Horario", icon: "calendar" },
];

const notificationItems = [
  {
    title: "Nuevo intento registrado",
    description: "Se registro actividad reciente en Examenes.",
    time: "Hace 2 min",
  },
  {
    title: "Curso actualizado",
    description: "Hay cambios pendientes por revisar en Cursos.",
    time: "Hace 18 min",
  },
  {
    title: "Recordatorio",
    description: "Tienes eventos proximos en Horario.",
    time: "Hoy",
  },
];

type IconName =
  | "home"
  | "clipboard"
  | "book"
  | "calendar"
  | "settings"
  | "bell"
  | "user"
  | "switch"
  | "logout"
  | "close"
  | "menu";

function DashboardIcon({ name }: { name: IconName }) {
  const icons: Record<IconName, ReactNode> = {
    home: (
      <path
        d="M4 10.5L12 4L20 10.5V19A1 1 0 0 1 19 20H5A1 1 0 0 1 4 19V10.5Z M9 20V13H15V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    clipboard: (
      <>
        <path
          d="M9 4H15L16 6H18A2 2 0 0 1 20 8V18A2 2 0 0 1 18 20H6A2 2 0 0 1 4 18V8A2 2 0 0 1 6 6H8L9 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 11H16M8 15H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    book: (
      <>
        <path
          d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19V18.5A2.5 2.5 0 0 0 16.5 16H6V5.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 16V18A2 2 0 0 0 8 20H19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    calendar: (
      <>
        <path
          d="M7 3V6M17 3V6M4 9H20M6 5H18A2 2 0 0 1 20 7V18A2 2 0 0 1 18 20H6A2 2 0 0 1 4 18V7A2 2 0 0 1 6 5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 13H8.01M12 13H12.01M16 13H16.01M8 17H8.01M12 17H12.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    settings: (
      <>
        <path
          d="M12 8.75A3.25 3.25 0 1 0 12 15.25A3.25 3.25 0 1 0 12 8.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 3.5V5.25M12 18.75V20.5M20.5 12H18.75M5.25 12H3.5M17.66 6.34L16.42 7.58M7.58 16.42L6.34 17.66M17.66 17.66L16.42 16.42M7.58 7.58L6.34 6.34"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),
    bell: (
      <>
        <path
          d="M6.8 9.5A5.2 5.2 0 1 1 17.2 9.5C17.2 12.8 18.4 14.1 19 14.8C19.2 15 19.1 15.4 18.8 15.4H5.2C4.9 15.4 4.8 15 5 14.8C5.6 14.1 6.8 12.8 6.8 9.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 18C10.4 18.6 11.1 19 12 19C12.9 19 13.6 18.6 14 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    user: (
      <>
        <path d="M12 12A3.5 3.5 0 1 0 12 5A3.5 3.5 0 1 0 12 12Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 19A7 7 0 0 1 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    switch: (
      <>
        <path d="M15 6H20V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 18H4V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 6L13 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 18L11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    logout: (
      <>
        <path d="M9 20H6A2 2 0 0 1 4 18V6A2 2 0 0 1 6 4H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 16L20 12L15 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 12H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    close: (
      <>
        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    menu: (
      <>
        <path d="M5 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 17H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

type DashboardPageProps = {
  user: AuthUserProfile;
  onLogout?: () => void;
};

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userInitials = getUserInitials(user);
  const displayName = getDisplayName(user);
  const roleLabel = user.role === "ADMIN" ? "Administrador" : user.role;

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
            <DashboardIcon name={sidebarOpen ? "close" : "menu"} />
          </button>
        </div>

          <div className="dashboard-sidebar__profile">
          <div className={`dashboard-avatar ${sidebarOpen ? "is-large" : "is-small"}`}>{userInitials}</div>
          {sidebarOpen && (
            <>
              <span className="dashboard-sidebar__name">{displayName}</span>
              <span className="dashboard-sidebar__badge">{roleLabel}</span>
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
              <span className="dashboard-sidebar__nav-icon" aria-hidden="true">
                <DashboardIcon name={item.icon as IconName} />
              </span>
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
            <span className="dashboard-sidebar__nav-icon" aria-hidden="true">
              <DashboardIcon name="settings" />
            </span>
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
            <button
              type="button"
              className="dashboard-topbar__icon-button"
              aria-label="Notificaciones"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <DashboardIcon name="bell" />
              <span className="dashboard-topbar__icon-dot" />
            </button>

            <button
              type="button"
              className="dashboard-topbar__avatar-button"
              onClick={() => setDropdownOpen((value) => !value)}
              aria-label="Abrir menu de usuario"
            >
              {userInitials}
            </button>
          </div>

          {notificationsOpen && (
            <div className="dashboard-notifications">
              <div className="dashboard-notifications__header">
                <div>
                  <p className="dashboard-notifications__title">Notificaciones</p>
                  <p className="dashboard-notifications__subtitle">Actividad reciente</p>
                </div>
                <button type="button" className="dashboard-notifications__link">
                  Ver todo
                </button>
              </div>

              <div className="dashboard-notifications__list">
                {notificationItems.map((item) => (
                  <button key={item.title} type="button" className="dashboard-notifications__item">
                    <span className="dashboard-notifications__item-icon" aria-hidden="true">
                      <DashboardIcon name="bell" />
                    </span>
                    <span className="dashboard-notifications__item-content">
                      <span className="dashboard-notifications__item-title">{item.title}</span>
                      <span className="dashboard-notifications__item-description">{item.description}</span>
                      <span className="dashboard-notifications__item-time">{item.time}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {dropdownOpen && (
            <div className="dashboard-dropdown">
              <div className="dashboard-dropdown__header">
                <div className="dashboard-avatar is-medium">{userInitials}</div>
                <div className="dashboard-dropdown__identity">
                  <p className="dashboard-dropdown__name">{displayName}</p>
                  <p className="dashboard-dropdown__user">{user.email}</p>
                  <button type="button" className="dashboard-dropdown__link">
                    Ver perfil
                  </button>
                </div>
              </div>

              <div className="dashboard-dropdown__actions">
                <button type="button" className="dashboard-dropdown__action">
                  <span className="dashboard-dropdown__action-icon" aria-hidden="true">
                    <DashboardIcon name="user" />
                  </span>
                  Mi cuenta
                </button>
                <button type="button" className="dashboard-dropdown__action">
                  <span className="dashboard-dropdown__action-icon" aria-hidden="true">
                    <DashboardIcon name="switch" />
                  </span>
                  Cambiar cuenta
                </button>
                <div className="dashboard-dropdown__divider" />
                <button
                  type="button"
                  className="dashboard-dropdown__action"
                  onClick={onLogout}
                >
                  <span className="dashboard-dropdown__action-icon" aria-hidden="true">
                    <DashboardIcon name="logout" />
                  </span>
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
