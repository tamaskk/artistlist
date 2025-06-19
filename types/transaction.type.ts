export type TransactionType = 'ad' | 'slot';

export interface Transaction {
    _id: string;
    type: TransactionType;
    amount: number;
    createdAt: Date;
    status: 'pending' | 'completed' | 'failed';
    artistId: string;
    userEmail: string;
}