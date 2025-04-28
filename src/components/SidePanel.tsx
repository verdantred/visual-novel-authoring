import { ResizableBox } from "react-resizable";
import { EditableNode, NodeData, VariableSetData } from "../types";
import EditableNodePanel from "./DialogueNodePanel";
import ChoiceNodePanel from "./ChoiceNodePanel";
import ConditionNodePanel from "./ConditionNodePanel";
import VariableSetNodePanel from "./VariableSetNodePanel";
import "react-resizable/css/styles.css";
import "../App.css";

interface SidePanelProps {
  node: EditableNode | null; // Allow null when no node is selected
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void;
  initialWidth?: number;
}

const SidePanel = ({
  node,
  onClose,
  onUpdateNode,
  initialWidth = 300,
}: SidePanelProps) => {
  // Render nothing if no node is selected
  if (!node) {
    return null;
  }

  // Determine which panel component to render
  const renderPanelContent = () => {
    switch (node.type) {
      case "dialogueNode":
        return <EditableNodePanel node={node} onUpdateNode={onUpdateNode} />;
      case "choiceNode":
        return <ChoiceNodePanel node={node} onUpdateNode={onUpdateNode} />;
      case "conditionNode":
        return <ConditionNodePanel node={node} onUpdateNode={onUpdateNode} />;
      case "variableSetNode":
        return (
          <VariableSetNodePanel
            nodeId={node.id}
            data={node.data as VariableSetData}
            onUpdateNode={onUpdateNode}
          />
        );
      default:
        return <p>Selected node type ({node.type}) has no specific editor.</p>;
    }
  };

  return (
    <ResizableBox
      className="side-panel-resizable"
      width={initialWidth} // Start with initialWidth
      height={Infinity}
      axis="x"
      resizeHandles={["w"]}
      minConstraints={[200, Infinity]}
      maxConstraints={[800, Infinity]}
      handle={<span className="custom-resize-handle" />}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      {/* Actual panel content */}
      <div
        className="side-panel"
        style={{ width: "100%", height: "100%", overflow: "auto" }}
      >
        <button onClick={onClose} className="close-button">
          X
        </button>
        <h2>Node Details</h2>
        {/* Render the appropriate panel based on node type */}
        {renderPanelContent()}
      </div>
    </ResizableBox>
  );
};

export default SidePanel;
