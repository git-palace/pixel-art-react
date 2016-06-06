import React from 'react';

const RadioSelector = (props) => {
  const options = (ops) =>
    ops.map((item, index) =>
      <label htmlFor={`${props.name}-${item.label}`} key={index}>
        <input
          type="radio"
          value={item.value}
          name={item.label}
          id={`${props.name}-${item.label}`}
          onChange={() => { props.change(item.value, props.name); }}
          checked={props.selected === item.value ? 'checked' : null}
        />
        <span>{item.label}</span>
      </label>
    );

  return (
    <fieldset className="radio-selector">
      {props.legend ? <legend>{props.legend}</legend> : null}
      {options(props.options)}
    </fieldset>
  );
};

export default RadioSelector;
