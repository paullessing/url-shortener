///<reference path='../typings/tsd.d.ts' />

import Promise = require('bluebird');
import mongoose = require('mongoose');
import chai = require('chai');
import sinon = require('sinon');

sinon.assert.expose(chai.assert, { prefix: "" });

var assert = chai.assert;

import linkModel = require('../lib/link');
import Link = linkModel.Link;
import repository = linkModel.repository;

describe("Link", function() {
    describe("#save()", function() {
        before(function() {
            console.log("Link: attempting connect");
            return Promise.resolve(mongoose.connect('mongodb://localhost:27017/putit_at_test'));
        });
        afterEach(function() {
            return Promise.resolve(repository.remove({}));
        });
        after(function() {
            return Promise.resolve(mongoose.connection.close()).then(function() {
                console.log("Closed connection in Link");
            });
        });

        it('should enforce requirements', function() {
            return repository.create({
            }).then(assert.fail, function(error) {
                assert.equal(error.errors.url.kind, 'required', 'URL should be required');
                assert.equal(error.errors.slug.kind, 'required', "Slug should be required");
                assert.equal(error.errors.adminId.kind, 'required', "adminId should be required");
                assert.equal(error.errors.expires.kind, 'required', "expiry should be required");
            });
        });
        it('should set defaults', function() {
            return repository.create({
                url: 'foo',
                slug: 'bar',
                adminId: 'a1',
                expires: new Date()
            }).then(function(link) {
                assert.equal(link.accessCount, 0, 'Access count should initialise to 0');
                assert.closeTo(link.createdAt.getTime(), new Date().getTime(), 100, 'CreatedAt should initialise to time close to now');
            });
        })
    });
});

mongoose.disconnect();