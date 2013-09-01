var alreadyPlayedWords, gameIsActive, getGrid, postWords, selectGridTiles, setStatus, setWord, solve, statusText, submitCurrentWord, wordSubmissionPending, wordText,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

statusText = null;

wordText = null;

jQuery(function() {
  var addControl, button, controls, radio1, radio2, stopOnGameOver;
  if (!$("#board td").length) {
    return;
  }
  statusText = $("<p>").css({
    position: 'absolute',
    left: '600px',
    top: '20px'
  }).appendTo('body');
  wordText = $("<h1>").css({
    position: 'absolute',
    left: '600px',
    top: '30px'
  }).appendTo('body');
  controls = $("<div>").css({
    position: 'absolute',
    top: '30px',
    left: '600px'
  });
  addControl = function() {
    var container, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    container = $("<div>");
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      container.append(elem);
    }
    return controls.append(container);
  };
  stopOnGameOver = true;
  radio1 = $("<input>").attr('type', 'radio').attr('name', 'solveMode').attr('value', 'true').attr('checked', 'checked');
  radio2 = $("<input>").attr('type', 'radio').attr('name', 'solveMode').attr('value', 'false');
  radio1.attr('id', 'sogo').on('change', function() {
    if ($(this).val() === 'true') {
      return stopOnGameOver = true;
    }
  });
  radio2.attr('id', 'cogo').on('change', function() {
    if ($(this).val() === 'false') {
      return stopOnGameOver = false;
    }
  });
  button = $("<button>");
  button.text('solve');
  button.on('click', function() {
    controls.remove();
    return solve(stopOnGameOver);
  });
  addControl(button);
  addControl(radio1, $("<label>").attr('for', 'sogo').css('font-size', '12pt').text("Stop on Game Over"));
  addControl(radio2, $("<label>").attr('for', 'cogo').css('font-size', '12pt').text("Continue on Game Over"));
  return controls.appendTo('body');
});

solve = function(stopOnGameOver) {
  var words, xhr;
  words = [];
  setStatus("scanning...");
  xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.runtime.getURL('src/json/data.json'));
  xhr.onreadystatechange = function() {
    var data, traverser;
    if (xhr.readyState === 4 && xhr.status === 200) {
      data = JSON.parse(xhr.responseText);
      traverser = new Traverser(3, getGrid(), new Trie(data));
      traverser.onComplete(function() {
        return postWords(words, stopOnGameOver);
      });
      return traverser.search(function(word, positions) {
        setWord(word);
        return words.push({
          word: word,
          positions: positions
        });
      });
    }
  };
  return xhr.send();
};

postWords = function(words, stopOnGameOver) {
  var done, postNextWord, sortedWords, usedWords;
  setStatus("submitting...");
  setWord("");
  usedWords = alreadyPlayedWords();
  sortedWords = words.sort(function(a, b) {
    return b.word.length - a.word.length;
  });
  done = function() {
    setStatus("done");
    return setWord("");
  };
  postNextWord = function() {
    var word, _ref;
    if (wordSubmissionPending()) {
      return setTimeout(postNextWord, 0);
    }
    if (sortedWords.length) {
      word = sortedWords.shift();
      if (_ref = word.word, __indexOf.call(usedWords, _ref) >= 0) {
        return postNextWord();
      }
      usedWords.push(word.word);
      setWord(word.word);
      selectGridTiles(word.positions);
      if (stopOnGameOver === false || gameIsActive()) {
        submitCurrentWord();
      } else {
        done();
      }
      return setTimeout(postNextWord, 0);
    } else {
      return done();
    }
  };
  return postNextWord();
};

setStatus = function(status) {
  return statusText.text(status);
};

setWord = function(word) {
  return wordText.text(word);
};

getGrid = function() {
  var tiles;
  tiles = $("#board td").map(function(idx, td) {
    return $(td).text().toLowerCase();
  });
  tiles = tiles.toArray();
  return [tiles.slice(0, 5), tiles.slice(5, 10), tiles.slice(10, 15), tiles.slice(15, 20), tiles.slice(20, 25)];
};

selectGridTiles = function(tiles) {
  var cellIndexes, index, _i, _len, _results;
  cellIndexes = tiles.map(function(pos) {
    var col, row;
    row = pos[0], col = pos[1];
    return row * 5 + col;
  });
  _results = [];
  for (_i = 0, _len = cellIndexes.length; _i < _len; _i++) {
    index = cellIndexes[_i];
    _results.push($($("#board td").get(index)).click());
  }
  return _results;
};

submitCurrentWord = function() {
  return $("form input[type=submit]").get(0).click();
};

wordSubmissionPending = function() {
  return $("form input[type=submit]").attr('disabled');
};

gameIsActive = function() {
  return $("#board:visible").length;
};

alreadyPlayedWords = function() {
  var historyRows, usedWords;
  historyRows = $($("#history tr td:first-child")).toArray();
  historyRows = historyRows.slice(0, historyRows.length - 1);
  return usedWords = historyRows.map(function(td) {
    return $(td).text();
  });
};
