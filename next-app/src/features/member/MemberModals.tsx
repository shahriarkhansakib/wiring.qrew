"use client";

import React, { useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";

export function CreateMemberTaskModalContent({
  userId,
  deptId,
  onCancel,
}: {
  userId: string;
  deptId: string;
  onCancel: () => void;
}) {
  const { mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Operations");
  const [priority, setPriority] = useState("Normal");
  const [dueTime, setDueTime] = useState("Today, 04:30 PM");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg("Duty description is required.");
      return;
    }
    mutate((s) =>
      s.createMemberTask(userId, deptId, cleanTitle, priority, dueTime.trim(), category)
    );
    closeModal();
    showToast("Duty added to your checklist.", "success");
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        {errorMsg ? (
          <div
            style={{
              background: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              fontSize: "12.5px",
              marginBottom: "12px",
            }}
          >
            {errorMsg}
          </div>
        ) : null}

        <form id="create-my-task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="my-task-title">
              Duty Description *
            </label>
            <input
              type="text"
              id="my-task-title"
              className="form-input"
              placeholder="e.g. Conduct daily dock equipment audit"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrorMsg(null);
              }}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="my-task-category">
                Category
              </label>
              <select
                id="my-task-category"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Operations">Operations</option>
                <option value="Inspection">Inspection</option>
                <option value="Compliance">Compliance</option>
                <option value="Safety">Safety</option>
                <option value="Reporting">Reporting</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="my-task-priority">
                Priority
              </label>
              <select
                id="my-task-priority"
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="my-task-due">
              Due Time
            </label>
            <input
              type="text"
              id="my-task-due"
              className="form-input"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
          Add Duty
        </button>
      </div>
    </>
  );
}
