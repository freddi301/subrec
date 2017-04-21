// @flow

import { isEqual } from 'lodash';

type Atom = string;
type Juxt = [ Term, Term ];
type Term = Atom | Juxt;
type List<Item: Term> = [ Item, List<Item> ] | typeof END;
type Pattern = Term;
type Rule = [ Pattern, Term ];

export const list = {
  is: (term: Term): boolean => {
    if (term === END) return true;
    if (term instanceof Array) return list.is(term[RIGHT]);
    return false;
  },
  fromArray: (array: Array<Term>): List<Term> => {
    if (array.length === 0) return END;
    let list = [ array[0], END ];
    let last = list;
    for (const item of array.slice(1)) { last[RIGHT] = [ item, END ]; }
    return list;
  },
  toArray: (li: List<Term>, arr = []): Array<Term> => {
    if (!list.is(li)) throw new Error('list expected');
    if (li === END) return arr;
    if (li instanceof Array) return list.toArray(li[RIGHT], arr.concat([li[LEFT]]));
  },
};

export const VAR = '$';
export const EVAL = '|-';
export const END = 'end';

const LEFT = 0;
const RIGHT = 1;

export function match(pattern: Pattern, term: Term): ?List<Rule> {
  if (pattern === term) return END;
  if (pattern instanceof Array && pattern[LEFT] === VAR) return [ [ [ pattern[RIGHT], VAR ], term ], END ];
  if (pattern instanceof Array && term instanceof Array) {
    let scope = [];
    const left = match(pattern[LEFT], term[LEFT]);
    const right = match(pattern[RIGHT], term[RIGHT]);
    if (!left || !right) return null;
    scope = scope.concat(list.toArray(left), list.toArray(right));
    return list.fromArray(scope);
  }
  return null;
}

export function matchIn(rules: List<Rule>, term: Term): ?{ scope: List<Rule>, right: Term } {
  if (!list.is(rules)) throw new Error('list expected');
  if (rules === END) return null;
  const rule = rules[LEFT];
  const scope = match(rule[LEFT], term);
  if (scope) return { scope, right: rule[RIGHT] };
  return matchIn(rules[RIGHT], term);
}

export function sub(rules: List<Rule>, term: Term): Term {
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
}

export function evaluate(term: Term): Term {
  if (term instanceof Array && term[LEFT][RIGHT] === EVAL && term[LEFT][LEFT] instanceof Array && list.is(term[LEFT][LEFT])) {
    return sub(term[LEFT][LEFT], term[RIGHT]);
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
