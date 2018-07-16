import Validator, {
    Range,
    Type,
    ValidationError
} from '../../src/problem-engine/Validator';

describe('condition', () => {
    describe('Range.in', () => {
        let validator = new Validator([Range.in(0, 100)]);
        it('does not throw for elem in range', () => {
            [0, 50, 100].forEach((val) => {
                expect(() => validator.test(val, [])).not.toThrow();
            });
        });

        it('throws for elem not in range', () => {
            [-100, 150, 100.1].forEach((val) => {
                expect(() => validator.test(val, [])).toThrow(
                    new ValidationError(val, [], 'Must be between 0 and 100')
                );
            });
        });
    });

    describe('Type', () => {
        let validator = new Validator([Type.is('number')]);
        it('does not throw for numbers', () => {
            [-100, 0, 1.1, 100].forEach((val) => {
                expect(() => validator.test(val, [])).not.toThrow();
            });
        });

        it('throws for non-numbers', () => {
            [{}, 'a', null, undefined].forEach((val) => {
                expect(() => validator.test(val, [])).toThrow(
                    new ValidationError(val, [], 'Must be type number')
                );
            });
        });
    });
});

describe('callGeneratorWithValidator', () => {
    let createFunc = (val) => {
        let args = ['a', 'b', 'c', 'd', 'e', 'f'].slice(6 - val);
        return eval(`(${args}) => {}`);
    };

    it('doesn\'t throw with no args specified', () => {
        let validator = new Validator([]);
        let args = [];

        [0, 1, 2, 3].forEach((val) => {
            expect(() =>
                validator.callGeneratorWithValidator(createFunc(val), args)
            ).not.toThrow();
        });
    });

    it('throws with too few or too many args', () => {
        let validator = new Validator([], 4);
        let args = [1, 2, 3, 4];

        [0, 1, 2, 3, 5, 6].forEach((val) => {
            expect(() =>
                validator.callGeneratorWithValidator(createFunc(val), args)
            ).toThrow();
        });
    });
});
