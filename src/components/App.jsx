import React from 'react';
import { Grid } from './Pixel-grid';
import { DimensionsContainer } from './Dimensions';
import { UndoRedoContainer } from './UndoRedo';
import { PaletteContainer } from './Palette-grid';
import { CssDisplay } from './Css-display';
import { LoadDrawingContainer } from './LoadDrawing';
import { SaveDrawingContainer } from './SaveDrawing';
import { EraserContainer } from './Eraser';
import { ResetContainer } from './Reset';
import { EyedropperContainer } from './Eyedropper';
import { ColorPickerContainer } from './ColorPicker';
import { TwitterButtonContainer } from './TwitterButton';
import { CopyCSS } from './CopyCSS';
import { connect } from 'react-redux';
import * as actionCreators from '../action_creators';
import CookieBanner from 'react-cookie-banner';
import { SimpleSpinner } from './SimpleSpinner';
import { SimpleNotificationContainer } from './SimpleNotification';
import { DownloadDrawingContainer } from './DownloadDrawing';
import { FrameSelector } from './FrameSelector';
import { AddFrameContainer } from './AddFrame';

export class App extends React.Component {
  componentDidMount() {
    this.props.hideSpinner();
    let dataStored = localStorage.getItem('pixel-art-react');
    if (dataStored) {
      dataStored = JSON.parse(dataStored);
      if (dataStored.current) {
        // Load data from web storage
        const { frames, paletteGridData, columns, rows, cellSize } = dataStored.current;
        this.props.setDrawing(
          frames,
          paletteGridData,
          cellSize,
          columns,
          rows
        );
      }
    } else {
      // Initialize web storage
      dataStored = {
        stored: [],
        current: null
      };
      localStorage.setItem('pixel-art-react', JSON.stringify(dataStored));
    }
  }

  render() {
    return (
      <div id="pixel-art-app">
        <SimpleSpinner spin={this.props.loading} />
        <SimpleNotificationContainer
          notification={this.props.notifications}
          fadeInTime={1000}
          fadeOutTime={1500}
          duration={1500}
        />
        <AddFrameContainer />
        <FrameSelector frames={this.props.frames} />
        <div className="grid grid-pad main-block">
          <div className="col-1-4 grid">
            <div className="load-save-container self_clear">
              <div className="load-button-wrapper">
                <LoadDrawingContainer />
              </div>
              <div className="save-button-wrapper">
                <SaveDrawingContainer
                  frames={this.props.frames}
                  columns={this.props.columns}
                  rows={this.props.rows}
                  cellSize={this.props.cellSize}
                  paletteGridData={this.props.paletteGridData}
                />
              </div>
            </div>
            <div className="grid">
              <div className="col-3-4">
                <PaletteContainer />
                <div className="grid grid-pad">
                  <div className="col-1-2">
                    <TwitterButtonContainer
                      maxChars="113"
                      frames={this.props.frames}
                      activeFrameIndex={this.props.activeFrameIndex}
                      columns={this.props.columns}
                      rows={this.props.rows}
                      cellSize={this.props.cellSize}
                      paletteGridData={this.props.paletteGridData}
                    />
                  </div>
                  <div className="col-1-2">
                    <DownloadDrawingContainer
                      activeFrame={this.props.activeFrame}
                      columns={this.props.columns}
                      rows={this.props.rows}
                      cellSize={this.props.cellSize}
                    />
                  </div>
                </div>
              </div>
              <div className="col-1-4 tools-wrapper">
                <EraserContainer />
                <ColorPickerContainer />
                <EyedropperContainer />
              </div>
            </div>
          </div>
          <div className="col-1-2">
            <Grid
              activeFrame={this.props.activeFrame}
              columns={this.props.columns}
              cellSize={this.props.cellSize}
              currentColor={this.props.currentColor}
              eyedropperOn={this.props.eyedropperOn}
              eraserOn={this.props.eraserOn}
            />
          </div>
          <div className="col-1-4">
            <UndoRedoContainer />
            <DimensionsContainer
              frames={this.props.frames}
              columns={this.props.columns}
              rows={this.props.rows}
              cellSize={this.props.cellSize}
              activeFrameIndex={this.props.activeFrameIndex}
            />
            <ResetContainer
              columns={this.props.columns}
              rows={this.props.rows}
              activeFrameIndex={this.props.activeFrameIndex}
            />
            <CopyCSS
              frames={this.props.frames}
              columns={this.props.columns}
              rows={this.props.rows}
              cellSize={this.props.cellSize}
              activeFrameIndex={this.props.activeFrameIndex}
            />
          </div>
        </div>
        <div className="css-container">
          <CssDisplay
            activeFrame={this.props.activeFrame}
            columns={this.props.columns}
            rows={this.props.rows}
            cellSize={this.props.cellSize}
          />
        </div>
        <CookieBanner
          disableStyle
          message="
            This website uses cookies (Twitter sharing and analytics). By
            continuing to use this website you are giving consent to cookies
            being used. Thank you."
          onAccept={() => {}}
          cookie="user-has-accepted-cookies"
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const framesData = state.present.get('frames').toJS();
  const activeFrame = framesData[state.present.get('activeFrameIndex')];

  return {
    loading: state.present.get('loading'),
    notifications: state.present.get('notifications'),
    activeFrame,
    columns: state.present.get('columns'),
    rows: state.present.get('rows'),
    cellSize: state.present.get('cellSize'),
    currentColor: state.present.get('currentColor'),
    eyedropperOn: state.present.get('eyedropperOn'),
    eraserOn: state.present.get('eraserOn'),
    frames: framesData,
    activeFrameIndex: state.present.get('activeFrameIndex'),
    paletteGridData: state.present.get('paletteGridData')
  };
}
export const AppContainer = connect(
  mapStateToProps,
  actionCreators
)(App);
