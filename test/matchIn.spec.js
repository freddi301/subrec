// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('matchIn', () => {
  it('works', () => {
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b y, ${END},
    )`)), parse('a'))).property('right').to.deep.equal('x');
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b y, ${END}
    )`)), parse('b'))).property('right').to.deep.equal('y');
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b y, ${END}
    )`)), parse('c'))).to.deep.equal(null);
    expect(matchIn(list.toJuxtArray(parse(`(
      (${VAR} a) x,
      b y, ${END}
    )`)), parse('hello'))).to.deep.equal({
      right: 'x',
      left: parse(`(${VAR} a)`),
      rule: parse(`(${VAR} a) x`),
      scope: [ [ [ 'a', VAR ], 'hello' ] ],
    });
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b (${VAR} p) y, ${END}
    )`)), parse('(b hello)'))).to.deep.equal({
      left: parse(`b (${VAR} p)`), right: 'y', rule: parse(`b (${VAR} p) y`),
      scope: [ [ [ 'p', VAR ], 'hello' ] ],
    });
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b (${VAR} p) y, ${END}
    )`)), parse('b'))).to.deep.equal(null);
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b (${VAR} p) y, ${END}
    )`)), parse('c'))).to.deep.equal(null);
    expect(matchIn(list.toJuxtArray(parse(`(
      a x,
      b (${VAR} p) (${VAR} q) w,
      c u, ${END}
    )`)), parse('(b hello ciao)'))).to.deep.equal({
      left: s`b (${VAR} p) (${VAR} q)`, right: 'w', rule: s`b (${VAR} p) (${VAR} q) w`,
      scope: [ [ [ 'p', VAR ], 'hello' ], [ [ 'q', VAR ], 'ciao' ] ]
    });
  });
});