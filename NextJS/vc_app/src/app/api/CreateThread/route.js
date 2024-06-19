// src/app/api/createThread/route.js
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { setCurrentThreadId } from '../threadStore';

const openai = new OpenAI({ apiKey: 'sk-proj-gIANrbiuCx0AzhI3HBmHT3BlbkFJxlBI6B97G15gP1GEyQ3Y' });
const assistantid = "asst_fREOmpcaYPqIx6MKmF15Chlo";

export async function GET(request) {
  try {
    console.log('Creating a new thread');
    const thread = await openai.beta.threads.create();
    setCurrentThreadId(thread.id);  // Update the current thread ID
    console.log('Thread created:', thread);

    console.log('Creating and polling a run');
    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantid,
    });
    console.log('Run status:', run.status);

    if (run.status === 'completed') {
      console.log('Run completed, fetching messages');
      const messages = await openai.beta.threads.messages.list(thread.id);
      const messageContents = messages.data.map(message => `${message.role} > ${message.content[0].text.value}`);
      return NextResponse.json({ messages: messageContents }, { status: 200 });
    } else {
      console.error('Assistant run failed');
      return NextResponse.json({ error: "Assistant run failed" }, { status: 500 });
    }
  } catch (err) {
    console.error('Error in GET /api/CreateThread:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
