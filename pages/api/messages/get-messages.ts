import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

// Function to validate if a string is a valid ObjectId
const isValidObjectId = (id: string): boolean => {
    return ObjectId.isValid(id);
};

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
            const artistId = req.query.artistId as string;

            // Validate if artistId is a valid ObjectId
            if (!artistId || !isValidObjectId(artistId)) {
                return res.status(400).json({
                    ok: false,
                    message: "Érvénytelen artist ID"
                });
            }

            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const collection = db.collection("messages");
            const messages = await collection.find({
                artistId: new ObjectId(artistId)
            }).toArray();

            res.status(200).json({
                ok: true,
                message: "Sikeres lekérés",
                messages: messages
            });

        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({  
                ok: false,
                message: "Hiba történt a lekérés során",
                error: error instanceof Error ? error.message : "Unknown error"
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