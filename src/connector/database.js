import queries from './queries.js';

export async function querySet(db, queryname, args = []) {
    // console.log(queries[queryname]);
    return await db.run(queries[queryname], args);
}

export async function queryGet(db, queryname, args = []) {
    return await db.all(queries[queryname], args);
}

export async function queryGetOnce(db, queryname, args = []) {
    return await db.get(queries[queryname], args);
}