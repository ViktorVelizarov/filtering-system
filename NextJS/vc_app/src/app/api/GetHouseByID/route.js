import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request) {
    const url = 'mongodb+srv://viktorvelizarov1:klimatik@cluster0.dvrqh5s.mongodb.net/';
    const dbName = 'houses_data';
    const collectionName = 'properties';
    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'House ID is required' }, { status: 400 });
        }

        let house;
        try {
            // Convert the id to a number since PropertyID is numeric
            house = await collection.findOne({ PropertyID: Number(id) });
        } catch (e) {
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }

        if (!house) {
            return NextResponse.json({ error: 'House not found' }, { status: 404 });
        }

        return NextResponse.json(house);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await client.close();
    }
}
