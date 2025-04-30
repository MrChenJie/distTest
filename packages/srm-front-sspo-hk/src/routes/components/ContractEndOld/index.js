/*
 * ContractHeader - 采购协议头信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, DatePicker, Button, Upload, Table, Modal, Icon, Select, Tag, Tooltip, LocaleProvider } from 'hzero-ui';
// import deleteIcon from '@/assets/buttonIcons/删除.png';
// import importIcon from '@/assets/buttonIcons/导入.png';
// import exportIcon from '@/assets/buttonIcons/导出.png';
// import addIcon from '@/assets/buttonIcons/新建.png';
// import saveIcon from '@/assets/buttonIcons/保存.png';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import classnames from 'classnames';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import EditTable from 'components/EditTable';
import { operatorRender } from 'utils/renderer';
import qs from 'query-string';
// import ExcelExport from '@/components/ExcelExport';
import intl from 'utils/intl';
import request from 'utils/request';
import notification from 'utils/notification';
// import Lov from 'components/Lov';
import { Link } from 'dva/router';
import { getCurrentOrganizationId, getDateTimeFormat, getAccessToken, isTenantRoleLevel, getCurrentLanguage } from 'utils/utils';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
// import Switch from 'components/Switch';
// import { dateRender, numberRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';
import { HZERO_FILE, API_HOST } from 'utils/config';

import { SRM_BID } from '@/common/config';
// import { downloadFile } from 'hzero-front/lib/services/api';
// import { title } from 'echarts/lib/theme/dark';
import { isString } from 'lodash';
import { Model } from 'echarts/lib/export';
import { getEditTableData, tableScrollWidth } from 'utils/utils';
import { downloadFile } from 'services/api';
import MeetingList from './modal/meetingList';
// import { getAttachmentUrl } from './utils';
import CusNotification from '_cus_components/CusNotification';

// const { TextArea } = Input;
const { Dragger } = Upload;
const FormItem = Form.Item;
// const commonPrompt = 'spcm.purchaseRequisitionCreation.model';
// const common = 'spcm.common.model';
// const promptCode = 'ssrc.priceEntry';
const organizationId = getCurrentOrganizationId()

let newDataList = [];
let itemFlag = true;
/**
 * ContractHeader - 采购协议头信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */

@connect(({ loading = {}, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  supplierMeetingLoading: loading.effects['contractMaintain/supplierListMeeting'],
  organizationId: getCurrentOrganizationId(),
  contractMaintain,
}))
@formatterCollections({
  code: [
    'spcm.purchaseRequisitionCreation',
    'spcm.common',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'hzero.common',
    'bid.bidcommon',
    'bid.milestonecommon',
    'ssrc.quoController'
  ],
})
@Form.create({ fieldNameProp: null })

@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL'],
})
export default class ContractEnd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      // unitIdVisible: false,
      newId: '',
      selectedRowKeys: [],
      continue: 2,
      signFlag: false,
      openFlag: false,
      fileList: [],
      code: 'BID.SCORE_CONFIG',
      visible: false,
      showFlag: false,
      onlineShow: false,
      messageVisible: false,
      supplierSource: [],
      titleList: {
        milestoneEndTime: '',
        milestoneName: ''
      },
      fileModel: false, // 结果查询弹框
      fileEmailModel: false,
      nameFlag: false,
      judgesSorceModel: false,
      startSorceFlag: false,
      qaModalVisibal: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 打开结果查询的弹框
  @Bind()
  showFileBox() {
    this.getResultList()
  }

  // 查看评委评分的弹框
  @Bind()
  openList() {
    this.setState({
      judgesSorceModel: true
    })
    this.getSorceList()
  }

  @Bind
  getSorceList(page = {}) {
    const { dispatch, match } = this.props
    dispatch({
      type: 'contractMaintain/getSorceList',
      payload: {
        page,
        proId: match.params.proId
      },
    })
  }
  @Bind()
  handleOkSorce() {
    this.setState({
      judgesSorceModel: false
    })
  }
  @Bind()
  handleCancelSorce() {
    this.setState({
      judgesSorceModel: false
    })
  }

  @Bind
  showEdit(record) {
    const isPub = location.pathname.includes('pub');
    const { dispatch, history, match } = this.props
    dispatch({
      type: 'contractMaintain/checkEdit',
      payload: {
        // page,
        proId: match.params.proId || 3
      },
    }).then(res => {
      if (res) {
        const path = `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/${match.params.proId}/${record.milestoneId}/1`
        history.push({
          pathname: path,
        });
      } else {
        notification.error({
          message: intl.get('bid.bidcommon.view.message.edditannouncement').d('请先编辑项目答疑、技术商务文件递交的截止时间！'),
        });
      }
    })
  }

  /**
     * 查看中标结果表格数据
    */
  @Bind()
  getResultList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/getResultList',
      payload: {
        page,
        proId: match.params.proId,
        state: 0
      },
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
            resultList: newDataSource,
            resultPagination: pagination,
          },
        });
        this.setState({
          fileModel: true
        })
      }
    });
  }
  @Bind()
  handleOkResult() {
    this.setState({
      fileModel: false
    })
  }
  @Bind()
  handleCancelResult() {
    this.setState({
      fileModel: false
    })
  }

  // 打开结果查看的邮件预览弹框
  @Bind
  previewEmail(record) {
    this.getResultEmailList(record)
  }

  // 查看中标结果表格的邮件表数据
  @Bind
  getResultEmailList(record) {
    const { dispatch, match } = this.props;
    if (record.isBeChosen && record.isBeChosen.length > 0) {
      dispatch({
        type: 'contractMaintain/getResultEmailList',
        payload: {
          supplierId: record.supplierId,
          isBeChosen: record.isBeChosen,
        },
      }).then((res) => {
        this.setState({
          fileEmailModel: true
        })
      });
    } else {
      dispatch({
        type: 'contractMaintain/getBidInviteNot',
        payload: {
          supplierId: record.supplierId ? record.supplierId : record.id,
          proId: match.params.proId,
        },
      }).then((res) => {
        this.setState({
          fileEmailModel: true
        })
      })
    }
  }

  @Bind()
  disabledEnd(endValue, startValue) {
    if (!endValue || !startValue) {
      return false;
    }

    return endValue.valueOf() < startValue.valueOf();

  }

  @Bind()
  disabledStart(endValue, startValue) {
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() > startValue.valueOf();

  }

  @Bind()
  handleOkEmailMore() {
    this.props.reChange(),
      this.setState({
        fileEmailModel: false,
        // onlineShow:false,
      })
  }
  @Bind()
  handleCancelEmailMore() {
    this.props.reChange(),
      this.setState({
        fileEmailModel: false,
        // onlineShow:false,
      })
  }
  @Bind()
  handleOkEmail() {
    this.props.reChange(),
      this.setState({
        fileEmailModel: false,
        onlineShow: false,
      })
  }
  @Bind()
  handleCancelEmail() {
    this.props.reChange(),
      this.setState({
        fileEmailModel: false,
        onlineShow: false,
      })
  }

  // 打开答疑完结确认弹框
  @Bind()
  showQAModal(record) {
    this.setState({ qaModalVisibal: true, qaModalRecord: record });
  }
  @Bind()
  handleCancelQA() {
    this.setState({ qaModalVisibal: false })
  }
  // 答疑完结
  @Bind()
  handleCompletionQA() {
    const { match, dispatch } = this.props;
    const { qaModalRecord } = this.state;
    dispatch({
      type: 'contractMaintain/completionQA',
      payload: {
        milestoneId: qaModalRecord.milestoneId,
      }
    }).then((res) => {
      if (res.message === 'ok') {
        this.props.reChange();
        notification.success();
      } else {
        notification.error();
      }
      this.setState({ qaModalVisibal: false })
    })
  }

  getColumns() {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return [
      {
        title: intl.get('bid.biddashbord.model.title.status').d('状态'),
        key: 'state',
        dataIndex: 'state',
        editable: true,
      },
      {
        title: intl.get('bid.milestonecommon.view.title.milestonearrangementstage').d('里程碑安排阶段'),
        dataIndex: 'milestoneName',
        key: 'stamilestoneNamete',
        editable: true,
        render: (_, record) => {
          if ((record.round ? Number(record.round) : 0) > 1) {
            if (record.milestoneCode === 'technical_documents_final') {
              return (
                <div>{record.milestoneName}</div>
              )
            } else {
              return (
                <div>{record.milestoneName + `(${record.round})`}</div>
              )
            }
          } else {
            if (record.milestoneCode === 'ten_clarification') {
              return (
                <div>
                  {record.milestoneName}
                  <span style={{'marginLeft': '15px', color: '#a19b9b', fontSize: '12px'}}>
                    {intl.get(`bid.bidcommon.view.title.tecclariremindexpert`).d('请设置评委，并告知评委提问')}
                  </span>
                </div>
              )
            } else {
              return (
                <div>{record.milestoneName}</div>
              )
            }
          }
        }

      }, {
        title: intl.get('bid.milestonecommon.view.title.deadline').d('截止时间'),
        dataIndex: 'milestoneEndTime',
        key: 'milestoneEndTime',
        editable: true,
        render: (_, record) => {
          // console.log('bid_metting',record)
          if (record.milestoneCode === 'bid_metting') {
            if (record.milestoneStartTime && record.milestoneEndTime) {
              return (
                <div>{record.milestoneStartTime + ' ~ ' + record.milestoneEndTime}</div>
              )
            }
          } else {
            return (
              <div>{record.milestoneEndTime}</div>
            )
          }
        }

      }, {
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        key: 'milestoneName',
        width: 600,
        editable: true,
        render: (_, record, index) => {

          const operators = [];
          if (record.milestoneCode == 'project_noice' || record.milestoneCode == 'inquiry_noice' || record.milestoneCode == 'negotiation_notice') {
            operators.push(
              true && {
                key: 'ViewAnnouncement',
                ele: (
                  <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/notices2/${record.proId}`} >
                    {intl.get('bid.bidcommon.bid.button.ViewAnnouncement').d('查看公告')}
                  </Link>
                ),
                len: 8,
                title: intl.get('bid.bidcommon.bid.button.ViewAnnouncement').d('查看公告'),
              }, {
              key: 'EditAnnouncement',
              ele: (
                <a onClick={() => this.showEdit(record)}>
                  {/* <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/${record.proId}/0`} > */}
                  {intl.get('bid.bidcommon.bid.button.EditAnnouncement').d('编辑公告')}
                  {/* </Link> */}
                </a>
              ),
              len: 8,
              title: intl.get('bid.bidcommon.bid.button.EditAnnouncement').d('编辑公告'),
            })
          } else if (record.milestoneCode == "send_pad_res") {
            operators.push(
              true && {
                key: 'ViewDecisionInformation',
                ele: (
                  <Link to={`${isPub ? '/pub' : ''}/sspo/meeting/query/${record.proId}/${record.milestoneId}`} disabled={record.milestoneState === 'to_be_carried_out'}>
                    {intl.get('bid.bidcommon.bid.button.ViewDecisionInformation').d('查看决策信息')}
                  </Link>
                ),
                len: 10,
                title: intl.get('bid.bidcommon.bid.button.ViewDecisionInformation').d('查看决策信息'),
              },
              true && {
                key: 'LosingNotification',
                ele: (
                  // decisionInfoState 用于判断决策信息是否已提交
                  <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/bidWinningResult/${record.proId}/mipBack`} disabled={record.milestoneState === 'to_be_carried_out' || this.props.getDetailList.decisionInfoState === undefined}>
                    {intl.get('bid.bidcommon.bid.button.ViewWinning/LosingNotification').d('查看中选/落选通知')}
                  </Link>
                ),
                len: 12,
                title: intl.get('bid.bidcommon.bid.button.ViewWinning/LosingNotification').d('查看中选/落选通知'),
              })
          } else if (record.milestoneCode == "invitation_letter" || record.milestoneCode == "inquiry_invitation_letter" || record.milestoneCode == 'negotiation_invitation_letter') {
            operators.push({
              key: 'Preview',
              ele: (
                <a
                  onClick={() => {
                    this.onlineModel();
                    this.setState({ newId: record.milestoneId })
                  }}
                >
                  {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
                </a>
              ),
              len: 8,
              title: intl.get('bid.bidcommon.bid.button.Preview').d('预览'),
            }
              // , {
              //   key: 'view',
              //   ele: (
              //     <a
              //       onClick={() => {
              //         this.sendMail();
              //       }}
              //     >
              //       {intl.get('bid.button.SendOut').d('发送邮件')}
              //     </a>
              //   ),
              //   len: 8,
              //   title: intl.get('bid.button.SendOut').d('发送邮件'),
              // }
            )
          }
          //  else if (record.milestoneCode == 'total_technical_review') {
          //   operators.push({
          //     key: 'SummaryOfTechnicalReview',
          //     ele: (
          //       <Link to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${record.milestoneId}`} >
          //         {intl.get('bid.bidcommon.bid.title.SummaryOfTechnicalReview').d('查看技术评审汇总表')}
          //       </Link>
          //     ),
          //     len: 8,
          //     title: intl.get('bid.bidcommon.bid.title.SummaryOfTechnicalReview').d('查看技术评审汇总表'),
          //   })
          // } 
          else if (record.milestoneCode == 'total_price_review') {
            operators.push(
              true && {
                key: 'PriceReviewSummary',
                ele: (
                  <Link to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${record.milestoneId}`} disabled={record.milestoneState === 'to_be_carried_out'}>
                    {intl.get('bid.bidcommon.bid.title.PriceReviewSummary').d('价格评审汇总')}
                  </Link>
                ),
                len: 10,
                title: intl.get('bid.bidcommon.bid.title.PriceReviewSummary').d('价格评审汇总'),
              })
          }
          else if (record.milestoneCode == "price_file_total") {
            operators.push(
              true && {
                key: 'ViewPriceScoringTable',
                ele: (
                  <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/PriceScore/${record.proId}/${record.milestoneId}`} disabled={record.milestoneState === 'to_be_carried_out'}>
                    {intl.get('bid.bidcommon.bid.button.ViewPriceScoringTable').d('查看价格评分表')}
                  </Link>
                ),
                len: 10,
                title: intl.get('bid.bidcommon.bid.button.ViewPriceScoringTable').d('查看价格评分表'),
              },
              true && {
                key: 'SummaryOfTechnicalReview',
                ele: (
                  <div style={{ marginLeft: '20px' }}>
                    <Tooltip
                      title={intl.get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtable').d('查看综合评分表')}
                    >
                      <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/ScoreListAll/${record.proId}/${record.milestoneId}`} disabled={record.milestoneState === 'waitingForSummary' || record.milestoneState === 'to_be_carried_out'}>
                        {intl.get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtable').d('查看综合评分表')}
                      </Link>
                    </Tooltip>
                    {record.milestoneState === 'summerized' && <Tag
                      color="#108ee9"
                      closable={false}
                      prefixCls="ant-tag"
                      style={{ height: 'auto', lineHeight: '12px', marginLeft: '4px' }}
                    >
                      <Tooltip
                        // placement="bottom"
                        title={intl.get('bid.bidcommon.view.title.Summaryoftechnologiestobeconfirmed').d('待确认技术汇总')}
                      >
                        <span style={{ fontSize: '12px' }}>
                          {intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}
                        </span>
                      </Tooltip>
                    </Tag>}
                  </div>

                ),
                len: 10,
                // title: intl.get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtable').d('查看综合评分表'),
              })
          }
          else {
            if (record.milestoneCode == 'bidding_documents' || record.milestoneCode == 'inquiry_files' || record.milestoneCode == "inquiry_invitation_letter" || record.milestoneCode == 'talks_files') {
              operators.push({
                key: 'view',
                ele: (
                  <a
                    onClick={this.showFile}
                  //  showFile
                  >
                    {intl.get('bid.bidcommon.view.button.view').d('查看')}
                  </a>
                ),
                len: 8,
                title: intl.get('bid.bidcommon.view.button.view').d('查看'),
              }, {
                key: 'upload',
                ele: (
                  <a onClick={() => this.uploadFlag(record, record.milestoneState == 'in_process', index)}>
                    {intl.get('bid.bidcommon.view.button.upload').d('上传')}
                  </a>
                ),
                len: 8,
                title: intl.get('bid.bidcommon.view.button.upload').d('上传'),
              })
            } else {
              if (record.milestoneCode == 'bid_metting') {

              }
              if (record.milestoneCode == 'purchase_result') {
                operators.push({
                  key: 'view1',
                  ele: (
                    <a
                      onClick={
                        record.milestoneState === 'to_be_carried_out' ? '' : this.showFileBox
                      }
                      style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                    >
                      {intl.get('bid.bidcommon.view.button.view').d('查看')}
                    </a>
                  ),
                  len: 8,
                  title: intl.get('bid.bidcommon.view.button.view').d('查看'),
                })
              } else {
                if (record.milestoneCode != 'bid_metting' && record.milestoneCode != 'total_ten_score' && record.milestoneCode != 'total_technical_review') {
                  if (record.milestoneCode == 'price_file_upload') {
                    let flag = true
                    if (record.milestoneState !== 'to_be_carried_out') {
                      if (this.props.getDetailList.purchaseType == 'single_source') {
                        flag = false
                      } else {
                        if (record.milestoneState === 'completed' || record.milestoneState === 'exceedTheDeadline') {
                          flag = false
                        }
                      }
                    }
                    operators.push(
                      true && {
                        key: 'getinto',
                        ele: (
                          <div>
                            <Tooltip
                              // placement="bottom"
                              title={intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                            >
                              <Link to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${record.milestoneId}`}
                                disabled={flag}>
                                {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                              </Link>
                            </Tooltip>
                            {record.milestoneState === 'exceedTheDeadline' && <Tag
                              color="#108ee9"
                              closable={false}
                              prefixCls="ant-tag"
                              style={{ height: 'auto', lineHeight: '12px', marginLeft: '4px' }}
                            >
                              <Tooltip
                                // placement="bottom"
                                title={intl.get('bid.bidcommon.view.title.getintosubscriptdescription ').d('待核价')}
                              >
                                <span style={{ fontSize: '12px' }}>
                                  {intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}
                                </span>
                              </Tooltip>
                            </Tag>}
                          </div>
                        ),
                        len: 8,
                        // title: intl.get('bid.bidcommon.view.button.getinto').d('进入'),
                      })
                  } else {
                    if(record.milestoneCode == 'ten_clarification' ){
                      operators.push(
                        true && {
                          key: 'getinto',
                          ele: (
                            <div>
                            <Tooltip
                              title={intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                            >
                              <Link to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${record.milestoneId}`} disabled={record.milestoneState === 'to_be_carried_out'}>
                              {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                            </Link>
                            </Tooltip>
                            {record.milestoneState === 'completed' && record.isAllTransToJudge === 'n' && <Tag
                              color="#108ee9"
                              closable={false}
                              prefixCls="ant-tag"
                              style={{ height: 'auto', lineHeight: '12px', marginLeft: '4px' }}
                            >
                              <Tooltip
                                // placement="bottom"
                                title={intl.get('bid.bidcommon.view.title.Tobefedbacktothejudges').d('待反馈给评委')}
                              >
                                <span style={{ fontSize: '12px' }}>
                                  {intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}
                                </span>
                              </Tooltip>
                            </Tag>}
                          </div>
                            
                          ),
                          len: 8,
                          // title: intl.get('bid.bidcommon.view.button.getinto').d('进入'),
                        })
                    }else{
                      operators.push(
                        true && {
                          key: 'getinto',
                          ele: (
                            <Link to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${record.milestoneId}`} disabled={record.milestoneState === 'to_be_carried_out'}>
                              {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                            </Link>
                          ),
                          len: 8,
                          title: intl.get('bid.bidcommon.view.button.getinto').d('进入'),
                        })
                    }
                  }
                }

              }
              if (record.milestoneCode == 'total_ten_score') {
                operators.push({
                  key: 'Viewjudgesscores',
                  ele: (
                    <a onClick={record.milestoneState === 'to_be_carried_out' ? '' : this.openList}
                      style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                    >

                      {intl.get('bid.bidcommon.bid.button.Viewjudgesscores').d('查看评委评分')}
                    </a>
                  ),
                  len: 8,
                  title: intl.get('bid.bidcommon.bid.button.Viewjudgesscores').d('查看评委评分'),
                },
                  true && {
                    key: 'Viewthecomprehensivescoringtabletech',
                    ele: (
                      <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/technicalMerit/${record.proId}/${record.milestoneId}/${record.milestoneState === 'in_conform' ? 'look' : 'edit'}`}
                        disabled={record.milestoneState === 'to_be_carried_out' || record.milestoneState === 'waitingForSummary'}
                      >
                        {intl.get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtabletech').d('查看技术分汇总')}
                      </Link>
                    ),
                    len: 10,
                    title: intl.get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtabletech').d('查看技术分汇总'),
                  })
              }
              if (record.milestoneCode == 'total_technical_review') {
                operators.push({
                  key: 'Viewjudgesscores',
                  ele: (
                    <a onClick={record.milestoneState === 'to_be_carried_out' ? '' : this.openList}
                      style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                    >

                      {intl.get('bid.bidcommon.view.title.Viewexpertreview').d('查看评委评审')}
                    </a>
                  ),
                  len: 8,
                  title: intl.get('bid.bidcommon.view.title.Viewexpertreview').d('查看评委评审'),
                },
                  true && {
                    key: 'SummaryOfTechnicalReview',
                    ele: (
                      <div style={{ marginLeft: '20px' }}>
                        <Tooltip
                          title={intl.get('bid.bidcommon.view.title.viewtechnicalreviewsummarysheet').d('查看技术评审汇总表')}
                        >
                          <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/technicalMerit/${record.proId}/${record.milestoneId}/${record.milestoneState === 'in_conform' ? 'look' : 'edit'}`}
                            disabled={record.milestoneState === 'to_be_carried_out' || record.milestoneState === 'waitingForSummary'}
                          >
                            {intl.get('bid.bidcommon.view.title.viewtechnicalreviewsummarysheet').d('查看技术评审汇总表')}
                          </Link>
                        </Tooltip>
                        {record.milestoneState === 'summerized' && <Tag
                          color="#108ee9"
                          closable={false}
                          prefixCls="ant-tag"
                          style={{ height: 'auto', lineHeight: '12px', marginLeft: '4px' }}
                        >
                          <Tooltip
                            // placement="bottom"
                            title={intl.get('bid.bidcommon.view.title.Comprehensivesummarytobeconfirmed').d('待确认综合汇总')}
                          >
                            <span style={{ fontSize: '12px' }}>
                              {intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}
                            </span>
                          </Tooltip>
                        </Tag>}
                      </div>

                    ),
                    len: 14,
                    // title: intl.get('bid.bidcommon.bid.button.viewtechnicalreviewsummarysheet').d('查看技术评审汇总表'),
                  })
              }

              if (record.milestoneCode == 'price_clarification' || record.milestoneCode == 'ten_clarification' || record.milestoneCode == 'price_file_upload') {
                if (record.milestoneState != 'completed') {
                  // console.log('123')
                  if (record.milestoneCode == 'price_clarification') {
                    operators.push({
                      key: 'EditTime1',
                      ele: (
                        <a
                          onClick={() => {
                            (this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed' || this.props.getEndList[index - 1].milestoneState === 'in_process') ? this.showModal(record, record.milestoneState != 'completed', index) :
                              '';
                          }}
                          style={(this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed' || this.props.getEndList[index - 1].milestoneState === 'in_process') ? {} : { color: 'rgba(0,0,0,0.25)' }}
                        >
                          {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                        </a>
                      ),
                      len: 8,
                      title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                    })
                  }
                  if (record.milestoneCode == 'price_file_upload') {
                    // 除公开招标邀请招标外,报价文件是已完成或已截止时不显示编辑时间
                    if (record.milestoneState !== 'completed' && record.milestoneState !== 'exceedTheDeadline') {
                      // if (record.round == 1 && this.props.getDetailList.purchaseType == 'single_source') {
                      if (record.round == 1 && this.props.getDetailList.purchaseType !== 'public_bidding' && this.props.getDetailList.purchaseType !== 'invited_bidding') {
                        operators.push({
                          key: 'EditTime1',
                          ele: (
                            <a
                              onClick={() => {
                                this.showModal(record, record.milestoneState != 'completed', index)
                              }}
                            >
                              {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                            </a>
                          ),
                          len: 8,
                          title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                        })
                      } else {
                        if (this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed') {
                          operators.push({
                            key: 'EditTime1',
                            ele: (
                              <a onClick={() => {this.showModal(record, record.milestoneState != 'completed', index)}} >
                                {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                              </a>
                            ),
                            len: 8,
                            title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                          })
                        }
                        // operators.push({
                        //   key: 'EditTime1',
                        //   ele: (
                        //     <a
                        //       onClick={() => {
                        //         (this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed') ? this.showModal(record, record.milestoneState != 'completed', index) :
                        //           '';
                        //       }}
                        //       style={(this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed') ? {} : { color: 'rgba(0,0,0,0.25)' }}
                        //     >
                        //       {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                        //     </a>
                        //   ),
                        //   len: 8,
                        //   title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                        // })
                      }
                    }
                  }
                  if (record.milestoneCode == 'ten_clarification') {
                    operators.push({
                      key: 'EditTime1',
                      ele: (
                        <a
                          onClick={() => {
                            (this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed') ? this.showModal(record, record.milestoneState != 'completed', index) :
                              '';
                          }}
                          style={(this.props.getEndList[index - 1].milestoneState === 'completed' || this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState === 'affirmed') ? {} : { color: 'rgba(0,0,0,0.25)' }}
                        >
                          {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                        </a>
                      ),
                      len: 8,
                      title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                    })
                  }
                }
                // if (record.milestoneCode == 'price_clarification') {
                //   operators.push({
                //     key: 'priceClarification',
                //     ele: (
                //       <a
                //         onClick={() => {

                //           this.addModalF(record, record.milestoneState != 'completed', index);
                //         }}
                //         style={record.milestoneState !== 'completed' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                //       >
                //         {intl.get('bid.milestonecommon.bid.title.quotationdocument').d('报价文件')}
                //       </a>
                //     ),
                //     len: 8,
                //     title: intl.get('bid.milestonecommon.bid.title.quotationdocument').d('报价文件'),
                //   })
                // }
                if (record.milestoneCode != 'bid_metting' && record.milestoneCode != 'total_ten_score' && record.milestoneCode != 'project_qa') {
                  if (record.milestoneCode === 'price_file_upload' || record.milestoneCode === 'price_clarification') {
                    if (record.milestoneCode === 'price_clarification') {
                      let roundsFlag = false
                      let finishFlag = true
                      let counts = 0
                      let showFlag = true
                      if (this.props.getEndList[index + 1].milestoneCode == 'bid_metting') {
                        if (this.props.getEndList[index + 2].milestoneCode == 'price_file_upload') {
                          showFlag = false
                        }
                      } else {
                        if (this.props.getEndList[index + 1].milestoneCode == 'price_file_upload') {
                          showFlag = false
                        }
                      }
                      for (const item of this.props.getEndList) {
                        if (item.milestoneCode == 'price_clarification') {
                          counts++
                          // break
                        }
                        if (item.milestoneCode == 'price_file_total' || item.milestoneCode == 'total_price_review') {
                          if (item.milestoneState == 'affirmed') {
                            finishFlag = false
                          }
                          // break
                        }
                      }
                      if (record.round == counts) {
                        roundsFlag = true
                      }
                      // console.log('12',counts,finishFlag,roundsFlag,record.milestoneCode)

                      if (roundsFlag && finishFlag && showFlag) {
                        operators.push({
                          key: 'AddNextRound1',
                          ele: (
                            <a
                              onClick={() => {
                                record.milestoneState !== 'completed' ? '' : this.addModal(record, record.milestoneState == 'in_process', index);
                              }}
                              style={record.milestoneState !== 'completed' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                            >
                              {intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮')}
                            </a>
                          ),
                          len: 8,
                          title: intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮'),
                        })
                      }
                    } else {
                      let roundsFlag = false
                      let finishFlag = true
                      let counts = 0
                      for (const item of this.props.getEndList) {
                        if (item.milestoneCode == 'price_file_upload') {
                          counts++
                          // break
                        }
                        if (item.milestoneCode == 'price_file_total' || item.milestoneCode == 'total_price_review') {
                          if (item.milestoneState == 'affirmed') {
                            finishFlag = false
                          }
                          // break
                        }
                      }
                      if (record.round == counts) {
                        roundsFlag = true
                      }
                      // console.log('12',counts,finishFlag,roundsFlag,record.milestoneCode)

                      if (roundsFlag && finishFlag) {
                        operators.push({
                          key: 'AddNextRound1',
                          ele: (
                            <a
                              onClick={() => {
                                record.milestoneState !== 'completed' ? '' : this.addModal(record, record.milestoneState == 'in_process', index);
                              }}
                              style={record.milestoneState !== 'completed' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                            >
                              {intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮')}
                            </a>
                          ),
                          len: 8,
                          title: intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮'),
                        })
                      }
                    }
                  }
                  // else{
                  // console.log('123',record.milestoneCode)
                  // if(this.props.getEndList[index ].milestoneState == 'completed' && this.props.getEndList[index +1].milestoneState == 'to_be_carried_out'){
                  //   operators.push({
                  //     key: 'AddNextRound',
                  //     ele: (
                  //       <a
                  //         onClick={() => {
                  //           record.milestoneState === 'to_be_carried_out' ? '' : this.addModal(record, record.milestoneState == 'in_process', index);
                  //         }}
                  //         style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                  //       >
                  //         {intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮')}
                  //       </a>
                  //     ),
                  //     len: 8,
                  //     title: intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮'),
                  //   })
                  // }
                  // }
                  // if (record.round && record.round != '1') {
                  //   operators.push({
                  //     key: 'delete',
                  //     ele: (
                  //       <a
                  //         onClick={() => {
                  //           record.milestoneState !== 'to_be_carried_out' ? '' :
                  //           this.delete(record);
                  //         }}
                  //         style={record.milestoneState !== 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                  //       >
                  //         {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                  //       </a>
                  //     ),
                  //     len: 8,
                  //     title: intl.get('bid.bidcommon.view.button.delete').d('删除'),
                  //   })
                  // }
                }
                if (record.milestoneCode == 'ten_clarification') {

                  let roundsFlag = false
                  let finishFlag = false
                  let lastRoundFlag = true
                  let counts = 0
                  for (const item of this.props.getEndList) {
                    if (item.milestoneCode == 'ten_clarification') {
                      counts++
                      // breaks
                    }
                    if (item.milestoneCode == 'technical_documents_final') {
                      lastRoundFlag = false
                    }
                    if (this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out') {
                      finishFlag = true
                      // break
                    }
                  }
                  if (record.round == counts) {
                    roundsFlag = true
                  }
                  // console.log('ten_clarification12',counts,finishFlag,roundsFlag,record.milestoneCode)

                  if (record.round == 1 && this.props.getDetailList.purchaseType != 'single_source') {
                    operators.push({
                      key: 'new',
                      ele: (
                        <a
                          onClick={() => {
                            record.milestoneState === 'to_be_carried_out' ? '' : this.startSorce();
                          }}
                          style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                        >
                          {intl.get('bid.bidcommon.view.title.Technicalcompliancereviewbutton').d('初步评审汇总')}
                        </a>
                      ),
                      len: 8,
                      title: intl.get('bid.bidcommon.view.title.Technicalcompliancereviewbutton').d('初步评审汇总'),
                    })
                  }
                  if (record.round == 1 && record.milestoneState == 'completed') {
                    operators.push({
                      key: 'completionQA',
                      ele: (
                        <a
                          onClick={() => {
                            record.milestoneState === 'to_be_carried_out' || record.remarks === 'y' ? '' : this.showQAModal(record);
                          }}
                          style={record.milestoneState === 'to_be_carried_out' || record.remarks === 'y' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                        >
                          {intl.get('bid.bidcommon.view.title.completeqa').d('答疑完结')}
                        </a>
                      ),
                      len: 8,
                      title: intl.get('bid.bidcommon.view.title.completeqa').d('答疑完结'),
                    })
                  }

                  if (roundsFlag && finishFlag & lastRoundFlag) {
                    if (record.remarks !== 'y') {
                      operators.push({
                        key: 'AddNextRound1',
                        ele: (
                          <a
                            onClick={() => {
                              record.milestoneState !== 'completed' ? '' : this.addModal(record, record.milestoneState == 'in_process', index);
                            }}
                            style={record.milestoneState !== 'completed' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                          >
                            {intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮')}
                          </a>
                        ),
                        len: 8,
                        title: intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮'),
                      })
                    }
                    if (this.props.getEndList[index].milestoneState == 'completed' && (this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out')) {
                      operators.push({
                        key: 'submittechnicaldocuments',
                        ele: (
                          <a
                            onClick={() => {
                              this.addModalL(record, record.milestoneState == 'in_process');
                            }}
                            style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                          >
                            {intl.get('bid.bidcommon.bid.button.SubmissionOfTechnicalAndCommercialDocumentsfinalround').d('技术及商务文件递交(最终轮)')}
                          </a>
                        ),
                        len: 8,
                        title: intl.get('bid.bidcommon.bid.button.SubmissionOfTechnicalAndCommercialDocumentsfinalround').d('技术及商务文件递交(最终轮)'),
                      })
                    }
                  }
                }
                if (record.milestoneCode == 'price_file_upload') {

                  if (this.props.getDetailList.purchaseType != 'public_bidding' && this.props.getDetailList.purchaseType != 'invited_bidding') {
                    // if(this.props.getEndList[index ].milestoneState == 'completed' &&( this.props.getEndList[index +1].milestoneState == 'to_be_carried_out'||this.props.getEndList[index +1].milestoneCode== 'bid_metting' )){
                    let showFlag = true
                    if (this.props.getEndList[index + 1].milestoneCode == 'bid_metting') {
                      if (this.props.getEndList[index + 2].milestoneState !== 'to_be_carried_out' || this.props.getEndList[index + 2].milestoneCode == 'price_clarification') {
                        showFlag = false
                      }
                    } else {
                      if (this.props.getEndList[index + 1].milestoneState !== 'to_be_carried_out' || this.props.getEndList[index + 1].milestoneCode == 'price_clarification') {
                        showFlag = false
                      }
                    }

                    if (showFlag) {
                      let disableFlag = false
                      if (record.milestoneState === 'to_be_carried_out' || record.milestoneState === 'completed') {
                        disableFlag = true
                      }
                      if (this.props.getDetailList.purchaseType != 'single_source' && record.milestoneState === 'in_process') {
                        disableFlag = true
                      }
                      operators.push({
                        key: 'priceclarification',
                        ele: (
                          <a
                            onClick={() => {
                              (disableFlag) ? '' : this.addModalP(record);
                            }}
                            style={(disableFlag) ? { color: 'rgba(0,0,0,0.25)' } : {}}
                          >
                            {intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清')}
                          </a>
                        ),
                        len: 8,
                        title: intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清'),
                      })
                    }

                    itemFlag = true
                    for (const item of this.props.getEndList) {
                      if (item.milestoneCode == 'bid_metting') {
                        itemFlag = false
                        break
                      }
                    }
                    let counts = 0
                    for (const item of this.props.getEndList) {
                      if (item.milestoneCode == 'price_file_upload') {
                        counts++
                        // break
                      }
                    }
                    if (itemFlag == true && counts == record.round) {
                      operators.push({
                        key: 'phasename',
                        ele: (
                          <a
                            onClick={() => {
                              record.milestoneState !== 'to_be_carried_out' && this.handleCreate(record, record.milestoneState == 'in_process');
                            }}
                            style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                          >
                            {intl.get('bid.milestonecommon.view.title.projectbidpresentationmeeting').d('添加项目述标会议')}
                          </a>
                        ),
                        len: 8,
                        title: intl.get('bid.milestonecommon.view.title.projectbidpresentationmeeting').d('添加项目述标会议'),
                      }
                      )
                    }
                    // }
                  }
                  // console.log('this.props', this.props);

                }
                if (record.milestoneCode == 'bid_metting') {
                  if (this.props.getDetailList.purchaseType != 'public_bidding' && this.props.getDetailList.purchaseType != 'invited_bidding') {

                    operators.push({
                      key: 'delete1',
                      ele: (
                        <a
                          onClick={() => {
                            record.milestoneState !== 'to_be_carried_out' ? '' :
                              this.delete(record);
                          }}
                          style={record.milestoneState !== 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                        >
                          {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                        </a>
                      ),
                      len: 8,
                      title: intl.get('bid.bidcommon.view.button.delete').d('删除'),
                    })
                  }
                  // console.log('this.props', this.props);

                }
              }
              if (record.milestoneCode == 'bid_metting') {
                operators.push({
                  key: 'EditTime',
                  ele: (
                    <a
                      onClick={() => {
                        record.milestoneCode == 'bid_metting' ? this.addModalM(record, index) :
                          this.showModal(record, record.milestoneState != 'completed', index);
                      }}
                    // style={record.milestoneState !=='completed'&& this.props.getEndList[index - 1].milestoneState === 'completed'?{ }:{ color: 'rgba(0,0,0,0.25)'}}
                    >
                      {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                    </a>
                  ),
                  len: 8,
                  title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                })
              }
              let showTimeFlag = true
              if (record.milestoneCode == 'project_qa') {
                // for (const item of this.props.getEndList) {
                //   if(item.milestoneCode ==='ten_clarification'&&item.round === '1'){
                //     if(item.milestoneState != 'to_be_carried_out'){
                //       showTimeFlag = false
                //     }

                //   }
                // }
                // if(showTimeFlag){
                operators.push({
                  key: 'EditTime',
                  ele: (
                    <a
                      onClick={() => {
                        record.milestoneCode == 'bid_metting' ? this.addModalM(record, index) :
                          this.showModal(record, record.milestoneState != 'completed', index);
                      }}
                    // style={record.milestoneState !=='completed'&& this.props.getEndList[index - 1].milestoneState === 'completed'?{ color: 'rgba(0,0,0,0.25)' }:{}}
                    >
                      {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                    </a>
                  ),
                  len: 8,
                  title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                })
                // }
              }
              if (record.milestoneCode == 'technical_documents_final') {
                if (record.milestoneState !== 'completed') {
                  operators.push({
                    key: 'EditTime',
                    ele: (
                      <a
                        onClick={() => {
                          record.milestoneState !== 'completed' && this.props.getEndList[index - 1].milestoneState === 'completed' ?
                            this.showModal(record, record.milestoneState != 'completed', index) : '';
                        }}
                        style={record.milestoneState !== 'completed' && this.props.getEndList[index - 1].milestoneState === 'completed' ? {} : { color: 'rgba(0,0,0,0.25)' }}
                      >
                        {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                      </a>
                    ),
                    len: 8,
                    title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                  })
                }
              }
              if (record.milestoneCode == 'technical_documents') {
                let countNew = 0
                let newFlag = false
                let noAddFlag = true
                let startNext = false
                for (const item of this.props.getEndList) {
                  if (item.milestoneCode == 'technical_documents') {
                    countNew++
                    // break
                  }
                  if (item.milestoneCode == 'technical_documents_final') {
                    noAddFlag = false
                  }
                  // if(item.milestoneCode ==='ten_clarification'&&item.round === '1'){
                  //   if(item.milestoneState != 'to_be_carried_out'){
                  //     showTimeFlag = false
                  //   }
                  // }
                }
                if (record.round == countNew || !record.round) {
                  newFlag = true
                }
                if (this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out') {
                  startNext = true
                }
                // this.props.getEndList[index + 1].milestoneState !== 'completed' && 
                if (this.props.getEndList[index + 1].milestoneCode === 'price_file_upload' && this.props.getDetailList.purchaseType != 'public_bidding' && this.props.getDetailList.purchaseType != 'invited_bidding') {
                  startNext = true
                }
                // console.log('123',newFlag,showTimeFlag,countNew,record.round)

                if (newFlag && showTimeFlag) {
                  operators.push({
                    key: 'EditTime',
                    ele: (
                      <a
                        onClick={() => {
                          record.milestoneCode == 'bid_metting' ? this.addModalM(record, index) :
                            this.showModal(record, record.milestoneState != 'completed', index);
                        }}
                        // style={record.milestoneState !=='completed'&& this.props.getEndList[index - 1].milestoneState === 'completed'?{ color: 'rgba(0,0,0,0.25)' }:{}}
                      >
                        {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                      </a>
                    ),
                    len: 8,
                    title: intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间'),
                  })
                  // showNextRound=false: 技术商务澄清最后一轮已完成=不显示添加下一轮
                  // console.log('flag',record.milestoneState == 'completed' && this.props.getEndList[index +1].milestoneState == 'to_completedbe_carried_out',record.milestoneState == 'completed' , this.props.getEndList[index +1].milestoneState == 'to_be_carried_out')
                  if (record.milestoneState == 'completed' && startNext && noAddFlag && record.showNextRound) {
                    operators.push({
                      key: 'AddNextRound',
                      ele: (
                        <a
                          onClick={() => {
                            this.addModal(record, record.milestoneState == 'in_process', index);
                          }}
                          style={record.milestoneState === 'to_be_carried_out' ? { color: 'rgba(0,0,0,0.25)' } : {}}
                        >
                          {intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮')}
                        </a>
                      ),
                      len: 8,
                      title: intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮'),
                    })
                  }
                }
              }
            }
          }
          return operatorRender(operators, record, { limit: 5 });
        },
      },
    ];
  }


  componentDidMount() {
    // this.getSelectedRows();
    newDataList = [];
  }

  @Bind
  uploadFlag(value, flag, index) {
    const val = value
    const fag = flag
    // if ((this.props.getEndList[index - 1].milestoneState == 'completed'||this.props.getEndList[index - 1].milestoneState == 'exceedTheDeadline'||this.props.getEndList[index - 1].milestoneState == 'affirmed'||this.props.getEndList[index - 1].milestoneState == 'affirmed') && this.props.getEndList[index].milestoneState != 'completed') {
    this.setState({
      openFlag: true,
    })
    // }
  }

  @Bind
  showFile() {
    this.setState({
      showFlag: true,
      showList: this.props.getEndList[1].fileDTOList,
    })
  }

  @Bind
  showModal(value, flag, index) {
    // console.log('value',value,index)
    // if (value.milestoneCode == 'project_qa' || value.milestoneCode == 'technical_documents' || (value.round == 1 && this.props.getDetailList.purchaseType == 'single_source')) {
    if (value.milestoneCode == 'project_qa' || value.milestoneCode == 'technical_documents' || (value.round == 1 && this.props.getDetailList.purchaseType !== 'public_bidding' && this.props.getDetailList.purchaseType !== 'invited_bidding')) {
      this.props.form.getFieldDecorator('beforeTime', { initialValue: value.creationDate, })
      // console.log(value,'val')
      this.setState({
        visible: true,
        titleList: value
      });
    } else {
      // console.log(this.props.getEndList[index - 1].milestoneState, this.props.getEndList[index].milestoneState)
      if ((this.props.getEndList[index - 1].milestoneState == 'completed' || this.props.getEndList[index - 1].milestoneState == 'exceedTheDeadline' || this.props.getEndList[index - 1].milestoneState == 'affirmed' || this.props.getEndList[index - 1].milestoneState == 'in_process')) {
        const newDateTime = new Date().getTime();
        const endTime = Date.parse(new Date(value.milestoneEndTime))
        // console.log('321',value.milestoneEndTime,newDateTime < endTime)
        if (newDateTime < endTime || !value.milestoneEndTime) {
          this.props.form.getFieldDecorator('beforeTime', { initialValue: value.creationDate, })
          this.setState({
            visible: true,
            titleList: value
          });
        }
      }
    }
  }

  @Bind
  onlineModel(page = {}) {
    const { dispatch, matchs } = this.props
    dispatch({
      type: 'contractMaintain/supplierListMeeting',
      payload: {
        page,
        proId: matchs.params.proId,
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            onlineData: res.content,
            onlinePagination: createPagination(res),
          },
        })
      }
    })
    this.setState({
      onlineShow: true,
    })
  }

  // @Bind
  // delete(value,flag, index){
  //   console.log('val',value)
  // }


  @Bind
  delete(value) {
    const {
      handleEdit,
    } = this.props;
    if (value.milestoneState != 'completed') {
      request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
        method: 'DELETE',
        body: [value],
      }
      ).then((res) => {
        if (res) {
          handleEdit()
        }
      })
    }
  }


  @Bind
  addModal(value, _, index) {
    console.log(value)
    value.milestoneEndTime = ''
    value.milestoneStartTime = ''
    // if (this.props.getEndList[index ].milestoneState == 'completed' && this.props.getEndList[index +1].milestoneState == 'to_be_carried_out') {
    this.setState({
      visible1: true,
      nameFlag: true,

      titleList: value,
      upload: true,
    });
    // }
  }
  @Bind
  addModalF(value, _, index) {
    value.milestoneNameNew = intl.get('bid.milestonecommon.bid.title.quotationdocument').d('报价文件')
    if (this.props.getEndList[index].milestoneState == 'completed' && this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out') {
      // console.log(value)
      this.setState({
        visible1: true,
        nameFlag: false,

        titleList: value,
        upload: false,
        message: 'price_file_upload',

      });
    }
  }

  @Bind
  sendMail(val) {
    const { dispatch } = this.props;
    const param = [{
      id: val.id,
      proId: val.proId,
      currentMilestoneId: this.state.newId
    }]
    const organizationId = getCurrentOrganizationId()
    dispatch({
      type: 'contractMaintain/checkEdit',
      payload: {
        proId: val.proId
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'contractMaintain/sendSupplierEmailInvited',
          payload: param,
        }).then((res) => {
          if (res && res.failed) {
            return CusNotification.error({ message: res.message, closable: false })
          }
          if (res.resCode) {
            this.onlineModel()
            notification.success({ message: intl.get('hzero.common.notification.success').d('发送成功') });
          }
          // else {
          //   notification.error({
          //     message:  intl
          //     .get(`bid.bidcommon.view.message.edditannouncement`)
          //     .d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！'),
          //   })
          // }
        })
      } else {
        if (this.props.getDetailList.purchaseType === 'single_source') {
          notification.error({
            message: intl.get(`bid.bidcommon.view.title.PleaseuploadthedeadlineforbiddingnegotiationdocumentseditingprojectQAsubmissionoftechnicalandcommercialdocumentsandquotationdocuments`).d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交、报价文件的截止时间！'),
          });
        } else {
          notification.error({
            message: intl.get(`bid.bidcommon.view.message.edditannouncement`).d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！'),
          });
        }
      }
    })
  }

  @Bind
  addModalP(value) {
    // value.milestoneCode = ''
    value.milestoneNameNew = intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清')
    value.milestoneEndTime = ''
    value.milestoneStartTime = ''
    this.setState({
      visible1: true,
      nameFlag: false,

      message: 'price_clarification',
      titleList: value,
      upload: false,
    });
  }

  @Bind
  addModalL(value) {
    // value.milestoneCode = ''
    value.milestoneNameNew = intl.get('bid.bidcommon.bid.button.SubmissionOfTechnicalAndCommercialDocumentsfinalround').d('技术及商务文件递交(最终轮)')
    value.milestoneEndTime = ''
    value.milestoneStartTime = ''
    this.setState({
      visible1: true,
      nameFlag: false,

      message: 'technical_documents_final',
      titleList: value,
      upload: false,
    });
  }

  @Bind
  addModalM(value, index) {
    // value.milestoneCode = 'bid_metting'
    const { dispatch, matchs } = this.props;
    // if ((this.props.getEndList[index - 1].milestoneState == 'completed'||this.props.getEndList[index - 1].milestoneState == 'exceedTheDeadline'||this.props.getEndList[index - 1].milestoneState == 'affirmed'||this.props.getEndList[index - 1].milestoneState == 'affirmed') && this.props.getEndList[index].milestoneState != 'completed') {
    // this.supplierList(value)
    dispatch({
      type: 'contractMaintain/supplierListMeeting',
      payload: {
        proId: matchs.params.proId,
        // page,

      },
    }).then(res => {
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          supplierSource: res.content.map((n) => ({
            ...n,
            _status: 'update',
            milestoneId: value.milestoneId,
          })),
          supplierListPagination: createPagination(res)

        },
      })
    })
    // value.milestoneName = '项目述标会议'
    // value.milestoneCode = 'bid_metting'
    this.setState({
      visibleCreate: true,
    });
    // }
  }

  @Bind
  num(value) {
    const i = Number(value) + 1
    const index = intl.get('bid.bidcommon.view.title.the').d('第') + i + intl.get('bid.bidcommon.view.title.turn').d('轮')
    return index
  }

  @Bind()
  supplierList(page = {}) {
    const { dispatch, matchs } = this.props;
    dispatch({
      type: 'contractMaintain/supplierListMeeting',
      payload: {
        proId: matchs.params.proId,
        page,

      },
    }).then(res => {
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          supplierSource: res.content.map((n) => ({
            ...n,
            _status: 'update',
            milestoneId: this.props.contractMaintain.supplierSource[0].milestoneId,
          })),
          supplierListPagination: createPagination(res)

        },
      })
    })
    // dispatch({
    //   type: 'contractMaintain/supplierList',
    //   payload: {
    //     proId: matchs.params.proId,
    //     // page,

    //   },
    // }).then(res => {
    //   dispatch({
    //     type: 'contractMaintain/updateState',
    //     payload: {
    //       supplierSource: res.content.map((n) => ({
    //         ...n,
    //         _status: 'update',
    //         milestoneId: matchs.params.milestoneId,
    //       })),
    //       supplierListPagination:createPagination(res)
    //     },
    //   })
    // })
  }
  @Bind
  showConsole() {
    // const { getFieldDecorator, getFieldValue, validateFields, setFieldsValue } = this.props.form;
    // console.log(getFieldValue('timeStar'))
    // this.setState({
    //   timeStar
    // })
  }

  @Bind()
  beforeUpload(file) {
    const fileSize = 2 * 1024 * 1024 * 1024
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: fileSize / (2 * 1024 * 1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (2 * 1024 * 1024 * 1024)} GB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }
  /**
   * 处理数据导入后的数据展示(保存)
   *
   * @memberof Import
   */
  @Bind()
  handleImportData(params) {
    request(`${SRM_BID}/v1/${organizationId}/import/data?templateCode=${params.templateCode}&batch=${params.batch}`, {
      method: 'GET'
    }
    ).then()
  }

  isJSON(str) {
    let result;
    try {
      result = JSON.parse(str);
    } catch (e) {
      return false;
    }
    return isObject(result) && !isString(result);
  }

  @Bind
  handleOk2() {
    const {
      form,
      getDetailList,
      handleEdit,
    } = this.props;

    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      if (err) {

      }
      if (values.milestoneEndTime && values.beforeTime) {
        values.milestoneEndTime = moment(values.milestoneEndTime).format('YYYY-MM-DD HH:mm:ss')
        values.beforeTime = moment(values.beforeTime).format('YYYY-MM-DD HH:mm:ss')
        if (this.state.message) {
          this.state.titleList.milestoneCode = this.state.message
        }
        const rounds = Number(this.state.titleList.round) + 1
        let param = { milestoneEndTime: values.milestoneEndTime, milestoneStartTime: values.beforeTime, milestoneId: this.state.titleList.milestoneId, milestoneCode: this.state.titleList.milestoneCode, isNeedCloseCurrentMilestone: 'n' }
        if (this.state.upload) {
          param = {
            ...param,
            rounds: rounds,

          }
        }
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones/addNextRound`, {
          method: 'POST',
          body: param
        }
        ).then((res) => {
          if (res) {
            handleEdit()
            this.setState({
              messageVisible: false,
              visible: false,
              nameFlag: true,
              visible1: false,
              message: '',
              titleList: {},
              upload: false,
            });
          } else {
            notification.error({
              message: intl
                .get(`bid.bidcommon.view.message.tiangeshijian`)
                .d('请填写时间'),
            });
          }
        })
      }
    })
  }

  @Bind
  handleOkTime() {
    const { contractMaintain, form, handleEdit } = this.props;
    const { supplierSource } = contractMaintain;
    const data = getEditTableData(supplierSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    data.forEach((item) => {
      if (item.bidMeetingEndTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingEndTime = item.bidMeetingEndTime.format(DEFAULT_DATETIME_FORMAT);
      }
      if (item.bidMeetingStartTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingStartTime = item.bidMeetingStartTime.format(DEFAULT_DATETIME_FORMAT);
      }
    });

    // console.log('supplierSource',this.props.contractMaintain.supplierSource)
    // // console.log('list',form.getFieldValue('bidMeetingEndTime'))
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      if (values.beforeTime && values.milestoneEndTime) {

        values.milestoneEndTime = moment(values.milestoneEndTime).format('YYYY-MM-DD HH:mm:ss')
        values.beforeTime = moment(values.beforeTime).format('YYYY-MM-DD HH:mm:ss')
        const param = [{ ...values, milestoneId: this.state.titleList.milestoneId, milestoneStartTime: values.beforeTime, bidMeetingUrl: values.bidMeetingUrl }]
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
          method: 'POST',
          body: param
        }
        ).then((res) => {
          if (res) {
            handleEdit()
          }
        })

        request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`,
          {
            method: 'POST',
            body: data,
          }
        ).then((res) => {
          if (res) {
            notification.success({
              message: intl
                .get(`bid.bidcommon.view.title.savesuccessfully`)
                .d('保存成功'),
            });
            this.setState({
              visibleCreate: false
            })
          }
        })
        this.setState({
          messageVisible: false,
          visible: false,
          nameFlag: true,
          visible1: false,
          message: '',
          titleList: {},
          upload: false,
        });
      } else {
        notification.error({
          message: intl
            .get(`bid.bidcommon.view.message.tiangeshijian`)
            .d('请填写时间'),
        });
      }
    })

  }
  @Bind()
  uploadData(file) {
    return {
      bucketName: 'bidding',
      tenantId: getCurrentOrganizationId(),
      // directory: 'smdm-materiel',
      fileName: file.name,
    };
  }

  @Bind
  handleOk() {
    const { contractMaintain, form, handleEdit } = this.props;
    const { supplierSource } = contractMaintain;
    const data = getEditTableData(supplierSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    let flag = true
    let startFlag = true
    let MeetingList = data.filter((item) => {
      if(item.supplierBidFileState === 'y') {
        return item;
      }
    })
    MeetingList.forEach((item) => {
      if (item.bidMeetingEndTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingEndTime = item.bidMeetingEndTime.format(DEFAULT_DATETIME_FORMAT);
      } else {
        flag = false;
      }
      if (item.bidMeetingStartTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingStartTime = item.bidMeetingStartTime.format(DEFAULT_DATETIME_FORMAT);
      } else {
        flag = false;
      }
      if(item.bidMeetingStartTime > item.bidMeetingEndTime){
        startFlag = false
      }
    });
    if(flag) {
      if(startFlag) {
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
          method: 'POST',
          body: data
        }).then((res) => {
          if (res) {
            handleEdit()
          }
        })

        request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`, {
          method: 'POST',
          body: data,
        }).then((res) => {
          if (res) {
            notification.success({
              message: intl
                .get(`bid.bidcommon.view.title.savesuccessfully`)
                .d('保存成功'),
            });
            this.setState({
              visibleCreate: false
            })
          }
        })
        this.setState({
          messageVisible: false,
          visible: false,
          nameFlag: true,
          visible1: false,
          message: '',
          titleList: {},
          upload: false,
        });
      } else {
        notification.error({
          message: intl
            .get(`bid.bidcommon.view.title.xmsbhykssjdyjzsj`)
            .d('开始时间必须早于结束时间'),
        });
      }
    } else {
      notification.error({
        message: intl
          .get(`bid.bidcommon.view.message.tiangeshijian`)
          .d('请填写时间'),
      });
    }
  }

  // 发送按钮->用于发送邮件
  @Bind
  sendMailUrl(e) {
    const { contractMaintain } = this.props;
    const { supplierSource } = contractMaintain;
    const data = getEditTableData(supplierSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    let flag = true
    data.forEach((item) => {
      if (item.bidMeetingEndTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingEndTime = item.bidMeetingEndTime.format(DEFAULT_DATETIME_FORMAT);
      }
      if (item.bidMeetingStartTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingStartTime = item.bidMeetingStartTime.format(DEFAULT_DATETIME_FORMAT);
      }
      if(e.loginName === item.loginName){
        if(item.bidMeetingEndTime.valueOf()<item.bidMeetingStartTime.valueOf()){
          flag = false
        }
      }
    });
    // const flag = e.bidMeetingEndTime.valueOf()>e.bidMeetingStartTime.valueOf()
    // console.log('1234555',flag, e ,data  )
    if(flag){
      request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`,
      {
        method: 'POST',
        body: data,
      }
    ).then((res) => {
      if (res) {
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones/sendSupplierEmailMeetingMsg`, {
          method: 'POST',
          body: [e]
        }
        ).then((res) => {
          if (res) {
            notification.success({ message: intl.get('hzero.common.notification.succes1s').d('发送成功') });
            this.addModalM(e)
          }
        })
      }
    })
  }else {
      notification.error({
        message: intl
          .get(`bid.bidcommon.view.title.xmsbhykssjdyjzsj`)
          .d('开始时间必须早于结束时间'),
      });
    }
  }


  /**
   * 上传change触发事件
   * @param {*} info - <>
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        this.setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  }

  @Bind
  setFileList(value) {
    const newFile = this.props.contractMaintain.newFile + ',' + value.response
    const { dispatch } = this.props
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        newFile: newFile,
      },
    })
    //  console.log(this.props.getEndList[1])
  }
  /**
   * 删除文件回调函数
   * @param {*} file - <>
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch, organizationId } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'materiel/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: 'private-bucket',
          directory: 'smdm-materiel',
          urls: [file.response],
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
      this.setState({
        fileList: fileList.filter((o) => o.uid !== file.uid),
      });
    }
  }

  @Bind
  handleCancel() {
    this.setState({
      visible: false,
      nameFlag: true,
      visible1: false,
      showFlag: false,
      openFlag: false,
      visibleCreate: false,
      messageVisible: false,
      // openFlag:false,
      titleList: {},
      priceFileList: [],
      message: '',
    });
  }

  @Bind
  upLoadfile() {
    this.props.getEndList[1].fileUrls = this.props.getEndList[1].fileUrls + ',' + this.props.contractMaintain.newFile
    request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
      method: 'POST',
      body: [this.props.getEndList[1]]
    }
    ).then((res) => {
      if (res) {
        this.props.handleEdit()
      }
    })
    const { dispatch } = this.props
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        newFile: '',
      },
    })
    this.setState({
      visible: false,
      nameFlag: true,
      visible1: false,
      showFlag: false,
      visibleCreate: false,
      messageVisible: false,
      openFlag: false,
      priceFileList: [],
      message: '',
    });
  }

  @Bind
  fileListOk() {
    const param = this.props.getEndList[1]
    param.fileUrls = ''
    for (const i of this.state.showList) {
      param.fileUrls = param.fileUrls + ',' + i.fileUrl
    }
    request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
      method: 'POST',
      body: [param]
    }
    ).then((res) => {
      if (res) {
        this.props.handleEdit()
      }
    })
    this.setState({
      visible: false,
      visible1: false,
      nameFlag: true,
      titleList: {},
      showFlag: false,
      visibleCreate: false,
      messageVisible: false,
      openFlag: false,
      priceFileList: [],
      message: '',
    });
  }

  @Bind
  handleCreate(value) {
    const {
      form,
      // getDetailList,
      handleEdit,
    } = this.props;
    Modal.confirm({
      title: intl.get('ssrc.quoController.view.message.confirm.open').d('确定开启吗?'),
      onOk: () => {

        const param = { milestoneId: value.milestoneId, milestoneCode: 'bid_metting', isNeedCloseCurrentMilestone: 'n' }
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones/addNextRound`, {
          method: 'POST',
          body: param
        }
        ).then((res) => {
          if (res) {
            handleEdit()
          }
        })
        this.setState({
          visible: false,
          visible1: false,
          nameFlag: true,
          visibleCreate: false,
          messageVisible: false,
          priceFileList: [],
          message: '',
        });
      }
    })


  }

  @Bind
  deleteFile(key) {
    const { showList } = this.state
    this.setState({
      showList: showList.filter(ite => ite.fileUrl !== key.fileUrl),
    });
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ headerEdited: true });
  }

  /**
   * 
* 修改 
*/
  @Bind()
  changeData() {
  }
  /**
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeSupplier(value, record) {
    if (value) {

    }
    const { dataSource, onChangeHeader } = this.props;
    const {
      supplierTenantId,
      supplierCompanyCode,
      supplierCompanyName,
      supplierCurrencyCode,
    } = record;
    this.handleChangeFormItem();
    onChangeHeader({
      ...dataSource,
      supplierTenantId,
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyCode,
      supplierCurrencyCode,
    });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 公司改变回调
   */
  @Bind()
  handleChangeCompany() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTypeId', 'pcTemplateId', 'ouId']);
    this.handleChangeFormItem();
  }

  /**
   * 协议类型改变回调
   */
  @Bind()
  handleChangePcTypeId() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTemplateId']);
    this.handleChangeFormItem();
  }

  //预览
  @Bind
  openShowUpload(record) {
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`)
    const urlEncode = encodeURIComponent(record.fileUrl)
    const url = `${onlineApi}${api}${urlEncode}`
    window.open(url)
  }

  // 招标文件弹框下载
  @Bind()
  handleDownload(record) {
    const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}
     /files/download?url=${record.fileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: 'bidding' },
        { name: 'url', value: record.fileUrl },
      ],
    });
    return false;
  }
  // openShowUpload(item) {
  // getAttachmentUrl()
  // console.log(item)
  // const bucketName='bidding'
  // const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext`

  // request(url, {
  //   responseType: 'blob',
  //   method: 'GET',
  //   query: {
  //     bucketName,
  //     // storageCode,
  //     access_token:getAccessToken(),
  //     url: item.fileUrl,
  //   },
  // })
  //   .then(response => {
  //     const blobUrl = window.URL.createObjectURL(response);
  //     window.open(blobUrl);
  //   })
  //   .catch(e => {
  //     notification.error(e.message);
  //   });
  // }

  @Bind()
  getPreviewUrl(url) {
    const vars = url ? url.split('&') : [];
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === 'url') {
        return pair[1];
      }
    }
    return false;
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  handleExpUnitChange(value, record) {
    const { handleExpenseUnitChange = (e) => e } = this.props;
    this.handleChangeFormItem();
    handleExpenseUnitChange(value, record);
  }

  @Bind()
  onRowSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  // 开始评委评分
  @Bind()
  startSorce() {
    this.getStartSorceList()
    this.setState({
      startSorceFlag: true
    })
  }

  @Bind
  getStartSorceList() {
    const { match, dispatch } = this.props
    dispatch({
      type: 'contractMaintain/getStartSorceList',
      payload: {
        proId: match.params.proId,
        all: 'YES'
      },
    })
  }

  @Bind()
  handleOkSorceStart() {
    const { match, dispatch } = this.props
    dispatch({
      type: 'contractMaintain/saveStartSorceList',
      payload: {
        proId: match.params.proId,
      },
    }).then(res => {
      if (res.message === 'ok') {
        notification.success()
        this.setState({
          startSorceFlag: false
        })
      } else {
        notification.error({
          message: intl.get(`bid.bidcommon.view.title.Whenallthejudgesagreethescoringcanbestarted`).d('当所有评委意见保持一致后方可开始评分')
        })
      }
    })

  }

  @Bind()
  handleCancelSorceStart() {
    this.setState({
      startSorceFlag: false
    })
  }

  render() {
    // console.log(this.props,this.state)
    const { selectedRowKeys, visible, titleList, visible1, visibleCreate, showFlag, openFlag, showList, onlineShow, nameFlag, judgesSorceModel, startSorceFlag } = this.state;
    const {
      form,
      detailEnumMap,
      customizeForm,
      getEndList,
      organizationId,
      fetchSourceList,
      contractMaintain,
      pagination = false,
      supplierMeetingLoading = false,
    } = this.props;

    // const otherButtonProps = {
    //   type: 'default',
    //   icon: null,
    // };
    const { showPass = [] } = detailEnumMap;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const columns = this.getColumns();
    newDataList = [];
    const { supplierSource = [], resultList = [], resultPagination = {}, onlinePagination = {}, onlineData = [], sorceList = [], sorcePagination = {}, startSorceList, supplierListPagination = {} } = contractMaintain;
    newDataList = supplierSource;
    const { selectedRows = [], qaModalVisibal } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };
    const columns1 = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.starttime`).d('开始时间'),
        dataIndex: 'bidMeetingStartTime',
        key: 'bidMeetingStartTime',
        width: 150,
        render: (val, record, index) => {
          // console.log('record', record);

          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingStartTime', {
                initialValue: record.bidMeetingStartTime && moment(record.bidMeetingStartTime) || '',
              })(<DatePicker
                style={{ width: '100%' }}
                placeholder=""
                format={getDateTimeFormat()}
                showTime
                // disabledDate={currentDate =>
                //   this.disabledStart(currentDate, record.$form.getFieldValue('bidMeetingEndTime'))
                // }
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间'),
        dataIndex: 'bidMeetingEndTime',
        key: 'bidMeetingEndTime',
        width: 150,
        render: (val, record, index) => {
          // console.log('record', record);

          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingEndTime', {
                initialValue: record.bidMeetingEndTime && moment(record.bidMeetingEndTime) || '',
              })(<DatePicker
                style={{ width: '100%' }}
                placeholder=""
                format={getDateTimeFormat()}
                showTime
                // disabledDate={currentDate =>
                //   this.disabledEnd(currentDate, record.$form.getFieldValue('bidMeetingStartTime'))
                // }
              />)}
            </Form.Item>
          );
        },
      }, {
        title: intl.get(`bid.bidcommon.view.title.meetingarrangement`).d('会议安排'),
        dataIndex: 'bidMeetingUrl',
        key: 'bidMeetingUrl',
        width: 150,
        render: (val, record, index) => {
          // console.log('record', record);
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingUrl', {
                initialValue: record.bidMeetingUrl || '',
              })(<Input
              // disabled={record.bidMeetingSendTime != undefined}
              />)}
            </Form.Item>
          );
        },
      },

      {
        title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
        dataIndex: 'mail',
        width: 120,
        render: (val, record) => (
          <Button onClick={() => this.sendMailUrl(record)}
          // disabled={record.bidMeetingSendTime != undefined}
          >
            {intl.get(`bid.bidcommon.bid.button.SendOut`).d('发送')}
          </Button>
        )
      }, {
        title: intl.get(`bid.bidcommon.view.title.sendshijian`).d('发送时间'),
        dataIndex: 'bidMeetingSendTime',
        width: 250,
      },
    ];
    const onlineList = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 150,
      }, {
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        width: 150,
        render: (_, record) => (
          <div>
            <Button onClick={() => this.previewEmail(record)} style={{ marginRight: 10 }}>
              {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
            </Button>

            <Button onClick={() => this.sendMail(record)} disabled={record.isSendEmail === 'y'}>
              {intl.get(`bid.bidcommon.bid.button.SendOut`).d('发送')}
            </Button>
          </div>

        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.sendshijian`).d('发送时间'),
        dataIndex: 'invitNoticeSendTime',
        key: 'invitNoticeSendTime',
        width: 150,
      }
    ]
    const listColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'fileName',
        key: 'fileName',
        width: 150,
      }, {
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        dataIndex: 'mail',
        width: 150,
        render: (_, record) => (
          <div>
            <a onClick={() => this.openShowUpload(record)} style={{ marginRight: '5px' }}>
              {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
            </a>
            <a onClick={() => this.handleDownload(record)} style={{ marginRight: '5px' }}>
              {intl.get('bid.bidcommon.view.title.uploading').d('下载')}
            </a>
            <a onClick={() => this.deleteFile(record)}>
              {intl.get('bid.bidcommon.view.button.delete').d('删除')}
            </a>
          </div>
        )
      },
    ]
    const listProps = {
      dataSource: supplierSource,
      columns: columns1,
      // rowSelection: rowSelection,
      pagination: supplierListPagination,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      loading: fetchSourceList,
      onChange: this.supplierList
    };
    const resultColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
      },
      {
        title: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
        dataIndex: 'isBeChosen',
        render: (val) => {
          if (val === 'YES') {
            return (
              <span>{intl.get('bid.bidcommon.view.title.yes').d('是')}</span>
            )
          }
          if (val === 'NO') {
            return (
              <span>{intl.get('bid.bidcommon.view.title.no').d('否')}</span>
            )
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看'),
        // dataIndex: 'supplierId',
        render: (text, record, index) => {
          return (
            <a onClick={() => { this.previewEmail(record) }}>{intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}</a>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.approvalstatus`).d('审批结果'),
        dataIndex: 'result',
        render: (val) => {
          if (val === 'pass') {
            return (
              <span>{intl.get('bid.bidcommon.bid.button.Adopt').d('通过')}</span>
            )
          }
          if (val === 'reject') {
            return (
              <span>{intl.get('bid.bidcommon.bid.button.NoAdopt').d('驳回')}</span>
            )
          }
        }
      },
    ];
    const resultLists = {
      dataSource: resultList,
      columns: resultColumns,
      pagination: resultPagination,
      onChange: this.getResultList
    }
    const sorceColumns = [
      {
        title: intl.get(`bid.bidcommon.bid.title.name`).d('姓名'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (val, record) => (<span>{record.name}</span>)
      }, {
        title: intl.get(`bid.bidcommon.view.title.reviewedornot`).d('是否已评分'),
        dataIndex: 'scoreState',
        key: 'scoreState',
        width: 150,
        render: (val, record) => (<span>{record.scoreState}</span>)
      }, {
        title: intl.get(`bid.bidcommon.view.title.submitscoredate`).d('提交评分时间'),
        dataIndex: 'submitTime',
        key: 'submitTime',
        width: 150,
        render: (val, record) => (<span>{record.submitTime}</span>)
      }
    ]
    const newColumns = [{
      title: intl.get(`bid.bidcommon.bid.title.name`).d('姓名'),
      dataIndex: 'judgesName',
      key: 'judgesName',
      width: 150,
      // render: (val, record) => (<span>{record.name}</span>)
    }]
    if (startSorceList.length) {
      startSorceList[0].supplierList.map((item, i) => {
        newColumns.push({
          title: `${item.supplierName}`,
          key: `${item.supplierId}`,
          render: (_, row) => {
            if (row.supplierList[i]) {
              if (showPass.length && row.supplierList[i].unqualifiedSupplier) {
                if (showPass[0].value === row.supplierList[i].unqualifiedSupplier) {
                  return (
                    <span>{showPass[0].meaning}</span>
                  )
                } else {
                  return (
                    <span>{showPass[1].meaning}</span>
                  )
                }

              }
              //   return (
              //     <Form.Item>

              //     {row.supplierList[i].unqualifiedSupplier&&
              //     <Select style={{ width: 100 }}
              //       defaultValue={ row.supplierList[i].unqualifiedSupplier}
              //       disabled
              //     >
              //       {showPass.map((n) => (
              //         <Select.Option key={n.value} value={n.value}>
              //           {n.meaning}
              //         </Select.Option>
              //       ))}
              //     </Select>
              //     }
              // </Form.Item>
              //     //  <span>{row.supplierList[i].unqualifiedSupplier}</span>
              //   )
            }
          },
        })
      })

    }

    const sorceLists = {
      dataSource: sorceList,
      columns: sorceColumns,
      pagination: sorcePagination,
    }
    const sorceStartList = {
      dataSource: startSorceList,
      columns: newColumns,
      pagination: false
    }
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      // accept: 'image/*',
      data: this.uploadData,
      headers,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      // onRemove: this.onDraggerUploadRemove,
    };
    const meetingListProps = {
      ...this.props,
      loading: supplierMeetingLoading,
      onPageChange: this.supplierList,
      handleSendMailUrl: this.sendMailUrl
    }
    // console.log('supplierSource',supplierSource,contractMaintain,getEndList)
    return customizeForm(
      {

      },
      <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
        <div>
          <Form className={styles['header-form']}>
            <Modal
              title={intl.get('bid.bidcommon.view.button.add').d('添加')}
              visible={visible1}
              destroyOnClose
              onOk={this.handleOk2}
              onCancel={this.handleCancel}
              footer={[
                <Button key="back" onClick={this.handleCancel}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOk2}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <FormItem
                label={intl.get('bid.bidcommon.view.title.phasename').d('阶段名称')}
                style={{ display: 'flex' }}
                {...EDIT_FORM_ITEM_LAYOUT}

              >
                {getFieldDecorator('milestoneName', {
                  initialValue: nameFlag ? titleList.milestoneName : titleList.milestoneNameNew,
                })(
                  <Input onChange={this.showConsole()} disabled
                  />
                )}
              </FormItem>
              {this.state.upload && (
                <FormItem
                  label={intl
                    .get(`bid.bidcommon.view.title.round`)
                    .d('轮次')}
                  style={{ display: 'flex' }}
                  disabled
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', {
                    initialValue: this.num(titleList.round),
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                    //         .d('预审截止时间'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <Input disabled />
                  )}
                </FormItem>)}
              <FormItem
                label={intl.get('bid.bidcommon.view.title.starttime').d('开始时间')}
                style={{ display: 'flex' }}
                {...EDIT_FORM_ITEM_LAYOUT}

              >
                {getFieldDecorator('beforeTime', {
                  initialValue: '',
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    format={getDateTimeFormat()}
                    showTime
                    disabledDate={currentDate =>
                      this.disabledStart(currentDate, getFieldValue('milestoneEndTime'))
                    }
                  // disabledDate={currentDate =>
                  //   titleList.milestoneEndTime && moment(titleList.milestoneEndTime).is(currentDate, 'day')
                  // }
                  />

                )}
              </FormItem>
              <FormItem
                label={intl.get('bid.milestonecommon.view.title.deadline').d('截止时间')}
                style={{ display: 'flex' }}
                {...EDIT_FORM_ITEM_LAYOUT}

              >
                {getFieldDecorator('milestoneEndTime', {
                  initialValue: '',
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    format={getDateTimeFormat()}
                    showTime
                    disabledDate={currentDate =>
                      this.disabledEnd(currentDate, getFieldValue('beforeTime'))
                    }
                  />
                )}
              </FormItem>
            </Modal>
            <Modal
              title={titleList.milestoneName}
              visible={visible}
              onOk={this.handleOkTime}
              destroyOnClose
              onCancel={this.handleCancel}
              footer={[
                <Button key="back" onClick={this.handleCancel}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOkTime}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <FormItem
                label={intl.get('bid.bidcommon.view.title.phasename').d('阶段名称')}
                style={{ display: 'flex' }}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('name', {
                  initialValue: titleList.milestoneName,
                })(
                  <Input disabled
                  />
                )}
              </FormItem>

              {titleList.round && titleList.milestoneCode != 'project_qa' && (
                <FormItem
                  label={intl
                    .get(`bid.bidcommon.view.title.round`)
                    .d('轮次')}
                  style={{ display: 'flex' }}
                  disabled
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('prequalEndDate', {
                    initialValue: intl.get('bid.bidcommon.view.title.the').d('第') + titleList.round + intl.get('bid.bidcommon.view.title.turn').d('轮'),
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                    //         .d('预审截止时间'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              )}
              {titleList.milestoneCode != 'bid_metting' && (
                <FormItem
                  label={intl
                    .get(`bid.bidcommon.view.title.starttime`)
                    .d('开始时间')}
                  style={{ display: 'flex' }}

                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('beforeTime', {
                    initialValue: titleList.milestoneStartTime && moment(titleList.milestoneStartTime),
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                    //         .d('预审截止时间'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateTimeFormat()}
                      showTime
                      disabled={titleList.milestoneState == 'in_process'}
                      disabledDate={currentDate =>
                        this.disabledStart(currentDate, getFieldValue('milestoneEndTime'))
                      }
                    // disabledDate={currentDate =>
                    //   getFieldValue('beforeTime') &&
                    //   moment(getFieldValue('beforeTime')).isAfter(currentDate, 'day')
                    // }
                    />
                  )}
                </FormItem>
              )}
              {titleList.milestoneCode !== 'bid_metting' && (
                <FormItem
                  label={intl
                    .get(`bid.milestonecommon.view.title.deadline`)
                    .d('截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                  style={{ display: 'flex' }}

                >
                  {getFieldDecorator('milestoneEndTime', {
                    initialValue: titleList.milestoneEndTime && moment(titleList.milestoneEndTime),
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                    //         .d('预审截止时间'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateTimeFormat()}
                      showTime
                      disabledDate={currentDate =>
                        this.disabledEnd(currentDate, getFieldValue('beforeTime'))
                      }
                    />
                  )}
                  {titleList.milestoneCode === 'project_qa' && (
                    <div>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.ProjectQAeditingtimegys').d('供应商须在截止时间前递交答疑问题')}
                      </span>
                      {/* <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.ProjectQAeditingtimecgy').d('采购员在截止时间后操作答疑')}
                      </span> */}
                    </div>

                  )}
                  {titleList.milestoneCode === 'technical_documents' && (
                    <div>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Technicalandcommercialsubmissionandeditingtimegys').d('供应商须在截止时间前递交技术商务文件')}
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Technicalandcommercialsubmissionandeditingtimecgy').d('采购员可在任何时间查看已递交的文件')}
                      </span>
                    </div>

                  )}
                  {titleList.milestoneCode === 'ten_clarification' && (
                    <div>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Editingtimeoftechnicalandcommercialclarificationpw').d('评委需须在截止时间前提出问题')}
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Editingtimeoftechnicalandcommercialclarificationcgy').d('采购员须在截止时间前操作')}
                      </span>
                    </div>
                  )}
                  {titleList.milestoneCode === 'price_file_upload' && (
                    <div>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Quotationfileeditingtimegys').d('供应商须在截止时间前递交报价文件')}
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Quotationfileeditingtimecgy').d('采购员在截止时间后才可查看报价【单一来源谈判方式除外】')}
                      </span>
                    </div>
                  )}
                  {titleList.milestoneCode === 'price_clarification' && (
                    <div>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                      </span>
                      <span className={classnames(styles['tip-style'])}>
                        {intl.get('bid.bidcommon.view.title.Priceclarificationeditingtime').d('供应商须在截止时间前回复价格澄清的疑问')}
                      </span>
                    </div>

                  )}
                </FormItem>
              )}
              {/* <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}> */}
              {titleList.milestoneCode == 'bid_metting' && (
                <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                  <div>
                    <EditTable {...listProps} />
                  </div>
                </LocaleProvider>

              )}
              {/* {
            intl
            .get(`bid.milestonecommon.view.title.deadline`)
            .d('截止时间')
          } */}
            </Modal>
            <Modal
              title={intl.get('bid.milestonecommon.view.title.projectbidpresentationmeeting').d('项目述标会议')}
              destroyOnClose
              visible={visibleCreate}
              onOk={this.handleOk}
              width='80%'
              onCancel={this.handleCancel}
              footer={[
                <Button key="back" onClick={this.handleCancel}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOk}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <MeetingList {...meetingListProps} />
            </Modal>
            <Modal
              title={intl.get('bid.bidcommon.view.title.attachment').d('附件')}
              visible={showFlag}
              destroyOnClose
              onOk={this.fileListOk}
              onCancel={this.handleCancel}
              footer={[
                <Button key="back" onClick={this.handleCancel}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.fileListOk}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <Table
                  bordered
                  columns={listColumns}
                  dataSource={showList}
                  pagination={pagination}
                  rowKey='milestoneId'
                  // scroll={{ y: 360 }}
                  scroll={{ x: tableScrollWidth(listColumns)}}
                ></Table>
              </LocaleProvider>
            </Modal>
            <Modal
              title={intl.get('bid.bidcommon.view.button.upload').d('上传')}
              visible={openFlag}
              footer={null}
              closable
              destroyOnClose
              onCancel={this.upLoadfile}
              className={styles.priceEntry}
            >
              <Dragger {...draggerUploadProps}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">
                  {intl
                    .get(`bid.bidcommon.view.message.uploadtext`)
                    .d('单击或拖动附件(2GB以下)到此区域进行上传')}
                </p>
                <p className="ant-upload-hint">
                  {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
                </p>
              </Dragger>
            </Modal>
            <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
              <Table
                bordered
                columns={columns}
                dataSource={getEndList}
                className={classnames(styles['table-style'])}

                pagination={pagination}
                rowKey='milestoneId'
                onChange={this.changeData()}
              ></Table>
            </LocaleProvider>
            <Modal
              title={intl.get(`bid.bidcommon.view.button.view`).d("结果查看")}
              visible={this.state.fileModel}
              destroyOnClose
              onOk={this.handleOkResult}
              zIndex={10}
              onCancel={this.handleCancelResult}
              width="40%"
              footer={[
                <Button key="back" onClick={this.handleCancelResult}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOkResult}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <Table bordered {...resultLists} />
              </LocaleProvider>
            </Modal>
            <Modal
              title={intl.get(`bid.bidcommon.bid.button.Preview`).d("模板预览")}
              visible={this.state.fileEmailModel}
              onOk={this.handleOkEmailMore}
              destroyOnClose
              zIndex={11}
              onCancel={this.handleCancelEmailMore}
              width="40%"
              footer={[
                <Button key="back" onClick={this.handleCancelEmailMore}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOkEmailMore}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <div dangerouslySetInnerHTML={{ __html: this.props.contractMaintain.emailPreview }}></div>
            </Modal>
            <Modal
              title={intl.get(`bid.bidcommon.bid.button.Preview`).d("预览")}
              visible={onlineShow}
              destroyOnClose
              onOk={this.handleOkEmail}
              zIndex={10}
              onCancel={this.handleCancelEmail}
              width="60%"
              footer={[
                <Button key="back" onClick={this.handleCancelEmail}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOkEmail}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <Table
                  columns={onlineList}
                  dataSource={onlineData}
                  pagination={onlinePagination}
                  rowKey='id'
                  onChange={this.onlineModel}
                >

                </Table>
              </LocaleProvider>
            </Modal>
            <Modal
              title={intl.get(`bid.bidcommon.bid.button.Viewjudgesscores`).d("查看评委评分")}
              visible={judgesSorceModel}
              onOk={this.handleOkSorce}
              destroyOnClose
              onCancel={this.handleCancelSorce}
              width="40%"
              footer={[
                <Button key="back" onClick={this.handleCancelSorce}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOkSorce}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>,
              ]}
            >
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <Table rowKey="poOrderId" bordered {...sorceLists} />
              </LocaleProvider>
            </Modal>
            <Modal
              title={intl.get(`bid.bidcommon.view.title.Summaryoftechnicalcompliancereview`).d("技术符合审查汇总")}
              visible={startSorceFlag}
              destroyOnClose
              onCancel={this.handleCancelSorceStart}
              width="40%"
              footer={[
                <Button key="back" onClick={this.handleCancelSorceStart}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleOkSorceStart} disabled={startSorceList.length && startSorceList[0].gradingState == 'y'}>
                  {intl.get(`bid.bidcommon.view.title.Confirmtostartscoring`).d('确认开始评分')}
                </Button>,
              ]}
            >
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <EditTable bordered {...sorceStartList}></EditTable>
              </LocaleProvider>
            </Modal>
            <Modal
              title={intl.get(`bid.bidcommon.view.title.completeqa`).d("答疑完结")}
              visible={qaModalVisibal}
              onOk={this.handleCompletionQA}
              destroyOnClose
              onCancel={this.handleCancelQA}
              width="40%"
              footer={[
                <Button key="back" onClick={this.handleCancelQA}>{intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}</Button>,
                <Button key="submit" type="primary" onClick={this.handleCompletionQA}>
                  {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                </Button>
              ]}
            >
              <p>{intl.get(`bid.bidcommon.view.title.completeqaprompt`).d('点击【确认】后，将结束整个技术商务澄清环节（含添加下一轮的操作）。')}</p>
            </Modal>
          </Form>
        </div>
      </LocaleProvider>
    );
  }
}
