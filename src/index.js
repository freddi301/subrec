// @flow

import { isEqual } from 'lodash';

type Term = string | Array<Term>;

type Rule = [ Term, Term ];

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

export function sub(rules: Array<Rule>, term: Term): Term {
  let subbing = term;
  while (true) {
    const matched = matchIn(rules, subbing);
    if (matched) {
      subbing = sub(matched.scope.concat(rules), matched.right);
    } else if (subbing instanceof Array) {
      const subbed = subbing.map(item => sub(rules, item));
      if (isEqual(subbing, subbed)) return subbing;
      subbing = subbed;
    } else return subbing;
  }
  return term;
}

export function evaluate(term: Term): Term {
  if (term instanceof Array && term.length === 3 && term[1] === EVAL && term[0] instanceof Array) {
    return sub((term[0].filter(item => item.length === 2): any), term[2]);
  }
  return term
}

import syntax from "./syntax.js";
import { Parser } from "nearley";

export function parse(text: string): Term {
  const parser = new Parser(syntax.ParserRules, syntax.ParserStart);
  parser.feed(text);
  return parser.results[0][0].toJSON();
}
