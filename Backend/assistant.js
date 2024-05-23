const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: ''});

async function main() { 
  const assistant = await openai.beta.assistants.create({
    name: "Math Tutor",
    instructions: "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-turbo"
  });

  const thread = await openai.beta.threads.create();

  let run = await openai.beta.threads.runs.createAndPoll(
    thread.id,
    { 
      assistant_id: assistant.id,
      //messages: [{ role: "user", content: "I need to solve the equation `3x + 11 = 14`. Can you help me?" }]
    }
  );
  
  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      console.log(`${message.role} > ${message.content[0].text.value}`);
    }
  } else {
    console.log(run.status);
  }
}

main();


//You are an AI assistant that helps users find the most suitable properties from the file I provided you based on their user descriptions. You only need to return the Property Titles of suitable properties without giving any details about them or sources, just the titles so I can display them on the screen. Start the conversation by asking the user what his dream property is like.  Then if you find multiple results in the file matching the user's description give me all their IDs and then ask the user for more details so you can find the perfect property for him.