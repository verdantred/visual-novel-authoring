import { useState, useEffect, ChangeEvent, useMemo } from "react";
import { EditableNode, ConditionData, ComparisonOperator } from "../types";
import { useProjectStore } from "../store/projectStore";

interface ConditionNodePanelProps {
  node: EditableNode; // Node should have ConditionData
  onUpdateNode: (nodeId: string, data: Partial<ConditionData>) => void;
}

const ConditionNodePanel = ({
  node,
  onUpdateNode,
}: ConditionNodePanelProps) => {
  const { variableId, operator, value } = node.data as ConditionData;
  // Get variables from the current graph in the project store
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();
  const variables = useMemo(
    () => currentGraphData?.variables ?? [],
    [currentGraphData?.variables]
  );

  // Local state for editing
  const [currentVariableId, setCurrentVariableId] = useState(variableId || "");
  const [currentOperator, setCurrentOperator] = useState<ComparisonOperator>(
    operator || "=="
  );
  const [currentValue, setCurrentValue] = useState<string | number | boolean>(
    value !== undefined ? value : ""
  );
  const [valueType, setValueType] = useState<"string" | "number" | "boolean">(
    "string"
  );

  // Update local state if the selected node changes externally
  useEffect(() => {
    const data = node.data as ConditionData;
    setCurrentVariableId(data.variableId || "");
    setCurrentOperator(data.operator || "==");
    setCurrentValue(data.value !== undefined ? data.value : "");

    // Determine value type based on selected variable or existing value
    const selectedVar = variables.find((v) => v.id === data.variableId);
    if (selectedVar) {
      setValueType(typeof selectedVar.value as "string" | "number" | "boolean");
      setCurrentValue(data.value !== undefined ? data.value : "");
    } else if (data.value !== undefined) {
      setValueType(typeof data.value as "string" | "number" | "boolean");
    } else {
      setValueType("string"); // Default if no variable/value
    }
  }, [node.id, node.data, variables]); // Rerun if node or variables change

  const handleVariableChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newVarId = e.target.value;
    setCurrentVariableId(newVarId);
    const selectedVar = variables.find((v) => v.id === newVarId);
    let newValue: string | number | boolean = ""; // Reset value on variable change
    let newType: "string" | "number" | "boolean" = "string";

    if (selectedVar) {
      newType = typeof selectedVar.value as "string" | "number" | "boolean";
      // Set default value based on type
      if (newType === "number") newValue = 0;
      else if (newType === "boolean") newValue = false;
      else newValue = "";
    }
    setValueType(newType);
    setCurrentValue(newValue);
    onUpdateNode(node.id, { variableId: newVarId, value: newValue }); // Update store immediately
  };

  const handleOperatorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newOperator = e.target.value as ComparisonOperator;
    setCurrentOperator(newOperator);
    onUpdateNode(node.id, { operator: newOperator });
  };

  const handleValueChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let newValue: string | number | boolean = e.target.value;
    if (valueType === "number") {
      newValue = Number(e.target.value);
      // Basic validation, could be improved
      if (isNaN(newValue)) {
        console.warn("Invalid number input");
        return; // Prevent update with NaN
      }
    } else if (valueType === "boolean") {
      newValue = e.target.value === "true";
    }
    setCurrentValue(newValue);
    onUpdateNode(node.id, { value: newValue });
  };

  // Render value input based on the type determined by the selected variable
  const renderValueInput = () => {
    if (!currentVariableId) {
      return <p>Select a variable first.</p>;
    }

    if (valueType === "boolean") {
      return (
        <select
          value={String(currentValue)} // Select expects string values
          onChange={handleValueChange}
          className="panel-input"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    return (
      <input
        type={valueType === "number" ? "number" : "text"}
        value={String(currentValue)}
        onChange={handleValueChange}
        className="panel-input"
        step={valueType === "number" ? "any" : undefined}
      />
    );
  };

  return (
    <div className="node-panel">
      <h4>Condition Settings</h4>
      <div className="panel-field">
        <label htmlFor="variableSelect">Variable:</label>
        <select
          id="variableSelect"
          value={currentVariableId}
          onChange={handleVariableChange}
          className="panel-input"
        >
          <option value="">-- Select Variable --</option>
          {variables.map((variable) => (
            <option key={variable.id} value={variable.id}>
              {variable.name} ({typeof variable.value})
            </option>
          ))}
        </select>
      </div>

      <div className="panel-field">
        <label htmlFor="operatorSelect">Operator:</label>
        <select
          id="operatorSelect"
          value={currentOperator}
          onChange={handleOperatorChange}
          className="panel-input"
          disabled={!currentVariableId} // Disable if no variable selected
        >
          <option value="==">== (Equal)</option>
          <option value="!=">!= (Not Equal)</option>
          {/* Only show comparison operators if type is number */}
          {valueType === "number" && (
            <>
              <option value=">">&gt; (Greater Than)</option>
              <option value="<">&lt; (Less Than)</option>
              <option value=">=">&gt;= (Greater/Equal)</option>
              <option value="<=">&lt;= (Less/Equal)</option>
            </>
          )}
        </select>
      </div>

      <div className="panel-field">
        <label htmlFor="valueInput">Value:</label>
        {renderValueInput()}
      </div>
    </div>
  );
};

export default ConditionNodePanel;
