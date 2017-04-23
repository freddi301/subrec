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
  toJuxtArray: (li: Term, arr: Array<Juxt> = []): Array<Juxt> => {
    if (typeof li === 'string') return arr;
    if (li instanceof Array) {
      const head = li[LEFT];
      if (head instanceof Array) return list.toJuxtArray(li[RIGHT], arr.concat([head]));
    }
    throw new Error('Juxt expected');
  },
};

export const VAR = '$';
export const EVAL = '|-';
export const END = 'end';

const LEFT = 0;
const RIGHT = 1;

export function match(pattern: Term, term: Term): ?Array<Juxt> {
  if (pattern === term) return [];
  if (pattern instanceof Array && pattern[LEFT] === VAR) return [ [ [ pattern[RIGHT], VAR ], term ] ];
  if (pattern instanceof Array && term instanceof Array) {
    const left = match(pattern[LEFT], term[LEFT]);
    const right = match(pattern[RIGHT], term[RIGHT]);
    if (!left || !right) return null;
    const scope = left.concat(right);
    if (sameBindings(scope)) return scope;
  }
  return null;
}

export function matchIn(rules: Array<Juxt>, term: Term): ?{ scope: Array<Juxt>, right: Term } {
  if (rules.length === 0) return null;
  for (const rule of rules) {
    const scope = match(rule[LEFT], term);
    if (scope) return { scope: scope, right: rule[RIGHT] };
  }
  return null;
}

export function sub(rules: Array<Juxt>, term: Term): Term {
  let subbing = term;
  while (true) {
    if (isEvaluate(subbing)) {
      const eterm = sub(rules, subbing[RIGHT][RIGHT]);
      const erules = sub(rules, subbing[RIGHT][LEFT]);
      subbing = evaluate([EVAL, [erules, eterm]]);
    }
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
  if (isEvaluate(term)) {
    const rules = term[RIGHT][LEFT];
    if (rules instanceof Array) return sub(list.toJuxtArray(rules), term[RIGHT][RIGHT]);
  }
  return term
}

export function isEvaluate(term: Term): boolean {
  return term instanceof Array && term[LEFT] === EVAL;
}

export function sameBindings(scope: Array<Juxt>): boolean {
  for (const stand of scope) for (const step of scope) {
    if (isEqual(stand[LEFT], step[LEFT])) {
      if (!isEqual(stand[RIGHT], step[RIGHT])) return false;
    }
  }
  return true;
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
