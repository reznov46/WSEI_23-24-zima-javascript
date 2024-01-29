// Definicja interfejsu dla kuli
interface Ball {
	x: number;
	y: number;
	radius: number;
	speedX: number;
	speedY: number;
}

// Inicjalizacja canvas
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let mouseX = 0;
let mouseY = 0;

function drawLines() {
	for (let i = 0; i < balls.length; i++) {
		for (let j = i + 1; j < balls.length; j++) {
			const distance = Math.sqrt(
				(balls[i].x - balls[j].x) ** 2 + (balls[i].y - balls[j].y) ** 2
			);
			if (distance < minDistance) {
				ctx.beginPath();
				ctx.moveTo(balls[i].x, balls[i].y);
				ctx.lineTo(balls[j].x, balls[j].y);
				ctx.stroke();
			}
		}
	}
}
function drawBalls() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (const ball of balls) {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fill();
	}
}
function updateBalls() {
	for (const ball of balls) {
		ball.x += ball.speedX;
		ball.y += ball.speedY;

		// Odbijanie od krawędzi
		if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
			ball.speedX = -ball.speedX;
		}
		if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
			ball.speedY = -ball.speedY;
		}
	}
}

function repelFromMouse() {
	for (const ball of balls) {
		const distance = calculateDistance(ball.x, ball.y, mouseX, mouseY);

		if (distance < 30) {
			const angle = Math.atan2(ball.y - mouseY, ball.x - mouseX);
			const force = 10 / distance;
			ball.speedX += force * Math.cos(angle);
			ball.speedY += force * Math.sin(angle);
		}
	}
}

function calculateDistance(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

let animationId: number | null = null;

function animate() {
	drawBalls();
	drawLines();
	updateBalls();
	repelFromMouse();
	animationId = requestAnimationFrame(animate);
}
document.getElementById('startButton')?.addEventListener('click', () => {
	if (!animationId) {
		animationId = requestAnimationFrame(animate);
	}
});

document.getElementById('stopButton')?.addEventListener('click', () => {
	if (animationId) {
		cancelAnimationFrame(animationId);
		animationId = null;
	}
});
// Resetowanie gry po kliknięciu przycisku reset
document.getElementById('resetButton')?.addEventListener('click', () => {
	if (animationId) {
		cancelAnimationFrame(animationId);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		animationId = null;
	}
});

// Ustawienie obsługi zdarzenia dla ruchu myszki
canvas.addEventListener('mousemove', (event) => {
	const rect = canvas.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;
});

canvas.addEventListener('click', (event) => {
	const rect = canvas.getBoundingClientRect();
	const clickedX = event.clientX - rect.left;
	const clickedY = event.clientY - rect.top;

	// Sprawdzenie czy kliknięcie nastąpiło wewnątrz któregoś z okręgów
	for (let i = 0; i < balls.length; i++) {
		const ball = balls[i];
		const distance = calculateDistance(ball.x, ball.y, clickedX, clickedY);
		console.log(distance);

		if (distance < ball.radius + 10) {
			console.log('in');

			// Usunięcie klikniętej kuli
			balls.splice(i, 1);

			// Dodanie dwóch nowych kul
			balls.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				radius: 10,
				speedX: (Math.random() - 0.5) * 5,
				speedY: (Math.random() - 0.5) * 5,
			});

			balls.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				radius: 10,
				speedX: (Math.random() - 0.5) * 5,
				speedY: (Math.random() - 0.5) * 5,
			});

			break; // Wyjście z pętli po kliknięciu jednej kuli
		}
	}
});

function ballFactory(canvasWidth: number, canvasHeight: number) {
	return () => {
		const newBall: Ball = {
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			radius: 10,
			speedX: (Math.random() - 0.5) * 5,
			speedY: (Math.random() - 0.5) * 5,
		};
		return newBall;
	};
}

const ballCount = 5;
const minDistance = 200;
const balls: Ball[] = [];
const bf = ballFactory(canvas.width, canvas.height);

for (let i = 0; i < ballCount; i++) {
	balls.push(bf());
}
