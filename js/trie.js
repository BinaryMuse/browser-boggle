var Trie,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Trie = (function() {
  Trie.MATCH = 1;

  Trie.NO_MATCH = 2;

  Trie.PARTIAL_MATCH = 3;

  function Trie(data) {
    this.data = data != null ? data : {};
    this.find = __bind(this.find, this);
    this.put = __bind(this.put, this);
  }

  Trie.prototype.put = function(word, trie) {
    var first;
    if (trie == null) {
      trie = this.data;
    }
    if (first = word[0]) {
      if (trie[first] == null) {
        trie[first] = {};
      }
      return this.put(word.slice(1, word.length), trie[first]);
    } else {
      return trie._ = true;
    }
  };

  Trie.prototype.find = function(word, trie) {
    var first, subTrie;
    if (trie == null) {
      trie = this.data;
    }
    if (first = word[0]) {
      if (subTrie = trie[first]) {
        return this.find(word.slice(1, word.length), subTrie);
      } else {
        return Trie.NO_MATCH;
      }
    } else {
      if (trie._) {
        return Trie.MATCH;
      } else {
        return Trie.PARTIAL_MATCH;
      }
    }
  };

  return Trie;

})();
