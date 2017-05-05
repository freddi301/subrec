// @flow

import { expect } from 'chai';
import { parse, s, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('bool not - recursive inner evaluation', () => {
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

describe('vars - var capturing and substitution', () => {
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

describe('curry', () => {
  it('works', () => {
    expect(evaluate(parse(`(${EVAL}, (
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
      ), ${END}) (feed dog))`)
    )).to.deep.equal(parse('(enc, enc, enc, enc, enc, ham)'));
    expect(evaluate(parse(`
      (${EVAL}, (
        a b d,
        end
      ) (a b c))
    `))).to.deep.equal(parse('(d c)'));
  });
});

describe('eval', () => {
  it('works', () => {
    expect(evaluate(parse(`(${EVAL}, (
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
    ) (feed dog))`))).to.deep.equal(parse('(enc, enc, enc, enc, enc, ham)'));
  });
});

describe('same variable binding', () => {
  it('works', () => {
    expect(evaluate(parse(`(${EVAL}, (same ($ x) ($ x) y, end) (same a a))`))).to.deep.equal('y');
    expect(evaluate(parse(`(${EVAL}, (same ($ x) ($ x) y, end) (same a b))`))).to.deep.equal(parse('(same a b)'));
  });
});

describe('inner eval', () => {
  it('works', () => {
    expect(evaluate(parse(`(${EVAL}, hello ((world mondo , end) world))`)))
      .to.deep.equal(parse(`(${EVAL}, hello ((world mondo , end) world))`));
    expect(evaluate(parse(`(${EVAL}, (
      hello ($ who) (
        ${EVAL}, (
          world mondo,
          teddy orsetto,
          end
        ) (who $)
      ),
      end
    ) (hello world))`)))
      .to.deep.equal(parse('mondo'));
    expect(evaluate(parse(`${EVAL}, (
      hello ($ who) (
        ${EVAL}, (
          world mondo,
          teddy orsetto,
          end
        ) (who $)
      ),
      end
    ) (hello teddy)`)))
      .to.deep.equal(parse('orsetto'));
  });
});

describe('guards', () => {
  it('works', () => {
    expect(evaluate(parse(`${EVAL}, (
      1 + 1 2, 2 + 2 4, 3 + 3 6, 4 + 4 8, 5 + 5 10,
      1 < 4 true, 2 < 4 true, 3 < 4 true, 4 < 4 false, 5 < 4 false,
      doubleMaxFour ($ num) (
        doubleMaxFourG ((num $) < 4)(num $)
      ),
      doubleMaxFourG true ($ num) (
        (num $) + (num $)
      ),
      doubleMaxFourG false ($ num) (
        empty
      ),
      end
    ) (doubleMaxFour 1, doubleMaxFour 2, doubleMaxFour 3, doubleMaxFour 4, doubleMaxFour 5)
    `))).to.deep.equal(parse('2, 4, 6, empty, empty'));
    // ideal syntax
    // doubleMaxFour ($ num) where ((num $) < 4) ( (num $) + (num $) )
    // doubleMaxFour ($ num) where ((num $) > -4) ( (num $) + (num $) )
  });
});

/*
  pattern checking
  eval should have form (EVAL, substitution-rules unreducible-term-constraints term)
  where substitution-rules are pattern-matching rules that substites
  term is the term to be interpreted
  unreducible-term-constraints should represent some sort of data constraints:
    the term should be a term that if no further reducible obeys to unreducible-term-constraints
    the substitution-rules should always yield a term:
      A: if not further reducible the must obey to unreducible-term-constraints
      B: if further reducible then further reductions must yield A or B
*/

describe('pattern checking', () => {
  describe('validate unreducible term', () => {
    it('works', () => {
      expect(evaluate(parse(`(${EVAL}, (
        boolean true ${CHECKS},
        boolean false ${CHECKS},
        end
      ) (boolean true))`))).to.deep.equal(CHECKS);
      expect(evaluate(parse(`(${EVAL}, (
        boolean true ${CHECKS},
        boolean false ${CHECKS},
        end
      ) (boolean false))`))).to.deep.equal(CHECKS);
      expect(evaluate(parse(`(${EVAL}, (
        boolean true ${CHECKS},
        boolean false ${CHECKS},
        end
      ) (boolean hello))`))).to.deep.equal(parse('(boolean hello)'));
      expect(evaluate(parse(`(${EVAL}, (
        enc ($ T) ${CHECKS},
        end
      ) (enc hello))`))).to.deep.equal(CHECKS);
    });
  });
  describe('pattern checked program', () => {
    it('works', () => {
      expect(check([
        ['True', ['Boolean', 'true']],
        ['False', ['Boolean', 'false']],
      ], [
        [['Boolean', 'true'], CHECKS],
        [['Boolean', 'false'], CHECKS],
      ])).to.deep.equal(null);
      expect(check([
        ['True', ['Boolean', 'true']],
        ['False', ['Boolean', 'fal']],
      ], [
        [['Boolean', 'true'], CHECKS],
        [['Boolean', 'false'], CHECKS],
      ])).to.deep.equal([ [ { rule: ['False', ['Boolean', 'fal']], subterm: ['Boolean', 'fal'] } ] ]);
      expect(check([
        ['True', ['Boolean', 'true']],
        ['False', ['Boolean', 'false']],
        [['id', [VAR, 'x']], ['Boolean', ['x', VAR]]],
        ['main', ['id', 'true']]
      ], [
        [['Boolean', 'true'], CHECKS],
        [['Boolean', 'false'], CHECKS],
      ])).to.deep.equal(null);
      expect(check([
        ['True', ['Boolean', 'true']],
        ['False', ['Boolean', 'false']],
        [['id', [VAR, 'x']], ['Boolean', ['x', VAR]]],
        ['main', ['id', 'integer']]
      ], [
        [['Boolean', 'true'], CHECKS],
        [['Boolean', 'false'], CHECKS],
      ])).to.deep.equal([ [
        { rule: ['main', ['id', 'integer']], subterm: ['Boolean', 'integer'] },
      ] ]);
      // expect(check([
      //   ['True', ['Boolean', 'true']],
      //   ['False', ['Boolean', 'false']],
      //   [['id', [VAR, 'x']], ['Boolean', ['x', VAR]]],
      //   ['main', ['id', ['true', 'false']]]
      // ], [
      //   [['Boolean', 'true'], CHECKS],
      //   [['Boolean', 'false'], CHECKS],
      // ])).to.deep.equal([ [
      //   { rule: ['main', ['id', ['true', 'false']]], subterm: ['id', ['true', 'false']] },
      //   { rule: [['id', [VAR, 'x']], ['Boolean', ['x', VAR]]], subterm: ['Boolean', ['true', 'false']]}
      // ] ]);
      const rules =  list.toJuxtArray(parse(`(
        :: ($ type) ($ type, $ x) (type $, x $),
        (number 1) + (number 1) (number 2),
        (number 2) + (number 2) (number 4),
        (number 3) + (number 3) (number 6),
        (number 4) + (number 4) (number 8),
        (number 5) + (number 5) (number 10),
        (number 1) < (number 4) (boolean true),
        (number 2) < (number 4) (boolean true),
        (number 3) < (number 4) (boolean true),
        (number 4) < (number 4) (boolean false),
        (number 5) < (number 4) (boolean false),
        doubleMaxFour ($ num) (:: number,
          doubleMaxFourG ((num $) < (number 4)) (num $)
        ),
        doubleMaxFourG (boolean true) ($ num) (:: number,
          (num $) + (num $)
        ),
        doubleMaxFourG (boolean false) ($ num) (
          empty
        ),
        main1 (doubleMaxFour, 1),
        main2 (doubleMaxFour, number 2),
        main3 (doubleMaxFour, number 3),
        main4 (doubleMaxFour, number 4),
        main5 (doubleMaxFour, number 5),
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
        lambdaAdd (x =>, y =>, x + y),
        mainl1 (lambdaAdd (number 2) (number 3)),
        mainl2 (lambdaAdd (number 2) (number 2)),
        end
      )`));
      //expect(sub(rules, 'main1')).to.deep.equal(['number', '2']);
      expect(sub(rules, 'main2')).to.deep.equal(['number', '4']);
      expect(sub(rules, 'mainl2')).to.deep.equal(['number', '4']);
      expect(sub(rules, 'main3')).to.deep.equal(['number', '6']);
      expect(sub(rules, 'main4')).to.deep.equal([['::', 'number'], 'empty']);
      expect(sub(rules, 'main5')).to.deep.equal([['::', 'number'], 'empty']);
      // expect(check(rules, [
      //     [['number', '2'], CHECKS],
      //     [['number', '4'], CHECKS],
      //     [['number', '6'], CHECKS],
      //     [['number', '8'], CHECKS],
      //     [['number', '10'], CHECKS],
      //     [['boolean', 'true'], CHECKS],
      //     [['boolean', 'false'], CHECKS],
      //     [parse(`($ var) => ($ body)`), CHECKS],
      //     ['empty', CHECKS],
      //   ]
      // )).to.deep.equal([ [
      //   {rule: parse('main1 (doubleMaxFour, 1)'), subterm: parse('(doubleMaxFour, 1)')},
      //   {rule: parse(`doubleMaxFour ($ num) (:: number,
      //     doubleMaxFourG ((num $) < (number 4)) (num $)
      //   )`), subterm: parse(':: number, doubleMaxFourG (1 < (number 4)) 1')},
      // ], [
      //   {rule: parse('main4 (doubleMaxFour, number 4)'), subterm: parse('doubleMaxFour, number 4')},
      //   {rule: parse(`doubleMaxFour ($ num) (:: number,
      //     doubleMaxFourG ((num $) < (number 4)) (num $)
      //   )`), subterm: parse(':: number empty')}
      // ], [
      //   {rule: parse('main5 (doubleMaxFour, number 5)'), subterm: parse('doubleMaxFour, number 5')},
      //   {rule: parse(`doubleMaxFour ($ num) (:: number,
      //     doubleMaxFourG ((num $) < (number 4)) (num $)
      //   )`), subterm: parse(':: number empty')}
      // ], [
      //   {rule: parse('mainl1 (lambdaAdd (number 2) (number 3))'), subterm: parse('lambdaAdd (number 2) (number 3)')},
      // ], [ // FIXME
      //   {rule: parse('mainl2 (lambdaAdd (number 2) (number 2))'), subterm: parse('lambdaAdd (number 2) (number 2)')},
      // ] ]);
    });
  });
});
