// ========================================
// DATA MODEL (EXACT)
// ========================================

// Board state: Array of 9 elements - "X", "O", or null
let board = Array(9).fill(null);

// Current player: "X" or "O"
let currentPlayer = "X";

// Player state tracking
let playerState = {
    X: { lastMoveWasCancel: false },
    O: { lastMoveWasCancel: false }
};

// Flag to prevent clicks during animations
let isAnimating = false;

// ========================================
// DOM ELEMENTS
// ========================================

const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const wipeOverlay = document.getElementById('wipeOverlay');

// ========================================
// WIN COMBINATIONS
// ========================================

const winCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// ========================================
// INITIALIZATION
// ========================================

function init() {
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });
    updateBoard();
}

// ========================================
// TURN LOGIC (STEP BY STEP)
// ========================================

function handleCellClick(index) {
    // Prevent clicks during animations
    if (isAnimating) return;
    
    const cellValue = board[index];
    const opponentMark = currentPlayer === 'X' ? 'O' : 'X';
    
    // Check if this is a cancel action
    if (cellValue === opponentMark && canCancel()) {
        // CANCEL ACTION
        performCancel(index);
    } else if (cellValue === null) {
        // PLACE ACTION
        performPlace(index);
    } else {
        // Invalid click - ignore
        return;
    }
    
    // Check for win after action
    const winResult = checkWin();
    
    if (winResult) {
        handleWin(winResult);
    } else if (isBoardFull()) {
        handleDraw();
    } else {
        // Switch player for next turn
        switchPlayer();
        updateCancelableVisuals();
    }
}

// ========================================
// CANCEL AVAILABILITY CHECK
// ========================================

function canCancel() {
    // Cancel is allowed ONLY IF:
    // - playerState[currentPlayer].lastMoveWasCancel === false
    return !playerState[currentPlayer].lastMoveWasCancel;
}

// ========================================
// PERFORM CANCEL
// ========================================

function performCancel(index) {
    // Set animating flag to prevent clicks during animation
    isAnimating = true;
    
    // Remove the opponent's mark
    board[index] = null;
    
    // Set lastMoveWasCancel to true
    playerState[currentPlayer].lastMoveWasCancel = true;
    
    // Play cancel animation
    const cell = cells[index];
    cell.classList.add('canceling');
    
    setTimeout(() => {
        cell.classList.remove('canceling');
        updateBoard();
        isAnimating = false;
    }, 400);
}

// ========================================
// PERFORM PLACE
// ========================================

function performPlace(index) {
    // Set animating flag to prevent clicks during animation
    isAnimating = true;
    
    // Place current player's mark
    board[index] = currentPlayer;
    
    // Set lastMoveWasCancel to false
    playerState[currentPlayer].lastMoveWasCancel = false;
    
    // Play place animation
    const cell = cells[index];
    cell.classList.add('placing');
    
    setTimeout(() => {
        cell.classList.remove('placing');
        isAnimating = false;
    }, 300);
    
    updateBoard();
}

// ========================================
// BOARD UPDATE
// ========================================

function updateBoard() {
    cells.forEach((cell, index) => {
        const value = board[index];
        
        // Clear previous classes
        cell.classList.remove('x', 'o', 'cancelable');
        
        // Set content and classes based on board state
        if (value === 'X') {
            cell.textContent = 'X';
            cell.classList.add('x');
        } else if (value === 'O') {
            cell.textContent = 'O';
            cell.classList.add('o');
        } else {
            cell.textContent = '';
        }
    });
    
    updateCancelableVisuals();
}

// ========================================
// VISUAL CUES FOR CANCELABLE CELLS
// ========================================

function updateCancelableVisuals() {
    const opponentMark = currentPlayer === 'X' ? 'O' : 'X';
    
    cells.forEach((cell, index) => {
        cell.classList.remove('cancelable');
        
        // Add cancelable visual if:
        // - Cell contains opponent mark
        // - Cancel is allowed for current player
        if (board[index] === opponentMark && canCancel()) {
            cell.classList.add('cancelable');
        }
    });
}

// ========================================
// SWITCH PLAYER
// ========================================

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// ========================================
// WIN DETECTION
// ========================================

function checkWin() {
    for (let combination of winCombinations) {
        const [a, b, c] = combination;
        
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {
                winner: board[a],
                combination: combination
            };
        }
    }
    
    return null;
}

// ========================================
// BOARD FULL CHECK
// ========================================

function isBoardFull() {
    return board.every(cell => cell !== null);
}

// ========================================
// WIN HANDLING
// ========================================

function handleWin(winResult) {
    isAnimating = true;
    
    // Highlight winning cells
    winResult.combination.forEach(index => {
        cells[index].classList.add('winning');
    });
    
    // Wait 500ms, then reset
    setTimeout(() => {
        resetGame();
    }, 500);
}

// ========================================
// DRAW HANDLING
// ========================================

function handleDraw() {
    isAnimating = true;
    
    // Automatically reset with wipe animation (no draw screen)
    setTimeout(() => {
        resetGame();
    }, 500);
}

// ========================================
// RESET LOGIC
// ========================================

function resetGame() {
    // Play wipe animation
    wipeOverlay.classList.add('active');
    boardElement.classList.add('locked');
    
    setTimeout(() => {
        // Clear winning highlights
        cells.forEach(cell => {
            cell.classList.remove('winning', 'placing', 'canceling', 'cancelable');
        });
        
        // Reset board and player state
        board = Array(9).fill(null);
        currentPlayer = 'X';
        playerState = {
            X: { lastMoveWasCancel: false },
            O: { lastMoveWasCancel: false }
        };
        
        // Update display
        updateBoard();
        
        // Remove wipe overlay
        wipeOverlay.classList.remove('active');
        boardElement.classList.remove('locked');
        isAnimating = false;
    }, 400);
}

// ========================================
// START GAME
// ========================================

init();
