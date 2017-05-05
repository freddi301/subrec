// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-7-lambdas', () => {
  it('works', () => {
    expect(evaluate(parse(`
      ${EVAL}, (
        ($ var) => (($ left) ($ right)) ($ param) (
          ((var $) => (left $) (param $))
          ((var $) => (right $) (param $))
        ),
        ($ var) => ($ var) ($ param) (param $),
        ($ var) => ($ body) ($ param) (body $),
        1 + 1 2,
        2 + 1 3,
        1 + 2 3,
        3 + 1 4,
        f (x =>, x + x + x),
        g (x =>, y =>, x + y + x),
        end
      ) ((f 1) (g 1 2))
    `))).to.deep.equal(parse('(3 4)'));
  });
});