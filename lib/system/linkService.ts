///<reference path='../../typings/tsd.d.ts' />


import Promise = require("bluebird");
import linkModel = require("./link");
import moment = require("moment");

import repository = require('./linkRepository');

import linkDetailsFetcher = require('./linkDetailsFetcher');

class LinkBuilder {
    private _url: string;
    private _adminId: string;
    private _slug: string;
    private _expiry: Date;

    public constructor(url: string) {
        this._url = url;
    }

    set slug(slug: string) {
        this._slug = slug;
    }

    set adminId(adminId: string) {
        this._adminId = adminId;
    }

    set expiry(expiry: Date) {
        this._expiry = expiry;
    }

    public toLink(): Link {
        if (!this._adminId || !this._slug || !this._expiry) {
            throw new Error("Cannot build incomplete Link");
        }
        return <Link> {
            url: this._url,
            slug: this._slug,
            adminId: this._adminId,
            expires: this._expiry,
            accessCount: 0,
            createdAt: moment().toDate()
        };
    }
}

export var create = function(link: LinkDetails): Promise<Link> {
    var builder = new LinkBuilder(link.url);
    return Promise.all([
        linkDetailsFetcher.validateOrGenerateSlug(link.slug)
            .then(slug => builder.slug = slug),
        linkDetailsFetcher.getExpiry(link.expiresSeconds)
            .then(expiry => builder.expiry = expiry),
        linkDetailsFetcher.generateAdminId(link)
            .then(adminId => builder.adminId = adminId)
    ]).then(() => {
        return repository.save(builder.toLink());
    });
};

export var get = function(slug: string, andIncrement?: boolean) {
    return repository.fetchBySlug(slug).then(link => {
        if (!link) {
            return Promise.reject(new Error("No such URL"));
        }
        if (andIncrement) {
            link.accessCount++;
            link.save();
        }
        return Promise.resolve(link); //Don't wait for persist, it can happen asynchronously
    });
};