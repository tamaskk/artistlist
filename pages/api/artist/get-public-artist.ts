import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { ArtistEvent } from "@/types/artist.type";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        try {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({
                    ok: false,
                    message: "Artist ID is required"
                });
            }

            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const collection = db.collection("artists");

            let objectId;
            try {
                objectId = new ObjectId(id);
            } catch {
                return res.status(400).json({
                    ok: false,
                    message: "Invalid artist ID format"
                });
            }

            const artist = await collection.findOne({
                _id: objectId,
                isPublic: true // Only return public artists
            });

            if (!artist) {
                return res.status(404).json({
                    ok: false,
                    message: "Artist not found or not public"
                });
            }

            // Filter events to only show future events
            const currentDate = new Date();
            const validEvents = artist.events?.filter((event: ArtistEvent) => 
                new Date(event.date) > currentDate
            ) || [];

            // Increment click count for analytics
            await collection.updateOne(
                { _id: objectId },
                { $inc: { clickCount: 1 } }
            );

            const artistWithValidEvents = {
                ...artist,
                events: validEvents
            };

            res.status(200).json({
                ok: true,
                message: "Artist retrieved successfully",
                artist: artistWithValidEvents
            });

        } catch (error) {
            console.error("Error fetching public artist:", error);
            res.status(500).json({
                ok: false,
                message: "Error occurred while fetching artist",
                error: error instanceof Error ? error.message : 'Unknown error'
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