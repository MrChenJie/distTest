/**
 * Table - 工作台表格
 * @date: 2022-3-4
 * @author: chenjie
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
// import { Menu } from 'hzero-ui';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import { operatorRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import CusTable from '_cus_components/CusTable';
import styles from './index.less';
import { Tag, Menu, Tooltip } from 'antd';
import { tooltipRender } from '_cus_utils/render';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import classNames from 'classnames';
import CusButton from '_cus_components/CusButton';

const currentLanguage = getCurrentLanguage();
class list extends PureComponent {
  state = {
    visible: false,
    proId: '',
    activeKey: ['form'],
    cachTabKey: '3',
  };

  componentDidMount() {
  }

  @Bind()
  handleEdit(record, text) {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const pathname = `${isPub ? '/pub' : ''}/sspo/demandQa/query/${record.proId}/${record.milestoneId}/${text}`;
    window.open(pathname, '_blank')
  }

  @Bind()
  handleAnswer(record, text) {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const pathname = `${isPub ? '/pub' : ''}/sspo/demandQa/query/${record.proId}/${record.milestoneId}/${text}`;
    window.open(pathname, '_blank')
  }

  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e } = this.props;
    onPageChange(page);
  }

  /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    const { onClick = (e) => e } = this.props;
    this.setState({ cachTabKey: key });
    onClick(key);
  }

  render() {
    const {
      code,
      dataSource = [],
      // loading,
      onListChange = (e) => e,
      tenantsMulti,
      openAuthEditor = () => { },
      signUpList,
      ...others
    } = this.props;
    const { cachTabKey } = this.state;
    const columns = [
      {
        dataIndex: 'proCode',
        title: intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'proName',
        title: intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'packageNo',
        title: intl.get('bid.bidcommon.view.title.packageno').d('标包编号'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'packageName',
        title: intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称'),
        width: 300,
        render: tooltipRender,
      },
      {
        dataIndex: 'proStateMeaning',
        title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
        width: 100,
        render: (_, record) => {
          if (record.proState === 'completed') {
            return (
              <span className={classNames(styles['spanStatus'], styles['ant-tag-green'])}>
                {intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}
              </span>
            );
          } else {
            return (
              <span className={classNames(styles['spanStatus'], styles['ant-tag-blue'])}>
                {intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中')}
              </span>
            );
          }
        }
      },
      {
        dataIndex: 'demandPrtDeptName',
        title: intl.get(`bid.biddashbord.model.title.superiorDemandDepartment`).d('需求部'),
        width: 250,
        render: tooltipRender,
      },
      {
        dataIndex: 'demandDeptName',
        title: intl.get(`bid.biddashbord.model.title.demandDepartment`).d('需求部门'),
        width: 300,
        render: tooltipRender,
      },
      {
        dataIndex: 'demanderName',
        title: intl.get(`bid.biddashbord.model.title.demandPerson`).d('需求人'),
        width: 300,
        render: tooltipRender,
      },
      {
        dataIndex: 'productTypeMeaning',
        title: intl.get(`bid.bidcommon.view.title.typedashbord`).d('种类'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'productNameMeaning',
        title: intl.get(`bid.bidcommon.view.title.productname`).d('产品名称'),
        width: 150,
        render: tooltipRender,
      },
      {
        dataIndex: 'operator',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: currentLanguage === 'zh_CN' ? 105 : 120,
        fixed: 'right',
        render: (_, record) => {
          return (
            <>
              <CusButton
                type="plain"
                onClick={() => this.handleEdit(record, 'edit')}
                style={{ marginRight: '16px' }}
              >
                {intl.get(`bid.bidcommon.view.button.view`).d('查看')}
              </CusButton>
              <CusButton
                type="plain"
                onClick={() => this.handleAnswer(record, 'answer')}
              >
                {intl.get(`bid.bidcommon.view.button.reply`).d('回答')}
              </CusButton>
            </>
          )
        },
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource,
      // loading,
      columns,
      pagination: false,
      bordered: true,
      childrenColumnName: 'proList',
      scroll: { x: tableScrollWidth(columns) },
      onChange: this.handlePageChange,
      ...others,
    };
    return (
      <React.Fragment>
        {/* <Menu onClick={this.props.onClick} defaultSelectedKeys={['3']} mode="horizontal" style={{marginLeft: '-16px', borderBottom: '0', marginBottom: '16px', fontSize: '14px', lineHeight: '22px', height: '26px' }}>
          <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.props.stateString == '3' ? 'ant-menu-item-active' : '']]} key='3'>{intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量')}</Menu.Item>
          <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.props.stateString == '0' ? 'ant-menu-item-active' : '']]} key='0'>{intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中')}</Menu.Item>
          <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.props.stateString == '1' ? 'ant-menu-item-active' : '']]} key='1'>{intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}</Menu.Item>
        </Menu>
        <CusTable {...tableProps} /> */}
        <div className={styles['tabs-pad']}>
          <CusSearchTabs
            activeKey={cachTabKey}
            items={[
              {
                label: intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量'),
                key: '3',
                children: <CusTable {...tableProps} />,
              },
              {
                label: intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中'),
                key: '0',
                children: <CusTable {...tableProps} />,
              },
              {
                label: intl.get(`bid.biddashbord.view.title.completed`).d('已完成'),
                key: '1',
                children: <CusTable {...tableProps} />,
              },
            ]}
            onChange={this.changeTabs}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default list;
