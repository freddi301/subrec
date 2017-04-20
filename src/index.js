// @flow

import { isEqual } from 'lodash';

type Term = string | Array<Term>;

type Rule = [ Term, Term ];

type Eval = [ Array<Rule>, typeof EVAL, Term ];

export const VAR = '$';
export const EVAL = '|-';

export function match(left: Term, term: Term): ?Array<Rule> {
  if (left === term) return [];
  if (left instanceof Array && left[0] === VAR) return [ [ [ left[1], VAR ], term ] ];
  if (left instanceof Array && term instanceof Array && left.length === term.length) {
    let scope = [];
    for (let i = 0; i < left.length; i++) {
      const param = match(left[i], term[i]);
      if(!param) return null;
      scope = scope.concat(param);
    }
    return scope;
  }
  return null;
}

export function matchIn(rules: Array<Rule>, term: Term): ?{ scope: Array<Rule>, right: Term } {
  for (let [left, right] of rules) {
    const scope = match(left, term);
    if (scope) return { scope, right };
  }
}

export function sub([rules, EV, term]: Eval): Term {
  let subbing = term;
  while (true) {
    const matched = matchIn(rules, subbing);
    if (matched) {
      subbing = sub([matched.scope.concat(rules), EV, matched.right]);
    } else if (subbing instanceof Array) {
      const subbed = subbing.map(item => sub([rules, EV, item]));
      if (isEqual(subbing, subbed)) return subbing;
      subbing = subbed;
    } else return subbing;
  }
  return term;
}

export function evaluate(term: Term): Term {
  if (term instanceof Array && term.length === 3 && term[1] === EVAL && term[0] instanceof Array) {
    const rules: Array<any> = term[0].filter(item =>
      item instanceof Array && item.length === 2 &&
      ((typeof item[0] === 'string') || item[0] instanceof Array) &&
      ((typeof item[1] === 'string') || item[1] instanceof Array)
    );
    return sub([rules, EVAL, term[2]]);
  }
  return term
}

import make from "nearley-make";
import fs from 'fs';

const grammar = fs.readFileSync('src/syntax.ne', 'utf-8');
export function parse(text: string): Term {
  const parser = make(grammar);
  parser.feed(text);
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
