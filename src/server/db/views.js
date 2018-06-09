import GameObject from './models/gameObject';
import Problem from './models/problem';

// Return all game objects (future: within x bounds)
export function objects() {
    return GameObject.findAll();
}

// Get problem for this game object
export function problem(objId) {
    return GameObject.find({ where: { id: objId }, include: [Problem] });
}
