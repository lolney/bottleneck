import {
    Grid,
    Bounds,
    Maze,
    MazeWall,
    TreeEdge,
    MazeGraph,
    WaterBuilder
} from '../../src/server/GameWorld';
import { WIDTH, HEIGHT } from '../../src/config';
import TwoVector from 'lance/serialize/TwoVector';
import jsgraphs from 'js-graph-algorithms';

const BOUNDS = Bounds.fromDimensions(510, 510);
const CORRIDOR_WIDTH = 40;
const WALL_WIDTH = 10;

describe('Grid', () => {
    it('returns correct indices for an object spanning the game world', () => {
        let grid = new Grid(100);
        let obj = {
            position: new TwoVector(WIDTH / 2, HEIGHT / 2),
            width: WIDTH,
            height: HEIGHT
        };
        let i = 0;
        for (const index of grid.getIndices(obj)) {
            expect(index).toEqual(i++);
        }

        expect(i).toEqual(100 * 100);
    });

    it('returns correct indices for an object spanning the middle of the world', () => {
        let grid = new Grid(100);
        let obj = {
            position: new TwoVector(WIDTH / 2, HEIGHT / 2),
            width: WIDTH / 2,
            height: HEIGHT / 2
        };

        let i = 0;
        for (const index of grid.getIndices(obj)) {
            expect(index).toBeLessThan(7500);
            expect(index).toBeGreaterThan(2500);
            i++;
        }

        expect(i).toEqual(50 * 50);
    });

    it('correctly converts worldCoordsToCell', () => {
        let grid = new Grid(1000);
        grid.worldCoordsToCell(new TwoVector(3880, 600));
    });

    it('does okay with an object that is small compared to the grid', () => {
        let grid = new Grid(100);
        let obj = {
            position: new TwoVector(WIDTH / 2, HEIGHT / 128),
            width: WIDTH,
            height: HEIGHT / 64
        };

        let i = 0;
        for (const index of grid.getIndices(obj)) {
            expect(index).toEqual(i++);
        }

        let target = Math.round(10000 / 64);

        expect(i).toBeLessThan(target + 100);
        expect(i).toBeGreaterThan(target - 100);
    });

    it('left fourth set to 1 when added', () => {
        let grid = new Grid(100);
        let obj1 = {
            position: new TwoVector(WIDTH / 2, HEIGHT / 8),
            width: WIDTH,
            height: HEIGHT / 4
        };

        let obj2 = {
            position: new TwoVector(WIDTH / 2, (5 * HEIGHT) / 8),
            width: WIDTH,
            height: (3 * HEIGHT) / 4
        };

        grid.add(obj1);

        let i = 0;
        for (const index of grid.getIndices(obj1)) {
            expect(index).toEqual(i++);
            expect(grid.grid[index]).toEqual(1);
        }

        for (const index of grid.getIndices(obj2)) {
            expect(grid.grid[index]).toEqual(0);
        }

        grid.remove(obj1);
        for (const index of grid.getIndices(obj1)) {
            expect(grid.grid[index]).toEqual(0);
        }
    });
});

describe('MazeWall', () => {
    let maze;

    beforeEach(() => {
        maze = Maze.create(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);
    });

    it('correctly calculates the dimensions for a horizontal wall', () => {
        let wall = new MazeWall(maze, { i: 0, j: 0 }, { i: 0, j: 1 });

        expect(wall.getStart()).toEqual(new TwoVector(0, WALL_WIDTH / 2));
        expect(wall.getEnd()).toEqual(
            new TwoVector(CORRIDOR_WIDTH + WALL_WIDTH * 2, WALL_WIDTH / 2)
        );

        expect(wall.getPosition()).toEqual(
            new TwoVector((CORRIDOR_WIDTH + WALL_WIDTH * 2) / 2, WALL_WIDTH / 2)
        );
    });

    it('correctly calculates the dimensions for a vertical wall', () => {
        let wall = new MazeWall(maze, { i: 0, j: 0 }, { i: 1, j: 0 });

        expect(wall.getStart()).toEqual(
            new TwoVector(0, WALL_WIDTH + CORRIDOR_WIDTH / 2)
        );

        expect(wall.getEnd()).toEqual(
            new TwoVector(WALL_WIDTH, WALL_WIDTH + CORRIDOR_WIDTH / 2)
        );

        expect(wall.getPosition()).toEqual(
            new TwoVector(WALL_WIDTH / 2, WALL_WIDTH + CORRIDOR_WIDTH / 2)
        );
    });
});

describe('Maze', () => {
    it('calculates nCols and nRows correctly', () => {
        let maze = Maze.create(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);

        let mg = maze.createMazeGraph();

        expect(mg.nCols).toEqual(11);
        expect(mg.nRows).toEqual(11);
    });

    it('calculates nCols and nRows correctly with uneven bounds', () => {
        let maze = Maze.create(Bounds.fromDimensions(20, 20), 8, 1);

        let mg = maze.createMazeGraph();

        expect(mg.nCols).toEqual(3);
        expect(mg.nRows).toEqual(3);

        expect(maze.bounds.xLo).toEqual(0);
        expect(maze.corridorWidth).toEqual(8.5);
    });

    it('calculates nCols and nRows correctly with uneven dimensions', () => {
        let maze = Maze.create(Bounds.fromDimensions(20, 21), 8, 1);

        let mg = maze.createMazeGraph();

        expect(mg.nCols).toEqual(3);
        expect(mg.nRows).toEqual(3);

        expect(maze.bounds.xLo).toEqual(-1);
        expect(maze.corridorWidth).toEqual(9);
    });
});

describe('MazeNode', () => {
    let maze;

    beforeEach(() => {
        maze = Maze.create(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);
    });

    it('adds nodes iff they are in bounds', () => {
        let graph = maze.createMazeGraph();
        for (let i = 0; i < graph.nCols; i++) {
            if (i == graph.nCols - 1 || i == 0) {
                expect(graph.graph.adj(i).length).toEqual(2);
            } else {
                expect(graph.graph.adj(i).length).toEqual(3);
            }
        }
    });
});

describe('WaterBuilder', () => {
    let maze;
    let bounds;
    let builder;

    const width = 10;

    beforeAll(() => {
        bounds = new Bounds(BOUNDS.xHi, BOUNDS.xHi + width, 0, BOUNDS.yHi);
        maze = Maze.create(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);
        builder = new WaterBuilder(bounds, maze);
    });

    it('calcs center of water block properly', () => {
        let pos = builder.calcDummyCenter();

        expect(pos.x).toEqual(bounds.getCenter().x);
        expect(pos.y).toBeLessThan((3 * maze.bounds.yHi) / 4);
        expect(pos.y).toBeGreaterThan((1 * maze.bounds.yLo) / 4);
    });

    it('properly creates the water blocks', () => {
        for (const block of builder.createWaterBlocks()) {
            expect(block.width).toEqual(width);
            expect(block.height).toEqual(CORRIDOR_WIDTH);
            expect(block.type).toEqual('siegeItem');
            expect(block.playerNumber).toEqual(0);
            expect(block.collected).toEqual(false);
            expect(block.dbId).toEqual(jasmine.any(String));
            expect(block.objectType).toEqual(jasmine.any(String));
            expect(block.behaviorType).toEqual(jasmine.any(String));
        }
    });

    it('properly calc water block positions', () => {
        const positions = builder.waterBlockPositions();

        for (const pos of positions) {
            expect(pos.y).toBeLessThan(builder.bounds.getHeight());
            expect(pos.y).toBeGreaterThan(0);
        }
    });

    it('all water block positions are unique', () => {
        const positions = builder.waterBlockPositions();
        const seen = new Set();

        for (const pos of positions) {
            expect(seen.has(pos.y)).toBe(false);

            seen.add(pos.y);
        }
    });
});

describe('TreeEdge', () => {
    let mazeGraph;
    let kruskal;

    beforeAll(() => {
        let maze = new Maze(null, null, null, 3, 3);
        mazeGraph = new MazeGraph(maze, 3, 3);
        kruskal = new jsgraphs.KruskalMST(mazeGraph.graph);
    });

    it('is properly created', async () => {
        let root = TreeEdge.createRecursive(mazeGraph, kruskal.mst);

        expect(root).not.toBe(null);
        expect(root.neighbors.length).not.toEqual(0);

        let list = root.traverse();

        expect(list.length).toBeGreaterThan(2);
        expect(list.length).toBeLessThan(12);
    });

    it('after determining index, all indices are set', async () => {
        let root = TreeEdge.createRecursive(mazeGraph, kruskal.mst);
        root.determineIndex();
        let list = root.traverse();

        for (const elem of list) {
            expect(elem.index).not.toBe(null);
        }
    });

    it('can create walls', async () => {
        let walls = mazeGraph.createWallEdges();

        expect(walls.length).toBeGreaterThan(2);
        expect(walls.length).toBeLessThan(12);
        for (const elem of walls) {
            expect(elem.index).not.toBe(null);
        }
    });

    it('t-intersection: vertical sits below', async () => {
        let root = new TreeEdge();
        root.start = { i: 0, j: 0 };
        root.end = { i: 0, j: 1 };

        let rightTop = new TreeEdge();
        rightTop.start = { i: 0, j: 1 };
        rightTop.end = { i: 0, j: 2 };

        let vert = new TreeEdge();
        vert.start = { i: 0, j: 1 };
        vert.end = { i: 1, j: 1 };

        let leftBottom = new TreeEdge();
        leftBottom.start = { i: 1, j: 1 };
        leftBottom.end = { i: 1, j: 0 };

        let rightBottom = new TreeEdge();
        rightBottom.start = { i: 1, j: 1 };
        rightBottom.end = { i: 1, j: 2 };

        root.neighbors = [rightTop, vert];
        rightTop.neighbors = [vert, root];
        vert.neighbors = [rightTop, root, leftBottom, rightBottom];
        leftBottom.neighbors = [vert, rightBottom];
        rightBottom.neighbors = [leftBottom, vert];

        root.determineIndex();

        expect(root.index).toEqual(0);
        expect(rightTop.index).toEqual(0);
        expect(vert.index).toEqual(1);
        expect(leftBottom.index).toEqual(2);
        expect(rightBottom.index).toEqual(2);
    });

    it('L-intersection, starting from below', async () => {
        let root = new TreeEdge();
        root.start = { i: 1, j: 1 };
        root.end = { i: 1, j: 0 };

        let vert = new TreeEdge();
        vert.start = { i: 1, j: 0 };
        vert.end = { i: 0, j: 0 };

        root.neighbors = [vert];
        vert.neighbors = [root];

        root.determineIndex();

        expect(root.index).toEqual(0);
        expect(vert.index).toEqual(-1);
    });

    it('L-intersection, starting from above', async () => {
        let root = new TreeEdge();
        root.start = { i: 1, j: 1 };
        root.end = { i: 1, j: 0 };

        let vert = new TreeEdge();
        vert.start = { i: 1, j: 0 };
        vert.end = { i: 0, j: 0 };

        root.neighbors = [vert];
        vert.neighbors = [root];

        vert.determineIndex();

        expect(root.index).toEqual(1);
        expect(vert.index).toEqual(0);
    });

    it('tau-intersection, starting from below', async () => {
        let root = new TreeEdge();
        root.start = { i: 1, j: 1 };
        root.end = { i: 0, j: 1 };

        let horiz = new TreeEdge();
        horiz.start = { i: 0, j: 1 };
        horiz.end = { i: 0, j: 0 };

        root.neighbors = [horiz];
        horiz.neighbors = [root];

        root.determineIndex();

        expect(root.index).toEqual(0);
        expect(horiz.index).toEqual(-1);
    });

    it('c-intersection, starting from above', async () => {
        let root = new TreeEdge();
        root.start = { i: 0, j: 1 };
        root.end = { i: 0, j: 0 };

        let vert = new TreeEdge();
        vert.start = { i: 0, j: 0 };
        vert.end = { i: 1, j: 0 };

        let horiz = new TreeEdge();
        horiz.start = { i: 1, j: 0 };
        horiz.end = { i: 1, j: 1 };

        root.neighbors = [vert];
        vert.neighbors = [horiz, root];
        horiz.neighbors = [vert];

        root.determineIndex();

        expect(root.index).toEqual(0);
        expect(vert.index).toEqual(1);
        expect(horiz.index).toEqual(2);
    });
});
