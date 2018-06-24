import models from './models';
//import TwoVector from 'lance/serialize/TwoVector';
// not sure why we can't import TwoVector here

function destructure(obj) {
    let dv = obj.dataValues;
    return {
        position: [dv.location.coordinates[0], dv.location.coordinates[1]],
        dbId: dv.id,
        objectType: dv.objectType
    };
}

// Return all game objects (future: within x bounds)
export async function objects() {
    let raw = await models.gameObject.findAll();
    return raw.map((raw_elem) => destructure(raw_elem));
}

// Get problem for this game object
export async function problem(objId) {
    let obj = await models.gameObject.find({
        where: { id: objId },
        include: [models.problem]
    });
    return obj.problem;
}
