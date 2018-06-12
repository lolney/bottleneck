import models from './models';
import TwoVector from 'lance/serialize/TwoVector';

function destructure(obj) {
    let dv = obj.dataValues;
    return {
        position: new TwoVector(
            dv.location.coordinates[0],
            dv.location.coordinates[1]
        ),
        id: dv.id,
        objectType: dv.objectType
    };
}

// Return all game objects (future: within x bounds)
export async function objects() {
    let raw = await models.gameObject.findAll();
    return raw.map((raw_elem) => destructure(raw_elem));
}

// Get problem for this game object
export function problem(objId) {
    return models.gameObject.find({
        where: { id: objId },
        include: [models.problem]
    });
}
