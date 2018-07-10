/**
 * Abstract class for representing Validator predicates
 */
class Condition {
    constructor(condition, message) {
        this.fn = condition;
        this.message = message;
    }
}

export class ValidationError extends Error {
    constructor(result, args, message) {
        super(
            `Invalid return value \'${result}\' for args ${args}: ${message}`
        );
    }
}

/**
 * Contains factory methods for range conditions
 */
export class Range extends Condition {
    /**
     * Represents an inclusive range between `lo` and `hi`
     * @param {number} lo
     * @param {number} hi
     * @return {Range}
     */
    static in(lo, hi) {
        return new Range(
            (arg) => arg >= lo && arg <= hi,
            `Must be between ${lo} and ${hi}`
        );
    }
}

/**
 * Contains factory methods for type conditions
 */
export class Type extends Condition {
    /**
     * Test `typeString` against the result of `typeof`
     * @param {string} typeString
     * @return {Type}
     */
    static is(typeString) {
        return new Type(
            (arg) => typeof arg == typeString,
            `Must be type ${typeString}`
        );
    }

    /**
     * Test for an integer
     * @return {Type}
     */
    static isInteger() {
        return new Type((arg) => Number.isInteger(arg), `Must be an integer`);
    }
}

export default class Validator {
    /**
     * @param {Condition} conditions
     */
    constructor(conditions) {
        this.conditions = conditions;
    }

    /**
     * Tests a `result` against the conditions of the Validator
     * @throws {ValidationError}
     * @param {*} result
     * @param {Array<*>} args
     * @return {boolean}
     */
    test(result, args) {
        for (const condition of this.conditions) {
            if (!condition.fn(result))
                throw new ValidationError(result, args, condition.message);
        }
        return true;
    }

    /**
     * Calls `generator` with `args`, throwing an error
     * if `this` finds a validation problem and returning
     * the result otherwise
     * @param {function(Array<*>):T} generator
     * @param {Array<*>} args
     * @throws {ValidationError}
     * @return {T}
     */
    callGeneratorWithValidator(generator, args) {
        let result = generator.apply(this, args);
        this.test(result, args);
        return result;
    }
}
