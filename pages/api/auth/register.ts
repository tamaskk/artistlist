import { connectMongo } from "@/db/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
        try {
            const { name, email, password, } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ 
                    ok: false,
                    message: "Minden mező kitöltése kötelező" 
                });
            }

            // Check if email already exists
            const client = await connectMongo();
            const db = client.db("artistlist-db");
            const collection = db.collection("users");

            const existingArtist = await collection.findOne({ email });
            if (existingArtist) {
                return res.status(400).json({ 
                    ok: false,
                    message: "Ez az email cím már foglalt" 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const artist = {
                name,
                email,
                password: hashedPassword,
                createdAt: new Date(),
            }

            const result = await collection.insertOne(artist);

            return res.status(200).json({ 
                ok: true,
                message: "Sikeres regisztráció", 
                artistId: result.insertedId 
            });
        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json({ 
                ok: false,
                message: "Szerver hiba történt" 
            });
        }
    } else {
        return res.status(405).json({ 
            ok: false,
            message: "Nem engedélyezett metódus" 
        });
    }
}

export default handler;