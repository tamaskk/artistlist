import { connectMongo } from "@/db/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
        return res.status(401).json({ ok: false, message: "Nem vagy bejelentkezve" });
    }

    if (req.method === "GET") {
        const { artistId } = req.query;

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const adsCollection = db.collection("ads");
        const findAds = await adsCollection.findOne({ artistId: artistId as string });
        if (!findAds) {
            return res.status(404).json({
                ok: false,
                message: "Ad not found"
            });
        }

        res.status(200).json({
            ok: true,
            message: "Ad fetched",
            ad: findAds
        });
    } else {
        res.status(405).json({
            ok: false,
            message: "Method not allowed"
        });
    }
}

export default handler;