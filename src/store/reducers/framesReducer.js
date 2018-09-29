import { List, Map, fromJS } from 'immutable';
import shortid from 'shortid';
import {
  create as createGrid,
  resize as resizeGrid,
  applyBucket as applyBucketToGrid,
  drawPixel as drawPixelToGrid
} from './pixelGrid';
import * as types from '../actions/actionTypes';

const create = (cellsCount, intervalPercentage) => Map({
  grid: createGrid(cellsCount),
  interval: intervalPercentage,
  key: shortid.generate()
});

const resetIntervals = (frameList) => {
  const equalPercentage = 100 / frameList.size;

  return frameList.map((frame, index) => {
    const percentage = index ===
      frameList.size - 1 ? 100 : Math.round(((index + 1) * equalPercentage) * 10) / 10;
    return Map({ grid: frame.get('grid'), interval: percentage, key: frame.get('key') });
  });
};

const initFrames = (action = {}) => {
  const options = action.options || {};
  const columns = parseInt(options.columns, 10) || 20;
  const rows = parseInt(options.rows, 10) || 20;
  const list = resetIntervals(List([create(columns * rows)]));
  return Map({
    list,
    columns,
    rows,
    activeIndex: 0
  });
};

const resetGrid = (frames) => {
  const activeIndex = frames.get('activeIndex');
  return frames.updateIn(['list', activeIndex], frame => create(
    frame.get('grid').size,
    frame.get('interval')
  ));
};

const changeActiveFrame = (frames, action) => {
  const activeIndex = action.frameIndex;
  return frames.merge({ activeIndex });
};

const createNewFrame = (frames) => {
  const frameList = frames.get('list');
  const list = resetIntervals(frameList.push(create(
    frameList.getIn([0, 'grid']).size,
    100
  )));
  return frames.merge({
    list,
    activeIndex: frameList.size
  });
};

const deleteFrame = (frames, action) => {
  const { frameId } = action;
  const frameList = frames.get('list');
  if (frameList.size <= 1) {
    return frames;
  }
  const activeIndex = frames.get('activeIndex');
  const reduceFrameIndex = (activeIndex >= frameId) && (activeIndex > 0);
  return frames.merge({
    list: resetIntervals(frameList.splice(frameId, 1)),
  }, reduceFrameIndex ? { activeIndex: frameList.size - 2 } : {});
};

const duplicateFrame = (frames, action) => {
  const { frameId } = action;
  const frameList = frames.get('list');
  const frame = frameList.get(frameId);
  const list = resetIntervals(frameList.splice(
    frameId,
    0,
    Map({
      grid: frame.get('grid'),
      interval: frame.get('interval'),
      key: shortid.generate()
    })
  ));
  return frames.merge({
    list, activeIndex: frameId + 1
  });
};

const changeDimensions = (frames, { gridProperty, increment }) => {
  const dimensions = {
    columns: frames.get('columns'),
    rows: frames.get('rows')
  };
  const list = frames.get('list').map(frame => Map({
    grid:
      resizeGrid(
        frame.get('grid'),
        gridProperty,
        increment,
        dimensions
      ),
    interval: frame.get('interval'),
    key: frame.get('key')
  }));
  return frames.merge({
    list,
    [gridProperty]: frames.get(gridProperty) + increment
  });
};

const changeFrameInterval = (frames, { frameIndex, interval }) =>
  frames.setIn(['list', frameIndex, 'interval'], interval);

const drawPixel = (frames, color, id) => frames.updateIn(
  ['list', frames.get('activeIndex'), 'grid'],
  grid => drawPixelToGrid(grid, color, id)
);

const applyPencil = (frames, { paletteColor, id }) => drawPixel(frames, paletteColor, id);

const applyEraser = (frames, { id }) => drawPixel(frames, '', id);

const applyBucket = (frames, action) => {
  const { id, paletteColor } = action;
  const {
    columns, rows, list, activeIndex
  } = frames.toObject();
  const activeGrid = list.getIn([activeIndex, 'grid']);
  const newGrid = applyBucketToGrid(activeGrid, {
    id, paletteColor, columns, rows
  });

  return frames.setIn(['list', activeIndex, 'grid'], newGrid);
};

const setFrames = (frames, action) => {
  const {
    columns, rows
  } = action;
  const frameList = action.frames;
  return fromJS({
    list: frameList,
    columns,
    rows,
    activeIndex: 0
  });
};

export default function (frames, action) {
  switch (action.type) {
    case types.SET_INITIAL_STATE:
    case types.NEW_PROJECT:
      return initFrames(action);
    case types.SET_DRAWING:
      return setFrames(frames, action);
    case types.APPLY_PENCIL:
      return applyPencil(frames, action);
    case types.APPLY_ERASER:
      return applyEraser(frames, action);
    case types.APPLY_BUCKET:
      return applyBucket(frames, action);
    case types.SET_RESET_GRID:
      return resetGrid(frames);
    case types.CHANGE_ACTIVE_FRAME:
      return changeActiveFrame(frames, action);
    case types.CREATE_NEW_FRAME:
      return createNewFrame(frames);
    case types.DELETE_FRAME:
      return deleteFrame(frames, action);
    case types.DUPLICATE_FRAME:
      return duplicateFrame(frames, action);
    case types.CHANGE_DIMENSIONS:
      return changeDimensions(frames, action);
    case types.CHANGE_FRAME_INTERVAL:
      return changeFrameInterval(frames, action);
    default:
      return frames;
  }
}
