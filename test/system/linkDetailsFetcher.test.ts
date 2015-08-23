///<reference path='../../typings/tsd.d.ts' />

import Promise = require('bluebird');
import moment = require('moment');
import Moment = moment.Moment;

import linkModel = require("../../lib/system/link");
import Link = linkModel.Link;
import LinkDetails = require('../../lib/shared/linkDetails');

import chai = require('chai');
import sinon = require('sinon');

var mockery = require('mockery');

sinon.assert.expose(chai.assert, { prefix: "" });

var assert = chai.assert;

describe('LinkDetailsFetcher', function() {
    var linkDetailsFetcher;

    var linkRepository = {
        isSlugUnused: sinon.stub(),
        generateNewSlug: sinon.stub()
    };

    var now = 100;
    var nowMoment: Moment;
    var stubMoment = function(expiry?: Date): Moment {
        return nowMoment;
    };

    before(function() {
        mockery.enable();
        mockery.registerMock('./linkRepository', linkRepository);
        mockery.registerMock('moment', stubMoment);
        mockery.registerAllowable('../shared/link');
        mockery.registerAllowable('bluebird');
        mockery.registerAllowable('crypto');
        mockery.registerAllowable('../../lib/system/linkDetailsFetcher'); // Under test

        linkDetailsFetcher = require('../../lib/system/linkDetailsFetcher');
    });
    beforeEach(() => {
        linkRepository.isSlugUnused.reset();
        linkRepository.generateNewSlug.reset();
        nowMoment = moment(now);
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('#generateAdminId()', function() {
        it('should generate a nonempty String ID', function() {
            return linkDetailsFetcher.generateAdminId({url: 'url', slug: 'slug'}).then(adminId => {
                assert.typeOf(adminId, 'string');
                assert.isNotNull(adminId);
                assert.ok(adminId.length > 0);
            });
        });
    });
    describe('#getExpiry()', function() {
        it('should set expiry to a future date when it is not provided', function() {
            return linkDetailsFetcher.getExpiry().then(function(expiry: Date) {
                assert.isNotNull(expiry);
                assert.ok(expiry.getTime() > now, 'Date should be in the future');
            });
        });

        it('should set expiry to a future date when expiry seconds are negative', function() {
            var expirySeconds = -1;

            return linkDetailsFetcher.getExpiry(expirySeconds).then(function(expiry: Date) {
                assert.ok(expiry.getTime() > now, 'Date should be in the future');
            });
        });
        it('should set expiry to a future date when it is exactly now', function() {
            var expirySeconds = 0;

            return linkDetailsFetcher.getExpiry(expirySeconds).then(function(expiry: Date) {
                assert.ok(expiry.getTime() > now, 'Date should be in the future');
            });
        });
        it('should use existing expiry when that is in the future', function() {
            var expirySeconds = 1;

            return linkDetailsFetcher.getExpiry(expirySeconds).then(function(expiry: Date) {
                assert.strictEqual(expiry.getTime(), now + expirySeconds * 1000);
            });
        });
    });

    describe('#validateOrGenerateSlug()', function() {
        describe('when a slug is passed', function() {
            it('should return the slug if the slug is not already present', function() {
                var slug = 'mySlug';
                linkRepository.isSlugUnused.withArgs(slug).returns(Promise.resolve(true));

                return linkDetailsFetcher.validateOrGenerateSlug(slug).then(returnedSlug => {
                    assert.strictEqual(returnedSlug, slug);
                });
            });
            it('should throw an exception if the slug is not unused', function() {
                var slug = 'myUsedSlug';
                linkRepository.isSlugUnused.withArgs(slug).returns(Promise.resolve(false));

                return linkDetailsFetcher.validateOrGenerateSlug(slug).then(() => {
                    assert.fail('Should not have succeeded in returning a slug');
                }).catch(err => {
                    assert.ok(err.message.toLowerCase().indexOf('duplicate') >= 0);
                });
            });
        });
        describe('when no slug is passed', function() {
            it('should create a new slug from the repository and return it', function() {
                var slug = 'newValidSlug';
                linkRepository.generateNewSlug.returns(Promise.resolve(slug));

                return linkDetailsFetcher.validateOrGenerateSlug().then(returnedSlug => {
                    assert.strictEqual(returnedSlug, slug);
                });
            });
        });
    });
});
