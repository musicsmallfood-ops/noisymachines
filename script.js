const CANVAS_ID = "tv-noise-canvas";
const LOGO_ID = "tv-logo";
const CONTEXT_TYPE = "2d";
const NOISE_ALPHA_VALUE = 180;
const RGB_MAX_VALUE = 256;
const CHANNELS_PER_PIXEL = 4;
const HUM_BAR_HEIGHT = 40;
const HUM_BAR_SPEED = 2;
const HUM_BAR_BRIGHTNESS_FACTOR = 1.5;
const LOGO_FLIP_INTERVAL = 3000;
const LOGO_FLIP_PROBABILITY = 0.5;
const COORDINATE_OFFSET_PERCENT = "-50%";

const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext(CONTEXT_TYPE);
const logo = document.getElementById(LOGO_ID);

let humBarY = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function generateNoise(imageData) {
    const data = imageData.data;
    const length = data.length;

    for (let i = 0; i < length; i += CHANNELS_PER_PIXEL) {
        const value = Math.floor(Math.random() * RGB_MAX_VALUE);
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = NOISE_ALPHA_VALUE;
    }
}

function applyHumBar(imageData) {
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const maxColorValue = RGB_MAX_VALUE - 1;

    humBarY = (humBarY + HUM_BAR_SPEED) % height;

    for (let y = Math.floor(humBarY); y < Math.floor(humBarY) + HUM_BAR_HEIGHT; y++) {
        if (y < 0 || y >= height) continue;
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * CHANNELS_PER_PIXEL;
            data[index] = Math.min(maxColorValue, data[index] * HUM_BAR_BRIGHTNESS_FACTOR);
            data[index + 1] = Math.min(maxColorValue, data[index + 1] * HUM_BAR_BRIGHTNESS_FACTOR);
            data[index + 2] = Math.min(maxColorValue, data[index + 2] * HUM_BAR_BRIGHTNESS_FACTOR);
        }
    }
}

function updateLogoFlipping() {
    const flipX = Math.random() > LOGO_FLIP_PROBABILITY;
    const flipY = Math.random() > LOGO_FLIP_PROBABILITY;
    
    const scaleX = flipX ? -1 : 1;
    const scaleY = flipY ? -1 : 1;

    logo.style.transform = `translate(${COORDINATE_OFFSET_PERCENT}, ${COORDINATE_OFFSET_PERCENT}) scale(${scaleX}, ${scaleY})`;
}

function loop() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    generateNoise(imageData);
    applyHumBar(imageData);
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
resize();
setInterval(updateLogoFlipping, LOGO_FLIP_INTERVAL);
loop();
