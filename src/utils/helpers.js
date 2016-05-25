export function generatePixelDrawCss(pixelGrid, columns, rows, cellSize, type) {
  switch (type) {
    case 'array': {
      // Returns frame data as an array
      const frameData = pixelGrid.reduce((accumulator, currentValue, i) => {
        if (currentValue.get('used')) {
          const xCoord = ((i % columns) * cellSize) + cellSize;
          const yCoord = (parseInt(i / columns, 10) * cellSize) + cellSize;
          const pixelInfo = [];

          pixelInfo.push(`${xCoord}`);
          pixelInfo.push(`${yCoord}`);
          pixelInfo.push('0');
          pixelInfo.push(`#${currentValue.get('color')}`);
          accumulator.push(pixelInfo);
        }

        return accumulator;
      }, []);
      return frameData;
    }
    default: {
      // Returns frame data as CSS string. Value: 'string'
      const cssString = pixelGrid.reduce((accumulator, currentValue, i) => {
        if (currentValue.get('used')) {
          const xCoord = ((i % columns) * cellSize) + cellSize;
          const yCoord = (parseInt(i / columns, 10) * cellSize) + cellSize;

          return `${accumulator} ${xCoord}px ${yCoord}px 0 #${currentValue.get('color')},`;
        }

        return accumulator;
      }, '');
      return cssString.slice(0, -1);
    }
  }
}

/*
 * Return Animation string to paste in CSS code
 *
   The resultant data will look like:
    .pixel-animation {
      position: absolute;
      animation: x 1s infinite;
      ...
     }
     @keyframes x {
      0%, 25%: { box-shadow: ...}
      25.01%, 50%: { box-shadow: ...}
      50.01%, 75%: { box-shadow: ...}
      75.01%, 100%: { box-shadow: ...}
     }
*/
export function exportAnimationData(keyframes, duration) {
  let result = '';
  result += '.pixel-animation { position: absolute;';

  result += `animation: x ${duration}s infinite;`;
  result += `-webkit-animation: x ${duration}s infinite;`;
  result += `-moz-animation: x ${duration}s infinite;`;
  result += `-o-animation: x ${duration}s infinite; }`;

  result += '@keyframes x {';

  for(var key in keyframes) {
    const boxShadow = keyframes[key].boxShadow;
    result += `${key}{ box-shadow: ${boxShadow}}`;
  }
  result += '}';

  return result;
}

/*
 * Return CSS keyframes data for animation of the frames passed
 *
 * The resultant data will look like:
 * {
 *   0%, 25%: { box-shadow: ...}
 *   25.01%, 50%: { box-shadow: ...}
 *   50.01%, 75%: { box-shadow: ...}
 *   75.01%, 100%: { box-shadow: ...}
 * }
 *
 * for intervalData like: [0, 25, 50, 75, 100]
*/
export function generateAnimationCSSData(frames, intervalData, columns, rows, cellSize) {
  const result = frames.reduce((acc, frame, index) => {
    const intervalAcc = acc;
    const currentBoxShadow = generatePixelDrawCss(frame, columns, rows, cellSize, 'string');
    const minValue = index === 0 ? 0 : intervalData[index] + 0.01;
    const maxValue = intervalData[index + 1];
    intervalAcc[`${minValue}%, ${maxValue}%`] =
    { boxShadow:
        `${currentBoxShadow};height: ${cellSize}px; width: ${cellSize}px;`
    };

    return intervalAcc;
  }, {});

  return result;
}

/*
 * Return the interval data array for animation base on the frames passed
 *
 *  All intervals are equivalent
 *
 *  i.e. [0, 25, 50, 75, 100]
*/
export function generateAnimationIntervals(frames) {
  const intervalPercentage = 100 / frames.size;

  const intervalsData = frames.reduce((acc, frame, index) => {
    acc.push(index * intervalPercentage);
    return acc;
  }, []);
  intervalsData.push(100);

  return intervalsData;
}

export function shareDrawing(imageData, text, action) {
  const duration = imageData.duration * 1000; // Milliseconds
  const framesCount = imageData.frames.size;
  let drawingData;

  switch (imageData.type) {
    case 'single': {
      // Just need single frame data
      drawingData = generatePixelDrawCss(
        imageData.activeFrame,
        imageData.columns,
        imageData.rows,
        imageData.cellSize,
        'array'
      );
      break;
    }
    default: {
      // Multiple frame type
      drawingData = imageData.frames.reduce((acc, currentFrame) => {
        acc.push(generatePixelDrawCss(
          currentFrame,
          imageData.columns,
          imageData.rows,
          imageData.cellSize,
          'array'
        ));
        return acc;
      }, []);
      break;
    }
  }

  const css = {
    cols: imageData.columns,
    rows: imageData.rows,
    pixelSize: imageData.cellSize,
    drawingData: JSON.stringify(drawingData),
    text,
    type: imageData.type,
    animationInfo: {
      duration,
      equalIntervalDelay: duration / framesCount,
      framesCount,
      intervals: generateAnimationIntervals(imageData.frames)
    }
  };

  switch (action) {
    case 'download':
      $.ajax({
        method: 'POST',
        url: '/auth/download',
        data: css
      }).done((data) => {
        window.open(data);
      });
      break;
    case 'twitter':
      $.ajax({
        method: 'POST',
        url: '/auth/twitter',
        data: css
      }).done((data) => {
        window.location = data;
      });
      break;
    default:
  }
}
