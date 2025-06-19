import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
        return res.status(401).json({ ok: false, message: "Nem vagy bejelentkezve" });
    }

    if (req.method === "POST") {
        const { artistId, adDays, adEndDate, title } = req.body;

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const artistCollection = db.collection("artists");
        const transactionCollection = db.collection("transactions");
        const adsCollection = db.collection("ads");
        const findArtist = await artistCollection.findOne({ _id: new ObjectId(artistId as string) });
        if (!findArtist) {
            return res.status(404).json({
                ok: false,
                message: "Artist not found"
            });
        }

        let adsUntil;

        if (adEndDate) {
            adsUntil = new Date(adEndDate);
            adsUntil.setHours(23, 59, 59, 999);
        } else {
            adsUntil = new Date(new Date().setDate(new Date().getDate() + adDays));
            adsUntil.setHours(23, 59, 59, 999);
        }

        const daysLeft = Math.ceil((adsUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        await artistCollection.updateOne({ _id: new ObjectId(artistId as string) }, { $set: { isAdActive: true, adsUntil: adsUntil } });

        const transaction = {
            type: 'ad',
            amount: adDays ? adDays * 5 : daysLeft * 5,
            createdAt: new Date(),
            status: "pending",
            artistId: artistId,
            userEmail: session.user.email as string
        }

        await transactionCollection.insertOne(transaction);

        const ad = await adsCollection.insertOne({
            artistId: artistId,
            title: title,
            adDays: adDays,
            adEndDate: adEndDate,
            createdAt: new Date(),
            status: "running",
            clickCount: 0,
        });

        res.status(200).json({
            ok: true,
            message: "Ad added",
            id: ad.insertedId.toString()
        });
    } else {
        res.status(405).json({
            ok: false,
            message: "Method not allowed"
        });
    }
}

export default handler;