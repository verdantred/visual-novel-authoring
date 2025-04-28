import { useEffect, useMemo } from "react";
import { Handle, Position, NodeProps, useUpdateNodeInternals } from "reactflow";
import { TbArrowFork } from "react-icons/tb";
import { ChoiceData } from "../types";

const ChoiceNode = ({
  id,
  data,
  isConnectable,
  selected,
}: NodeProps<ChoiceData>) => {
  const updateNodeInternals = useUpdateNodeInternals();
  // Ensure data exists and has choices, provide default empty array if not
  const choices = useMemo(() => data?.choices || [], [data?.choices]);
  const nodeWidth = 50; // Use a fixed width

  useEffect(() => {
    updateNodeInternals(id);
  }, [choices, id, updateNodeInternals]);

  return (
    <div
      className="editable-node choice-node" // Added choice-node class for potential specific styling
      // Apply base styles via className, use inline styles only for dynamic parts like border
      style={{
        border: `1px solid ${selected ? "#777" : "var(--button-border)"}`, // Use theme border, highlight if selected
        width: `${nodeWidth}px`, // Set a fixed width
        // paddingBottom removed
        position: "relative", // Needed for absolute positioning of icon and relative positioning of handles
      }}
    >
      {/* Input Handle (Top Center) */}
      <Handle
        type="target"
        position={Position.Top}
        id="input" // Single input handle
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />

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
        title="Node Type: Choice" // Tooltip
      >
        <TbArrowFork style={{ rotate: "135deg" }} />
      </div>

      {/* Output Handles (Dynamically created on the Bottom) */}
      {choices.map((_choice, index) => {
        // Calculate horizontal position for each handle
        const handleSpacing = nodeWidth / (choices.length + 1);
        const handleLeftPosition = handleSpacing * (index + 1);

        // Only render the Handle now
        return (
          <Handle
            key={`choice-handle-${index}`} // Ensure unique key for handle
            type="source"
            position={Position.Bottom} // Changed position to Bottom
            // Create a unique ID for each handle based on index
            id={`choice-${index}`}
            // Position handles horizontally along the bottom edge
            style={{
              left: `${handleLeftPosition}px`, // Use left for horizontal positioning
              background: "#555",
            }}
            isConnectable={isConnectable}
          />
        );
      })}
    </div>
  );
};

export default ChoiceNode;
