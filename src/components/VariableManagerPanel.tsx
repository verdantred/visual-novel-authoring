import { ChangeEvent, useState } from "react";
import { useGraphStore } from "../store/graphStore";
import { useProjectStore } from "../store/projectStore";
import { GameVariable } from "../types";
import "./VariableManagerPanel.css";

interface VariableManagerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VariableManagerPanel = ({
  isOpen,
  onClose,
}: VariableManagerPanelProps) => {
  // Get current graph data from project store
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();
  const variables = currentGraphData?.variables ?? []; // Get variables or default to empty array

  const addVariable = useGraphStore((state) => state.addVariable);
  const updateVariable = useGraphStore((state) => state.updateVariable);
  const deleteVariable = useGraphStore((state) => state.deleteVariable);

  const [newVarName, setNewVarName] = useState("");
  const [newVarValue, setNewVarValue] = useState<string | number | boolean>("");
  const [newVarType, setNewVarType] = useState<"string" | "number" | "boolean">(
    "string"
  );

  // State for editing
  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [editingVarName, setEditingVarName] = useState("");
  const [editingVarValue, setEditingVarValue] = useState<
    string | number | boolean
  >("");

  const handleAddVariable = () => {
    if (!newVarName.trim()) {
      alert("Variable name cannot be empty.");
      return;
    }
    let value: string | number | boolean = newVarValue;
    if (newVarType === "number") {
      value = Number(newVarValue);
      if (isNaN(value)) {
        alert("Invalid number value.");
        return;
      }
    } else if (newVarType === "boolean") {
      value = String(newVarValue).toLowerCase() === "true";
    }
    addVariable(newVarName.trim(), value);
    setNewVarName("");
    setNewVarValue("");
    setNewVarType("string");
  };

  const handleStartEdit = (variable: GameVariable) => {
    setEditingVarId(variable.id);
    setEditingVarName(variable.name);
    setEditingVarValue(variable.value);
  };

  const handleCancelEdit = () => {
    setEditingVarId(null);
    setEditingVarName("");
    setEditingVarValue("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editingVarName.trim()) {
      alert("Variable name cannot be empty.");
      return;
    }
    let value: string | number | boolean = editingVarValue;
    const currentVar = variables.find((v) => v.id === id);
    if (!currentVar) return; // Should not happen

    const currentType = typeof currentVar.value;

    if (currentType === "number") {
      value = Number(editingVarValue);
      if (isNaN(value)) {
        alert("Invalid number value.");
        handleCancelEdit(); // Reset edit state on error
        return;
      }
    } else if (currentType === "boolean") {
      value = String(editingVarValue).toLowerCase() === "true";
    } else {
      // Keep as string if original was string
      value = String(editingVarValue);
    }

    updateVariable(id, value);
    handleCancelEdit(); // Exit editing mode
  };

  const renderValueInput = (
    value: string | number | boolean,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
    type: "string" | "number" | "boolean"
  ) => {
    if (type === "boolean") {
      return (
        <select
          value={String(value)}
          onChange={onChange}
          className="variable-input variable-value-input"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    return (
      <input
        type={type === "number" ? "number" : "text"}
        value={String(value)}
        onChange={onChange}
        className="variable-input variable-value-input"
        step={type === "number" ? "any" : undefined} // Allow decimals for numbers
      />
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="variable-manager-overlay" onClick={onClose}>
      <div
        className="variable-manager-panel"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside panel from closing it
      >
        <button onClick={onClose} className="close-button panel-close-button">
          X
        </button>
        <h2>Manage Game Variables</h2>

        {/* Add New Variable Section */}
        <div className="variable-add-section">
          <h3>Add New Variable</h3>
          <input
            type="text"
            placeholder="Variable Name"
            value={newVarName}
            onChange={(e) => setNewVarName(e.target.value)}
            className="variable-input"
          />
          <select
            value={newVarType}
            onChange={(e) =>
              setNewVarType(e.target.value as "string" | "number" | "boolean")
            }
            className="variable-input variable-type-select"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
          {renderValueInput(
            newVarValue,
            (e) => setNewVarValue(e.target.value),
            newVarType
          )}
          <button
            onClick={handleAddVariable}
            className="variable-button add-button"
          >
            Add
          </button>
        </div>

        {/* Existing Variables List */}
        <div className="variable-list-section">
          <h3>Existing Variables</h3>
          {variables.length === 0 ? (
            <p>No variables defined yet.</p>
          ) : (
            <ul className="variable-list">
              {variables.map((variable) => (
                <li key={variable.id} className="variable-item">
                  {editingVarId === variable.id ? (
                    // Editing View
                    <>
                      <input
                        type="text"
                        value={editingVarName}
                        onChange={(e) => setEditingVarName(e.target.value)}
                        className="variable-input variable-name-input"
                      />
                      {renderValueInput(
                        editingVarValue,
                        (e) => setEditingVarValue(e.target.value),
                        typeof variable.value as "string" | "number" | "boolean" // Use original type for input rendering
                      )}
                      <div className="variable-actions">
                        <button
                          onClick={() => handleSaveEdit(variable.id)}
                          className="variable-button save-button"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="variable-button cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    // Display View
                    <>
                      <span className="variable-name">{variable.name}</span>
                      <span className="variable-value">
                        ({typeof variable.value}): {String(variable.value)}
                      </span>
                      <div className="variable-actions">
                        <button
                          onClick={() => handleStartEdit(variable)}
                          className="variable-button edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVariable(variable.id)}
                          className="variable-button delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariableManagerPanel;
