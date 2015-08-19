import mongoose = require('mongoose');
import Promise = require('bluebird');

import LinkDetails = require('../../lib/shared/linkDetails');
import linkModel = require("../../lib/system/link");
import Link = linkModel.Link;
import repository = linkModel.repository;

import chai = require('chai');
import sinon = require('sinon');

sinon.assert.expose(chai.assert, { prefix: "" });

import linkRepository = require('../../lib/system/linkRepository');

var assert = chai.assert;

describe('LinkRepository', function() {
    before(function() {
        return Promise.resolve(mongoose.connect('mongodb://localhost:27017/putit_at_test'));
    });
    afterEach(function() {
        return Promise.resolve(repository.remove({}));
    });
    after(function() {
        return mongoose.connection.close();
    });

    describe('#isSlugUnused()', function() {
        it('should return true when there are no other slugs', function() {
            return linkRepository.isSlugUnused('slug')
                .then(isUnused => {
                    assert.isTrue(isUnused);
                });
        });
        it('should return false when there is already such a slug', function() {
            var slug = 'slug';
            return createLink(slug)
            .then(function() {
                return linkRepository.isSlugUnused('slug');
            }).then(isUnused => {
                assert.isFalse(isUnused);
            });
        });
        it('should return true if there are other links but they don\'t have the same slug', function() {
            return createLink('otherSlug')
            .then(function() {
                return linkRepository.isSlugUnused('slug');
            }).then(isUnused => {
                assert.isTrue(isUnused);
            })
        });
    });

    describe('#save()', function() {
        it('should persist a link and return the persisted entity', function() {
            var link: LinkDetails = {
                url: 'foo.bar',
                slug: 'mySlug',
                adminId: 'a',
                expires: new Date()
            };
            return linkRepository.save(link)
                .then((link: Link) => {
                    Promise.resolve(repository.findOne({url: 'foo.bar'}).exec())
                        .then((repoLink: Link) => {
                            assert.ok(link.equals(repoLink));
                        })
                });
        });
    });

    describe('#fetchBySlug()', function() {
        it('should return null when there is no such element', function() {
            return linkRepository.fetchBySlug('noSuchSlug')
                .then((link: Link) => {
                    assert.isNull(link);
                });
        });
        it('should return a link when there is an element with the right slug', function() {
            var slug = 'slug';
            return createLink(slug)
                .then(function(repoLink) {
                    linkRepository.fetchBySlug(slug)
                        .then((link: Link) => {
                            assert.ok(link.equals(repoLink));
                        });
                })
        });
        it('should return null when other elements have different slugs and slug does not exist', function() {
            var slug = 'slug';
            return createLink(slug + '1')
                .then(function() {
                    return createLink(slug + '2');
                })
                .then(function() {
                    return linkRepository.fetchBySlug(slug)
                })
                .then((link: Link) => {
                    assert.isNull(link);
                });
        });
        it('should return the right slug when other elements have different slugs but slug exists', function() {
            var slug = 'slug';
            return createLink(slug + '1')
                .then(function() {
                    return createLink(slug).then(repoLink => {
                        return createLink(slug + '2')
                            .then(function() {
                                return linkRepository.fetchBySlug(slug)
                            })
                            .then((link: Link) => {
                                assert.ok(link.equals(repoLink));
                            });
                    });
                });
        });
    });

    // TODO create unit tests for generateNewSlug once we have moved the generator logic into a separate component

    function createLink(slug: string): Promise<Link> {
        return Promise.resolve(repository.create({
            url: 'foo',
            slug: slug,
            expires: new Date(),
            adminId: 'a'
        }));
    }
});