// src/app/api/addMessage/route.js
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getCurrentThreadId } from '../threadStore';

const openai = new OpenAI({ apiKey: 'sk-proj-VSHL0j6pKUDbpl1kqFPQT3BlbkFJct4UNnhHKKjUlmI1TH7M' });
const assistantid = "asst_fREOmpcaYPqIx6MKmF15Chlo";
let clients = [];

export async function POST(request) {
  try {
    const currentThreadId = getCurrentThreadId();  // Get the current thread ID
    if (!currentThreadId) {
      return NextResponse.json({ error: "No thread created yet" }, { status: 400 });
    }

    // Parse URL query parameters
    const url = new URL(request.url);
    const content = url.searchParams.get('content');

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Add the message to the current thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: content
    });

    // Stream the assistant's response
    const run = openai.beta.threads.runs.stream(currentThreadId, {
      assistant_id: assistantid
    });

    run.on('textCreated', (text) => {
      const message = { role: 'assistant', content: text };
      broadcastMessage(message);
    });

    run.on('textDelta', (textDelta) => {
      const message = { role: 'assistant', content: textDelta.value };
      broadcastMessage(message);
    });

    run.on('toolCallDelta', (toolCallDelta) => {
      if (toolCallDelta.type === 'code_interpreter') {
        if (toolCallDelta.code_interpreter.input) {
          const message = { role: 'assistant', content: toolCallDelta.code_interpreter.input };
          broadcastMessage(message);
        }
        if (toolCallDelta.code_interpreter.outputs) {
          const message = { role: 'assistant', content: "\noutput >\n" };
          broadcastMessage(message);
          toolCallDelta.code_interpreter.outputs.forEach(output => {
            if (output.type === "logs") {
              const logMessage = { role: 'assistant', content: `\n${output.logs}\n` };
              broadcastMessage(logMessage);
            }
          });
        }
      }
    });

    return new Promise((resolve, reject) => {
      run.on('end', async () => {
        try {
          const threadMessages = await openai.beta.threads.messages.list(currentThreadId);
          const messageContents = threadMessages.data.map(message => `${message.role} > ${message.content[0].text.value}`);
          resolve(NextResponse.json({ messages: messageContents }, { status: 200 }));
        } catch (err) {
          reject(err);
        }
      });

      run.on('error', (error) => {
        console.error(error);
        reject(NextResponse.json({ error: error.message }, { status: 500 }));
      });
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function broadcastMessage(message) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  });
}

// Handle SSE connections
export const config = {
  api: {
    bodyParser: true,
  },
};

export function onClientConnect(client) {
  console.log('Client connected to SSE');
  clients.push(client);

  client.on('close', () => {
    clients = clients.filter(c => c !== client);
    console.log('Client disconnected from SSE');
  });
}
