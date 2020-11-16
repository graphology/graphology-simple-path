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

function getSchema(multi) {
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
  graph.addEdge('Project', 'Status', {label: 'status'});
  graph.addEdge('Project', 'Task', {label: 'tasks'});
  graph.addEdge('Project', 'Comment', {label: 'comments'});
  graph.addEdge('Task', 'Status', {label: 'status'});
  graph.addEdge('Task', 'Media', {label: 'media'});
  graph.addEdge('Task', 'Draft', {label: 'drafts'});
  graph.addEdge('Task', 'Task', {label: 'subTasks'});
  graph.addEdge('Task', 'Comment', {label: 'comments'});
  graph.addEdge('Draft', 'Draft_2', {label: 'draft_2'});
  graph.addEdge('Draft_2', 'Draft_3', {label: 'draft_3a'});
  graph.addEdge('Draft_2', 'Comment', {label: 'comment_short'});
  graph.addEdge('Draft_3', 'Comment', {label: 'comments'});
  graph.addEdge('Comment', 'Task', {label: 'commentTasks'});

  if (multi) {
    graph.addEdge('Task', 'Comment', {label: 'privateComments'});
    graph.addEdge('Draft_2', 'Draft_3', {label: 'draft_3b'});
  }

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
    var graph = getSchema();

    var paths = lib.allSimplePaths(graph, 'Project', 'Comment');

    assertSamePaths(paths, [
      ['Project', 'Comment'],
      ['Project', 'Task', 'Comment'],
      ['Project', 'Task', 'Draft', 'Draft_2', 'Comment'],
      ['Project', 'Task', 'Draft', 'Draft_2', 'Draft_3', 'Comment']
    ]);

    var cycles = lib.allSimplePaths(graph, 'Task', 'Task');

    assertSamePaths(cycles, [
      ['Task', 'Comment', 'Task'],
      ['Task', 'Task'],
      ['Task', 'Draft', 'Draft_2', 'Comment', 'Task'],
      ['Task', 'Draft', 'Draft_2', 'Draft_3', 'Comment', 'Task']
    ]);
  });

  it('should work with a multigraph.', function() {
    var graph = new Graph.MultiDirectedGraph();

    graph.addNode(0);
    graph.addNode(1);
    graph.addNode(2);

    for (var i = 0; i < 2; i++) {
      graph.addEdge(0, 1);
      graph.addEdge(0, 2);
      graph.addEdge(1, 0);
      graph.addEdge(1, 2);
      graph.addEdge(2, 0);
      graph.addEdge(2, 1);
    }

    assert.strictEqual(graph.size, 6 * i);

    var paths = lib.allSimplePaths(graph, 0, 1);

    assertSamePaths(paths, [
      ['0', '1'],
      ['0', '2', '1']
    ]);

    graph.edges('1', '2').forEach(function(edge) {
      graph.dropEdge(edge);
    });

    var paths = lib.allSimplePaths(graph, 0, 1);

    assertSamePaths(paths, [
      ['0', '1']
    ]);
  });
});
