import React from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../action_creators';
import Modal from 'react-modal';
import { PreviewContainer } from './Preview';

/*
  Avoid error when server-side render doesn't recognize
  localstorage (browser feature)
*/
const browserStorage = (typeof localStorage === 'undefined') ? null : localStorage;

export class LoadDrawing extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalIsOpen: false };
  }

  removeFromStorage(key, e) {
    e.stopPropagation();
    if (!!browserStorage) {
      let dataStored = browserStorage.getItem('pixel-art-react');
      if (dataStored) {
        dataStored = JSON.parse(dataStored);
        dataStored.stored.splice(key, 1);
        browserStorage.setItem('pixel-art-react', JSON.stringify(dataStored));
        this.props.sendNotification('Drawing deleted');
        this.closeModal();
      }
    }
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  drawingClick(data) {
    this.props.setDrawing(
      data.frames,
      data.paletteGridData,
      data.cellSize,
      data.columns,
      data.rows
    );
    this.closeModal();
  }

  giveMeDrawings() {
    if (!!browserStorage) {
      let dataStored = browserStorage.getItem('pixel-art-react');
      if (dataStored) {
        dataStored = JSON.parse(dataStored);

        if (dataStored.stored.length > 0) {
          const styles = {
            delete: {
              position: 'absolute',
              fontSize: '1.7em',
              color: 'red',
              top: 0,
              right: 0,
              cursor: 'no-drop',
              padding: '0.1em',
              backgroundColor: 'white',
              border: '1px solid black'
            },
            wrapper: {
              position: 'relative',
              border: '3px solid black',
              cursor: 'pointer',
              flex: '1 1 25%',
              minHeight: 200,
              margin: '1em'
            }
          };

          return dataStored.stored.map((data, i) => {
            let elem = data;
            elem.cellSize = 5; // Unify cellsize for load preview
            return (
              <div
                key={i}
                style={styles.wrapper}
                onClick={() => { this.drawingClick(elem); }}
              >
                <PreviewContainer
                  key={i + 1}
                  id={i}
                  loadData={elem}
                  activeFrameIndex={0}
                />
                <div
                  data-key={i}
                  style={styles.delete}
                  className="fa fa-trash-o"
                  onClick={(event) => { this.removeFromStorage(i, event); }}
                />
              </div>
            );
          });
        }
      }
    }
    return [];
  }

  render() {
    const customStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        border: '4px solid #C5C5C5',
        width: '80%'
      },
      h2: {
        padding: '2em 0',
        fontSize: '1em',
        display: 'block'
      },
      drawingsWrapper: {
        maxHeight: 400,
        overflowY: 'scroll',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }
    };

    const drawings = this.giveMeDrawings();
    const drawingsStored = drawings.length > 0;
    if (!drawingsStored) {
      customStyles.drawingsWrapper.overflowY = 'hidden';
      customStyles.drawingsWrapper.display = 'block';
    }

    return (
      <div>
        <button
          className="load-drawing red"
          onClick={() => { this.openModal(); }}
        >
          LOAD
        </button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={() => { this.closeModal(); }}
          style={customStyles}
        >
          <button onClick={() => { this.closeModal(); }}>CLOSE</button>
          <h2 style={customStyles.h2}>Select one of your awesome drawings</h2>
          <div style={customStyles.drawingsWrapper}>
            {drawingsStored ? this.giveMeDrawings() : 'Nothing awesome yet...'}
          </div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}
export const LoadDrawingContainer = connect(
  mapStateToProps,
  actionCreators
)(LoadDrawing);
