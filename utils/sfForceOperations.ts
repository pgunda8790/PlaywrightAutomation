import { getSFConnection } from './sfConnection';

// CREATE
export async function createRecord(objectName: string, data: object) {
  const conn = await getSFConnection();
  const result = await conn.sobject(objectName).create(data);
  console.log(`Created ${objectName} with Id: ${result.id}`);
  return result.id;
}

// READ (by Id)
export async function getRecord(objectName: string, id: string) {
  const conn = await getSFConnection();
  return await conn.sobject(objectName).retrieve(id);
}

// UPDATE
export async function updateRecord(objectName: string, id: string, data: object) {
  const conn = await getSFConnection();
  const result = await conn.sobject(objectName).update({ Id: id, ...data });
  console.log(`Updated ${objectName} Id: ${id}`);
  return result;
}

// DELETE
export async function deleteRecord(objectName: string, id: string) {
  const conn = await getSFConnection();
  const result = await conn.sobject(objectName).destroy(id);
  console.log(`Deleted ${objectName} Id: ${id}`);
  return result;
}

// UPSERT (insert if not exists, update if exists)
export async function upsertRecord(objectName: string, externalIdField: string, data: object) {
  const conn = await getSFConnection();
  const result = await conn.sobject(objectName).upsert(data, externalIdField);
  return result;
}