var Traverser,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Traverser = (function() {
  function Traverser(minWordLength, grid, trie) {
    this.minWordLength = minWordLength;
    this.grid = grid;
    this.trie = trie;
    this.visited = __bind(this.visited, this);
    this.adjacentCells = __bind(this.adjacentCells, this);
    this.traverse = __bind(this.traverse, this);
    this.search = __bind(this.search, this);
    this.completionCallbacks = [];
  }

  Traverser.prototype.onComplete = function(callback) {
    return this.completionCallbacks.push(callback);
  };

  Traverser.prototype.search = function(callback) {
    var cb, col, row, _fn, _i, _j, _k, _len, _ref, _results,
      _this = this;
    for (row = _i = 0; _i <= 4; row = ++_i) {
      _fn = function(row, col) {
        return _this.traverse([[row, col]], callback);
      };
      for (col = _j = 0; _j <= 4; col = ++_j) {
        _fn(row, col);
      }
    }
    _ref = this.completionCallbacks;
    _results = [];
    for (_k = 0, _len = _ref.length; _k < _len; _k++) {
      cb = _ref[_k];
      _results.push(cb());
    }
    return _results;
  };

  Traverser.prototype.traverse = function(explored, callback) {
    var adj, last, letters, match, newExplored, sq, tile, word, _i, _len, _results,
      _this = this;
    last = explored[explored.length - 1];
    letters = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = explored.length; _i < _len; _i++) {
        tile = explored[_i];
        _results.push(this.grid[tile[0]][tile[1]]);
      }
      return _results;
    }).call(this);
    word = letters.join('');
    match = this.trie.find(word);
    if (match === Trie.MATCH && explored.length >= this.minWordLength) {
      callback(word, explored);
    }
    if (match !== Trie.NO_MATCH) {
      adj = this.adjacentCells(last[0], last[1]);
      adj = adj.filter(function(pair) {
        return !_this.visited(pair, explored);
      });
      if (adj.length > 0) {
        _results = [];
        for (_i = 0, _len = adj.length; _i < _len; _i++) {
          sq = adj[_i];
          newExplored = explored.concat([[sq[0], sq[1]]]);
          _results.push(this.traverse(newExplored, callback));
        }
        return _results;
      }
    }
  };

  Traverser.prototype.adjacentCells = function(row, col) {
    var adj, c, r, _i, _j, _len, _len1, _ref, _ref1;
    adj = [];
    _ref = [row - 1, row, row + 1];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      r = _ref[_i];
      if (r < 0 || r > 4) {
        continue;
      }
      _ref1 = [col - 1, col, col + 1];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        c = _ref1[_j];
        if (c < 0 || c > 4) {
          continue;
        }
        if (!(r === row && c === col)) {
          adj.push([r, c]);
        }
      }
    }
    return adj;
  };

  Traverser.prototype.visited = function(search, visited) {
    var pair, _i, _len;
    for (_i = 0, _len = visited.length; _i < _len; _i++) {
      pair = visited[_i];
      if (search[0] === pair[0] && search[1] === pair[1]) {
        return true;
      }
    }
    return false;
  };

  return Traverser;

})();
