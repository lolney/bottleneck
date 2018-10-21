import { Grid, Bounds, Maze, MazeWall } from '../../src/server/GameWorld';
import { WIDTH, HEIGHT } from '../../src/config';
import TwoVector from 'lance/serialize/TwoVector';

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
        maze = new Maze(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);
    });

    it('correctly calculates the dimensions for a horizontal wall', () => {
        let wall = new MazeWall(maze, { i: 0, j: 0 }, { i: 0, j: 1 });

        expect(wall.getStart()).toEqual(new TwoVector(0, WALL_WIDTH / 2));
        expect(wall.getEnd()).toEqual(
            new TwoVector(CORRIDOR_WIDTH + WALL_WIDTH, WALL_WIDTH / 2)
        );

        expect(wall.getPosition()).toEqual(
            new TwoVector((CORRIDOR_WIDTH + WALL_WIDTH) / 2, WALL_WIDTH / 2)
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
        let maze = new Maze(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);

        let mg = maze.graph;

        expect(mg.nCols).toEqual(11);
        expect(mg.nRows).toEqual(11);
    });

    it('calculates nCols and nRows correctly with uneven bounds', () => {
        let maze = new Maze(Bounds.fromDimensions(20, 20), 8, 1);

        let mg = maze.graph;

        expect(mg.nCols).toEqual(3);
        expect(mg.nRows).toEqual(3);

        expect(maze.bounds.xLo).toEqual(0);
        expect(maze.corridorWidth).toEqual(8.5);
    });

    it('calculates nCols and nRows correctly with uneven dimensions', () => {
        let maze = new Maze(Bounds.fromDimensions(20, 21), 8, 1);

        let mg = maze.graph;

        expect(mg.nCols).toEqual(3);
        expect(mg.nRows).toEqual(3);

        expect(maze.bounds.xLo).toEqual(-1);
        expect(maze.corridorWidth).toEqual(9);
    });
});

describe('MazeNode', () => {
    let maze;

    beforeEach(() => {
        maze = new Maze(BOUNDS, CORRIDOR_WIDTH, WALL_WIDTH);
    });

    it('adds nodes iff they are in bounds', () => {
        for (const node of maze.graph.getNodes()) {
            node.add();
        }
        for (let i = 0; i < maze.graph.nCols; i++) {
            if (i == maze.graph.nCols - 1 || i == 0) {
                expect(maze.graph.graph.adj(i).length).toEqual(2);
            } else {
                expect(maze.graph.graph.adj(i).length).toEqual(3);
            }
        }
    });
});
