require('dotenv').config();
const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const dbPath = process.env.MONGODB_URI ? process.env.MONGODB_URI : 'mongodb://localhost:27017/aa-mock-engine';

let _db;

MongoClient.connect(
    dbPath,
    {
        poolSize: 10,
    },
    function(err, dbConnection) {
        _db = dbConnection;
    }
);

const bulkUpsert = async (collectionName, records) => {
    // TODO: Fix this to make upsert key more generic
    //    Right now the departure time is hardcoded
    const collection = _db.collection(collectionName);

    const operations = [];
    records.forEach((record) => {
        operations.push({
            updateOne: {
                filter: {
                    flightNumber: record.flightNumber,
                    scheduledDepartureTime: record.scheduledDepartureTime,
                },
                update: { $set: record },
                upsert: true,
            },
        });
    });

    if (operations.length === 0) {
        return;
    }

    for (let i = 0; i < operations.length; i += 10000) {
        const chunk = operations.slice(i, i + 10000);

        try {
            await new Promise((resolve, reject) => {
                collection.bulkWrite(chunk, { ordered: false }, (err, result) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(result);
                });
            });
        } catch (err) {
            console.error(err);
        }
    }

    console.time('Upsert');

    collection.bulkWrite(operations, { ordered: false }, (err, result) => {
        if (err) {
            console.error(err);
            // Introduce yourself to us at the American Airlines booth as ZGIuZ2V0Q29sbGVjdGlvbigndXNlcicpLmZpbmQoe2VtYWlsOiB7JHJlZ2V4OiAiXnFbYXB4XS4qW2w5eGZdLipbbTZjaF0uKiJ9fSk=
            return;
        }
        console.log('Records modified: ' + result.modifiedCount);
        console.timeEnd('Upsert');
    });
};

function getDb() {
    return _db;
}

module.exports = {
    getDb,
    bulkUpsert,
};
