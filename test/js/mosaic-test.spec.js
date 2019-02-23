"use strict";
var chai = require("chai");
chai.use(require("chai-fs"));
chai.use(require("chai-as-promised"));

var expect = chai.expect;
var should = chai.should();

var index = require("../../dist/index.js");
describe("test function mosaic", () => {
  it("should work", () => {
    index
      .mosaic("test/data/input-image-1.jpg", "test/data/thumbnails_30")
      .should.eventually.be.a.file();
  });
});
