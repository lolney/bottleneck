import { canAfford } from '../../src/react-app/common/resources';

describe('canAfford', () => {
    it('returns false when the cost of at least one resource > resource count', () => {
        const resources = {
            wood: 0,
            stone: 10
        };

        expect(canAfford(resources, { wood: 10, stone: 0 })).toBe(false);
        expect(canAfford(resources, { wood: 10, stone: 10 })).toBe(false);
    });

    it('returns false when missing resources in the cost', () => {
        const cost = {
            wood: 0,
            stone: 10
        };

        expect(canAfford({ wood: 10 }, cost)).toBe(false);
        expect(canAfford({ stone: 10 }, cost)).toBe(true);
    });

    it('does not consider extra resources', () => {
        const resources = {
            wood: 0,
            stone: 10
        };

        expect(canAfford(resources, { wood: 10 })).toBe(false);
        expect(canAfford(resources, { stone: 10 })).toBe(true);
    });

    it('returns true when meeting or exceeding the cost', () => {
        const cost = {
            wood: 0,
            stone: 10
        };

        expect(canAfford({ wood: 0, stone: 10 }, cost)).toBe(true);
        expect(canAfford({ wood: 0, stone: 20 }, cost)).toBe(true);
        expect(canAfford({ wood: 10, stone: 100 }, cost)).toBe(true);
        expect(canAfford({ wood: '10', stone: '100' }, cost)).toBe(true);
    });
});
