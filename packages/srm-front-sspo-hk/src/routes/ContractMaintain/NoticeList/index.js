/**
 * index.js - 协议拟制
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';
import formatterCollections from 'utils/intl/formatterCollections';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Collapse, Tooltip, Row } from 'antd';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { tooltipRender } from '_cus_utils/render';
import classNames from 'classnames';
const { CMHK_LOGIN, APPROVAL_PROCESS } = process.env;

const { Panel } = Collapse;
const currentLanguage = getCurrentLanguage();
@connect(({ loading = {}, contractMaintain = {} }) => ({
  fetchSourceList: loading.effects['contractMaintain/getNoticesLook'],
  fetchSourceLoading: loading.effects['contractMaintain/getNoticesLook1'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.announcement',
    'bid.milestonecommon'
  ],
})

export default class NoticesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailModel: false,
      noticeContent: '',
      activeKey: ['table']
    };
  }
  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.fetchListLook();
    this.switchModalContainerClassName()
  }

  /**
   * fetchListLook - 查询数据(菜单的查看公告列表)
   */
  @Bind()
  fetchListLook(page = {}) {
    const { dispatch, match } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    if (match.params && match.params.flag) {
      dispatch({
        type: 'contractMaintain/getNoticesLook',
        payload: {
          page,
          proId: match.params.flag
        }
      }).then((res) => {
        if (res) {
          const { content = [] } = res;
          const pagination = createPagination(res);
          const newDataSource = content.map((item) => ({
            ...item,
            _status: 'update',
            poOrderId: uuidv4(),
          }));
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              noticeLists: newDataSource,
              noticePagination: pagination,
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'contractMaintain/getNoticesLook1',
        payload: {
          page,
        }
      }).then((res) => {
        if (res) {
          const { content = [] } = res;
          const pagination = createPagination(res);
          const newDataSource = content.map((item) => ({
            ...item,
            _status: 'update',
            poOrderId: uuidv4(),
          }));
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              noticeLists: newDataSource,
              noticePagination: pagination,
            },
          });
        }
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/fetchDetailEnum',
    })
  }

  // 公告详情页面获取的proId传noticiId去查询
  // 去编辑公告
  @Bind
  goToEdit(record) {
    const { match } = this.props;
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    if (record.signUpStartTime) {
      // 1查看公告跳过去编辑(可编辑)。2查看公告跳过去查看(禁止编辑)
      let url = match.params.flag ? `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/${record.noticeId}/0/1`
        : `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/${record.noticeId}/milestoneId/1`;
      window.open(url, '_blank');
    } else {
      let url = `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/offlineNotice/${record.noticeId}`;
      window.open(url, '_blank');
    }
  }

  // 查看公告
  @Bind
  goToDetail(record) {
    const { match } = this.props;
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    if (record.signUpStartTime) {
      let url = match.params.flag ? `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/${record.noticeId}/0/2`
        : `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/${record.noticeId}/milestoneId/2`
      window.open(url, '_blank');
    } else {
      let url = `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/offlineNotice/${record.noticeId}`
      window.open(url, '_blank');
    }
  }
  // 更换modalContainer的类名控制能否移动
  @Bind
  switchModalContainerClassName(flag) {
    if (flag) {
      const container = document.querySelector('.c7n-pro-modal-container');
      if (container) {
        container.className = styles['c7n-pro-modal-container-moveable'];
      }
    } else {
      const container = document.querySelector(`.${styles['c7n-pro-modal-container-moveable']}`);
      if (container) {
        container.className = 'c7n-pro-modal-container';
      }
    }
  }
  // 打开公告内容预览弹框
  @Bind
  previewEmail(record) {
    this.setState({
      noticeContent: record.cnSimpleNoticeContent,
    })
    this.setState({
      emailModel: true,
    })
  }

  // 跳转到报名地址
  @Bind
  goSignUp(openUrl) {
    window.open(openUrl);
  }

  @Bind()
  handleOk() {
    this.setState({
      emailModel: false,
    })
  }
  @Bind()
  handleCancel() {
    this.setState({
      emailModel: false,
    })
  }
  
  // // 跳转到线下公告
  // @Bind()
  // goEditOfflineNotice() {
  //   const isPub = location.pathname.includes('pub');
  //   let url = `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/offlineNotice`
  //   window.open(url, '_blank');
  // }

  // 发起致远流程
  @Bind()
  bpmClick(record) {
    const templateCode = 'BPM_SCM_GGSP';
    if(record.noticeState === 'rough_draft') {
      const urlEncode = encodeURIComponent(`${CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/sspo/OnlineNotices?noticeId=${record.noticeId}&noticeState=${record.noticeState}`);
      const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&formRecordCode=${record.noticeId}&pcThirdContentPageUrl=${urlEncode}`;
      window.open(url, '_blank');
    } else {
      const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`;
      window.open(url, '_blank');
    }
  }

  render() {
    const {
      match,
      fetchSourceList,
      fetchSourceLoading,
      contractMaintain,
    } = this.props;
    const { noticeLists = [], noticePagination = {}, detailEnumMap = {} } = contractMaintain;
    const { noticeState = [], publishState = [] } = detailEnumMap;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      emailModel,
      noticeContent,
      activeKey
    } = this.state;
    const columns = [
      {
        title: intl.get(`bid.announcement.view.title.announname`).d('公告名称'),
        dataIndex: 'cnSimpleNoticeTitle',
        width: 440,
        render: (val, record) => {
          return (
            <Tooltip overlayClassName="customize-tooltip" title={val} >
              <a onClick={() => this.bpmClick(record)}>
                {val}
              </a>
            </Tooltip>
          )
        }
      },
      {
        title: intl.get(`bid.announcement.view.title.registrationtime`).d('报名时间'),
        dataIndex: 'signUpStartTime',
        width: 190,
        render: (val, record) => {
          if (record.signUpStartTime) {
            return tooltipRender(val)
          } else {
            return tooltipRender('N/A')
          }
        }
      },
      {
        title: intl.get(`bid.milestonecommon.view.title.deadline`).d('本阶段截止时间'),
        dataIndex: 'signUpEndTime',
        width: 190,
        render: (val, record) => {
          if (record.signUpEndTime) {
            return tooltipRender(val)
          } else {
            return tooltipRender('N/A')
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.RegistrationLink`).d('报名链接'),
        dataIndex: 'openUrl',
        width: 460,
        render: (val, record) => {
          if (record.openUrl) {
            return (
              <Tooltip title={val} overlayClassName="customize-tooltip" color={'#646A73'} >
                <a className="customize-tooltip-text" onClick={() => { this.goSignUp(record.openUrl) }} >
                  {record.openUrl}
                </a>
              </Tooltip>
            )
          } else {
            return tooltipRender('N/A')
          }
        }
      },
      {
        title: intl.get(`bid.announcement.view.title.announcontent`).d('公告内容'),
        dataIndex: 'cnSimpleNoticeContent',
        width: 90,
        render: (_, record) => {
          return (
            <a onClick={() => { this.previewEmail(record) }}>
              {intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}
            </a>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.ApprovalStatus`).d('审批状态'),
        dataIndex: 'noticeStateMeaning',
        width: 110,
        render: (_, record) => {
          let noticeStateText = '';
          switch (record.noticeState) {
            case 'rough_draft':
            noticeStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-orange'])}>{record.noticeStateMeaning}</span>;
            break;
            case 'completed':
            noticeStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-green'])}>{record.noticeStateMeaning}</span>;
            break;
            case 'under_approval':
            noticeStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-blue'])}>{record.noticeStateMeaning}</span>;
            break;
            case 'off':
            noticeStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-gray'])}>{record.noticeStateMeaning}</span>;
            break;
            default:
            noticeStateText = <span>{record.noticeStateMeaning}</span>;
            break;
           }
          return (noticeStateText)
        }
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
        dataIndex: 'remarks',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.ReleaseStatus`).d('发布状态'),
        dataIndex: 'appproveStateMeaning',
        width: 110,
        render: (_, record) => {
          // publishState.map(item => {
          //   if (item.value === record.appproveState) {
          //     record.appproveState = item.meaning
          //   }
          // })
          // return (
          //   <span>{tooltipRender(record.appproveState)}</span>
          // )
          let appproveStateText = '';
          switch (record.appproveState) {
            case 'published':
              appproveStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-green'])}>{record.appproveStateMeaning}</span>;
            break;
            case 'to_be_released':
              appproveStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-blue'])}>{record.appproveStateMeaning}</span>;
            break;
            case 'off':
              appproveStateText = <span size='small' className={classNames(styles['spanStatus'], styles['ant-tag-gray'])}>{record.appproveStateMeaning}</span>;
              break;
            default:
              appproveStateText = <span>{record.appproveStateMeaning}</span>;
            break;
           }
          return (appproveStateText)
        }
      },
      // {
      //   title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
      //   dataIndex: 'operator',
      //   width: currentLanguage === 'zh_CN' ? 90 : 175,
      //   fixed: 'right',
      //   render: (row, record) => {
      //     if (record.noticeState === 'rough_draft' || record.noticeState === 'refused') {
      //       return (
      //         <span style={{ 'color': '#3271FE', 'cursor': 'pointer' }} onClick={() => this.goToEdit(record)}>{intl.get(`bid.bidcommon.bid.button.Reedit`).d('重新编辑')}</span>
      //       )
      //     } else {
      //       return (
      //         <span style={{ 'color': '#3271FE', 'cursor': 'pointer' }} onClick={() => this.goToDetail(record)}>{intl.get(`bid.bidcommon.bid.button.ViewAnnouncement`).d('查看公告')}</span>
      //       )
      //     }
      //   }
      // }
    ];
    const listProps = {
      dataSource: noticeLists,
      columns,
      pagination: noticePagination,
      onChange: this.fetchListLook,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      // loading: fetchSourceList
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    return (
      <>
        <PageWrapper loading={fetchSourceList || fetchSourceLoading}>
          {/* <Row gutter={24} style={{ textAlign: 'right' }}>
            <CusButton type='primary' onClick={this.goEditOfflineNotice}
              style={{float: 'right', margin: '0 12px 16px 0'}}
            >
              {intl.get(`bid.bidcommon.view.button.OfflineAnnoun`).d('发布线下公告')}
            </CusButton>
          </Row> */}
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => { this.setState({ activeKey: collapseKeys }) }}
          >
            <Panel
              showArrow={false}
              collapsible="disabled"
              header={
                <PanelHeader
                  showArrow={false}
                  title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                  arrowActive={activeKey.includes('table')}
                />}
              key='table'
            >
              <CusTable {...listProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.mailcontent`).d('公告内容')}
          visible={emailModel}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="60%"
        >
          <div style={{ height: '100%', overflow: 'auto', padding: '10px' }}
            dangerouslySetInnerHTML={{ __html: noticeContent }}>
          </div>
        </CusModal>
      </>
    );
  }
}
