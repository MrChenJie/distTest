import React from 'react';
import { Anchor } from 'antd';

export default (props) => {
  const { children, ...other } = props;

  const anchorProps = {
    ...other,
  };

  return (
    <div className="cus-anchor">
      <Anchor { ...anchorProps }>
        {children}
      </Anchor>
    </div>
  )
}
