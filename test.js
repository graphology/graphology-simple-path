/**
 * Graphology Utils Unit Tests
 * ============================
 */
var assert = require('assert'),
    Graph = require('graphology'),
    complete = require('graphology-generators/classic/complete');

var lib = require('./');

function stringifyPath(p) {
  return p.join('§');
}

function assertSamePaths(A, B) {
  assert.deepStrictEqual(
    new Set(A.map(stringifyPath)),
    new Set(B.map(stringifyPath))
  );
}

describe('graphology-simple-path', function() {
  it('should throw if given invalid arguments.', function() {
    assert.throws(function() {
      lib.allSimplePaths(null);
    }, /graphology/);

    assert.throws(function() {
      var graph = new Graph();
      lib.allSimplePaths(graph, 'test');
    }, /source/);

    assert.throws(function() {
      var graph = new Graph();
      graph.addNode('mary');
      lib.allSimplePaths(graph, 'mary', 'test');
    }, /target/);
  });

  it('should work properly.', function() {
    var graph = complete(Graph.UndirectedGraph, 4);

    var paths = lib.allSimplePaths(graph, '0', '3');

    assertSamePaths(paths, [
      ['0', '3'],
      ['0', '2', '3'],
      ['0', '2', '1', '3'],
      ['0', '1', '3'],
      ['0', '1', '2', '3']
    ]);
  });
});
