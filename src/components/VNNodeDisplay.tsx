import {
  EditableNode,
  BasicEdge,
  DialogueNodeData,
  ChoiceData,
} from "../types";
import "./VNPlayer.css"; // Reuse styles for now

interface VNNodeDisplayProps {
  currentNode: EditableNode | null;
  outgoingEdges: BasicEdge[];
  handleNext: () => void;
  handleChoice: (targetNodeId: string) => void;
}

const VNNodeDisplay = ({
  currentNode,
  outgoingEdges,
  handleNext,
  handleChoice,
}: VNNodeDisplayProps) => {
  if (!currentNode || !currentNode.data) {
    return <p>End of story or error.</p>;
  }

  switch (currentNode.type) {
    case "dialogueNode": {
      const data = currentNode.data as DialogueNodeData;
      return (
        <>
          {data.character && <p className="vn-character">{data.character}:</p>}
          <p className="vn-dialogue">{data.dialogue || "(No dialogue)"}</p>
          {outgoingEdges.length > 0 ? (
            <button onClick={handleNext} className="vn-button">
              Next
            </button>
          ) : (
            <p>(End of line)</p>
          )}
        </>
      );
    }
    case "choiceNode": {
      const data = currentNode.data as ChoiceData;
      return (
        <>
          <p className="vn-prompt">Choose:</p>
          <div className="vn-choices">
            {data.choices.map((choice, index) => {
              const edge = outgoingEdges.find(
                (e) => e.sourceHandle === `choice-${index}`
              );
              if (!edge) return null;
              return (
                <button
                  key={index}
                  onClick={() => handleChoice(edge.target)}
                  className="vn-button vn-choice-button"
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </>
      );
    }
    case "conditionNode": {
      return <p className="vn-system">Evaluating condition...</p>;
    }
    case "variableSetNode": {
      return <p className="vn-system">Setting variable...</p>;
    }
    default:
      return <p>Unsupported node type: {currentNode.type}</p>;
  }
};

export default VNNodeDisplay;
