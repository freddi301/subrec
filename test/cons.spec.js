// @flow

import { expect } from 'chai';
import { parse, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

const Lambda = {
  rules: `
    ($ var) => (($ left) ($ right)) ($ param) (
      ((var $) => (left $) (param $))
      ((var $) => (right $) (param $))
    ),
    ($ var) => ($ var) ($ param) (param $),
    ($ var) => ($ body) ($ param) (body $),
  `,
  unred: [ [parse(`($ var) => ($ body)`), CHECKS] ],
};

const List = {
  rules: `
    [parse ] Nil,
    [parse ($ head, $ tail) (Cons, head $, [parse (tail $)),
    [ ($ fields) ([parse (fields $)),
  `,
  unred: [ // data List = Nil | Cons _ List
    ['Nil', CHECKS],
    [parse('isCons Nil'), CHECKS],
    [['Cons', [[VAR, 'head'], [VAR, 'tail']]], parse('isCons (tail $)')],
    [parse('isCons (Cons, ($ head) ($ tail))'), parse('isCons (tail $)')]
  ]
};

const Reduce = {
  rules: `
    Nil . reduce ($ reducer) ($ state) (state $),
    (Cons, ($ head, $ tail)) . reduce ($ reducer) ($ state) (
      (tail $) . reduce (reducer $) ((reducer $) (state $) (head $))
    ),
  `,
}

describe('list example', () => {
  it('works', () => {
    const rules = list.toJuxtArray(parse(`
      ${List.rules}
      list0 ([ ]),
      list1 ([, a ,]),
      list2 ([, a , b ,]),
      list3 ([, a , b , c ,]),
      notlist (Cons, a b),
      islist (Cons, a Nil),
      end
    `));
    expect(sub(rules, 'list0')).to.deep.equal('Nil');
    expect(sub(rules, 'list1')).to.deep.equal(parse('Cons, a Nil'));
    expect(sub(rules, 'list2')).to.deep.equal(parse('Cons, a, (Cons, b, Nil)'));
    expect(sub(rules, 'list3')).to.deep.equal(parse('Cons, a, (Cons, b, (Cons, c, Nil))'));
    expect(check(rules, [
      ['a', CHECKS], ['b', CHECKS], ['c', CHECKS], ['☺', CHECKS],
      ...List.unred,
    ])).to.deep.equal([
      [ {rule: parse('notlist (Cons, a b)'), subterm: parse('(Cons, a b)')} ]
    ]);
  });
  describe('reduce', () => {
    it('works', () => {
      const rules = list.toJuxtArray(parse(`
        ${List.rules}
        ${Lambda.rules}
        ${Reduce.rules}
        red1 (
          ([,a,b,c,]) . reduce (memo =>,item =>,memo item) ☺
        ),
        0 + 1 1, 1 + 2 3, 3 + 3 6,
        red2 (
          ([,1,2,3,]) . reduce (memo =>,item =>,memo + item) 0
        ),
        end
      `));
      expect(sub(rules, 'red1')).to.deep.equal(parse('☺ a b c'));
      expect(sub(rules, 'red2')).to.deep.equal(parse('6'));
    });
  });
});
