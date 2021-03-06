/**
 * Basic proxy that acts like a 2d canvas context and renders paths
 * to SVG string. Supports limited subset of operations.
 */
export default function createSVGContext(width, height) {
  let allPaths = [];
  let currentPath;

  let api = {
    serialize,
    beginPath,
    lineTo,
    moveTo,
    stroke,
    lineWidth: 1,
    strokeStyle: '#161616'
  }

  return api;

  function serialize() {
    return `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: https://github.com/anvaka/peak-map  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
   viewBox="0 0 ${width} ${height}">
<g id='paths'>
   ${allPaths.reverse().map(x => x.serialize()).join('\n')}
</g>
</svg>`
  }

  function beginPath() {
    currentPath = createPath();
  }

  function lineTo(x, y) {
    currentPath.lineTo(x, y);
  }

  function moveTo(x, y) {
    currentPath.moveTo(x, y);
  }

  function stroke() {
    if (currentPath && !currentPath.isEmpty()) {
      if (api.strokeStyle) {
        currentPath.setStroke(api.strokeStyle);
      }
      if (api.lineWidth) {
        currentPath.setLineWidth(api.lineWidth);
      }
      allPaths.push(currentPath);
    }
  }
}

function createPath() {
  let segments = [];
  let lastCommand = null;
  let stroke, lineWidth;
  let lineCount = 0;

  return {
    lineTo,
    moveTo,
    serialize,
    isEmpty() {
      return lineCount === 0;
    },
    setStroke(strokeStyle) {
      stroke = strokeStyle;
    },
    setLineWidth(customLineWidth) {
      lineWidth = customLineWidth;
    },
  }

  function serialize() {
    let strokeString = stroke ? `stroke="${stroke}" ` : '';
    let lineWidthString = lineWidth !== 1 ? `stroke-width="${lineWidth}"` : '';
    return `<path d="${segments.join(' ')}" fill="none" ${strokeString}${lineWidthString}></path>`
  }

  function moveTo(x, y) {
    let prefix = lastCommand === 'M' ? '' : 'M';
    segments.push(`${prefix}${round(x)} ${round(y)}`)
    lastCommand = 'M';
  }

  function lineTo(x, y) {
    lineCount += 1;
    let prefix = lastCommand === 'L' ? '' : 'L';
    segments.push(`${prefix}${round(x)} ${round(y)}`)
    lastCommand = 'L';
  }
}

function round(x) {
  return Math.round(x * 100)/100
}