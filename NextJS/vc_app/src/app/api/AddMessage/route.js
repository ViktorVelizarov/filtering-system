import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { broadcastMessage } from '../streamMessages/route';
import { getCurrentThreadId } from '../threadStore';

const openai = new OpenAI({ apiKey: 'sk-proj-gIANrbiuCx0AzhI3HBmHT3BlbkFJxlBI6B97G15gP1GEyQ3Y' });
const assistantid = "asst_fREOmpcaYPqIx6MKmF15Chlo";

export async function POST(request) {
  try {
    const currentThreadId = getCurrentThreadId();  // Assuming you have this defined
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

    // Handle different events from OpenAI stream
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

    // Return a promise that resolves when the OpenAI run ends
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
