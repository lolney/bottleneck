import Problem from './Problem';
import RandExp from 'randexp';

export default class RegexProblem extends Problem {
    constructor(regex, id, subproblem, name) {
        super(id, subproblem, name);
        this.regex = regex;
        this.targetWords = RegexProblem.createMatches(this.regex, 30);
        this.text = RegexProblem.createText(this.targetWords);
    }

    getTitle() {
        return 'Word matching';
    }

    getDescription() {
        return 'Write a regular expression that matches the words highlighted in yellow.';
    }

    getStartingCode() {
        return '/hello|world/g';
    }

    getTypeString() {
        return 'regex';
    }

    static createMatches(regex, n) {
        const generator = new RandExp(regex);
        return Array.from({ length: n }).map(() => generator.gen());
    }

    static createText(matches) {
        return matches.join(', ');
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
        return (string) => {
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
        };
    }

    async serialize() {
        return {
            ...super.serialize(),
            text: this.text,
            targetWords: this.targetWords
        };
    }
}
