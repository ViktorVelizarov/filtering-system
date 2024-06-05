import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request) { 
    const url = 'mongodb+srv://viktorvelizarov1:klimatik@cluster0.dvrqh5s.mongodb.net/';
    const dbName = 'houses_data';
    const collectionName = 'properties';
    const client = new MongoClient(url);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const housesData = await collection.find({}).toArray();
  return NextResponse.json(housesData);
}