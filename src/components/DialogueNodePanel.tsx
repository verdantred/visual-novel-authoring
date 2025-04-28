import { useState, useEffect, ChangeEvent } from "react";
import { EditableNode, DialogueNodeData, NodeData } from "../types";

interface DialogueNodePanelProps {
  node: EditableNode; // The specific node being edited
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void;
}

const DialogueNodePanel = ({ node, onUpdateNode }: DialogueNodePanelProps) => {
  // Ensure data is treated as DialogueNodeData
  const nodeData = node.data as DialogueNodeData;

  const [character, setCharacter] = useState(nodeData.character || "");
  const [dialogue, setDialogue] = useState(nodeData.dialogue || "");

  useEffect(() => {
    // Update state if the selected node changes
    const currentData = node.data as DialogueNodeData;
    setCharacter(currentData.character || "");
    setDialogue(currentData.dialogue || "");
  }, [node]);

  const handleCharacterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCharacter(event.target.value);
  };

  const handleDialogueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDialogue(event.target.value);
  };

  const handleBlur = () => {
    const updatedData: Partial<DialogueNodeData> = {
      character: character,
      dialogue: dialogue,
    };
    // Only call update if data actually changed (optional optimization)
    if (character !== nodeData.character || dialogue !== nodeData.dialogue) {
      onUpdateNode(node.id, updatedData);
    }
  };

  return (
    <>
      <div>
        <label htmlFor="nodeCharacter">
          <strong>Character:</strong>
        </label>
        <input
          id="nodeCharacter"
          type="text"
          value={character}
          onChange={handleCharacterChange}
          onBlur={handleBlur}
          style={{ width: "90%", marginBottom: "10px" }}
        />
      </div>
      <div>
        <label htmlFor="nodeDialogue">
          <strong>Dialogue:</strong>
        </label>
        <textarea
          id="nodeDialogue"
          value={dialogue}
          onChange={handleDialogueChange}
          onBlur={handleBlur}
          rows={4}
          style={{ width: "90%", marginBottom: "10px" }}
        />
      </div>
    </>
  );
};

export default DialogueNodePanel;
