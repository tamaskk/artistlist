import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
        return res.status(401).json({ 
            ok: false, 
            message: "Nem vagy bejelentkezve" 
        });
    }

    if (req.method === "POST") {
        const { name, concept, location, bio } = req.body;

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("artists");

        const artist = await collection.insertOne({ 
            name, 
            concept, 
            location, 
            bio, 
            user: new ObjectId(session.user.id),
            createdAt: new Date()
        });

        res.status(200).json({
            ok: true,
            message: "Sikeres regisztráció",
            artistId: artist.insertedId,
        });
    } else {
        res.status(405).json({ ok: false, message: "Method not allowed" });
    }
}

export default handler;