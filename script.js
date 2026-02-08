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

const tvCanvas = document.getElementById(TV_CANVAS_ELEMENT_ID);
const tvContext = tvCanvas.getContext(CANVAS_RENDERING_MODE);

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

function generateNoiseFrame() {
    const currentWidth = tvCanvas.width;
    const currentHeight = tvCanvas.height;

    if (currentWidth === ORIGIN_COORDINATE || currentHeight === ORIGIN_COORDINATE) {
        return;
    }

    const frameImageData = tvContext.createImageData(currentWidth, currentHeight);
    const pixelBuffer = frameImageData.data;
    const bufferLength = pixelBuffer.length;

    for (let bufferPointer = ORIGIN_COORDINATE; bufferPointer < bufferLength; bufferPointer += PIXEL_DATA_STRIDE) {
        const randomRedIntensity = Math.floor(Math.random() * INTENSITY_RANGE_LIMIT);
        const randomGreenIntensity = Math.floor(Math.random() * INTENSITY_RANGE_LIMIT);
        const randomBlueIntensity = Math.floor(Math.random() * INTENSITY_RANGE_LIMIT);

        pixelBuffer[bufferPointer + COLOR_CHANNEL_RED_INDEX] = randomRedIntensity;
        pixelBuffer[bufferPointer + COLOR_CHANNEL_GREEN_INDEX] = randomGreenIntensity;
        pixelBuffer[bufferPointer + COLOR_CHANNEL_BLUE_INDEX] = randomBlueIntensity;
        pixelBuffer[bufferPointer + COLOR_CHANNEL_ALPHA_INDEX] = OPAQUE_ALPHA_VALUE;
    }

    tvContext.putImageData(frameImageData, ORIGIN_COORDINATE, ORIGIN_COORDINATE);
    applyCrtHorizontalLines();
}

function executeAnimationCycle() {
    generateNoiseFrame();
    requestAnimationFrame(executeAnimationCycle);
}

window.addEventListener(WINDOW_RESIZE_EVENT, synchronizeCanvasSize);

synchronizeCanvasSize();
executeAnimationCycle();
