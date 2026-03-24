import { getDB } from "../db/mongo.js";

export async function getAllShelters () {
    try {
        const db = getDB();
        const shelters = await db.collection('shelters').find({}).limit(20).toArray();
        return shelters;
    } catch (error) {
        throw new Error(`failed to fetch shelters: ${error.message}`);
    }
};

export async function getNearestShelters(lat, lng) {
    try {
        const db = getDB();
        const collection = db.collection('shelters');

        const nearest = await collection.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)] 
                    }
                }
            }
        }).limit(15).toArray();

        return nearest;
    } catch (error) {
        throw new Error(`Error finding nearest shelters: ${error.message}`);
    }
}