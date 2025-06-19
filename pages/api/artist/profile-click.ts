import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        const { artistId } = req.query;

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("artists");
        const adsCollection = db.collection("ads");
        const findArtist = await collection.findOne({ _id: new ObjectId(artistId as string) });
        if (!findArtist) {
            return res.status(404).json({
                ok: false,
                message: "Artist not found"
            });
        }
        await collection.updateOne({ _id: new ObjectId(artistId as string) }, { $inc: { clickCount: 1, adsClickCount: findArtist.isAdActive ? 1 : 0 } });
        if (findArtist.isAdActive) {
            await adsCollection.updateOne({ artistId: artistId, status: "running" }, { $inc: { clickCount: 1 } });
        }
        res.status(200).json({
            ok: true,
            message: "Sikeres kattintás",
        });
    } else {
        res.status(405).json({
            ok: false,
            message: "Method not allowed"
        });
    }
}

export default handler;