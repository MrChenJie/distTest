import React from 'react';
import styled from 'styled-components';

const PanelDiv = styled.div`
  padding: 12px 16px;
  border: 1px solid #d0d3d6;
  border-radius: 4px;
  background: #ffffff;
  min-height: 489px;
  min-width: 664px;
  height: 100%;
`

export default function(props) {
  return (
    <PanelDiv style={{...props.style}}>
      {props.children}
    </PanelDiv>
  )
}
