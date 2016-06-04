# graphql-relay-connection
A GraphQL Relay connection with custom cursor functions.
Can be used for MongoDB, Mongoose, plain objects, scalars, or any data formats.


### Install
```
npm install --save graphql-relay-connection
```

### Usage
`mongooseConnection` is predefined for you.
For other usage, scroll down to `Custom connection` section below.
```javascript
import {
  connectionDefinitions,
  connectionArgs,
} from 'graphql-relay';

import {mongooseConnection} from 'graphql-relay-connection';

const {
  connectionFromPromisedArray,
  cursorToDocument,
} = mongooseConnection;

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    friends: {
      type: UserConnection,
      args: connectionArgs,
      resolve: (user, args) => {
        args.first = args.first || 10;
        const doc = cursorToDocument(args.after);
        const friends = User.find({
            isFriendWith: user._id,
            _id: {$gt: doc && doc._id},
          })
          .limit(args.first + 1) // add +1 for hasNextPage
          .exec()
        return connectionFromPromisedArray(friends, args);
      },
    },
  }),
});

const {
  connectionType: UserConnection,
} = connectionDefinitions({
  nodeType: UserType,
});
```

### Custom connection
Simply provide `{
  comparableToCursor,
  cursorToComparable,
  comparator
}` to `defineConnection`.

```javascript
import defineConnection from 'graphql-relay-connection';
import {
  base64,
  unbase64,
} from './util';

const PREFIX = 'number:';

// Given a comparable value, return a string cursor.
function numberToCursor(num) {
  return base64(PREFIX + num);
}

// Given a string cursor,
// return a comparable value for the comparator function.
function cursorToNumber(cursor) {
  const num = parseInt(unbase64(cursor).substring(PREFIX.length), 10);
  return isNaN(num) ? null : num;
}

// Sort function for array.sort().
// Given two values, return an interger.
function compareNumbers(num1, num2) {
  return num1 - num2;
}

const {
  connectionFromArray,
  connectionFromPromisedArray,
} = defineConnection({
  comparableToCursor: numberToCursor,
  cursorToComparable: cursorToNumber,
  comparator: compareNumbers,
});
```

### How mongoose connection is defined
```javascript
import type {
  ConnectionCursor,
} from './connectionTypes';
import defineConnection from './defineConnection';
import {
  base64,
  unbase64,
  startsWith,
} from './util';


export type ID = string;

export type Document = {
  id: ID,
};


const PREFIX = 'mongoose:';


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


const {
  connectionFromArray,
  connectionFromPromisedArray,
} = defineConnection({
  comparableToCursor: documentToCursor,
  cursorToComparable: cursorToDocument,
  comparator: compareDocuments,
});


export {
  compareDocuments,
  connectionFromArray,
  connectionFromPromisedArray,
  cursorToDocument,
  documentToCursor,
};
```
