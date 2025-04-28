import { ChangeEvent, useState } from "react";
import { useProjectStore } from "../store/projectStore";
import { GraphData } from "../types";
import { nanoid } from "nanoid";
import "./GraphManager.css";

interface GraphManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GraphManager = ({ isOpen, onClose }: GraphManagerProps) => {
  const { graphs, currentGraphId, selectGraph, addGraph, deleteGraph } =
    useProjectStore();

  const [newGraphName, setNewGraphName] = useState("");

  const handleSelectGraph = (event: ChangeEvent<HTMLSelectElement>) => {
    selectGraph(event.target.value);
  };

  const handleAddGraph = () => {
    const newId = nanoid(); // Generate a unique ID
    const defaultGraphData: GraphData = {
      name: newGraphName,
      nodes: [
        {
          id: "start",
          type: "dialogueNode",
          position: { x: 250, y: 50 },
          data: { character: "Narrator", dialogue: "New graph start" },
        },
      ],
      edges: [],
      variables: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    addGraph(newId, defaultGraphData);
    selectGraph(newId); // Select the newly created graph
    setNewGraphName(""); // Clear input
  };

  const handleDeleteGraph = (idToDelete: string) => {
    if (Object.keys(graphs).length <= 1) {
      alert("Cannot delete the last graph.");
      return;
    }
    if (
      window.confirm(`Are you sure you want to delete graph "${idToDelete}"?`)
    ) {
      deleteGraph(idToDelete);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="graph-manager-overlay" onClick={onClose}>
      <div className="graph-manager-panel" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-button panel-close-button">
          X
        </button>
        <h4>Manage Graphs</h4>
        <div className="graph-manager-controls">
          <label htmlFor="graph-select">Current Graph:</label>
          <select
            id="graph-select"
            value={currentGraphId || ""}
            onChange={handleSelectGraph}
            disabled={Object.keys(graphs).length === 0}
          >
            {Object.keys(graphs).map((id) => (
              <option key={id} value={id}>
                {graphs[id].name}
              </option>
            ))}
          </select>

          {currentGraphId && Object.keys(graphs).length > 1 && (
            <button
              onClick={() => handleDeleteGraph(currentGraphId)}
              className="delete-graph-button"
              title="Delete Current Graph"
            >
              🗑️
            </button>
          )}
        </div>

        <div className="graph-manager-add">
          <input
            type="text"
            value={newGraphName}
            onChange={(e) => setNewGraphName(e.target.value)}
            placeholder="New Graph Name (optional)"
          />
          <button onClick={handleAddGraph} className="add-graph-button">
            + Add Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphManager;
