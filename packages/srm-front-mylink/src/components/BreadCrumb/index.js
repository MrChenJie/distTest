import React from 'react';
import { Breadcrumb } from 'hzero-ui';
import { Link } from 'react-router-dom';
import './index.less';

export default ({paths=[]}) => {
  function itemRender(item) {
    return (
      <Breadcrumb.Item key={item.name}>
        {item.path ? <Link to={item.path}>{item.name}</Link> : <span>{item.name}</span> }
      </Breadcrumb.Item>
    );
  }

  return (
    <div className="bread-container">
      <Breadcrumb separator=">">
        {
          paths.map(itemRender)
        }
      </Breadcrumb>
    </div>
  );
};