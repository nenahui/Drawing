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

router.ws('/ws', (ws: WebSocket) => {
  connectedClients.push(ws);

  ws.on('close', () => {
    connectedClients.splice(connectedClients.indexOf(ws), 1);
  });
});

app.use(router);

app.listen(port, () => {
  console.log('Server started at http://localhost:8000');
});
