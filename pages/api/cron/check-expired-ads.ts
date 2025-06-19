import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "@/db/mongodb";
import { ObjectId } from "mongodb";

interface ProcessResult {
    adId?: string | ObjectId;
    artistId?: string | ObjectId;
    title?: string;
    status?: string;
    error?: string;
    name?: string;
    action?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Verify the request is from a legitimate cron service
    // You can add additional security here like API keys
    const cronSecret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
        return res.status(401).json({ 
            ok: false, 
            message: "Unauthorized" 
        });
    }

    if (req.method === "POST") {
        try {
            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const adsCollection = db.collection("ads");
            const artistsCollection = db.collection("artists");
            
            const now = new Date();
            
            // Find all running ads that have expired
            const expiredAds = await adsCollection.find({
                status: "running",
                adEndDate: { $lt: now }
            }).toArray();
            
            console.log(`Found ${expiredAds.length} expired ads to process`);
            
            const results = {
                processed: 0,
                updated: 0,
                errors: 0,
                details: [] as ProcessResult[]
            };
            
            // Process each expired ad
            for (const ad of expiredAds) {
                try {
                    // Update ad status to completed
                    const adUpdateResult = await adsCollection.updateOne(
                        { _id: ad._id },
                        { $set: { status: "completed" } }
                    );
                    
                    // Update artist's isAdActive status
                    const artistUpdateResult = await artistsCollection.updateOne(
                        { _id: new ObjectId(ad.artistId) },
                        { 
                            $set: { 
                                isAdActive: false,
                                adsUntil: null,
                                adsClickCount: 0
                            } 
                        }
                    );
                    
                    if (adUpdateResult.modifiedCount > 0 && artistUpdateResult.modifiedCount > 0) {
                        results.updated++;
                        results.details.push({
                            adId: ad._id,
                            artistId: ad.artistId,
                            title: ad.title,
                            status: "completed"
                        });
                    }
                    
                    results.processed++;
                    
                } catch (error) {
                    console.error(`Error processing ad ${ad._id}:`, error);
                    results.errors++;
                    results.details.push({
                        adId: ad._id,
                        artistId: ad.artistId,
                        title: ad.title,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
            
            // Also check for artists with isAdActive: true but no corresponding running ad
            const orphanedArtists = await artistsCollection.find({
                isAdActive: true,
                $or: [
                    { adsUntil: { $lt: now } },
                    { adsUntil: null }
                ]
            }).toArray();
            
            console.log(`Found ${orphanedArtists.length} orphaned artists to fix`);
            
            // Fix orphaned artists
            for (const artist of orphanedArtists) {
                try {
                    const artistUpdateResult = await artistsCollection.updateOne(
                        { _id: artist._id },
                        { 
                            $set: { 
                                isAdActive: false,
                                adsUntil: null
                            } 
                        }
                    );
                    
                    if (artistUpdateResult.modifiedCount > 0) {
                        results.updated++;
                        results.details.push({
                            artistId: artist._id,
                            name: artist.name,
                            action: "fixed_orphaned_artist"
                        });
                    }
                    
                } catch (error) {
                    console.error(`Error fixing orphaned artist ${artist._id}:`, error);
                    results.errors++;
                }
            }
            
            console.log(`Cron job completed: ${results.processed} processed, ${results.updated} updated, ${results.errors} errors`);
            
            res.status(200).json({
                ok: true,
                message: "Expired ads check completed",
                timestamp: now.toISOString(),
                results: results
            });
            
        } catch (error) {
            console.error("Error in expired ads cron job:", error);
            res.status(500).json({
                ok: false,
                message: "Error processing expired ads",
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