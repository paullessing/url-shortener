import Promise = require("bluebird");
import moment = require("moment");
import crypto = require('crypto');
import * as linkRepository from './linkRepository';

var invalidSlugs = [
    '404',
    'res',
    'admin'
]; // TODO quantify somehow


/**
 * Utility object for populating LinkDetails objects with the required fields for persisting.
 */

export function ensureValidUrl(url: string): Promise<string> {
    if (!url) {
        return Promise.reject(new Error('URL is required'));
    }
    var validProtocol = /^[a-z]+:\/\//;
    if (!validProtocol.test(url)) {
        url = 'http://' + url;
    }
    var validUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    if (validUrl.test(url)) {
        return Promise.resolve(url);
    } else {
        return Promise.reject(new Error('Not a valid URL'));
    }
}

export function generateAdminId(url: string, slug: string): Promise<string> {
    var md5 = crypto.createHash('md5');
    var hash: string = md5.update(url)
        .update(slug)
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
        }
        var regex = /^[0-9a-zA-Z_-]+$/;
        if (!regex.test(slug)) {
            return Promise.reject(new Error('Invalid characters!'));
        }
        return Promise.resolve(slug);
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
