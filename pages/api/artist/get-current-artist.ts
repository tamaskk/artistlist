import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";
import { Artist, ArtistEvent } from "@/types/artist.type";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return res.status(401).json({ 
            ok: false, 
            message: "Nem vagy bejelentkezve" 
        });
    }

    const { id } = req.query;

    if (req.method === "GET") {
    try {
        const objectId = new ObjectId(id as string);

        const client = await connectMongo();
        const db = client.db("artistlist-db");
        const collection = db.collection("artists");
        const artist = await collection.findOne({
            _id: objectId
        });

        const filterEvents = artist?.events

        const currentDate = new Date();
        const validEvents = filterEvents?.filter((event: ArtistEvent) => new Date(event.date) > currentDate);

        const artistWithValidEvents = {
            ...artist,
            events: validEvents
        }

        // Save the artist with the valid events to the database
        await collection.updateOne({
            _id: objectId
        }, {
            $set: {
                events: validEvents
            }
        });

        res.status(200).json({
            ok: true,
            message: "Sikeres lekérés",
            artist: artistWithValidEvents
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