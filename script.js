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
const ROTATION_SPEED = 0.85;
const FLIP_SPEED_X = 0.18;
const FLIP_SPEED_Y = 0.12;
const FLIP_MIN_SCALE = 0.18;
const TRAIL_DELAY_GREEN = 4;
const TRAIL_DELAY_BLUE = 8;
const MAX_HISTORY_LENGTH = 20;
const FAVICON_SIZE = 64;
const FAVICON_UPDATE_INTERVAL = 120;
const STATIC_DURATION = 3000;
const GLITCH_OFFSET_MAX = 5;
const CYCLE_DURATION = 2000;

const LOGO_WIDTH_SCALE = 0.2;
const HALF_DIVISOR = 2;
const ZERO_VALUE = 0;
const ONE_VALUE = 1;
const NEGATIVE_ONE_VALUE = -1;
const REFLECTION_TOGGLE_MODULO = 2;

const COMPOSITE_SCREEN = "screen";
const COMPOSITE_SOURCE_IN = "source-in";
const COMPOSITE_SOURCE_OVER = "source-over";
const COLOR_RED = "red";
const COLOR_GREEN = "green";
const COLOR_BLUE = "blue";
const ALPHA_CHANNEL_OFFSET = 3;

const noiseCanvas = document.getElementById(CANVAS_ID_NOISE);
const noiseCtx = noiseCanvas.getContext(CONTEXT_TYPE_2D);
const logoCanvas = document.getElementById(CANVAS_ID_LOGO);
const logoCtx = logoCanvas.getContext(CONTEXT_TYPE_2D);
const faviconLink = document.querySelector('link[rel="icon"]');
const faviconCanvas = document.createElement('canvas');
const faviconCtx = faviconCanvas.getContext(CONTEXT_TYPE_2D);

const logoImage = new Image();
logoImage.src = LOGO_SRC;

let humBarY = ZERO_VALUE;
let stateHistory = [];
let canvasesPrepared = false;
let animationStarted = false;
let lastFaviconUpdate = ZERO_VALUE;

const colorCanvases = {
    [COLOR_RED]: document.createElement('canvas'),
    [COLOR_GREEN]: document.createElement('canvas'),
    [COLOR_BLUE]: document.createElement('canvas')
};

faviconCanvas.width = FAVICON_SIZE;
faviconCanvas.height = FAVICON_SIZE;

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

function drawChannel(color, state, centerX, centerY, logoWidth, logoHeight, isGlitchActive) {
    if (!state) return;
    logoCtx.save();
    logoCtx.globalCompositeOperation = COMPOSITE_SOURCE_OVER;
    
    let offsetX = 0;
    let offsetY = 0;
    
    if (isGlitchActive) {
        offsetX = (Math.random() - 0.5) * GLITCH_OFFSET_MAX * 2;
        offsetY = (Math.random() - 0.5) * GLITCH_OFFSET_MAX * 2;
    }
    
    const drawX = centerX - logoWidth / HALF_DIVISOR + offsetX;
    const drawY = centerY - logoHeight / HALF_DIVISOR + offsetY;
    
    logoCtx.drawImage(colorCanvases[color], drawX, drawY, logoWidth, logoHeight);
    logoCtx.restore();
}

function updateFavicon(time, rotation, reflectionX, reflectionY) {
    if (!faviconLink) return;
    if (time - lastFaviconUpdate < FAVICON_UPDATE_INTERVAL) return;
    if (!logoImage.complete || logoImage.width === ZERO_VALUE) return;

    lastFaviconUpdate = time;
    faviconCtx.clearRect(ZERO_VALUE, ZERO_VALUE, FAVICON_SIZE, FAVICON_SIZE);
    
    const scale = Math.min(
        FAVICON_SIZE / logoImage.width,
        FAVICON_SIZE / logoImage.height
    );
    const drawWidth = logoImage.width * scale;
    const drawHeight = logoImage.height * scale;
    const drawX = (FAVICON_SIZE - drawWidth) / HALF_DIVISOR;
    const drawY = (FAVICON_SIZE - drawHeight) / HALF_DIVISOR;
    
    faviconCtx.drawImage(
        logoImage,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );

    faviconLink.href = faviconCanvas.toDataURL('image/png');
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

    const centerX = logoCanvas.width / HALF_DIVISOR;
    const centerY = logoCanvas.height / HALF_DIVISOR;
    const logoWidth = logoCanvas.width * LOGO_WIDTH_SCALE;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

    if (time < STATIC_DURATION) {
        logoCtx.drawImage(logoImage, centerX - logoWidth / HALF_DIVISOR, centerY - logoHeight / HALF_DIVISOR, logoWidth, logoHeight);
        return;
    }

    const animTime = time - STATIC_DURATION;
    const cycleTime = animTime % (CYCLE_DURATION * 2);
    const isGlitchActive = cycleTime < CYCLE_DURATION;
    
    const timeSeconds = animTime / 1000;
    const flipX = Math.cos(timeSeconds * FLIP_SPEED_X * Math.PI * 2);
    const flipY = Math.cos(timeSeconds * FLIP_SPEED_Y * Math.PI * 2);
    const reflectionX = Math.sign(flipX) * Math.max(FLIP_MIN_SCALE, Math.abs(flipX));
    const reflectionY = Math.sign(flipY) * Math.max(FLIP_MIN_SCALE, Math.abs(flipY));
    updateFavicon(time, 0, 1, 1);

    stateHistory.unshift({ reflectionX: 1, reflectionY: 1 });
    if (stateHistory.length > MAX_HISTORY_LENGTH) {
        stateHistory.pop();
    }

    const blueIndex = Math.min(TRAIL_DELAY_BLUE, stateHistory.length - ONE_VALUE);
    const greenIndex = Math.min(TRAIL_DELAY_GREEN, stateHistory.length - ONE_VALUE);

    drawChannel(COLOR_BLUE, stateHistory[blueIndex], centerX, centerY, logoWidth, logoHeight, isGlitchActive);
    drawChannel(COLOR_GREEN, stateHistory[greenIndex], centerX, centerY, logoWidth, logoHeight, isGlitchActive);
    drawChannel(COLOR_RED, stateHistory[ZERO_VALUE], centerX, centerY, logoWidth, logoHeight, isGlitchActive);
    
    logoCtx.drawImage(logoImage, centerX - logoWidth / HALF_DIVISOR, centerY - logoHeight / HALF_DIVISOR, logoWidth, logoHeight);
}

function loop(time) {
    const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
    generateNoise(imageData);
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
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});
logoImage.onload = startAnimation;

if (logoImage.complete) {
    startAnimation();
}
