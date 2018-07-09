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

    serialize() {
        return {
            title: this.getTitle(),
            description: this.getDescription(),
            code: this.getStartingCode(),
            type: this.getTypeString()
        };
    }
}
