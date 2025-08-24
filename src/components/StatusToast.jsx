import React, { useEffect } from 'react';

function StatusToast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`status-toast status-toast--${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="status-toast__close" aria-label="Close">
        ×
      </button>
    </div>
  );
}

export default StatusToast;
