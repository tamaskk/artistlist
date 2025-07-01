import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('🎯 API endpoint called: /api/artist/toggle-public');
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
        const { artistId, isPublic } = req.body;
        console.log('📋 Toggle data:', { artistId, isPublic });

        if (!artistId) {
            return res.status(400).json({ 
                ok: false, 
                message: "Artist ID is required" 
            });
        }

        try {
            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const collection = db.collection("artists");

            // Check if the artist belongs to the current user
            const artist = await collection.findOne({ 
                _id: new ObjectId(artistId),
                user: new ObjectId(session.user.id)
            });

            if (!artist) {
                return res.status(404).json({ 
                    ok: false, 
                    message: "Artist not found or you don't have permission to modify it" 
                });
            }

            // Update the artist's public status
            const result = await collection.updateOne(
                { _id: new ObjectId(artistId) },
                { $set: { isPublic: isPublic } }
            );

            if (result.modifiedCount === 0) {
                return res.status(500).json({ 
                    ok: false, 
                    message: "Failed to update artist status" 
                });
            }

            console.log('✅ Artist public status updated successfully');

            res.status(200).json({
                ok: true,
                message: isPublic ? "Artist is now public" : "Artist is now private",
                isPublic: isPublic
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