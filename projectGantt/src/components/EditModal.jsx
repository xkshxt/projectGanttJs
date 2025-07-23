// src/components/EditModal.jsx
import React, { useState, useEffect } from "react";
import "../styles/modal.css";

const EditModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState(task);

  useEffect(() => {
    setForm(task);
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Task</h3>
        <label>
          Name:
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Start Date:
          <input name="start" type="date" value={form.start} onChange={handleChange} />
        </label>
        <label>
          End Date:
          <input name="end" type="date" value={form.end} onChange={handleChange} />
        </label>
        <label>
          Progress:
          <input name="progress" type="number" min="0" max="100" value={form.progress} onChange={handleChange} />
        </label>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose} className="cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
