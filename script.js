/*-----------------------------------------------------------------
FASE DI PREPARAZIONE
---------------------------------------------------------------- */

//Raccogliamo tutti gli elementi dalla pagina
const grid = document.querySelector('.grid');
const scoreCounter = document.querySelector('.score-counter');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainButton = document.querySelector('.play-again');

//Creiamo la matrice per la nostra griglia
const gridMatrix = [
    ['', '', '', '', '', '', '', '', ''],
    ['river', 'wood', 'wood', 'river', 'wood', 'river', 'river', 'river', 'river'],
    ['river', 'river', 'river', 'wood', 'wood', 'river', 'wood', 'wood', 'river'],
    ['', '', '', '', '', '', '', '', ''],
    ['road', 'bus', 'road', 'road', 'road', 'car', 'road', 'road', 'road'],
    ['road', 'road', 'road', 'car', 'road', 'road', 'road', 'road', 'bus'],
    ['road', 'road', 'car', 'road', 'road', 'road', 'bus', 'road', 'road'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '']
];

//preparo alcune informazioni utili alla logica di gioco
const victoryRow = 0;
const riverRows = [1, 2];
const roadRows = [4, 5, 6];
const duckPosition = { y: 8, x: 4 };
let contentBeforDuck = '';
let time = 15;

/*---------------------
FUNZIONI DI GIOCO
--------------------- */

// Funzione per disegnare la scacchiera
function applyCellStyle(cell, rowIndex, cellIndex) {
    const isRowEven = rowIndex % 2 === 0;
    const isCellEven = cellIndex % 2 === 0;

    if (isRowEven && isCellEven || !isRowEven && !isCellEven) {
        cell.classList.add('cell-dark')
    }
}

//funzione che disegna la griglia
function drawGrid() {
    //ripuliamo i contenuti precedenti
    grid.innerHTML = '';
    //per ogni riga
    gridMatrix.forEach(function (rowCells, rowIndex) {
        //per ogni cella della riga
        rowCells.forEach(function (cellContent, cellIndex) {
            //creo una cella
            const cell = document.createElement('div');
            cell.classList.add('cell');

            //inserisco una classe con lo stesso nome del contenuto della cella
            if (cellContent !== '') {
                cell.classList.add(cellContent)
            }

            //andiamo a colorare le righe in maniera appropriata
            if (riverRows.includes(rowIndex)) {
                cell.classList.add('river');
            } else if (roadRows.includes(rowIndex)) {
                cell.classList.add('road');
            } else {
                applyCellStyle(cell, rowIndex, cellIndex)
            }

            //inseriamo la cella nella griglia
            grid.appendChild(cell);
        })
    })
}

//Funzione per piazzare la paprella

function placeDuck() {

    //prima di piazzarla mi segno cosa c'era nella cella
    contentBeforDuck = gridMatrix[duckPosition.y][duckPosition.x];

    //dopo ci metto la paperella
    gridMatrix[duckPosition.y][duckPosition.x] = 'duck';
}

//funzione per muovere la paperella
function moveDuck(event) {

    //nella cella precedente rimetto il valore originale
    gridMatrix[duckPosition.y][duckPosition.x] = contentBeforDuck;


    switch (event.key) {
        case 'ArrowUp':
            if (duckPosition.y > 0) duckPosition.y--;
            break;
        case 'ArrowDown':
            if (duckPosition.y < 8) duckPosition.y++;
            break;
        case 'ArrowLeft':
            if (duckPosition.x > 0) duckPosition.x--;
            break;
        case 'ArrowRight':
            if (duckPosition.x < 8) duckPosition.x++;
            break;
        default:
            return;
    }
    drawElements();
}
//funzione che sposta la paperella
function drawElements() {
    placeDuck();
    checkDuckPosition();
    drawGrid();
}

//funzione per terminare la partita
function endGame(reason) {
    if (reason === 'duck-arrived') {
        endGameScreen.classList.add('win');
        endGameText.innerHTML = 'YOU <br> WIN';
    }
    //blocco lo spostamento degli elementi
    clearInterval(renderingLoop);

    //blocco il conto alla rovescia
    clearInterval(countdown);

    //blocchiamo l'ascolto sui tasti
    document.removeEventListener('keyup', moveDuck)

    //assegnamo la classe appropriata
    gridMatrix[duckPosition.y][duckPosition.x] = reason;

    //mostriammo la schermata di fine gioco
    endGameScreen.classList.remove('hidden');

    //metto il focus sul bottone
    playAgainButton.focus();
}

//funzione per controllare la posizione della paperella
function checkDuckPosition() {
    if (duckPosition.y === victoryRow) {
        endGame('duck-arrived');
    } else if (contentBeforDuck === 'river') {
        endGame('duck-drowned');
    } else if (contentBeforDuck === 'bus' || contentBeforDuck === 'car') {
        endGame('duck-hit');
    }
}

//funzione per muovere una riga
function moveRow(rowIndex) {
    //recupero tutte le celle di una riga
    const rowCells = gridMatrix[rowIndex];

    //tolgo l'ultima cella  e la metto da parte
    const lastCell = rowCells.pop();

    //la inserisco all'inizio
    rowCells.unshift(lastCell);
}

//funzione che muove una riga verso dietro
function moveRowBack(rowIndex) {
    //recupero tutte le celle di una riga
    const rowCells = gridMatrix[rowIndex];

    //tolgo la prima cella e la metto da parte
    const firstCell = rowCells.shift()

    //la aggiungo alla fine
    rowCells.push(firstCell);
}

//funzione che si preoccupa di spostare corretamente la paperella
function handleDuckPosition() {
    gridMatrix[duckPosition.y][duckPosition.x] = contentBeforDuck;
    //gestione galleggiamento
    if (contentBeforDuck === 'wood') {
        //se sono nella prima riga e non alla fine, sposta a destra
        if (duckPosition.y === 1 && duckPosition.x < 8) {
            duckPosition.x++;
            //se sono nella seconda riga e non alla fine, sposta a sinistra
        } else if (duckPosition.y === 2 && duckPosition.x > 0) {
            duckPosition.x--;
        }
    }
    contentBeforDuck = gridMatrix[duckPosition.y][duckPosition.x];
}

//Funzione per decrementare il tepo
function reduceTime() {
    time--;
    scoreCounter.innerHTML = String(time).padStart(5, 0);
    if (time === 0) {
        endGame('time-up')
    }
}

/*--------------
SVOLGIMENTO GIOCO
------------------*/
const renderingLoop = setInterval(function () {
    handleDuckPosition();
    moveRow(1);
    moveRowBack(2);
    moveRow(3);
    moveRow(4);
    moveRow(5);
    moveRow(6);
    drawElements();
}, 600)
const countdown = setInterval(reduceTime, 1000);

/*-----------
EVENTI DI GIOCO
------------ */
//evento per ascoltare la pressione dei tasti
document.addEventListener('keyup', moveDuck)

//evento per ascoltare il click sul bottone rigioco
playAgainButton.addEventListener('click', function () {
    window.location.reload();
})