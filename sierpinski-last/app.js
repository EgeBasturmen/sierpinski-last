const canvas = document.getElementById('sierpinski-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const playAgainButton = document.getElementById('play-again');

const initialSize=canvas.width/2;
let scaleFactor=1;
let translateX=canvas.width/2;
let translateY=canvas.height/2;

let score=0;
let highScore=0;
let gameEnded=false;
let maxDepth=5;
const zoomThreshold=2;

function drawTriangle(x,y,size){
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+size/2,y + size*Math.sqrt(3)/2);
    ctx.lineTo(x-size/2,y + size*Math.sqrt(3)/2);
    ctx.closePath();
    ctx.fill();
}

function isInViewport(x,y,size){
    const height=size*Math.sqrt(3)/2;
    const left=x-size/2;
    const right=x+size/2;
    const top=y;
    const bottom=y +height;
    return !(right < 0 || left > canvas.width || bottom < 0 || top > canvas.height);
}

function drawSierpinski(x,y,size,depth){
    if (!isInViewport(x, y,size)){
        return;
    }

    if (depth===0){
        drawTriangle(x,y,size);
    } else {
        const newSize=size/2;
        const height = newSize*Math.sqrt(3)/2;
        drawSierpinski(x,y,newSize,depth - 1);
        drawSierpinski(x-newSize/2,y+height,newSize,depth - 1);
        drawSierpinski(x+newSize/2,y+height,newSize,depth - 1);
    }
}

function redraw(){
    ctx.clearRect(0, 0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(translateX,translateY);
    ctx.scale(scaleFactor,scaleFactor);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    const size = initialSize;
    let depth = maxDepth;

    if (scaleFactor>=zoomThreshold){
        depth += Math.floor(Math.log2(scaleFactor / zoomThreshold));
    }

    drawSierpinski(canvas.width / 2, canvas.height / 2 - size * Math.sqrt(3) / 4, size, depth);
    ctx.restore();

    if (isScreenWhite()){
        endGame();
    }
}

function isScreenWhite() {
    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const data=imageData.data;
    for (let i=0;i<data.length;i+=4){
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            return false;
        }
    }
    return true;
}

function endGame(){
    if (!gameEnded){
        gameEnded=true;
        alert(`Game Over! Your score: ${score}\nHigh Score: ${highScore}`);
        canvas.removeEventListener('wheel',handleWheel);
    }
}

function handleWheel(event){
    event.preventDefault();

    const zoomFactor=0.1;
    const prevScaleFactor=scaleFactor;

    if (event.deltaY < 0){
        scaleFactor *= (1 + zoomFactor);
        score += 10;
    }

    if (score > highScore){
        highScore=score;
    }

    scoreElement.textContent = `Score: ${score}`;
    highScoreElement.textContent = `High Score: ${highScore}`;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width * canvas.width;
    const mouseY = (event.clientY - rect.top) / rect.height * canvas.height;

    translateX = mouseX - (mouseX - translateX) * (scaleFactor / prevScaleFactor);
    translateY = mouseY - (mouseY - translateY) * (scaleFactor / prevScaleFactor);

    requestAnimationFrame(redraw);
}

canvas.addEventListener('wheel',handleWheel);

function resetGame(){
    score = 0;
    scaleFactor = 1;
    translateX = canvas.width / 2;
    translateY = canvas.height / 2;
    gameEnded = false;
    maxDepth = 5;
    canvas.addEventListener('wheel',handleWheel);
    requestAnimationFrame(redraw);
}

playAgainButton.addEventListener('click',resetGame);

requestAnimationFrame(redraw);