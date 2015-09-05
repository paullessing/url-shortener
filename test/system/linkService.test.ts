///<reference path='../../typings/tsd.d.ts' />

import Promise = require('bluebird');

import { LinkDetails } from '../../lib/shared/linkDetails';
import { Link } from '../../lib/system/link';
import * as moment from 'moment';

var mockery = require('mockery');

import chai = require('chai');
import sinon = require('sinon');
sinon.assert.expose(chai.assert, { prefix: "" });
var assert = chai.assert;

describe("LinkService", function() {
    var linkService;

    var url = 'some.url';
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
        getExpiry: sinon.stub(),
        ensureValidUrl: sinon.stub()
    };

    function fetcherReturnsDefaults() {
        linkDetailsFetcher.generateAdminId.returns(Promise.resolve(adminId));
        linkDetailsFetcher.getExpiry.returns(Promise.resolve(expiry));
        linkDetailsFetcher.validateOrGenerateSlug.returns(Promise.resolve(slug));
        linkDetailsFetcher.ensureValidUrl.returns(Promise.resolve(url));
    }
    var link;

    var now = moment(113);

    function mockMoment() {
        return now;
    }

    before(function() {
        mockery.enable();
        mockery.registerMock('./linkRepository', linkRepository);
        mockery.registerMock('./linkDetailsFetcher', linkDetailsFetcher);
        mockery.registerMock('moment', mockMoment);
        mockery.registerAllowable('./link');
        mockery.registerAllowable('bluebird');
        mockery.registerAllowable('../../lib/system/linkService'); // Under test

        linkService = require('../../lib/system/linkService');
    });
    beforeEach(() => {
        linkRepository.save.reset();
        linkRepository.fetchBySlug.reset();
        linkRepository.isSlugUnused.reset();
        linkRepository.generateNewSlug.reset();
        linkDetailsFetcher.generateAdminId.reset();
        linkDetailsFetcher.getExpiry.reset();
        linkDetailsFetcher.validateOrGenerateSlug.reset();
        linkDetailsFetcher.ensureValidUrl = sinon.stub(); // Hard reset since otherwise withArgs inherits

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
        it('should reject the promise when the repository returns a null link', function() {
            var slug = 'mySlug';
            linkRepository.fetchBySlug.withArgs(slug).returns(Promise.resolve(null));

            return linkService.get(slug).then(() => {
                assert.fail('Should not succeed');
            }).catch(err => {
                assert.isNotNull(err);
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

            return linkService.get(slug, true).then(() => {
                assert.fail('Should not succeed');
            }).catch(err => {
                assert.isNotNull(err);
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
            });
        });
        it('should use the values returned by the fetcher', function() {
            var oldUrl = 'foo.bar';
            var newUrl = 'http://foo.bar';

            var oldExpiry = 57;
            var newExpiry = new Date(111);

            var oldSlug = 'barfoo';
            var newSlug = 'foobar';

            var newAdminId = 'abcdef';

            var linkDetails: LinkDetails = {
                url: oldUrl,
                slug: oldSlug,
                expiresSeconds: oldExpiry
            };

            linkDetailsFetcher.ensureValidUrl.withArgs(oldUrl).returns(Promise.resolve(newUrl));
            linkDetailsFetcher.getExpiry.withArgs(oldExpiry).returns(Promise.resolve(newExpiry));
            linkDetailsFetcher.validateOrGenerateSlug.withArgs(oldSlug).returns(Promise.resolve(newSlug));
            linkDetailsFetcher.generateAdminId.withArgs(newUrl, newSlug).returns(Promise.resolve(newAdminId));

            linkRepository.save.withArgs(linkDetails).returns(Promise.resolve(link));

            return linkService.create(linkDetails)
                .then(() => {
                    var linkDetailsUsed: Link = linkRepository.save.firstCall.args[0];
                    assert.strictEqual(linkDetailsUsed.url, newUrl);
                    assert.strictEqual(linkDetailsUsed.adminId, newAdminId);
                    assert.strictEqual(linkDetailsUsed.expires, newExpiry);
                    assert.strictEqual(linkDetailsUsed.slug, newSlug);
                });
        });
        it('should fail gracefully when the URL cannot be validated', function() {
            var error = new Error('Invalid URL :(');
            linkDetailsFetcher.ensureValidUrl.withArgs(url).returns(Promise.reject(error));

            var linkDetails: LinkDetails = {
                url: url,
                expiresSeconds: 10
            };

            return linkService.create(linkDetails).then(url => {
                assert.fail('Unexpected success');
            }, err => {
                assert.strictEqual(error, err);
            });
        });


        it('should set the created At value to now', function() {
            var linkDetails: LinkDetails = {
                url: 'url',
                slug: 'slug'
            };

            fetcherReturnsDefaults();

            linkRepository.save.returns(Promise.resolve(link));

            return linkService.create(linkDetails)
                .then(() => {
                    var linkUsed: Link = linkRepository.save.firstCall.args[0];
                    assert.equal(linkUsed.createdAt.getTime(), now.valueOf());
                });
        });
        it('should return the Link created by the repository', function() {
            var linkDetails: LinkDetails = {
                url: 'some.url',
                slug: 'slug'
            };

            fetcherReturnsDefaults();

            linkRepository.save.returns(Promise.resolve(link));

            return linkService.create(linkDetails)
                .then(linkCreated => {
                    assert.strictEqual(linkCreated, link);
                });
        });
    });
});