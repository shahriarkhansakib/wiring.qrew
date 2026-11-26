"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { routes } from "@/lib/routes";

export const DEMO_PERSONAS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_PERSONAS !== "false";

interface DemoPersona {
  userId: string;
  name: string;
  initial: string;
  roleLabel: string;
  badgeClass: string;
  avatarBg: string;
  description: string;
  buttonLabel: string;
  href: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    userId: "usr_sakib",
    name: "Sakib",
    initial: "S",
    roleLabel: "Platform Owner",
    badgeClass: "persona-role-badge badge-role platform",
    avatarBg: "var(--color-accent)",
    description: "Global infrastructure, tenants CRUD, platform audit visibility.",
    buttonLabel: "Enter as Platform Owner",
    href: routes.platform("overview"),
  },
  {
    userId: "usr_rafiq",
    name: "Rafiqul Islam",
    initial: "R",
    roleLabel: "Tenant Admin",
    badgeClass: "persona-role-badge badge-role tenant",
    avatarBg: "var(--color-warning)",
    description: "SST organization, branch offices CRUD, member pool.",
    buttonLabel: "Enter as Tenant Admin",
    href: routes.tenant("ten_sst", "overview"),
  },
  {
    userId: "usr_jack",
    name: "Jack Rahman",
    initial: "J",
    roleLabel: "Office Supervisor",
    badgeClass: "persona-role-badge badge-role office",
    avatarBg: "var(--color-info)",
    description: "Chittagong Port Office, departments, and on-site staff deployment.",
    buttonLabel: "Enter as Office Admin",
    href: routes.office("ten_sst", "off_ctg_port", "overview"),
  },
  {
    userId: "usr_nusrat",
    name: "Nusrat Jahan",
    initial: "N",
    roleLabel: "Office Staff",
    badgeClass: "persona-role-badge",
    avatarBg: "var(--color-text-muted)",
    description: "Chittagong Port member, daily operational duties & personal tasks.",
    buttonLabel: "Enter as Member",
    href: routes.member("usr_nusrat", "overview"),
  },
];

export function useOpenPersonaModal() {
  const router = useRouter();
  const { mutate } = useQrewStore();
  const { openModal, closeModal } = useUiFeedback();

  return useCallback(() => {
    if (!DEMO_PERSONAS_ENABLED) return;

    openModal({
      title: "1-Click Persona Login",
      body: (
        <>
          <p style={{ fontSize: "13.5px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
            Select any persona to jump directly into their contextual workspace experience.
          </p>
          <div
            className="personas-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            {DEMO_PERSONAS.map((p) => (
              <div
                key={p.userId}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    className="persona-avatar"
                    style={{
                      backgroundColor: p.avatarBg,
                      width: "38px",
                      height: "38px",
                      fontSize: "15px",
                    }}
                  >
                    {p.initial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>
                      {p.name}
                    </div>
                    <span
                      className={p.badgeClass}
                      style={
                        p.badgeClass === "persona-role-badge"
                          ? {
                              background: "var(--color-surface)",
                              color: "var(--color-text-primary)",
                              border: "1px solid var(--color-border)",
                              fontSize: "10px",
                            }
                          : { fontSize: "10px" }
                      }
                    >
                      {p.roleLabel}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {p.description}
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "auto", width: "100%" }}
                  onClick={() => {
                    mutate((s) => s.setCurrentUser(p.userId));
                    closeModal();
                    router.push(p.href);
                  }}
                >
                  {p.buttonLabel}
                </button>
              </div>
            ))}
          </div>
        </>
      ),
      footer: (
        <button type="button" className="btn btn-secondary" onClick={closeModal}>
          Close
        </button>
      ),
    });
  }, [openModal, closeModal, mutate, router]);
}
