type AuthAlertDialogProps = {
  message: string;
  onClose: () => void;
};

export function AuthAlertDialog({ message, onClose }: AuthAlertDialogProps) {
  return (
    <div className="auth-alert-dialog" role="alertdialog" aria-modal="true" aria-live="assertive">
      <div className="auth-alert-dialog__backdrop" onClick={onClose} aria-hidden="true" />

      <div className="auth-alert-dialog__panel">
        <div className="auth-alert-dialog__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8V12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M12 16H12.01"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M10.3 4.8L3.9 16C3.1 17.4 4.1 19 5.7 19H18.3C19.9 19 20.9 17.4 20.1 16L13.7 4.8C12.9 3.4 11.1 3.4 10.3 4.8Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="auth-alert-dialog__content">
          <p className="auth-alert-dialog__title">Error de inicio de sesion</p>
          <p className="auth-alert-dialog__message">{message}</p>
        </div>

        <div className="auth-alert-dialog__actions">
          <button type="button" className="auth-alert-dialog__button" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
