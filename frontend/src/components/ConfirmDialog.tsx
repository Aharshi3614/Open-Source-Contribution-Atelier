<<<<<<< HEAD
import React from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
=======
// Disable TypeScript checking for JSX runtime resolution in environments
// where 'react/jsx-runtime' types are not available.
// @ts-nocheck
import React from 'react';
import './ConfirmDialog.css';


interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
>>>>>>> bc685c703df5485c7825046cd4f6e440f8540f03
}

export function ConfirmDialog({
  isOpen,
<<<<<<< HEAD
  title,
  message,
  confirmText = 'Confirm',
=======
  title = 'Are you sure?',
  message,
  confirmText = 'Delete',
>>>>>>> bc685c703df5485c7825046cd4f6e440f8540f03
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
<<<<<<< HEAD
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>
=======
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button 
            className="confirm-btn cancel"
            onClick={onCancel}
          >
>>>>>>> bc685c703df5485c7825046cd4f6e440f8540f03
            {cancelText}
          </button>
          <button 
            className={`confirm-btn ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}

export default ConfirmDialog;
>>>>>>> bc685c703df5485c7825046cd4f6e440f8540f03
