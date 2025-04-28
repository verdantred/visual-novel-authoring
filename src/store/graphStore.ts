// src/store/graphStore.ts

import { create } from "zustand";
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from "reactflow";
import { nanoid } from "nanoid"; // Use nanoid for IDs

import {
  EditableNode,
  BasicEdge,
  NodeData,
  GameVariable,
  // Removed unused specific data types like ChoiceData, etc.
} from "../types";
import { useProjectStore } from "./projectStore"; // Import the project store

// Define the state managed *by this store* specifically
interface GraphViewInteractionState {
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;

  // Actions that operate on the *current* graph in projectStore
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position: XYPosition, nodeType: string) => EditableNode | null; // Can return null if no graph selected
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  addVariable: (name: string, value: string | number | boolean) => void;
  updateVariable: (id: string, value: string | number | boolean) => void;
  deleteVariable: (id: string) => void;
}

// Define the store *without* persistence for interaction state
export const useGraphStore = create<GraphViewInteractionState>((set, get) => ({
  selectedNodeId: null, // Initialize selectedNodeId

  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    const nextNodes = applyNodeChanges(changes, currentGraph.nodes);
    // Only update if changes actually occurred to prevent unnecessary re-renders
    if (nextNodes !== currentGraph.nodes) {
      updateGraphData(currentGraphId, { nodes: nextNodes });
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    const nextEdges = applyEdgeChanges(changes, currentGraph.edges);
    // Only update if changes actually occurred
    if (nextEdges !== currentGraph.edges) {
      updateGraphData(currentGraphId, { edges: nextEdges });
    }
  },

  onConnect: (connection: Connection) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    // Determine edge label based on source node type and handle (similar logic as before)
    let edgeLabel = "";
    if (connection.source && connection.target) {
      const sourceNode = currentGraph.nodes.find(
        (node) => node.id === connection.source
      );
      if (sourceNode) {
        if (sourceNode.type === "choiceNode") {
          if (
            connection.sourceHandle &&
            connection.sourceHandle.startsWith("choice-")
          ) {
            const choiceIndexStr = connection.sourceHandle.split("-")[1];
            const choiceIndex = parseInt(choiceIndexStr, 10);
            // We need to assert the type here as NodeData is a union
            const choiceData = sourceNode.data as { choices?: string[] };
            if (
              choiceData.choices &&
              choiceIndex >= 0 &&
              choiceIndex < choiceData.choices.length
            ) {
              edgeLabel =
                choiceData.choices[choiceIndex] || `Choice ${choiceIndex + 1}`;
            }
          } else {
            console.warn("Invalid connection from ChoiceNode:", connection);
            return; // Prevent edge creation
          }
        } else if (sourceNode.type === "conditionNode") {
          if (connection.sourceHandle === "true") {
            edgeLabel = "True";
          } else if (connection.sourceHandle === "false") {
            edgeLabel = "False";
          } else {
            console.warn("Invalid connection from ConditionNode:", connection);
            return; // Prevent edge creation
          }
        }
        // Add logic for other node types if needed
      }
    } else {
      console.warn("Connection source or target is null:", connection);
      return; // Prevent edge creation if source/target missing
    }

    const newEdge: BasicEdge = {
      id: nanoid(), // Use nanoid
      type: "smoothstep",
      source: connection.source!, // Assert non-null as checked above
      target: connection.target!, // Assert non-null as checked above
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      label: edgeLabel,
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      // data: { label: edgeLabel } // Add label to edge data if needed by BasicEdgeData
    };

    const nextEdges = addEdge(newEdge, currentGraph.edges);
    // Only update if changes actually occurred
    if (nextEdges !== currentGraph.edges) {
      updateGraphData(currentGraphId, { edges: nextEdges });
    }
  },

  addNode: (position: XYPosition, nodeType: string): EditableNode | null => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return null;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return null;

    const newNodeId = nanoid();
    const newNode: EditableNode = {
      id: newNodeId,
      type: nodeType,
      position,
      data: {}, // Initialize with empty data
    };

    // Initialize specific data based on node type
    switch (nodeType) {
      case "editable":
        newNode.data = { character: "", dialogue: "" };
        break;
      case "choice":
        newNode.data = { choices: ["Choice 1"] }; // Default choice
        break;
      case "condition": {
        // Find the first variable to pre-populate, if any
        const firstVarId =
          currentGraph.variables.length > 0 ? currentGraph.variables[0].id : "";
        newNode.data = { variableId: firstVarId, operator: "==", value: "" };
        break;
      }
      case "variableSet": {
        const firstVarIdSet =
          currentGraph.variables.length > 0 ? currentGraph.variables[0].id : "";
        newNode.data = { variableId: firstVarIdSet, newValue: "" };
        break;
      }
      // Add cases for other node types if necessary
    }

    const nextNodes = [...currentGraph.nodes, newNode];
    updateGraphData(currentGraphId, { nodes: nextNodes });
    return newNode; // Return the newly created node
  },

  updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    const nextNodes = currentGraph.nodes.map((node) => {
      if (node.id === nodeId) {
        // Deep merge might be needed depending on data structure,
        // but shallow merge is often sufficient for flat data objects.
        return { ...node, data: { ...node.data, ...data } };
      }
      return node;
    });

    // Check if nodes actually changed before updating to avoid loops/unnecessary renders
    // Simple stringify comparison might be inefficient for large graphs.
    // Consider a more robust check if performance becomes an issue.
    if (JSON.stringify(nextNodes) !== JSON.stringify(currentGraph.nodes)) {
      updateGraphData(currentGraphId, { nodes: nextNodes });
    }
  },

  deleteNode: (nodeId: string) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    const nextNodes = currentGraph.nodes.filter((node) => node.id !== nodeId);
    // Also remove edges connected to the deleted node
    const nextEdges = currentGraph.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    // Deselect if the deleted node was selected
    if (get().selectedNodeId === nodeId) {
      set({ selectedNodeId: null });
    }

    // Update project store only if nodes or edges actually changed
    if (
      nextNodes.length !== currentGraph.nodes.length ||
      nextEdges.length !== currentGraph.edges.length
    ) {
      updateGraphData(currentGraphId, { nodes: nextNodes, edges: nextEdges });
    }
  },

  // --- Game State Actions (operating on current graph's variables) ---
  addVariable: (name: string, value: string | number | boolean) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    // Check if variable name already exists
    if (currentGraph.variables.some((v) => v.name === name)) {
      console.warn(`Variable with name "${name}" already exists.`);
      // Optionally, provide user feedback here
      return;
    }

    const newVariable: GameVariable = { id: nanoid(), name, value };
    const nextVariables = [...currentGraph.variables, newVariable];
    updateGraphData(currentGraphId, { variables: nextVariables });
  },

  updateVariable: (id: string, value: string | number | boolean) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    let changed = false;
    const nextVariables = currentGraph.variables.map((variable) => {
      if (variable.id === id) {
        if (variable.value !== value) {
          changed = true;
          return { ...variable, value };
        }
      }
      return variable;
    });

    if (changed) {
      updateGraphData(currentGraphId, { variables: nextVariables });
    }
  },

  deleteVariable: (id: string) => {
    const { currentGraphId, updateGraphData, getCurrentGraphData } =
      useProjectStore.getState();
    if (!currentGraphId) return;
    const currentGraph = getCurrentGraphData();
    if (!currentGraph) return;

    const nextVariables = currentGraph.variables.filter(
      (variable) => variable.id !== id
    );

    // Check if variable was actually deleted before updating
    if (nextVariables.length !== currentGraph.variables.length) {
      updateGraphData(currentGraphId, { variables: nextVariables });

      // Also update nodes that might reference this variable (e.g., Condition, VariableSet)
      // This prevents nodes from holding invalid variable IDs.
      const nextNodes = currentGraph.nodes.map((node) => {
        let nodeDataChanged = false;
        const newNodeData = { ...node.data };

        if ("variableId" in newNodeData && newNodeData.variableId === id) {
          // Find a fallback variable ID or set to empty/null
          const fallbackVarId =
            nextVariables.length > 0 ? nextVariables[0].id : "";
          (newNodeData as { variableId?: string }).variableId = fallbackVarId;
          nodeDataChanged = true;
        }
        // Add similar checks for other properties if needed (e.g., variableSet node)

        return nodeDataChanged ? { ...node, data: newNodeData } : node;
      });

      // Only update nodes if any actually changed
      if (JSON.stringify(nextNodes) !== JSON.stringify(currentGraph.nodes)) {
        updateGraphData(currentGraphId, { nodes: nextNodes }); // Update nodes separately or combine if API allows
      }
    }
  },
}));
