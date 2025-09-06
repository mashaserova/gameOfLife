import { useEffect, useRef, useState, useCallback } from "react";

const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generation, setGeneration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const gridRef = useRef(
    new Array(GRID_WIDTH * GRID_HEIGHT).fill(0).map(() => (Math.random() > 0.8 ? 1 : 0))
  );

  const animationFrameId = useRef<number | null>(null);

  const runSimulation = useCallback(() => {
    const currentGrid = gridRef.current;
    const nextGrid = [...currentGrid];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        let liveCount = 0;

        for (let yO = y - 1; yO <= y + 1; yO++) {
          for (let xO = x - 1; xO <= x + 1; xO++) {
            if (xO >= 0 && xO < GRID_WIDTH && yO >= 0 && yO < GRID_HEIGHT) {
              liveCount += currentGrid[xO + GRID_WIDTH * yO];
            }
          }
        }
        liveCount -= currentGrid[x + GRID_WIDTH * y];

        const state = currentGrid[x + GRID_WIDTH * y];
        const cellIndex = x + GRID_WIDTH * y;

        if (state === 0 && liveCount === 3) {
          nextGrid[cellIndex] = 1;
        } else if (state === 1 && (liveCount < 2 || liveCount > 3)) {
          nextGrid[cellIndex] = 0;
        }
      }
    }

    gridRef.current = nextGrid;
    setGeneration(prev => prev + 1);

    animationFrameId.current = requestAnimationFrame(runSimulation);
  }, []);


  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(runSimulation);
    } else {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, runSimulation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = canvas.width / GRID_WIDTH;
    const cellHeight = canvas.height / GRID_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const state = gridRef.current[x + GRID_WIDTH * y];
        ctx.fillStyle = state === 1 ? 'black' : 'white';
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [generation]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellWidth = canvas.width / GRID_WIDTH;
    const cellHeight = canvas.height / GRID_HEIGHT;
    const x = Math.floor(event.nativeEvent.offsetX / cellWidth);
    const y = Math.floor(event.nativeEvent.offsetY / cellHeight); 

    const newGrid = [...gridRef.current];
    const cellIndex = x + GRID_WIDTH * y;

    if (event.button === 0) {
        newGrid[cellIndex] = 1;
    } else if (event.button === 2) {
        newGrid[cellIndex] = 0;
    }
    gridRef.current = newGrid;
    setGeneration(prev => prev + 1)
  }

  return (
    <>
      <button onClick={() => {
        setIsPlaying(true);
        setIsDrawing(false);
      }}>Play</button>
      <button onClick={() => setIsPlaying(false)}>Stop</button>
      <button onClick={() => {
        setIsPlaying(false);
        setIsDrawing(true);
      }}>Draw</button>
      <canvas
        ref={canvasRef}
        width={GRID_WIDTH * 10}
        height={GRID_HEIGHT * 10}
        onMouseDown={handleCanvasClick}
        style={{ border: '1px solid black' }}
      />
    </>
  );
}

export default App;