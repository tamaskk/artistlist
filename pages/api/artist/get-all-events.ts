import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { Artist, ArtistEvent } from "@/types/artist.type";

interface EventWithArtist extends ArtistEvent {
  artistId: string;
  artistName: string;
  artistConcept: string;
  artistLocation: string;
  artistImage?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const client = await connectMongo();
      const db = client.db("artistlist-db");
      const collection = db.collection("artists");
      
      // Get all artists with their events
      const artists = await collection.find({ 
        events: { $exists: true, $ne: [] }
      }).toArray();

      const currentDate = new Date();
      const allEvents: EventWithArtist[] = [];

      // Extract events from all artists and add artist information
      artists.forEach((artistDoc: any) => {
        const artist = artistDoc as Artist;
        if (artist.events && artist.events.length > 0) {
          const validEvents = artist.events.filter((event: ArtistEvent) => 
            new Date(event.date) >= currentDate
          );

          validEvents.forEach((event: ArtistEvent) => {
            allEvents.push({
              ...event,
              artistId: artist._id,
              artistName: artist.name,
              artistConcept: artist.concept,
              artistLocation: artist.location,
              artistImage: artist.images && artist.images.length > 0 ? artist.images[0] : undefined
            });
          });
        }
      });

      // Sort events by date (earliest first)
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.status(200).json({
        ok: true,
        message: "Events retrieved successfully",
        events: allEvents
      });

    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({  
        ok: false,
        message: "Error occurred while fetching events",
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