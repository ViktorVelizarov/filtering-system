import { NextResponse } from 'next/server';

let clients = [];

// SSE setup
function setupSSE(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Ensure headers are sent immediately

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
}

// Broadcast message to all connected SSE clients
export function broadcastMessage(message) {
  const formattedMessage = `data: ${JSON.stringify(message)}\n\n`;

  clients.forEach(client => {
    client.write(formattedMessage);
  });
}

// Handle GET requests for SSE
export async function GET(request) {
  // Return a NextResponse to handle the streaming
  return new NextResponse((res) => {
    setupSSE(request.req, res);
  });
}

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser to handle streaming
  },
};
