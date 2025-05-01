import {drawLine} from "./2dDraw.js";

class Cell{
    constructor(){
        this.left = true;
        this.bottom = true;
        this.right = true;
        this.top = true;
        this.visited = false;
    }

    //draw all the walls
    draw(gl, shaderProgram, x,y){
        const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
        const modelViewMatrix = mat4.create();
        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
        const vertices = [];
        if (this.left){
            vertices.push(x,y, x, y+1);
        }
        if (this.bottom){
            vertices.push(x,y, x+1,y);
        }
        if(this.top){
            vertices.push(x, y+1, x+1, y+1);
        }        
        if(this.right){
            vertices.push(x+1, y, x+1, y+1);
        }
        drawLine(gl, shaderProgram, vertices);
    }
}

class Maze{
    constructor(w, h){ //width and height
        this.width = w;
        this.height = h;
        this.cells = []
        for(let r = 0; r < this.height; r++){
            this.cells.push([])
            for(let c= 0; c<this.width; c++){
                this.cells[r].push(new Cell());
            }
        }
        this.RemoveWalls(0,0);
    }

    //for each cell we visit, randomly chose a neighboring cell that hasnt been visited (aka this.visited = false)
    //the remove the wall between them and repeat! Hooray, maze has been made!
    RemoveWalls(r,c){
        
        this.cells[r][c].visited = true;
        const left = 0;
        const bottom = 1;
        const right = 2;
        const top = 3;

        while (true){
            // Find all the directions we could go:
            const possibilities = [];
            if (c>0 && this.cells[r][c-1].visited == false){
                possibilities.push(left);
            }
            if (c < this.width-1 && this.cells[r][c+1].visited == false){
                possibilities.push(right);
            }
            if (r<this.height-1 && this.cells[r+1][c].visited == false){
                possibilities.push(top);
            }
            if (r>0 && this.cells[r-1][c].visited == false){
                possibilities.push(bottom);
            }

            // if possibilites is none then return
            if (possibilities.length == 0){
                return;
            }
            // randomly choose which direction
            const randomDirection = possibilities[Math.floor(Math.random() * possibilities.length)];
            // Go that direction by knocking out walls, and recursing.
            if (randomDirection == left){
                this.cells[r][c].left = false;
                this.cells[r][c-1].right = false;
                this.RemoveWalls(r, c-1);
            }
            else if (randomDirection == right){
                this.cells[r][c].right = false;
                this.cells[r][c+1].left = false;
                this.RemoveWalls(r, c+1);
            }
            else if (randomDirection == top){
                this.cells[r][c].top = false;
                this.cells[r+1][c].bottom = false;
                this.RemoveWalls(r+1, c);
            }
            else { //randomDirection == bottom
                this.cells[r][c].bottom = false;
                this.cells[r-1][c].top = false;
                this.RemoveWalls(r-1, c);
            }
        }
    }

    draw(gl, shaderProgram){
        for(let r = 0; r < this.height; r++){
            for(let c = 0; c < this.width; c++){
                this.cells[r][c].draw(gl, shaderProgram, c, r);
            }
        }
    }
}

export {Maze};