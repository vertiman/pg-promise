'use strict';

var header = require('./db/header');

var supportsPromise = typeof(Promise) !== 'undefined';

function dummy() {
}

describe("Library entry function", function () {

    afterEach(function () {
        header({
            promiseLib: header.defPromise
        });
    });

    describe("without any promise override", function () {
        it("must return a valid library object", function () {
            if (supportsPromise) {
                var lib = header();
                expect(typeof(lib.pgp)).toBe('function');
            } else {
                expect(function () {
                    header();
                }).toThrow("Promise library must be specified.");
            }
        })
    });

    if (supportsPromise) {
        describe("without any options", function () {
            var result;
            beforeEach(function (done) {
                var db = header().db;
                db.query("select * from users")
                    .then(function (data) {
                        result = data;
                        done();
                    });
            });
            it("must be able to execute queries", function () {
                expect(result instanceof Array).toBe(true);
            })
        });
    }

    describe("with a valid promise library-object override", function () {
        it("must return a valid library object", function () {
            var lib = header(
                {
                    promiseLib: {
                        resolve: dummy,
                        reject: dummy
                    }
                });
            expect(typeof(lib.pgp)).toBe('function');
        })
    });

    describe("with a valid promise library-function override", function () {
        it("must return a valid library object", function () {
            function fakePromiseLib() {
            }

            fakePromiseLib.resolve = dummy;
            fakePromiseLib.reject = dummy;
            var lib = header({
                promiseLib: fakePromiseLib
            });
            expect(typeof(lib.pgp)).toBe('function');
        })
    });

    describe("with invalid promise override", function () {
        var error = "Invalid promise library specified.";
        it("must throw the correct error", function () {
            expect(function () {
                header({
                    promiseLib: "test"
                });
            })
                .toThrow(error);
            expect(function () {
                header({
                    promiseLib: dummy
                });
            })
                .toThrow(error);
        });
    });

    describe("with invalid options parameter", function () {
        var error = "Invalid parameter 'options' specified.";
        it("must throw the correct error", function () {
            expect(function () {
                header(123);
            })
                .toThrow(error);
        });
    });

});

if (jasmine.Runner) {
    var _finishCallback = jasmine.Runner.prototype.finishCallback;
    jasmine.Runner.prototype.finishCallback = function () {
        // Run the old finishCallback:
        _finishCallback.bind(this)();

        pgp.end(); // closing pg database application pool;
    };
}
