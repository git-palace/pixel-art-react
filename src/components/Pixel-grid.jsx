import React from 'react';
import { PixelCellContainer } from './Pixel-cell';
import { connect } from 'react-redux';

export class Grid extends React.Component {
  getCells() {
    const { gridData, columns, currentColor } = this.props;
    const width = 100 / columns;
    return gridData.toJS().map((currentCell, i) => {
      return (
        <PixelCellContainer
          key={i}
          id={i}
          width={width}
          color={currentCell.color}
          currentColor={currentColor}
        />
      );
    });
  }

  render() {
    const style = {
      lineHeight: '0px',
      minHeight: '1px',
      margin: '0 auto',
      width: '80%'
    };

    return (
      <div className="grid-container" style={style}>
        {this.getCells()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    gridData: state.present.get('grid'),
    cellSize: state.present.get('cellSize'),
    columns: state.present.get('columns'),
    currentColor: state.present.get('currentColor')
  };
}
export const GridContainer = connect(mapStateToProps)(Grid);
