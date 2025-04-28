import { useCallback } from "react";
import { Handle, Position, NodeProps, useViewport } from "reactflow";
import { BsChatSquareText } from "react-icons/bs";
import { useGraphStore } from "../store/graphStore";
import { DialogueNodeData } from "../types";

// Define the props specifically for our node data
type DialogueNodeProps = NodeProps<DialogueNodeData>;

// Zoom level threshold for showing dialogue
const DIALOGUE_ZOOM_THRESHOLD = 1.0;

const DialogueNode = ({
  id,
  data,
  isConnectable,
  selected,
}: DialogueNodeProps) => {
  // Get current viewport zoom level
  const { zoom } = useViewport();

  // Select actions from the store
  const deleteNode = useGraphStore((state) => state.deleteNode); // Get deleteNode action

  const handleDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  return (
    <div
      className="editable-node"
      // Apply base styles via className, use inline styles only for dynamic parts like border
      style={{
        border: `1px solid ${selected ? "#777" : "var(--button-border)"}`, // Use theme border, highlight if selected
      }}
    >
      {/* Node Type Icon */}
      <div
        style={{
          position: "absolute",
          top: "-10px", // Position slightly outside the top-left
          left: "-10px",
          background: "rgba(0, 0, 0, 0.75)", // Semi-transparent background
          color: "white", // Icon color
          border: "none",
          borderRadius: "50%", // Make it circular
          width: "22px", // Small size
          height: "22px",
          fontSize: "12px", // Small icon size
          display: "flex", // Use flexbox for centering
          alignItems: "center", // Center vertically
          justifyContent: "center", // Center horizontally
          cursor: "default", // Indicate it's not clickable
          zIndex: 10, // Ensure it's above other elements
        }}
        title="Node Type: Dialogue" // Tooltip
      >
        <BsChatSquareText />
      </div>

      {/* Character Tag */}
      {data.character && (
        <div
          style={{
            position: "absolute",
            top: "-10px", // Position slightly outside the top
            left: "18px", // Position next to the type icon
            background: "rgba(0, 100, 255, 0.8)", // Blue background
            color: "white",
            padding: "2px 6px",
            borderRadius: "10px", // Rounded corners
            fontSize: "10px",
            fontWeight: "bold",
            cursor: "default",
            zIndex: 10,
            whiteSpace: "nowrap", // Prevent wrapping
          }}
          title={`Character: ${data.character}`} // Tooltip
        >
          {data.character}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: "#555", width: "8px", height: "8px" }}
      />

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          bottom: "-8px", // Position slightly outside the top-right
          right: "-8px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "50%", // Make it circular
          width: "16px", // Small size
          height: "16px",
          fontSize: "10px", // Small font size for 'X'
          lineHeight: "16px", // Center the 'X' vertically
          textAlign: "center",
          cursor: "pointer",
          padding: 0, // Remove default padding
          zIndex: 10, // Ensure it's above other elements
          display: selected ? "block" : "none", // Only show when node is selected
        }}
        title="Delete Node" // Tooltip
      >
        X
      </button>

      {/* Display dialogue content directly */}
      {/* Conditionally display dialogue based on zoom level */}
      {zoom > DIALOGUE_ZOOM_THRESHOLD && data.dialogue && (
        <div
          style={{
            marginTop: "5px",
            fontSize: "0.9em", // Smaller font size for dialogue
            color: "#AAA", // Dimmed color
            whiteSpace: "pre-wrap", // Respect newlines in dialogue
            wordBreak: "break-word", // Prevent long words from overflowing
            maxHeight: "200px", // Limit height and allow scrolling if needed
            maxWidth: "200px",
            overflowY: "auto",
          }}
        >
          {data.dialogue}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: "#555", width: "8px", height: "8px" }}
      />
    </div>
  );
};

export default DialogueNode;
