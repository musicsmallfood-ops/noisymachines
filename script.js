const TV_CANVAS_ELEMENT_ID = 'tv-noise-canvas';
const CANVAS_RENDERING_MODE = '2d';
const WINDOW_RESIZE_EVENT = 'resize';

const PIXEL_DATA_STRIDE = 4;
const COLOR_CHANNEL_RED_INDEX = 0;
const COLOR_CHANNEL_GREEN_INDEX = 1;
const COLOR_CHANNEL_BLUE_INDEX = 2;
const COLOR_CHANNEL_ALPHA_INDEX = 3;

const INTENSITY_RANGE_LIMIT = 256;
const OPAQUE_ALPHA_VALUE = 255;
const ORIGIN_COORDINATE = 0;

const MAX_CRT_LINES_PER_FRAME = 10;
const MIN_CRT_LINE_HEIGHT = 1;
const MAX_CRT_LINE_HEIGHT = 4;
const CRT_LINE_RED_INTENSITY = 0;
const CRT_LINE_GREEN_INTENSITY = 0;
const CRT_LINE_BLUE_INTENSITY = 0;
const CRT_LINE_ALPHA_TRANSPARENCY = 0.3;
const NUMERIC_ADJUSTMENT_VALUE = 1;
const NUMERIC_HALF_DIVISOR = 2;

const HUM_BAR_HEIGHT_DIVISOR = 4;
const HUM_BAR_SPEED_PIXELS = 2;
const HUM_BAR_RED_INTENSITY = 255;
const HUM_BAR_GREEN_INTENSITY = 255;
const HUM_BAR_BLUE_INTENSITY = 255;
const HUM_BAR_ALPHA_TRANSPARENCY = 0.05;

const FLICKER_INTENSITY_MIN = 0.95;
const FLICKER_INTENSITY_MAX = 1.05;

const LUMINANCE_INTENSITY_FACTOR = 0.9;
const CHROMINANCE_INTENSITY_FACTOR = 0.1;

const tvCanvas = document.getElementById(TV_CANVAS_ELEMENT_ID);
const tvContext = tvCanvas.getContext(CANVAS_RENDERING_MODE);

let humBarVerticalPosition = ORIGIN_COORDINATE;

function synchronizeCanvasSize() {
    tvCanvas.width = window.innerWidth;
    tvCanvas.height = window.innerHeight;
}

function constructRgbaString(red, green, blue, alpha) {
    const OPEN_PAREN = '(';
    const CLOSE_PAREN = ')';
    const COMMA_SPACE = ', ';
    const RGBA_LABEL = 'rgba';
    
    return RGBA_LABEL + OPEN_PAREN + red + COMMA_SPACE + green + COMMA_SPACE + blue + COMMA_SPACE + alpha + CLOSE_PAREN;
}

function applyCrtHorizontalLines() {
    const canvasWidth = tvCanvas.width;
    const canvasHeight = tvCanvas.height;
    const numberOfLines = Math.floor(Math.random() * MAX_CRT_LINES_PER_FRAME);

    tvContext.fillStyle = constructRgbaString(
        CRT_LINE_RED_INTENSITY, 
        CRT_LINE_GREEN_INTENSITY, 
        CRT_LINE_BLUE_INTENSITY, 
        CRT_LINE_ALPHA_TRANSPARENCY
    );

    for (let lineNumber = ORIGIN_COORDINATE; lineNumber < numberOfLines; lineNumber++) {
        const lineYPosition = Math.floor(Math.random() * canvasHeight);
        const lineHeight = Math.floor(Math.random() * (MAX_CRT_LINE_HEIGHT - MIN_CRT_LINE_HEIGHT + NUMERIC_ADJUSTMENT_VALUE)) + MIN_CRT_LINE_HEIGHT;
        
        tvContext.fillRect(ORIGIN_COORDINATE, lineYPosition, canvasWidth, lineHeight);
    }
}

function applyHumBarEffect() {
    const canvasWidth = tvCanvas.width;
    const canvasHeight = tvCanvas.height;
    const humBarHeight = canvasHeight / HUM_BAR_HEIGHT_DIVISOR;

    tvContext.fillStyle = constructRgbaString(
        HUM_BAR_RED_INTENSITY,
        HUM_BAR_GREEN_INTENSITY,
        HUM_BAR_BLUE_INTENSITY,
        HUM_BAR_ALPHA_TRANSPARENCY
    );

    tvContext.fillRect(ORIGIN_COORDINATE, humBarVerticalPosition, canvasWidth, humBarHeight);

    humBarVerticalPosition += HUM_BAR_SPEED_PIXELS;
    if (humBarVerticalPosition >= canvasHeight) {
        humBarVerticalPosition = -humBarHeight;
    }
}

function generateNoiseFrame() {
    const currentWidth = tvCanvas.width;
    const currentHeight = tvCanvas.height;
    
    if (currentWidth === ORIGIN_COORDINATE || currentHeight === ORIGIN_COORDINATE) {
        return;
    }

    const frameImageData = tvContext.createImageData(currentWidth, currentHeight);
    const pixelBuffer = frameImageData.data;
    const bufferLength = pixelBuffer.length;
    const flickerFactor = Math.random() * (FLICKER_INTENSITY_MAX - FLICKER_INTENSITY_MIN) + FLICKER_INTENSITY_MIN;

    for (let bufferPointer = ORIGIN_COORDINATE; bufferPointer < bufferLength; bufferPointer += PIXEL_DATA_STRIDE) {
        const baseLuminance = Math.random() * INTENSITY_RANGE_LIMIT * flickerFactor;
        
        const chrominanceRangeOffset = INTENSITY_RANGE_LIMIT / NUMERIC_HALF_DIVISOR;
        const redChrominance = (Math.random() * INTENSITY_RANGE_LIMIT - chrominanceRangeOffset) * CHROMINANCE_INTENSITY_FACTOR;
        const greenChrominance = (Math.random() * INTENSITY_RANGE_LIMIT - chrominanceRangeOffset) * CHROMINANCE_INTENSITY_FACTOR;
        const blueChrominance = (Math.random() * INTENSITY_RANGE_LIMIT - chrominanceRangeOffset) * CHROMINANCE_INTENSITY_FACTOR;

        const redFinal = (baseLuminance * LUMINANCE_INTENSITY_FACTOR) + redChrominance;
        const greenFinal = (baseLuminance * LUMINANCE_INTENSITY_FACTOR) + greenChrominance;
        const blueFinal = (baseLuminance * LUMINANCE_INTENSITY_FACTOR) + blueChrominance;
        
        pixelBuffer[bufferPointer + COLOR_CHANNEL_RED_INDEX] = Math.max(ORIGIN_COORDINATE, Math.min(Math.floor(redFinal), INTENSITY_RANGE_LIMIT - NUMERIC_ADJUSTMENT_VALUE));
        pixelBuffer[bufferPointer + COLOR_CHANNEL_GREEN_INDEX] = Math.max(ORIGIN_COORDINATE, Math.min(Math.floor(greenFinal), INTENSITY_RANGE_LIMIT - NUMERIC_ADJUSTMENT_VALUE));
        pixelBuffer[bufferPointer + COLOR_CHANNEL_BLUE_INDEX] = Math.max(ORIGIN_COORDINATE, Math.min(Math.floor(blueFinal), INTENSITY_RANGE_LIMIT - NUMERIC_ADJUSTMENT_VALUE));
        pixelBuffer[bufferPointer + COLOR_CHANNEL_ALPHA_INDEX] = OPAQUE_ALPHA_VALUE;
    }

    tvContext.putImageData(frameImageData, ORIGIN_COORDINATE, ORIGIN_COORDINATE);
    applyCrtHorizontalLines();
    applyHumBarEffect();
}

function executeAnimationCycle() {
    generateNoiseFrame();
    requestAnimationFrame(executeAnimationCycle);
}

window.addEventListener(WINDOW_RESIZE_EVENT, synchronizeCanvasSize);

synchronizeCanvasSize();
executeAnimationCycle();
