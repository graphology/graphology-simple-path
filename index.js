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

  var stack = [graph.outboundNeighbors(source)];
  var visited = StackSet.of(source);

  var paths = [];

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

      if (child === target)
        paths.push(visited.path(child));

      visited.push(child);

      if (!visited.has(target))
        stack.push(graph.outboundNeighbors(child));
      else
        visited.pop();
    }
  }

  return paths;
}

function allSimpleCycles(graph, source) {
  if (!isGraph(graph))
    throw new Error('graphology-simple-path: expecting a graphology instance.');

  if (!graph.hasNode(source))
    throw new Error('graphology-simple-path: expecting: could not find source node "' + source + '" in the graph.');

  var stack = [graph.outboundNeighbors(source)];
  var visited = StackSet.of('§SOURCE§');

  var target = source;

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

exports.allSimplePaths = allSimplePaths;
exports.allSimpleCycles = allSimpleCycles;
