import RegexProblem, {
    RegexProblemGenerator
} from '../../src/problem-engine/RegexProblem';
import { regexes } from '../../stories/fixtures';

describe('RegexGenerator', () => {
    it('should generate text and an array of targetWords', () => {
        for (const regex of regexes) {
            const { text, targetWords } = RegexProblemGenerator.generate(
                regex,
                10
            );

            expect(text instanceof Array).toBe(true);
            expect(targetWords instanceof Array).toBe(true);
        }
    });

    it('all target words match', () => {
        for (const regex of regexes) {
            const n = 10;

            const { text, targetWords } = RegexProblemGenerator.generate(
                regex,
                n
            );

            for (const target of targetWords) {
                expect(regex.test(target)).toBe(true);
            }
        }
    });

    it('n matches in the provided regex', () => {
        for (const regex of regexes) {
            const n = 10;

            const { text, targetWords } = RegexProblemGenerator.generate(
                regex,
                n
            );

            expect(targetWords.length).toBe(n, regex);
            expect(
                targetWords.every((string) =>
                    RegexProblem.testFull(regex, string)
                )
            ).toBe(true, text);
        }
    });

    it('createNonTargetWords creates words that don\'t match', () => {
        for (const regex of regexes) {
            const generator = new RegexProblemGenerator(regex, 10);
            const nonmatches = generator.createNontargetWords();

            expect(nonmatches.length).toBe(10);
            for (const nonmatch of nonmatches) {
                expect(RegexProblem.testFull(regex, nonmatch)).toBe(
                    false,
                    nonmatch
                );
            }
        }
    });

    it('randomcharacter selects a random character', () => {
        for (let i = 0; i < 10; i++) {
            const char = RegexProblemGenerator.randomCharacter();

            expect(typeof char).toBe('string');
            expect(char.length).toBeLessThan(2);
        }
    });

    it('mutate creates a word with the same length or less', () => {
        for (const word of ['word', 'a', '.']) {
            const newWord = RegexProblemGenerator.mutate(word);

            expect(typeof newWord).toBe('string');
            expect(newWord.length).toBeLessThan(word.length + 1);
        }
    });
});
