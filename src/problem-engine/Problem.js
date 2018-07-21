export default class Problem {
    constructor(id, subproblem, name) {
        this.id = id;
        this.subproblem = subproblem;
        this.name = name;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getSubproblemString() {
        return this.subproblem;
    }

    getTitle() {
        return 'Title';
    }

    getDescription() {
        return 'Description';
    }

    getStartingCode() {
        return '() => {return 0};';
    }

    getTypeString() {
        return 'generic';
    }

    /**
     * Abstract method; when implemented, expected to return a promise
     */
    serialize() {
        return {
            title: this.getTitle(),
            description: this.getDescription(),
            code: this.getStartingCode(),
            type: this.getTypeString(),
            id: this.getId()
        };
    }
}
