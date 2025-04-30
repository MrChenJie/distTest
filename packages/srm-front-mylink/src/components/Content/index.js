import React from 'react';
import './index.less';

export default (props) => {
  const { title, className = '', operator } = props;
  return (
    <div className={`portal-page-content ${className}`}>
      {(title || operator) && (
        <div className="portal-page-content-top">
          {title && (
            <div className="portal-page-content-title">
              <span>{title}</span>
            </div>
          )}
          {operator && (
            <div className="portal-page-content-operator">
              <span>{operator}</span>
            </div>
          )}
        </div>
      )}
      <div className="portal-page-content-wrapper">{props.children}</div>
    </div>
  );
};
