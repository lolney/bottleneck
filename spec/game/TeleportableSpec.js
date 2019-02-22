import { Teleportable } from '../../src/common/WallAvatar';
import TwoVector from 'lance/serialize/TwoVector';

describe('Teleportable', () => {
    let wall;
    const width = 20;
    const height = 100;

    beforeAll(() => {
        wall = { position: new TwoVector(0, 0), width, height };
    });

    describe('getCollidingEdge', () => {
        const testEdge = (edge, diffVector) => {
            const player = {
                position: wall.position.clone().add(diffVector)
            };

            const teleportable = new Teleportable(wall, edge);
            const result = teleportable.getCollidingEdge(player);

            expect(result).toEqual(edge);
        };

        it('returns x when on the x side of a x object', () => {
            [
                { edge: 'LEFT', diffVector: new TwoVector(-width, 0) },
                { edge: 'RIGHT', diffVector: new TwoVector(width, 0) },
                { edge: 'TOP', diffVector: new TwoVector(0, -height) },
                { edge: 'BOTTOM', diffVector: new TwoVector(0, height) }
            ].forEach(({ edge, diffVector }) => testEdge(edge, diffVector));
        });

        it('when two edges exist, return the correct one', () => {
            const player = {
                position: wall.position.clone().add(new TwoVector(-width, 0))
            };

            const teleportable = new Teleportable(wall, 'LEFT');
            teleportable.addDirection('RIGHT');

            const result = teleportable.getCollidingEdge(player);

            expect(result).toEqual('LEFT');
        });
    });

    describe('handleTeleport', () => {
        it('sets position correctly when should teleport', () => {
            const player = {
                position: wall.position.clone().add(new TwoVector(-width, 0))
            };

            const teleportable = new Teleportable(wall, 'LEFT');
            teleportable.handleTeleport(player);

            expect(player.position).toEqual(
                wall.position.clone().add(new TwoVector(width, 0))
            );
        });
    });
});
