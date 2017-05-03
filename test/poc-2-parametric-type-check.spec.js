// @flow

import { expect } from 'chai';
import { parse, list, match, matchIn, sub, evaluate, check, END, VAR, EVAL, CHECKS } from '../src';

describe('poc-1-ground-type-check', () => {
  describe('Boolean', () => {
    it('works', () => {
      const rules = list.toJuxtArray(parse(`
        bool1 (type Boolean true),
        bool2 (type Boolean false),
        bool3 (type Boolean batman),
        bool4 (type Boolean superman),
        box1 (type Box (type Boolean true)),
        box2 (type Box (type Boolean true)),
        box3 (type Box (type Boolean superman)),
        box4 (type Box (type Boolean batman)),
        box5 (type Box (type NotAType false)),
        homobox1 (type HomoBox ( (type Boolean true) homo (type Boolean false) )),
        homobox2 (type HomoBox ( (type Boolean true) homo (type Boolean batman) )),
        homobox3 (type HomoBox ( (type Boolean true) homo (type NotAType true) )),
        end
      `));
      const unreds = list.toJuxtArray(parse(`
        type Boolean true ${CHECKS},
        type Boolean false ${CHECKS},
        type Box ($ T) (T $),
        ${CHECKS} &&&& ${CHECKS} ${CHECKS},
        ${CHECKS} |||| ($ _) ${CHECKS}, ($ _) |||| ${CHECKS} ${CHECKS},
        type HomoBox ( (type ($ T) ($ V1)) homo (type ($ T) ($ V2)) ) (
          (type (T $) (V1 $)) &&&& (type (T $) (V2 $))
        ),
        end
      `));
      const errors = check(rules, unreds);
      if (!errors) throw new Error();
      expect(errors).to.have.property('length', 7);
      expect(errors[0][0].rule).to.deep.equal(parse('bool3 (type Boolean batman)'));
      expect(errors[1][0].rule).to.deep.equal(parse('bool4 (type Boolean superman)'));
      expect(errors[2][0].rule).to.deep.equal(parse('box3 (type Box (type Boolean superman))'));
      expect(errors[3][0].rule).to.deep.equal(parse('box4 (type Box (type Boolean batman))'));
      expect(errors[4][0].rule).to.deep.equal(parse('box5 (type Box (type NotAType false))'));
      // data Boolean (true | false | batman)
      // data Box ($ T) (T $)
      // data HomoBox ($ T) ((T $) homo (T $))
      // const unreds2 = list.toJuxtArray(parse(`
      //   data Boolean (true | false),
      //   data Box ($ T) ((T $) | empty),
      //   data HomoBox ($ T) ((T $) homo (T $)),
      //   check (($ tail) | ($ value)) ($ value) ${CHECKS},
      //   check (($ tail) | ($ alt)) ($ value) (check (tail $) (value $)),
      //   check (type ($ type)) ($ value) (type (type $) (value $)),
      //   check ($ value) ($ value) ${CHECKS},
      //   ${CHECKS} &&&& ${CHECKS} ${CHECKS},
      //   check (($ leftType) ($ rightType)) (($ leftValue) ($ rightValue)) (
      //     (check (leftType $) (leftValue $)) &&&& (check (rightType $) (rightValue $))
      //   ),
      //   type ($ type) (type ($ innerType) ($ innerValue)) (
      //     check (data (type $) (type, innerType $)) (innerValue $)
      //   ),
      //   type ($ type) ($ value) (
      //     check (data (type $)) (value $)
      //   ),
      //   end
      // `));
      // const errors2 = check(rules, unreds2);
      // if (!errors2) throw new Error();
      // expect(errors2).to.have.property('length', 7);
      // expect(errors2[0][0].rule).to.deep.equal(parse('bool3 (type Boolean batman)'));
      // expect(errors2[1][0].rule).to.deep.equal(parse('bool4 (type Boolean superman)'));
      // expect(errors2[2][0].rule).to.deep.equal(parse('box3 (type Box (type Boolean superman))'));
      // expect(errors2[3][0].rule).to.deep.equal(parse('box4 (type Box (type Boolean batman))'));
      // expect(errors[4][0].rule).to.deep.equal(parse('box5 (type Box (type NotAType false))'));
      // expect(errors[5][0].rule).to.deep.equal(parse('homobox2 (type HomoBox ( (type Boolean true) homo (type Boolean batman) ))'));
      // expect(errors[6][0].rule).to.deep.equal(parse('homobox3 (type HomoBox ( (type Boolean true) homo (type NotAType true) ))'));
    });
  });

});
