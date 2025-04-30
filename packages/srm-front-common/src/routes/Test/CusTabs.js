import React from 'react';
import CusTabs from '@/components/CusTabs';
import CusSearchTabs from '@/components/CusSearchTabs';

export default class Tabs extends React.PureComponent {

  state = {
    activeKey: '3'
  }

  render() {
    const items = new Array(14).fill(null).map((_, i) => {
      const id = String(i);
      return {
        label: `Tab-${i + 1}`,
        key: id,
        disabled: i === 28,
        children: `Content of tab ${id}`,
      };
    });
    const { activeKey } = this.state;

    return (
      <>
        <CusTabs
          defaultActiveKey="1"
          items={items}
        />
        <CusSearchTabs
          activeKey={activeKey}
          items={[
            {
              label: intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量'),
              key: '3',
            },
            {
              label: intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中'),
              key: '0',
            },
            {
              label: intl.get(`bid.biddashbord.view.title.completed`).d('已完成'),
              key: '1',
            },
          ]}
          onChange={(val) => this.setState({activeKey: val})}
        />
      </>
    )
  }
}
