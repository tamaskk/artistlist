type AdStatus = "running" | "completed";

export interface Ad {
    _id: string;
    artistId: string;
    title: string;
    adDays: number;
    adEndDate: Date;
    createdAt: Date;
    status: AdStatus;
    clickCount: number;
}
