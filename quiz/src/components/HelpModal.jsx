import React, { useEffect, useRef } from 'react';
import './HelpModal.css';

/**
 * Reusable help modal for explaining export/import functionality.
 * Traps focus inside the modal for accessibility.
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function HelpModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus trap and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Trap focus inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="help-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Ayuda sobre exportar e importar"
    >
      <div className="help-modal" ref={modalRef}>
        <button
          className="help-modal-close"
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Cerrar"
        >
          &times;
        </button>

        <h2 className="help-modal-title">Exportar e Importar tu Progreso</h2>

        <div className="help-modal-body">
          <p>
            <strong>Exportar</strong> guarda todo tu progreso (estadisticas,
            marcadores, rachas) en un archivo en tu dispositivo.
          </p>

          <p>
            <strong>Importar</strong> carga un archivo guardado previamente.
            Esto <strong>reemplaza</strong> tu progreso actual.
          </p>

          <p className="help-modal-tip">
            Consejo: Exporta regularmente para no perder tu progreso si cambias
            de navegador o dispositivo.
          </p>
        </div>

        <button className="help-modal-action" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}
