import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, resetServerContext } from "react-beautiful-dnd";

const initialNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

const initialGroups = Array.from({ length: 9 }, (_, i) => []);

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: 8,
  margin: "0 8px 8px 0",
  color: "#ffffff",
  background: isDragging ? "lightgreen" : "black",
  borderRadius: "5px",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: 8,
  overflow: "auto",
  flexWrap: "wrap",
});

const App = () => {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [groups, setGroups] = useState(initialGroups);
  resetServerContext();
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside the list
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
      // Moving from one list to another
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
        <Droppable key={groupIndex} droppableId={`group-${groupIndex}`} direction="horizontal">
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
      ))}
    </DragDropContext>
  );
};

export default App;
