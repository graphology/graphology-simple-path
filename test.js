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

function getSimpleSchema() {
  var graph = new Graph.DirectedGraph();

  // Nodes
  graph.addNode('Project');
  graph.addNode('Status');
  graph.addNode('Task');
  graph.addNode('Media');
  graph.addNode('Draft');
  graph.addNode('Draft_2');
  graph.addNode('Draft_3');
  graph.addNode('Comment');

  // Edges
  graph.addEdge('Project', 'Status', {name: 'status'});
  graph.addEdge('Project', 'Task', {name: 'tasks'});
  graph.addEdge('Project', 'Comment', {name: 'comments'});
  graph.addEdge('Task', 'Status', {name: 'status'});
  graph.addEdge('Task', 'Media', {name: 'media'});
  graph.addEdge('Task', 'Draft', {name: 'drafts'});
  graph.addEdge('Task', 'Task', {name: 'subTasks'});
  graph.addEdge('Task', 'Comment', {name: 'comments'});
  // graph.addEdge('Task', 'Comment', {name: 'privateComments'});
  graph.addEdge('Draft', 'Draft_2', {name: 'draft_2'});
  graph.addEdge('Draft_2', 'Draft_3', {name: 'draft_3a'});
  // graph.addEdge('Draft_2', 'Draft_3', {name: 'draft_3b'});
  graph.addEdge('Draft_2', 'Comment', {name: 'comment_short'});
  graph.addEdge('Draft_3', 'Comment', {name: 'comments'});
  graph.addEdge('Comment', 'Task', {name: 'commentTasks'});

  return graph;
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

  it('should work with an example.', function() {
    var graph = getSimpleSchema();

    var paths = lib.allSimplePaths(graph, 'Project', 'Comment');

    assertSamePaths(paths, [
      ['Project', 'Comment'],
      ['Project', 'Task', 'Comment'],
      ['Project', 'Task', 'Draft', 'Draft_2', 'Comment'],
      ['Project', 'Task', 'Draft', 'Draft_2', 'Draft_3', 'Comment']
    ]);
  });
});
