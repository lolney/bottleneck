export let randomInt = (minimum, maximum) =>
    Math.floor(Math.random() * (maximum - minimum)) + minimum;

/**
 * Given range arguments range_1, ..., range_n, choose range_i uniformly at random.
 * Then, choose an integer uniformly at random from the range [range_i[0], range_i[1])
 * @param  {...Array<number>} ranges
 */
export function randomInRanges(...ranges) {
    let rangeIndex = randomInt(0, ranges.length);
    let range = ranges[rangeIndex];
    if (range.length != 2) {
        throw new TypeError(`Expected array of length 2; got ${range}`);
    }
    return randomInt(range[0], range[1]);
}
