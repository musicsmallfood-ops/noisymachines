const CANVAS_ID_NOISE = "tv-noise-canvas";
const CANVAS_ID_LOGO = "tv-logo";
const CONTEXT_TYPE_2D = "2d";
const NOISE_ALPHA_VALUE = 120;
const RGB_MAX_VALUE = 256;
const RGB_MAX_INDEX = 255;
const CHANNELS_PER_PIXEL = 4;
const HUM_BAR_HEIGHT = 40;
const HUM_BAR_SPEED = 2;
const HUM_BAR_BRIGHTNESS_FACTOR = 1.5;
const EVENT_RESIZE = "resize";

const LOGO_SRC = "favicon.png";
const ROTATION_SPEED = 0.002;
const REFLECTION_INTERVAL_X = 3000;
const REFLECTION_INTERVAL_Y = 5000;
const TRAIL_DELAY_GREEN = 4;
const TRAIL_DELAY_BLUE = 8;
const MAX_HISTORY_LENGTH = 20;

const LOGO_WIDTH_SCALE = 0.2;
const HALF_DIVISOR = 2;
const ZERO_VALUE = 0;
const ONE_VALUE = 1;
const NEGATIVE_ONE_VALUE = -1;
const REFLECTION_TOGGLE_MODULO = 2;

const COMPOSITE_SCREEN = "screen";
const COMPOSITE_SOURCE_IN = "source-in";
const COLOR_RED = "red";
const COLOR_GREEN = "green";
const COLOR_BLUE = "blue";
const ALPHA_CHANNEL_OFFSET = 3;

const noiseCanvas = document.getElementById(CANVAS_ID_NOISE);
const noiseCtx = noiseCanvas.getContext(CONTEXT_TYPE_2D);
const logoCanvas = document.getElementById(CANVAS_ID_LOGO);
const logoCtx = logoCanvas.getContext(CONTEXT_TYPE_2D);

const logoImage = new Image();
logoImage.src = LOGO_SRC;

let humBarY = ZERO_VALUE;
let stateHistory = [];
let canvasesPrepared = false;
let animationStarted = false;

const colorCanvases = {
    [COLOR_RED]: document.createElement('canvas'),
    [COLOR_GREEN]: document.createElement('canvas'),
    [COLOR_BLUE]: document.createElement('canvas')
};

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    logoCanvas.width = width;
    logoCanvas.height = height;
}

function generateNoise(imageData) {
    const data = imageData.data;
    const length = data.length;
    for (let i = ZERO_VALUE; i < length; i += CHANNELS_PER_PIXEL) {
        const value = Math.floor(Math.random() * RGB_MAX_VALUE);
        data[i] = value;
        data[i + ONE_VALUE] = value;
        data[i + HALF_DIVISOR] = value;
        data[i + ALPHA_CHANNEL_OFFSET] = NOISE_ALPHA_VALUE;
    }
}

function applyHumBar(imageData) {
    const data = imageData.data;
    const width = noiseCanvas.width;
    const height = noiseCanvas.height;
    const maxColorValue = RGB_MAX_INDEX;

    humBarY = (humBarY + HUM_BAR_SPEED) % height;

    const startY = Math.floor(humBarY);
    const endY = startY + HUM_BAR_HEIGHT;

    for (let y = startY; y < endY; y++) {
        if (y < ZERO_VALUE || y >= height) continue;
        for (let x = ZERO_VALUE; x < width; x++) {
            const index = (y * width + x) * CHANNELS_PER_PIXEL;
            data[index] = Math.min(maxColorValue, data[index] * HUM_BAR_BRIGHTNESS_FACTOR);
            data[index + ONE_VALUE] = Math.min(maxColorValue, data[index + ONE_VALUE] * HUM_BAR_BRIGHTNESS_FACTOR);
            data[index + HALF_DIVISOR] = Math.min(maxColorValue, data[index + HALF_DIVISOR] * HUM_BAR_BRIGHTNESS_FACTOR);
        }
    }
}

function prepareColorCanvases() {
    const w = logoImage.width;
    const h = logoImage.height;
    if (w === ZERO_VALUE) return;

    const colors = [COLOR_RED, COLOR_GREEN, COLOR_BLUE];
    for (let i = ZERO_VALUE; i < colors.length; i++) {
        const color = colors[i];
        const c = colorCanvases[color];
        c.width = w;
        c.height = h;
        const ctx = c.getContext(CONTEXT_TYPE_2D);
        ctx.drawImage(logoImage, ZERO_VALUE, ZERO_VALUE);
        ctx.globalCompositeOperation = COMPOSITE_SOURCE_IN;
        ctx.fillStyle = color;
        ctx.fillRect(ZERO_VALUE, ZERO_VALUE, w, h);
    }
}

function drawChannel(color, state, centerX, centerY, logoWidth, logoHeight) {
    if (!state) return;
    logoCtx.save();
    logoCtx.translate(centerX, centerY);
    logoCtx.rotate(state.rotation);
    logoCtx.scale(state.reflectionX, state.reflectionY);
    logoCtx.globalCompositeOperation = COMPOSITE_SCREEN;
    const drawX = -logoWidth / HALF_DIVISOR;
    const drawY = -logoHeight / HALF_DIVISOR;
    logoCtx.drawImage(colorCanvases[color], drawX, drawY, logoWidth, logoHeight);
    logoCtx.restore();
}

function updateLogoAnimation(time) {
    logoCtx.clearRect(ZERO_VALUE, ZERO_VALUE, logoCanvas.width, logoCanvas.height);
    
    if (!logoImage.complete || logoImage.width === ZERO_VALUE) {
        return;
    }
    if (!canvasesPrepared) {
        prepareColorCanvases();
        canvasesPrepared = true;
    }

    const rotation = time * ROTATION_SPEED;
    const reflectionX = (Math.floor(time / REFLECTION_INTERVAL_X) % REFLECTION_TOGGLE_MODULO === ZERO_VALUE) ? ONE_VALUE : NEGATIVE_ONE_VALUE;
    const reflectionY = (Math.floor(time / REFLECTION_INTERVAL_Y) % REFLECTION_TOGGLE_MODULO === ZERO_VALUE) ? ONE_VALUE : NEGATIVE_ONE_VALUE;

    stateHistory.unshift({ rotation, reflectionX, reflectionY });
    if (stateHistory.length > MAX_HISTORY_LENGTH) {
        stateHistory.pop();
    }

    const centerX = logoCanvas.width / HALF_DIVISOR;
    const centerY = logoCanvas.height / HALF_DIVISOR;
    const logoWidth = logoCanvas.width * LOGO_WIDTH_SCALE;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

    const blueIndex = Math.min(TRAIL_DELAY_BLUE, stateHistory.length - ONE_VALUE);
    const greenIndex = Math.min(TRAIL_DELAY_GREEN, stateHistory.length - ONE_VALUE);

    drawChannel(COLOR_BLUE, stateHistory[blueIndex], centerX, centerY, logoWidth, logoHeight);
    drawChannel(COLOR_GREEN, stateHistory[greenIndex], centerX, centerY, logoWidth, logoHeight);
    drawChannel(COLOR_RED, stateHistory[ZERO_VALUE], centerX, centerY, logoWidth, logoHeight);
}

function loop(time) {
    const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
    generateNoise(imageData);
    applyHumBar(imageData);
    noiseCtx.putImageData(imageData, ZERO_VALUE, ZERO_VALUE);
    updateLogoAnimation(time);
    requestAnimationFrame(loop);
}

function startAnimation() {
    if (animationStarted) {
        return;
    }
    animationStarted = true;
    resize();
    requestAnimationFrame(loop);
}

window.addEventListener(EVENT_RESIZE, resize);
logoImage.onload = startAnimation;

if (logoImage.complete) {
    startAnimation();
}
