import { Artist } from "@/types/artist.type";

const registerArtist = async (artist: Partial<Artist>) => {
    const response = await fetch("/api/artist/new-artist", {
        method: "POST",
        body: JSON.stringify(artist),
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Sikertelen regisztráció");
    }

    return data;
};

const getArtists = async (): Promise<{
    ok: boolean;
    message: string;
    artists: Artist[];
}> => { 
    try {
        const response = await fetch("/api/artist/get-artists");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching artists:", error);
        throw error;
    }
}

const updateArtist = async (artist: Partial<Artist>) => {
    try {
        const response = await fetch(`/api/artist/update-artist?id=${artist._id}`, {
            method: "POST",
            body: JSON.stringify(artist),
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Sikertelen frissítés");
        }

        return data;
    } catch (error) {
        console.error("Error updating artist:", error);
        throw error;
    }
}

const getCurrentArtist = async (id: string) => {
    try {
        const response = await fetch(`/api/artist/get-current-artist?id=${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching current artist:", error);
        throw error;
    }
}

const getPublicArtist = async (id: string) => {
    try {
        const response = await fetch(`/api/artist/get-public-artist?id=${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching public artist:", error);
        throw error;
    }
}

const deleteArtist = async (id: string) => {
    const response = await fetch(`/api/artist/delete-artist?id=${id}`, {
        method: "DELETE",
    });
    const data = await response.json();
    return data;
}

const getAllArtists = async () => {
    try {
        const response = await fetch("/api/artist/get-all-artists");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching all artists:", error);
        throw error;
    }
}

const profileClick = async (artistId: string) => {
    try {
        const response = await fetch(`/api/artist/profile-click?artistId=${artistId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching profile click:", error);
        throw error;
    }
}

const addAd = async (artistId: string, adDays: number, adEndDate: Date, title: string) => {
    try {
    const response = await fetch("/api/artist/add-ad", {
        method: "POST",
        body: JSON.stringify({ artistId, adDays, adEndDate, title }),
        headers: {
            "Content-Type": "application/json",
        },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding ad:", error);
        throw error;
    }
}

const getAd = async (artistId: string) => {
    try {
        const response = await fetch(`/api/artist/get-ads?artistId=${artistId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching ad:", error);
        throw error;
    }
}

const getActiveAdsArtists = async () => {
    try {
        const response = await fetch("/api/artist/get-active-ads-artists");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching active ads artists:", error);
        throw error;
    }
}

const checkExpiredAds = async () => {
    try {
        const response = await fetch("/api/admin/manual-check-expired-ads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error checking expired ads:", error);
        throw error;
    }
}

const getAllEvents = async () => {
    try {
        const response = await fetch("/api/artist/get-all-events");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching all events:", error);
        throw error;
    }
}

export { getArtists, registerArtist, updateArtist, getCurrentArtist, getPublicArtist, deleteArtist, getAllArtists, profileClick, addAd, getAd, getActiveAdsArtists, checkExpiredAds, getAllEvents };