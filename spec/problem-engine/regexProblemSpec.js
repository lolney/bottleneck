import RegexProblem, {
    RegexProblemGenerator
} from '../../src/problem-engine/RegexProblem';
import { regexes } from '../../stories/fixtures';
import weighted from 'weighted';

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

            const { targetWords } = RegexProblemGenerator.generate(regex, n);

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

describe('MergeRandom', () => {
    const createArrays = (n) => {
        const array1 = [];
        const array2 = [];

        for (let i = 0; i < n * 2; i++) {
            const array = weighted.select([array1, array2], [0.5, 0.5]);
            array.push(Math.random());
        }

        return { array1, array2 };
    };

    it('merges two arrays', () => {
        const length = 100;

        const { array1, array2 } = createArrays(length);

        const concated = array1.concat(array2);
        const merged = RegexProblemGenerator.mergeRandom(array1, array2);

        expect(merged.length).toBe(length * 2);
        expect(new Set(merged)).toEqual(new Set(concated));
    });

    it('a particular slot in the merged array is equally likely to contain an element from the first array as the second', () => {
        const nIters = 1000;
        // stdev of binomial dist
        const stdev = Math.sqrt(nIters * 0.5 * 0.5);

        // count of elements in the first slot from the first array
        let firstCount = 0;
        for (let iter = 0; iter < nIters; iter++) {
            const n = 100;
            const array1 = [];
            const array2 = [];

            for (let i = 0; i < n; i++) {
                array1[i] = i;
                array2[i] = n + i;
            }

            const merged = RegexProblemGenerator.mergeRandom(array1, array2);
            if (merged[0] < n) {
                firstCount++;
            }
        }

        console.log(stdev);

        expect(firstCount).toBeLessThan(nIters / 2 + stdev * 4);
        expect(firstCount).toBeGreaterThan(nIters / 2 - stdev * 4);
    });
});
