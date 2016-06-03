/**
 * Helper to get an empty connection.
 */
function emptyConnection() {
  return {
    count: 0,
    edges: [],
    pageInfo: {
      startCursor: null,
      endCursor: null,
      hasPreviousPage: false,
      hasNextPage: false
    }
  };
}

const PREFIX = 'connection.';

function base64(i) {
  return ((new Buffer(i, 'ascii')).toString('base64'));
}

function unbase64(i) {
  return ((new Buffer(i, 'base64')).toString('ascii'));
}

/**
 * Creates the cursor string from an offset.
 */
function idToCursor(id) {
  return base64(PREFIX + id);
}

/**
 * Rederives the offset from the cursor string.
 */
function cursorToId(cursor) {
  return unbase64(cursor).substring(PREFIX.length);
}

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 */
function getId(cursor) {
  if (cursor === undefined || cursor === null) {
    return null;
  }

  return cursorToId(cursor);
}

/**
 * Returns a connection based on a graffitiModel
 */
async function connectionFromModel(graffitiModel, args, context, info) {
  const Collection = graffitiModel.model;
  if (!Collection) {
    return emptyConnection();
  }

  const {before, after, first, last, id, orderBy = {_id: 1}, ...selector} = args;

  const begin = getId(after);
  const end = getId(before);

  const offset = (first - last) || 0;
  const limit = last || first;

  if (id) {
    selector.id = id;
  }

  if (begin) {
    selector._id = selector._id || {};
    selector._id.$gt = begin;
  }

  if (end) {
    selector._id = selector._id || {};
    selector._id.$lt = end;
  }

  const result = await getList(Collection, selector, {
    limit,
    skip: offset,
    sort: orderBy
  }, context, info);
  const count = await getCount(Collection, selector);

  if (result.length === 0) {
    return emptyConnection();
  }

  const edges = result.map((value) => ({
    cursor: idToCursor(value._id),
    node: value
  }));

  const firstElement = await getFirst(Collection);
  return {
    count,
    edges,
    pageInfo: {
      startCursor: edges[0].cursor,
      endCursor: edges[edges.length - 1].cursor,
      hasPreviousPage: cursorToId(edges[0].cursor) !== firstElement._id.toString(),
      hasNextPage: result.length === limit
    }
  };
}
