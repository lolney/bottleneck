import jsgraphs from 'js-graph-algorithms';
import TwoVector from 'lance/serialize/TwoVector';
import PF from 'pathfinding';
import { WIDTH, HEIGHT, Player } from '../config';
import logger from './Logger';

const wallWidth = 20;
const corridorWidth = 60;

/**
  @typedef worldObject
  @type {object}
  @property {number} id - used to track for pathfinding purposes.
  @property {TwoVector} position - world coordinates
  @property {number} width
  @property {number} height
  @property {string} type - wall or water; determines corresponding Avatar type 
 /

/**
 * Contains the list of blockable objects in the world
 * Can be generated or (@unimplemented) loaded from the database
 */
export default class GameWorld {
    constructor(objects, starts) {
        this.grid = new Grid(100);
        this.starts = starts;
        /**
         * Maps ids to objects
         */
        this.objects = {};

        for (const obj of objects) {
            this.update(obj);
        }
        this.grid.print();

        this.pathFinder = new PF.AStarFinder();
    }

    static getResourceBounds() {
        let gameBounds = Bounds.fromDimensions(WIDTH, HEIGHT);
        let halfBounds = gameBounds.scale(0.48, 1);

        let { left, top, bottom, center: mazeBounds } = halfBounds.crop(
            0.25,
            1,
            0.3,
            0.7
        );
        return top;
    }

    static generate() {
        const centerRadius = 0.02;
        let gameBounds = Bounds.fromDimensions(WIDTH, HEIGHT);
        let { left: halfBounds, center: centerBounds } = gameBounds.crop(
            0.5 - centerRadius,
            0.5 + centerRadius,
            0,
            1
        );
        let objects = [];

        let { left, top, bottom, center: mazeBounds } = halfBounds.crop(
            0.25,
            1,
            0.3,
            0.7
        );

        let maze = new Maze(mazeBounds, corridorWidth, wallWidth);
        objects.push(left.topWall(wallWidth));
        objects = objects.concat(maze.createWalls());
        objects.push(top.rightWall(wallWidth));
        objects.push(bottom.rightWall(wallWidth));
        objects = [left.bottomWall(wallWidth)].concat(objects);

        let mirror = (pos) => new TwoVector(WIDTH - pos.x, pos.y);
        let start = left.getCenter();

        let mirrored = objects.map((obj) => ({
            ...obj,
            id: Math.random(),
            position: mirror(obj.position)
        }));
        objects = objects.concat(mirrored);
        objects.push(centerBounds.asObject());

        // TODO: generate other connecting walls, objects
        return new GameWorld(objects, [start, mirror(start)]);
    }

    getStartingPosition(playerId) {
        logger.debug(
            `start for player ${playerId}: `,
            this.starts[playerId % this.starts.length]
        );
        return this.starts[playerId % this.starts.length].clone();
    }

    getObjects() {
        return Object.values(this.objects);
    }

    /**
     *
     * @param {TwoVector} start
     * @param {TwoVector} end
     */
    pathfind(mapStart, mapEnd) {
        logger.debug(
            'start x,y, end x,y',
            mapStart.x,
            mapStart.y,
            mapEnd.x,
            mapEnd.y
        );
        let start = this.grid.worldCoordsToCell(mapStart);
        let end = this.grid.worldCoordsToCell(mapEnd);

        logger.debug('grid start x,y, end x,y', start.x, start.y, end.x, end.y);
        if (this.grid.isOccupied(end)) {
            this.grid.print([end]);
            logger.warning('end tile is unreachable');
            return [];
        }

        let grid = new PF.Grid(this.grid.to2DArray());

        let path = this.pathFinder.findPath(
            start.x,
            start.y,
            end.x,
            end.y,
            grid
        );
        this.grid.print([start, end], path);
        return path
            .map((coords) => this.grid.cellToWorldCoords(coords))
            .map((coords) => `${coords[0]},${coords[1]}`);
    }

    /**
     * Update the collision map for this object, or add it if it's not already added
     * @param {worldObject} obj
     * @param {TwoVector} obj.position
     * @param {number} obj.width
     * @param {number} obj.height
     * @param {number} obj.id
     */
    update(obj) {
        let paddingX = Player.width / 2;
        let paddingY = Player.height / 2;

        let prev = this.objects[obj.id];
        if (prev) {
            this.grid.remove(prev, paddingX, paddingY);
        }
        this.objects[obj.id] = obj;
        this.grid.add(obj, paddingX, paddingY);
    }

    remove(obj) {
        let paddingX = Player.width / 2;
        let paddingY = Player.height / 2;

        this.grid.remove(obj, paddingX, paddingY);
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
    *getIndices(obj, paddingX = 0, paddingY = 0) {
        let getX = (x) => Math.round(this.resolution * (x / WIDTH));
        let getY = (y) => Math.round(this.resolution * (y / HEIGHT));

        let width = getX(obj.width + paddingX);
        let height = getY(obj.height + paddingY);
        let left = getX(obj.position.x - obj.width / 2 - paddingX);
        let bottom = getY(obj.position.y - obj.height / 2 - paddingY);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                yield this.getIndex(left + x, bottom + y);
            }
        }
    }

    getIndex(x, y) {
        return this.resolution * y + x;
    }

    print(coords = [], path = []) {
        let step = this.resolution / 100;

        let strs = [];
        for (let x = 0; x < this.resolution; x += step) {
            let str = [];
            for (let y = 0; y < this.resolution; y += step) {
                str.push(this.grid[x * this.resolution + y].toString());
            }
            strs.push(str);
        }

        for (const coord of path) {
            strs[Math.floor(coord[1] / step)][Math.floor(coord[0] / step)] =
                'o';
        }

        for (const coord of coords) {
            strs[Math.floor(coord.y / step)][Math.floor(coord.x / step)] = 'x';
        }

        for (const str of strs) {
            logger.debug(str.join(''));
        }
    }

    worldCoordsToCell(worldCoords) {
        let x = worldCoords.x % WIDTH;
        let y = worldCoords.y % HEIGHT;
        return new TwoVector(
            Math.floor(this.resolution * (x / WIDTH)),
            Math.floor(this.resolution * (y / HEIGHT))
        );
    }

    cellToWorldCoords(cell) {
        return [
            (cell[0] * WIDTH) / this.resolution,
            (cell[1] * HEIGHT) / this.resolution
        ];
    }

    /**
     * Return an array of columns as arrays
     */
    to2DArray() {
        let outArray = new Array(this.resolution);
        for (let x = 0; x < this.resolution; x++) {
            let start = x * this.resolution;
            outArray[x] = this.grid.slice(start, start + this.resolution);
        }
        return outArray;
    }

    add(obj, paddingX = 0, paddingY = 0) {
        for (const index of this.getIndices(obj, paddingX, paddingY)) {
            this.grid[index]++;
        }
    }

    isOccupied(coords) {
        return this.grid[this.getIndex(coords.x, coords.y)] != 0;
    }

    remove(obj, paddingX = 0, paddingY = 0) {
        for (const index of this.getIndices(obj, paddingX, paddingY)) {
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

    getCenter() {
        let center = (lo, hi) => lo + (hi - lo) / 2;
        return new TwoVector(
            center(this.xLo, this.xHi),
            center(this.yLo, this.yHi)
        );
    }

    mirror(x) {
        return new Bounds(
            2 * x - this.xHi,
            2 * x - this.xLo,
            this.yLo,
            this.yHi
        );
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

    /**
     * @returns {worldObject}
     */
    asObject() {
        return {
            id: Math.random(),
            position: this.getCenter(),
            width: this.getWidth(),
            height: this.getHeight(),
            type: 'water'
        };
    }

    subtractLeft(x) {
        this.xLo += x;
        return this;
    }

    subtractRight(x) {
        this.xHi -= x;
        return this;
    }

    /**
     * @returns {worldObject}
     */
    topWall(wallWidth) {
        let center = new TwoVector(
            this.xLo + this.getWidth() / 2,
            this.yLo + wallWidth / 2
        );
        return {
            id: Math.random(),
            position: center,
            width: this.getWidth(),
            height: wallWidth,
            type: 'wall'
        };
    }

    /**
     * @returns {worldObject}
     */
    rightWall(wallWidth) {
        let center = new TwoVector(
            this.xHi - wallWidth / 2,
            this.yLo + this.getHeight() / 2
        );
        return {
            id: Math.random(),
            position: center,
            width: wallWidth,
            height: this.getHeight(),
            type: 'wall'
        };
    }

    /**
     * @returns {worldObject}
     */
    bottomWall(wallWidth) {
        let center = new TwoVector(
            this.xLo + this.getWidth() / 2,
            this.yHi - wallWidth / 2
        );
        return {
            id: Math.random(),
            position: center,
            width: this.getWidth(),
            height: wallWidth,
            type: 'wall'
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
        if (nCols < 3 || nRows < 3) {
            throw new TypeError(
                `nCols and nRows must be at least 3, but are ${nCols}, ${nRows}`
            );
        }
        this.maze = maze;
        /**
         * Number of columns (counting walls, not corridors)
         */
        this.nCols = nCols;
        this.nRows = nRows;

        this.graph = new jsgraphs.WeightedGraph(this.nCols * this.nRows);
        for (const node of this.getNodes()) {
            node.add();
        }
        this.addOpening(Math.floor(this.nRows / 2), this.nCols - 1);
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
        let { i, j } = this.getIJFromIndex(index);
        return new MazeNode(this, i, j);
    }

    getIJFromIndex(index) {
        return {
            i: Math.floor(index / this.nCols),
            j: index % this.nCols
        };
    }

    /**
     * Create walls, sorted by z-order
     */
    createWallEdges() {
        let kruskal = new jsgraphs.KruskalMST(this.graph);
        let root = TreeEdge.createRecursive(this, kruskal.mst);
        root.determineIndex(0);

        return root
            .traverse()
            .filter(this.isNotEntrance())
            .sort((a, b) => a.index - b.index);
    }

    createWalls() {
        return this.createWallEdges().map(
            (edge) =>
                new MazeWall(
                    this.maze,
                    this.getMazeNode(this.getIndex(edge.start.i, edge.start.j)),
                    this.getMazeNode(this.getIndex(edge.end.i, edge.end.j))
                )
        );
    }

    getIndex(i, j) {
        return i * this.nCols + j;
    }

    isNotEntrance() {
        let left = this.getIndex(Math.floor(this.nRows / 2), 0);
        let lower = this.getIndex(this.nRows - 1, Math.floor(this.nCols / 2));
        let upper = this.getIndex(0, Math.floor(this.nCols / 2));
        return (edge) =>
            [left, lower, upper].reduce(
                (accum, entrance) =>
                    accum && this.getIndex(edge.end.i, edge.end.j) != entrance,
                true
            );
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

    /**
     * @returns {worldObject[]}
     */
    getWallObjects() {
        return this.createWalls().map((wall) => ({
            id: Math.random(),
            position: wall.getPosition(),
            width: wall.width,
            height: wall.height,
            type: 'wall'
        }));
    }
}

/**
 * A representation of the graph corresponding to the walls of the maze,
 * used to determine the z-index of walls (@property {TreeEdge.index})
 */
export class TreeEdge {
    constructor(edge, mazeGraph) {
        if (mazeGraph && edge) {
            this.start = mazeGraph.getIJFromIndex(edge.v);
            this.end = mazeGraph.getIJFromIndex(edge.w);
        }
        this.neighbors = [];
        this.index = null;
    }

    static createRecursive(mazeGraph, edges) {
        let root = new TreeEdge(edges[0], mazeGraph);
        let visited = {};
        visited[TreeEdge.serializeEdge(edges[0])] = root;
        root.create(mazeGraph, edges[0], visited, new Set(edges));
        return root;
    }

    traverse() {
        let visited = new Set();
        let result = [this];
        let _traverse = (edge) => {
            for (const neighbor of edge.neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    result.push(neighbor);
                    _traverse(neighbor);
                }
            }
        };
        _traverse(this);
        return result;
    }

    /**
     * @private
     */
    static serializeEdge(edge) {
        return `${edge.v},${edge.w}`;
    }

    /**
     * @private
     */
    create(mazeGraph, edge, visited, edges) {
        let getNeighborsFrom = (node) => {
            let nearNeighbors = mazeGraph.graph.adj(node);
            nearNeighbors = nearNeighbors == undefined ? [] : nearNeighbors;
            return nearNeighbors.filter((e) => edge != e);
        };

        let farNeighbors = getNeighborsFrom(edge.w);
        let nearNeighbors = getNeighborsFrom(edge.v);
        let neighbors = nearNeighbors.concat(farNeighbors);

        for (const neighbor of neighbors) {
            let serialized = TreeEdge.serializeEdge(neighbor);
            if (edges.has(neighbor)) {
                let neighborObj = visited[serialized];
                if (!neighborObj) {
                    neighborObj = new TreeEdge(neighbor, mazeGraph);
                    visited[serialized] = neighborObj;
                    neighborObj.create(mazeGraph, neighbor, visited, edges);
                }
                this.neighbors.push(neighborObj);
            }
        }
    }

    determineIndex() {
        let visited = new Set([this]);

        let _determineIndex = (index, edge) => {
            edge.index = index;
            for (const neighbor of edge.neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    let relativeIndex = edge.determineRelativeIndex(neighbor);
                    _determineIndex(index + relativeIndex, neighbor);
                }
            }
        };

        _determineIndex(0, this);
    }

    isVertical() {
        return this.start.j == this.end.j;
    }

    neighborIsBelow(neighbor) {
        let mine = [this.start.i, this.end.i];
        let theirs = [neighbor.start.i, neighbor.end.i];
        for (const a of mine) {
            for (const b of theirs) {
                if (a < b) {
                    return true;
                }
            }
        }
        return false;
    }

    hasVerticalNeighborBelow() {
        for (const neighbor of this.neighbors) {
            if (neighbor.isVertical() && this.neighborIsBelow(neighbor)) {
                return true;
            }
        }
        return false;
    }

    determineRelativeIndex(neighbor) {
        let edge = this;
        if (neighbor.isVertical() == edge.isVertical()) {
            return 0;
        } else {
            if (edge.isVertical()) {
                if (
                    edge.neighborIsBelow(neighbor) &&
                    !edge.hasVerticalNeighborBelow()
                ) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                if (
                    !edge.hasVerticalNeighborBelow() &&
                    !edge.neighborIsBelow(neighbor)
                ) {
                    return -1;
                } else {
                    return 1;
                }
            }
        }
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

        this.width = isHorizonal ? scale + maze.wallWidth : maze.wallWidth;
        this.height = isHorizonal ? maze.wallWidth : scale + maze.wallWidth;

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
