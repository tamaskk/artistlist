export interface User {
    name: string;
    email: string;
    password: string;
    maximumArtists: number;
}

export interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
}