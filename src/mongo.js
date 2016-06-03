import type {
  ConnectionCursor,
} from './connectiontypes';
import defineConnection from './define';
import {
  base64,
  unbase64,
  startsWith,
} from './util.js';


export type ID = string;

export type Document = {
  id: ID,
};


const PREFIX = 'mongo:';


function documentToCursor(doc: Document): ConnectionCursor {
  return base64(PREFIX + doc.id);
}


function cursorToDocument(cursor: ConnectionCursor): ?Document {
  const unbased = unbase64(cursor);
  if (startsWith(unbased, PREFIX)) {
    const id = unbased.substring(PREFIX.length);
    if (id) return {id};
  }
  return null;
}


function compareDocuments(doc1: Document, doc2: Document): number {
  if (doc1.id < doc2.id) {
    return -1;
  }
  if (doc1.id > doc2.id) {
    return 1;
  }
  return 0;
}


export default defineConnection({
  comparableToCursor: documentToCursor,
  cursorToComparable: cursorToDocument,
  comparator: compareDocuments,
});
