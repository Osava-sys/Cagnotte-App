import React from 'react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning', // 'warning', 'danger', 'info'
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          ),
          iconBg: '#fdeaea',
          confirmBg: '#e74c3c',
          confirmHover: '#c0392b'
        };
      case 'warning':
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ),
          iconBg: '#fef9e7',
          confirmBg: '#f39c12',
          confirmHover: '#d68910'
        };
      default:
        return {
          icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          ),
          iconBg: '#eaf2f8',
          confirmBg: '#3498db',
          confirmHover: '#2980b9'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-icon" style={{ backgroundColor: styles.iconBg }}>
          {styles.icon}
        </div>

        <h3 className="confirm-modal-title">{title}</h3>

        <div className="confirm-modal-message">
          {typeof message === 'string' ? (
            message.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))
          ) : message}
        </div>

        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="confirm-modal-btn confirm"
            onClick={onConfirm}
            disabled={loading}
            style={{
              backgroundColor: styles.confirmBg,
              '--hover-bg': styles.confirmHover
            }}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Traitement...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .confirm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .confirm-modal {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .confirm-modal-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .confirm-modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #1a1a2e);
          margin: 0 0 1rem 0;
        }

        .confirm-modal-message {
          color: var(--text-secondary, #64748b);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .confirm-modal-message p {
          margin: 0 0 0.5rem 0;
        }

        .confirm-modal-message p:last-child {
          margin-bottom: 0;
        }

        .confirm-modal-message strong {
          color: var(--text-primary, #1a1a2e);
          font-weight: 600;
        }

        .confirm-modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .confirm-modal-btn {
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          min-width: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .confirm-modal-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .confirm-modal-btn.cancel {
          background: #f1f5f9;
          color: var(--text-secondary, #64748b);
        }

        .confirm-modal-btn.cancel:hover:not(:disabled) {
          background: #e2e8f0;
          color: var(--text-primary, #1a1a2e);
        }

        .confirm-modal-btn.confirm {
          color: white;
        }

        .confirm-modal-btn.confirm:hover:not(:disabled) {
          background: var(--hover-bg) !important;
          transform: translateY(-1px);
        }

        .confirm-modal-btn .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .confirm-modal {
            padding: 1.5rem;
          }

          .confirm-modal-icon {
            width: 64px;
            height: 64px;
          }

          .confirm-modal-icon svg {
            width: 36px;
            height: 36px;
          }

          .confirm-modal-title {
            font-size: 1.25rem;
          }

          .confirm-modal-message {
            font-size: 0.95rem;
          }

          .confirm-modal-actions {
            flex-direction: column-reverse;
          }

          .confirm-modal-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
