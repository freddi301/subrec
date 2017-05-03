// @flow

import { expect } from 'chai';
import { parse, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-3-data-checking', () => {
  it('works with boolean', () => {
    const rules = list.toJuxtArray(parse(`
      bool1 (Boolean true),
      bool2 (Boolean false),
      bool3 (Boolean flash),
      end
    `));
    const unreds1 = list.toJuxtArray(parse(`
      Boolean true ${CHECKS},
      Boolean false ${CHECKS},
      end
    `));
    const errors1 = check(rules, unreds1);
    expect(errors1).to.have.deep.property('[0][0].rule').that.deep.equals(parse('bool3, Boolean flash'));
    const unreds2 = list.toJuxtArray(parse(`
      ($ left) | ($ right) ($ right) ${CHECKS},
      ($ left) | ($ right) ($ left) ${CHECKS},
      Boolean (true | false),
      end
    `));
    const errors2 = check(rules, unreds2);
    expect(errors2).to.have.deep.property('[0][0].rule').that.deep.equals(parse('bool3, Boolean flash'));
  });
  it('works with RGB', () => {
    const rules = list.toJuxtArray(parse(`
      color1 (Color red),
      color2 (Color green),
      color3 (Color blue),
      color4 (Color (light blue)),
      end
    `));
    const unreds1 = list.toJuxtArray(parse(`
      Color red ${CHECKS},
      Color green ${CHECKS},
      Color blue ${CHECKS},
      end
    `));
    const errors1 = check(rules, unreds1);
    expect(errors1).to.have.deep.property('[0][0].rule').that.deep.equals(parse('color4 (Color (light blue))'));
    const unreds2 = list.toJuxtArray(parse(`
      |parse | unionNil,
      |parse ($ head, $ tail) (unionCons, head $, |parse (tail $)),
      | ($ fields) (|parse (fields $)),
      (unionCons, $ value, $ tail) ($ value) ${CHECKS},
      (unionCons, $ head, $ tail) ($ value) ((tail $) (value $)),
      Color (|, green, blue, red ,|),
      end
    `));
    const errors2 = check(rules, unreds2);
    expect(errors2).to.have.deep.property('[0][0].rule').that.deep.equals(parse('color4 (Color (light blue))'));
    const unreds3 = list.toJuxtArray(parse(`
      |parse | unionNil,
      |parse ($ tail, $ head) (unionCons, head $, |parse (tail $)),
      ($ fields) | (|parse (fields $)),
      (unionCons, $ value, $ tail) ($ value) ${CHECKS},
      (unionCons, $ head, $ tail) ($ value) ((tail $) (value $)),
      Color (| green (light blue) red |),
      end
    `));
    const errors3 = check(rules, unreds3);
    expect(errors3).to.have.deep.property('[0][0].rule').that.deep.equals(parse('color3 (Color blue)'));
  });
});
