import React, { useRef, useEffect, useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';

export const Drawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useColor('#561ecb');
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.8.185:8000/ws');
    setWebSocket(ws);

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === 'LOAD') {
        data.drawingData.forEach((pixel: { x: number; y: number; color: string }) => {
          handleDrawPixel(pixel.x, pixel.y, pixel.color);
        });
      } else if (data.type === 'DRAW') {
        const { x, y, color } = data.pixel;
        handleDrawPixel(x, y, color);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleDrawPixel = (x: number, y: number, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, 10, 0, Math.PI * 2);
      context.fill();
    }
  };

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

  const handleDraw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !webSocket) return;

    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    webSocket.send(
      JSON.stringify({
        type: 'DRAW',
        pixel: { x, y, color: color.hex },
      })
    );

    handleDrawPixel(x, y, color.hex);
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
        className={'border rounded-xl bg-gray-100 border-gray-300'}
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDraw}
        onMouseUp={handleStopDrawing}
        onMouseLeave={handleStopDrawing}
      />
    </div>
  );
};
