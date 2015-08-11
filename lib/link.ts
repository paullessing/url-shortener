///<reference path='../typings/tsd.d.ts' />

import mongoose = require("mongoose");


export var linkSchema = new mongoose.Schema({
    url: String,
    slug: String,
    adminId: String,
    createdAt: { type: Date, default: Date.now },
    expires: Date,
    accessCount: { type: Number, default: 0 }
});

export interface Link extends mongoose.Document {
    url: string;
    slug: string;
    adminId: string;
    createdAt: Date;
    expires: Date;
    accessCount: number;
};

export var repository = mongoose.model<Link>("Link", linkSchema);