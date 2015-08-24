///<reference path='_all.ts' />

export interface LinkDetails {
    url: string;
    slug?: string;
    expiresSeconds?: number
};

export interface LinkResult {
    url: string;
    slug: string;
    adminId: string;
    expires: Date;
}
