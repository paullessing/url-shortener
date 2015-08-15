///<reference path='../typings/tsd.d.ts' />

//TODO write unit tests for linkService#create

import Promise = require('bluebird');

import linkModel = require("../lib/link");
import Link = linkModel.Link;
import LinkDetails = linkModel.LinkDetails;

import chai = require('chai');
import sinon = require('sinon');

var mockery = require('mockery');

sinon.assert.expose(chai.assert, { prefix: "" });

import linkRepository = require('../lib/linkRepository');

var assert = chai.assert;

describe("LinkService", function() {
    var linkService;

    var linkRepository = {
        save: sinon.stub(),
        isSlugUnused: sinon.stub(),
        fetchBySlug: sinon.stub()
    };
    var link = {
        _id: null,
        url: 'http://foo.bar',
        slug: 'slug',
        expires: new Date(),
        createdAt: new Date(),
        accessCount: 0,
        save: sinon.stub()
    }

    before(function() {
        mockery.enable();
        mockery.registerMock('./linkRepository', linkRepository);
        mockery.registerAllowable('./link');
        mockery.registerAllowable('bluebird');
        mockery.registerAllowable('moment');

        linkService = require('../lib/linkService');
    });
    beforeEach(() => {
        linkRepository.save.reset();
        linkRepository.fetchBySlug.reset();
        linkRepository.isSlugUnused.reset();
        link.save.reset();
        link.accessCount = 0;
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
});