import { useState, useEffect, useMemo } from "react";
import { useProjectStore } from "../store/projectStore";
import {
  EditableNode,
  BasicEdge,
  ConditionData,
  GameVariable,
  VariableSetData,
} from "../types";
import VNNodeDisplay from "./VNNodeDisplay";
import VNDebugPanel from "./VNDebugPanel";
import "./VNPlayer.css";

interface VNPlayerProps {
  onClose: () => void; // Function to close the player
}

const VNPlayer = ({ onClose }: VNPlayerProps) => {
  // Get current graph data from project store
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();

  // Extract nodes, edges, and variables, defaulting to empty arrays
  const nodes = useMemo(
    () => currentGraphData?.nodes ?? [],
    [currentGraphData?.nodes]
  );
  const edges = useMemo(
    () => currentGraphData?.edges ?? [],
    [currentGraphData?.edges]
  );
  const initialVariables = useMemo(
    () => currentGraphData?.variables ?? [],
    [currentGraphData?.variables]
  );

  const [currentNodeId, setCurrentNodeId] = useState<string | null>("start"); // Assuming 'start' is the initial node ID
  const [currentVariables, setCurrentVariables] = useState<GameVariable[]>([]);
  const [currentNode, setCurrentNode] = useState<EditableNode | null>(null);
  const [outgoingEdges, setOutgoingEdges] = useState<BasicEdge[]>([]);

  // Effect 1: Initialize currentVariables when initialVariables load
  useEffect(() => {
    // Deep copy initial variables for playthrough state only once
    setCurrentVariables(JSON.parse(JSON.stringify(initialVariables)));
  }, [initialVariables]); // Depend only on initialVariables

  // Effect 2: Update current node and outgoing edges based on ID
  useEffect(() => {
    if (!currentNodeId) {
      setCurrentNode(null);
      setOutgoingEdges([]);
      return;
    }

    const node = nodes.find((n) => n.id === currentNodeId);
    if (node) {
      setCurrentNode(node);
      const edgesFromNode = edges.filter(
        (edge) => edge.source === currentNodeId
      );
      setOutgoingEdges(edgesFromNode);
    } else {
      console.error(`Node with ID ${currentNodeId} not found!`);
      setCurrentNode(null);
      setOutgoingEdges([]);
    }
  }, [currentNodeId, nodes, edges]); // Rerun when ID, nodes, or edges change

  // Effect 3: Handle auto-advancing nodes when currentNode is set
  useEffect(() => {
    if (!currentNode || !currentNode.data) return; // Nothing to do if no node or data

    if (currentNode.type === "conditionNode") {
      // Delay slightly to allow rendering the "Evaluating..." message
      const timeoutId = setTimeout(
        () =>
          handleConditionNode(currentNode.data as ConditionData, outgoingEdges),
        50 // Keep delay for condition node feedback
      );
      return () => clearTimeout(timeoutId); // Cleanup timeout on effect re-run/unmount
    } else if (currentNode.type === "variableSetNode") {
      const timeoutId = setTimeout(
        () => handleVariableSetNode(currentNode.data as VariableSetData),
        50 // Keep delay for condition node feedback
      );
      return () => clearTimeout(timeoutId); // Cleanup timeout on effect re-run/unmount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNode]); // Rerun only when the currentNode object changes

  // --- Condition Evaluation ---
  const evaluateCondition = (condition: ConditionData): boolean => {
    if (
      !condition.variableId ||
      !condition.operator ||
      condition.value === undefined
    ) {
      console.warn("Incomplete condition data:", condition);
      return false; // Default to false if condition is incomplete
    }
    const variable = currentVariables.find(
      (v) => v.id === condition.variableId
    );
    if (!variable) {
      console.warn(
        `Variable with ID ${condition.variableId} not found for condition.`
      );
      return false; // Variable not found
    }

    const varValue = variable.value;
    const compareValue = condition.value;

    // Basic type coercion (consider more robust handling if needed)
    const valA = typeof varValue === "string" ? varValue : Number(varValue);
    const valB =
      typeof compareValue === "string" ? compareValue : Number(compareValue);

    switch (condition.operator) {
      case "==":
        return valA == valB; // Use loose equality for now
      case "!=":
        return valA != valB;
      case ">":
        return (
          typeof valA === "number" && typeof valB === "number" && valA > valB
        );
      case "<":
        return (
          typeof valA === "number" && typeof valB === "number" && valA < valB
        );
      case ">=":
        return (
          typeof valA === "number" && typeof valB === "number" && valA >= valB
        );
      case "<=":
        return (
          typeof valA === "number" && typeof valB === "number" && valA <= valB
        );
      default:
        console.warn(`Unsupported operator: ${condition.operator}`);
        return false;
    }
  };

  // --- Node Handlers ---
  const handleNext = () => {
    // Simple case: follow the first (and likely only) outgoing edge for dialogue/set nodes
    if (outgoingEdges.length > 0) {
      setCurrentNodeId(outgoingEdges[0].target);
    } else {
      console.log("End of dialogue branch.");
      setCurrentNodeId(null); // End of this path
    }
  };

  const handleChoice = (targetNodeId: string) => {
    setCurrentNodeId(targetNodeId);
  };

  const handleConditionNode = (
    data: ConditionData,
    edgesFromNode: BasicEdge[]
  ) => {
    const result = evaluateCondition(data);
    const targetEdge = edgesFromNode.find(
      (edge) => edge.sourceHandle === String(result)
    ); // Find edge for 'true' or 'false'

    if (targetEdge) {
      console.log(
        `Condition evaluated to ${result}, moving to ${targetEdge.target}`
      );
      setCurrentNodeId(targetEdge.target);
    } else {
      console.warn(`No outgoing edge found for condition result: ${result}`);
      setCurrentNodeId(null); // End path if no valid edge
    }
  };

  // --- Handler for Variable Set Node ---
  const handleVariableSetNode = (data: VariableSetData) => {
    if (!data.variableId || data.newValue === undefined) {
      console.warn("Incomplete variable set data:", data);
      handleNext(); // Use handleNext to find the single outgoing edge
      return;
    }

    const targetVariable = currentVariables.find(
      (v) => v.id === data.variableId
    );

    if (!targetVariable) {
      console.warn(`Variable with ID ${data.variableId} not found to set.`);
      handleNext(); // Move to next node even if variable not found
      return;
    }

    // Parse the newValue based on the original variable type
    let parsedValue: string | number | boolean;
    const originalType = typeof targetVariable.value;
    const newValueStr = String(data.newValue); // Ensure it's a string first

    if (originalType === "number") {
      parsedValue = parseFloat(newValueStr);
      if (isNaN(parsedValue)) {
        console.warn(
          `Could not parse "${newValueStr}" as number for variable ${targetVariable.name}. Defaulting to 0.`
        );
        parsedValue = 0;
      }
    } else if (originalType === "boolean") {
      // Handle common boolean strings (case-insensitive)
      const lowerVal = newValueStr.toLowerCase();
      if (lowerVal === "true" || lowerVal === "1" || lowerVal === "yes") {
        parsedValue = true;
      } else if (
        lowerVal === "false" ||
        lowerVal === "0" ||
        lowerVal === "no"
      ) {
        parsedValue = false;
      } else {
        console.warn(
          `Could not parse "${newValueStr}" as boolean for variable ${targetVariable.name}. Defaulting to false.`
        );
        parsedValue = false; // Default boolean value
      }
    } else {
      // Default to string
      parsedValue = newValueStr;
    }

    // Update the variable in the current playthrough state
    setCurrentVariables((prevVars) =>
      prevVars.map((v) =>
        v.id === data.variableId ? { ...v, value: parsedValue } : v
      )
    );

    console.log(`Variable "${targetVariable.name}" set to:`, parsedValue);

    // Variable set nodes should have only one output, use handleNext
    handleNext();
  };

  return (
    <div className="vn-player-overlay">
      <div className="vn-player-content">
        <button onClick={onClose} className="vn-close-button">
          X
        </button>
        <h2>Visual Novel Test</h2>
        <div className="vn-display-area">
          {/* Use the new display component */}
          <VNNodeDisplay
            currentNode={currentNode}
            outgoingEdges={outgoingEdges}
            handleNext={handleNext}
            handleChoice={handleChoice}
          />
        </div>
        {/* Use the new debug panel component */}
        <VNDebugPanel currentVariables={currentVariables} />
      </div>
    </div>
  );
};

export default VNPlayer;
