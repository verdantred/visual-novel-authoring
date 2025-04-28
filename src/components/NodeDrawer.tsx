import "../App.css"; // Assuming some styles might be shared or needed

const NodeDrawer = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  // Define node types available in the drawer
  const availableNodes = [
    { type: "dialogueNode", label: "Dialogue Node" },
    { type: "choiceNode", label: "Choice Node" },
    { type: "conditionNode", label: "Condition Node" },
    { type: "variableSetNode", label: "Set Variable Node" },
  ];

  return (
    <aside className="node-drawer">
      <div className="drawer-header">Add Nodes</div>
      <div className="drawer-content">
        {availableNodes.map((node) => (
          <div
            key={node.type}
            className="draggable-node"
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            {node.label}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NodeDrawer;
