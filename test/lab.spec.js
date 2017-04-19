// @flow

import { expect } from 'chai';
import { VAR, EVAL, sub, match } from '../src';

describe('bool not', () => {
  it('works', () => {
    const rules = [
      [ ['not', 'true'], 'false' ],
      [ ['not', 'false'], 'true' ],
    ];
    expect(sub([rules, EVAL, 'true'])).to.equal('true');
    expect(sub([rules, EVAL, 'false'])).to.equal('false');
    expect(sub([rules, EVAL, ['not', 'true']])).to.equal('false');
    expect(sub([rules, EVAL, ['not', 'false']])).to.equal('true');
    expect(sub([rules, EVAL, ['not', ['not', 'false']]])).to.equal('false');
    expect(sub([rules, EVAL, ['not', ['not', ['not', 'false']]]])).to.equal('true');
  });
});

describe('vars', () => {
  it('works', () => {
    expect(match([VAR, 'x'], 'milk')).to.deep.equal([[ ['x', VAR], 'milk' ]]);
    expect(match(['pack', [VAR, 'item']], ['pack', 'milk'])).to.deep.equal([ [ ['item', VAR], 'milk' ] ]);
    expect(sub([[
      [ ['pack', [VAR, 'item']], ['Package', ['item', VAR]] ]
    ], EVAL, ['pack', 'milk']])).to.deep.equal(['Package', 'milk']);
    expect(match([[VAR, 'x'], [VAR, 'y']], ['milk', 'egg'])).to.deep.equal([[ ['x', VAR], 'milk' ], [ ['y', VAR], 'egg' ]]);
    expect(sub([[
      [ ['doublepack', [VAR, 'itemA'], [VAR, 'itemB']], ['DoublePackage', ['itemA', VAR], ['itemB', VAR]] ]
    ], EVAL, ['doublepack', 'milk', 'egg']])).to.deep.equal(['DoublePackage', 'milk', 'egg']);
  });
});

describe('recursion', () => {
  it('works', () => {
    const rules = [
      [ ['inc', ['number', '1']], ['number', '2'] ],
      [ ['inc', ['number', '2']], ['number', '3'] ],
      [ ['inc', ['number', '3']], ['number', '4'] ],
      [ ['inc', ['number', '4']], ['number', '5'] ],
      [ ['rec', ['number', '5'], [VAR, 'data']], ['enc', ['data', VAR]] ],
      [ ['rec', ['number', [VAR, 'step']], [VAR, 'data']], ['rec', ['inc', ['number', ['step', VAR]]], ['enc', ['data', VAR]]] ],
    ];
    expect(sub([rules, EVAL, ['rec', ['number', '5'], ['foo', 'bar']]])).to.deep.equal(['enc', ['foo', 'bar']]);
    const scope1 = match(rules[5][0], ['rec', ['number', '1'], ['foo', 'bar']]);
    expect(scope1).to.deep.equal([
      [ ['step', VAR], '1' ],
      [ ['data', VAR], ['foo', 'bar'] ],
    ]);
    expect(sub([rules, EVAL, ['inc', ['inc', ['number', '1']]]])).to.deep.equal(['number', '3']);
    expect(sub([rules, EVAL, ['rec', ['number', '1'], ['foo', 'bar']]])).to.deep.equal(['enc', ['enc', ['enc', ['enc', ['enc', ['foo', 'bar']]]]]]);
  });
});
