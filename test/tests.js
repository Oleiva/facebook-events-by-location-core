"use strict";

// Check if .env file exists, and load values. But do not fail if it doesn't!
require('dotenv').config({silent: true});

var EventSearch = require("../index");
var path = require("path");
var fs = require("fs");
var Promise = require("bluebird");
var chai = require("chai");
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");
var Ajv = require("ajv");
var ajv = new Ajv();

chai.use(chaiAsPromised);

chai.config.includeStack = false;

describe("# Testing the facebook-events-by-location-core functionality", function() {

    var accessToken = process.env.FEBL_ACCESS_TOKEN;

    // Reset access token env variable
    process.env.FEBL_ACCESS_TOKEN = "";

    describe("## Basic functionality testing", function () {

        it("should return a list of events for a popular coordinate (Brooklyn, NY)", function (done) {

            // Set timeout
            this.timeout(10000);

            var es = new EventSearch();

            es.search({
                "lat": 40.710803,
                "lng": -73.964040,
                "distance": 100,
                "accessToken": accessToken
            }).should.be.fulfilled.and.notify(done);

        });

        it("should work applying a sort parameter", function (done) {

            // Set timeout
            this.timeout(10000);

            var es = new EventSearch();

            es.search({
                "lat": 40.710803,
                "lng": -73.964040,
                "distance": 100,
                "accessToken": accessToken,
                "sort": "distance"
            }).should.be.fulfilled.and.notify(done);

        });

        it("should return an error if no Access Token is present", function (done) {

            var es = new EventSearch();

            es.search({
                "lat": 40.710803,
                "lng": -73.964040,
                "distance": 100
            }).should.be.rejectedWith(1).and.notify(done);

        });

        it("should return an error if a partial coordinate is used", function (done) {

            var es = new EventSearch();

            es.search({
                "lat": 40.710803,
                "accessToken": accessToken
            }).should.be.rejectedWith(2).and.notify(done);

        });

        it("should return a valid JSON schema", function (done) {

            // Set timeout
            this.timeout(10000);

            var schema = JSON.parse(fs.readFileSync(path.join(__dirname, "../", "schema", "events-response.schema.json"), "utf8"));

            var es = new EventSearch();

            es.search({
                "lat": 40.710803,
                "lng": -73.964040,
                "distance": 100,
                "accessToken": accessToken
            }).then( function (events) {
                console.log("Found " + events.metadata.venues +" venues, thereof " + events.metadata.venuesWithEvents + " with events, and " + events.metadata.events + " events total!");
                var validate = ajv.compile(schema);
                var valid = validate(events);
                return new Promise(function (resolve, reject) {
                    if (!valid) {
                        reject(validate.errors);
                    } else {
                        resolve(valid);
                    }
                });
            }).should.be.fulfilled.and.notify(done);

        });

    });

});

