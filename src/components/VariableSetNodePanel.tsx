import { useState, useEffect, ChangeEvent, useMemo } from "react";
import { VariableSetData, GameVariable } from "../types";
import { useProjectStore } from "../store/projectStore";
import "./VariableSetNodePanel.css";

interface VariableSetNodePanelProps {
  nodeId: string;
  data: VariableSetData;
  onUpdateNode: (nodeId: string, data: Partial<VariableSetData>) => void;
}

const VariableSetNodePanel = ({
  nodeId,
  data,
  onUpdateNode,
}: VariableSetNodePanelProps) => {
  // Get variables from the current graph in the project store
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();
  // Memoize variables to prevent unnecessary re-renders if other graph data changes
  const variables = useMemo(
    () => currentGraphData?.variables ?? [],
    [currentGraphData?.variables]
  );

  const [selectedVariableId, setSelectedVariableId] = useState<string>(
    data.variableId || ""
  );
  const [newValue, setNewValue] = useState<string>(
    data.newValue !== undefined ? String(data.newValue) : ""
  );

  // Update local state if node data changes externally (e.g., undo/redo)
  useEffect(() => {
    setSelectedVariableId(data.variableId || "");
    setNewValue(data.newValue !== undefined ? String(data.newValue) : "");
  }, [data]);

  const handleVariableChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newId = event.target.value;
    setSelectedVariableId(newId);
    onUpdateNode(nodeId, { variableId: newId });
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const valStr = event.target.value;
    setNewValue(valStr);
    onUpdateNode(nodeId, { newValue: valStr }); // Store as string for now
  };

  return (
    <div className="variable-set-node-panel">
      <h4>Set Variable Node</h4>
      <div className="form-group">
        <label htmlFor={`variable-select-${nodeId}`}>Variable:</label>
        <select
          id={`variable-select-${nodeId}`}
          value={selectedVariableId}
          onChange={handleVariableChange}
        >
          <option value="" disabled>
            -- Select Variable --
          </option>
          {variables.map((variable: GameVariable) => (
            <option key={variable.id} value={variable.id}>
              {variable.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={`value-input-${nodeId}`}>New Value:</label>
        <input
          id={`value-input-${nodeId}`}
          type="text" // Using text for now, consider dynamic type later
          value={newValue}
          onChange={handleValueChange}
          placeholder="Enter new value"
          disabled={!selectedVariableId} // Disable if no variable selected
        />
        {/* Add parsing hints or validation based on selected variable type later */}
      </div>
    </div>
  );
};

export default VariableSetNodePanel;
