import { Handle, Position, NodeProps } from "reactflow";
import { ConditionData } from "../types";
import { useProjectStore } from "../store/projectStore";

const ConditionNode = ({ data, isConnectable }: NodeProps<ConditionData>) => {
  // Get variables from the current graph in the project store
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();
  const variables = currentGraphData?.variables ?? [];
  const variable = variables.find((v) => v.id === data.variableId);

  const getDisplayValue = (value: string | number | boolean | undefined) => {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (value === undefined || value === null) {
      return "?";
    }
    return String(value);
  };

  const conditionText = variable
    ? `${variable.name} ${data.operator || "?"} ${getDisplayValue(data.value)}`
    : "Configure Condition";

  return (
    <div className="react-flow__node-default condition-node">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        id="input"
        className="condition-handle"
      />

      {/* Node Content */}
      <div className="condition-node-content">
        <div>If</div>
        <div className="condition-text">{conditionText}</div>
      </div>

      {/* Output Handles */}
      <div className="condition-handles-container">
        <div className="handle-label-group">
          <Handle
            type="source"
            position={Position.Bottom}
            id="true" // Specific ID for the true path
            isConnectable={isConnectable}
            className="condition-handle condition-handle-true"
            style={{ left: "25%" }}
          />
          <label htmlFor="true" className="handle-label">
            True
          </label>
        </div>
        <div className="handle-label-group">
          <Handle
            type="source"
            position={Position.Bottom}
            id="false" // Specific ID for the false path
            isConnectable={isConnectable}
            className="condition-handle condition-handle-false"
            style={{ left: "75%" }}
          />
          <label htmlFor="false" className="handle-label">
            False
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConditionNode;
