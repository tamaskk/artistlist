import { ObjectId } from "mongodb";

// UI-specific types that extend the base types
export interface ArtistMember {
    id: string;
    image: File | null;
    imageUrl?: string;
    name: string;
    role: string;
    bio: string;
}

export interface ArtistSocial {
    name: string;
    url: string;
}

export interface ArtistSocialWithId extends ArtistSocial {
    id: string;
}

export interface ArtistEvent {
    name: string;
    date: Date;
    location: string;
}

export interface ArtistEventWithId extends ArtistEvent {
    id: string;
}

export interface ArtistImage {
    id: string;
    file: File;
    preview: string;
    url: string | null;
    isMain: boolean;
}

export interface ArtistSet {
    id: string;
    title: string;
    platform: 'youtube' | 'soundcloud';
    url: string;
    description?: string;
}

export interface Artist {
    _id: string;
    name: string;
    concept: string;
    location: string;
    bio: string;
    images: string[];
    user: ObjectId;
    createdAt: Date;
    members: ArtistMember[];
    socials: ArtistSocial[];
    ownEquipment: string[];
    needsEquipment: string[];
    events: ArtistEvent[];
    sets: ArtistSet[];
    isPublic: boolean;
    adsUntil: Date;
    isAdActive: boolean;
    clickCount: number;
    adsClickCount: number;
}

// UI-specific type that extends Artist
export interface ArtistWithFiles extends Omit<Artist, 'images' | 'members' | 'socials'> {
    images: ArtistImage[];
    members: ArtistMember[];
    socials: ArtistSocialWithId[];
}