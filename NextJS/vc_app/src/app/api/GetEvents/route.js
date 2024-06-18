import { onClientConnect } from './AddMessage'; // Import the SSE client management function

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Notify the client that the connection is established
    res.write('data: Connected\n\n');

    // Handle client connections
    onClientConnect(res);

    req.on('close', () => {
      console.log('Client disconnected from SSE');
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
