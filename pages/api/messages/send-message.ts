import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, email, message, artistId } = req.body;

    console.log(name, email, message, artistId)

    try {
        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("messages");

        const addMessage = await collection.insertOne({
            name,
            email,
            message,
            artistId: new ObjectId(artistId),
            isRead: false,
            readAt: null,
            createdAt: new Date()
        });

        res.status(200).json({
            ok: true,
            message: "Sikeres üzenet küldés",
            messageId: addMessage.insertedId
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Hiba történt" });
        console.log(error);
    }
}

export default handler;