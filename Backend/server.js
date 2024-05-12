const express = require("express");    
const cors = require("cors");    
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const openai_key = process.env.OPENAI_API_KEY;
app.use(cors());

const url = 'mongodb+srv://viktorvelizarov1:klimatik@cluster0.dvrqh5s.mongodb.net/';
const dbName = 'houses_data';
const collectionName = 'properties';

async function getEmbedding(query) {
    // Define the OpenAI API url and key.
    const url = 'https://api.openai.com/v1/embeddings';
    
    // Call OpenAI API to get the embeddings.
    let response = await axios.post(url, {
        input: query,
        model: "text-embedding-ada-002"
    }, {
        headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
        }
    });
    
    if(response.status === 200) {
        return response.data.data[0].embedding;
    } else {
        throw new Error(`Failed to get embedding. Status code: ${response.status}`);
    }
}

async function findSimilarDocuments(embedding) {
    const client = new MongoClient(url);
    
    try {
        await client.connect();  
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Query for similar documents.
        const documents = await collection.aggregate([
            {"$vectorSearch": {
                "queryVector": embedding,
                "path": "plot_embedding",
                "numCandidates": 100,
                "limit": 2,
                "index": "propertiesPlotIndex",
            }}
        ]).toArray();
        
        return documents;
    } finally {
        await client.close();
    }
}

app.get('/vectorSearch', async (req, res) => {
    try {
        const query = req.query.query;
        
        const embedding = await getEmbedding(query);
        const documents = await findSimilarDocuments(embedding);
        
        res.json(documents);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
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
        
        res.json(housesData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/generateItinerary', async (req, res) => {
    try {
        const housesResponse = await fetch('http://localhost:3000/houses');
        const housesData = await housesResponse.json();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openai_key}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: `Return me only the properties from this data that fit this description "the property's price is 890000 or more": ${JSON.stringify(housesData)}` }],
            })
        });

        const data = await response.json();
        console.log("OpenAI API response:", data); // Log the response from OpenAI API
         
        if (data && data.choices && data.choices.length > 0) {
            const result = data.choices[0]
            res.json({ result });
        } else {
            throw new Error("Empty or invalid response from OpenAI API");
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
