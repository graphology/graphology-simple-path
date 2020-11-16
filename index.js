/**
 * Graphology Simple Path
 * =======================
 *
 * Functions related to simple paths to be used with graphology.
 */
var isGraph = require('graphology-utils/is-graph');

/**
 * A StackSet helper class.
 */
function StackSet() {
  this.set = new Set();
  this.stack = [];
  this.size = 0;
}

StackSet.prototype.has = function(value) {
  return this.set.has(value);
};

// NOTE: we don't check earlier existence because we don't need to
StackSet.prototype.push = function(value) {
  this.stack.push(value);
  this.set.add(value);
  this.size++;
};

StackSet.prototype.pop = function() {
  this.set.delete(this.stack.pop());
  this.size--;
};

StackSet.prototype.path = function(value) {
  return this.stack.concat(value);
};

StackSet.of = function(value) {
  var set = new StackSet();
  set.push(value);

  return set;
};

/**
 * A RecordStackSet helper class.
 */
function RecordStackSet() {
  this.set = new Set();
  this.stack = [];
  this.size = 0;
}

RecordStackSet.prototype.has = function(value) {
  return this.set.has(value);
};

// NOTE: we don't check earlier existence because we don't need to
RecordStackSet.prototype.push = function(record) {
  this.stack.push(record);
  this.set.add(record[1]);
  this.size++;
};

RecordStackSet.prototype.pop = function() {
  this.set.delete(this.stack.pop()[1]);
  this.size--;
};

RecordStackSet.prototype.path = function(record) {
  return this.stack.slice(1).map(function(r) {
    return r[0];
  }).concat(record[0]);
};

RecordStackSet.of = function(value) {
  var set = new RecordStackSet();
  set.push([null, value]);

  return set;
};

/**
 * Function returning all the paths between source & target in the graph.
 *
 * @param  {Graph}  graph  - Target graph.
 * @param  {string} source - Source node.
 * @param  {string} target - Target node.
 * @return {array}         - The found paths.
 */
function allSimplePaths(graph, source, target) {
  if (!isGraph(graph))
    throw new Error('graphology-simple-path: expecting a graphology instance.');

  if (!graph.hasNode(source))
    throw new Error('graphology-simple-path: expecting: could not find source node "' + source + '" in the graph.');

  if (!graph.hasNode(target))
    throw new Error('graphology-simple-path: expecting: could not find target node "' + target + '" in the graph.');

  source = '' + source;
  target = '' + target;

  var cycle = source === target;

  var stack = [graph.outboundNeighbors(source)];
  var visited = StackSet.of(cycle ? '§SOURCE§' : source);

  var paths = [],
      p;

  var children, child;

  while (stack.length !== 0) {
    children = stack[stack.length - 1];
    child = children.pop();

    if (!child) {
      stack.pop();
      visited.pop();
    }

    else {
      if (visited.has(child))
        continue;

      if (child === target) {
        p = visited.path(child);

        if (cycle)
          p[0] = source;

        paths.push(p);
      }

      visited.push(child);

      if (!visited.has(target))
        stack.push(graph.outboundNeighbors(child));
      else
        visited.pop();
    }
  }

  return paths;
}

/**
 * Helpers used to collect edges with their targets.
 */
function collectEdges(graph, source) {
  var records = [];

  graph.forEachOutboundEdge(source, function(edge, attr, ext1, ext2) {
    records.push([edge, source === ext1 ? ext2 : ext1]);
  });

  return records;
}

/**
 * Function returning all the edge paths between source & target in the graph.
 *
 * @param  {Graph}  graph  - Target graph.
 * @param  {string} source - Source node.
 * @param  {string} target - Target node.
 * @return {array}         - The found paths.
 */
function allSimpleEdgePaths(graph, source, target) {
  if (!isGraph(graph))
    throw new Error('graphology-simple-path: expecting a graphology instance.');

  if (!graph.hasNode(source))
    throw new Error('graphology-simple-path: expecting: could not find source node "' + source + '" in the graph.');

  if (!graph.hasNode(target))
    throw new Error('graphology-simple-path: expecting: could not find target node "' + target + '" in the graph.');

  source = '' + source;
  target = '' + target;

  var cycle = source === target;

  var stack = [collectEdges(graph, source)];
  var visited = RecordStackSet.of(cycle ? '§SOURCE§' : source);

  var paths = [],
      p;

  var record, children, child;

  while (stack.length !== 0) {
    children = stack[stack.length - 1];
    record = children.pop();

    if (!record) {
      stack.pop();
      visited.pop();
    }
    else {
      child = record[1];

      if (visited.has(child))
        continue;

      if (child === target) {
        p = visited.path(record);

        // if (cycle)
        //   p[0] = source;

        paths.push(p);
      }

      visited.push(record);

      if (!visited.has(target))
        stack.push(collectEdges(graph, child));
      else
        visited.pop();
    }
  }

  return paths;
}

exports.allSimplePaths = allSimplePaths;
exports.allSimpleEdgePaths = allSimpleEdgePaths;
