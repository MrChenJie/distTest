import React from 'react';
import styled from 'styled-components';
const WrapDiv = styled.div`
  white-space: pre-line;
  font-size: 14px;
  font-weight: normal;
  line-height: 22px;
  letter-spacing: 0px;
  color: ${(props) => (props.type === 'error' ? '#F54A45' : '#1F2329')};
  background: ${(props) => (props.type === 'error' ? 'rgba(245, 74, 69, 0.1)' : '#EAF0FE')};
  border-radius: 6px;
  margin: 16px 16px 0;
  padding: 12px 16px;
  ul {
    margin: 0;
  };
`;

export default function PageMessage({ message, children, type = 'normal', style }) {
  return (
    message
      ? <WrapDiv dangerouslySetInnerHTML={{ __html: message }} type={type} style={style} />
      : <WrapDiv type={type} style={style}>
          {children}
        </WrapDiv>
  );
}
