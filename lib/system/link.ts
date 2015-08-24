///<reference path='_all.ts' />

import * as mongoose from 'mongoose';
import { LinkDetails } from '../shared/linkDetails';

var linkSchema = new mongoose.Schema({
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

export interface Link extends LinkDetails, mongoose.Document {
    url: string;
    slug: string;
    adminId: string;
    createdAt: Date;
    expires: Date;
    accessCount: number;
}

export var repository = mongoose.model<Link>("Link", linkSchema);

