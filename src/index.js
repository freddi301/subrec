// @flow

import { isEqual } from 'lodash';

type Atom = string;
type Juxt = [ Term, Term ];
type Term = Juxt | Atom;

export const list = {
  fromArray: (array: Array<Term>): Term => {
    if (array.length === 0) return END;
    let list = [ array[0], END ];
    let last = list;
    for (const item of array.slice(1)) { last[RIGHT] = [ item, END ]; }
    return list;
  },
  toArray: (li: Term, arr: Array<Term> = []): Array<Term> => {
    if (typeof li === 'string') return arr;
    if (li instanceof Array) return list.toArray(li[RIGHT], arr.concat([li[LEFT]]));
    throw new Error('Term expected');
  },
};

export const VAR = '$';
export const EVAL = '|-';
export const END = 'end';

const LEFT = 0;
const RIGHT = 1;

export function match(pattern: Term, term: Term): ?Array<Term> {
  if (pattern === term) return [];
  if (pattern instanceof Array && pattern[LEFT] === VAR) return [ [ [ pattern[RIGHT], VAR ], term ] ];
  if (pattern instanceof Array && term instanceof Array) {
    const left = match(pattern[LEFT], term[LEFT]);
    const right = match(pattern[RIGHT], term[RIGHT]);
    if (!left || !right) return null;
    return left.concat(right);
  }
  return null;
}

export function matchIn(rules: Term, term: Term): ?{ scope: Term, right: Term } {
  if (typeof rules === 'string') return null;
  const rule = rules[LEFT];
  const scope = match(rule[LEFT], term);
  if (scope) return { scope: list.fromArray(scope), right: rule[RIGHT] };
  return matchIn(rules[RIGHT], term);
}

export function sub(rules: Term, term: Term): Term {
  let subbing = term;
  while (true) {
    const matched = matchIn(rules, subbing);
    if (matched) {
      subbing = sub(matched.scope, matched.right);
    } else if (subbing instanceof Array) {
      const subbed = [sub(rules, subbing[LEFT]), sub(rules, subbing[RIGHT])]
      if (isEqual(subbing, subbed)) return subbing;
      subbing = subbed;
    } else return subbing;
  }
  return subbing;
}

export function evaluate(term: Term): Term {
  if (term instanceof Array && term[LEFT][RIGHT] === EVAL) {
    const rules = term[LEFT][LEFT];
    if (rules instanceof Array) return sub(rules, term[RIGHT]);
  }
  return term
}

import make from "nearley-make";
import fs from 'fs';
const grammar = fs.readFileSync('src/syntax.ne', 'utf-8');
export function parse(text: string): Term {
  const parser = make(grammar);
  parser.feed(text);
  if (parser.results.length > 1) throw new Error('ambigous syntax');
  /*if (parser.results.length > 1) {
    console.log(text);
    console.dir(parser.results, {color:true,depth:null});
    throw new Error('ambigous syntax');
  } else {
    console.log(text);
    console.dir(parser.results[0].toJSON(), {color:true,depth:null});
  }*/
  return parser.results[0].toJSON();
}
