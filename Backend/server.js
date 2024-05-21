
const express = require("express");
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs');
const eventStream = require('event-stream');

const app = express();
app.use(cors());

const url = 'mongodb+srv://viktorvelizarov1:klimatik@cluster0.dvrqh5s.mongodb.net/';
const dbName = 'houses_data';
const collectionName = 'properties';

// Initialize OpenAI
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: 'sk-proj-yxjaaalaaP1PrXekZJMuT3BlbkFJ0EEmPoVSL8IQ5ILbbdFF'});
let currentThreadId = null; // Variable to store the current thread ID
let assistantid = "asst_fREOmpcaYPqIx6MKmF15Chlo"; // Existing assistant ID

let clients = [];

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    console.log()
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});


app.get('/', (req, res) => {
    return res.json("Backend side");
});

app.get('/houses', async (req, res) => {
    try {
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const housesData = await collection.find({}).toArray();
        console.log(currentThreadId )
        res.json(housesData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to create a thread and return the introduction message
app.get('/createThread', async (req, res) => {
    try {
        // Create a new thread
        const thread = await openai.beta.threads.create();
        currentThreadId = thread.id; // Update the current thread ID
        // Run the assistant in the thread
        let run = await openai.beta.threads.runs.createAndPoll(
            thread.id,
            {
                assistant_id: assistantid,
            }
        );
        // Check if the run is completed
        if (run.status === 'completed') {
            // Retrieve messages in the thread
            const messages = await openai.beta.threads.messages.list(thread.id);
            const messageContents = messages.data.map(message => `${message.role} > ${message.content[0].text.value}`);
            res.json({ messages: messageContents });
        } else {
            res.status(500).json({ error: "Assistant run failed" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/addMessage', async (req, res) => {
    try {
        if (!currentThreadId) {
            return res.status(400).json({ error: "No thread created yet" });
        }

        const { content } = req.query;

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

        run.on('end', async () => {
            const threadMessages = await openai.beta.threads.messages.list(currentThreadId);
            const messageContents = threadMessages.data.map(message => `${message.role} > ${message.content[0].text.value}`);
            res.json({ messages: messageContents });
        });

        run.on('error', (error) => {
            console.error(error);
            res.status(500).json({ error: error.message });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

function broadcastMessage(message) {
    clients.forEach(client => client.write(`data: ${JSON.stringify(message)}\n\n`));
}




const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
