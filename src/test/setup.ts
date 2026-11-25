// Global test setup for Vitest
import "../utils/promiseWithResolvers";

// Mock HTMLCanvasElement 2D context to avoid loading native C++ node-canvas in worker threads on Windows
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string
  ) {
    if (contextId === "2d") {
      return {
        canvas: this,
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (...args: number[]) => {
          const w = args[2] ?? 1;
          const h = args[3] ?? 1;
          return {
            data: new Array(w * h * 4).fill(0),
          };
        },
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: (text: string) => ({ width: text.length * 10 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
        strokeStyle: "#000000",
        fillStyle: "#000000",
        lineWidth: 1,
        lineCap: "round",
        lineJoin: "round",
        font: "10px sans-serif",
      } as unknown as RenderingContext;
    }
    return null;
  } as unknown as HTMLCanvasElement["getContext"];

  HTMLCanvasElement.prototype.toDataURL = function () {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  };
}
