import React, { useRef, useEffect, useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';

export const Drawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useColor('#561ecb');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = color.hex;
      context.lineWidth = 10;
    }
  }, [color]);

  const handleStartDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
      context.stroke();
    }
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className={'absolute top-1/2 left-1/2 -translate-y-2/4 -translate-x-2/4 flex flex-col gap-2'}>
      <ColorPicker color={color} onChange={setColor} hideInput height={100} />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={'border rounded-xl border-gray-300'}
        onMouseDown={handleStartDrawing}
        onMouseMove={draw}
        onMouseUp={handleStopDrawing}
        onMouseLeave={handleStopDrawing}
      />
    </div>
  );
};
