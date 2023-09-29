// App.js

import { useEffect, useRef, useState } from "react";

//import Menu from "./components/Menu";
import "./App.css";
import rough from "roughjs/bundled/rough.esm";

// const useHistory = (initialState) => {
//   const [index, setIndex] = useState(0);
//   const [history, setHistory] = useState([initialState]);

//   const setState = (action, overwrite = false) => {
//     const newState =
//       typeof action === "function" ? action(history[index]) : action;

//     if (overwrite) {
//       const historyCopy = [...history];
//       historyCopy[index] = newState;
//       setHistory(historyCopy);
//     } else {
//       const updatedState = [...history].slice(0, index + 1);
//       setHistory([...updatedState, newState]);
//       setIndex((prevState) => prevState + 1);
//     }
//   };

//   return [history[index], setState];
// };

function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [lineColor, setLineColor] = useState("black");
  const [lineOpacity, setLineOpacity] = useState(0.1);
  const [shapes, setIsShape] = useState([]);
  const [elementType, setElementType] = useState("freehand");

  // Initialization when the component
  // mounts for the first time
  const generator = rough.generator();

  function createShapes(x1, y1, x2, y2, type) {
    const roughElement =
      type === "line"
        ? generator.line(x1, y1, x2, y2, { stroke: "lineColor" })
        : generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
            stroke: "lineColor",
          });
    return { x1, y1, x2, y2, roughElement };
  }
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rC = rough.canvas(canvas);
    shapes.forEach(({ roughElement }) => rC.draw(roughElement));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = lineOpacity;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;
  }, [lineColor, lineOpacity, lineWidth, shapes]);

  // Function for starting the drawing
  const startDrawing = (e) => {
    if (elementType === "freehand") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    } else {
      const clientX = e.nativeEvent.offsetX;
      const clientY = e.nativeEvent.offsetY;
      const element = createShapes(
        clientX,
        clientY,
        clientX,
        clientY,
        elementType
      );
      setIsShape((prevState) => [...prevState, element]);
    }
    setIsDrawing(true);
  };

  // Function for ending the drawing
  const endDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) {
      return;
    } else if (elementType === "freehand") {
      ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctxRef.current.stroke();
    } else {
      const clientX = e.nativeEvent.offsetX;
      const clientY = e.nativeEvent.offsetY;
      const element = createShapes(
        clientX,
        clientY,
        clientX,
        clientY,
        elementType
      );
      setIsShape((prevState) => [...prevState, element]);
      const index = shapes.length - 1;
      const { x1, y1 } = shapes[index];
      const updateElement = createShapes(x1, y1, clientX, clientY, elementType);

      const copyElement = [...shapes];
      copyElement[index] = updateElement;
      setIsShape(copyElement);
      ctxRef.current.stroke();
    }
  };
  return (
    <div className="App">
      <h1>Paint App</h1>
      <div className="draw-area">
        {
          /* { <Menu
					
				/> } */
          <div className="Menu">
            <label>Brush Color </label>
            <input
              type="color"
              onChange={(e) => {
                setLineColor(e.target.value);
              }}
            />
            <label>Brush Width </label>
            <input
              type="range"
              min="3"
              max="20"
              onChange={(e) => {
                setLineWidth(e.target.value);
              }}
            />

            <label>Brush Opacity</label>
            <input
              type="range"
              min="1"
              max="100"
              onChange={(e) => {
                setLineOpacity(e.target.value / 100);
              }}
            />
            <label>Rectangle</label>
            <input
              type="radio"
              id="rectangle"
              checked={elementType === "rectangle"}
              onChange={(e) => {
                setLineColor(e.target.value);
                setElementType("rectangle");
              }}
            />
            <label>Line</label>
            <input
              type="radio"
              id="line"
              checked={elementType === "line"}
              onChange={() => {
                setElementType("line");
              }}
            />
            <label>free hand</label>
            <input
              type="radio"
              id="freehand"
              checked={elementType === "freehand"}
              onChange={() => {
                setElementType("freehand");
              }}
            />
          </div>
        }
        <canvas
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          ref={canvasRef}
          width={`1280px`}
          height={`720px`}
        />
      </div>
    </div>
  );
}

export default App;
