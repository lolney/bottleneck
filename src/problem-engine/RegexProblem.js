import Problem from './Problem';
import RandExp from 'randexp';
import { randomInRanges, randomInt } from '../lib/random';
import weighted from 'weighted';

export default class RegexProblem extends Problem {
    constructor(regex, id, subproblem, name) {
        if (!(regex instanceof RegExp)) {
            regex = RegExp(regex);
            if (!(regex instanceof RegExp)) {
                throw new TypeError(`${regex} must be a regular expression`);
            }
        }
        if (!name) {
            name = RegexProblem.formatRegex(regex);
        }
        if (!subproblem) {
            subproblem = 'default';
        }

        super(id, subproblem, name);

        const { text, targetWords } = RegexProblemGenerator.generate(regex, 30);
        this.text = text;
        this.regex = regex;
        this.targetWords = targetWords;
    }

    static formatRegex(regex) {
        const string = regex.toString();
        if (string.length > 10) {
            return string.slice(0, 7) + '...';
        }
    }

    getTitle() {
        return 'Word matching';
    }

    getDescription() {
        return 'Write a regular expression that selects the words highlighted in yellow.';
    }

    getStartingCode() {
        return '/hello|world/g';
    }

    getTypeString() {
        return 'regex';
    }

    static findMatches(regex, string) {
        let results = [];
        let match = null;
        while ((match = regex.exec(string))) {
            match = match[0];
            if (!match) {
                break;
            }
            results.push(match);
        }
        return results;
    }

    static wrapGenerator(regex) {
        if (!(regex instanceof RegExp)) {
            throw new Error(
                'You need to provide a regular expression. Type it into the editor in this form: /<regex>/g'
            );
        }
        if (!regex.global) {
            throw new Error(
                'Regex must be global. Add the \'g\' flag to the end: /<regex>/g'
            );
        }
        return (string) => RegexProblem.findMatches(regex, string);
    }

    async serialize() {
        return {
            ...super.serialize(),
            text: this.text,
            targetWords: this.targetWords
        };
    }
}

export class RegexProblemGenerator {
    constructor(regex, ntargetWords) {
        this.regex = regex;
        this.ntargetWords = ntargetWords;
    }

    static generate(regex, ntargetWords) {
        const generator = new RegexProblemGenerator(regex, ntargetWords);
        const targetWords = generator.createTargetWords();
        const text = generator.createText(targetWords);

        return { targetWords, text };
    }

    createTargetWords() {
        const generator = new RandExp(this.regex);
        return Array.from({ length: this.ntargetWords }).map(() =>
            generator.gen()
        );
    }

    createText(targetWords) {
        const nontarget = this.createNontargetWords();
        return this.mergeRandom(targetWords.map((e) => e), nontarget).join(' ');
    }

    createNontargetWords() {
        const targetWords = this.createTargetWords();

        for (const i in targetWords) {
            while (this.regex.test(targetWords[i])) {
                targetWords[i] = RegexProblemGenerator.mutate(targetWords[i]);
            }
        }

        return targetWords;
    }

    mergeRandom(...arrays) {
        const nonexhauted = arrays.map((_, i) => i);
        const output = [];

        while (nonexhauted.length > 0) {
            const nonexhauted_i = randomInt(0, nonexhauted.length);
            const i = nonexhauted[nonexhauted_i];

            if (arrays[i].length == 0) {
                nonexhauted.splice(nonexhauted_i, 1);
            } else {
                output.push(arrays[i].pop());
            }
        }

        return output;
    }

    static randomCharacter() {
        const randomLetter = () => {
            const code = randomInRanges([97, 123], [65, 91]);
            return String.fromCharCode(code);
        };
        const randomOther = () => {
            const code = randomInRanges([32, 65], [91, 97]);
            return String.fromCharCode(code);
        };
        const empty = () => '';

        const items = [empty, randomLetter, randomOther];
        const weights = [0.3, 0.4, 0.3];

        const func = weighted.select(items, weights);
        return func();
    }

    static mutate(string) {
        const char = RegexProblemGenerator.randomCharacter();
        const i = randomInt(0, string.length);

        return string.slice(0, i) + char + string.slice(i + 1);
    }
}
