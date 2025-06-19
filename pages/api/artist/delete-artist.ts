import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ 
            ok: false, 
            message: "Nem vagy bejelentkezve" 
        });
    }

    if (req.method === "DELETE") {
        const { id } = req.query;

        try {

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("artists");

        const artist = await collection.deleteOne({
            _id: new ObjectId(id as string)
        });

        res.status(200).json({
            ok: true,
            message: "Sikeres törlés",
            artist: artist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", ok: false });
    } finally {
        await client.close();
    }
    } else {
        res.status(405).json({
            ok: false,
            message: "Method not allowed"
        });
    }
}

export default handler; 