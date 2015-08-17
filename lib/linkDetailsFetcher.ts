///<reference path='../typings/tsd.d.ts' />

import Promise = require("bluebird");
import linkModel = require("./link");
import moment = require("moment");
import Link = linkModel.Link;
import LinkDetails = linkModel.LinkDetails;
import repository = require('./linkRepository');

/**
 * Utility object for populating LinkDetails objects with the required fields for persisting.
 */
export function generateAdminId(link: LinkDetails): Promise<string> {
    var time = '' + new Date().getTime();
    var adminId = 'a' + time.substring(time.length - 7);
    return Promise.resolve(adminId);
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
    return repository.isSlugUnused(slug).then(isValid => {
        if (isValid) {
            return slug;
        } else {
            throw new Error("Duplicate slug");
        }
    })
}
