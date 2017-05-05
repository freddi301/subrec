// @flow

import { expect } from 'chai';
import { parse, s, r, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-6-dicts', () => {
  it('works', () => {
    expect(evaluate(parse(`${EVAL}, (
      Dict.access } ($ field) empty,
      Dict.access (($ field) ($ value) ($ tail)) ($ field) (value $),
      Dict.access (($ pair) ($ tail)) ($ field) (Dict.access (tail $) (field $)),
      Dict ($ fields) . ($ field) (Dict.access (fields $) (field $)),
      { ($ fields) (Dict, fields $),
      a ({, x 4, y 6 ,}),
      end
    ) (a . x, a . y, a . z, ({,a 7,}) . a, ({,a 7,}) . b)
    `))).to.deep.equal(parse('4, 6, empty, 7, empty'));
  });
  it('works with checking', () => {
    const rules = r`
      {parse } (Dict Nil),
      {parse ($ head, $ tail) (Dict, Cons, head $, {parse, tail $),
      { ($ fields) ({parse, fields $),
      Dict (Cons (($ field) ($ value) ($ tail))) . ($ field) (value $),
      Dict (Cons (($ pair) ($ tail))) . ($ field) ((tail $) . (field $)),
      d ({, x 4, y 6 ,}),
      d1 (d . x),
      d2 (d . y),
      d3 (d . z),
      d4 (({,a 7,}) . a),
      d5 (({,a 7,}) . b),
      end
    `;
    expect(sub(rules, 'd1')).to.deep.equal('4');
    expect(sub(rules, 'd2')).to.deep.equal('6');
    expect(sub(rules, 'd3')).to.deep.equal(s`Dict Nil . z`);
    expect(sub(rules, 'd4')).to.deep.equal('7');
    expect(sub(rules, 'd5')).to.deep.equal(s`Dict Nil . b`);
    const unreds = r`
      4 ${CHECKS}, 6 ${CHECKS}, 7 ${CHECKS},
      Dict Nil ${CHECKS},
      (Dict, Cons, ($ head) (Dict, $ tail)) (Dict, tail $),
      end
    `;
    expect(check(rules, unreds)).to.deep.equal([
      [ { rule: s`d3 (d . z)`, subterm: s`Dict Nil . z` } ],
      [ { rule: s`d5 (({,a 7,}) . b)`, subterm: s`Dict Nil . b` } ],
    ]);
  });
});