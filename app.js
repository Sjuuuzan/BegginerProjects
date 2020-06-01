document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const startButton = document.querySelector('#start-stop')
  const width = 10
  let nextRandom = 0
  let timerId
  let score = 0
  const colors = ['green', 'pink', 'red', 'blue', 'orange']

  // shapes
  const klocekL = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ]
  const klocekI = [
    [1, width + 1, 2 * width + 1, 3 * width + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, 2 * width + 1, 3 * width + 1],
    [width, width + 1, width + 2, width + 3]
  ]
  const klocekZ = [
    [0, width, width + 1, 2 * width + 1],
    [width + 1, width + 2, 2 * width, 2 * width + 1],
    [0, width, width + 1, 2 * width + 1],
    [width + 1, width + 2, 2 * width, 2 * width + 1]
  ]
  const klocekO = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ]
  const klocekT = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ]

  const klocki = [klocekL, klocekI, klocekO, klocekT, klocekZ]

  let currentPosition = 3
  let currentRotation = 0

  // randomly selects a shape in its first rotation
  let random = Math.floor(Math.random() * klocki.length)
  let current = klocki[random][currentRotation]

  // draw the shape
  function draw () {
    current.forEach(item => {
      squares[currentPosition + item].classList.add('kloce')
      squares[currentPosition + item].style.backgroundColor = colors[random]
    })
  }

  // undraw the shape
  function undraw () {
    current.forEach(item => {
      squares[currentPosition + item].classList.remove('kloce')
      squares[currentPosition + item].style.backgroundColor = ''
    })
  }
  // assign functions to keycode
  function control (e) {
    if (e.keyCode === 37) {
      moveLeft()
    } else if (e.keyCode === 38) {
      rotate()
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 40) {
      moveDown()
    }
  }
  document.addEventListener('keyup', control)

  // move down function
  function moveDown () {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  // freeze function
  function freeze () {
    if (current.some(item => squares[currentPosition + item + width].classList.contains('taken'))) {
      current.forEach(item => squares[currentPosition + item].classList.add('taken'))
      // new shape is falling down
      random = nextRandom
      nextRandom = Math.floor(Math.random() * klocki.length)
      current = klocki[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  // move the shape left unless there is an edge
  function moveLeft () {
    undraw()
    const isAtLeftEdge = current.some(item => (currentPosition + item) % width === 0)
    if (!isAtLeftEdge) currentPosition -= 1
    if (current.some(item => squares[currentPosition + item].classList.contains('taken'))) {
      currentPosition += 1
    }
    draw()
  }

  // move the shape right unless there is an edge
  function moveRight () {
    undraw()
    const isAtRightEdge = current.some(item => (currentPosition + item) % width === width - 1)
    if (!isAtRightEdge) currentPosition += 1
    if (current.some(item => squares[currentPosition + item].classList.contains('taken'))) {
      currentPosition -= 1
    }
    draw()
  }

  function isAtRight () {
    return current.some(item => (currentPosition + item + 1) % width === 0)
  }

  function isAtLeft () {
    return current.some(item => (currentPosition + item) % width === 0)
  }

  function checkRotatedPosition (P) {
    P = P || currentPosition // get current position. Then check if the shape is near the left side.
    if ((P + 1) % width < 4) { // have to add one couse the position index can be 1 less than where the piece is(becouse of their index)
      if (isAtRight()) { // use actual position to check if it's flipped over the roght side.
        currentPosition += 1 // if so, add one to wrap it back around.
        checkRotatedPosition(P) // check again. Pass position from start, since long block might need to move more
      }
    } else if (P % width > 5) {
      if (isAtLeft()) {
        currentPosition -= 1
        checkRotatedPosition(P)
      }
    }
  }

  function rotate () {
    undraw()
    currentRotation++
    if (currentRotation === klocki[random].length) { // if the current rotation gets to 4, make it go back to 0
      currentRotation = 0
    } current = klocki[random][currentRotation]
    checkRotatedPosition()
    draw()
  }

  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0

  // Shapes without rotations
  const upNextKlocek = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lklocek
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], // iklocek
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth, displayWidth + 1, displayWidth + 2],
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1]

  ]

  // display the shape in the mini-grid display
  function displayShape () {
    displaySquares.forEach(item => {
      item.classList.remove('kloce')
      item.style.backgroundColor = ''
    })
    upNextKlocek[nextRandom].forEach(item => {
      displaySquares[displayIndex + item].classList.add('kloce')
      displaySquares[displayIndex + item].style.backgroundColor = colors[nextRandom]
    })
  }

  // add functionality button
  startButton.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 500)
      nextRandom = Math.floor(Math.random() * klocki.length)
      displayShape()
    }
  })
  // add score
  function addScore () {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]
      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('kloce')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(item => grid.appendChild(item))
      }
    }
  }
  // game over
  function gameOver () {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.innerHTML = 'end'
      clearInterval(timerId)
    }
  }
})
