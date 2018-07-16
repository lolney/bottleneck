export default class Problem {
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
            type: this.getTypeString()
        };
    }
}
