import React from 'react';
import styled from 'styled-components';
const WrapDiv = styled.div`
  white-space: pre-line;
  font-size: 14px;
  font-weight: normal;
  line-height: 22px;
  letter-spacing: 0px;
  color: #f54a45;
  background: rgba(245, 74, 69, 0.1);
  border-radius: 6px;
  margin: 16px 16px 0;
  padding: 12px 16px;
`;

export default function PageErrorMessage({ message }) {
  return <WrapDiv dangerouslySetInnerHTML={{ __html: message }} />;
}
