import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import React, { useRef, useEffect, useState } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';

export const Drawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useColor('#561ecb');
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [weight, setWeight] = useState(10);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.8.185:8000/ws');
    setWebSocket(ws);

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === 'LOAD') {
        data.drawingData.forEach((pixel: { x: number; y: number; color: string; weight: number }) => {
          handleDrawPixel(pixel.x, pixel.y, pixel.color, pixel.weight);
        });
      } else if (data.type === 'DRAW') {
        const { x, y, color, weight } = data.pixel;
        handleDrawPixel(x, y, color, weight);
      } else if (data.type === 'CLEAR') {
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleDrawPixel = (x: number, y: number, color: string, weight: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, weight, 0, Math.PI * 2);
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

    const pixelData = {
      x,
      y,
      color: color.hex,
      weight: weight,
    };

    webSocket.send(
      JSON.stringify({
        type: 'DRAW',
        pixel: pixelData,
      })
    );

    handleDrawPixel(x, y, color.hex, weight);
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (webSocket) {
      webSocket.send(JSON.stringify({ type: 'CLEAR' }));
    }
  };

  return (
    <div className={'absolute top-1/2 left-1/2 -translate-y-2/4 -translate-x-2/4 flex flex-col gap-2'}>
      <ColorPicker color={color} onChange={setColor} hideInput height={100} />
      <div>
        <p className={'mb-1 text-sm'}>Brush Weight</p>
        <Slider max={50} step={1} min={1} defaultValue={[weight]} onValueChange={(n) => setWeight(n[0])} />
      </div>
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
      <Button variant={'secondary'} onClick={clear}>
        Reset
      </Button>
    </div>
  );
};
