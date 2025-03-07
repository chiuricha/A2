const canvas = document.getElementById('game'); // Corrected id
const context = canvas.getContext('2d');

const minTunnelWidth = 400;
const maxTunnelWidth = canvas.clientWidth;
const minheight = 10;
const maxheight = 100;

const obstacleWidth = 130; // Increased obstacle width

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

const helicopterImg = new Image();
helicopterImg.src = 'assets/helicopter.png';

const backgroundImg = new Image();
backgroundImg.src = 'assets/background.png';

const obstacleImg = new Image();
obstacleImg.src = 'assets/obstacle.png';

let obstacleAspectRatio;

obstacleImg.onload = function() {
    obstacleAspectRatio = obstacleImg.width / obstacleImg.height;
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
let score = 0; // Initialize score
let gameOver = false; // Initialize game over flag

function resetGame() {
    score = 0;
    gameOver = false;
    helicopter.x = 200;
    helicopter.y = 100;
    helicopter.dy = 0;
    helicopter.ddy = 0;
    tunnels = [{
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
    obstacles = [];
    for (let i = 1; i <= 5; i++) {
        obstacles.push({
            x: canvas.width * i,
            y: randInt(maxheight + 50, canvas.height - obstacleWidth / obstacleAspectRatio - maxheight - 50)
        });
    }
    rAF = requestAnimationFrame(loop);
}

function isColliding(rect1, rect2) {
    return !(rect1.x > rect2.x + rect2.width ||
             rect1.x + rect1.width < rect2.x ||
             rect1.y > rect2.y + rect2.height ||
             rect1.y + rect1.height < rect2.y);
}

function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    context.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    if (spacePressed) {
        helicopter.ddy = -0.7;
    } else {
        helicopter.ddy = 0;
    }

    helicopter.dy += helicopter.ddy + gravity;
    helicopter.dy = clamp(helicopter.dy, -8, 8);
    helicopter.y += helicopter.dy;

    context.drawImage(helicopterImg, helicopter.x, helicopter.y, helicopter.width, helicopter.height);

    context.fillStyle = 'green';
    tunnels.forEach((tunnel, index) => {
        tunnel.x -= moveSpeed;

        if (index === tunnels.length - 1 && tunnel.x + tunnel.width < canvas.width) {
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

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= moveSpeed;
        const obstacleHeight = obstacleWidth / obstacleAspectRatio;
        context.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);

        if (index === obstacles.length - 1 && obstacle.x + obstacleWidth <= canvas.width) {
            obstacles.push({
                x: canvas.width * 2,
                y: randInt(maxheight + 50, canvas.height - obstacleHeight - maxheight - 50)
            });
        }

        // Check for collision with helicopter
        if (isColliding(helicopter, { x: obstacle.x, y: obstacle.y, width: obstacleWidth, height: obstacleHeight })) {
            context.strokeStyle = 'red';
            context.setLineDash([5, 15]);
            context.lineWidth = 4;

            context.beginPath();
            context.arc(helicopter.x + helicopter.width / 2, helicopter.y + helicopter.height / 2, helicopter.width, 0, 2 * Math.PI);
            context.stroke();

            cancelAnimationFrame(rAF);
            gameOver = true;
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
            gameOver = true; // Set game over flag
            break; // Stop the loop when collision occurs
        }
    }

    if (!gameOver) {
        // Update and draw the score
        score += 1;
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'left'; // Reset text alignment to left
        context.fillText(`Score: ${score}`, 10, 30);
    } else {
        // Display final score
        context.fillStyle = 'red';
        context.font = '48px Arial';
        context.textAlign = 'center'; // Center align the text
        context.fillText(`Game Over! Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        context.font = '24px Arial';
        context.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 50);
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === ' ') { // Corrected 'Space' to ' '
        spacePressed = true; // Corrected false to true
    }
    if (e.key === 'Enter' && gameOver) {
        resetGame();
    }
});
document.addEventListener('keyup', function (e) { // Added keyup event listener
    if (e.key === ' ') {
        spacePressed = false;
    }
});
rAF = requestAnimationFrame(loop);