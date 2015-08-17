///<reference path='../typings/tsd.d.ts' />

import Promise = require('bluebird');
import moment = require('moment');
import Moment = moment.Moment;

import linkModel = require("../lib/link");
import Link = linkModel.Link;
import LinkDetails = linkModel.LinkDetails;

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
    var expectedExpiry: Moment;
    var stubMoment = function(expiry?: Date): Moment {
        if (!expiry) {
            return nowMoment;
        } else {
            return expectedExpiry;
        }
    };

    before(function() {
        mockery.enable();
        mockery.registerMock('./linkRepository', linkRepository);
        mockery.registerMock('moment', stubMoment);
        mockery.registerAllowable('./link');
        mockery.registerAllowable('bluebird');
        //mockery.registerAllowable('moment');
        mockery.registerAllowable('../lib/linkDetailsFetcher'); // Under test

        linkDetailsFetcher = require('../lib/linkDetailsFetcher');
    });
    beforeEach(() => {
        linkRepository.isSlugUnused.reset();
        linkRepository.generateNewSlug.reset();
        nowMoment = moment(now);
        expectedExpiry = null;
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

        it('should set expiry to a future date when it is in the past', function() {
            var expiryDate = new Date(now - 1);
            expectedExpiry = moment(expiryDate);

            return linkDetailsFetcher.getExpiry(expiryDate).then(function(expiry: Date) {
                assert.isNotNull(expiry, "expiry not null");
                assert.ok(expiry.getTime() > now, 'Date should be in the future');
            });
        });
        it('should set expiry to a future date when it is exactly now', function() {
            var expiryDate = new Date(now);
            expectedExpiry = moment(expiryDate);

            return linkDetailsFetcher.getExpiry(expiryDate).then(function(expiry: Date) {
                assert.ok(expiry.getTime() > now, 'Date should be in the future');
            });
        });
        it('should use existing expiry when that is in the future', function() {
            var expiryDate = new Date(now + 1);
            expectedExpiry = moment(expiryDate);

            return linkDetailsFetcher.getExpiry(expiryDate).then(function(expiry: Date) {
                assert.strictEqual(expiry.getTime(), expiryDate.getTime());
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
