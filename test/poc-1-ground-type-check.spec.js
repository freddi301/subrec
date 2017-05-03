// @flow

import { expect } from 'chai';
import { parse, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-1-ground-type-check', () => {
  describe('Boolean', () => {
    it('works', () => {
      const rules = list.toJuxtArray(parse(`
        bool1 (type Boolean true),
        bool2 (type Boolean false),
        bool3 (type Boolean, batman vs superman),
        bool4 (type Boolean superman),
        end
      `));
      const unreds = list.toJuxtArray(parse(`
        type Boolean true ${CHECKS},
        type Boolean false ${CHECKS},
        end
      `));
      const errors = check(rules, unreds);
      if (!errors) throw new Error();
      expect(errors).to.have.property('length', 2);
      expect(errors[0][0].rule).to.deep.equal(parse('bool3 (type Boolean (batman vs superman))'));
      expect(errors[1][0].rule).to.deep.equal(parse('bool4 (type Boolean superman)'));
      // data Boolean (true | false | batman);
      const unreds2 = list.toJuxtArray(parse(`
        data Boolean (true | (batman vs superman) | false),
        check (($ tail) | ($ value)) ($ value) ${CHECKS},
        check (($ tail) | ($ alt)) ($ value) (check (tail $) (value $)),
        check ($ value) ($ value) ${CHECKS},
        type ($ type) ($ value) (
          check (data (type $)) (value $)
        ),
        end
      `));
      const errors2 = check(rules, unreds2);
      if (!errors2) throw new Error();
      expect(errors2).to.have.property('length', 1);
      expect(errors2[0][0].rule).to.deep.equal(parse('bool4 (type Boolean superman)'));
    });
  });
});
