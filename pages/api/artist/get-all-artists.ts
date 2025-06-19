import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
    try {
        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("artists");
        const artists = await collection.find({
        }).sort({ isAdActive: -1 }).toArray();

        res.status(200).json({
            ok: true,
            message: "Sikeres lekérés",
            artists: artists
        });
    } catch (error) {
        res.status(500).json({  
            ok: false,
                message: "Hiba történt a lekérés során",
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