import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ ok: false, message: "Nem vagy bejelentkezve" });
    }

    if (req.method === "GET") {
        const { messageId } = req.query;

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("messages");
        await collection.updateOne({ _id: new ObjectId(messageId as string) }, { $set: { isRead: true, readAt: new Date() } });

        res.status(200).json({
            ok: true,
            message: "Sikeres olvasás",
        });
    } else {
        res.status(405).json({
            ok: false,
            message: "Method not allowed"
        });
    }
}

export default handler;