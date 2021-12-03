"use strict"
class Minesweeper {
  constructor(size, box) {
    this.size = size;
    this.canvas = document.getElementById("field");
    this.ctx = this.canvas.getContext("2d");
    this.cellNum = 10; // cell count
    this.bombValue = -100; // static num value of bomb
    this.totalBombsCount = 15; // static count
    this.cellSize = size / this.cellNum;
    this.arr = [];
    this.clickedCells = {};
    this.flags = {};
    this.checkedCells = {};
    this.empty = 0;
    this.isOver = false;
    this.isWin = false;
    this.isNew = null;
    this.images = {};
    this.massage = box;
  }

  init() {
    this.preloadImages();
    this.addListeners();
  }

  loadGame() {
    this.createFieldMatrix();
    this.setBombs();
    this.fillMatrix();
    this.drawField();
  }

  createFieldMatrix() {
    let widthM = this.cellNum,
        heightM = widthM;

    this.arr.length = 0;
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    for (let i = 0; i < widthM; i++) {
      this.arr[i] = [];
      for (let j = 0; j < heightM; j++) 
        this.arr[i][j] = this.empty;
    }
  }

  setBombs() {
    let bombsOnField = 0;
    
    while (bombsOnField < this.totalBombsCount) {
      let posX = this.getRandomValue(0, this.cellNum - 1),
          posY = this.getRandomValue(0, this.cellNum - 1);
      
      if (this.arr[posY][posX] !== this.bombValue) {
        this.arr[posY][posX] = this.bombValue;
        ++bombsOnField; 
      }
    }
  }

  fillMatrix() {
    for (let i = 0; i < this.arr.length; i++) {
      for (let j = 0; j < this.arr[i].length; j++) {
        if (this.arr[i][j] === this.bombValue) continue;
        let bombsAround = this.checkSidesBombs(j, i);
        this.arr[i][j] = bombsAround; 
      }
    }
  }

  checkSidesBombs(x, y) {
    let totalCount = 0;
    let ways = [
      [y - 1, x],
      [y - 1, x - 1],
      [y - 1, x + 1],
      [y + 1, x],
      [y + 1, x + 1],
      [y + 1, x - 1],
      [y, x + 1],
      [y, x - 1],
    ];

    ways.forEach( b => {
      if (this.arr[b[0]] && this.arr[b[0]][b[1]])
        totalCount += (this.arr[b[0]][b[1]] === this.bombValue) ? 1 : 0;
    });
    return totalCount;
  }

  checkSides(y, x) {
    this.checkedCells[y + "" + x] = true;
    let ways = [
      [y - 1, x],
      [y - 1, x - 1],
      [y - 1, x + 1],
      [y + 1, x],
      [y + 1, x + 1],
      [y + 1, x - 1],
      [y, x + 1],
      [y, x - 1],
    ];

    ways.forEach( b => {
      if (this.arr[b[0]] && this.arr[b[0]][b[1]] !== undefined) this.sideValue(b[0], b[1]);
    });
  }

  sideValue(y, x) {
    if (this.checkedCells[y + "" + x]) return;
    if (this.arr[y][x] !== this.bombValue) this.clickedCells[y + "" + x] = true;
    this.checkedCells[y + "" + x] = true;
    if (this.arr[y][x] === this.empty) this.checkSides(y, x);
  }

  checkImportant(y, x) {
    if(this.arr[y][x] === this.empty) {
      this.checkSides(y, x);
      this.checkedCells = {};
    }

    this.drawField();

    if(this.arr[y][x] === this.bombValue) this.gameOver();

    if (
      Object.keys(this.clickedCells).length === this.arr.length * this.arr[0].length - this.totalBombsCount
    ) {
      this.isWin = true;
      this.gameOver();
    }
  }

  whichClicked(x, y, code) {
    if (this.isOver) return;
    if (code === 0) {
      if (this.flags[y + "" + x]) return;
      this.clickedCells[y + "" + x] = true;
      this.checkImportant(y, x);
    }

    if (code === 2) {
      if (this.clickedCells[y + "" + x]) return;
      this.flags[y + "" + x] = !this.flags[y + "" + x];
      this.drawField();
    }
  }

  gameOver() {
    this.isOver = true;
    this.drawOver();
  }

  clearData() {
    if (this.isNew) this.arr = [];
    this.isNew = null;
    this.clickedCells = {};
    this.checkedCells = {};
    this.flags = {};
    this.isOver = false;
    this.isWin = false;
    this.massage.innerHTML = "";
  }

  getRandomValue(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  drawOver() {
    this.drawField();
    this.massage.innerHTML = (this.isWin) ? "You Win!" : "You Lose!";
  }

  drawField() {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.strokeStyle='rgb(194, 194, 194)';    

    for (let i = 0; i < this.cellNum; i++) {
      for (let j = 0; j < this.cellNum; j++) {
        ctx.strokeRect(j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
        ctx.drawImage(this.images[11], j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);

        if (this.flags[i + "" + j]) {
          ctx.drawImage(this.images[15], j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
          continue;
        }

        if (!this.clickedCells[i + "" + j] && !this.isOver) continue;

        if (this.arr[i][j] === this.bombValue) {
          ctx.drawImage(this.images[10], j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
          continue;
        }

        ctx.drawImage(this.images[9], j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
        
        if(this.arr[i][j] !== 0)
          ctx.drawImage(this.images[this.arr[i][j]], j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  preloadImages() {
    let alreadyLoaded = 0,
        images = {
      1: "assets/1.png",
      2: "assets/2.png",
      3: "assets/3.png",
      4: "assets/4.png",
      5: "assets/5.png",
      6: "assets/6.png",
      7: "assets/7.png",
      8: "assets/8.png",
      9: "assets/0.png",
      10: "assets/bomb.png",
      11: "assets/facingDown.png",
      15: "assets/flagged.png",
    };

    for (let key of Object.keys(images)) {
      let pic = new Image();
      pic.src = images[key];
      pic.onload = () => {
        ++alreadyLoaded;
        this.images[key] = pic;
        if (alreadyLoaded === Object.keys(images).length) {
          this.loadGame();
        } 
      }
    }
  }

  cellClicked(e) {
    e = e || window.event;
    let eCode = e.button;
    let x = e.offsetX;
    let y = e.offsetY;
    x = Math.floor(x / this.cellSize);
    y = Math.floor(y / this.cellSize);
    this.whichClicked(x, y, eCode);
  }
  
  newPressed() {
    this.isNew = true;
    this.clearData();
    this.loadGame();
  }

  resPressed() {
    this.clearData();
    this.drawField();
  }

  addListeners() {
    this.canvas.addEventListener("mouseup", this.cellClicked);
  }

  removeListeners() {
    this.canvas.removeEventListener("mouseup", this.cellClicked);
  }
}


let massageBox = document.querySelector(".game__controller__massage");
let game = new Minesweeper(300, massageBox);
game.init();

document.querySelector(".controller__buttons--res")
.addEventListener("click", game.resPressed.bind(game));

document.querySelector(".controller__buttons--new")
.addEventListener("click", game.newPressed.bind(game));
