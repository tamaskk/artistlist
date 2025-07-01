import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { ObjectId } from "mongodb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('🎯 API endpoint called: /api/artist/get-active-ads-count');
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
            
            // Get active ads for all user's artists
            const artistsCollection = db.collection("artists");
            const activeAdsCount = await artistsCollection.countDocuments({
                user: new ObjectId(session.user.id),
                isAdActive: true,
                adsUntil: { $gt: new Date() } // Ads that haven't expired yet
            });

            console.log('✅ Active ads count:', activeAdsCount);

            res.status(200).json({
                ok: true,
                message: "Active ads count retrieved successfully",
                activeAdsCount: activeAdsCount
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