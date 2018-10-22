import Instance from './Instance';

const MAX_QUEUE_LENGTH = 2;

export default class MatchMaker {
    constructor(io) {
        this.reset();
        io.on('connection', this.onPlayerConnected.bind(this));
    }

    reset() {
        this.queuedPlayers = [];
        this.instance = new Instance();
    }

    finalize(instance) {
        console.log('Enough players have joined. Starting the game.');
        for (const socket of this.queuedPlayers) {
            socket.removeListener('disconnect', socket.onPlayerDisconnected);
            socket.onPlayerDisconnected = null;
            // If waiting until this point to connect players,
            // must handle authentication differently.
            // this.instance.onPlayerConnected(socket);
        }
        // TODO: handle completed instance
        this.reset();
    }

    onPlayerDisconnected(index) {
        return () => this.queuedPlayers.splice(index, 1);
    }

    onPlayerConnected(socket) {
        let qp = this.queuedPlayers;

        if (qp.length < MAX_QUEUE_LENGTH) {
            let listener = this.onPlayerDisconnected(qp.length);
            socket.on('disconnect', listener);
            socket.onPlayerDisconnected = listener;
            this.queuedPlayers.push(socket);
            this.instance.onPlayerConnected(socket);
        } else {
            throw new Error('Too many players in queue: ', qp.length);
        }

        console.log('Player joined the queue. Queue length: ', qp.length);
        if (qp.length == MAX_QUEUE_LENGTH) {
            this.finalize(this.instance);
        }
    }
}
