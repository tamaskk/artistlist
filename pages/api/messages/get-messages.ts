import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ 
            ok: false, 
            message: "Nem vagy bejelentkezve" 
        });
    }


    if (req.method === "GET") {
    try {
        const artistId = req.query.artistId;

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("messages");
        const messages = await collection.find({
            artistId: new ObjectId(artistId as string)
        }).toArray();


        res.status(200).json({
            ok: true,
            message: "Sikeres lekérés",
            messages: messages
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