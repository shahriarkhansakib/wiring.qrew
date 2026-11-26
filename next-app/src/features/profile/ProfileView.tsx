"use client";

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";
import { DEFAULT_CONTEXT_IDS, routes, type ProfileRouteContext } from "@/lib/routes";
import type { PanelUserInfo, ThemeMode, WorkspaceId } from "@/lib/types";
import { buildWorkspaceContext, getPanelUserInfo } from "@/lib/workspace-config";
import { BackupCodesModalContent, TwoFactorSetupModalContent } from "./TwoFactorModals";

const AVATAR_SWATCHES = [
  { color: "#0F766E", title: "Teal (Brand)", match: ["#0F766E", "#0D9488"] },
  { color: "#2563EB", title: "Blue (Platform)", match: ["#2563EB"] },
  { color: "#7C3AED", title: "Purple (Tenant)", match: ["#7C3AED"] },
  { color: "#EA580C", title: "Orange (Config)", match: ["#EA580C", "#F97316"] },
  { color: "#1E293B", title: "Dark Slate", match: ["#1E293B"] },
];

const SECONDARY_SWATCHES = [
  { value: "default", label: "Default (Panel Preset)", title: "Default (Panel Preset)", isDefault: true },
  { value: "#2563EB", label: "Blue", title: "Blue (Platform)" },
  { value: "#7C3AED", label: "Purple", title: "Purple (Tenant)" },
  { value: "#0F766E", label: "Teal", title: "Teal (Office)", legacy: "#0D9488" },
  { value: "#EA580C", label: "Orange", title: "Orange (Config)", legacy: "#F97316" },
  { value: "#059669", label: "Emerald", title: "Emerald Green" },
];

function subscribeNoop() {
  return () => {};
}

function getWorkspaceFromSession(): WorkspaceId {
  try {
    return (window.sessionStorage.getItem("qrew_active_workspace") as WorkspaceId | null) || "platform";
  } catch {
    return "platform";
  }
}

function getWorkspaceServer(): WorkspaceId {
  return "platform";
}

function getContextJsonFromSession(): string {
  try {
    return window.sessionStorage.getItem("qrew_active_context") || "{}";
  } catch {
    return "{}";
  }
}

function getContextJsonServer(): string {
  return "{}";
}

function ProfileTabForm({
  user,
  workspace,
}: {
  user: PanelUserInfo;
  workspace: WorkspaceId;
}) {
  const { mutate, setPanelUserOverride } = useQrewStore();
  const { showToast, confirmDialog } = useUiFeedback();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "+880 1712-345678");
  const [address, setAddress] = useState(user.address || "Gulshan-2, Dhaka");
  const [bio, setBio] = useState(
    user.bio || "Managing platform infrastructure, multi-tenant organizations, and system permissions."
  );
  const [avatarBg, setAvatarBg] = useState(user.avatarBg || "var(--panel-accent, #0D9488)");
  const [avatarPhoto, setAvatarPhoto] = useState(user.photo || "");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPEG, WebP).", "danger");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setAvatarPhoto(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail) {
      showToast("Please provide your name and email address.", "danger");
      return;
    }

    setPanelUserOverride(workspace, {
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim(),
      address: address.trim() || user.address || "Gulshan-2, Dhaka",
      role: user.role,
      bio: bio.trim(),
      avatar: cleanName.charAt(0).toUpperCase(),
      avatarBg,
      photo: avatarPhoto,
    });

    if (workspace === "platform" || workspace === "super-admin") {
      try {
        mutate((s) => s.updateCurrentUser({ name: cleanName, email: cleanEmail }));
      } catch {}
    }

    showToast("Profile updated successfully!", "success");
  };

  const handleDeleteAccount = () => {
    confirmDialog({
      title: "Delete Account",
      message: (
        <>
          Are you sure you want to delete the account profile for{" "}
          <strong>{user.name || "this user"}</strong>? This action will remove custom profile
          information and restore defaults.
        </>
      ),
      confirmText: "Delete Account",
      confirmClass: "btn-danger",
      icon: "trash",
      iconColor: "var(--color-danger)",
      onConfirm: () => {
        try {
          const overrides = JSON.parse(
            window.localStorage.getItem("qrew_panel_user_overrides") || "{}"
          ) as Record<string, unknown>;
          delete overrides[workspace];
          window.localStorage.setItem("qrew_panel_user_overrides", JSON.stringify(overrides));
          [
            "qrew_profile_name",
            "qrew_profile_email",
            "qrew_profile_phone",
            "qrew_profile_address",
            "qrew_profile_bio",
            "qrew_user_avatar_url",
          ].forEach((k) => window.localStorage.removeItem(k));
        } catch {}

        mutate(() => {});
        showToast("Account profile deleted successfully.", "info");
      },
    });
  };

  return (
    <>
      <div className="settings-card-header">
        <h2 className="settings-card-title">Profile Settings</h2>
      </div>
      <div className="settings-card-body">
        <div className="avatar-preview-wrap">
          <div
            ref={wrapperRef}
            className={`avatar-hover-wrapper${popoverOpen ? " is-open" : ""}`}
            id="avatar-hover-wrapper"
          >
            <div
              className="avatar-large"
              id="profile-avatar-preview"
              style={{ backgroundColor: avatarBg }}
              title="Click or hover to change avatar"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpen((prev) => !prev);
              }}
            >
              {avatarPhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarPhoto}
                  alt={name || user.name}
                  className="avatar-large-img"
                  id="profile-avatar-img"
                />
              ) : (
                <span id="profile-avatar-initial">
                  {user.avatar || (name || user.name).charAt(0).toUpperCase()}
                </span>
              )}

              <div className="avatar-hover-overlay">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="avatar-hover-text">Change</span>
              </div>
            </div>

            <div className="avatar-options-popover" id="avatar-options-popover">
              <div className="avatar-popover-header">
                <span className="avatar-popover-title">Avatar Options</span>
              </div>

              <div className="avatar-popover-section">
                <div className="avatar-popover-label">Picture</div>
                <div className="avatar-popover-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    id="btn-upload-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Upload Picture</span>
                  </button>
                  {avatarPhoto ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm btn-remove-photo"
                      id="btn-remove-photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarPhoto("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <QrewIcon name="trash" size={13} />
                      <span>Remove</span>
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar-file-input"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="avatar-popover-divider" />

              <div className="avatar-popover-section">
                <div className="avatar-popover-label">Avatar Color</div>
                <div className="color-swatch-list in-popover">
                  {AVATAR_SWATCHES.map((sw) => {
                    const isActive = sw.match.includes(avatarBg);
                    return (
                      <button
                        key={sw.color}
                        type="button"
                        className={`color-swatch-btn${isActive ? " active" : ""}`}
                        style={{ backgroundColor: sw.color }}
                        title={sw.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatarBg(sw.color);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              {user.name}
            </h3>
            <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="badge"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--panel-accent)",
                  border: "1px solid var(--color-border)",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {user.role}
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <form
          id="profile-details-form"
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          onSubmit={handleSubmit}
        >
          <div
            className="settings-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
          >
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                id="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                id="profile-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div
            className="settings-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
          >
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                id="profile-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1xxx-xxxxxx"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                id="profile-address-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Gulshan-2, Dhaka"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Profile Description</label>
            <textarea
              className="form-input"
              id="profile-bio-input"
              rows={3}
              style={{ resize: "vertical" }}
              placeholder="Brief summary of responsibilities..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="settings-section-divider" />

          <div
            className="settings-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
          >
            <div className="form-group">
              <label className="form-label">Active Panel Authority</label>
              <input
                type="text"
                className="form-input"
                value={user.role}
                disabled
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-text-muted)",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Operational Status</label>
              <input
                type="text"
                className="form-input"
                value="Active • Operational"
                disabled
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-success)",
                  fontWeight: 600,
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          <div
            className="settings-form-footer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--color-border-subtle)",
            }}
          >
            <button
              type="button"
              className="btn btn-danger-light"
              id="btn-delete-profile"
              title="Delete Account Profile"
              onClick={handleDeleteAccount}
            >
              <QrewIcon name="trash" /> Delete Account
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-profile">
              <QrewIcon name="check" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function AppearanceTab() {
  const { theme, secondaryColor, setTheme, setSecondaryColor } = useTheme();
  const { showToast } = useUiFeedback();

  const handleThemeSelect = (nextTheme: ThemeMode, label: string) => {
    setTheme(nextTheme);
    showToast(`Theme switched to ${label}.`, "info");
  };

  const handleSecondarySelect = (val: string, label: string) => {
    setSecondaryColor(val);
    showToast(`Secondary color updated to ${label}.`, "info");
  };

  return (
    <>
      <div className="settings-card-header">
        <h2 className="settings-card-title">Appearance &amp; Display</h2>
      </div>
      <div className="settings-card-body">
        <div>
          <label
            className="form-label"
            style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", display: "block" }}
          >
            Primary Theme
          </label>
          <div className="appearance-theme-grid">
            <div
              className={`appearance-theme-card${theme === "light" ? " active" : ""}`}
              onClick={() => handleThemeSelect("light", "Light")}
            >
              <div className="theme-preview-box preview-light">
                <div className="mock-topbar" />
                <div className="mock-body">
                  <div className="mock-sidebar" />
                  <div className="mock-content">
                    <div className="mock-line" style={{ width: "65%" }} />
                    <div className="mock-line" style={{ width: "90%" }} />
                    <div className="mock-line" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
              <div className="theme-card-footer">
                <span className="theme-name">Light</span>
                <span className="theme-radio-dot" />
              </div>
            </div>

            <div
              className={`appearance-theme-card${theme === "dark" ? " active" : ""}`}
              onClick={() => handleThemeSelect("dark", "Dark")}
            >
              <div className="theme-preview-box preview-dark">
                <div className="mock-topbar" />
                <div className="mock-body">
                  <div className="mock-sidebar" />
                  <div className="mock-content">
                    <div className="mock-line" style={{ width: "65%" }} />
                    <div className="mock-line" style={{ width: "90%" }} />
                    <div className="mock-line" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>
              <div className="theme-card-footer">
                <span className="theme-name">Dark</span>
                <span className="theme-radio-dot" />
              </div>
            </div>

            <div
              className={`appearance-theme-card${theme === "system" ? " active" : ""}`}
              onClick={() => handleThemeSelect("system", "System")}
            >
              <div className="theme-preview-box preview-system">
                <div className="mock-half mock-light-half">
                  <div className="mock-topbar" />
                  <div className="mock-body">
                    <div className="mock-sidebar" />
                    <div className="mock-content">
                      <div className="mock-line" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>
                <div className="mock-half mock-dark-half">
                  <div className="mock-topbar" />
                  <div className="mock-body">
                    <div className="mock-sidebar" />
                    <div className="mock-content">
                      <div className="mock-line" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="theme-card-footer">
                <span className="theme-name">System</span>
                <span className="theme-radio-dot" />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section-divider" />

        <div>
          <label
            className="form-label"
            style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px", display: "block" }}
          >
            Secondary Color
          </label>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 14px 0" }}>
            By default, each workspace panel uses its dedicated color scheme (Platform: Blue, Tenant:
            Purple, Office: Teal, Config: Orange). You can override the secondary color across panels
            below.
          </p>
          <div className="accent-swatch-row">
            {SECONDARY_SWATCHES.map((sw) => {
              const isActive =
                secondaryColor === sw.value || (sw.legacy && secondaryColor === sw.legacy);
              return (
                <button
                  key={sw.value}
                  type="button"
                  className={`accent-swatch-item${isActive ? " active" : ""}`}
                  title={sw.title}
                  onClick={() => handleSecondarySelect(sw.value, sw.label)}
                >
                  <span
                    className={`swatch-circle${sw.isDefault ? " swatch-default-preset" : ""}`}
                    style={sw.isDefault ? undefined : { background: sw.value }}
                  />
                  <span className="swatch-label">{sw.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            type="button"
            className="btn btn-primary"
            id="btn-save-appearance"
            onClick={() => showToast("Appearance preferences saved successfully!", "success")}
          >
            <QrewIcon name="check" /> Save Preferences
          </button>
        </div>
      </div>
    </>
  );
}

function SecurityTab({
  user,
  workspace,
}: {
  user: PanelUserInfo;
  workspace: WorkspaceId;
}) {
  const { setPanelUserOverride } = useQrewStore();
  const { openModal, closeModal, confirmDialog, showToast } = useUiFeedback();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [twoFaVersion, setTwoFaVersion] = useState(0);

  const subscribeNoop = useMemo(() => () => () => {}, []);
  const hydrated2FA = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const is2FA = useMemo(() => {
    void twoFaVersion;
    if (user.twoFactorEnabled) return true;
    if (!hydrated2FA || typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(`qrew_2fa_${user.email || workspace}`) === "true";
    } catch {
      return false;
    }
  }, [user.twoFactorEnabled, user.email, workspace, twoFaVersion, hydrated2FA]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      showToast("Please fill out all password fields.", "danger");
      return;
    }
    if (newPwd !== confirmPwd) {
      showToast("New password and confirmation do not match.", "danger");
      return;
    }
    if (newPwd.length < 8) {
      showToast("New password must be at least 8 characters long.", "danger");
      return;
    }
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    showToast("Password updated successfully!", "success");
  };

  const openBackupCodesModal = (showEnabledBanner: boolean) => {
    openModal({
      title: showEnabledBanner
        ? "Two-Factor Authentication Enabled"
        : "Emergency Backup Recovery Codes",
      content: (
        <BackupCodesModalContent
          showEnabledBanner={showEnabledBanner}
          onDone={closeModal}
        />
      ),
    });
  };

  const handleOpenSetup2FA = () => {
    openModal({
      title: "Set Up Two-Factor Authentication",
      content: (
        <TwoFactorSetupModalContent
          onCancel={closeModal}
          onValidationError={(msg) => showToast(msg, "danger")}
          onVerifySuccess={() => {
            try {
              window.localStorage.setItem(`qrew_2fa_${user.email || workspace}`, "true");
            } catch {}
            setPanelUserOverride(workspace, { twoFactorEnabled: true });
            setTwoFaVersion((v) => v + 1);
            closeModal();
            window.setTimeout(() => {
              openBackupCodesModal(true);
              showToast("Two-Factor Authentication enabled successfully!", "success");
            }, 220);
          }}
        />
      ),
    });
  };

  const handleDisable2FA = () => {
    confirmDialog({
      title: "Disable Two-Factor Authentication",
      message:
        "Are you sure you want to disable 2FA? This will remove the extra security layer from your account and make it more vulnerable.",
      confirmText: "Disable 2FA",
      confirmClass: "btn-danger",
      onConfirm: () => {
        try {
          window.localStorage.removeItem(`qrew_2fa_${user.email || workspace}`);
        } catch {}
        setPanelUserOverride(workspace, { twoFactorEnabled: false });
        setTwoFaVersion((v) => v + 1);
        showToast("Two-Factor Authentication has been disabled.", "info");
      },
    });
  };

  return (
    <>
      <div className="settings-card-header">
        <h2 className="settings-card-title">Security &amp; Authentication</h2>
      </div>
      <div className="settings-card-body">
        <div>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "4px",
            }}
          >
            Change Password
          </h3>
          <p style={{ fontSize: "12.5px", color: "var(--color-text-muted)", marginBottom: "14px" }}>
            Ensure your account uses a secure password with at least 8 characters.
          </p>

          <form
            id="security-password-form"
            style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "680px" }}
            onSubmit={handlePasswordSubmit}
          >
            <div className="form-group" style={{ maxWidth: "330px" }}>
              <label className="form-label">
                Current Password <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                id="sec-current-pwd"
                placeholder="••••••••••••"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                required
              />
            </div>
            <div
              className="settings-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
            >
              <div className="form-group">
                <label className="form-label">
                  New Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="sec-new-pwd"
                  placeholder="Enter new password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Confirm New Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="sec-confirm-pwd"
                  placeholder="Confirm new password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" id="btn-update-password">
                Update Password
              </button>
            </div>
          </form>
        </div>

        <div className="settings-section-divider" style={{ margin: "20px 0" }} />

        <div id="security-2fa-section">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  Two-Factor Authentication (2FA)
                </h3>
                <span
                  id="twofa-status-badge"
                  className={`badge ${is2FA ? "twofa-badge-active" : "twofa-badge-inactive"}`}
                  style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px" }}
                >
                  {is2FA ? "Enabled • Protected" : "Not Configured"}
                </span>
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--color-text-muted)",
                  margin: "6px 0 0",
                  maxWidth: "560px",
                }}
              >
                Add an extra layer of defense to your profile. When 2FA is active, signing in requires
                a 6-digit verification code from your authenticator app in addition to your password.
              </p>
            </div>

            <div id="twofa-header-actions">
              {is2FA ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  id="btn-disable-2fa"
                  style={{
                    color: "var(--color-danger, #EF4444)",
                    borderColor: "rgba(239,68,68,0.3)",
                  }}
                  onClick={handleDisable2FA}
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  id="btn-setup-2fa"
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
                  onClick={handleOpenSetup2FA}
                >
                  <QrewIcon name="shield" />
                  <span>Configure 2FA</span>
                </button>
              )}
            </div>
          </div>

          <div className={`security-2fa-box${is2FA ? " is-active" : ""}`}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "var(--radius-md)",
                    background: is2FA ? "rgba(13,148,136,0.15)" : "var(--color-surface-hover)",
                    color: is2FA ? "var(--color-accent)" : "var(--color-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>Authenticator App (TOTP)</span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background: "var(--color-surface-hover)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Recommended
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    Google Authenticator, Microsoft Authenticator, 1Password, Authy
                  </div>
                </div>
              </div>

              <div>
                {is2FA ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      id="btn-view-backup-codes"
                      onClick={() => openBackupCodesModal(false)}
                    >
                      Backup Codes
                    </button>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-success)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <QrewIcon name="check" /> Active
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    Ready to pair
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProfileView({
  tabParam,
  wsParam,
  tenantIdParam,
  officeIdParam,
  deptIdParam,
  userIdParam,
}: {
  tabParam?: string | null;
  wsParam?: string | null;
  tenantIdParam?: string | null;
  officeIdParam?: string | null;
  deptIdParam?: string | null;
  userIdParam?: string | null;
}) {
  const router = useRouter();
  const { store, version, panelOverrides } = useQrewStore();

  const sessionWs = useSyncExternalStore(
    subscribeNoop,
    getWorkspaceFromSession,
    getWorkspaceServer
  );

  const sessionContextJson = useSyncExternalStore(
    subscribeNoop,
    getContextJsonFromSession,
    getContextJsonServer
  );

  const sessionContext = useMemo<ProfileRouteContext>(() => {
    try {
      return JSON.parse(sessionContextJson) as ProfileRouteContext;
    } catch {
      return {};
    }
  }, [sessionContextJson]);

  const ws: WorkspaceId = (wsParam as WorkspaceId | null) || sessionWs || "platform";
  const currentTab =
    tabParam === "appearance" || tabParam === "security" ? tabParam : "profile";

  const profileContext = useMemo<ProfileRouteContext>(
    () => ({
      tenantId: tenantIdParam || sessionContext.tenantId || DEFAULT_CONTEXT_IDS.tenantId,
      officeId: officeIdParam || sessionContext.officeId || DEFAULT_CONTEXT_IDS.officeId,
      deptId: deptIdParam || sessionContext.deptId || DEFAULT_CONTEXT_IDS.deptId,
      userId: userIdParam || sessionContext.userId || DEFAULT_CONTEXT_IDS.memberId,
    }),
    [
      tenantIdParam,
      officeIdParam,
      deptIdParam,
      userIdParam,
      sessionContext.tenantId,
      sessionContext.officeId,
      sessionContext.deptId,
      sessionContext.userId,
    ]
  );

  const ctx = useMemo(() => {
    void version;
    return buildWorkspaceContext(store, ws, "profile", profileContext);
  }, [store, version, ws, profileContext]);

  const user = getPanelUserInfo(ws, ctx, panelOverrides);

  let backHref = routes.platform("overview");
  let workspaceTitle = "Platform Admin";

  if (ws === "super-admin") {
    backHref = routes.superAdmin("overview");
    workspaceTitle = "Super Admin";
  } else if (ws === "tenant") {
    backHref = routes.tenant(ctx.tenantId, "overview");
    workspaceTitle = "Tenant Panel";
  } else if (ws === "tenant-super-admin") {
    backHref = routes.tenantSuperAdmin(ctx.tenantId, "overview");
    workspaceTitle = "Tenant Super Admin";
  } else if (ws === "office") {
    backHref = routes.office(ctx.tenantId, ctx.officeId, "dashboard");
    workspaceTitle = "Office Workspace";
  } else if (ws === "office-admin") {
    backHref = routes.officeAdmin(ctx.tenantId, ctx.officeId, "overview");
    workspaceTitle = "Office Admin";
  } else if (ws === "office-config") {
    backHref = routes.officeConfig(ctx.tenantId, ctx.officeId, "overview");
    workspaceTitle = "Office Config";
  } else if (ws === "department") {
    backHref = routes.department(ctx.deptId, "overview");
    workspaceTitle = "Department";
  } else if (ws === "member") {
    backHref = routes.member(ctx.userId, "overview");
    workspaceTitle = "Member Workspace";
  }

  return (
    <div className="settings-container">
      <div className="page-header settings-header">
        <div className="page-title-group">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">
            Manage personal profile details, appearance preferences, and account security.
          </p>
        </div>
        <div className="page-actions">
          <Link href={backHref} className="btn btn-secondary btn-sm" id="btn-back-to-ws">
            <QrewIcon name="chevronLeft" /> Back to {workspaceTitle}
          </Link>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-sidebar" aria-label="Settings Sub Navigation">
          <div className="settings-user-pill-top">
            <div
              className="avatar-sm"
              style={{ backgroundColor: user.avatarBg || "var(--panel-accent)" }}
            >
              {user.avatar || user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.role}
              </div>
            </div>
          </div>

          <div className="nav-divider" style={{ margin: "8px 4px 10px" }} />

          <button
            type="button"
            className={`settings-tab-btn${currentTab === "profile" ? " active" : ""}`}
            onClick={() => router.push(routes.profile("profile", ws, profileContext))}
          >
            <span className="tab-icon">
              <QrewIcon name="users" />
            </span>
            <span>Profile</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn${currentTab === "appearance" ? " active" : ""}`}
            onClick={() => router.push(routes.profile("appearance", ws, profileContext))}
          >
            <span className="tab-icon">
              <QrewIcon name="layers" />
            </span>
            <span>Appearance</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn${currentTab === "security" ? " active" : ""}`}
            onClick={() => router.push(routes.profile("security", ws, profileContext))}
          >
            <span className="tab-icon">
              <QrewIcon name="shield" />
            </span>
            <span>Security</span>
          </button>
        </nav>

        <div className="settings-content-card" id="settings-tab-content">
          {currentTab === "appearance" ? (
            <AppearanceTab />
          ) : currentTab === "security" ? (
            <SecurityTab user={user} workspace={ws} />
          ) : (
            <ProfileTabForm key={`${ws}-${version}`} user={user} workspace={ws} />
          )}
        </div>
      </div>
    </div>
  );
}
