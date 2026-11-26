"use client";

import React, { useState } from "react";

export const BACKUP_CODES = [
  "8492-4102",
  "3819-5820",
  "7401-9283",
  "1948-2840",
  "5829-1039",
  "4820-5819",
  "9182-3749",
  "2048-1938",
];

const SETUP_SECRET = "JBSW Y3DP EHPK 3PXP";

export function BackupCodesModalContent({
  showEnabledBanner = false,
  onDone,
}: {
  showEnabledBanner?: boolean;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(BACKUP_CODES.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <div>
          {showEnabledBanner ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
                color: "var(--color-success)",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>
                Your account is now protected with 2FA
              </span>
            </div>
          ) : null}

          <p style={{ fontSize: "12.5px", color: "var(--color-text-muted)", margin: "0 0 14px" }}>
            {showEnabledBanner
              ? "Save these emergency recovery codes in a safe place. If you ever lose access to your phone or authenticator app, each code can be used once to sign in:"
              : "Each code below can be used once if you lose access to your authenticator app. Store them safely:"}
          </p>

          <div className="twofa-backup-grid">
            {BACKUP_CODES.map((c) => (
              <div className="twofa-backup-code" key={c}>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={handleCopy}>
          {copied ? "Codes Copied!" : "Copy All Codes"}
        </button>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          {showEnabledBanner ? "Done" : "Close"}
        </button>
      </div>
    </>
  );
}

export function TwoFactorSetupModalContent({
  onCancel,
  onVerifySuccess,
  onValidationError,
}: {
  onCancel: () => void;
  onVerifySuccess: () => void;
  onValidationError: (msg: string) => void;
}) {
  const [code, setCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleCopySecret = () => {
    navigator.clipboard?.writeText("JBSWY3DPEHPK3PXP");
    setCopiedSecret(true);
    window.setTimeout(() => setCopiedSecret(false), 1500);
  };

  const handleVerify = () => {
    const clean = code.replace(/\s+/g, "");
    if (!clean || clean.length < 6) {
      onValidationError(
        "Please enter the 6-digit verification code from your authenticator app (e.g. 123456)."
      );
      return;
    }
    onVerifySuccess();
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <div className="twofa-setup-wrap">
          <div className="twofa-step-card">
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span className="twofa-step-num">1</span>
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                Scan QR code with Authenticator app
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 10px" }}>
              Use Google Authenticator, 1Password, Microsoft Authenticator or Authy on your mobile
              phone to scan this QR code:
            </p>

            <div className="twofa-qr-container">
              <svg
                width="140"
                height="140"
                viewBox="0 0 140 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="2FA QR Code"
              >
                <rect width="140" height="140" rx="8" fill="#FFFFFF" />
                <rect x="14" y="14" width="35" height="35" rx="3" fill="#090D16" />
                <rect x="21" y="21" width="21" height="21" rx="2" fill="#FFFFFF" />
                <rect x="26" y="26" width="11" height="11" rx="1" fill="#0D9488" />
                <rect x="91" y="14" width="35" height="35" rx="3" fill="#090D16" />
                <rect x="98" y="21" width="21" height="21" rx="2" fill="#FFFFFF" />
                <rect x="103" y="26" width="11" height="11" rx="1" fill="#0D9488" />
                <rect x="14" y="91" width="35" height="35" rx="3" fill="#090D16" />
                <rect x="21" y="98" width="21" height="21" rx="2" fill="#FFFFFF" />
                <rect x="26" y="103" width="11" height="11" rx="1" fill="#0D9488" />
                <rect x="56" y="18" width="7" height="7" fill="#090D16" />
                <rect x="68" y="18" width="7" height="7" fill="#090D16" />
                <rect x="56" y="32" width="7" height="7" fill="#090D16" />
                <rect x="75" y="32" width="7" height="7" fill="#090D16" />
                <rect x="62" y="44" width="7" height="7" fill="#090D16" />
                <rect x="75" y="44" width="7" height="7" fill="#090D16" />
                <rect x="18" y="56" width="7" height="7" fill="#090D16" />
                <rect x="32" y="56" width="7" height="7" fill="#090D16" />
                <rect x="44" y="56" width="7" height="7" fill="#090D16" />
                <rect x="56" y="56" width="14" height="14" rx="2" fill="#0D9488" />
                <rect x="77" y="56" width="7" height="7" fill="#090D16" />
                <rect x="91" y="56" width="7" height="7" fill="#090D16" />
                <rect x="105" y="56" width="7" height="7" fill="#090D16" />
                <rect x="115" y="56" width="7" height="7" fill="#090D16" />
                <rect x="18" y="68" width="7" height="7" fill="#090D16" />
                <rect x="37" y="68" width="7" height="7" fill="#090D16" />
                <rect x="75" y="68" width="7" height="7" fill="#090D16" />
                <rect x="98" y="68" width="7" height="7" fill="#090D16" />
                <rect x="115" y="68" width="7" height="7" fill="#090D16" />
                <rect x="56" y="80" width="7" height="7" fill="#090D16" />
                <rect x="68" y="80" width="7" height="7" fill="#090D16" />
                <rect x="85" y="80" width="7" height="7" fill="#090D16" />
                <rect x="105" y="80" width="7" height="7" fill="#090D16" />
                <rect x="56" y="94" width="7" height="7" fill="#090D16" />
                <rect x="75" y="94" width="7" height="7" fill="#090D16" />
                <rect x="91" y="94" width="7" height="7" fill="#090D16" />
                <rect x="112" y="94" width="7" height="7" fill="#090D16" />
                <rect x="62" y="108" width="7" height="7" fill="#090D16" />
                <rect x="80" y="108" width="7" height="7" fill="#090D16" />
                <rect x="98" y="108" width="7" height="7" fill="#090D16" />
                <rect x="115" y="108" width="7" height="7" fill="#090D16" />
              </svg>
            </div>

            <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
              Or manually enter the setup key:
            </div>
            <div className="twofa-secret-box">
              <span>{SETUP_SECRET}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "11px", padding: "3px 8px" }}
                onClick={handleCopySecret}
              >
                {copiedSecret ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="twofa-step-card">
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span className="twofa-step-num">2</span>
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                Verify 6-digit authentication code
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 12px" }}>
              Enter the current 6-digit one-time code generated by your authenticator app:
            </p>
            <input
              type="text"
              className="form-input twofa-code-input"
              placeholder="000 000"
              maxLength={6}
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleVerify}>
          Verify &amp; Activate 2FA
        </button>
      </div>
    </>
  );
}
