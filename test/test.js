'use strict';
var expect = require('chai').expect;
var index = require('../dist/index.js');
describe('test function test', () => {
    it('should work', () => {
        var result = index.test('hey');
        expect(result).to.equal('You passed in hey');
    });
});