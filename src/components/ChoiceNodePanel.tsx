import { useState, useEffect } from "react";
import { EditableNode, ChoiceData, NodeData } from "../types";

interface ChoiceNodePanelProps {
  node: EditableNode; // The specific choice node being edited
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void;
}

const ChoiceNodePanel = ({ node, onUpdateNode }: ChoiceNodePanelProps) => {
  // Ensure data is treated as ChoiceData
  const nodeData = node.data as ChoiceData;

  const [choices, setChoices] = useState<string[]>(nodeData.choices || []);
  const [newChoice, setNewChoice] = useState<string>("");

  useEffect(() => {
    // Update state if the selected node changes or its data updates externally
    const currentData = node.data as ChoiceData;
    setChoices(currentData.choices || []);
  }, [node]);

  const handleNewChoiceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewChoice(event.target.value);
  };

  const addChoice = () => {
    if (newChoice.trim() === "") return; // Don't add empty choices
    const updatedChoices = [...choices, newChoice.trim()];
    setChoices(updatedChoices);
    onUpdateNode(node.id, { choices: updatedChoices });
    setNewChoice(""); // Clear input field
  };

  const removeChoice = (indexToRemove: number) => {
    const updatedChoices = choices.filter(
      (_, index) => index !== indexToRemove
    );
    setChoices(updatedChoices);
    onUpdateNode(node.id, { choices: updatedChoices });
  };

  return (
    <div>
      <label htmlFor="newChoiceInput">
        <strong>Add Choice:</strong>
      </label>
      <div style={{ display: "flex", marginBottom: "10px" }}>
        <input
          id="newChoiceInput"
          type="text"
          value={newChoice}
          onChange={handleNewChoiceChange}
          placeholder="Enter choice text"
          style={{ flexGrow: 1, marginRight: "5px" }}
        />
        <button onClick={addChoice}>Add</button>
      </div>

      <label>
        <strong>Current Choices:</strong>
      </label>
      {choices.length === 0 ? (
        <p style={{ fontStyle: "italic", color: "#888" }}>
          No choices defined yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {choices.map((choice, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <span>{choice}</span>
              {/* Add edit functionality here if needed */}
              <button
                onClick={() => removeChoice(index)}
                style={{
                  marginLeft: "10px",
                  color: "red",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                title="Remove choice"
              >
                X
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChoiceNodePanel;
