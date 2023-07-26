export type Role = "master" | "player";

export type UserData = {
    address: string;
    role: Role;
    name: string;
    surname: string;
    image: string;
    description: string;
};
