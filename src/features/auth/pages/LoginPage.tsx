import { useState } from "react";
import { AprendemosYaLogo } from "../components/AprendemosYaLogo";
import { LeftPanel } from "../components/LeftPanel";
import "../styles/login-page.css";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="login-layout">
      <section className="login-panel left-panel" aria-label="Panel izquierdo">
        <div className="left-panel-content">
          <LeftPanel />
        </div>
      </section>

      <section className="login-panel right-panel" aria-label="Panel derecho">
        <div className="login-form">
          <div className="login-logo-shell">
            <AprendemosYaLogo />
          </div>

          <h1 className="login-title">INICIAR SESIÓN</h1>
          <p className="login-subtitle">Accede con tu usuario o correo para continuar</p>

          <div className="field-group">
            <label htmlFor="login">USUARIO O EMAIL</label>
            <input id="login" type="text" placeholder="Ingresa tu usuario o email" />
          </div>

          <div className="field-group">
            <label htmlFor="password">CONTRASEÑA</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.6 10.7C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.3 13.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.4 5.3C10.2 5.1 11.1 5 12 5C16.5 5 20 8 21 12C20.7 13.2 20.1 14.3 19.3 15.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.7 6.7C4.6 7.8 3.3 9.6 3 12C4 16 7.5 19 12 19C13.8 19 15.4 18.5 16.8 17.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 12C4 8 7.5 5 12 5C16.5 5 20 8 21 12C20 16 16.5 19 12 19C7.5 19 4 16 3 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <button type="button">Olvidaste tu contrasena?</button>
          </div>

          <div className="login-actions">
            <button type="button">
              <span className="button-content">
                <span className="button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3L4 7V11C4 16 7.4 20.7 12 22C16.6 20.7 20 16 20 11V7L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 12L11.2 13.7L14.8 10.3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Iniciar sesión</span>
              </span>
            </button>

            <div className="secondary-actions">
              <button type="button">
                <span className="button-content">
                  <span className="button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>Registrarse</span>
                </span>
              </button>

              <button type="button">
                <span className="button-content">
                  <span className="button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4V14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 10L12 14L16 10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 19H19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>Descargar APK</span>
                </span>
              </button>
            </div>

            <button type="button">
              <span className="button-content">
                <span className="button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.5 12.2C20.5 11.5 20.4 10.9 20.2 10.3H12V13.7H16.7C16.5 14.8 15.8 15.8 14.8 16.4V18.6H17.7C19.4 17 20.5 14.8 20.5 12.2Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 20.5C14.3 20.5 16.2 19.7 17.7 18.6L14.8 16.4C14 16.9 13.1 17.2 12 17.2C9.8 17.2 7.9 15.7 7.2 13.7H4.2V16C5.6 18.7 8.6 20.5 12 20.5Z"
                      fill="#34A853"
                    />
                    <path
                      d="M7.2 13.7C7 13.2 6.9 12.6 6.9 12C6.9 11.4 7 10.8 7.2 10.3V8H4.2C3.7 9.2 3.5 10.6 3.5 12C3.5 13.4 3.7 14.8 4.2 16L7.2 13.7Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 6.8C13.2 6.8 14.2 7.2 15 7.9L17.8 5.1C16.2 3.7 14.2 3 12 3C8.6 3 5.6 4.9 4.2 8L7.2 10.3C7.9 8.3 9.8 6.8 12 6.8Z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                <span>Iniciar sesión con Google</span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
