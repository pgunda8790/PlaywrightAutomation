import { createConnection } from '../utils/sfConnection';
import { getQuery } from './sfConnection';

export async function getRecord(query: string) {
  const result = await getQuery(query);
  return result;
}

/*
// CREATE
export async function createRecord(objectName: string, data: object) {
  const conn = await getSFConnection();
  if (!conn) throw new Error('❌ Salesforce connection is null');
  const result = await conn.sobject(objectName).create(data);
  console.log(`Created ${objectName} with Id: ${result.id}`);
  return result.id;
}





// UPDATE
export async function updateRecord(objectName: string, id: string, data: object) {
  const conn = await getSFConnection();
  if (!conn) throw new Error('❌ Salesforce connection is null');
  const result = await conn.sobject(objectName).update({ Id: id, ...data });
  console.log(`Updated ${objectName} Id: ${id}`);
  return result;
}

// DELETE
export async function deleteRecord(objectName: string, id: string) {
  const conn = await getSFConnection();
  if (!conn) throw new Error('❌ Salesforce connection is null');
  const result = await conn.sobject(objectName).destroy(id);
  console.log(`Deleted ${objectName} Id: ${id}`);
  return result;
}

// UPSERT

*/