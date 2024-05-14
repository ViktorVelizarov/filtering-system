const express = require("express");
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs');

const app = express();
app.use(cors());

const url = 'mongodb+srv://viktorvelizarov1:klimatik@cluster0.dvrqh5s.mongodb.net/';
const dbName = 'houses_data';
const collectionName = 'properties';

// Initialize OpenAI
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: ''});
let currentThreadId = null; // Variable to store the current thread ID
let assistantid = "asst_fREOmpcaYPqIx6MKmF15Chlo"; // Existing assistant ID


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

// API endpoint to create a thread and return messages
app.get('/createThread', async (req, res) => {
    try {
        // Create a new thread
        const thread = await openai.beta.threads.create();
        currentThreadId = thread.id; // Update the current thread ID
        
        // // Send a message to the thread
        // const message = await openai.beta.threads.messages.create(
        //     thread.id,
        //     {
        //         role: "user",
        //         content: "I am looking for a property in Utrecht with exactly 4 rooms."
        //     }
        // );

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

// API endpoint to add a message to the current thread and return messages
app.post('/addMessage', async (req, res) => {
    try {
        if (!currentThreadId) {
            return res.status(400).json({ error: "No thread created yet" });
        }

        // Extract the message content from the URL query parameters
        const { content } = req.query;

        // Add the message to the current thread
        const message = await openai.beta.threads.messages.create(
            currentThreadId,
            {
                role: "user",
                content: content
            }
        );

        // Run the assistant in the thread
        let run = await openai.beta.threads.runs.createAndPoll(
            currentThreadId,
            {
                assistant_id: assistantid,
            }
        );

        // Check if the run is completed
        if (run.status === 'completed') {
            // Retrieve messages in the thread
            const messages = await openai.beta.threads.messages.list(currentThreadId);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
