let clients = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
      clients = clients.filter(client => client !== res);
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

