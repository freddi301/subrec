// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('single assignment', () => {
  it('works', () => {
    expect(evaluate(parse(`
      ${EVAL}, (
        (( ($ var) = ($ value) ) ($ body) ) (
          ((var $) => (body $)) (value $)
        ),
        lambdasub ($ var) ($ param) (($ left) ($ right)) (
          (lambdasub (var $) (param $) (left $))
          (lambdasub (var $) (param $) (right $))
        ),
        lambdasub ($ var) ($ param) ($ var) (
          (param $)
        ),
        lambdasub ($ var) ($ param) ($ body) (
          (body $)
        ),
        ($ var) => ($ body) ($ param) (
          lambdasub (var $) (param $) (body $)
        ),
        f (x =>, y => (
          z = (x + y),
          o = (z + x),
          p = 999,
          p = (o + y),
          p + o
        )),
        1 + 2 3, 3 + 1 4, 4 + 2 6, 6 + 4 10,
        end
      ) (f 1 2)
    `))).to.deep.equal('10');
  });
});