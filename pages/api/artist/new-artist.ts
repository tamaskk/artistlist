import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('🎯 API endpoint called: /api/artist/new-artist');
    console.log('📝 Request method:', req.method);
    console.log('📦 Request body:', req.body);
    
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    console.log('🔐 Session:', session ? { id: session.user?.id, email: session.user?.email } : 'No session');
    
    if (!session?.user?.id) {
        console.log('❌ No session or user ID found');
        return res.status(401).json({ 
            ok: false, 
            message: "Nem vagy bejelentkezve" 
        });
    }

    if (req.method === "POST") {
        const { name, concept, location, bio } = req.body;
        console.log('📋 Artist data:', { name, concept, location, bio });

        try {
            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const collection = db.collection("artists");

            const artist = await collection.insertOne({ 
                name, 
                concept, 
                location, 
                bio, 
                user: new ObjectId(session.user.id),
                createdAt: new Date(),
                isPublic: false // Default to private
            });

            console.log('✅ Artist created successfully:', artist.insertedId);

            res.status(200).json({
                ok: true,
                message: "Sikeres regisztráció",
                artistId: artist.insertedId,
            });
        } catch (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ 
                ok: false, 
                message: "Database error occurred" 
            });
        }
    } else {
        console.log('❌ Method not allowed:', req.method);
        res.status(405).json({ ok: false, message: "Method not allowed" });
    }
}

export default handler;