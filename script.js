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

const tvCanvas = document.getElementById(TV_CANVAS_ELEMENT_ID);
const tvContext = tvCanvas.getContext(CANVAS_RENDERING_MODE);

function synchronizeCanvasSize() {
    tvCanvas.width = window.innerWidth;
    tvCanvas.height = window.innerHeight;
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
        const randomGrayscaleIntensity = Math.floor(Math.random() * INTENSITY_RANGE_LIMIT);

        pixelBuffer[bufferPointer + COLOR_CHANNEL_RED_INDEX] = randomGrayscaleIntensity;
        pixelBuffer[bufferPointer + COLOR_CHANNEL_GREEN_INDEX] = randomGrayscaleIntensity;
        pixelBuffer[bufferPointer + COLOR_CHANNEL_BLUE_INDEX] = randomGrayscaleIntensity;
        pixelBuffer[bufferPointer + COLOR_CHANNEL_ALPHA_INDEX] = OPAQUE_ALPHA_VALUE;
    }

    tvContext.putImageData(frameImageData, ORIGIN_COORDINATE, ORIGIN_COORDINATE);
}

function executeAnimationCycle() {
    generateNoiseFrame();
    requestAnimationFrame(executeAnimationCycle);
}

window.addEventListener(WINDOW_RESIZE_EVENT, synchronizeCanvasSize);

synchronizeCanvasSize();
executeAnimationCycle();
