import { GameVariable } from "../types";
import "./VNPlayer.css"; // Reuse styles for now

interface VNDebugPanelProps {
  currentVariables: GameVariable[];
}

const VNDebugPanel = ({ currentVariables }: VNDebugPanelProps) => {
  return (
    <div className="vn-debug-vars">
      <h3>Variables:</h3>
      <pre>{JSON.stringify(currentVariables, null, 2)}</pre>
    </div>
  );
};

export default VNDebugPanel;
