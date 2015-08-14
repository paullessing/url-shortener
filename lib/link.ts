///<reference path='../typings/tsd.d.ts' />

import mongoose = require("mongoose");


export var linkSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    adminId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        'default': Date.now,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    accessCount: {
        type: Number,
        'default': 0,
        required: true
    }
});

export interface LinkDetails {
    url: string;
    slug?: string;
    adminId?: string,
    expires?: Date
}

export interface Link extends LinkDetails, mongoose.Document {
    url: string;
    slug: string;
    adminId: string;
    createdAt: Date;
    expires: Date;
    accessCount: number;
}

export var repository = mongoose.model<Link>("Link", linkSchema);