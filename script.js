const CANVAS_ID = "tv-noise-canvas";
const LOGO_ID = "tv-logo";
const CONTEXT_TYPE = "2d";
const NOISE_ALPHA_VALUE = 120;
const RGB_MAX_VALUE = 256;
const CHANNELS_PER_PIXEL = 4;
const HUM_BAR_HEIGHT = 40;
const HUM_BAR_SPEED = 2;
const HUM_BAR_BRIGHTNESS_FACTOR = 1.5;
const COORDINATE_OFFSET_VALUE = "-50%";
const FLOAT_AMPLITUDE_X = 20;
const FLOAT_AMPLITUDE_Y = 15;
const FLOAT_SPEED_X = 0.002;
const FLOAT_SPEED_Y = 0.003;
const TRANSFORM_FUNC_TRANSLATE = "translate(";
const TRANSFORM_FUNC_CALC = "calc(";
const TRANSFORM_FUNC_CLOSE = ")";
const CSS_DELIMITER_COMMA = ", ";
const CSS_OPERATOR_PLUS = " + ";
const CSS_UNIT_PX = "px";
const EVENT_RESIZE = "resize";

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

function updateLogoAnimation(time) {
    const offsetX = Math.sin(time * FLOAT_SPEED_X) * FLOAT_AMPLITUDE_X;
    const offsetY = Math.cos(time * FLOAT_SPEED_Y) * FLOAT_AMPLITUDE_Y;
    
    const transformX = TRANSFORM_FUNC_CALC + COORDINATE_OFFSET_VALUE + CSS_OPERATOR_PLUS + offsetX + CSS_UNIT_PX + TRANSFORM_FUNC_CLOSE;
    const transformY = TRANSFORM_FUNC_CALC + COORDINATE_OFFSET_VALUE + CSS_OPERATOR_PLUS + offsetY + CSS_UNIT_PX + TRANSFORM_FUNC_CLOSE;

    logo.style.transform = TRANSFORM_FUNC_TRANSLATE + transformX + CSS_DELIMITER_COMMA + transformY + TRANSFORM_FUNC_CLOSE;
}

function loop(time) {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    generateNoise(imageData);
    applyHumBar(imageData);
    ctx.putImageData(imageData, 0, 0);
    updateLogoAnimation(time);
    requestAnimationFrame(loop);
}

window.addEventListener(EVENT_RESIZE, resize);
resize();
requestAnimationFrame(loop);
