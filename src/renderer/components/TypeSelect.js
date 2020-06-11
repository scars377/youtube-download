import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 1em;
  background: rgba(0, 0, 0, 0.2);
`;
const Label = styled.label`
  flex: 1;
  line-height: 3em;
  cursor: pointer;
  text-align: center;
  background: ${props => (props.selected ? '#369' : 'none')};
`;

const TypeSelect = ({ type, setType, types }) => (
  <Container>
    {types.map(t => (
      <Label key={t} selected={t === type} onClick={() => setType(t)}>
        {t}
      </Label>
    ))}
  </Container>
);

TypeSelect.propTypes = {
  type: PropTypes.string,
  setType: PropTypes.func,
  types: PropTypes.arrayOf(PropTypes.string),
};

export default TypeSelect;
