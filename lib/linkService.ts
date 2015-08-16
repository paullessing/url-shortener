///<reference path='../typings/tsd.d.ts' />

import Promise = require("bluebird");
import linkModel = require("./link");
import moment = require("moment");
import Link = linkModel.Link;

import repository = require('./linkRepository');
import LinkDetails = linkModel.LinkDetails;

import linkDetailsFetcher = require('./linkDetailsFetcher');

export var create = function(link: LinkDetails): Promise<Link> {
    return Promise.all([
        linkDetailsFetcher.validateOrGenerateSlug(link.slug)
            .then(slug => link.slug = slug),
        linkDetailsFetcher.getExpiry(link.expires)
            .then(expiry => link.expires = expiry),
        linkDetailsFetcher.generateAdminId(link)
            .then(adminId => link.adminId = adminId)
    ]).then(() => {
        return repository.save(link);
    });
};

export var get = function(slug: string, andIncrement?: boolean) {
    return repository.fetchBySlug(slug).then(link => {
        if (andIncrement && link) {
            link.accessCount++;
            link.save();
        }
        return link; //Don't wait for persist, it can happen asynchronously
    });
};