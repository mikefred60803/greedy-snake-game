const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
//getContext() method會回傳一個canvas的drawing context
//drawing context 可以用來在canvas內畫圖

//設定遊戲視窗的格子
const unit = 20;
const row = canvas.height / unit; // 320 / 20 = 16
const column = canvas.width / unit; // 320 / 20 = 16

let snake = []; // array 中的每個元素，都是一個物件，物件的工作是，儲存身體的x,y座標

// 初始值蛇的位置
function createSnake() {
  snake[0] = { x: 80, y: 0 };
  snake[1] = { x: 60, y: 0 };
  snake[2] = { x: 40, y: 0 };
  snake[3] = { x: 20, y: 0 };
}

//果實設定
class Fruit {
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  //畫出果實
  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  //果實被吃掉重新畫出的設定
  pickALocation() {
    let overlapping = false; // 判斷重疊
    // new_x new_y 用來儲存新座標
    let new_x;
    let new_y;

    //生成新的位置
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkOverlap(new_x, new_y); //檢查是否重疊
    } while (overlapping); //先去做do做完後檢查while是否為true式的話就重新執行

    //檢查果是否重疊到蛇的身體 function
    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          overlapping = true;
          return;
        } else {
          overlapping = false; //沒有重新設定的話，會無限循環，因為之前重疊overlapping被設定為true
        }
      }
    }

    //檢查完沒重疊後，重新附值 this.x this.y
    this.x = new_x;
    this.y = new_y;
  }
}

//初始設定
createSnake(); //初始位置
let myFruit = new Fruit();

//監控案件並執行function
window.addEventListener("keydown", changeDirection); // 使用者按下按鍵 後 執行function
let d = "Right"; //預設方向
//改變方向function (改變 d 來改變方向)
function changeDirection(e) {
  // console.log(e); // 先來找按鈕的key
  if (e.key == "ArrowUp" && d != "Down") {
    d = "Up";
  } else if (e.key == "ArrowDown" && d != "Up") {
    d = "Down";
  } else if (e.key == "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (e.key == "ArrowRight" && d != "Left") {
    d = "Right";
  }

  //雖然不能往反方向走，但function是設定每秒更新，所以在一秒內快速按下兩個鍵，是可以調頭的，然後會吃到自己遊戲就會直接結束
  //所以要設定按下後，在圖生成前不不會執行第二次按鍵
  window.removeEventListener("keydown", changeDirection); //刪除監控EventListener () 就不能監控了
}

//分數設定
let highestScore;
loadHighestScore(); //最高分 function
let score = 0;
document.getElementById("myScore").innerHTML = "遊戲分數:" + score;
document.getElementById("myScore2").innerHTML = "最高分數:" + highestScore;

//畫身體function draw()
function draw() {
  //每次畫圖之前，確認蛇有沒有咬到自己
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame); // 暫停遊戲
      alert("遊戲結束");
      return; //會結束整個function
    }
  }

  //每次畫蛇之前要先把背景全部重畫，不然原本畫的不會被刪除
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.height, canvas.width);

  //畫出果實
  myFruit.drawFruit();

  for (let i = 0; i < snake.length; i++) {
    //設定顏色
    // snake[0]就是頭的位子
    if (i == 0) {
      ctx.fillStyle = "lightgreen";
    } else {
      ctx.fillStyle = "lightblue";
    }
    ctx.strokeStyle = "white"; //外框顏色

    //穿牆功能，超出外框要更改位子
    //不能選取snakeX因為區域問題訪問不到
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    } else if (snake[i].x < 0) {
      snake[i].x = canvas.width - unit;
    } else if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    } else if (snake[i].y < 0) {
      snake[i].y = canvas.height;
    }

    //設定要畫的座標
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit); //(x座標, y座標, 長, 寬)
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit); //外框座標
  }

  //以目前的d變數方向，來決定蛇的下一貞要放在哪個座標
  //新增變數來儲存新頭的座標
  let snakeX = snake[0].x; //snake[0]是一個物件，但snake[0].x是一個number
  let snakeY = snake[0].y;
  if (d == "Left") {
    snakeX -= unit;
  } else if (d == "Up") {
    snakeY -= unit;
  } else if (d == "Right") {
    snakeX += unit;
  } else if (d == "Down") {
    snakeY += unit;
  }

  //新頭的位子
  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  //確認蛇是否有吃到果實
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    //重新選定一個隨機位置
    //劃出新果實
    myFruit.pickALocation();

    //更新分數
    score++;
    setHighestScore(score); //判斷最高分function
    document.getElementById("myScore").innerHTML = "遊戲分數:" + score;
    document.getElementById("myScore2").innerHTML = "最高分數:" + highestScore;
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
  window.addEventListener("keydown", changeDirection); //88行 為了要避免連續按鍵所以有先刪掉監控(所以要在加回來...)
}

//最高分 function
function loadHighestScore() {
  if (localStorage.getItem("highestScore") == null) {
    //沒玩過就沒有值 所以會是null 再把他設定為0分
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

//判斷目前分數有沒有高於最高分
function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}

let myGame = setInterval(draw, 80); //自動執行 不用調用 setInterval
