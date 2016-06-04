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
      resolve: (user, args) => connectionFromPromisedArray(
        User.find({
          isFriendWith: user._id,
          _id: {$gt: new ObjectId(cursorToDocument(args.after).id)},
        })
          .limit(args.first + 1) // add +1 for hasNextPage
          .exec(),
        args
      ),
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
