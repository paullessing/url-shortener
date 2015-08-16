///<reference path='../typings/tsd.d.ts' />

import Promise = require('bluebird');

import linkModel = require("../lib/link");
import Link = linkModel.Link;
import LinkDetails = linkModel.LinkDetails;

var mockery = require('mockery');

import chai = require('chai');
import sinon = require('sinon');
sinon.assert.expose(chai.assert, { prefix: "" });
var assert = chai.assert;

describe("LinkService", function() {
    var linkService;

    var adminId = 'a12345';
    var expiry = new Date(151);
    var slug = 'slugfest';

    var linkRepository = {
        save: sinon.stub(),
        isSlugUnused: sinon.stub(),
        fetchBySlug: sinon.stub(),
        generateNewSlug: sinon.stub()
    };
    var linkDetailsFetcher = {
        generateAdminId: sinon.stub(),
        validateOrGenerateSlug: sinon.stub(),
        getExpiry: sinon.stub()
    };

    function fetcherReturnsDefaults() {
        linkDetailsFetcher.generateAdminId.returns(Promise.resolve(adminId));
        linkDetailsFetcher.getExpiry.returns(Promise.resolve(expiry));
        linkDetailsFetcher.validateOrGenerateSlug.returns(Promise.resolve(slug));
    }
    var link;

    before(function() {
        mockery.enable();
        mockery.registerMock('./linkRepository', linkRepository);
        mockery.registerMock('./linkDetailsFetcher', linkDetailsFetcher);
        mockery.registerAllowable('./link');
        mockery.registerAllowable('bluebird');
        mockery.registerAllowable('../lib/linkService'); // Under test

        linkService = require('../lib/linkService');
    });
    beforeEach(() => {
        linkRepository.save.reset();
        linkRepository.fetchBySlug.reset();
        linkRepository.isSlugUnused.reset();
        linkRepository.generateNewSlug.reset();
        linkDetailsFetcher.generateAdminId.reset();
        linkDetailsFetcher.getExpiry.reset();
        linkDetailsFetcher.validateOrGenerateSlug.reset();

        link = {
            _id: null,
            url: 'http://foo.bar',
            slug: 'slug',
            expires: new Date(),
            createdAt: new Date(),
            accessCount: 0,
            save: sinon.stub()
        };
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('#get()', function() {
        it('should retrieve the link from the repository by slug', function() {
            var slug = 'mySlug';
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(link));

            return linkService.get(slug).then(resultLink => {
                assert.strictEqual(link, resultLink);
            });
        });
        it('should return null when the repository returns a null link', function() {
            var slug = 'mySlug';
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(null));

            return linkService.get(slug).then(resultLink => {
                assert.isNull(resultLink);
            });
        });
        it('should not do anything to the link when no argument is passed for andIncrement', function() {
            var slug = 'mySlug';
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(link));

            return linkService.get(slug).then(() => {
                assert.strictEqual(link.accessCount, 0);
                assert.ok(link.save.notCalled);
            });
        });
        it('should not do anything to the link when false is passed for andIncrement', function() {
            var slug = 'mySlug';
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(link));

            return linkService.get(slug, false).then(() => {
                assert.strictEqual(link.accessCount, 0);
                assert.ok(link.save.notCalled);
            });
        });
        it('should increment the accessCount and save if andIncrement is passed', function() {
            var slug = 'mySlug';
            var accessCount = link.accessCount = 19;
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(link));

            return linkService.get(slug, true).then(() => {
                assert.strictEqual(link.accessCount, accessCount + 1);
                assert.ok(link.save.calledOnce);
            });
        });
        it('should not fail if andIncrement is true but the link is null', function() {
            var slug = 'mySlug';
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(null));

            return linkService.get(slug, true).then(resultLink => {
                assert.isNull(resultLink);
            });
        });
    });

    describe('#create()', function() {
        it('should fail if the slug already exists', function() {
            var slug = 'mySlug';
            fetcherReturnsDefaults();
            var error = new Error('Duplicate slug');
            linkDetailsFetcher.validateOrGenerateSlug.withArgs(slug).returns(Promise.reject(error));

            return linkService.create({
                url: 'foo.bar',
                slug: slug
            }).then(function() {
                assert.fail("Should not pass");
            }).catch(function(errorThrown: Error) {
                assert.strictEqual(error, errorThrown);
            })
        });
        it('should use the values returned by the fetcher', function() {
            var oldExpiry = new Date(100);
            var oldSlug = 'barfoo';

            var newAdminId = 'abcdef';
            var newExpiry = new Date(111);
            var newSlug = 'foobar';

            var linkDetails: LinkDetails = {
                url: 'http://foo.bar',
                slug: oldSlug,
                expires: oldExpiry
            };

            linkDetailsFetcher.generateAdminId.withArgs(linkDetails).returns(Promise.resolve(newAdminId));
            linkDetailsFetcher.getExpiry.withArgs(oldExpiry).returns(Promise.resolve(newExpiry));
            linkDetailsFetcher.validateOrGenerateSlug.withArgs(oldSlug).returns(Promise.resolve(newSlug));

            linkRepository.save.withArgs(linkDetails).returns(Promise.resolve(link));

            return linkService.create(linkDetails)
                .then(() => {
                    var linkDetailsUsed: LinkDetails = linkRepository.save.firstCall.args[0];
                    assert.strictEqual(linkDetailsUsed.adminId, newAdminId);
                    assert.strictEqual(linkDetailsUsed.expires, newExpiry);
                    assert.strictEqual(linkDetailsUsed.slug, newSlug);
                });
        });
        it('should not modify the URL before passing to the repository', function() {
            var url = 'strict.url';
            var linkDetails: LinkDetails = {
                url: url,
                slug: 'slug',
                expires: new Date(0)
            };

            fetcherReturnsDefaults();

            linkRepository.save.withArgs(linkDetails).returns(Promise.resolve(link));

            return linkService.create(linkDetails)
                .then(() => {
                    var linkDetailsUsed: LinkDetails = linkRepository.save.firstCall.args[0];
                    assert.strictEqual(linkDetailsUsed.url, url);
                });
        });
        it('should return the Link created by the repository', function() {
            var linkDetails: LinkDetails = {
                url: 'some.url',
                slug: 'slug'
            };

            fetcherReturnsDefaults();

            linkRepository.save.withArgs(linkDetails).returns(Promise.resolve(link));

            return linkService.create(linkDetails)
                .then(linkCreated => {
                    assert.strictEqual(linkCreated, link);
                });
        });
    });
});