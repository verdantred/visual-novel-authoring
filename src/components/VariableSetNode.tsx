import { Handle, Position, NodeProps } from "reactflow";
import { VariableSetData } from "../types";
import { useProjectStore } from "../store/projectStore";
import "./VariableSetNode.css";

const VariableSetNode = ({
  data,
  isConnectable,
}: NodeProps<VariableSetData>) => {
  // Get variables from the current graph in the project store
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();
  const variables = currentGraphData?.variables ?? [];
  const variable = variables.find((v) => v.id === data.variableId);
  const variableName = variable ? variable.name : "Select Variable";
  const displayValue =
    data.newValue !== undefined ? String(data.newValue) : "Set Value";

  return (
    <div className="react-flow__node-default variable-set-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="variable-set-node-handle"
      />
      <div className="variable-set-node-content">
        <div className="variable-set-node-title">Set Variable</div>
        <div className="variable-set-node-details">
          <span>{variableName}</span>
          <span> = </span>
          <span>{displayValue}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="variable-set-node-handle"
      />
    </div>
  );
};

export default VariableSetNode;
