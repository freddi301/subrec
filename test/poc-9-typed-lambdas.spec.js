// @flow

import { expect } from 'chai';
import { parse, s, r, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-9-typed-lambdas', () => {
  it('works', () => {
    expect(evaluate(parse(`
      ${EVAL}, (
        ($ var) => (($ left) ($ right)) ($ param) (
          ((var $) => (left $) (param $))
          ((var $) => (right $) (param $))
        ),
        ($ var) => ($ var) ($ param) (param $),
        ($ var) => ($ body) ($ param) (body $),
        1 + 1 2,
        2 + 1 3,
        1 + 2 3,
        3 + 1 4,
        f (x =>, x + x + x),
        g (x =>, y =>, x + y + x),
        end
      ) ((f 1) (g 1 2))
    `))).to.deep.equal(parse('(3 4)'));
  });
  describe('ground typed lambdas', () => {
    const rules = r`
      ($ type) ($ head) => ($ body) (Lambda (type $, (head $, body $))),
      Lambda (($ inType, $ outType) ($ head, ($ outType, $ outValue))) ($ inType, $ inValue) (outType $, outValue $),
      lambda1 ((Bit Bit) x => x),
      lambda2 ((Bit Bit) x => (Bit 1)),
      lambda3 ((Bit Bit) x => (Color black)),
      value1 (lambda2 (Bit 0)),
      value2 (lambda2 (Color white)),
      end
    `;
    const unreds = r`
      Bit 0 ${CHECKS}, Bit 1 ${CHECKS},
      Color white ${CHECKS}, Color black ${CHECKS},
      Lambda (($ inType, $ outType) ($ head, ($ outType, $ outValue))) ($ inType, $ inValue) ${CHECKS},
      Lambda (($ inType, $ outType) ($ head, ($ outType, $ outValue))) ${CHECKS},
      Lambda (($ inType, $ inType) ($ head, $ head)) ${CHECKS},
      end
    `;
    it('works', () => {
      expect(sub(rules, 'lambda1')).to.deep.equal(s`Lambda ((Bit Bit) (x x))`);
      expect(sub(rules, 'value1')).to.deep.equal(s`Bit 1`);
      const errors = check(rules, unreds);
      expect(errors).to.deep.equal([
        [{rule: s`value2 (lambda2 (Color white))`, subterm: s`Lambda ((Bit Bit) (x (Bit 1))) (Color white)`}],
        [{rule: s`lambda3 ((Bit Bit) x => (Color black))`, subterm: s`Lambda ((Bit Bit) (x (Color black)))`}],
      ]);
      // TODO
    });
  });
});