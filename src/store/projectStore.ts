import { create } from "zustand";
import { type GraphData } from "../types"; // Assuming GraphData includes nodes, edges, viewport

interface ProjectState {
  graphs: Record<string, GraphData>;
  currentGraphId: string | null;
  setGraphs: (graphs: Record<string, GraphData>) => void;
  addGraph: (id: string, graphData: GraphData) => void;
  deleteGraph: (id: string) => void;
  selectGraph: (id: string | null) => void;
  updateGraphData: (id: string, graphData: Partial<GraphData>) => void;
  getCurrentGraphData: () => GraphData | null;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  graphs: {}, // Initialize with an empty object
  currentGraphId: null,

  setGraphs: (graphs) => set({ graphs }),

  addGraph: (id, graphData) => {
    set((state) => ({
      graphs: { ...state.graphs, [id]: graphData },
    }));
  },

  deleteGraph: (id) => {
    set((state) => {
      const newGraphs = { ...state.graphs };
      delete newGraphs[id];
      let newCurrentGraphId = state.currentGraphId;
      // If the deleted graph was the current one, select another or null
      if (state.currentGraphId === id) {
        const remainingIds = Object.keys(newGraphs);
        newCurrentGraphId = remainingIds.length > 0 ? remainingIds[0] : null;
      }
      return { graphs: newGraphs, currentGraphId: newCurrentGraphId };
    });
  },

  selectGraph: (id) => {
    set((state) => {
      if (id === null || state.graphs[id]) {
        return { currentGraphId: id };
      }
      return {}; // Don't change if the id is invalid
    });
  },

  updateGraphData: (id, graphDataUpdate) => {
    set((state) => {
      const graphToUpdate = state.graphs[id];
      if (!graphToUpdate) return {}; // Graph not found

      const updatedGraph = {
        ...graphToUpdate,
        ...graphDataUpdate,
        // Deep merge nodes and edges if they are part of the update?
        // For now, doing a shallow merge. Adjust if needed.
      };

      return {
        graphs: { ...state.graphs, [id]: updatedGraph },
      };
    });
  },

  getCurrentGraphData: () => {
    const { graphs, currentGraphId } = get();
    return currentGraphId ? graphs[currentGraphId] : null;
  },
}));

// Example initialization (consider moving this to App setup or similar)
// import initialGraphData from '../initialGraphData.json';
// useProjectStore.setState({
//   graphs: { 'initial': initialGraphData as GraphData },
//   currentGraphId: 'initial',
// });
