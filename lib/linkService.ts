///<reference path='../typings/tsd.d.ts' />

import Promise = require("bluebird");
import linkModel = require("./link");
import moment = require("moment");
import Link = linkModel.Link;

import repository = require('./linkRepository');
import LinkDetails = linkModel.LinkDetails;

function generateAdminId(): string {
    var time = '' + new Date().getTime();
    return 'a' + time.substring(time.length - 7); // TODO
}

export var create = function(link: LinkDetails): Promise<Link> {
    return Promise.resolve()
        .then(() => {
            if (link.slug) {
                return ensureValidSlug(link.slug).thenReturn();
            } else {
                return repository.generateNewSlug()
                    .then(slug => {
                        link.slug = slug;
                    });
            }
        }).then(() => {
            if (!link.expires) {
                link.expires = moment().add(7, 'days').toDate();
            }
            link.adminId = generateAdminId();
            return repository.save(link);
        });
};

function ensureValidSlug(slug: string): Promise<string> {
    return repository.isSlugUnused(slug).then(isValid => {
        if (!isValid) {
            throw new Error("Duplicate slug");
        } else {
            return slug;
        }
    })
}

export var get = function(slug: string, andIncrement?: boolean) {
    return repository.fetchBySlug(slug).then(link => {
        if (andIncrement) {
            link.accessCount++;
            link.save();
        }
        return link; //Don't wait for persist, it can happen asynchronously
    });
};