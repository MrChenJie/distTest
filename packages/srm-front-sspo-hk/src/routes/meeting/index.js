/**
 * @Description: 项目答疑
 * @date 2020-11-24
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Form, Button, LocaleProvider, Spin, Collapse, Modal } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import request from 'utils/request';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import uuidv4 from 'uuid/v4';
import { getCurrentLanguage, getEditTableData, getCurrentUser } from 'utils/utils';
import ProjectQaInfo from './projectQaInfo';
import BiddingRound from './biddingRound';
import notification from 'utils/notification';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  createPagination,
} from 'hzero-front/lib/utils/utils';
import { SRM_BID } from '@/common/config';
import intl from 'utils/intl';

const ROW_KEY = 'qaId';
const { Panel } = Collapse;
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'sodr.purchaseOrder',
    'hzero.common'
  ],
})
@connect(({ loading, projectQaModels, contractMaintain }) => ({
  projectQaModels,
  contractMaintain,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
  revokeLoading: loading.effects['projectQaModels/revoke'],
  submitDecisionInfoLoading: loading.effects['contractMaintain/submitDecisionInfo'],
}))
@Form.create({ fieldNameProp: null })
class projectQa extends Component {
  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    // 只读界面
    // const isViewOnly = match.path.includes('viewOnly');
    // 判断是否汇总页面跳转过来
    // const { isSummary = false } = state;
    this.state = {
      activeKey: [
        'projectQaInfo',
        'biddingRound',
        'purchaseReplyTable',
        'activeClarificationTable',
      ],
      clarificationDataSource: [],
      clarificationPagination: {},
      //   groupUnsaveFlag: false
      milState: '',
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    this.init();
  }

  componentWillUnmount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'projectQaModels/updateState',
    //   payload: {
    //     poHeaderInfo: {}, // 头信息
    //     poHeaderMilestonesInfo: {},
    //   },
    // });
  }

  @Bind
  upData(data) {
    // console.log('new',data)
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: data, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });
    this.setState({
      clarificationDataSource: [],
    })

  }

  @Bind
  upChange(data) {
    // console.log('new',data)
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: data, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });


  }

  @Bind
  init() {
    this.getPurchaseReply();
    // this.getCmiContentList();
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
  }

  /**
   * 查询基本头信息
   */
  @Bind
  queryProjectQaInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/queryProjectQaInfo',
      payload: {
        proId: match.params.proId,
      },
    }).then(res => {
      if (res) {
        const { dispatch } = this.props;
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            poHeaderInfo: res, // 头信息
          },
        });
      }
    });
  }

  /**
   * 查询轮次信息
   */
  @Bind
  queryProjectQaMilestonesInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/queryProjectQaMilestonesInfo',
      payload: {
        milestoneId: match.params.milestoneId,
      },
    }).then(res => {
      if (res) {
        // 初次未提交milestoneState应是返回undefined
        if (res.milestoneState !== undefined) {
          this.setState({ milState: res.milestoneState })
        } else {
          this.setState({ milState: '' })
        }
      }
    });
    dispatch({
      type: 'contractMaintain/fetchDetailEnum',
    });


  }

  // 获取CMI答复内容数据
  @Bind
  getPurchaseReply(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/fetchPurchaseReplyList',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
        // type: 3, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            purchaseReplyDataSource: newDataSource,
            purchaseReplyPagination: pagination,
          },
        });
        this.setState({
          groupUnsaveFlag: false,
        });
      }
    });
  }

  // // 获取CMI主动澄清
  // @Bind
  // getCmiContentList(page = {}) {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'projectQaModels/fetchCmiContentList',
  //     payload: {
  //       page,
  //       proId: 61,
  //       milestoneId: 449,
  //       type: 2, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       const { content = [] } = res;
  //       const pagination = createPagination(res);
  //       const newDataSource = content.map((item) => ({
  //         ...item,
  //         _status: 'update',
  //         rowKey: uuidv4(),
  //       }));
  //       dispatch({
  //         type: 'projectQaModels/updateState',
  //         payload: {
  //           clarificationDataSource: newDataSource,
  //           clarificationPagination: pagination,
  //         },
  //       });
  //       this.setState({
  //         groupUnsaveFlag: false,
  //       });
  //     }
  //   });
  // }

  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  handleSavePurchaseReply() {
    const { dispatch, projectQaModels } = this.props;
    const { purchaseReplyDataSource = [] } = projectQaModels;
    const data = getEditTableData(purchaseReplyDataSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    if (data.length > 0) {
      dispatch({
        type: 'projectQaModels/saveClarification',
        payload: {
          data,
        },
      }).then((resData) => {
        if (resData) {
          dispatch({
            type: 'projectQaModels/saveClarificationAnswers',
            payload: {
              resData,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.getPurchaseReply();
            }
          })
        }
      })
    }
  }
  // @Bind
  // handleSaveClarification() {
  //   const { dispatch, projectQaModels } = this.props;
  //   const { clarificationDataSource = [] } = projectQaModels;
  //   const data = getEditTableData(clarificationDataSource).map((item) =>
  //     item._status === 'create'
  //       ? {
  //         ...item,
  //         poOrderId: undefined,
  //       }
  //       : item
  //   );
  //   if (data.length > 0) {
  //     dispatch({
  //       type: 'projectQaModels/saveClarification',
  //       payload: {
  //         data,
  //       },
  //     }).then((resData) => {
  //       if (resData) {
  //         dispatch({
  //           type: 'projectQaModels/saveClarificationAnswers',
  //           payload: {
  //             resData,
  //           },
  //         }).then((res) => {
  //           if (res) {
  //             notification.success();
  //             this.getCmiContentList();
  //           }
  //         })
  //       }
  //     });
  //   }
  // }

  // /**
  //  * 添加CMI答复内容行
  //  *
  //  * @memberof PurchaseReplyTable
  //  */
  // @Bind
  // handleAddPurchaseReplyLine() {
  //   const { projectQaModels, dispatch, match } = this.props;
  //   const { poHeadersId } = match.params;
  //   const { purchaseReplyDataSource = [], purchaseReplyPagination = {} } = projectQaModels;
  //   const newLine = {
  //     _status: 'create',
  //     type: 4,
  //     organizationId: getCurrentOrganizationId(),
  //     // proId: '', // 项目ID
  //     // milestoneId: poHeadersId, // 里程碑ID
  //     // poOrderId: uuidv4(),
  //     // creationDate: moment().format('YYYY-MM-DD 00:00:00'),
  //     // realName: getCurrentUser().realName,
  //     // editFlag: 'Y',
  //     // poHeadersId: +poHeadersId,
  //   };
  //   const newDataSource = [newLine, ...purchaseReplyDataSource];
  //   const newPagination = addItemToPagination(
  //     purchaseReplyDataSource.length,
  //     purchaseReplyPagination
  //   );
  //   dispatch({
  //     type: 'projectQaModels/updateState',
  //     payload: {
  //       purchaseReplyDataSource: newDataSource,
  //       purchaseReplyPagination: newPagination,
  //     },
  //   });
  // }

  // /**
  //  * 添加CMI主动澄清行
  //  *
  //  * @memberof ActiveClarificationTable
  //  */
  // @Bind
  // handleAddClarificationLine() {
  //   const { projectQaModels, dispatch, match } = this.props;
  //   const { poHeadersId } = match.params;
  //   const { clarificationDataSource = [], clarificationPagination = {} } = projectQaModels;
  //   const newLine = {
  //     _status: 'create',
  //     type: 2,
  //     organizationId: getCurrentOrganizationId(),
  //     proId: 61, // 项目ID
  //     milestoneId: 449, // 里程碑ID
  //     // poOrderId: uuidv4(),
  //     // creationDate: moment().format('YYYY-MM-DD 00:00:00'),
  //     // realName: getCurrentUser().realName,
  //     // editFlag: 'Y',
  //     // poHeadersId: +poHeadersId,
  //   };
  //   const newDataSource = [newLine, ...clarificationDataSource];
  //   const newPagination = addItemToPagination(
  //     clarificationDataSource.length,
  //     clarificationPagination
  //   );
  //   dispatch({
  //     type: 'projectQaModels/updateState',
  //     payload: {
  //       clarificationDataSource: newDataSource,
  //       clarificationPagination: newPagination,
  //     },
  //   });
  // }

  // @Bind
  // handleDeleteClarificationLine(selectedRowKeys, selectedRows, callback) {
  //   const { projectQaModels, dispatch } = this.props;
  //   const { clarificationDataSource = [], clarificationPagination = {} } = projectQaModels;
  //   const newDataSource = selectedRows;
  //   const deleteData = selectedRows;
  //   const newPagination = delItemsToPagination(
  //     selectedRowKeys.length,
  //     clarificationDataSource.length,
  //     clarificationPagination
  //   );

  //   const data = deleteData.filter((item) => item._status === 'update');
  //   const remainCreateData = newDataSource.filter((item) => item._status === 'create');
  //   if (data.length > 0) {
  //     if (remainCreateData.length > 0) {
  //       Modal.info({
  //         title: intl
  //           .get('sodr.purchaseOrder.view.info.ramainCreateData')
  //           .d('存在新增的行没有保存！'),
  //       });
  //       return false;
  //     } else {
  //       dispatch({
  //         type: 'projectQaModels/deleteClarification',
  //         payload: {
  //           data,
  //         },
  //       }).then((res) => {
  //         if (res) {
  //           notification.success();
  //           const { current, pageSize, sourceSize } = clarificationPagination;
  //           this.getCmiContentList({
  //             current,
  //             pageSize: sourceSize || pageSize,
  //           });
  //           callback();
  //         }
  //       });
  //     }
  //   } else {
  //     if (remainCreateData.length > 0) {
  //       Modal.info({
  //         title: intl
  //           .get('sodr.purchaseOrder.view.info.ramainCreateData')
  //           .d('存在新增的行没有保存！'),
  //       });
  //       return false;
  //     } else {
  //       dispatch({
  //         type: 'projectQaModels/updateState',
  //         payload: {
  //           clarificationDataSource: newDataSource,
  //           clarificationPagination: newPagination,
  //         },
  //       });
  //       callback();
  //     }
  //   }
  // }

  // 保存数据
  @Bind
  saveData(callback) {
    const { poHeaderInfo } = this.props;
    let poHeaderInfoNew = {...poHeaderInfo}
    const organizationId = getCurrentOrganizationId()
    this.props.form.validateFields({ force: true }, (err, values) => {
      poHeaderInfoNew.decisionType = values.decisionType
      poHeaderInfoNew.decisionMeetingDate = moment(values.decisionMeetingDate).format('YYYY-MM-DD HH:mm:ss')
      poHeaderInfoNew.decisionDate = values.decisionDate
      console.log(values, 'value',poHeaderInfoNew)
    })
    if (
      poHeaderInfoNew.decisionType &&
      poHeaderInfoNew.decisionMeetingDate &&
      poHeaderInfoNew.decisionDate &&
      poHeaderInfoNew.decisionFileUrls) {
      request(
        `${SRM_BID}/v1/${organizationId}/bid-pro-infos/saveProDecisionInfo`,
        {
          method: 'POST',
          body: [poHeaderInfoNew]
        }
      ).then((res) => {
        if (res) {
          if(typeof callback === 'function') {
            callback();
          } else {
            notification.success();
            this.queryProjectQaMilestonesInfo();
            this.queryProjectQaInfo();
          }
        }
      })
    } else {
      notification.error({
        message: intl.get(`bid.bidcommon.view.message.decisiontypebitian`).d('请填写决策类型、决策会议日期、决策会期、决策纪要必填项！')
      })
    }
  }

  // 提交数据
  @Bind
  submitData() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/submitDecisionInfo',
      payload: {
        proId: match.params.proId,
      }
    }).then((res) => {
      if(res) {
        notification.success();
        this.queryProjectQaMilestonesInfo();
        this.queryProjectQaInfo();
      }
    })
  }

  // 提交按钮
  @Debounce(500)
  @Bind
  handleSubmit() {
    this.saveData(() => {
      this.submitData()
    })
  }

  // 分配
  @Bind
  handleAssign(selectedRowKeys, selectedRows, value, callback) {
    const { dispatch } = this.props;
    const data = selectedRows
    dispatch({
      type: 'projectQaModels/savePurchaseReply',
      payload: {
        data,
        answerUser: value
      },
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  render() {
    const {
      revokeLoading = false,
      form,
      location,
      projectQaModels: {
        purchaseReplyDataSource = [],
        purchaseReplyPagination = {},
        clarificationDataSource = [],
        clarificationPagination = {},
        code = {},
      },
      contractMaintain: { detailEnumMap = {} },
      poHeaderInfo,
      match,
      submitDecisionInfoLoading = false,
    } = this.props;
    const { activeKey, milState } = this.state;
    const projectQaInfoProps = {
      form,
      poHeaderInfo,
      code,
      flag: false,
      detailEnumMap,
      onSave: this.upData,
      onChange: this.upChange,
      milState,
    };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <Fragment>
        {milState !== '' && milState !== 'published' && poHeaderInfo.decisionInfoState !== 'y' && <Header>
          <div style={{ marginRight: '16px' }}>
            <Button
              onClick={this.saveData}
              style={{marginRight: '8px'}}
            >
              {intl.get('bid.bidcommon.view.button.save').d('保存')}
            </Button>
            <Button
              type="primary"
              onClick={this.handleSubmit}
              loading={submitDecisionInfoLoading}
            >
              {intl.get('bid.bidcommon.view.button.submit').d('提交')}
            </Button>
          </div>
        </Header>}
        <Content className="content-bottom">
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <div>
              <Spin spinning={revokeLoading}>
                <Collapse activeKey={activeKey} onChange={this.onCollapseChange}>
                  <Panel
                    header={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                    key="projectQaInfo"
                  >
                    <ProjectQaInfo {...projectQaInfoProps} />
                  </Panel>
                  <Panel
                    header={intl.get(`bid.bidcommon.view.title.meetingjiyao`).d('上会纪要')}
                    key="biddingRound"
                  >
                    <BiddingRound {...projectQaInfoProps} />
                  </Panel>

                </Collapse>
              </Spin>
            </div>
          </LocaleProvider>
        </Content>
      </Fragment>
    );
  }
}

export default projectQa;
