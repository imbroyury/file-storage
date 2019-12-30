export default class WSConnectionsStorage {
    constructor(keepAliveDuration, terminationInterval) {
        this._connections = {};

        // every ${terminationInterval} ms terminate all stale connections based on ${keepAliveDuration}
        setInterval(() => this._cleanStaleConnections(keepAliveDuration), terminationInterval);
    }

    _cleanStaleConnections(keepAliveDuration) {
        const entries = Object.entries(this._connections);
        entries.forEach(entry => {
            const currentDate = Date.now();
            const [id, { lastActivity }] = entry;
            if (currentDate - lastActivity > keepAliveDuration) {
                this.terminateConnection(id);
            };
        });
    }

    addConnection(connectionId, connection) {
        this._connections[connectionId] = {
            lastActivity: Date.now(),
            _connection: connection,
        };
    }

    sendMessageToConnection(connectionId, message) {
        const connection = this._connections[connectionId];
        if (connection) {
            connection._connection.send(message);
        }
    }

    updateLastActivity(connectionId) {
        const connection = this._connections[connectionId];
        if (connection) {
            connection.lastActivity = Date.now();
        }
    }

    terminateConnection(connectionId) {
        const connection = this._connections[connectionId];
        if (connection) {
            connection._connection.terminate();
            delete this._connections[connectionId];
        }
    }
}