import { ObjectId } from 'bson';
import { ConnectionCursor } from './connectionTypes';
import { defineConnection } from './defineConnection';
import { base64, startsWith, unbase64 } from './util';

export type ID = string;

export interface ComparableDoc {
  _id: ObjectId;
}

const PREFIX = 'mongoose:';

export const documentToCursor = (doc: ComparableDoc): ConnectionCursor =>
  base64(PREFIX + doc._id.toHexString());

export const cursorToDocument = (
  cursor: ConnectionCursor
): ComparableDoc | null => {
  const unbased = unbase64(cursor);
  if (startsWith(unbased, PREFIX)) {
    const id = unbased.substring(PREFIX.length);
    if (id && ObjectId.isValid(id)) {
      return { _id: ObjectId.createFromHexString(id) };
    }
  }
  return null;
};

export const compareDocuments = (
  doc1: ComparableDoc,
  doc2: ComparableDoc
): number => {
  const id1 = doc1._id.toHexString();
  const id2 = doc2._id.toHexString();
  if (id1 < id2) {
    return -1;
  }
  if (id1 > id2) {
    return 1;
  }
  return 0;
};

export const {
  connectionFromArray,
  connectionFromPromisedArray,
} = defineConnection({
  comparableToCursor: documentToCursor,
  cursorToComparable: cursorToDocument,
  comparator: compareDocuments,
});
