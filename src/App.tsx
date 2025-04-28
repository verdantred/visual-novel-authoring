import { useState, useEffect } from "react";
import Toolbar from "./components/Toolbar";
import GraphView from "./components/GraphView";
import SidePanel from "./components/SidePanel";
import NodeDrawer from "./components/NodeDrawer";
import VariableManagerPanel from "./components/VariableManagerPanel";
import VNPlayer from "./components/VNPlayer";
import GraphManager from "./components/GraphManager";
import { useGraphStore } from "./store/graphStore";
import { useProjectStore } from "./store/projectStore";
import { NodeData, GraphData } from "./types";
import initialGraphData from "./initialGraphData.json";
import "./App.css";
import "react-resizable/css/styles.css";

function App() {
  const [isVariablesPanelOpen, setIsVariablesPanelOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false); // State for VN Player visibility
  const [isGraphManagerOpen, setIsGraphManagerOpen] = useState(false); // State for Graph Manager modal

  // --- Project Store Access ---
  const {
    graphs, // Need graphs to check if initialization is needed
    setGraphs,
    selectGraph,
    getCurrentGraphData,
  } = useProjectStore();

  const { selectedNodeId, setSelectedNodeId, updateNodeData } = useGraphStore();
  const currentGraphData = getCurrentGraphData(); // Get current graph data using the selector

  // Find the selected node object from the *current graph's* nodes
  const selectedNode =
    currentGraphData?.nodes.find((node) => node.id === selectedNodeId) || null;

  const closePanel = () => {
    setSelectedNodeId(null); // Clear selection in the store
  };

  // Function to handle updates from the SidePanel
  const handleNodeUpdate = (nodeId: string, data: Partial<NodeData>) => {
    // Call the store action to update the node's data
    updateNodeData(nodeId, data);
  };

  // Function to toggle the variable manager panel
  const toggleVariablesPanel = () => {
    setIsVariablesPanelOpen((prev) => !prev);
  };

  // Function to toggle the VN Player
  const togglePlayer = () => {
    setIsPlayerOpen((prev) => !prev);
  };

  // Function to toggle the Graph Manager modal
  const toggleGraphManager = () => {
    setIsGraphManagerOpen((prev) => !prev);
  };

  // Effect to initialize the project store with initial graph data
  useEffect(() => {
    // Check if graphs are already loaded (e.g., from persistence or previous state)
    if (Object.keys(graphs).length === 0) {
      console.log("Initializing project store with initial graph data...");
      const initialGraphId = "initial"; // Or generate a unique ID
      // Ensure the imported data conforms to GraphData structure
      const graphToAdd: GraphData = {
        name: "initial",
        nodes: initialGraphData.nodes as GraphData["nodes"],
        edges: initialGraphData.edges as GraphData["edges"],
        variables: initialGraphData.variables as GraphData["variables"],
        // Provide default viewport if missing in initial data
        viewport:
          initialGraphData.viewport ||
          ({ x: 0, y: 0, zoom: 1 } as GraphData["viewport"]),
      };
      setGraphs({ [initialGraphId]: graphToAdd });
      selectGraph(initialGraphId);
    }
  }, [graphs, setGraphs, selectGraph]); // Dependencies ensure this runs only if these change

  return (
    <div className="app-container">
      <Toolbar
        onToggleVariablesPanel={toggleVariablesPanel}
        onTogglePlayer={togglePlayer}
        onToggleGraphManager={toggleGraphManager}
      />
      <NodeDrawer />
      <div className="graph-view-container">
        <GraphView />
      </div>
      {selectedNode && (
        <SidePanel
          node={selectedNode}
          onClose={closePanel}
          onUpdateNode={handleNodeUpdate}
        />
      )}
      <VariableManagerPanel
        isOpen={isVariablesPanelOpen}
        onClose={toggleVariablesPanel}
      />
      {isPlayerOpen && <VNPlayer onClose={togglePlayer} />}
      <GraphManager isOpen={isGraphManagerOpen} onClose={toggleGraphManager} />
    </div>
  );
}

export default App;
