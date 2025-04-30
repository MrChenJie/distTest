import React from 'react';
import { Tabs, Avatar } from 'antd';
import downPng from '@/assets/arrow.svg';

export default class CusSearchTabs extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { items = [], ...otherProps } = this.props;
    const tabsProps = {
      moreIcon: (<Avatar size="small" src={downPng} />),
      ...otherProps,
      items,
      tabBarGutter: 32,
    };

    return (
      <div className={`customize-search-tabs`}>
        <Tabs { ...tabsProps } />
      </div>
    )
  }
}