import jsgraphs from 'js-graph-algorithms';
import TwoVector from 'lance/serialize/TwoVector';

export const WIDTH = 2000;
export const HEIGHT = 1200;

/**
 * Can be generated or loaded from the database
 */
export default class GameWorld {
    constructor(objects) {
        this.grid = new Grid();
        /**
         * Maps ids to objects
         */
        this.objects = {};

        for (const obj of objects) {
            this.update(obj);
        }
    }

    static generate() {
        let gameBounds = Bounds.fromDimensions(WIDTH, HEIGHT);
        let halfBounds = gameBounds.scale(0.48, 1);
        let { left, top, bottom, center: mazeBounds } = halfBounds.crop(
            0.25,
            1,
            0.3,
            0.7
        );

        const wallWidth = 20;
        const corridorWidth = 60;

        let maze = new Maze(mazeBounds, corridorWidth, wallWidth);
        let objects = maze.createWalls();
        objects.push(left.topWall(wallWidth));
        objects.push(left.bottomWall(wallWidth));
        objects.push(top.rightWall(wallWidth));
        objects.push(bottom.rightWall(wallWidth));

        // TODO: generate other connecting walls, objects
        return new GameWorld(objects);
    }

    getObjects() {
        return Object.values(this.objects);
    }

    /**
     *
     * @param {TwoVector} start
     * @param {TwoVector} end
     */
    pathfind(start, end) {
        // TODO
    }

    /**
     * Update the collision map for this object, or add it if it's not already added
     * @param {*} obj
     * @param {TwoVector} obj.position
     * @param {number} obj.width
     * @param {number} obj.height
     * @param {number} obj.id
     */
    update(obj) {
        let prev = this.objects[obj.id];
        if (prev) {
            this.grid.remove(prev);
        }
        this.objects[obj.id] = obj;
        this.grid.add(obj);
    }

    remove(obj) {
        this.grid.remove(obj);
        delete this.objects[obj.id];
    }
}

/**
 * Assumes origin (x,y) = (0,0) is in the upper left
 */
export class Grid {
    constructor(resolution = 1000) {
        this.resolution = resolution;
        this.grid = new Array(this.resolution * this.resolution);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = 0;
        }
    }

    /**
     * Translate `obj` to grid coordinates
     * @param {*} obj
     * @param {TwoVector} obj.position
     * @param {number} obj.width
     * @param {number} obj.height
     */
    *getIndices(obj) {
        let getX = (x) => Math.round(this.resolution * (x / WIDTH));
        let getY = (y) => Math.round(this.resolution * (y / HEIGHT));

        let width = getX(obj.width);
        let height = getY(obj.height);
        let left = getX(obj.position.x - obj.width / 2);
        let bottom = getY(obj.position.y - obj.height / 2);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                yield this.resolution * (left + x) + (bottom + y);
            }
        }
    }

    add(obj) {
        for (const index of this.getIndices(obj)) {
            this.grid[index]++;
        }
    }

    remove(obj) {
        for (const index of this.getIndices(obj)) {
            this.grid[index]--;
        }
    }
}

export class Bounds {
    constructor(xLo, xHi, yLo, yHi) {
        this.xLo = xLo;
        this.xHi = xHi;
        this.yLo = yLo;
        this.yHi = yHi;
    }

    static fromDimensions(x, y) {
        return new Bounds(0, x, 0, y);
    }

    getWidth() {
        return this.xHi - this.xLo;
    }

    getHeight() {
        return this.yHi - this.yLo;
    }

    scale(xScale, yScale) {
        return Bounds.fromDimensions(
            this.xLo + this.xHi * xScale,
            this.yLo + this.yHi * yScale
        );
    }

    asArray() {
        return [this.xLo, this.xHi, this.yLo, this.yHi];
    }

    subtractLeft(x) {
        this.xLo += x;
        return this;
    }

    subtractRight(x) {
        this.xHi -= x;
        return this;
    }

    topWall(wallWidth) {
        let center = new TwoVector(
            this.xLo + this.getWidth() / 2,
            this.yLo + wallWidth / 2
        );
        return {
            id: Math.random(),
            position: center,
            width: this.getWidth(),
            height: wallWidth
        };
    }

    rightWall(wallWidth) {
        let center = new TwoVector(
            this.xHi - wallWidth / 2,
            this.yLo + this.getHeight() / 2
        );
        return {
            id: Math.random(),
            position: center,
            width: wallWidth,
            height: this.getHeight()
        };
    }

    bottomWall(wallWidth) {
        let center = new TwoVector(
            this.xLo + this.getWidth() / 2,
            this.yHi - wallWidth / 2
        );
        return {
            id: Math.random(),
            position: center,
            width: this.getWidth(),
            height: wallWidth
        };
    }

    crop(xLo, xHi, yLo, yHi) {
        let left = xLo * this.xHi + this.xLo;
        let right = xHi * this.xHi + this.xLo;
        let bottom = yHi * this.yHi + this.yLo;
        let top = yLo * this.yHi + this.yLo;
        return {
            left: new Bounds(this.xLo, left, top, bottom),
            top: new Bounds(this.xLo, this.xHi, this.yLo, top),
            bottom: new Bounds(this.xLo, this.xHi, bottom, this.yHi),
            center: new Bounds(left, right, top, bottom)
        };
    }
}

export class Maze {
    constructor(bounds, corridorWidth, wallWidth) {
        this.bounds = bounds;
        this.corridorWidth = corridorWidth;
        this.wallWidth = wallWidth;

        let w = corridorWidth + wallWidth;
        let nCorridors = (dim) => Math.floor((dim - wallWidth) / w);

        /**
         * Number of columns (counting walls, not corridors)
         */
        let nCols = 1 + nCorridors(bounds.getWidth());
        let nRows = 1 + nCorridors(bounds.getHeight());

        // Scale corridor width so that it fits the vertical space
        this.corridorWidth =
            (bounds.getHeight() - wallWidth) / (nRows - 1) - wallWidth;

        // Adjust width to put extra space on the left
        let effectiveWidth =
            (this.corridorWidth + wallWidth) * (nCols - 1) + wallWidth;
        this.bounds.subtractLeft(this.bounds.getWidth() - effectiveWidth);

        this.graph = new MazeGraph(this, nCols, nRows);
    }

    /**
     * Map the abstract maze representation into game objects
     */
    createWalls() {
        return this.graph.getWallObjects();
    }
}

export class MazeGraph {
    constructor(maze, nCols, nRows) {
        this.maze = maze;
        /**
         * Number of columns (counting walls, not corridors)
         */
        this.nCols = nCols;
        this.nRows = nRows;

        this.graph = new jsgraphs.WeightedGraph(this.nCols * this.nRows);
    }

    *getNodes() {
        for (let i = 0; i < this.nRows; i++) {
            for (let j = 0; j < this.nCols; j++) {
                yield new MazeNode(this, i, j);
            }
        }
    }

    *getOuterWalls() {
        for (let i of [0, this.nRows - 1]) {
            for (let j = 0; j < this.nCols; j++) {
                yield new MazeNode(this, i, j);
            }
        }

        for (let j of [0, this.nCols - 1]) {
            for (let i = 0; i < this.nRows; i++) {
                yield new MazeNode(this, i, j);
            }
        }
    }

    getMazeNode(index) {
        let i = Math.floor(index / this.nCols);
        let j = index % this.nCols;
        return new MazeNode(this, i, j);
    }

    createWalls() {
        for (const node of this.getNodes()) {
            node.add();
        }
        this.addOpening(Math.floor(this.nRows / 2), this.nCols - 1);

        let kruskal = new jsgraphs.KruskalMST(this.graph);
        return kruskal.mst
            .filter(this.isEntrance())
            .map(
                (edge) =>
                    new MazeWall(
                        this.maze,
                        this.getMazeNode(edge.v),
                        this.getMazeNode(edge.w)
                    )
            );
    }

    getIndex(i, j) {
        return i * this.nCols + j;
    }

    isEntrance() {
        let upper = this.getIndex(this.nRows / 2, 0);
        let lower = this.getIndex(this.nRows / 2 + 1, 0);
        return (edge) => !(edge.v == upper && edge.w == lower);
    }

    getEdge(i, j, vertical = true) {
        let firstIndex = this.getIndex(i, j);
        let secondIndex = vertical
            ? this.getIndex(i + 1, j)
            : this.getIndex(i, j + 1);
        return this.graph.edge(firstIndex, secondIndex);
    }

    addOpening(i, j, vertical = true) {
        let edge = this.getEdge(i, j, vertical);
        edge.weight = 1000;
    }

    getWallObjects() {
        return this.createWalls().map((wall) => ({
            id: Math.random(),
            position: wall.getPosition(),
            width: wall.width,
            height: wall.height
        }));
    }
}

export class MazeWall {
    /**
     *
     * @param {Maze} maze
     * @param {MazeNode} start
     * @param {MazeNode} end
     */
    constructor(maze, start, end) {
        let width = end.j - start.j;
        let scale = maze.wallWidth + maze.corridorWidth;

        let isHorizonal = width == 1;

        this.width = isHorizonal ? scale : maze.wallWidth;
        this.height = isHorizonal ? maze.wallWidth : maze.corridorWidth;

        let xPadding = 0;
        let yPadding = isHorizonal
            ? maze.wallWidth / 2
            : maze.wallWidth + maze.corridorWidth / 2;

        this.start = new TwoVector(
            xPadding + maze.bounds.xLo + start.j * scale,
            yPadding + maze.bounds.yLo + start.i * scale
        );
        this.end = new TwoVector(this.start.x + this.width, this.start.y);
    }

    getPosition() {
        return this.getStart().add(new TwoVector(this.width / 2, 0));
    }

    getStart() {
        return this.start.clone();
    }

    getEnd() {
        return this.end.clone();
    }
}

export class MazeNode {
    constructor(mazeGraph, i, j) {
        this.mazeGraph = mazeGraph;
        this.i = i;
        this.j = j;
    }

    getIndex(i = 0, j = 0) {
        return (this.i + i) * this.mazeGraph.nCols + (this.j + j);
    }

    /**
     * Add randomly-weighted edges to bottom and right neighbors, if they exist
     */
    add() {
        if (!this.isRightWall()) {
            let weight = this.isHorizontalWall() ? 0 : Math.random() + 100;
            this.addRight(weight);
        }
        if (!this.isBottomWall()) {
            let weight = this.isVerticalWall() ? 0 : Math.random() + 100;
            this.addBottom(weight);
        }
    }

    isVerticalWall() {
        return this.j == 0 || this.isRightWall();
    }

    isBottomWall() {
        return this.i == this.mazeGraph.nRows - 1;
    }

    isRightWall() {
        return this.j == this.mazeGraph.nCols - 1;
    }

    isHorizontalWall() {
        return this.i == 0 || this.isBottomWall();
    }

    addRight(weight) {
        this.mazeGraph.graph.addEdge(
            new jsgraphs.Edge(this.getIndex(), this.getIndex(0, 1), weight)
        );
    }

    addBottom(weight) {
        this.mazeGraph.graph.addEdge(
            new jsgraphs.Edge(this.getIndex(), this.getIndex(1), weight)
        );
    }
}
