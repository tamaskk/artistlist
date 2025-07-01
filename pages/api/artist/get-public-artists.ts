import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('🎯 API endpoint called: /api/artist/get-public-artists');
    console.log('📝 Request method:', req.method);
    
    if (req.method === "GET") {
        try {
            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const collection = db.collection("artists");

            // Get all artists that are public
            const artists = await collection.find({ 
                isPublic: true 
            }).toArray();

            console.log('✅ Found public artists:', artists.length);

            res.status(200).json({
                ok: true,
                message: "Public artists retrieved successfully",
                artists: artists
            });
        } catch (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ 
                ok: false, 
                message: "Database error occurred" 
            });
        }
    } else {
        console.log('❌ Method not allowed:', req.method);
        res.status(405).json({ ok: false, message: "Method not allowed" });
    }
}

export default handler; 