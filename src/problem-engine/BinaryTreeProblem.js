import Problem from './Problem';

export default class BinaryTreeProblem extends Problem {
    constructor(id) {
        super(id, null, 'Inorder traversal');
    }

    getTitle() {
        return 'Inorder Traversal';
    }

    getDescription() {
        return 'Do an inorder traversal of `tree`, returning the results as an array.';
    }

    getStartingCode() {
        return '(tree) => [];';
    }

    getTypeString() {
        return 'btree';
    }

    static getTrees() {
        return [
            [5, '-', [3, '-', [2, '-', [1, '-', 0]]]],
            [
                10,
                [5, [3, 2, 4], [8, 7, 9]],
                [15, [12, '-', 14], [18, 19, [20, 21, [22, 23, 24]]]]
            ],
            (() => {
                let nestedRight = (i) => {
                    if (i <= 1) return [1, 0, '-'];
                    else return [i, nestedRight(i - 1), '-'];
                };
                return nestedRight(15);
            })(),
            (() => {
                let assign = (current, next) => {
                    if (current % 2) return [current, next, '-'];
                    else return [current, '-', next];
                };
                let alternating = (i) => {
                    if (i <= 1) return assign(1, 0);
                    else return assign(i, alternating(i - 1));
                };
                return alternating(8);
            })()
        ];
    }

    getTestCases() {
        let traverse = (node) => {
            let result = [];
            let _traverse = (node) => {
                if (Array.isArray(node)) {
                    _traverse(node[1]);
                    result.push(node[0]);
                    _traverse(node[2]);
                } else if (typeof node == 'number') result.push(node);
            };
            _traverse(node);
            return result;
        };
        return BinaryTreeProblem.getTrees().map((tree) => ({
            tree: tree,
            solution: traverse(tree)
        }));
    }

    async serialize() {
        return {
            ...super.serialize(),
            testCases: this.getTestCases()
        };
    }
}
