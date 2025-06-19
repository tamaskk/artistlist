import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const updateArtist = async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ 
            ok: false, 
            message: "Nem vagy bejelentkezve" 
        });
    }

    const { id } = req.query;

    if (!req.body.name) {
        return res.status(400).json({ message: "Name is required" });
    }

    try {
    const client = await connectMongo();
    const db = client.db("artistlist-db");
    const collection = db.collection("artists");

    const bodyWithoutId = { ...req.body };
    delete bodyWithoutId._id;

        const artist = await collection.updateOne({ _id: new ObjectId(id as string) }, { $set: bodyWithoutId });
        
        return res.status(200).json({ message: "Artist updated successfully", artist, ok: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", ok: false });
    }
} 

export default updateArtist;