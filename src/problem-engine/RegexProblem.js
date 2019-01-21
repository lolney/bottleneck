import Problem from './Problem';
import RandExp from 'randexp';
import { randomInRanges, randomInt } from '../lib/random';
import weighted from 'weighted';
import safe from 'safe-regex';

export default class RegexProblem extends Problem {
    constructor(regex, id, subproblem, name) {
        if (!(regex instanceof RegExp)) {
            regex = RegExp(regex);
            if (!(regex instanceof RegExp)) {
                throw new TypeError(`${regex} must be a regular expression`);
            }
        }
        if (regex.global) {
            regex = RegExp(regex, '');
        }
        if (!safe(regex)) {
            throw new Error(`Regex ${regex} is not safe`);
        }
        if (!name) {
            name = RegexProblem.formatRegex(regex);
        }
        if (!subproblem) {
            subproblem = 'default';
        }

        super(id, subproblem, name);

        const { text, targetWords } = RegexProblemGenerator.generate(regex, 5);
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

    static get regexCheatsheet() {
        return `
/*
**** CHEATSHEET ****
---CHARACTERS---
.: any character
\\d: digit
\\w: word character: ASCII letter, digit or underscore
\\s: whitespace
\\D: not a digit
\\W: not a word
\\S: not a whitespace

[abc]: any of a, b, c
[^abc]: not a, b, or c
[a-c]: character between a and c

---ANCHORS---
^: start of string
$: end of string
\\b: word boundary
\\B: not word boundary

---Quantifiers---
+: one or more
*: zero or more
?: none or one
?: makes quantifiers lazy
{2}: 2 times
{2,4}: 2-4 times	

---Groups---
|: OR operand
(…): Capturing group
\\1>: Contents of group 1
(?:…)	Non-capturing group	
(?=…)	positive lookahead
(?!…)	negative lookahead
*/`;
    }

    getTitle() {
        return 'Word matching';
    }

    getDescription() {
        return 'Write a regular expression that selects the pink words, matching the image on the right with the one on the left.';
    }

    getStartingCode() {
        return `/hello|world/

${RegexProblem.regexCheatsheet}`;
    }

    getTypeString() {
        return 'regex';
    }

    static findMatches(regex, string) {
        let results = [];
        let match = null;
        regex = new RegExp(regex, 'g');
        while ((match = regex.exec(string))) {
            match = match[0];
            if (!match) {
                break;
            }
            results.push(match);
        }
        return results;
    }

    static testFull(regex, string) {
        let match = regex.exec(string);
        return match ? match[0] === string : false;
    }

    static wrapGenerator(regex) {
        if (!(regex instanceof RegExp)) {
            throw new Error(
                'You need to provide a regular expression. Type it into the editor in this form: /<regex>/g'
            );
        }
        if (regex.global) {
            throw new Error(
                'Regex must not be global. Remove the \'g\' flag to the end: /<regex>/g'
            );
        }
        if (!safe(regex)) {
            throw new Error(
                'Regex has star height > 1. Try reducing the nested quantifiers.'
            );
        }
        return (string) => RegexProblem.testFull(regex, string);
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
        return Array.from({ length: this.ntargetWords })
            .map(() => {
                let candidate = generator.gen();
                let iterations = 0;
                /**
                 * Note: will sometimes fail on regexes like
                 * /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.)([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/
                 * which have branches that will never match
                 *
                 * Will also fail on regexes like
                 * /(.+?)(.+?)(\n|\r)/
                 * Generating strings like "\r"
                 * Appears to not handle the lazy quantifier (+?) properly
                 */
                while (!RegexProblem.testFull(this.regex, candidate)) {
                    if (iterations++ > 500) {
                        console.error(
                            'Too many iterations when generating matches from regex: ',
                            this.regex
                        );
                        return null;
                    }
                    candidate = generator.gen();
                }
                return candidate;
            })
            .filter((candidate) => candidate !== null);
    }

    createText(targetWords) {
        const nontarget = this.createNontargetWords();
        return RegexProblemGenerator.mergeRandom(
            targetWords.map((e) => e),
            nontarget
        );
    }

    createNontargetWords() {
        const targetWords = this.createTargetWords();

        for (const i in targetWords) {
            while (RegexProblem.testFull(this.regex, targetWords[i])) {
                if (targetWords[i] === '') {
                    break;
                }
                targetWords[i] = RegexProblemGenerator.mutate(targetWords[i]);
            }
        }

        return targetWords;
    }

    static mergeRandom(...arrays) {
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
