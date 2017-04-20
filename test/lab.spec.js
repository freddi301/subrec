// @flow

import { expect } from 'chai';
import { parse, list, match, matchIn, sub, END, VAR, EVAL } from '../src';

describe('helper functions', () => {
  describe('list', () => {
    describe('#is', () => {
      it('works', () => {
        expect(list.is(parse(`${END}`))).to.equal(true);
        expect(list.is(parse(`hello`))).to.equal(false);
        expect(list.is(parse(`(a ${END})`))).to.equal(true);
        expect(list.is(parse(`(a hello)`))).to.equal(false);
        expect(list.is(parse(`(a b ${END})`))).to.equal(true);
        expect(list.is(parse(`(a, b, d)`))).to.equal(false);
        expect(list.is(parse(`((a b), (c d), ${END})`))).to.equal(true);
      });
    });
    describe('#fromArray', () => {
      it('works', () => {
        expect(list.fromArray([])).to.deep.equal(END);
        expect(list.fromArray(['a'])).to.deep.equal(['a', END]);
        expect(list.fromArray(['a', 'b'])).to.deep.equal(['a', ['b', END]]);
      });
    });
  });
});

describe('match', () => {
  it('works', () => {
    expect(match(parse(`a`), parse(`b`))).to.deep.equal(null);
    expect(match(parse(`(a b)`), parse(`(b a)`))).to.deep.equal(null);
    expect(match(parse(`a`), parse(`a`))).to.deep.equal(list.fromArray([]));
    expect(match(parse(`(a b)`), parse(`(a b)`))).to.deep.equal(list.fromArray([]));
    expect(match(parse(`(${VAR} a)`), parse(`hello`)))
      .to.deep.equal(list.fromArray([ [ [ 'a', VAR ], 'hello' ] ]));
    expect(match(parse(`((${VAR} a) (${VAR} b))`), parse(`(hello ciao)`)))
       .to.deep.equal(list.fromArray([ [ [ 'a', VAR ], 'hello' ], [ [ 'b', VAR ], 'ciao' ] ]));
  });
});

describe('matchIn', () => {
  it('works', () => {
    expect(matchIn(parse(`(
      a x,
      b y, ${END},
    )`), parse('a')).right).to.deep.equal('x');
    expect(matchIn(parse(`(
      a x,
      b y, ${END}
    )`), parse('b')).right).to.deep.equal('y');
    expect(matchIn(parse(`(
      a x,
      b y, ${END}
    )`), parse('c'))).to.deep.equal(null);
    expect(matchIn(parse(`(
      (${VAR} a) x,
      b y, ${END}
    )`), parse('hello'))).to.deep.equal({
      right: 'x',
      scope: list.fromArray([ [ [ 'a', VAR ], 'hello' ] ])
    });
    expect(matchIn(parse(`(
      a x,
      b (${VAR} p) y, ${END}
    )`), parse('(b hello)'))).to.deep.equal({
      right: 'y',
      scope: list.fromArray([ [ [ 'p', VAR ], 'hello' ] ])
    });
    expect(matchIn(parse(`(
      a x,
      b (${VAR} p) y, ${END}
    )`), parse('b'))).to.deep.equal(null);
    expect(matchIn(parse(`(
      a x,
      b (${VAR} p) y, ${END}
    )`), parse('c'))).to.deep.equal(null);
    expect(matchIn(parse(`(
      a x,
      b (${VAR} p) (${VAR} q) w,
      c u, ${END}
    )`), parse('(b hello ciao)'))).to.deep.equal({
      right: 'w',
      scope: list.fromArray([ [ [ 'p', VAR ], 'hello' ], [ [ 'q', VAR ], 'ciao' ] ])
    });

  });
});

describe('bool not', () => {
  it('works', () => {
    const rules = list.fromArray([
      [ ['not', 'true'], 'false' ],
      [ ['not', 'false'], 'true' ],
    ]);
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
    expect(match([VAR, 'x'], 'milk')).to.deep.equal(list.fromArray([[ ['x', VAR], 'milk' ]]));
    expect(match(['pack', [VAR, 'item']], ['pack', 'milk'])).to.deep.equal(list.fromArray([ [ ['item', VAR], 'milk' ] ]));
    expect(sub([list.fromArray([
      [ ['pack', [VAR, 'item']], ['Package', ['item', VAR]] ]
    ]), EVAL, ['pack', 'milk']])).to.deep.equal(['Package', 'milk']);
    expect(match([[VAR, 'x'], [VAR, 'y']], ['milk', 'egg'])).to.deep.equal(list.fromArray([[ ['x', VAR], 'milk' ], [ ['y', VAR], 'egg' ]]));
    expect(sub([list.fromArray([
      [ [['doublepack', [VAR, 'itemA']], [VAR, 'itemB']], [['DoublePackage', ['itemA', VAR]], ['itemB', VAR]] ]
    ]), EVAL, [['doublepack', 'milk'], 'egg']])).to.deep.equal([['DoublePackage', 'milk'], 'egg']);
  });
});



describe('recursion', () => {
  it('works', () => {
    expect(sub([parse(`(( inc (number 2) (number 3) ), ${END})`), EVAL, parse('(inc (number 2))')])).to.deep.equal(parse('(number 3)'));
    expect(sub([
      parse(`(
        ((inc (number 1)) (number 2)),
        ((inc (number 2)) (number 3)),
        ((inc (number 3)) (number 4)),
        ((inc (number 4)) (number 5)),
        ${END}
      )`), EVAL,
      parse('(inc (inc (inc (inc (number 1)))))')
    ])).to.deep.equal(parse('(number 5)'));
    expect(sub([
      parse(`(
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
      )`), EVAL,
      parse('(rec (number 1) (foo bar, inc (number 2)))')
    ])).to.deep.equal(parse('(enc, enc, enc, enc, enc, foo bar (number 3))'));
  });
});
