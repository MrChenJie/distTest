/**
 * Table - 工作台表格
 * @date: 2022-3-4
 * @author: chenjie
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Tag, Menu, Tooltip } from 'antd';
import { getCurrentLanguage, getCurrentOrganizationId, tableScrollWidth, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import { VERSION_IS_OP } from 'utils/config';
import { operatorRender } from 'utils/renderer';
import exportIcon from '@/assets/buttonIcons/导出.png';
import ExcelExport from '@/components/ExcelExport';
import styles from './index.less';
import { SRM_BID } from '@/common/config';
import { Bind, bind } from 'lodash-decorators';
import { isUndefined, isEmpty, isNil } from 'lodash';
import { Link } from 'react-router-dom';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import uuid from 'uuid/v4';
import SignUpList from './SignUpList';
import Lov from 'components/Lov';
import forwardBackBtn from '@/assets/approval/（转办）btn_forwardback3.png';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberRender } from 'utils/renderer';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import classNames from 'classnames';
import CusButton from '_cus_components/CusButton';

const tenantId = getCurrentOrganizationId();
const currentLanguage = getCurrentLanguage();
const currentUser = getCurrentUser();

@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon',
    'hzero.common'
    ],
})

class List extends PureComponent {
  state = {
    visible: false,
    proId: '',
    selectedRowKeys: [],
    selectedRows: [],
    cachTabKey: 'null',
  };

  componentDidMount() {
    this.getSignUpData()
  }

  componentWillUnmount(props) {
    // if(props.pagination) {
      // console.log('props.pagination', props.pagination)
    // }
  }
  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return filterValues;
  }

  // 获取报名响应列表数据
  @Bind()
  getSignUpData() {
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'contractMaintain/getSignUpTableList',
    //   payload: {
    //     proId: 0
    //   },
    // });
  }

  @Bind()
  handleDel(record) {
    const { onDelete } = this.props;
    onDelete(record);
  }

  // 打开模态框
  @Bind()
  showModal(record) {
    this.setState({
      visible: true,
      proId: record.proId
    });
  }

  @Bind()
  handleOk() {
    this.setState({
      visible: false,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  // @Bind()
  // handleHandover(_, record) {
  //   const { onHandover = (e) => e } = this.props;
  //   const { selectedRows } = this.state;
  //   onHandover(selectedRows, record, () => {
  //     this.setState({
  //       selectedRowKeys: [],
  //       selectedRows: [],
  //     });
  //   });
  // }

  /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    const { onClick = (e) => e } = this.props;
    this.setState({ cachTabKey: key });
    onClick(key);
  }

  @Bind()
  handleEdit(record) {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(record.budgetHkdConceal) >= 500000 && Number(record.budgetHkdConceal) <= 1000000;
    const isTalZeroMore = Number(record.budgetHkdConceal) > 1000000;
    // 跳转到流程三简易询价画面
    // 50~100万：50~100万&采购方式为公开询价，邀请询价，单一来源，内部采购，直接谈判
    // 100万以上：100万&采购方式为单一来源，内部采购
    const isContractMidle = (
      isTalZero &&
      (['public_inquiry', 'invitation_inquiry', 'single_source', 'internal_source', 'direct_negotiation'].includes(record.purchaseType))
      ||
      isTalZeroMore &&
      (['single_source', 'internal_source'].includes(record.purchaseType))
    )

    const pathname = isContractMidle ?
    `${isPub ? '/pub' : ''}/ssrc-hk/single-interior/purchase-implement-page-detail?packageNo=${record.packageNo}`
    :
    `${isPub ? '/pub' : ''}/sspo/online-purchase/detail1/${record.proId}/proId`;
    window.open(pathname, '_blank')
  }

  @Bind()
  handleRegistrat(record) {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const pathname = `${isPub ? '/pub' : ''}/sspo/online-purchase/registration/${record.proId}`;
    window.open(pathname, '_blank')
  }

  render() {
    const {
      code,
      dataSource = [],
      loading,
      onSearch = (e) => e,
      tenantsMulti,
      openAuthEditor = () => { },
      signUpList,
      pagination,
      onRowSelectChange = (e) => e,
      rowSelection
      // ...others
    } = this.props;
    const { cachTabKey } = this.state;
    const otherButtonProps = {
      type: 'default',
      icon: null,
      mini: true
    };

    const { loginName } = currentUser;

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
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
        editable: true,
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'packageNo',
        title: intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'packageName',
        title: intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称'),
        width: 200,
        render: (_, record) => {
          if (record.proList === null || (record.packageNo && JSON.stringify(record.packageNo).indexOf('-00') == -1)) {
            return (
              <div>{tooltipRender(record.packageName)}</div>
            )
          }
        }
      },
      {
        dataIndex: 'proStateMeaning',
        title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
        width: currentLanguage === 'zh_CN' ? 80 : 95,
        render: (_, record) => {
          if (record.proState === 'completed') {
            return (
              <span className={classNames(styles['spanStatus'], styles['ant-tag-green'])}>
                {intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}
              </span>
            );
          } else if(record.proState === 'closed') {
            return (
              <span className={classNames(styles['spanStatus'], styles['ant-tag-red'])}>
                {intl.get(`bid.biddashbord.view.title.closed`).d('已关闭')}
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
      // {
      //   dataIndex: 'demandPrtDeptName',
      //   title: intl.get(`bid.biddashbord.model.title.superiorDemandDepartment`).d('需求部'),
      //   width: 300,
      //   render: tooltipRender,
      // },
      {
        dataIndex: 'demandDeptName',
        title: intl.get(`bid.biddashbord.model.title.demandDepartment`).d('需求部门'),
        width: 300,
        render: tooltipRender,
      },
      {
        dataIndex: 'demanderName',
        title: intl.get(`bid.biddashbord.model.title.demandPerson`).d('需求人'),
        width: 250,
        render: tooltipRender,
      },
      {
        dataIndex: 'currencyTotal',
        title: intl.get(`bid.bidcommon.view.title.currency`).d('币种'),
        width: 150,
        render: tooltipRender,
      },
      {
        dataIndex: 'budgetOriginalAmountTotal',
        title: intl.get(`bid.bidcommon.bid.title.TotalBudgetoriginalcurrencydashbord`).d('预算总额(原币)'),
        width: 150,
        render: (_, record) => {
          if (record.proList === null) {
            return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.budgetOriginalAmountTotal, 2))}</div>;
          } else {
            // if (record.packageNo && JSON.stringify(record.packageNo).indexOf('-00') == -1) {
            //   return <div style={{ textAlign: 'center' }}>-</div>
            // } else {
              return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.budgetOriginalAmountTotal, 2))}</div>;
            // }
          }
        },
      },
      {
        dataIndex: 'budgetLocalAmountTotal',
        title: intl.get(`bid.bidcommon.bid.title.BudgetAmountHK`).d('预算总额(港币)'),
        width: 150,
        render: (_, record) => {
          if (record.proList === null) {
            return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.budgetLocalAmountTotal, 2))}</div>;
          } else {
            // if (record.packageNo && JSON.stringify(record.packageNo).indexOf('-00') == -1) {
            //   return <div style={{ textAlign: 'center' }}>-</div>
            // } else {
              return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.budgetLocalAmountTotal, 2))}</div>;
            // }
          }
        },
      },
      // {
      //   dataIndex: 'exchangeRate',
      //   title: intl.get(`bid.bidcommon.view.title.exchangerate`).d('汇率'),
      //   width: 150,
      // },
      // {
      //   dataIndex: 'productTypeMeaning',
      //   title: intl.get(`bid.bidcommon.view.title.typedashbord`).d('种类'),
      //   width: 200,
      //   render: tooltipRender,
      // },
      // {
      //   dataIndex: 'productNameMeaning',
      //   title: intl.get(`bid.bidcommon.view.title.productname`).d('产品名称'),
      //   width: 150,
      //   render: tooltipRender,
      // },
      {
        dataIndex: 'purchaseSubmitDate',
        title: tooltipRender(
          intl.get(`bid.bidcommon.bid.title.timeOfSubmissionOfPurchaseScheme`).d('采购方案提交时间')
        ),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'purchaseApprovalDate',
        title: tooltipRender(
          intl.get(`bid.bidcommon.bid.title.timeOfPurchaseSchemeApproval`).d('采购方案审批时间')
        ),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'purchaseTypeMeaning',
        title: intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式'),
        width: 150,
        render: tooltipRender,
      },
      {
        dataIndex: 'purchasingEmpName',
        title: intl.get(`bid.bidcommon.bid.title.Procurementoperator`).d('采购经办人'),
        width: 250,
        render: tooltipRender,
      },
      {
        dataIndex: 'transferorEmpName',
        title: intl.get(`bid.bidcommon.bid.title.Handoverhandler`).d('交接经办人'),
        width: 250,
        render: tooltipRender,
      },
      {
        dataIndex: 'operator',
        title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
        width: currentLanguage === 'zh_CN' ? 135: 220,
        fixed: 'right',
        render: (_, record) => {
          // 当前登录人loginName等于采购经办人和交接经办人
          const isLogin = [loginName].includes(record.purchasingEmpNum) || [loginName].includes(record.transferorEmpNum);
          if(record.proList === null || (record.packageNo && JSON.stringify(record.packageNo).indexOf('-00') == -1)) {
            return (
              <>
                <CusButton type="plain" onClick={() => this.handleEdit(record)} style={{ marginRight: '16px' }}>
                  {isLogin ? intl.get(`bid.bidcommon.bid.button.edit`).d('编辑') : intl.get(`hzero.common.upload.view`).d('查看')}
                </CusButton>
                {(record.purchaseType === 'public_bidding' || record.purchaseType === 'public_inquiry' || record.purchaseType === 'public_negotiation') && <CusButton type="plain" onClick={() => this.handleRegistrat(record)}>
                  {isLogin ? intl.get(`bid.bidcommon.bid.button.RegistrationApproval`).d('报名审批') : ''}
                </CusButton>}
              </>
            )
          }
        }
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource,
      // loading,
      columns,
      pagination,
      bordered: true,
      childrenColumnName: 'proList',
      rowKey: 'proId',
      rowSelection: rowSelection,
      scroll: { x: tableScrollWidth(columns) },
      onChange: onSearch,
      resizable: true,
      // ...others,
    };
    return (
      <React.Fragment>
        {/* <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
          <Col span={24} className={styles['customize-buttons']}>
          <Lov
           isButton
           code="BID.ASSIGNDEMANDER"
           queryParams={{ tenantId: tenantId }}
           onChange={this.handleHandover}
           disabled={selectedRowKeys.length === 0 || loading}
           >
            <img src={forwardBackBtn} alt="" />
            {intl.get(`bid.bidcommon.bid.button.ProjectHandover`).d('项目交接')}
          </Lov>
            <ExcelExport
              requestUrl={`${SRM_BID}/v1/${tenantId}/bid-pro-infos/exportProInfo`}
              // queryParams={this.handleGetFormValue()}
              otherButtonProps={otherButtonProps}
              buttonText={
                <>
                  <img src={exportIcon} alt="" />
                  {intl.get(`bid.bidcommon.view.button.export`).d('导出')}
                </>
              }
            />
          </Col>
        </Row> */}
        {/* <Menu onClick={this.props.onClick} defaultSelectedKeys={['null']} mode="horizontal" style={{ marginLeft: '-16px', marginBottom: '16px', borderBottom: '0', fontSize: '14px', lineHeight: '22px', height: '26px' }}>
          <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.props.stateString == null ? 'ant-menu-item-active' : '']]} key='null'>{intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量')}</Menu.Item>
          <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.props.stateString == 'in_process' ? 'ant-menu-item-active' : '']]} key='in_process'>{intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中')}</Menu.Item>
          <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.props.stateString == 'completed' ? 'ant-menu-item-active' : '']]} key='completed'>{intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}</Menu.Item>
        </Menu> */}
        <CusSearchTabs
          activeKey={cachTabKey}
          items={[
            {
              label: intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量'),
              key: 'null',
              children: <CusTable {...tableProps} />,
            },
            {
              label: intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中'),
              key: 'in_process',
              children: <CusTable {...tableProps} />,
            },
            {
              label: intl.get(`bid.biddashbord.view.title.completed`).d('已完成'),
              key: 'completed',
              children: <CusTable {...tableProps} />,
            },
            {
              label: intl.get(`bid.biddashbord.view.title.closed`).d('已关闭'),
              key: 'closed',
              children: <CusTable {...tableProps} />,
            },
          ]}
          onChange={this.changeTabs}
        />
        {/* <CusTable {...tableProps} /> */}
        {/* <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zh_CN}> */}
        {/* </LocaleProvider> */}
      </React.Fragment>
    );
  }
}

export default List;
