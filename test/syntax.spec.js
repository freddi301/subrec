// @flow

import { expect } from 'chai';
import { parse, evaluate, VAR, EVAL } from '../src';

describe('parse', () => {
  it('works', () => {
    expect(parse('(a b)')).to.deep.equal(['a', 'b']);
    expect(evaluate(parse(`((
      ((not true) false)
      ((not false) true)
    ) ${EVAL} (not (not (not false)))
    )`))).to.equal('true');
  });
});
