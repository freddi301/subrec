// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('helper functions', () => {
  describe('list', () => {
    describe('#fromArray', () => {
      it('works', () => {
        expect(list.fromArray([])).to.deep.equal(END);
        expect(list.fromArray(['a'])).to.deep.equal(['a', END]);
        expect(list.fromArray(['a', 'b'])).to.deep.equal(['a', ['b', END]]);
      });
    });
  });
});