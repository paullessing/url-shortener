import moment = require("moment");
import { Link, repository } from './link';
import { LinkDetails } from '../shared/linkDetails';

// TODO move out into SlugGenerator class
function generateSlug(): string {
    var time = '' + new Date().getTime();
    return 's' + time.substring(time.length - 5); // TODO
}

function attemptNewSlug(resolve: (slug: string) => void, reject: (error: Error) => void, count?: number) {
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
    return new Promise<string>((resolve, reject) => attemptNewSlug(resolve, reject));
};

export var isSlugUnused = function(slug: string): Promise<boolean> {
    return new Promise<boolean>(function(resolve: (isUnused: boolean) => void, reject: (err: Error) => void) {
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

export var fetchBySlug = function(slug: string, includeExpired?: boolean): Promise<Link> {
    return new Promise<Link>((resolve: (link: Link) => void, reject: (err: Error) => void) => {
        var query = { slug: slug };
        if (!includeExpired) {
            query['expires'] = { $gt: moment().toDate() };
        }
        repository.findOne(query, (err: Error, link: Link) => {
            if (err) {
                reject(err);
            } else {
                resolve(link);
            }
        });
    });
};
