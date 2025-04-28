// src/types.ts

import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  XYPosition,
  Viewport, // Import Viewport
} from "reactflow";

// --- Node Data ---
export interface DialogueNodeData {
  character?: string; // Optional character field
  dialogue?: string; // Optional dialogue field
}

// --- Choice Node Data ---
export interface ChoiceData {
  choices: string[]; // Array of choice strings
}

// --- Condition Node Data ---
export type ComparisonOperator =
  | "==" // Equal
  | "!=" // Not Equal
  | ">" // Greater than
  | "<" // Less than
  | ">=" // Greater than or equal
  | "<="; // Less than or equal

export interface ConditionData {
  variableId?: string; // ID of the variable to check
  operator?: ComparisonOperator;
  value?: string | number | boolean; // Value to compare against
}

// --- Variable Set Node Data ---
export interface VariableSetData {
  variableId?: string; // ID of the variable to set
  newValue?: string | number | boolean; // The new value to assign
}

// Union type for all possible node data
export type NodeData =
  | DialogueNodeData
  | ChoiceData
  | ConditionData
  | VariableSetData; // Add VariableSetData

// Custom Node type using the union data type
export type EditableNode = Node<NodeData>;

// --- Edge Data (currently unused, but good practice) ---
export interface BasicEdgeData {
  label: string;
}

// Custom Edge type
export type BasicEdge = Edge<BasicEdgeData>;

// --- Game State ---
export interface GameVariable {
  id: string;
  name: string; // User-friendly name
  value: string | number | boolean;
}

// --- Store State ---
export interface GraphState {
  nodes: EditableNode[];
  edges: BasicEdge[];
  variables: GameVariable[]; // Add variables state
  selectedNodeId: string | null; // Add selected node ID state

  // Actions: Graph
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position: XYPosition, nodeType: string) => EditableNode; // Update return type
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void; // Update signature to use NodeData union and Partial
  deleteNode: (nodeId: string) => void; // Add deleteNode signature
  setNodes: (nodes: EditableNode[]) => void; // Needed for initial load/updates
  setEdges: (edges: BasicEdge[]) => void; // Needed for initial load/updates
  setSelectedNodeId: (nodeId: string | null) => void; // Add setter for selected node ID
  revertToInitial: () => void; // Add signature for the revert function

  // Actions: Game State
  addVariable: (name: string, value: string | number | boolean) => void;
  updateVariable: (id: string, value: string | number | boolean) => void;
  deleteVariable: (id: string) => void;
}

// --- Graph Data Structure (for saving/loading multiple graphs) ---
export interface GraphData {
  name: string;
  nodes: EditableNode[];
  edges: BasicEdge[];
  variables: GameVariable[];
  viewport: Viewport;
}
