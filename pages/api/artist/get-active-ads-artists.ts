import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
    try {
        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("artists");
        
        // Get current date to check if ads are still active
        const now = new Date();
        
        const artists = await collection.find({
            isAdActive: true,
            adsUntil: { $gt: now } // Only get artists whose ads haven't expired
        }).sort({ adsUntil: 1 }).toArray(); // Sort by ad end date, earliest first

        res.status(200).json({
            ok: true,
            message: "Active ads artists fetched successfully",
            artists: artists
        });
    } catch (error) {
        res.status(500).json({  
            ok: false,
            message: "Error occurred while fetching active ads artists",
            error: error
        });
    }
    } else {
        res.status(405).json({
            ok: false,
            message: "Method not allowed"
        });
    }
}

export default handler; 