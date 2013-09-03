app = angular.module 'boggle', []

app.constant 'BOGGLE_DICE', [
  'aaafrs'.split('')
  'aaeeee'.split('')
  'aafirs'.split('')
  'adennn'.split('')
  'aeeeem'.split('')
  'aeegmu'.split('')
  'aegmnn'.split('')
  'afirsy'.split('')
  'bjkqxz'.split('')
  'ccenst'.split('')
  'ceiilt'.split('')
  'ceilpt'.split('')
  'ceipst'.split('')
  'ddhnot'.split('')
  'dhhlor'.split('')
  'dhlnor'.split('')
  'dhlnor'.split('')
  'eiiitt'.split('')
  'emottt'.split('')
  'ensssu'.split('')
  'fiprsy'.split('')
  'gorrvw'.split('')
  'iprrry'.split('')
  'nootuw'.split('')
  'ooottu'.split('')
]

app.value 'fisherYates', (arr) ->
  arr = angular.copy(arr)
  i = arr.length
  if i == 0 then return false

  while --i
    j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]

  arr

app.filter 'slice', ->
  (arr = [], start, end) ->
    arr.slice(start, end)

app.filter 'capitalize', ->
  (str = "") ->
    str[0].toUpperCase() + str[1...str.length]

app.factory 'dictionary', ($q, $http) ->
  d = $q.defer()

  dictionary = new Trie()
  dictionary.promise = d.promise

  $http.get('data.json').success (data) ->
    dictionary.data = data
    d.resolve(dictionary)

  dictionary

app.factory 'Game', (BOGGLE_DICE, dictionary, fisherYates, $timeout) ->
  class Cell
    constructor: (@row, @col, @letter) ->

    isEqual: (row, col) =>
      row == @row && col == @col

    isAdjacent: (row, col) =>
      return false if @isEqual(row, col)
      return true if Math.abs(row - @row) <= 1 && Math.abs(col - @col) <= 1
      false

  class Game
    constructor: ->
      @timer = null
      @submitting = false
      @plays = []
      @selected = []
      @gameOverCallbacks = []
      @dice = fisherYates(BOGGLE_DICE).map (letters) ->
        letter = letters[Math.floor(Math.random() * letters.length)]
        if letter == 'q' then 'qu' else letter

    submitWord: =>
      word = @currentWord()
      score = @scoreWord(word)

      # Simulate a nice round-trip to the server to check the word.
      @submitting = true
      $timeout (=>
        @plays.push(word: word, points: score)
        @selected = []
        @submitting = false
      ), Math.random() * 200 + 50

    select: (row, col) =>
      @timer = setTimeout(@gameOver, 30 * 1000) unless @timer?
      if @selected.length == 0 || (@adjacent(row, col) && !@isSelected(row, col))
        @selected.push(new Cell(row, col, @dice[row * 5 + col]))
      else if @lastMove().isEqual(row, col)
        @selected.pop()

    isSelected: (row, col) =>
      for cell in @selected
        return true if cell.isEqual(row, col)
      false

    currentWord: =>
      @selected.map((cell) -> cell.letter.toLowerCase()).join('')

    adjacent: (row, col) =>
      @lastMove().isAdjacent(row, col)

    lastMove: =>
      @selected[@selected.length - 1]

    scoreWord: (word) =>
      if dictionary.find(word) == Trie.MATCH
        switch word.length
          when 1 then 0
          when 2 then 0
          when 3 then 1
          when 4 then 1
          when 5 then 2
          when 6 then 3
          when 7 then 5
          else        11
      else
        -1

    totalScore: =>
      score = 0
      score += play.points for play in @plays
      score

    gameOver: =>
      callback() for callback in @gameOverCallbacks

    onGameOver: (cb) =>
      @gameOverCallbacks.push(cb)

app.controller 'BoggleController', ($scope, dictionary, Game) ->
  $scope.page = 'loading'
  $scope.game = new Game()
  dictionary.promise.then ->
    $scope.page = 'index'

  $scope.startGame = ->
    $scope.game.onGameOver ->
      $scope.page = 'gameOver'
    $scope.page = 'game'
