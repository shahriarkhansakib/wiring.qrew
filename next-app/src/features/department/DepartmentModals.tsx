"use client";

import React, { useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";

export function CreateDeptTaskModalContent({
  deptId,
  onCancel,
}: {
  deptId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();

  const members = store.getDepartmentMembers(deptId);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Inspection");
  const [priority, setPriority] = useState("Normal");
  const [dueTime, setDueTime] = useState("03:00 PM");
  const [assigneeId, setAssigneeId] = useState(members[0]?.userId || "usr_nusrat");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg("Task description is required.");
      return;
    }
    mutate((s) =>
      s.createMemberTask(assigneeId, deptId, cleanTitle, priority, dueTime.trim(), category)
    );
    closeModal();
    showToast("Task added to department operational queue.", "success");
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

        <form id="create-dept-task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Description / Duty *
            </label>
            <input
              type="text"
              id="task-title"
              className="form-input"
              placeholder="e.g. Inspect dock container crane safety seal"
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
              <label className="form-label" htmlFor="task-category">
                Category *
              </label>
              <select
                id="task-category"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Inspection">Inspection</option>
                <option value="Compliance">Compliance</option>
                <option value="Dispatch">Dispatch</option>
                <option value="Security">Security</option>
                <option value="Reporting">Reporting</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority *
              </label>
              <select
                id="task-priority"
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">
                Due Time
              </label>
              <input
                type="text"
                id="task-due"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">
                Assign To Member
              </label>
              <select
                id="task-assignee"
                className="form-input"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                {members.length === 0 ? (
                  <option value="usr_nusrat">Default Staff</option>
                ) : (
                  members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name} ({m.deptRole})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
          Queue Task
        </button>
      </div>
    </>
  );
}

export function AssignDeptMemberModalContent({
  deptId,
  onCancel,
}: {
  deptId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();

  const dept = store.getDepartmentById(deptId);
  const office = dept ? store.getOfficeById(dept.officeId) : null;
  const officeStaff = office ? store.getOfficeStaff(office.id) : [];

  const [selectedUserId, setSelectedUserId] = useState(officeStaff[0]?.userId || "");
  const [role, setRole] = useState("Operations Specialist");
  const [shift, setShift] = useState("Morning (08:00 - 16:00)");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedUserId) return;
    mutate((s) => s.addDepartmentMember(deptId, selectedUserId, role, shift));
    closeModal();
    showToast("Staff member assigned to department roster.", "success");
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <form id="assign-dept-member-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="dm-user">
              Select Office Staff Member *
            </label>
            <select
              id="dm-user"
              className="form-input"
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {officeStaff.length === 0 ? (
                <option disabled value="">
                  No staff assigned to office branch
                </option>
              ) : (
                officeStaff.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.user.name} ({s.officeRole})
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="dm-role">
                Department Role *
              </label>
              <select
                id="dm-role"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Department Lead">Department Lead</option>
                <option value="Senior Specialist">Senior Specialist</option>
                <option value="Operations Specialist">Operations Specialist</option>
                <option value="Field Operator">Field Operator</option>
                <option value="Support Technician">Support Technician</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dm-shift">
                Shift Rotation
              </label>
              <select
                id="dm-shift"
                className="form-input"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selectedUserId}
          onClick={() => handleSubmit()}
        >
          Assign to Department
        </button>
      </div>
    </>
  );
}
