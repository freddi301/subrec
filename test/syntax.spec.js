// @flow

import { expect } from 'chai';
import { parse, VAR, EVAL } from '../src';

describe('parse syntax', () => {
  it('works', () => {
    expect(parse('a')).to.deep.equal('a');
    expect(parse('(aa b)')).to.deep.equal(['aa', 'b']);
    expect(parse('(a b (c))')).to.deep.equal([['a', 'b'], 'c']);
    expect(parse('((a b) c)')).to.deep.equal([['a', 'b'], 'c']);
    expect(parse('(a, b)')).to.deep.equal(['a', 'b']);
    expect(parse('(a, b, c,)')).to.deep.equal(['a', ['b', 'c']]);
    expect(parse('(a, (b, c))')).to.deep.equal(['a', ['b', 'c']]);
    expect(parse('(a, (b c))')).to.deep.equal(['a', ['b', 'c']]);
    expect(parse('(a, b c)')).to.deep.equal(['a', ['b', 'c']]);
    expect(parse('(a (b c))')).to.deep.equal(['a', ['b', 'c']]);
    expect(parse('(a b, c)')).to.deep.equal([['a', 'b'], 'c']);
    expect(parse('(a b, c d)')).to.deep.equal([['a', 'b'], ['c', 'd']]);
    expect(parse('((a b) (c d))')).to.deep.equal([['a', 'b'], ['c', 'd']]);
    expect(parse('(a b, c d, e f)')).to.deep.equal([['a', 'b'], [['c', 'd'], ['e', 'f']]]);
    expect(parse('(a b, c d, e f g)')).to.deep.equal([['a', 'b'], [['c', 'd'], [['e', 'f'], 'g']]]);
    expect(parse('a b, c d, e f g')).to.deep.equal([['a', 'b'], [['c', 'd'], [['e', 'f'], 'g']]]);
    expect(parse('a, b, c')).to.deep.equal(['a', ['b', 'c']]);
    expect(parse('a b (c)')).to.deep.equal([['a', 'b'], 'c']);
  });
});
