import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getCurrentThreadId } from '../../lib/sharedState';

export function broadcastMessage(message) {
    clients.forEach(client => client.write(`data: ${JSON.stringify(message)}\n\n`));
  }

export async function POST(request) {
  const openai = new OpenAI({ apiKey: 'sk-proj-ETWPHEmXjPkinzydYpKNT3BlbkFJXyK6cwq3UjFoYWU7e5tH' });
  const assistantId = "asst_fREOmpcaYPqIx6MKmF15Chlo";

  try {
    const currentThreadId = getCurrentThreadId();
    console.log("currentThreadId")
    console.log(currentThreadId)
    if (!currentThreadId) {
      return NextResponse.json({ error: "No thread created yet" });
    }

    const { content } = await request.json();
    console.log("content")
    console.log(content)
    // Add the message to the current thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: content
    });
 
    // Stream the assistant's response
    const run = openai.beta.threads.runs.stream(currentThreadId, {
      assistant_id: assistantId
    });

    
      const threadMessages = await openai.beta.threads.messages.list(currentThreadId);
      const messageContents = threadMessages.data.map(message => `${message.role} > ${message.content[0].text.value}`);
      return NextResponse.json({ messages: messageContents });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message });
  }
}
