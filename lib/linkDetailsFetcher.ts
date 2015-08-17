///<reference path='../typings/tsd.d.ts' />

import Promise = require("bluebird");
import linkModel = require("./link");
import moment = require("moment");
import Link = linkModel.Link;
import LinkDetails = linkModel.LinkDetails;
import repository = require('./linkRepository');
import crypto = require('crypto');

var invalidSlugs = [
    'resources',
    'admin'
]; // TODO quantify somehow

/**
 * Utility object for populating LinkDetails objects with the required fields for persisting.
 */
export function generateAdminId(link: LinkDetails): Promise<string> {
    var md5 = crypto.createHash('md5');
    var hash: string = md5.update(link.url)
        .update('link.slug')
        .update(Math.random().toString())
        .digest('hex');
    return Promise.resolve(hash.substr(3,12));
}

export function getExpiry(expiry: Date): Promise<Date> {
    if (!expiry || !moment(expiry).isAfter(moment())) {
        expiry = moment().add(7, 'days').toDate(); // TODO default expiry should be configurable
    }
    return Promise.resolve(expiry);
}

export function validateOrGenerateSlug(slug: string): Promise<string> {
    if (slug) {
        return ensureValidSlug(slug);
    } else {
        return repository.generateNewSlug();
    }
}

function ensureValidSlug(slug: string): Promise<string> {
    return Promise.all(invalidSlugs.map(invalidSlug => {
        if (slug.toLowerCase() === invalidSlug) {
            return Promise.reject(new Error('Invalid Slug'));
        } else {
            return Promise.resolve();
        }
    })).then(() => {
        return repository.isSlugUnused(slug).then(isValid => {
            if (isValid) {
                return slug;
            } else {
                throw new Error("Duplicate slug");
            }
        })
    });
}
