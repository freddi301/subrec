// @flow

import { expect } from 'chai';
import { parse, list, match, matchIn, sub, evaluate, END, VAR, EVAL } from '../src';

describe('helper functions', () => {
  describe('list', () => {
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
    expect(match(parse(`a`), parse(`a`))).to.deep.equal([]);
    expect(match(parse(`(a b)`), parse(`(a b)`))).to.deep.equal([]);
    expect(match(parse(`(${VAR} a)`), parse(`hello`)))
      .to.deep.equal([ [ [ 'a', VAR ], 'hello' ] ]);
    expect(match(parse(`((${VAR} a) (${VAR} b))`), parse(`(hello ciao)`)))
       .to.deep.equal([ [ [ 'a', VAR ], 'hello' ], [ [ 'b', VAR ], 'ciao' ] ]);
  });
});

// describe('matchIn', () => {
//   it('works', () => {
//     expect(matchIn(parse(`(
//       a x,
//       b y, ${END},
//     )`), parse('a'))).property('right').to.deep.equal('x');
//     expect(matchIn(parse(`(
//       a x,
//       b y, ${END}
//     )`), parse('b'))).property('right').to.deep.equal('y');
//     expect(matchIn(parse(`(
//       a x,
//       b y, ${END}
//     )`), parse('c'))).to.deep.equal(null);
//     expect(matchIn(parse(`(
//       (${VAR} a) x,
//       b y, ${END}
//     )`), parse('hello'))).to.deep.equal({
//       right: 'x',
//       scope: list.fromArray([ [ [ 'a', VAR ], 'hello' ] ])
//     });
//     expect(matchIn(parse(`(
//       a x,
//       b (${VAR} p) y, ${END}
//     )`), parse('(b hello)'))).to.deep.equal({
//       right: 'y',
//       scope: list.fromArray([ [ [ 'p', VAR ], 'hello' ] ])
//     });
//     expect(matchIn(parse(`(
//       a x,
//       b (${VAR} p) y, ${END}
//     )`), parse('b'))).to.deep.equal(null);
//     expect(matchIn(parse(`(
//       a x,
//       b (${VAR} p) y, ${END}
//     )`), parse('c'))).to.deep.equal(null);
//     expect(matchIn(parse(`(
//       a x,
//       b (${VAR} p) (${VAR} q) w,
//       c u, ${END}
//     )`), parse('(b hello ciao)'))).to.deep.equal({
//       right: 'w',
//       scope: list.fromArray([ [ [ 'p', VAR ], 'hello' ], [ [ 'q', VAR ], 'ciao' ] ])
//     });
//   });
// });

describe('bool not', () => {
  it('works', () => {
    const rules = [
      [ ['not', 'true'], 'false' ],
      [ ['not', 'false'], 'true' ],
    ];
    expect(sub(rules, 'true')).to.equal('true');
    expect(sub(rules, 'false')).to.equal('false');
    expect(sub(rules, ['not', 'true'])).to.equal('false');
    expect(sub(rules, ['not', 'false'])).to.equal('true');
    expect(sub(rules, ['not', ['not', 'false']])).to.equal('false');
    expect(sub(rules, ['not', ['not', ['not', 'false']]])).to.equal('true');
  });
});

describe('vars', () => {
  it('works', () => {
    expect(match([VAR, 'x'], 'milk')).to.deep.equal(([[ ['x', VAR], 'milk' ]]));
    expect(match(['pack', [VAR, 'item']], ['pack', 'milk'])).to.deep.equal(([ [ ['item', VAR], 'milk' ] ]));
    expect(sub(([
      [ ['pack', [VAR, 'item']], ['Package', ['item', VAR]] ]
    ]), ['pack', 'milk'])).to.deep.equal(['Package', 'milk']);
    expect(match([[VAR, 'x'], [VAR, 'y']], ['milk', 'egg'])).to.deep.equal(([[ ['x', VAR], 'milk' ], [ ['y', VAR], 'egg' ]]));
    expect(sub(([
      [ [['doublepack', [VAR, 'itemA']], [VAR, 'itemB']], [['DoublePackage', ['itemA', VAR]], ['itemB', VAR]] ]
    ]), [['doublepack', 'milk'], 'egg'])).to.deep.equal([['DoublePackage', 'milk'], 'egg']);
  });
});

describe('recursion', () => {
  it('works', () => {
    expect(evaluate(parse(`((( inc (number 2) (number 3) ), ${END}) ${EVAL} (inc (number 2)))`))).to.deep.equal(parse('(number 3)'));
    expect(evaluate(
      parse(`((
        ((inc (number 1)) (number 2)),
        ((inc (number 2)) (number 3)),
        ((inc (number 3)) (number 4)),
        ((inc (number 4)) (number 5)),
        ${END}
      ) ${EVAL} (inc (inc (inc (inc (number 1))))))`),
    )).to.deep.equal(parse('(number 5)'));
    expect(evaluate(
      parse(`((
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
      ) ${EVAL} (rec (number 1) (foo bar, inc (number 2))))`)
    )).to.deep.equal(parse('(enc, enc, enc, enc, enc, foo bar (number 3))'));
  });
});

describe('curry', () => {
  it('works', () => {
    expect(evaluate(parse(`((
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
      dog (rec (number 1)),
      feed ($ dog) (
        (dog $) ham
      ), ${END}) ${EVAL} (feed dog))`)
    )).to.deep.equal(parse('(enc, enc, enc, enc, enc, ham)'));
  });
});

describe('eval', () => {
  it('works', () => {
    expect(evaluate(parse(`((
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
      dog (rec (number 1)),
      feed ($ dog) (
        (dog $) ham
      ),
      ${END}
    ) ${EVAL} (feed dog))`))).to.deep.equal(parse('(enc, enc, enc, enc, enc, ham)'));
  });
});

describe('same variable binding', () => {
  it('works', () => {
    expect(evaluate(parse(`((same ($ x) ($ x) y, end) ${EVAL} (same a a))`))).to.deep.equal('y');
    expect(evaluate(parse(`((same ($ x) ($ x) y, end) ${EVAL} (same a b))`))).to.deep.equal(parse('(same a b)'));
  });
});
