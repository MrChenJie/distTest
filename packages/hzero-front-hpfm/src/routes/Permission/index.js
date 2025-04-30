import React, { Fragment, PureComponent } from 'react';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import Rule from './Rule';
import Range from './Range';

const contentStyle = {
  paddingTop: 0,
};

@connect(({ global }) => ({
  routerData: global.routerData,
}))
@formatterCollections({ code: ['hpfm.permission', 'hpfm.supplier'] })
export default class Permission extends PureComponent {
  render() {
    // const { routerData, location, history } = this.props;
    const { match } = this.props;
    return (
      <Fragment>
        <Header title={intl.get('hpfm.supplier.view.router.title').d('数据权限')} />
        <Content style={contentStyle}>
          <Tabs animated={false}>
            <Tabs.TabPane
              key="rule"
              tab={intl.get('hpfm.permission.view.router.rule').d('权限规则')}
            >
              <Rule match={match} />
            </Tabs.TabPane>
            <Tabs.TabPane
              key="range"
              tab={intl.get('hpfm.permission.view.router.range').d('权限范围')}
            >
              <Range match={match} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
