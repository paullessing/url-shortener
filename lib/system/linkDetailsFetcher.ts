///<reference path='_all.ts' />

import Promise = require("bluebird");
import linkModel = require("./link");
import moment = require("moment");
import { LinkDetails } from '../shared/linkDetails';
import { Link } from './link';
import * as linkRepository from './linkRepository';
import crypto = require('crypto');

var invalidSlugs = [
    '404',
    'res',
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

export function getExpiry(expirySeconds: number): Promise<Date> {
    var expiry: moment.Moment;
    if (!expirySeconds || expirySeconds <= 0) {
        expiry = moment().add(7, 'days'); // TODO default expiry should be configurable
    } else {
        expiry = moment().add(expirySeconds, 'seconds');
    }
    return Promise.resolve(expiry.toDate());
}

export function validateOrGenerateSlug(slug: string): Promise<string> {
    if (slug) {
        return ensureValidSlug(slug);
    } else {
        return linkRepository.generateNewSlug();
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
        return linkRepository.isSlugUnused(slug).then(isValid => {
            if (isValid) {
                return slug;
            } else {
                throw new Error("Duplicate slug");
            }
        })
    });
}
