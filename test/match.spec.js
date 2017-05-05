// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('match', () => {
  it('works', () => {
    expect(match(parse(`a`), parse(`b`))).to.deep.equal(null);
    expect(match(parse(`(a b)`), parse(`(b a)`))).to.deep.equal(null);
    expect(match(parse(`a`), parse(`a`))).to.deep.equal([]);
    expect(match(parse(`(a b)`), parse(`(a b)`))).to.deep.equal([]);
    expect(match(parse(`(${VAR} a)`), parse(`hello`)))
      .to.deep.equal([ [ [ 'a', VAR ], 'hello' ] ]);
    expect(match(parse(`((${VAR} a) (${VAR} b))`), parse(`(hello ciao)`)))
       .to.deep.equal([ [ [ 'a', VAR ], 'hello' ], [ [ 'b', VAR ], 'ciao' ] ]);
  });
});