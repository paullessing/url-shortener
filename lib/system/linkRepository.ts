///<reference path='../../typings/tsd.d.ts' />

import Promise = require('bluebird');
import linkModel = require("./link");
import moment = require("moment");
import LinkDetails = require('../shared/linkDetails');
import Link = linkModel.Link;
import repository = linkModel.repository;

// TODO move out into SlugGenerator class
function generateSlug(): string {
    var time = '' + new Date().getTime();
    return 's' + time.substring(time.length - 5); // TODO
}

function attemptNewSlug(resolve: (string) => void, reject: (any) => void, count?: number) {
    count = count || 0;
    if (count > 10) {
        reject(new Error("Tried too many times to generate a slug"));
        return;
    }

    var slug = generateSlug();
    repository.where('slug', slug).count(function(err, count) {
        if (err) {
            reject(new Error(err));
            return;
        }
        if (count === 0) {
            resolve(slug)
        } else {
            attemptNewSlug(resolve, reject, count + 1);
        }
    });
}

export var generateNewSlug = function(): Promise<string> {
    return new Promise<string>(attemptNewSlug);
};

export var isSlugUnused = function(slug: string): Promise<boolean> {
    return new Promise<boolean>(function(resolve: (boolean) => void, reject) {
        repository.where('slug', slug).count(function (err, count) {
            if (err) {
                reject(err);
            }
            resolve(count === 0);
        });
    });
};

export var save = function(link: LinkDetails): Promise<Link> {
    return Promise.resolve(repository.create(link));
};

export var fetchBySlug = function(slug: string): Promise<Link> {
    return new Promise<Link>((resolve: (Link) => void, reject) => {
        repository.where('slug', slug).findOne((err, link: Link) => {
            if (err) {
                reject(err);
            } else {
                resolve(link);
            }
        });
    });
};