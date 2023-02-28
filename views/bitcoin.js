let canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: undefined,
    y: undefined
};

const colorArray = [
    '#e967fd',
    '#67fd8a',
    '#b21717',
    '#0d735d',
    '#ffeb24',
    '#e82020'];

window.addEventListener('mousemove', ev => {
    mouse.x = ev.x;
    mouse.y=ev.y;
})

window.addEventListener('resize', () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
})
function Circle(x, y, dx , dy, radius){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.originalradius = radius;
    this.color = colorArray[Math.floor(Math.random()*colorArray.length)];
    this.draw = function (){
        c.beginPath();
        c.arc(this.x,this.y, this.radius, 0, Math.PI*2, false );
        c.strokeStyle = this.color;
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
    }

    this.update = function (){
        if(this.x + this.radius > innerWidth || this.x < 0 ){
            this.dx = -this.dx;
        }
        if(this.y + this.radius > innerHeight || this.y < 0 ){
            this.dy = -this.dy;
        }
        this.x+=this.dx;
        this.y+=this.dy;

        //interactivity
        if((mouse.x - this.x < 50 && mouse.x - this.x > -50)
            && (mouse.y - this.y < 50 && mouse.y - this.y > -50) && this.radius < 150){
            this.radius++;
        }else if(this.radius > this.originalradius && this.radius > 1){
            this.radius--;
        }

        this.draw();
    }

}

let circle = new Circle(200, 300, 3, -3,30);

let circleArray = [];


function init(){
    circleArray = [];
    for(let i = 0; i < 500; i++){
        let radius = Math.random() * 3 + 2;
        let x = Math.random()* (window.innerWidth - radius*2) + radius;
        let y = Math.random()* (window.innerHeight - radius*2) + radius;
        let dx = 2*(Math.random()-0.5);
        let dy = 2*(Math.random()-0.5);

        circleArray.push(new Circle(x,y,dx,dy,radius));

    }
}
function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0, innerWidth,innerHeight);
    for(let i = 0;i < circleArray.length;i++){
        circleArray[i].update();
    }
    circle.update();
}

init();
animate();