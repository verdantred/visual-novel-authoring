import React, { useCallback, useRef, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  Node,
  Connection,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css"; // Base styles

import { useGraphStore } from "../store/graphStore";
import { useProjectStore } from "../store/projectStore";
import DialogueNode from "./DialogueNode";
import ChoiceNode from "./ChoiceNode";
import ConditionNode from "./ConditionNode";
import VariableSetNode from "./VariableSetNode";

// Define the mapping from node type string to component
const nodeTypeDefinitions = {
  dialogueNode: DialogueNode,
  choiceNode: ChoiceNode,
  conditionNode: ConditionNode,
  variableSetNode: VariableSetNode,
};

// The inner component that uses React Flow hooks
const FlowCanvas = () => {
  const nodeTypes = useMemo(() => nodeTypeDefinitions, []);

  const reactFlowWrapper = useRef<HTMLDivElement>(null); // Ref for the wrapper

  // --- Project Store Access ---
  const getCurrentGraphData = useProjectStore(
    (state) => state.getCurrentGraphData
  );
  const currentGraphData = getCurrentGraphData();

  // Get nodes and edges from the current graph, default to empty arrays
  const nodes = currentGraphData?.nodes ?? [];
  const edges = useMemo(
    () => currentGraphData?.edges ?? [],
    [currentGraphData?.edges]
  );

  // --- Graph Interaction Store Access ---
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  const addNode = useGraphStore((state) => state.addNode);
  const setSelectedNodeId = useGraphStore((state) => state.setSelectedNodeId);

  const { screenToFlowPosition } = useReactFlow(); // Get screenToFlowPosition

  // Handler for clicking on a node
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // Handler for clicking on the pane (background)
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // Calculate position relative to the React Flow pane
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left + 200,
        y: event.clientY - reactFlowBounds.top + 50,
      });

      const newNode = addNode(position, type);
      if (newNode) {
        setSelectedNodeId(newNode.id); // Select the newly added node using the store action
      }
    },
    [screenToFlowPosition, addNode, setSelectedNodeId]
  );

  // Custom validation function to limit connections
  // Optimization: Use the 'edges' state already selected above
  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Check if the source handle (Bottom) already has a connection
      const sourceHasConnection = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.sourceHandle === connection.sourceHandle
      );

      // Allow connection only if the source handle is free
      return !sourceHasConnection;
    },
    [edges]
  );

  // Define default edge options
  const defaultEdgeOptions = {
    markerEnd: { type: MarkerType.Arrow },
    style: { strokeWidth: 2 },
  };

  return (
    <div
      className="reactflow-wrapper"
      ref={reactFlowWrapper}
      style={{ height: "100%", width: "100%" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0.5]} // Centers the node origin
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="react-flow-canvas"
        attributionPosition="top-right"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};

// Wrapper component to provide the ReactFlow context and pass props
const GraphView = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
};

export default GraphView;
