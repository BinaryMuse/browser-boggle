var app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

app = angular.module('boggle', []);

app.constant('BOGGLE_DICE', ['aaafrs'.split(''), 'aaeeee'.split(''), 'aafirs'.split(''), 'adennn'.split(''), 'aeeeem'.split(''), 'aeegmu'.split(''), 'aegmnn'.split(''), 'afirsy'.split(''), 'bjkqxz'.split(''), 'ccenst'.split(''), 'ceiilt'.split(''), 'ceilpt'.split(''), 'ceipst'.split(''), 'ddhnot'.split(''), 'dhhlor'.split(''), 'dhlnor'.split(''), 'dhlnor'.split(''), 'eiiitt'.split(''), 'emottt'.split(''), 'ensssu'.split(''), 'fiprsy'.split(''), 'gorrvw'.split(''), 'iprrry'.split(''), 'nootuw'.split(''), 'ooottu'.split('')]);

app.value('fisherYates', function(arr) {
  var i, j, _ref;
  arr = angular.copy(arr);
  i = arr.length;
  if (i === 0) {
    return false;
  }
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    _ref = [arr[j], arr[i]], arr[i] = _ref[0], arr[j] = _ref[1];
  }
  return arr;
});

app.filter('slice', function() {
  return function(arr, start, end) {
    if (arr == null) {
      arr = [];
    }
    return arr.slice(start, end);
  };
});

app.filter('capitalize', function() {
  return function(str) {
    if (str == null) {
      str = "";
    }
    return str[0].toUpperCase() + str.slice(1, str.length);
  };
});

app.factory('dictionary', function($q, $http) {
  var d, dictionary;
  d = $q.defer();
  dictionary = new Trie();
  dictionary.promise = d.promise;
  $http.get('data.json').success(function(data) {
    dictionary.data = data;
    return d.resolve(dictionary);
  });
  return dictionary;
});

app.factory('Game', function(BOGGLE_DICE, dictionary, fisherYates, $timeout) {
  var Cell, Game;
  Cell = (function() {
    function Cell(row, col, letter) {
      this.row = row;
      this.col = col;
      this.letter = letter;
      this.isAdjacent = __bind(this.isAdjacent, this);
      this.isEqual = __bind(this.isEqual, this);
    }

    Cell.prototype.isEqual = function(row, col) {
      return row === this.row && col === this.col;
    };

    Cell.prototype.isAdjacent = function(row, col) {
      if (this.isEqual(row, col)) {
        return false;
      }
      if (Math.abs(row - this.row) <= 1 && Math.abs(col - this.col) <= 1) {
        return true;
      }
      return false;
    };

    return Cell;

  })();
  return Game = (function() {
    function Game() {
      this.onGameOver = __bind(this.onGameOver, this);
      this.gameOver = __bind(this.gameOver, this);
      this.totalScore = __bind(this.totalScore, this);
      this.scoreWord = __bind(this.scoreWord, this);
      this.lastMove = __bind(this.lastMove, this);
      this.adjacent = __bind(this.adjacent, this);
      this.currentWord = __bind(this.currentWord, this);
      this.isSelected = __bind(this.isSelected, this);
      this.select = __bind(this.select, this);
      this.submitWord = __bind(this.submitWord, this);
      this.timer = null;
      this.submitting = false;
      this.plays = [];
      this.selected = [];
      this.gameOverCallbacks = [];
      this.dice = fisherYates(BOGGLE_DICE).map(function(letters) {
        var letter;
        letter = letters[Math.floor(Math.random() * letters.length)];
        if (letter === 'q') {
          return 'qu';
        } else {
          return letter;
        }
      });
    }

    Game.prototype.submitWord = function() {
      var score, word,
        _this = this;
      word = this.currentWord();
      score = this.scoreWord(word);
      this.submitting = true;
      return $timeout((function() {
        _this.plays.push({
          word: word,
          points: score
        });
        _this.selected = [];
        return _this.submitting = false;
      }), 250);
    };

    Game.prototype.select = function(row, col) {
      if (this.timer == null) {
        this.timer = setTimeout(this.gameOver, 30 * 1000);
      }
      if (this.selected.length === 0 || (this.adjacent(row, col) && !this.isSelected(row, col))) {
        return this.selected.push(new Cell(row, col, this.dice[row * 5 + col]));
      } else if (this.lastMove().isEqual(row, col)) {
        return this.selected.pop();
      }
    };

    Game.prototype.isSelected = function(row, col) {
      var cell, _i, _len, _ref;
      _ref = this.selected;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (cell.isEqual(row, col)) {
          return true;
        }
      }
      return false;
    };

    Game.prototype.currentWord = function() {
      return this.selected.map(function(cell) {
        return cell.letter.toLowerCase();
      }).join('');
    };

    Game.prototype.adjacent = function(row, col) {
      return this.lastMove().isAdjacent(row, col);
    };

    Game.prototype.lastMove = function() {
      return this.selected[this.selected.length - 1];
    };

    Game.prototype.scoreWord = function(word) {
      if (dictionary.find(word) === Trie.MATCH) {
        switch (word.length) {
          case 1:
            return 0;
          case 2:
            return 0;
          case 3:
            return 1;
          case 4:
            return 1;
          case 5:
            return 2;
          case 6:
            return 3;
          case 7:
            return 5;
          default:
            return 11;
        }
      } else {
        return -1;
      }
    };

    Game.prototype.totalScore = function() {
      var play, score, _i, _len, _ref;
      score = 0;
      _ref = this.plays;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        play = _ref[_i];
        score += play.points;
      }
      return score;
    };

    Game.prototype.gameOver = function() {
      var callback, _i, _len, _ref, _results;
      _ref = this.gameOverCallbacks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback());
      }
      return _results;
    };

    Game.prototype.onGameOver = function(cb) {
      return this.gameOverCallbacks.push(cb);
    };

    return Game;

  })();
});

app.controller('BoggleController', function($scope, dictionary, Game) {
  $scope.page = 'loading';
  $scope.game = new Game();
  dictionary.promise.then(function() {
    return $scope.page = 'index';
  });
  return $scope.startGame = function() {
    $scope.game.onGameOver(function() {
      return $scope.page = 'gameOver';
    });
    return $scope.page = 'game';
  };
});
