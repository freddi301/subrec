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
export const CHECKS = 'checks';

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

export type Matched = { scope: Array<Juxt>, right: Term, left: Term, rule: Juxt };

export function matchIn(rules: Array<Juxt>, term: Term): ?Matched {
  if (rules.length === 0) return null;
  for (const rule of rules) {
    const scope = match(rule[LEFT], term);
    if (scope) return { scope: scope, right: rule[RIGHT], left: rule[LEFT], rule };
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

export function hasVars(term: Term): boolean {
  if (typeof term === 'string') return false;
  if (term instanceof Array) {
    if (term[RIGHT] === VAR) return true;
    return hasVars(term[LEFT]) || hasVars(term[RIGHT]);
  }
  throw new Error();
}

export type Trace = {rule: Juxt, subterm: Term};

export function checkOne(left: Term, right: Term, rules: Array<Juxt>, unreds: Array<Juxt>, trace: Array<Trace> = []): ?Array<Trace> {
  const holds = sub(unreds, right);
  if (holds === CHECKS) return null;
  const subterm = sub(rules, right);
  if (isEqual(right, subterm)) return trace;
  return checkOne(left, subterm, rules, unreds, trace.concat({ rule: [left, right], subterm }));
}

export function check(rules: Array<Juxt>, unreds: Array<Juxt>): ?Array<Array<Trace>> {
  const wrong: Array<Array<Trace>> = [];
  for (const [left, right] of rules) {
    if (!hasVars(right)) {
      const trace = checkOne(left, right, rules, unreds);
      if (trace) wrong.push(trace);
    }
  }
  if (wrong.length) return wrong;
  return null;
}

import make from "nearley-make";
import fs from 'fs';
const grammar = fs.readFileSync('src/syntax.ne', 'utf-8');
export function parse(text: string): Term {
  const parser = make(grammar);
  parser.feed(text);
  if (parser.results.length === 0) throw new Error('unecpected end of input');
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

export const s = (template: string[], ...expressions: string[]) => parse(template.reduce((accumulator, part, i) => accumulator + expressions[i - 1] + part));
export const r = (template: string[], ...expressions: string[]) => list.toJuxtArray(s(template, ...expressions));