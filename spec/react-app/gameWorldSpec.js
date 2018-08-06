import { Grid, WIDTH, HEIGHT } from '../../src/server/GameWorld';
import TwoVector from 'lance/serialize/TwoVector';

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

    it('does okay with an object that is small compared to the grid', () => {
        let grid = new Grid(100);
        let obj = {
            position: new TwoVector(WIDTH / 128, HEIGHT / 2),
            width: WIDTH / 64,
            height: HEIGHT
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
            position: new TwoVector(WIDTH / 8, HEIGHT / 2),
            width: WIDTH / 4,
            height: HEIGHT
        };

        let obj2 = {
            position: new TwoVector((5 * WIDTH) / 8, HEIGHT / 2),
            width: (3 * WIDTH) / 4,
            height: HEIGHT
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
