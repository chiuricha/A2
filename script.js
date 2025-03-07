const canvas = document.getElementById('game'); // Corrected id
const context = canvas.getContext('2d');

const minTunnelWidth = 400;
const maxTunnelWidth = canvas.clientWidth;
const minheight = 10;
const maxheight = 100;

const obstacleWidth = 65;
const obstacleHeight = 135;

const moveSpeed = 7;

const gravity = 0.35;

let spacePressed = false; // Corrected 'Let' to 'let'

function clamp(num, min, max) {
    return Math.min(Math.max(min, num), max);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const helicopter = {
    x: 200,
    y: 100,
    width: 100,
    height: 60,
    dy: 0,
    ddy: 0
};

let tunnels = [{
    x: 0,
    width: canvas.width,
    start: 50,
    end: 50
},
{
    x: canvas.width,
    width: randInt(minTunnelWidth, maxTunnelWidth),
    start: 50,
    end: randInt(minheight, maxheight)
}];

let obstacles = [{
    x: canvas.width,
    y: canvas.height / 2
},
{
    x: canvas.width * 2,
    y: canvas.height / 2
}];

const wallColor = 'green';
context.fillStyle = wallColor;
context.fillRect(0, 0, 1, 1);

const wallData = context.getImageData(0, 0, 1, 1);

const [wallRed, wallGreen, wallBlue] = wallData.data;

let rAF;
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (spacePressed) {
        helicopter.ddy = -0.7;
    }
    else {
        helicopter.ddy = 0;
    }

    helicopter.dy += helicopter.ddy + gravity;

    helicopter.dy = clamp(helicopter.dy, -8, 8);
    helicopter.y += helicopter.dy;

    context.fillStyle = 'white';
    context.fillRect(helicopter.x, helicopter.y, helicopter.width, helicopter.height);

    context.fillStyle = 'green';
    tunnels.forEach((tunnel, index) => { // Added index parameter
        tunnel.x -= moveSpeed;

        if (
            index === tunnels.length - 1 &&
            tunnel.x + tunnel.width < canvas.width) {
            tunnels.push({
                x: tunnel.x + tunnel.width,
                width: randInt(minTunnelWidth, maxTunnelWidth),
                start: tunnel.end,
                end: randInt(minheight, maxheight)
            });
        }
        context.beginPath();
        context.moveTo(tunnel.x, 0);
        context.lineTo(tunnel.x, tunnel.start);
        context.lineTo(tunnel.x + tunnel.width, tunnel.end);
        context.lineTo(tunnel.x + tunnel.width, 0);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(tunnel.x, canvas.height);
        context.lineTo(tunnel.x, tunnel.start + 450);
        context.lineTo(tunnel.x + tunnel.width, tunnel.end + 450);
        context.lineTo(tunnel.x + tunnel.width, canvas.height);
        context.closePath();
        context.fill();
    });
    obstacles.forEach((obstacle, index) => { // Added index parameter
        obstacle.x -= moveSpeed;
        context.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);

        if (
            index === obstacles.length - 1 &&
            obstacle.x + obstacleWidth <= canvas.width) {
            obstacles.push({
                x: canvas.width * 2,
                y: randInt(maxheight + 50, canvas.height - obstacleHeight - maxheight - 50)
            });
        }
    });

    tunnels = tunnels.filter(tunnel => tunnel.x + tunnel.width > 0);
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacleWidth > 0);

    const { data } = context.getImageData(helicopter.x, helicopter.y, helicopter.width, helicopter.height);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r === wallRed && g === wallGreen && b === wallBlue) {
            context.strokeStyle = 'red';
            context.setLineDash([5, 15]);
            context.lineWidth = 4;

            context.beginPath();
            context.arc(helicopter.x + helicopter.width / 2, helicopter.y + helicopter.height / 2, helicopter.width, 0, 2 * Math.PI);
            context.stroke();

            cancelAnimationFrame(rAF); // Corrected cancel to cancelAnimationFrame
        }
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === ' ') { // Corrected 'Space' to ' '
        spacePressed = true; // Corrected false to true
    }
});
document.addEventListener('keyup', function (e) { // Added keyup event listener
    if (e.key === ' ') {
        spacePressed = false;
    }
});
rAF = requestAnimationFrame(loop);