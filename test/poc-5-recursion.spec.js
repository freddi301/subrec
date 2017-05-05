// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-5-recursion', () => {
  it('works', () => {
    expect(evaluate(parse(`(${EVAL}, (( inc (number 2) (number 3) ), ${END}) (inc (number 2)))`))).to.deep.equal(parse('(number 3)'));
    expect(evaluate(
      parse(`(${EVAL}, (
        ((inc (number 1)) (number 2)),
        ((inc (number 2)) (number 3)),
        ((inc (number 3)) (number 4)),
        ((inc (number 4)) (number 5)),
        ${END}
      ) (inc (inc (inc (inc (number 1))))))`),
    )).to.deep.equal(parse('(number 5)'));
    expect(evaluate(
      parse(`(${EVAL}, (
        inc (number 1) (number 2),
        inc (number 2) (number 3),
        inc (number 3) (number 4),
        inc (number 4) (number 5),
        (rec (number 5) ($ data)) (
          enc (data $)
        ),
        (rec (number, $ step), $ data) (
          rec (inc, number, step $) (enc, data $)
        ),
        ${END}
      ) (rec (number 1) (foo bar, inc (number 2))))`)
    )).to.deep.equal(parse('(enc, enc, enc, enc, enc, foo bar (number 3))'));
  });
});