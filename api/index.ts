import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import { WebSocket } from 'ws';

const app = express();
app.use(cors());
expressWs(app);
const port = 8000;

const router = express.Router();
const connectedClients: WebSocket[] = [];
let drawingData: { x: number; y: number; color: string }[] = [];

router.ws('/ws', (ws: WebSocket) => {
  connectedClients.push(ws);

  ws.send(JSON.stringify({ type: 'LOAD', drawingData }));

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    if (data.type === 'DRAW') {
      const pixel = data.pixel;
      drawingData.push(pixel);

      connectedClients.forEach((client) => {
        if (client !== ws) {
          client.send(JSON.stringify({ type: 'DRAW', pixel }));
        }
      });
    }
  });

  ws.on('close', () => {
    connectedClients.splice(connectedClients.indexOf(ws), 1);
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
