import React, { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";

const initialNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

const initialGroups = Array.from({ length: 9 }, (_, i) => []);

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: 8,
  overflow: "auto",
  flexWrap: "wrap",
});

const NumberGroups = ({
  groups,
  setGroups,
  handleGroupChange,
  hoveredNumber,
}) => {
  useEffect(() => {
    handleGroupChange(groups);
  }, [groups, handleGroupChange]);

  const getItemStyle = (isDragging, draggableStyle, isHovered = false) => ({
    userSelect: "none",
    padding: 8,
    margin: "0 8px 8px 0",
    color: "#ffffff",
    background: isDragging ? "lightgreen" : isHovered ? "blue" : "black",
    borderRadius: "5px",
    boxShadow: isHovered ? "0 0 10px blue" : "none",
    ...draggableStyle,
  });
  const [numbers, setNumbers] = useState(initialNumbers);
  const [inputs, setInputs] = useState(Array.from({ length: 9 }, () => ""));

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const start = source.droppableId;
    const end = destination.droppableId;

    if (start === end) {
      const newList = Array.from(
        start === "numbers" ? numbers : groups[Number(start.split("-")[1])]
      );
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);

      if (start === "numbers") {
        setNumbers(newList);
      } else {
        setGroups((prev) => {
          const copy = [...prev];
          copy[Number(start.split("-")[1])] = newList;
          return copy;
        });
      }
    } else {
      const startList = Array.from(
        start === "numbers" ? numbers : groups[Number(start.split("-")[1])]
      );
      const endList = Array.from(
        end === "numbers" ? numbers : groups[Number(end.split("-")[1])]
      );
      const [removed] = startList.splice(source.index, 1);
      endList.splice(destination.index, 0, removed);

      if (start === "numbers") {
        setNumbers(startList);
      } else {
        setGroups((prev) => {
          const copy = [...prev];
          copy[Number(start.split("-")[1])] = startList;
          return copy;
        });
      }

      if (end === "numbers") {
        setNumbers(endList);
      } else {
        setGroups((prev) => {
          const copy = [...prev];
          copy[Number(end.split("-")[1])] = endList;
          return copy;
        });
      }
    }
  };

  const multiNumberToGroups = () => {
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].includes(",")) {
        moveNumbersToGroup(i);
      }
    }
  };

  const moveNumbersToGroup = (groupIndex) => {
    const numsToMove = inputs[groupIndex].split(",").map(Number);
    const validNumsToMove = numsToMove.filter((num) => numbers.includes(num));
    const newNumbers = numbers.filter((num) => !validNumsToMove.includes(num));
    const newGroup = [...groups[groupIndex], ...validNumsToMove];

    setGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex] = newGroup;
      return copy;
    });

    setNumbers(newNumbers);
    setInputs((prev) => {
      const copy = [...prev];
      copy[groupIndex] = "";
      return copy;
    });

  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <textarea
          value={inputs.join("\n")}
          onChange={(e) => {
            const newInputs = e.target.value.trim().split("\n");
            setInputs(newInputs);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              multiNumberToGroups();
            }
          }}
        />
      <Droppable droppableId="numbers" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {numbers.map((num, index) => (
              <Draggable
                key={num.toString()}
                draggableId={num.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    {num}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>

      {groups.map((group, groupIndex) => (
        <Droppable
          key={groupIndex}
          droppableId={`group-${groupIndex}`}
          direction="horizontal"
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                ...getListStyle(snapshot.isDraggingOver),
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #000",
              }}
            >
              <div
                style={{
                  marginRight: "16px",
                  height: "3em",
                }}
              >
                Group {groupIndex + 1} ({group.length})
                <div>
                  <input
                    value={inputs[groupIndex]}
                    onChange={(e) => {
                      const newInputs = [...inputs];
                      newInputs[groupIndex] = e.target.value;
                      setInputs(newInputs);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        moveNumbersToGroup(groupIndex);
                      }
                    }}
                  />
                </div>
              </div>

              {group.map((num, index) => (
                <Draggable
                  key={num.toString()}
                  draggableId={num.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style,
                        num == hoveredNumber
                      )}
                    >
                      {num}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

const DiffNumbers = ({
  diffNumbers,
  setHoveredNumber,
  groupNumbers,
  groups1,
  groups2,
}) => {
  const itemStyle = {
    userSelect: "none",
    padding: "8px",
    margin: "0 8px 8px 0",
    color: "#ffffff",
    background: "black",
    borderRadius: "5px",
    display: "inline-block",
  };

  const containerStyle = {
    top: "0",
    left: "0",
    right: "0",
    background: "#fff",
    padding: "8px",
    textAlign: "center",
    zIndex: "1",
  };
  // Function to copy all the suggested groups
  const copySuggestedGroups = async () => {
    const suggestedGroups = diffNumbers.map(
      (num) => groupNumbers[num].suggested
    );
    await navigator.clipboard.writeText(suggestedGroups.join(", "));
  };

  // Function to copy all positions from the first group
  const copyFirstGroupPositions = async () => {
    const firstGroupPositions = groups1.flatMap((group, groupIndex) =>
      group.map((num) => `${num}:${groupIndex + 1}`)
    );
    await navigator.clipboard.writeText(firstGroupPositions.join(", "));
  };

  // Function to copy all positions from the second group
  const copySecondGroupPositions = async () => {
    const secondGroupPositions = groups2.flatMap((group, groupIndex) =>
      group.map((num) => `${num}:${groupIndex + 1}`)
    );
    await navigator.clipboard.writeText(secondGroupPositions.join(", "));
  };

  const buttonStyle = {
    padding: "10px",
    margin: "5px",
    backgroundColor: "red",
    color: "white",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "1em",
  };

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={copyFirstGroupPositions}>
        Derecha
      </button>
      <button style={buttonStyle} onClick={copySecondGroupPositions}>
        Izquierda
      </button>
      <div>
        <div>A negociar:</div>
        {diffNumbers.map((num) => {
          const currentGroup1 = groupNumbers[num].group1;
          const currentGroup2 = groupNumbers[num].group2;
          let newGroup;
          do {
            newGroup = Math.floor(Math.random() * 9) + 1;
          } while (
            Math.abs(newGroup - currentGroup1) > 2 ||
            Math.abs(newGroup - currentGroup2) > 2
          );

          return (
            <div
              key={num}
              style={itemStyle}
              onMouseEnter={() => setHoveredNumber(num)}
              onMouseLeave={() => setHoveredNumber(null)}
            >
              <div>{num}</div>
              <div style={{ height: "1px", background: "#fff" }}></div>
              <div>
                G1: {currentGroup1}, G2: {currentGroup2}, SG:
                {groupNumbers[num].suggested}
              </div>
            </div>
          );
        })}
      </div>
      <button style={buttonStyle} onClick={copySuggestedGroups}>
        Sugeridos
      </button>
    </div>
  );
};

const App = () => {
  const [groups1, setGroups1] = useState(initialGroups);
  const [groups2, setGroups2] = useState(initialGroups);
  const [diffNumbers, setDiffNumbers] = useState([]);
  const [groupNumbers, setGroupNumbers] = useState({});
  const [hoveredNumber, setHoveredNumber] = useState(null);
  resetServerContext();

  const calculateDiff = (g1, g2) => {
    let diff = [];
    let groupNumbers = {};
    for (let i = 0; i < 90; i++) {
      const num = i + 1;
      const findGroup = (groups) =>
        groups.findIndex((group) => group.includes(num));
      const group1 = findGroup(g1);
      const group2 = findGroup(g2);
      if (Math.abs(group1 - group2) > 2) {
        diff.push(num);

        let newGroup;
        do {
          newGroup = Math.floor(Math.random() * 9) + 1;
        } while (
          Math.abs(newGroup - group1) > 2 ||
          Math.abs(newGroup - group2) > 2
        );

        groupNumbers[num] = {
          group1: group1 + 1,
          group2: group2 + 1,
          suggested: newGroup,
        };
      }
    }
    return { diff, groupNumbers };
  };

  const handleGroupChange = useCallback(() => {
    const { diff, groupNumbers } = calculateDiff(groups1, groups2);
    setDiffNumbers(diff);
    setGroupNumbers(groupNumbers);
  }, [groups1, groups2]);
  
  return (
    <div>
      <DiffNumbers
        diffNumbers={diffNumbers}
        setHoveredNumber={setHoveredNumber}
        groupNumbers={groupNumbers}
        groups1={groups1}
        groups2={groups2}
      />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <NumberGroups
            groups={groups1}
            setGroups={setGroups1}
            handleGroupChange={handleGroupChange}
            hoveredNumber={hoveredNumber}
          />
        </div>
        <div style={{ width: "16px", background: "#000" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <NumberGroups
            groups={groups2}
            setGroups={setGroups2}
            handleGroupChange={handleGroupChange}
            hoveredNumber={hoveredNumber}
          />
        </div>
      </div>
    </div>
  );
};
export default App;
