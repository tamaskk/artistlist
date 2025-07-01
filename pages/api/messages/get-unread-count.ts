import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('🎯 API endpoint called: /api/messages/get-unread-count');
    console.log('📝 Request method:', req.method);
    
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

    if (req.method === "GET") {
        try {
            const client = await connectMongo();
            const db = client.db("artistlist-db");
            
            // First get all artists belonging to the user
            const artistsCollection = db.collection("artists");
            const userArtists = await artistsCollection.findOne({ 
                user: new ObjectId(session.user.id) 
            });
            
            if (!userArtists) {
                return res.status(200).json({
                    ok: true,
                    message: "No artists found",
                    unreadCount: 0
                });
            }
            
            // Get unread messages for all user's artists
            const messagesCollection = db.collection("messages");
            const unreadMessages = await messagesCollection.countDocuments({
                artistId: userArtists._id,
                isRead: false
            });

            console.log('✅ Unread messages count:', unreadMessages);

            res.status(200).json({
                ok: true,
                message: "Unread count retrieved successfully",
                unreadCount: unreadMessages
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