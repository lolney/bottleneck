import Validator, {
    Range,
    ValidationError
} from '../../src/problem-engine/Validator';

describe('condition', () => {
    describe('Range.in', () => {
        let validator = new Validator([Range.in(0, 100)]);
        it('does not throw for elem in range', () => {
            [0, 50, 100].forEach((val) => {
                expect(() => validator.test(0, [])).not.toThrow();
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
});
