///<reference path='_all.ts' />

import * as Promise from 'bluebird';
import { Link } from './link';
import { LinkDetails } from '../shared/linkDetails';
import moment = require("moment");

import repository = require('./linkRepository');

import linkDetailsFetcher = require('./linkDetailsFetcher');

class LinkBuilder {
    public url: string;
    public adminId: string;
    public slug: string;
    public expiry: Date;

    public toLink(): Link {
        if (!this.url || !this.adminId || !this.slug || !this.expiry) {
            throw new Error("Cannot build incomplete Link");
        }
        return <Link> {
            url: this.url,
            slug: this.slug,
            adminId: this.adminId,
            expires: this.expiry,
            accessCount: 0,
            createdAt: moment().toDate()
        };
    }
}

export var create = function(link: LinkDetails): Promise<Link> {
    var builder = new LinkBuilder();
    return Promise.all([
        linkDetailsFetcher.ensureValidUrl(link.url)
            .then(url => builder.url = url),
        linkDetailsFetcher.validateOrGenerateSlug(link.slug)
            .then(slug => builder.slug = slug),
        linkDetailsFetcher.getExpiry(link.expiresSeconds)
            .then(expiry => builder.expiry = expiry)
    ]).then(() => // Generating admin ID happens after the other two, so slug and/or expiry can be used to generate the ID
        linkDetailsFetcher.generateAdminId(builder.url, builder.slug)
            .then(adminId => builder.adminId = adminId)
    ).then(() => repository.save(builder.toLink()));
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