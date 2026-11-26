"use client";

import React, { useMemo, useState } from "react";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";
import "./permission-catalog.css";

interface PermissionItem {
  key: string;
  title: string;
  scope: string;
  category: string;
  description: string;
  type: "read" | "write" | "danger";
}

const PERMISSIONS: PermissionItem[] = [
  {
    key: "platform:read",
    title: "Read Platform Records",
    scope: "Platform Governance",
    category: "Platform",
    description:
      "Access root-level telemetry, tenant metadata, administrative logs, and platform health metrics.",
    type: "read",
  },
  {
    key: "platform:manage",
    title: "Root Platform Administration",
    scope: "Root Authority",
    category: "Platform",
    description:
      "Full administrative sovereignty to configure platform policies, administrator roles, and security parameters.",
    type: "write",
  },
  {
    key: "tenant:create",
    title: "Provision Tenant Workspace",
    scope: "Multi-Tenant Root",
    category: "Tenants",
    description:
      "Provision new isolated tenant organizations, initialize root data partitions, and configure subscription plans.",
    type: "write",
  },
  {
    key: "tenant:read",
    title: "Inspect Tenant Directory",
    scope: "Platform Directory",
    category: "Tenants",
    description:
      "Browse tenant organization directory, configuration snapshots, office counts, and active subscription health.",
    type: "read",
  },
  {
    key: "tenant:update",
    title: "Modify Organization Settings",
    scope: "Tenant Configuration",
    category: "Tenants",
    description:
      "Update legal company details, custom domain mappings, technical contacts, and subscription tiers.",
    type: "write",
  },
  {
    key: "tenant:delete",
    title: "Destroy Tenant Organization",
    scope: "Irreversible Cascade",
    category: "Tenants",
    description:
      "Permanently purge organization tenant instance, cascading across all branch offices, staff, and records.",
    type: "danger",
  },
  {
    key: "tenant:suspend",
    title: "Suspend Organization Access",
    scope: "Security Lockdown",
    category: "Tenants",
    description:
      "Temporarily freeze all login sessions, staff access, and API credentials for an organization.",
    type: "danger",
  },
  {
    key: "office:create",
    title: "Open Branch Office",
    scope: "Branch Hierarchy",
    category: "Offices",
    description:
      "Establish operational branch offices or port facilities mapped under a verified tenant.",
    type: "write",
  },
  {
    key: "office:read",
    title: "View Office Operations",
    scope: "Branch Operations",
    category: "Offices",
    description:
      "Inspect branch office rosters, operational departments, invoices, client records, and active project files.",
    type: "read",
  },
  {
    key: "office:update",
    title: "Configure Office Hub",
    scope: "Branch Management",
    category: "Offices",
    description:
      "Update branch settings, departmental allocations, timezone preferences, and local operating codes.",
    type: "write",
  },
  {
    key: "office:delete",
    title: "Decommission Branch Office",
    scope: "Branch Cascade",
    category: "Offices",
    description:
      "Dismantle an office facility, revoking local operational access and reassigning staff members.",
    type: "danger",
  },
  {
    key: "audit:view",
    title: "Audit Trail Inspection",
    scope: "Security Compliance",
    category: "Audit",
    description:
      "Inspect chronological, tamper-evident audit events, actor IP addresses, and state mutation diffs.",
    type: "read",
  },
  {
    key: "audit:export",
    title: "Export Audit Archives",
    scope: "Regulatory Export",
    category: "Audit",
    description:
      "Generate cryptographically verified compliance logs and signed audit archives for external scrutiny.",
    type: "write",
  },
  {
    key: "support:request",
    title: "Request Support Session",
    scope: "Impersonation Gateway",
    category: "Support Access",
    description:
      "Request time-boxed, scoped elevation to inspect tenant issues with mandatory justification logging.",
    type: "write",
  },
  {
    key: "support:revoke",
    title: "Sever Active Support",
    scope: "Immediate Lockdown",
    category: "Support Access",
    description:
      "Immediately terminate ongoing platform support sessions and invalidate all temporary elevation tokens.",
    type: "danger",
  },
  {
    key: "catalog:read",
    title: "Explore Blueprint Catalog",
    scope: "Template Library",
    category: "Templates",
    description:
      "Browse prebuilt organizational blueprints, workflow stage templates, and permission bundles.",
    type: "read",
  },
  {
    key: "catalog:manage",
    title: "Publish Blueprint Templates",
    scope: "Template Authoring",
    category: "Templates",
    description:
      "Author, version, and publish reusable organizational blueprint templates platform-wide.",
    type: "write",
  },
  {
    key: "entitlement:read",
    title: "View Quotas & Features",
    scope: "Plan Entitlements",
    category: "Entitlements",
    description:
      "Inspect plan feature flags, operational capacity quotas, and custom tenant entitlement overrides.",
    type: "read",
  },
  {
    key: "entitlement:manage",
    title: "Override Feature Entitlements",
    scope: "Quota Authority",
    category: "Entitlements",
    description:
      "Grant custom feature overrides, elevate resource limits, and tailor plan capabilities per tenant.",
    type: "write",
  },
  {
    key: "settings:read",
    title: "View Security Baselines",
    scope: "Platform Policy",
    category: "Platform Settings",
    description:
      "View global security standards, MFA mandates, authentication lockout triggers, and session rules.",
    type: "read",
  },
  {
    key: "settings:manage",
    title: "Govern Platform Security",
    scope: "Root Governance",
    category: "Platform Settings",
    description:
      "Reconfigure root authentication thresholds, session TTLs, TLS rules, and system-wide security controls.",
    type: "danger",
  },
];

export function SuperAdminPermissionCatalogView() {
  const { showToast } = useUiFeedback();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "read" | "write" | "danger">("all");

  const filteredPermissions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return PERMISSIONS.filter((p) => {
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      const matchesQuery =
        !q ||
        p.key.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [searchQuery, typeFilter]);

  const groupedAll = useMemo(() => {
    const map: Record<string, PermissionItem[]> = {};
    PERMISSIONS.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, []);

  const groupedVisible = useMemo(() => {
    const map: Record<string, PermissionItem[]> = {};
    filteredPermissions.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [filteredPermissions]);

  const toggleCard = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectAll = () => {
    const targets = filteredPermissions.length > 0 ? filteredPermissions : PERMISSIONS;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      targets.forEach((p) => next.add(p.key));
      return next;
    });
    showToast(`Selected all ${targets.length} permissions`, "info");
  };

  const handleDeselectAll = () => {
    setSelectedKeys(new Set());
    showToast("Deselected all permissions", "info");
  };

  const handleSelectCategory = (category: string) => {
    const items = groupedAll[category] || [];
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      items.forEach((p) => next.add(p.key));
      return next;
    });
    showToast(`Selected all permissions in ${category}`, "info");
  };

  const handleDeselectCategory = (category: string) => {
    const items = groupedAll[category] || [];
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      items.forEach((p) => next.delete(p.key));
      return next;
    });
    showToast(`Deselected permissions in ${category}`, "info");
  };

  const renderTypeBadge = (t: PermissionItem["type"]) => {
    if (t === "read") return <span className="perm-type-badge read">Read</span>;
    if (t === "write") return <span className="perm-type-badge write">Write</span>;
    return <span className="perm-type-badge danger">Destructive</span>;
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div className="page-title-group">
          <h1 className="page-title">Permission Catalog</h1>
          <p className="page-subtitle">
            System-managed catalog of {PERMISSIONS.length} platform permission keys — interactive
            selection &amp; RBAC assignment
          </p>
        </div>
      </div>

      <div className="perm-toolbar-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "380px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search permissions or descriptions…"
              style={{ paddingLeft: "30px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span
              style={{
                position: "absolute",
                left: "9px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                display: "flex",
              }}
            >
              <QrewIcon name="search" />
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn btn-sm ${typeFilter === "read" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTypeFilter("read")}
            >
              Read
            </button>
            <button
              type="button"
              className={`btn btn-sm ${typeFilter === "write" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTypeFilter("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={`btn btn-sm ${typeFilter === "danger" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTypeFilter("danger")}
            >
              Destructive
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setTypeFilter("all");
                setSearchQuery("");
              }}
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            paddingTop: "14px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              className={`perm-counter-pill${selectedKeys.size > 0 ? " has-selection" : ""}`}
              id="perm-counter-pill"
            >
              <span
                key={selectedKeys.size}
                className="perm-counter-badge bump"
                id="perm-counter-badge"
              >
                {selectedKeys.size}
              </span>
              <span id="perm-counter-text">of {PERMISSIONS.length} selected</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="btn-select-all"
              onClick={handleSelectAll}
            >
              <QrewIcon name="check" /> Select All ({PERMISSIONS.length})
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="btn-deselect-all"
              disabled={selectedKeys.size === 0}
              onClick={handleDeselectAll}
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {Object.entries(groupedVisible).map(([category, perms]) => {
        const allInCat = groupedAll[category] || perms;
        const selectedInCat = allInCat.filter((p) => selectedKeys.has(p.key)).length;

        return (
          <div
            className="perm-category"
            key={category}
            data-category={category}
            style={{ marginBottom: "28px" }}
          >
            <div className="perm-category-header">
              <div className="perm-category-info">
                <h2 className="perm-category-title">{category}</h2>
                <span className="perm-category-badge">{allInCat.length}</span>
              </div>
              <div className="perm-category-actions">
                <span
                  className="perm-category-status"
                  style={{
                    color: selectedInCat > 0 ? "var(--color-accent)" : "var(--color-text-muted)",
                    fontWeight: selectedInCat > 0 ? 600 : 500,
                  }}
                >
                  {selectedInCat} of {allInCat.length} selected
                </span>
                <button
                  type="button"
                  className="btn-cat-action"
                  title={`Select all ${category} permissions`}
                  onClick={() => handleSelectCategory(category)}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="btn-cat-action"
                  title={`Deselect all ${category} permissions`}
                  onClick={() => handleDeselectCategory(category)}
                >
                  Deselect
                </button>
              </div>
            </div>

            <div className="perm-cards-grid">
              {perms.map((p) => {
                const isSelected = selectedKeys.has(p.key);
                const [ns, action] = p.key.split(":");
                return (
                  <div
                    key={p.key}
                    className={`perm-card${isSelected ? " selected" : ""}`}
                    tabIndex={0}
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleCard(p.key)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        toggleCard(p.key);
                      }
                    }}
                  >
                    <div className="perm-card-head">
                      <div className="perm-card-header-left">
                        <div className="perm-card-check" aria-hidden="true">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div className="perm-card-titles">
                          <h3 className="perm-card-title">{p.title}</h3>
                          <span className="perm-card-scope">{p.scope}</span>
                        </div>
                      </div>
                      {renderTypeBadge(p.type)}
                    </div>

                    <p className="perm-card-desc">{p.description}</p>

                    <div className="perm-card-foot">
                      <code className="perm-key-tag">
                        <span className="perm-key-namespace">{ns}:</span>
                        {action}
                      </code>
                      <span className="perm-state-tag">
                        {isSelected ? "Selected" : "Unselected"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
