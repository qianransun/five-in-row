var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    function isEqual(object1, object2) {
        return angular.equals(object1, object2);
    }
    // returns a new [empty] board
    // code adapted from: http://stackoverflow.com/questions/6495187/best-way-to-generate-empty-2d-array
    function createNewBoardWithElement(dim, element) {
        var rows = dim;
        var cols = dim;
        var array = [], row = [];
        while (cols--)
            row.push(element);
        while (rows--)
            array.push(row.slice());
        return array;
    }
    gameLogic.createNewBoardWithElement = createNewBoardWithElement;
    function createNewBoard(dim) {
        return createNewBoardWithElement(dim, '');
    }
    gameLogic.createNewBoard = createNewBoard;
    // returns copy of JS object
    function copyObject(object) {
        return angular.copy(object);
    }
    //Helper for getSets
    function getWeb(color, row, col, board, visited) {
        var points = [];
        var dim = board.length;
        function tryPoints(row, col) {
            points.push([row, col]);
            visited[row][col] = color;
            if (row - 1 >= 0 && visited[row - 1][col] === '' && board[row - 1][col] === color) {
                tryPoints(row - 1, col);
            }
            if (row + 1 < dim && visited[row + 1][col] === '' && board[row + 1][col] === color) {
                tryPoints(row + 1, col);
            }
            if (col + 1 < dim && visited[row][col + 1] === '' && board[row][col + 1] === color) {
                tryPoints(row, col + 1);
            }
            if (col - 1 >= 0 && visited[row][col - 1] === '' && board[row][col - 1] === color) {
                tryPoints(row, col - 1);
            }
        }
        tryPoints(row, col);
        return points;
    }

    // Changes all arr locations in board to '' (empty)
    function cleanBoard(board, arr) {
        var newboard = copyObject(board);
        for (var i = 0; i < arr.length; i++) {
            var row = arr[i][0];
            var col = arr[i][1];
            newboard[row][col] = '';
        }
        return newboard;
    }

    // evaluates board using union-find algorithm
    function evaluateBoard(board, turn) {
        var boardAfterEval = copyObject(board);
        return boardAfterEval;
    }

    function isBoardFull(board) {
        var dim = board.length;
        for (var i = 0; i < dim; i++) {
            for (var j = 0; j < dim; j++) {
                if (!board[i][j])
                    return false;
            }
        }
        return true;
    }

    // play against UI
    // returns a random move that the computer plays
    function createComputerMove(board, turnIndexBeforeMove) {
        var possibleMoves = [];
        var dim = board.length;
        for (var i = 0; i < dim; i++) {
            for (var j = 0; j < dim; j++) {
                var delta = { row: i, col: j };
                try {
                    console.warn("SQR......");
                    var testmove = createMove(board, delta, turnIndexBeforeMove);
                    possibleMoves.push(testmove);
                    console.warn("SQR......");
                }
                catch (e) {
                }
            }
        }
        try {
            var delta = { row: -1, col: -1 };
            var testmove = createMove(board, delta, turnIndexBeforeMove);
            possibleMoves.push(testmove);
        }
        catch (e) {
        }
        var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        return randomMove;
    }
    gameLogic.createComputerMove = createComputerMove;

    // find whether there are five chesses, if so, end game
    // up and down
    function udCount(dim, board, temp, x, y) {
        var count = 0;
        console.warn("SQR's home = " + board[x][y]);
        console.warn("SQR's fake home = " + temp);
        for (var i = x - 1; i >= 0; i--) {
            //console.warn("SQR's home = " + board[i][y]);
            if (angular.equals(board[i][y], temp)) {
                //count++;
                ++count;
                console.warn("SQR00 = " + count);
            } else {
                break;
            }
        }
        for (var i = x + 1; i < dim; i++) {
            if (angular.equals(board[i][y], temp)) {
                //count++;
                ++count;
                console.warn("SQR11 = " + count);
            } else {
                console.warn("SQR bad bad! ");
                break;
            }
        }
        console.warn("lr count: " + count);
        return count;
    }

    // left and right
    function lrCount(dim, board, temp, x, y) {
        var count = 0;
        for (var i = y - 1; i >= 0; i--) {
            if (angular.equals(board[x][i], temp)) {
                //count++;
                ++count;
            } else {
                break;
            }
        }
        for (var i = y + 1; i < dim; i++) {
            if (angular.equals(board[x][i], temp)) {
                ++count;
                //count++;
            } else {
                break;
            }
        }
        return count;
    }

    // right down and left up
    function rdCount(dim, board, temp, x, y) {
        var count = 0;
        for (var i = x + 1, j = y - 1; i < dim && j >= 0;) {
            if (angular.equals(board[i][j], temp)) {
                //count++;
                ++count;
            } else {
                break;
            }
            i++;
            j--;
        }
        for (var i = x - 1, j = y + 1; i >= 0 && j < dim;) {
            if (angular.equals(board[i][j], temp)) {
                ++count;
                //count++;
            } else {
                break;
            }
            i--;
            j++;
        }
        return count;
    }

    // left down and right up
    function ldCount(dim, board, temp, x, y) {
        var count = 0;

        for (var i = x - 1, j = y - 1; i >= 0 && j >= 0;) {
            if (angular.equals(board[i][j], temp)) {
                ++count;
                //count++;
            } else {
                break;
            }
            i--;
            j--;
        }
        for (var i = x + 1, j = y + 1; i < dim && j < dim;) {
            if (angular.equals(board[i][j], temp)) {
                ++count;
                //count++;
            } else {
                break;
            }
            i++;
            j++;
        }
        return count;
    }

    // check whether one has won
    function isWin(dim, board, turnIndex, x, y) {
        var count = 0;
        console.warn("zazaza: " + turnIndex);
        var temp = 'B'; //default:black 
        if (turnIndex === 0) {
            temp = 'W';
        } //白色  
        //console.warn("llllllllllll: " + temp);
        // console.log("temp=" + temp);
        if (udCount(dim, board, temp, x, y) === 4) {
            count = udCount(dim, board, temp, x, y);
        }
        else if (lrCount(dim, board, temp, x, y) === 4) {
            count = lrCount(dim, board, temp, x, y);
        }
        else if (rdCount(dim, board, temp, x, y) === 4) {
            count = rdCount(dim, board, temp, x, y);
        }
        else if (ldCount(dim, board, temp, x, y) === 4) {
            count = ldCount(dim, board, temp, x, y);
        }
        //console.warn("is_wim count: " + count);
        return count;
    }

    function createMove(board, delta, turnIndexBeforeMove) {
        var dim = board.length;
        //console.warn("now is: " + turnIndexBeforeMove);
        var boardAfterMove = copyObject(board);
        var row = delta.row;
        var col = delta.col;
        if (boardAfterMove[row][col] !== '') {
            // if space isn't '' then bad move
            throw Error('Space is not empty!');
        }
        // bad delta should automatically throw error
        boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'B' : 'W';
        // evaluate board
        boardAfterMove = evaluateBoard(boardAfterMove, turnIndexBeforeMove);
        if (angular.equals(board, boardAfterMove))
            throw Error("don’t allow a move that brings the game back to stateBeforeMove.");
        var endMatchScores = null;
        var turnIndexAfterMove = 1 - turnIndexBeforeMove;
        console.error("enter the judge");
        var countAfterMove = isWin(dim, boardAfterMove, turnIndexAfterMove, row, col);
        console.warn("COUnt值: " + countAfterMove);
        //if (angular.equals(countAfterMove, 4)) {
        if (countAfterMove === 4) {
            //throw Error('Win');
            console.warn("win: " + turnIndexBeforeMove);
            if (turnIndexAfterMove === 0) {
                endMatchScores = [0, 1];
            }
            else {
                endMatchScores = [1, 0];
            }
            turnIndexAfterMove = -1;
            console.warn("Make A Move, the next: " + turnIndexAfterMove);
        } else {
            if (isBoardFull(boardAfterMove)) {
                endMatchScores = [-1, -1];
                turnIndexAfterMove = -1;
            }
        }
        console.error("end the judge");

        return {
            endMatchScores: endMatchScores,
            turnIndex: turnIndexAfterMove,
            state: {
                board: boardAfterMove,
                boardBeforeMove: board,
                delta: delta,

            },
        };
    }
    gameLogic.createMove = createMove;

})(gameLogic || (gameLogic = {}));
