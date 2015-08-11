///<reference path='../typings/tsd.d.ts' />

import Promise = require("bluebird");
import mongoose = require("mongoose");
import linkModel = require("./link");
import moment = require("moment");
import Link = linkModel.Link;
import repository = linkModel.repository;

function generateSlug(): string {
    var time = '' + new Date().getTime();
    return 's' + time.substring(time.length - 5); // TODO
}

function ensureValidSlug(link: Link): Promise<void> {
    return new Promise<void>(function(resolve: () => void) {
        trySlug(link.slug || generateSlug(), slug => {
            link.slug = slug;
            resolve();
        });
    });
}

function trySlug(slug: string, resolve: (string) => void) {
    repository.where('slug', slug).count(function(err, count) {
        if (err) {
            throw new Error(err);
        }
        if (count === 0) {
            resolve(slug)
        } else {
            trySlug(generateSlug(), resolve);
        }
    });
}


function generateAdminId(): string {
    var time = '' + new Date().getTime();
    return 'a' + time.substring(time.length - 7); // TODO
}

export var create = function(link: Link) {
    if (!link.expires) {
        link.expires = moment().add(7, 'days').toDate();
    }
    link.adminId = generateAdminId();
    return ensureValidSlug(link).then(function() {
        return repository.create(link);
    });
};

export var get = function(slug: string, andIncrement?: boolean) {
    return new Promise<Link>(function(resolve: (Link) => void, reject) {
        repository.where('slug', slug).findOne((err, link: Link) => {
            if (err) {
                reject(err);
            } else {
                resolve(link);
                if (andIncrement) {
                    link.accessCount++;
                    link.save();
                }
            }
        });
    });
};

export var increment = function(link: Link) {

}