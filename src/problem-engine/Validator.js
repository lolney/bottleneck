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
     * Test for an instance of `prototype`
     * @param {function} prototype
     */
    static isInstance(prototype) {
        return new Type(
            (arg) => arg instanceof prototype,
            `Must be type ${prototype.name}`
        );
    }

    /**
     * Test for an integer
     * @return {Type}
     */
    static isInteger() {
        return new Type((arg) => Number.isInteger(arg), 'Must be an integer');
    }

    /**
     * Test for an Array
     * @return {Type}
     */
    static isArray() {
        return new Type((arg) => Array.isArray(arg), 'Must be an array');
    }
}

export default class Validator {
    /**
     * @param {Condition} conditions
     * @param {number} nargs - optional
     */
    constructor(conditions, nargs) {
        this.conditions = conditions;
        this.nargs = nargs;
    }

    /**
     * Tests a `result` against the conditions of the Validator
     * @throws {ValidationError}
     * @param {*} result
     * @param {Array<*>} args
     * @return {boolean}
     */
    test(result, args) {
        for (const i in this.conditions) {
            // can't use for-of here?
            const condition = this.conditions[i];
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
        if (this.nargs != undefined && this.nargs != generator.length)
            throw new Error(
                `Expecting a function with ${this.nargs} parameters; supplied ${
                    generator.length
                }`
            );
        this.test(result, args);
        return result;
    }
}
