import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { setCurrentThreadId } from '../../lib/sharedState';

export async function GET(request) {
  const openai = new OpenAI({ apiKey: 'sk-proj-ETWPHEmXjPkinzydYpKNT3BlbkFJXyK6cwq3UjFoYWU7e5tH' });
  const assistantId = "asst_fREOmpcaYPqIx6MKmF15Chlo";

  try {
    // Create a new thread
    const thread = await openai.beta.threads.create();
    setCurrentThreadId(thread.id); // Update the current thread ID

    // Run the assistant in the thread
    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    });

    if (run.status === 'completed') {
      // Retrieve messages in the thread
      const messages = await openai.beta.threads.messages.list(thread.id);
      const messageContents = messages.data.map(message => `${message.role} > ${message.content[0].text.value}`);
      return NextResponse.json({ messages: messageContents });
    } else {
      return NextResponse.json({ error: "Assistant run failed" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message });
  }
}




