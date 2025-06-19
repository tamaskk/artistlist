export interface Message {
    _id: string;
    name: string;
    email: string;
    message: string;
    artistId: string;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
}