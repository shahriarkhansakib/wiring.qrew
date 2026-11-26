"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { IconName } from "@/lib/types";
import { QrewIcon } from "@/components/ui/Icons";

export type ToastType = "success" | "danger" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction | null;
  leaving?: boolean;
}

export interface ModalOptions {
  title: string;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  onClose?: () => void;
}

export interface ConfirmDialogOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  confirmClass?: string;
  confirmStyle?: React.CSSProperties;
  icon?: IconName;
  iconColor?: string;
  showDoNotAskAgain?: boolean;
  doNotAskAgainKey?: string | null;
  onConfirm?: () => void;
}

interface UiFeedbackContextValue {
  showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction | null) => void;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  confirmDialog: (options: ConfirmDialogOptions) => void;
  resetConfirmPreferences: () => void;
}

const UiFeedbackContext = createContext<UiFeedbackContextValue | null>(null);

export function UiFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<ModalOptions | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const timersRef = useRef<number[]>([]);
  const closeModalTimerRef = useRef<number | null>(null);

  const clearPendingModalClose = useCallback(() => {
    if (closeModalTimerRef.current !== null) {
      window.clearTimeout(closeModalTimerRef.current);
      closeModalTimerRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    clearPendingModalClose();
    setModalVisible(false);
    document.body.style.overflow = "";
    const t = window.setTimeout(() => {
      closeModalTimerRef.current = null;
      setModal((prev) => {
        prev?.onClose?.();
        return null;
      });
    }, 200);
    closeModalTimerRef.current = t;
    timersRef.current.push(t);
  }, [clearPendingModalClose]);

  const openModal = useCallback(
    (options: ModalOptions) => {
      clearPendingModalClose();
      setModal(options);
      setModalVisible(true);
      document.body.style.overflow = "hidden";
    },
    [clearPendingModalClose]
  );

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal, closeModal]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      document.body.style.overflow = "";
    };
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration = 3200, action: ToastAction | null = null) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, action }]);

      const fadeTimer = window.setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        const removeTimer = window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 200);
        timersRef.current.push(removeTimer);
      }, duration);
      timersRef.current.push(fadeTimer);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirmDialog = useCallback(
    ({
      title = "Confirm Action",
      message,
      confirmText = "Confirm",
      confirmClass = "btn-danger",
      confirmStyle,
      icon = "alert",
      iconColor = "var(--color-danger)",
      showDoNotAskAgain = true,
      doNotAskAgainKey = null,
      onConfirm,
    }: ConfirmDialogOptions) => {
      const key =
        doNotAskAgainKey ||
        (title ? `qrew_skip_confirm_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}` : null);

      if (key && typeof window !== "undefined") {
        try {
          if (window.localStorage.getItem(key) === "true") {
            onConfirm?.();
            return;
          }
        } catch {}
      }

      let doNotAskChecked = false;

      openModal({
        title,
        body: (
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ color: iconColor, flexShrink: 0, marginTop: "2px" }}>
              <QrewIcon name={icon} />
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
              {message}
            </div>
          </div>
        ),
        footer: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "12px",
            }}
          >
            {showDoNotAskAgain ? (
              <label className="confirm-do-not-ask">
                <input
                  type="checkbox"
                  id="confirm-dialog-do-not-ask"
                  onChange={(e) => {
                    doNotAskChecked = e.target.checked;
                  }}
                />
                <span>Do not ask again</span>
              </label>
            ) : (
              <div />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${confirmClass}`}
                style={confirmStyle}
                id="confirm-dialog-btn"
                onClick={() => {
                  if (key && doNotAskChecked) {
                    try {
                      window.localStorage.setItem(key, "true");
                    } catch (e) {
                      console.warn("Could not save do not ask again preference", e);
                    }
                  }
                  closeModal();
                  onConfirm?.();
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        ),
      });
    },
    [openModal, closeModal]
  );

  const resetConfirmPreferences = useCallback(() => {
    try {
      Object.keys(window.localStorage).forEach((k) => {
        if (k.startsWith("qrew_skip_confirm_")) {
          window.localStorage.removeItem(k);
        }
      });
    } catch {}
  }, []);

  const value = useMemo<UiFeedbackContextValue>(
    () => ({
      showToast,
      openModal,
      closeModal,
      confirmDialog,
      resetConfirmPreferences,
    }),
    [showToast, openModal, closeModal, confirmDialog, resetConfirmPreferences]
  );

  return (
    <UiFeedbackContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      {toasts.length > 0 ? (
        <div id="toast-container" className="toast-container">
          {toasts.map((t) => {
            const iconName: IconName =
              t.type === "danger" || t.type === "warning"
                ? "alert"
                : t.type === "info"
                  ? "info"
                  : "check";
            return (
              <div
                key={t.id}
                className={`toast toast-${t.type}`}
                style={
                  t.leaving
                    ? { opacity: 0, transform: "translateY(12px)", transition: "opacity 0.2s, transform 0.2s" }
                    : undefined
                }
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  <QrewIcon name={iconName} />
                </span>
                <span>{t.message}</span>
                {t.action?.label ? (
                  <button
                    type="button"
                    className="toast-action-btn"
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      color: "inherit",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "12px",
                      padding: "2px 6px",
                      borderRadius: "2px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      t.action?.onClick();
                      dismissToast(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Modal Overlay */}
      {modal ? (
        <div
          id="modal-overlay"
          className={`modal-overlay${modalVisible ? " show" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <h3 className="modal-title" id="modal-title">
                {modal.title}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                id="modal-close-btn"
                aria-label="Close dialog"
                onClick={closeModal}
              >
                <QrewIcon name="close" />
              </button>
            </div>
            {modal.content ? (
              modal.content
            ) : (
              <>
                <div className="modal-body" id="modal-body">
                  {modal.body}
                </div>
                {modal.footer ? <div className="modal-footer">{modal.footer}</div> : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </UiFeedbackContext.Provider>
  );
}

export function useUiFeedback(): UiFeedbackContextValue {
  const ctx = useContext(UiFeedbackContext);
  if (!ctx) {
    throw new Error("useUiFeedback must be used inside UiFeedbackProvider.");
  }
  return ctx;
}
