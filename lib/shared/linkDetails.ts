///<reference path='../../typings/tsd.d.ts' />

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
