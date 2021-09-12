function Mine(tr, td, mineNum) {
    this.tr = tr; //行数
    this.td = td; //列数
    this.mineNum = mineNum; //雷的数量
    this.squares = []; //存储所有方块的信息，二维数组，按行与列的顺序排放
    this.tds = []; //存储所有单元格的DOM
    this.surplusMine = mineNum; //剩余雷的数量
    this.allRight = false; //右击标的小红旗是否全是雷。判断是否成功
    this.parent = document.querySelector(".gameBox")
}

//生成n个不重复的数字
Mine.prototype.randomNum = function() {
    var square = new Array(this.tr * this.td); // 生成空数组，有长度
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function() { return 0.5 - Math.random() });
    // console.log(square)
    return square.slice(0, this.mineNum)
}

//初始化
Mine.prototype.init = function() {
    // this.randomNum();
    // console.log(this.randomNum())
    var rn = this.randomNum(); //雷在格子里的位置
    var n = 0; //用来找到格子对应的索引
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = []
        for (var j = 0; j < this.td; j++) {
            // this.squares[i][j] = 
            n++;
            if (rn.indexOf(n) != -1) {
                this.squares[i][j] = {
                    type: "mine",
                    x: j,
                    y: i
                }
            } else {
                this.squares[i][j] = {
                    type: "number",
                    x: j,
                    y: i,
                    value: 0
                }
            }
        }
    }

    // console.log(this.squares)
    this.updateNum()
    this.createDom()
    this.parent.oncontextmenu = function() {
        return false
    }

    this.mineNumDom = document.querySelector(".mineNum");
    this.mineNumDom.innerHTML = this.surplusMine
}

// 行/列：0,0  0,1  0,2;
// 坐标(x,y)：0,0  1,0  2,0

//创建表格
Mine.prototype.createDom = function() {
    var table = document.createElement("table");
    var This = this;
    for (let i = 0; i < this.tr; i++) {
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) {
            var domTd = document.createElement("td");
            this.tds[i][j] = domTd;
            // if (this.squares[i][j].type == "mine") {
            //     domTd.className = 'mine';
            // }
            // if (this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value
            // }
            domTd.pos = [i, j]; //把格子对应的行与列存到格子上;
            domTd.onmousedown = function(event) {
                This.play(event, this) //This:实例对象， this:当前点击的格子
            }
            domTr.appendChild(domTd)
                // domTd.innerHTML = 0
        }
        table.appendChild(domTr)
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}

//获取一个方块周围的8个格子
Mine.prototype.getAround = function(square) {
    var x = square.x;
    var y = square.y;
    var result = [];

    /*
    
       x-1,y-1   x,y-1   x+1,y-1
       x-1,y     x,y     x+1,y
       x-1,y+1   x,y+1   x+1,y+1
    
    */
    for (var i = x - 1; i <= x + 1; i++) {

        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 ||
                j < 0 ||
                i > this.td - 1 ||
                j > this.tr - 1 ||
                (i == x && j == y) ||
                this.squares[j][i].type == 'mine'
            ) {
                continue;
            }
            result.push([j, i]);
        }
    }
    return result
}

Mine.prototype.updateNum = function() {
    for (i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'number') {
                continue
            }
            var num = this.getAround(this.squares[i][j]); //获取每一个雷周围的数字
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1
            }
        }
        // console.log(num)
    }
}

Mine.prototype.play = function(ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != 'flag') {
        //点击的左键
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eigth"]
        if (curSquare.type == 'number') {
            //点到数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value]
            if (curSquare.value == 0) {
                obj.innerHTML = '';

                function getAllZero(square) {
                    var around = This.getAround(square);
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];
                        var y = around[i][1];
                        This.tds[x][y].className = cl[This.squares[x][y].value]
                        if (This.squares[x][y].value == 0) {
                            if (!This.tds[x][y].check) {
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y])
                            }
                        } else {
                            This.tds[x][y].innerHTML = This.squares[x][y].value;

                        }
                    }
                }
                getAllZero(curSquare)
            }
        } else {
            this.gameOver(obj)
        }

    }

    if (ev.which == 3) {
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';
        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true
        } else {
            this.allRight = false
        }
        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine
        }

        if (this.surplusMine == 0) {
            if (this.allRight) {
                alert('success')
            } else {
                alert('game over')
                this.gameOver()
            }
        }
    }
}


Mine.prototype.gameOver = function(clickTd) {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine'
            }
            this.tds[i][j].onmousedown = null
        }
    }
    if (clickTd) {
        clickTd.style.backgroundColor = '#f00'
    }
}

// var mine = new Mine(28, 28, 99)

// mine.init()

// console.log(mine.getAround(mine.squares[0][0]))


var btns = document.querySelectorAll(".level button");
var mine = null;
var ln = 0;
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
];

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function() {
        btns[ln].className = '';
        this.className = 'active';
        mine = new Mine(...arr[i]);
        mine.init()
        ln = i
    }
}

btns[0].onclick();
btns[3].onclick = function() {
    mine.init()
}