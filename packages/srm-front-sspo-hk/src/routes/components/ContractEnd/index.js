/*
 * ui 修改
 * @date: 2023-08-08
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Upload, Tag, Tooltip, Row, Col } from 'antd';
import CusTable from '_cus_components/CusTable';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusSpin from '_cus_components/CusSpin';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusUploadTechnical from '_cus_components/CusUpload';
import { tooltipRender } from '_cus_utils/render';
import CusUploadFile from './modal/UploadFile';
import PageWrapper from '_cus_components/Page/PageWrapper';
import classnames from 'classnames';
import dayjs from 'dayjs';
import uuidv4 from 'uuid/v4';
import { isFunction, isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import EditTable from '_cus_components/EditTable';
import { operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import request from 'utils/request';
import { Link } from 'dva/router';
import {
  getCurrentOrganizationId,
  getDateTimeFormat,
  getAccessToken,
  getCurrentLanguage,
  getCurrentUser,
} from 'utils/utils';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';
import { HZERO_FILE, API_HOST } from 'utils/config';
import { SRM_BID } from '@/common/config';
import { isString } from 'lodash';
import { getEditTableData, tableScrollWidth } from 'utils/utils';
import { downloadFile } from 'services/api';
import MeetingList from './modal/meetingList';
// import { getAttachmentUrl } from './utils';
import CusNotification from '_cus_components/CusNotification';
import CusSelect from '_cus_components/CusSelect';
import querystring from 'querystring';
import { numberRender } from 'utils/renderer';
import moment from 'moment';
import CusUploadFileType from '@/components/CusUploadFileType';

const { Dragger } = Upload;
const FormItem = Form.Item;
const prompt = 'bid.bidcommon';

const organizationId = getCurrentOrganizationId();

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
// tips1 禁止时不显示
@connect(({ loading = {}, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  supplierMeetingLoading: loading.effects['contractMaintain/supplierListMeeting'],
  fetchResultListLoading: loading.effects['contractMaintain/getResultList'],
  completionQALoading: loading.effects['contractMaintain/completionQA'],
  saveOnlyResultUrlLoading: loading.effects['contractMaintain/saveOnlyResultUrl'],
  getBidCheckFileLoading: loading.effects['contractMaintain/getBidCheckFile'],
  saveTechfileListLoading: loading.effects['contractMaintain/saveTechfileList'],
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
    'ssrc.quoController',
    'HKPC.commom',
    'ssrc.projectSetup'
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
        milestoneName: '',
      },
      fileModel: false, // 结果查询弹框
      fileEmailModel: false,
      nameFlag: false,
      judgesSorceModel: false,
      startSorceFlag: false,
      qaModalVisibal: false,
      data: [], // 里程碑临时数据，用作触发技术商务澄清编辑时间弹框带的数据
      isDataLoaded: false, // 里程碑数据是否已加载标志位
      tenClarificationLoading: false, // 技术商务澄清的添加下一轮弹框的确认loading
      isNoticeEditTime: false, // 点击编辑公告后打开弹框
      noticeRecord: {},
      isSupplierModalVisable: false,
      isSelectSup: '',
      bidOpenVisible: false,
      bidFailedVisible: false,
      failedSupplierList: [],
      bidFileDataSource: [],
      uploadtechfileVisible: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 打开结果查询的弹框
  @Bind()
  showFileBox() {
    this.getResultList();
  }

  // 查看评委评分的弹框
  @Bind()
  openList() {
    this.setState({
      judgesSorceModel: true,
    });
    this.getSorceList();
  }

  @Bind
  getSorceList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/getSorceList',
      payload: {
        page,
        proId: match.params.proId,
      },
    });
  }
  @Bind()
  handleOkSorce() {
    this.setState({
      judgesSorceModel: false,
    });
  }
  @Bind()
  handleCancelSorce() {
    this.setState({
      judgesSorceModel: false,
    });
  }

  @Bind
  showEdit(record) {
    const { CMHK_LOGIN, APPROVAL_PROCESS } = process.env;
    const isPub = location.pathname.includes('pub');
    const { dispatch, history, match, contractMaintain, form } = this.props;
    const { detailEnumMap } = contractMaintain;
    const { bpmGuid } = detailEnumMap;
    form.validateFields(['deadline'], (err, values) => {
      if (!err) {
        dispatch({
          type: 'contractMaintain/checkEdit',
          payload: {
            // page,
            proId: match.params.proId || 3,
          },
        }).then((res) => {
          if (res) {
            // 这个接口校验上传技术标书文件
            dispatch({
              type: 'contractMaintain/checkUploadTechfile',
              payload: {
                proId: match.params.proId,
              }
            }).then((flagRes) => {
              if(flagRes?.flag) {
                // 这个接口判断是否设置条款
                dispatch({
                  type: 'contractMaintain/getClauseInfo',
                  payload: {
                    proId: match.params.proId
                  }
                }).then((res) => {
                  if(isEmpty(res)) {
                    CusNotification.error({
                      message: intl.get('HKPC.commom.view.title.settermsfirst').d('请先设置条款')
                    })
                  } else {
                    const deadline = dayjs(values.deadline).unix();
                    const templateCode = 'BPM_SCM_GGSP';
                    const urlEncode = encodeURIComponent(
                      `${CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/sspo/OnlineNotices?noticeId=${match.params.proId}&milestoneId=${record.milestoneId}&deadline=${deadline}`
                    );
                    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${urlEncode}`;
                    window.open(url, '_blank');
                    this.setState({
                      isNoticeEditTime: false,
                    });
                  }
                })
              } else {
                CusNotification.error({
                  message: this.props.getDetailList.proInfoWording
                    ? intl
                        .get(`bid.bidcommon.view.message.edditannouncement`)
                        .d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！')
                    : intl
                        .get(`bid.bidcommon.view.message.edditannouncementnew`)
                        .d('请上传比选/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！'),
                  // intl.get('bid.bidcommon.view.message.edditannouncement').d('请先编辑项目答疑、技术商务文件递交的截止时间！'),
                });
              }
            })
          } else {
            CusNotification.error({
              message: this.props.getDetailList.proInfoWording
                ? intl
                    .get(`bid.bidcommon.view.message.edditannouncement`)
                    .d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！')
                : intl
                    .get(`bid.bidcommon.view.message.edditannouncementnew`)
                    .d('请上传比选/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！'),
              // intl.get('bid.bidcommon.view.message.edditannouncement').d('请先编辑项目答疑、技术商务文件递交的截止时间！'),
            });
          }
        });
      }
    });
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
        state: 0,
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
          fileModel: true,
        });
      }
    });
  }
  /**
   * 查看中标结果表格数据
   */
  @Bind()
  getSuggestSupplierList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/getResultList',
      payload: {
        page,
        proId: match.params.proId,
        state: 0,
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
            suggestSupplierDataSource: newDataSource,
            suggestSupplierPagination: pagination,
          },
        });
      }
    });
  }

  @Bind()
  handleOkResult() {
    this.setState({
      fileModel: false,
    });
  }
  @Bind()
  handleCancelResult() {
    this.setState({
      fileModel: false,
    });
  }

  // 打开结果查看的邮件预览弹框
  @Bind
  previewEmail(record) {
    this.getResultEmailList(record);
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
          isBeChosen: record.isBeChosen === 'YES' ? 'YES' : 'NO',
        },
      }).then((res) => {
        this.setState({
          fileEmailModel: true,
        });
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
          fileEmailModel: true,
        });
      });
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
      });
  }
  @Bind()
  handleCancelEmailMore() {
    this.props.reChange(),
      this.setState({
        fileEmailModel: false,
        // onlineShow:false,
      });
  }

  @Bind()
  handleCancelEmail() {
    this.props.reChange(),
      this.setState({
        fileEmailModel: false,
        onlineShow: false,
      });
  }

  // 打开答疑完结确认弹框
  @Bind()
  showQAModal(record) {
    this.setState({ qaModalVisibal: true, qaModalRecord: record });
  }
  @Bind()
  handleCancelQA() {
    this.setState({ qaModalVisibal: false });
  }
  // 答疑完结
  @Debounce(300)
  handleCompletionQA = () => {
    const { dispatch } = this.props;
    const { qaModalRecord } = this.state;
    // 采购方式为公开询价或者邀请询价的调用completionQAInquiry，其余采购方式调用completionQA
    dispatch({
      type:
      ['public_inquiry', 'invitation_inquiry'].includes(this.props.getDetailList?.purchaseType)
      ?
      'contractMaintain/completionQAInquiry' : 'contractMaintain/completionQA',
      payload: {
        milestoneId: qaModalRecord.milestoneId,
      },
    }).then((res) => {
      if (res.message === 'ok') {
        CusNotification.success();
        this.setState({ qaModalVisibal: false });
        this.props.reChange();
      } else {
        CusNotification.error();
      }
    });
  };

  @Bind()
  winningResultBpmClick(record) {
    const { dispatch } = this.props;
    const templateCode = 'BPM_SCM_YBCGSS';
    const { CMHK_LOGIN, APPROVAL_PROCESS } = process.env;
    dispatch({
      type: 'contractMaintain/getMilestoneId',
      payload: {
        milestoneId: record.milestoneId,
      },
    }).then((res) => {
      if (res) {
        // if(res.purchaseReltState === 'DRAFT' || res.purchaseReltState === 'DENIED' || res.purchaseReltState === undefined) {
        //   const urlEncode = encodeURIComponent(`${CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/sspo/WinningResult?proId=${res.proId}`);
        //   const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${urlEncode}`;
        //   window.open(url, '_blank');
        // } else {
        //   const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${res.caseId}`;
        //   window.open(url, '_blank');
        // }
        // if (res.caseId) {
        //   const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${res.caseId}`;
        //   window.open(url, '_blank');
        // } else {
        //   const urlEncode = encodeURIComponent(
        //     `${CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/sspo/WinningResult?proId=${res.proId}`
        //   );
        //   const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${urlEncode}`;
        //   window.open(url, '_blank');
        // }
        dispatch({
          type: 'contractMaintain/getIsSelectSup',
          payload: {
            proId: record.proId,
          },
        }).then((result) => {
          if(result) {
            this.setState({
              isSelectSup: result.isSelectSup,
              isSupplierModalVisable: true,
            }, () => {
              this.getSuggestSupplierList();
            });
          }
        })
      }
    });
  }

  componentDidMount() {
    newDataList = [];
    this.onlineModel();
    // 模拟异步加载数据
    setTimeout(() => {
      this.setState({ data: [...this.props?.getEndList], isDataLoaded: true });
    }, 2000);
  }

  componentDidUpdate(prevProps, prevState) {
    // 当数据加载完成且之前的isDataLoaded为false时打开弹框
    const { history } = this.props;
    const {
      location: { search },
    } = history;
    const { type } = querystring.parse(search.substr(1));
    const { data } = this.state;
    // 采购收到全部评委已完成文件查阅的待办，点击待办进入并打开技术商务澄清的‘编辑时间’弹窗
    if (
      this.state.isDataLoaded &&
      !prevState.isDataLoaded &&
      type !== undefined &&
      type === 'consult'
    ) {
      // 获取技术商务澄清第一轮且打开编辑时间弹框
      let rowData = [];
      let index = 0;
      data.map((res, i) => {
        if (
          i > 0 &&
          res.milestoneCode === 'ten_clarification' &&
          res.round === '1' &&
          (this.props.getEndList[i - 1].milestoneState === 'completed' ||
            this.props.getEndList[i - 1].milestoneState === 'exceedTheDeadline' ||
            this.props.getEndList[i - 1].milestoneState === 'affirmed')
        ) {
          rowData.push(res);
          index = i;
        }
      });
      this.showModal(rowData[0], _, index);
    }
    // 采购收到评委全部完成初审的待办，点击待办进入并打开“技术符合审查汇总”弹窗
    if (
      this.state.isDataLoaded &&
      !prevState.isDataLoaded &&
      type !== undefined &&
      type === 'audit'
    ) {
      this.startSorce();
    }
  }

  // @Bind
  // uploadFlag(value, flag, index) {
  //   const val = value
  //   const fag = flag
  //   this.setState({
  //     openFlag: true,
  //   })
  // }

  @Bind
  showFile() {
    this.setState({
      showFlag: true,
      showList: this.props.getEndList[1].fileDTOList,
    });
  }

  @Bind
  showModal(value, flag, index) {
    // 排除技术、商务澄清让编辑时间的校验走else判断
    if (
      value.milestoneCode !== 'ten_clarification' &&
      (value.milestoneCode == 'project_qa' ||
        value.milestoneCode == 'technical_documents' ||
        value.milestoneCode == 'price_file_upload' ||
        (value.round == 1 &&
          this.props.getDetailList.purchaseType !== 'public_bidding' &&
          this.props.getDetailList.purchaseType !== 'invited_bidding'))
    ) {
      this.props.form.getFieldDecorator('beforeTime', { initialValue: value.creationDate });
      this.setState({
        visible: true,
        titleList: value,
      });
    } else {
      if (
        this.props.getEndList[index - 1].milestoneState == 'completed' ||
        this.props.getEndList[index - 1].milestoneState == 'exceedTheDeadline' ||
        this.props.getEndList[index - 1].milestoneState == 'affirmed' ||
        this.props.getEndList[index - 1].milestoneState == 'in_process'
      ) {
        const newDateTime = new Date().getTime();
        const endTime = Date.parse(new Date(value.milestoneEndTime));
        // 技术、商务澄清第一轮的时候校验所有评委是否都已完成文件查阅阶段
        if (value.milestoneCode === 'ten_clarification' && value.round === '1') {
          const { dispatch, match } = this.props;
          // 查询所有评委是否都已完成文件查阅阶段
          dispatch({
            type: 'contractMaintain/checkClarificationTime',
            payload: {
              proId: match.params.proId,
            },
          }).then((res) => {
            if (res && (res.message === '0' || res.message === 'ok')) {
              // 0=旧单子；ok=新单子：通过
              if (newDateTime < endTime || !value.milestoneEndTime) {
                this.props.form.getFieldDecorator('beforeTime', {
                  initialValue: value.creationDate,
                });
                this.setState({
                  visible: true,
                  titleList: value,
                });
              }
            }
            if (res && res.message === 'err') {
              // 新单子：不通过
              CusNotification.warning({
                message: intl
                  .get(`bid.bidcommon.view.message.TeFiLo`)
                  .d('当所有评委完成“文件查阅”后方可开始“技术、商务澄清”'),
                closable: false,
              });
            }
          });
        } else {
          if (newDateTime < endTime || !value.milestoneEndTime) {
            this.props.form.getFieldDecorator('beforeTime', { initialValue: value.creationDate });
            this.setState({
              visible: true,
              titleList: value,
            });
          }
        }
      }
    }
  }

  @Bind
  onlineModel(page = {}) {
    const { dispatch, matchs } = this.props;
    dispatch({
      type: 'contractMaintain/supplierListMeeting',
      payload: {
        page,
        proId: matchs.params.proId,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            onlineData: res.content,
            onlinePagination: createPagination(res),
          },
        });
        this.setState({
          isOnlineDataFlag: res.content?.filter((item) => item.isSendEmail === 'n').length > 0,
        });
      }
    });
  }

  @Bind
  delete(value) {
    const { handleEdit } = this.props;
    if (value.milestoneState != 'completed') {
      request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
        method: 'DELETE',
        body: [value],
      }).then((res) => {
        if (res) {
          handleEdit();
        }
      });
    }
  }

  @Debounce(300, { leading: true })
  @Bind
  addModal(value, _, index) {
    console.log(value);
    value.milestoneEndTime = '';
    value.milestoneStartTime = '';
    this.setState({
      visible1: true,
      nameFlag: true,

      titleList: value,
      upload: true,
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  addModalF(value, _, index) {
    value.milestoneNameNew = intl
      .get('bid.milestonecommon.bid.title.quotationdocument')
      .d('报价文件');
    if (
      this.props.getEndList[index].milestoneState == 'completed' &&
      this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out'
    ) {
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
    const param = [
      {
        id: val.id,
        proId: val.proId,
        currentMilestoneId: this.state.newId,
      },
    ];
    const organizationId = getCurrentOrganizationId();
    dispatch({
      type: 'contractMaintain/checkEdit',
      payload: {
        proId: val.proId,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'contractMaintain/sendSupplierEmailInvited',
          payload: param,
        }).then((res) => {
          if (res && res.failed) {
            return CusNotification.error({ message: res.message, closable: false });
          }
          if (res.resCode) {
            this.onlineModel();
            CusNotification.success({
              message: intl.get('hzero.common.notification.success').d('发送成功'),
            });
          }
        });
      } else {
        if (['single_source', 'internal_source'].includes(this.props.getDetailList.purchaseType)) {
          CusNotification.error({
            message: this.props.getDetailList.proInfoWording
              ? intl
                  .get(
                    `bid.bidcommon.view.title.PleaseuploadthedeadlineforbiddingnegotiationdocumentseditingprojectQAsubmissionoftechnicalandcommercialdocumentsandquotationdocuments`
                  )
                  .d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交、报价文件的截止时间！')
              : intl
                  .get(`bid.bidcommon.view.title.Pleaseupdocumentsnew`)
                  .d('请上传比选/谈判文件、编辑项目答疑、技术商务文件递交、报价文件的截止时间！'),
          });
        } else {
          CusNotification.error({
            message: this.props.getDetailList.proInfoWording
              ? intl
                  .get(`bid.bidcommon.view.message.edditannouncement`)
                  .d('请上传招标/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！')
              : intl
                  .get(`bid.bidcommon.view.message.edditannouncementnew`)
                  .d('请上传比选/谈判文件、编辑项目答疑、技术商务文件递交的截止时间！'),
          });
        }
      }
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  addModalP(value) {
    value.milestoneNameNew = intl
      .get('bid.milestonecommon.view.title.priceclarification')
      .d('价格澄清');
    value.milestoneEndTime = '';
    value.milestoneStartTime = '';
    this.setState({
      visible1: true,
      nameFlag: false,

      message: 'price_clarification',
      titleList: value,
      upload: false,
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  addModalL(value) {
    value.milestoneNameNew = intl
      .get('bid.bidcommon.bid.button.SubmissionOfTechnicalAndCommercialDocumentsfinalround')
      .d('技术及商务文件递交(最终轮)');
    value.milestoneEndTime = '';
    value.milestoneStartTime = '';
    this.setState({
      visible1: true,
      nameFlag: false,

      message: 'technical_documents_final',
      titleList: value,
      upload: false,
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  addModalM(value, index) {
    const { dispatch, matchs } = this.props;
    dispatch({
      type: 'contractMaintain/supplierListMeeting',
      payload: {
        proId: matchs.params.proId,
      },
    }).then((res) => {
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          supplierSource: res.content.map((n) => ({
            ...n,
            _status: 'update',
            milestoneId: value.milestoneId,
          })),
          supplierListPagination: createPagination(res),
        },
      });
    });
    this.setState({
      visibleCreate: true,
    });
  }

  @Bind
  num(value) {
    const i = Number(value) + 1;
    const index = i;
    return index;
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
    }).then((res) => {
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          supplierSource: res.content.map((n) => ({
            ...n,
            _status: 'update',
            milestoneId: this.props.contractMaintain.supplierSource[0].milestoneId,
          })),
          supplierListPagination: createPagination(res),
        },
      });
    });
  }

  @Bind()
  beforeUpload(file) {
    const fileSize = 2 * 1024 * 1024 * 1024;
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
    request(
      `${SRM_BID}/v1/${organizationId}/import/data?templateCode=${params.templateCode}&batch=${params.batch}`,
      {
        method: 'GET',
      }
    ).then();
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

  @Debounce(300, { leading: true })
  @Bind
  handleOk2() {
    const { form, handleEdit } = this.props;
    this.setState({ tenClarificationLoading: true }); // 技术商务澄清的添加下一轮弹框的确认loading
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      if (err) {
      }
      if (values.milestoneEndTime && values.beforeTime) {
        values.milestoneEndTime = dayjs(values.milestoneEndTime).format('YYYY-MM-DD HH:mm:ss');
        values.beforeTime = dayjs(values.beforeTime).format('YYYY-MM-DD HH:mm:ss');
        if (this.state.message) {
          this.state.titleList.milestoneCode = this.state.message;
        }
        const rounds = Number(this.state.titleList.round) + 1;
        let param = {
          milestoneEndTime: values.milestoneEndTime,
          milestoneStartTime: values.beforeTime,
          milestoneId: this.state.titleList.milestoneId,
          milestoneCode: this.state.titleList.milestoneCode,
          isNeedCloseCurrentMilestone: 'n',
          nextRoundReason: values.nextRoundReason,
        };
        if (this.state.upload) {
          param = {
            ...param,
            rounds: rounds,
          };
        }
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones/addNextRound`, {
          method: 'POST',
          body: param,
        }).then((res) => {
          if (res) {
            handleEdit();
            this.setState({
              messageVisible: false,
              visible: false,
              nameFlag: true,
              visible1: false,
              message: '',
              titleList: {},
              upload: false,
              tenClarificationLoading: false,
            });
          } else {
            CusNotification.error({
              message: intl.get(`bid.bidcommon.view.message.tiangeshijian`).d('请填写时间'),
            });
          }
        });
      }
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  handleOkTime() {
    const { contractMaintain, form, handleEdit, matchs } = this.props;
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

    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      if (values.beforeTime && values.milestoneEndTime) {
        values.milestoneEndTime = dayjs(values.milestoneEndTime).format('YYYY-MM-DD HH:mm:ss');
        values.beforeTime = dayjs(values.beforeTime).format('YYYY-MM-DD HH:mm:ss');
        const param = [
          {
            ...values,
            milestoneId: this.state.titleList.milestoneId,
            milestoneStartTime: values.beforeTime,
            bidMeetingUrl: values.bidMeetingUrl,
            milestoneCode: this.state.titleList.milestoneCode,
            proId: matchs.params.proId,
          },
        ];
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
          method: 'POST',
          body: param,
        }).then((res) => {
          if (res) {
            handleEdit();
          }
        });

        request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`, {
          method: 'POST',
          body: data,
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
            });
            this.setState({
              visibleCreate: false,
            });
          }
        });
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
        CusNotification.error({
          message: intl.get(`bid.bidcommon.view.message.tiangeshijian`).d('请填写时间'),
        });
      }
    });
  }
  @Bind()
  uploadData(file) {
    return {
      bucketName: 'bidding',
      tenantId: getCurrentOrganizationId(),
      fileName: file.name,
    };
  }

  @Debounce(300, { leading: true })
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
    let flag = true;
    let startFlag = true;
    let MeetingList = data.filter((item) => {
      if (item.supplierBidFileState === 'y') {
        return item;
      }
    });
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
      if (item.bidMeetingStartTime > item.bidMeetingEndTime) {
        startFlag = false;
      }
    });
    if (flag) {
      if (startFlag) {
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
          method: 'POST',
          body: data,
        }).then((res) => {
          if (res) {
            handleEdit();
          }
        });

        request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`, {
          method: 'POST',
          body: data,
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
            });
            this.setState({
              visibleCreate: false,
            });
          }
        });
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
        CusNotification.error({
          message: intl
            .get(`bid.bidcommon.view.title.xmsbhykssjdyjzsj`)
            .d('开始时间必须早于结束时间'),
        });
      }
    } else {
      CusNotification.error({
        message: intl.get(`bid.bidcommon.view.message.tiangeshijian`).d('请填写时间'),
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
    let flag = true;
    data.forEach((item) => {
      if (item.bidMeetingEndTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingEndTime = item.bidMeetingEndTime.format(DEFAULT_DATETIME_FORMAT);
      }
      if (item.bidMeetingStartTime) {
        // eslint-disable-next-line no-param-reassign
        item.bidMeetingStartTime = item.bidMeetingStartTime.format(DEFAULT_DATETIME_FORMAT);
      }
      if (e.loginName === item.loginName) {
        if (item.bidMeetingEndTime.valueOf() < item.bidMeetingStartTime.valueOf()) {
          flag = false;
        }
      }
    });
    if (flag) {
      request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`, {
        method: 'POST',
        body: data,
      }).then((res) => {
        if (res) {
          request(`${SRM_BID}/v1/${organizationId}/bid-milestones/sendSupplierEmailMeetingMsg`, {
            method: 'POST',
            body: [e],
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.succes1s').d('发送成功'),
              });
              this.addModalM(e);
            }
          });
        }
      });
    } else {
      CusNotification.error({
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
        CusNotification.success();
        this.setFileList(info.file);
      } else {
        CusNotification.error();
      }
    } else if (status === 'error') {
      CusNotification.error(response);
    }
    // this.fileListOk()
  }

  @Bind
  setFileList(value) {
    const newFile = this.props.contractMaintain.newFile + ',' + value.response;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        newFile: newFile,
      },
    });
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
          CusNotification.success();
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
      titleList: {},
      priceFileList: [],
      message: '',
    });
  }

  @Bind
  upLoadfileT(url) {
    this.props.getEndList[1].tfileUrls = url || '';
    request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
      method: 'POST',
      body: [this.props.getEndList[1]],
    }).then((res) => {
      if (res) {
        this.props.handleEdit();
      }
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        newFile: '',
      },
    });
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
  upLoadfileC(url) {
    this.props.getEndList[1].cfileUrls = url || '';
    request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
      method: 'POST',
      body: [this.props.getEndList[1]],
    }).then((res) => {
      if (res) {
        this.props.handleEdit();
      }
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        newFile: '',
      },
    });
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
    const param = this.props.getEndList[1];
    param.fileUrls = '';
    for (const i of this.state.showList) {
      param.fileUrls = param.fileUrls + ',' + i.fileUrl;
    }
    request(`${SRM_BID}/v1/${organizationId}/bid-milestones`, {
      method: 'POST',
      body: [param],
    }).then((res) => {
      if (res) {
        this.props.handleEdit();
      }
    });
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
    CusModal.confirm({
      content: intl.get('ssrc.quoController.view.message.confirm.open').d('确定开启吗?'),
      okType: 'normal',
      onOk: () => {
        const param = {
          milestoneId: value.milestoneId,
          milestoneCode: 'bid_metting',
          isNeedCloseCurrentMilestone: 'n',
        };
        request(`${SRM_BID}/v1/${organizationId}/bid-milestones/addNextRound`, {
          method: 'POST',
          body: param,
        }).then((res) => {
          if (res) {
            handleEdit();
          }
        });
        this.setState({
          visible: false,
          visible1: false,
          nameFlag: true,
          visibleCreate: false,
          messageVisible: false,
          priceFileList: [],
          message: '',
        });
      },
    });
  }

  @Bind
  deleteFile(key) {
    const { showList } = this.state;
    this.setState({
      showList: showList.filter((ite) => ite.fileUrl !== key.fileUrl),
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
  changeData() {}
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
    const { supplierTenantId, supplierCompanyCode, supplierCompanyName, supplierCurrencyCode } =
      record;
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
    const api = encodeURIComponent(
      `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`
    );
    const urlEncode = encodeURIComponent(record.fileUrl);
    const url = `${onlineApi}${api}${urlEncode}`;
    window.open(url);
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
  };

  // 开始评委评分
  @Bind()
  startSorce() {
    this.getStartSorceList();
    this.setState({
      startSorceFlag: true,
    });
  }

  @Bind
  getStartSorceList() {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getStartSorceList',
      payload: {
        proId: match.params.proId,
        all: 'YES',
      },
    });
  }

  @Bind()
  handleOkSorceStart() {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/saveStartSorceList',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res.message === 'ok') {
        CusNotification.success();
        this.setState({
          startSorceFlag: false,
        });
      } else {
        CusNotification.error({
          message: intl
            .get(`bid.bidcommon.view.title.Whenallthejudgesagreethescoringcanbestarted`)
            .d('当所有评委意见保持一致后方可开始评分'),
        });
      }
    });
  }

  @Bind()
  handleCancelSorceStart() {
    this.setState({
      startSorceFlag: false,
    });
  }

  // 保存建议中选供应商表格数据
  @Bind()
  handleSaveOnlyResult() {
    const { dispatch, contractMaintain, match } = this.props;
    const { suggestSupplierDataSource } = contractMaintain;
    const params = getEditTableData(suggestSupplierDataSource, ['isBeChosen', 'beSelectedMoney']);
    const templateCode = 'BPM_SCM_YBCGSS';
    const { CMHK_LOGIN, APPROVAL_PROCESS } = process.env;
    const urlEncode = encodeURIComponent(
      `${CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/sspo/WinningResult?proId=${match.params.proId}`
    );
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${urlEncode}`;
    if(params.length > 0) {
      dispatch({
        type: 'contractMaintain/saveOnlyResultUrl',
        payload: {
          bidSuppliers: params.map((item) => ({
            bidResult: item.isBeChosen,
            id: item.supplierId,
            beSelectedMoney: item.beSelectedMoney,
            proId: match.params.proId,
          })),
          url,
        },
      }).then((res) => {
        if(res) {
          this.setState({
            isSupplierModalVisable: false,
          });
        }
      })
    }
  }

  @Bind()
  handleBidCheckFile(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getBidCheckFile',
      payload: {
        proId: record.proId,
        milestoneId: record.milestoneId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = res?.datail?.content.map((item) => ({
          ...item,
          milestoneId: res?.milestoneId,
          _status: 'update',
          rowKey: uuidv4(),
        }))
        this.setState({
          showBidFileOpenModal: true,
        })
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            bidFileDataSource: newDataSource,
          }
        })
      }
    })
  }

  @Bind()
  handleUploadtechfileVisible(record) {
    this.setState({
      uploadtechfileVisible: true,
    }, () => {
      this.handleTechfileList(record);
    })
  }

  @Bind()
  getColumns() {
    const { getBidCheckFileLoading = false } = this.props;
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const { loginName } = getCurrentUser();
    const roundTitle = this.props.getDetailList?.isDelay === 'y' ? '2' : ''; // 判断是否延标，延标变成2，没有的话一直都是''    
    const column = [
      {
        title: intl.get('bid.biddashbord.model.title.status').d('状态'),
        key: 'orderSeq',
        width: getCurrentLanguage() === 'zh_CN' ? 75 : 205,
        dataIndex: 'orderSeq',
        render: (_, record) => {
          return <span>{record.state}</span>;
        },
      },
      {
        title: intl
          .get('bid.milestonecommon.view.title.milestonearrangementstage')
          .d('里程碑安排阶段'),
        dataIndex: 'milestoneName',
        key: 'stamilestoneNamete',
        width: getCurrentLanguage() === 'zh_CN' ? 300 : 350,
        render: (_, record) => {
          if ((record.round ? Number(record.round) : 0) > 1) {
            if (record.milestoneCode === 'technical_documents_final') {
              return tooltipRender(record.milestoneName);
            } else {
              return tooltipRender(record.milestoneName + intl.get('HKPC.commom.view.message.rounds', {
                rounds: record.round
              }).d(`第${record.round}轮`));
            }
          } else {
            if (record.milestoneCode === 'ten_clarification') {
              return (
                <Tooltip
                  title={
                    record.milestoneName +
                    ' ' +
                    intl
                      .get(`bid.bidcommon.view.title.tecclariremindexpert`)
                      .d('请设置评委，并告知评委提问')
                  }
                  placement="top"
                  overlayClassName="customize-tooltip"
                  color={'#646A73'}
                  trigger="hover"
                >
                  <span style={{ marginRight: '15px' }}>{record.milestoneName}</span>
                  {getCurrentLanguage() !== 'zh_CN' && <br></br>}
                  <span style={{ color: '#a19b9b', fontSize: '12px' }}>
                    {intl
                      .get(`bid.bidcommon.view.title.tecclariremindexpert`)
                      .d('请设置评委，并告知评委提问')}
                  </span>
                </Tooltip>
              );
            } else {
              return tooltipRender(record.milestoneName);
            }
          }
        },
      },
      {
        title: intl.get('bid.milestonecommon.view.title.deadline').d('本阶段截止时间') + `${roundTitle}`,
        dataIndex: 'milestoneEndTime',
        key: 'milestoneEndTime',
        width: getCurrentLanguage() === 'zh_CN' ? 500 : 200,
        render: (_, record) => {
          // console.log('bid_metting',record)
          // if (record.milestoneCode === 'bid_metting') {
          //   if (record.milestoneStartTime && record.milestoneEndTime) {
          //     return (
          //       tooltipRender(record.milestoneStartTime + ' ~ ' + record.milestoneEndTime)
          //     )
          //   }
          // } else {
          //   return (
          //     tooltipRender(record.milestoneEndTime)
          //   )
          // }

          // 评委阶段展示11.28上线，方案陈述会议也只展示截止时间
          return tooltipRender(record.milestoneEndTime);
        },
      },
    ];
    // 状态为进行中且当前登录人不为采购经办人及转办经办人 不显示操作栏
    if (
      this.props.getDetailList.proState === 'in_process' &&
      this.props.getDetailList.purchasingEmpNum !== loginName &&
      this.props.getDetailList.transferorEmpNum !== loginName
    ) {
      return column;
    } else {
      column.push({
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        dataIndex: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 548 : 1030,
        render: (_, record, index) => {
          const operators = [];
          if (
            record.milestoneCode == 'project_noice' ||
            record.milestoneCode == 'inquiry_noice' ||
            record.milestoneCode == 'negotiation_notice'
          ) {
            operators.push(
              true && {
                key: 'ViewAnnouncement',
                ele: (
                  <div style={{ marginRight: '16px' }}>
                    <CusButton type="plain">
                      <Link
                        to={`${isPub ? '/pub' : ''}/sspo/online-purchase/notices2/${record.proId}`}
                        target='_blank'
                      >
                        {intl.get('bid.bidcommon.bid.button.ViewAnnouncement').d('查看公告')}
                      </Link>
                    </CusButton>
                  </div>
                ),
              },
              !(['completed', 'closed'].includes(this.props.getDetailList.proState)) && {
                key: 'EditAnnouncement',
                ele: (
                  <div>
                    <CusButton type="plain" style={{ marginRight: '16px' }}>
                      <a
                        onClick={() => {
                          this.setState({
                            isNoticeEditTime: true,
                            noticeRecord: record,
                          });
                        }}
                      >
                        {intl.get('bid.bidcommon.bid.button.EditAnnouncement').d('编辑公告')}
                      </a>
                    </CusButton>
                  </div>
                ),
              }
            );
          } else if (record.milestoneCode == 'send_pad_res') {
            operators.push(
              !(record.milestoneState === 'to_be_carried_out') && {
                key: 'ViewDecisionInformation',
                ele: (
                  <div style={{ marginRight: '16px' }}>
                    <CusButton type="plain">
                      <Link
                        to={`${isPub ? '/pub' : ''}/sspo/meeting/query/${record.proId}/${
                          record.milestoneId
                        }`}
                        disabled={record.milestoneState === 'to_be_carried_out'}
                        target='_blank'
                      >
                        {intl
                          .get('bid.bidcommon.bid.button.ViewDecisionInformation')
                          .d('查看决策信息')}
                      </Link>
                    </CusButton>
                  </div>
                ),
              },
              !(
                record.milestoneState === 'to_be_carried_out' ||
                this.props.getDetailList.decisionInfoState === undefined
              ) && {
                key: 'LosingNotification',
                ele: (
                  // decisionInfoState 用于判断决策信息是否已提交
                  <div>
                    <CusButton type="plain" style={{ marginRight: '16px' }}>
                      <a
                        onClick={() => {
                          this.winningResultBpmClick(record);
                        }}
                        disabled={
                          record.milestoneState === 'to_be_carried_out' ||
                          this.props.getDetailList.decisionInfoState === undefined
                        }
                      >
                        {intl
                          .get('bid.bidcommon.bid.button.ViewWinning/LosingNotification')
                          .d('查看中选/落选通知')}
                      </a>
                    </CusButton>
                  </div>
                ),
              }
            );
          } else if (
            record.milestoneCode == 'invitation_letter' ||
            record.milestoneCode == 'inquiry_invitation_letter' ||
            record.milestoneCode == 'negotiation_invitation_letter'
          ) {
            operators.push(
              {
                key: 'Preview',
                ele: (
                  <div>
                    <CusButton type="plain" style={{ marginRight: '16px' }}>
                      <a
                        onClick={() => {
                          this.onlineModel();
                          this.setState({ newId: record.milestoneId, onlineShow: true });
                        }}
                      >
                        {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
                      </a>
                    </CusButton>
                  </div>
                ),
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
            );
          } else if (record.milestoneCode == 'total_price_review') {
            operators.push(
              record.milestoneState !== 'to_be_carried_out' && {
                key: 'PriceReviewSummary',
                ele: (
                  <div>
                    <CusButton type="plain" style={{ marginRight: '16px' }}>
                      <Link
                        to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${
                          record.milestoneId
                        }`}
                        target='_blank'
                        disabled={record.milestoneState === 'to_be_carried_out'}
                      >
                        {intl.get('bid.bidcommon.bid.title.PriceReviewSummary').d('价格评审汇总')}
                      </Link>
                    </CusButton>
                  </div>
                ),
              }
            );
          } else if (record.milestoneCode == 'price_file_total') {
            operators.push(
              record.milestoneState !== 'to_be_carried_out' && {
                key: 'ViewPriceScoringTable',
                ele: (
                  <div>
                    <CusButton type="plain" style={{ marginRight: '16px' }}>
                      <Link
                        to={`${isPub ? '/pub' : ''}/sspo/online-purchase/PriceScore/${
                          record.proId
                        }/${record.milestoneId}`}
                        disabled={record.milestoneState === 'to_be_carried_out'}
                        target='_blank'
                      >
                        {intl
                          .get('bid.bidcommon.bid.button.ViewPriceScoringTable')
                          .d('查看价格评分表')}
                      </Link>
                    </CusButton>
                  </div>
                ),
              },
              !(
                record.milestoneState === 'waitingForSummary' ||
                record.milestoneState === 'to_be_carried_out'
              ) && {
                key: 'SummaryOfTechnicalReview',
                ele: (
                  <div style={{ marginRight: '16px', display: 'inline-flex' }} className="cusTag">
                    <CusButton type="plain">
                      <Link
                        to={`${isPub ? '/pub' : ''}/sspo/online-purchase/ScoreListAll/${
                          record.proId
                        }/${record.milestoneId}`}
                        disabled={
                          record.milestoneState === 'waitingForSummary' ||
                          record.milestoneState === 'to_be_carried_out'
                        }
                        target='_blank'
                      >
                        {intl
                          .get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtable')
                          .d('查看综合评分表')}
                      </Link>
                    </CusButton>
                    {record.milestoneState === 'summerized' && (
                      <Tag style={{ margin: ' 0 0 0 4px ' }} className="ant-tag_wait">
                        <span>{intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}</span>
                      </Tag>
                    )}
                  </div>
                ),
              }
            );
          } else {
            if (
              record.milestoneCode == 'bidding_documents' ||
              record.milestoneCode == 'inquiry_files' ||
              record.milestoneCode == 'inquiry_invitation_letter' ||
              record.milestoneCode == 'talks_files'
            ) {
              operators.push(
                //  {
                //   key: 'view',
                //   ele: (
                //     <div style={{ marginRight: '16px' }}>
                //       <CusButton type="plain">
                //         <a
                //           onClick={this.showFile}
                //         //  showFile
                //         >
                //           {intl.get('bid.bidcommon.view.button.view').d('查看')}
                //         </a>
                //       </CusButton>
                //     </div>
                //   ),
                // },
                {
                  key: 'upload',
                  ele: (
                    <div style={{ marginRight: '16px', display: 'flex' }}>
                      {/* <CusButton type="plain"> */}
                      <div style={{marginRight: '16px'}}>
                        {/* <CusUploadFile
                          tableName="SPUC_PO_CON_ATTACH"
                          uploadName={intl.get('HKPC.commom.view.title.uploadtechfile').d('上传技术标书')}
                          readyName={intl.get('HKPC.commom.view.title.viewtechfile').d('查看技术标书')}
                          onUploadList={(item) => this.upLoadfileT(item)}
                          fileSource={
                            this.props.getEndList.length ? this.props.getEndList[1].tfileDTOList : []
                          }
                          disabled={['completed', 'closed'].includes(this.props.getDetailList.proState)}
                          //  parentId={this.props.match.params.proId}
                        /> */}
                        <CusButton type="plain" onClick={() => {
                          this.handleUploadtechfileVisible(record);
                        }}>
                        {
                          ['completed', 'closed'].includes(this.props.getDetailList.proState) ?
                          intl.get('HKPC.commom.view.title.viewtechfile').d('查看技术标书')
                          :
                          intl.get('HKPC.commom.view.title.uploadtechfile').d('上传技术标书')
                        }
                        </CusButton>
                      </div>
                      <CusUploadFile
                        tableName="SPUC_PO_CON_ATTACH"
                        uploadName={intl.get('HKPC.commom.view.title.uploadcommfile').d('上传商务标书')}
                        readyName={intl.get('HKPC.commom.view.title.viewcommfile').d('查看商务标书')}
                        onUploadList={(item) => this.upLoadfileC(item)}
                        fileSource={
                          this.props.getEndList.length ? this.props.getEndList[1].cfileDTOList : []
                        }
                        disabled={['completed', 'closed'].includes(this.props.getDetailList.proState)}
                        //  parentId={this.props.match.params.proId}
                      />
                    </div>
                  ),
                }
              );
            } else {
              // if (record.milestoneCode == 'purchase_result') {
              // tips1
              if (
                record.milestoneCode == 'purchase_result' &&
                record.milestoneState !== 'to_be_carried_out'
              ) {
                operators.push({
                  key: 'view1',
                  ele: (
                    <div style={{ marginRight: '16px' }}>
                      <CusButton type="plain">
                        <a
                          onClick={
                            record.milestoneState === 'to_be_carried_out' ? '' : this.showFileBox
                          }
                          style={
                            record.milestoneState === 'to_be_carried_out'
                              ? { color: 'rgba(0,0,0,0.25)' }
                              : {}
                          }
                        >
                          {intl.get('bid.bidcommon.view.button.view').d('查看')}
                        </a>
                      </CusButton>
                    </div>
                  ),
                });
              } else {
                if (
                  record.milestoneCode != 'bid_metting' &&
                  record.milestoneCode != 'total_ten_score' &&
                  record.milestoneCode != 'total_technical_review'
                ) {
                  if (record.milestoneCode == 'price_file_upload') {
                    let flag = true;
                    if (record.milestoneState !== 'to_be_carried_out') {
                      if (
                        ['single_source', 'internal_source'].includes(
                          this.props.getDetailList.purchaseType
                        )
                      ) {
                        flag = false;
                      } else {
                        if (
                          record.milestoneState === 'completed' ||
                          record.milestoneState === 'exceedTheDeadline'
                        ) {
                          flag = false;
                        }
                      }
                    }
                    operators.push(
                      !flag && (this.props.getDetailList?.isOpen === 'y' || !['public_bidding', 'invited_bidding'].includes(this.props.getDetailList?.purchaseType)) && {
                        key: 'getinto',
                        ele: (
                          <div
                            className="cusTag"
                            style={{ display: 'inline-flex', marginRight: '16px' }}
                          >
                            <CusButton type="plain">
                              <Link
                                to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${
                                  record.milestoneId
                                }`}
                                disabled={flag}
                                target='_blank'
                              >
                                {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                              </Link>
                            </CusButton>
                            {record.milestoneState === 'exceedTheDeadline' && (
                              <Tag style={{ margin: ' 0 0 0 4px ' }} className="ant-tag_wait">
                                <span>
                                  {intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}
                                </span>
                              </Tag>
                            )}
                          </div>
                        ),
                      },
                      
                      !flag && ['public_bidding', 'invited_bidding'].includes(this.props.getDetailList?.purchaseType) && (this.props.getDetailList?.isOpen === 'n' || !(this.props.getDetailList?.isOpen)) && {
                        key: 'getinto2',
                        ele: (
                          <div
                            className="cusTag"
                            style={{ display: 'inline-flex', marginRight: '16px' }}
                          >
                            <CusButton type="plain" onClick={() => this.handleBidOpenVisible(record)}>
                              {intl.get('HKPC.commom.view.title.openoftender').d('开标')}
                            </CusButton>
                          </div>
                        ),
                      }
                    );
                  } else {
                    if (record.milestoneCode == 'ten_clarification') {
                      operators.push(
                        record.milestoneState !== 'to_be_carried_out' && {
                          key: 'getinto',
                          ele: (
                            <div
                              className="cusTag"
                              style={{ display: 'inline-flex', marginRight: '16px' }}
                            >
                              <CusButton type="plain">
                                <Link
                                  to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${
                                    record.milestoneId
                                  }`}
                                  disabled={record.milestoneState === 'to_be_carried_out'}
                                  target='_blank'
                                >
                                  {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                                </Link>
                              </CusButton>
                              {record.milestoneState === 'completed' &&
                                record.isAllTransToJudge === 'n' && (
                                  <Tag style={{ margin: ' 0 0 0 4px ' }} className="ant-tag_wait">
                                    <span>
                                      {intl
                                        .get('bid.bidcommon.view.title.getintosubscript')
                                        .d('待')}
                                    </span>
                                  </Tag>
                                )}
                            </div>
                          ),
                        }
                      );
                    } else if(record.milestoneCode == 'technical_documents') {
                      operators.push(
                        record.milestoneState !== 'to_be_carried_out' && (!['public_bidding', 'invited_bidding'].includes(this.props.getDetailList?.purchaseType) || this.props.getDetailList?.isOpen === 'y') && {
                          key: 'getinto',
                          ele: (
                            <div>
                              <CusButton type="plain" style={{ marginRight: '16px' }}>
                                <Link
                                  to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${
                                    record.milestoneId
                                  }`}
                                  disabled={record.milestoneState === 'to_be_carried_out'}
                                  target='_blank'
                                >
                                  {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                                </Link>
                              </CusButton>
                            </div>
                          ),
                        },
                        record.milestoneState === 'in_process' && (!['public_bidding', 'invited_bidding'].includes(this.props.getDetailList?.purchaseType) || this.props.getDetailList?.isOpen === 'y') && {
                          key: 'getinto',
                          ele: (
                            <div>
                              <CusButton
                                type="plain"
                                style={{ marginRight: '16px' }}
                                onClick={() => {
                                  this.handleBidCheckFile(record);
                                }}
                                loading={getBidCheckFileLoading}
                              >
                                {intl.get('HKPC.commom.view.title.checkfiles').d('检查文件')}
                              </CusButton>
                            </div>
                          ),
                        },
                        record.milestoneState === 'completed' && (['public_bidding', 'invited_bidding'].includes(this.props.getDetailList?.purchaseType) && this.props.getDetailList?.isOpen !== 'y') && {
                          key: 'getinto',
                          ele: (
                            <div>
                              <CusButton
                                type="plain"
                                style={{ marginRight: '16px' }}
                                onClick={() => {
                                  this.handleBidCheckFile(record);
                                }}
                                loading={getBidCheckFileLoading}
                              >
                                {intl.get('HKPC.commom.view.title.checkfiles').d('检查文件')}
                              </CusButton>
                            </div>
                          ),
                        }
                      );
                    } else {
                      operators.push(
                        record.milestoneState !== 'to_be_carried_out' && {
                          key: 'getinto',
                          ele: (
                            <div>
                              <CusButton type="plain" style={{ marginRight: '16px' }}>
                                <Link
                                  to={`${isPub ? '/pub' : ''}${record.linkUrl}/${record.proId}/${
                                    record.milestoneId
                                  }`}
                                  disabled={record.milestoneState === 'to_be_carried_out'}
                                  target='_blank'
                                >
                                  {intl.get('bid.bidcommon.view.button.getinto').d('进入')}
                                </Link>
                              </CusButton>
                            </div>
                          ),
                        }
                      );
                    }
                  }
                }
              }
              if (
                record.milestoneCode == 'total_ten_score' &&
                record.milestoneState !== 'to_be_carried_out'
              ) {
                // if (record.milestoneCode == 'total_ten_score') {
                // tips1
                operators.push(
                  {
                    key: 'Viewjudgesscores',
                    ele: (
                      <div style={{ marginRight: '16px' }}>
                        <CusButton type="plain">
                          <a
                            onClick={
                              record.milestoneState === 'to_be_carried_out' ? '' : this.openList
                            }
                            style={
                              record.milestoneState === 'to_be_carried_out'
                                ? { color: 'rgba(0,0,0,0.25)' }
                                : {}
                            }
                          >
                            {intl
                              .get('bid.bidcommon.bid.button.Viewjudgesscores')
                              .d('查看评委评分')}
                          </a>
                        </CusButton>
                      </div>
                    ),
                  },
                  !(
                    record.milestoneState === 'to_be_carried_out' ||
                    record.milestoneState === 'waitingForSummary'
                  ) && {
                    key: 'Viewthecomprehensivescoringtabletech',
                    ele: (
                      <div style={{ marginRight: '16px' }}>
                        <CusButton type="plain">
                          <Link
                            to={`${isPub ? '/pub' : ''}/sspo/online-purchase/technicalMerit/${
                              record.proId
                            }/${record.milestoneId}/${
                              record.milestoneState === 'in_conform' ? 'look' : 'edit'
                            }`}
                            disabled={
                              record.milestoneState === 'to_be_carried_out' ||
                              record.milestoneState === 'waitingForSummary'
                            }
                            target='_blank'
                          >
                            {intl
                              .get('bid.bidcommon.bid.button.Viewthecomprehensivescoringtabletech')
                              .d('查看技术分汇总')}
                          </Link>
                        </CusButton>
                      </div>
                    ),
                  }
                );
              }
              if (
                record.milestoneCode == 'total_technical_review' &&
                record.milestoneState !== 'to_be_carried_out'
              ) {
                // if (record.milestoneCode == 'total_technical_review') {
                // tips1
                operators.push(
                  {
                    key: 'Viewjudgesscores',
                    ele: (
                      <div style={{ marginRight: '16px' }}>
                        <CusButton type="plain">
                          <a
                            onClick={
                              record.milestoneState === 'to_be_carried_out' ? '' : this.openList
                            }
                            style={
                              record.milestoneState === 'to_be_carried_out'
                                ? { color: 'rgba(0,0,0,0.25)' }
                                : {}
                            }
                          >
                            {intl
                              .get('bid.bidcommon.view.title.Viewexpertreview')
                              .d('查看评委评审')}
                          </a>
                        </CusButton>
                      </div>
                    ),
                  },
                  !(
                    record.milestoneState === 'to_be_carried_out' ||
                    record.milestoneState === 'waitingForSummary'
                  ) && {
                    key: 'SummaryOfTechnicalReview',
                    ele: (
                      <div
                        style={{ marginRight: '16px', display: 'inline-flex' }}
                        className="cusTag"
                      >
                        <CusButton type="plain">
                          <Link
                            to={`${isPub ? '/pub' : ''}/sspo/online-purchase/technicalMerit/${
                              record.proId
                            }/${record.milestoneId}/${
                              record.milestoneState === 'in_conform' ? 'look' : 'edit'
                            }`}
                            disabled={
                              record.milestoneState === 'to_be_carried_out' ||
                              record.milestoneState === 'waitingForSummary'
                            }
                            target='_blank'
                          >
                            {intl
                              .get('bid.bidcommon.view.title.viewtechnicalreviewsummarysheet')
                              .d('查看技术评审汇总表')}
                          </Link>
                        </CusButton>
                        {record.milestoneState === 'summerized' && (
                          <Tag style={{ margin: '0 0 0 4px' }} className="ant-tag_wait">
                            <span>
                              {intl.get('bid.bidcommon.view.title.getintosubscript').d('待')}
                            </span>
                          </Tag>
                        )}
                      </div>
                    ),
                  }
                );
              }

              if (
                record.milestoneCode == 'price_clarification' ||
                record.milestoneCode == 'ten_clarification' ||
                record.milestoneCode == 'price_file_upload'
              ) {
                if (record.milestoneState != 'completed') {
                  // console.log('123')
                  if (record.milestoneCode == 'price_clarification') {
                    // // tips1
                    if (
                      this.props.getEndList[index - 1].milestoneState === 'completed' ||
                      this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' ||
                      this.props.getEndList[index - 1].milestoneState === 'affirmed' ||
                      this.props.getEndList[index - 1].milestoneState === 'in_process'
                    ) {
                      !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                        operators.push({
                          key: 'EditTime1',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'completed' ||
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'exceedTheDeadline' ||
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'affirmed' ||
                                    this.props.getEndList[index - 1].milestoneState === 'in_process'
                                      ? this.showModal(
                                          record,
                                          record.milestoneState != 'completed',
                                          index
                                        )
                                      : '';
                                  }}
                                  style={
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'completed' ||
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'exceedTheDeadline' ||
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'affirmed' ||
                                    this.props.getEndList[index - 1].milestoneState === 'in_process'
                                      ? {}
                                      : { color: 'rgba(0,0,0,0.25)' }
                                  }
                                >
                                  {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                    }
                  }
                  if (record.milestoneCode == 'price_file_upload') {
                    // 除公开招标邀请招标外,报价文件是已完成或已截止时不显示编辑时间
                    if (
                      record.milestoneState !== 'completed' &&
                      record.milestoneState !== 'exceedTheDeadline'
                    ) {
                      // if (record.round == 1 && this.props.getDetailList.purchaseType == 'single_source') {
                      if (record.round == 1) {
                        !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                          operators.push({
                            key: 'EditTime1',
                            ele: (
                              <div style={{ marginRight: '16px' }}>
                                <CusButton type="plain">
                                  <a
                                    onClick={() => {
                                      this.showModal(
                                        record,
                                        record.milestoneState != 'completed',
                                        index
                                      );
                                    }}
                                  >
                                    {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                                  </a>
                                </CusButton>
                              </div>
                            ),
                          });
                      } else {
                        if (
                          this.props.getEndList[index - 1].milestoneState === 'completed' ||
                          this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' ||
                          this.props.getEndList[index - 1].milestoneState === 'affirmed'
                        ) {
                          !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                            operators.push({
                              key: 'EditTime1',
                              ele: (
                                <div style={{ marginRight: '16px' }}>
                                  <CusButton type="plain">
                                    <a
                                      onClick={() => {
                                        this.showModal(
                                          record,
                                          record.milestoneState != 'completed',
                                          index
                                        );
                                      }}
                                    >
                                      {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                                    </a>
                                  </CusButton>
                                </div>
                              ),
                            });
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
                    // tips
                    if (
                      this.props.getEndList[index - 1].milestoneState === 'completed' ||
                      this.props.getEndList[index - 1].milestoneState === 'exceedTheDeadline' ||
                      this.props.getEndList[index - 1].milestoneState === 'affirmed'
                    ) {
                      !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                        operators.push({
                          key: 'EditTime1',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'completed' ||
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'exceedTheDeadline' ||
                                    this.props.getEndList[index - 1].milestoneState === 'affirmed'
                                      ? this.showModal(
                                          record,
                                          record.milestoneState != 'completed',
                                          index
                                        )
                                      : '';
                                  }}
                                  style={
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'completed' ||
                                    this.props.getEndList[index - 1].milestoneState ===
                                      'exceedTheDeadline' ||
                                    this.props.getEndList[index - 1].milestoneState === 'affirmed'
                                      ? {}
                                      : { color: 'rgba(0,0,0,0.25)' }
                                  }
                                >
                                  {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                    }
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
                if (
                  record.milestoneCode != 'bid_metting' &&
                  record.milestoneCode != 'total_ten_score' &&
                  record.milestoneCode != 'project_qa'
                ) {
                  if (
                    record.milestoneCode === 'price_file_upload' ||
                    record.milestoneCode === 'price_clarification'
                  ) {
                    if (record.milestoneCode === 'price_clarification') {
                      let roundsFlag = false;
                      let finishFlag = true;
                      let counts = 0;
                      let showFlag = true;
                      if (this.props.getEndList[index + 1].milestoneCode == 'bid_metting') {
                        if (this.props.getEndList[index + 2].milestoneCode == 'price_file_upload') {
                          showFlag = false;
                        }
                      } else {
                        if (this.props.getEndList[index + 1].milestoneCode == 'price_file_upload') {
                          showFlag = false;
                        }
                      }
                      for (const item of this.props.getEndList) {
                        if (item.milestoneCode == 'price_clarification') {
                          counts++;
                          // break
                        }
                        if (
                          item.milestoneCode == 'price_file_total' ||
                          item.milestoneCode == 'total_price_review'
                        ) {
                          if (item.milestoneState == 'affirmed') {
                            finishFlag = false;
                          }
                          // break
                        }
                      }
                      if (record.round == counts) {
                        roundsFlag = true;
                      }
                      // console.log('12',counts,finishFlag,roundsFlag,record.milestoneCode)

                      if (
                        roundsFlag &&
                        finishFlag &&
                        showFlag &&
                        record.milestoneState === 'completed'
                      ) {
                        // if (roundsFlag && finishFlag && showFlag) {
                        // tips1
                        operators.push({
                          key: 'AddNextRound1',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    record.milestoneState !== 'completed'
                                      ? ''
                                      : this.addModal(
                                          record,
                                          record.milestoneState == 'in_process',
                                          index
                                        );
                                  }}
                                  style={
                                    record.milestoneState !== 'completed'
                                      ? { color: 'rgba(0,0,0,0.25)' }
                                      : {}
                                  }
                                >
                                  {intl
                                    .get('bid.bidcommon.bid.button.AddNextRound')
                                    .d('添加下一轮')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                      }
                    } else {
                      let roundsFlag = false;
                      let finishFlag = true;
                      let counts = 0;
                      for (const item of this.props.getEndList) {
                        if (item.milestoneCode == 'price_file_upload') {
                          counts++;
                          // break
                        }
                        if (
                          item.milestoneCode == 'price_file_total' ||
                          item.milestoneCode == 'total_price_review'
                        ) {
                          if (item.milestoneState == 'affirmed') {
                            finishFlag = false;
                          }
                          // break
                        }
                      }
                      if (record.round == counts) {
                        roundsFlag = true;
                      }
                      // console.log('12',counts,finishFlag,roundsFlag,record.milestoneCode)

                      if (roundsFlag && finishFlag && record.milestoneState === 'completed') {
                        // if (roundsFlag && finishFlag) {
                        // tips1
                        operators.push({
                          key: 'AddNextRound1',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    record.milestoneState !== 'completed'
                                      ? ''
                                      : this.addModal(
                                          record,
                                          record.milestoneState == 'in_process',
                                          index
                                        );
                                  }}
                                  style={
                                    record.milestoneState !== 'completed'
                                      ? { color: 'rgba(0,0,0,0.25)' }
                                      : {}
                                  }
                                >
                                  {intl
                                    .get('bid.bidcommon.bid.button.AddNextRound')
                                    .d('添加下一轮')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                      }
                    }
                  }
                }
                if (record.milestoneCode == 'ten_clarification') {
                  let roundsFlag = false;
                  let finishFlag = false;
                  let lastRoundFlag = true;
                  let counts = 0;
                  for (const item of this.props.getEndList) {
                    if (item.milestoneCode == 'ten_clarification') {
                      counts++;
                      // breaks
                    }
                    if (item.milestoneCode == 'technical_documents_final') {
                      lastRoundFlag = false;
                    }
                    if (this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out') {
                      finishFlag = true;
                      // break
                    }
                  }
                  if (record.round == counts) {
                    roundsFlag = true;
                  }
                  // console.log('ten_clarification12',counts,finishFlag,roundsFlag,record.milestoneCode)
                  if (
                    record.round == 1 &&
                    record.milestoneState == 'completed' &&
                    record.remarks !== 'y'
                  ) {
                    // 循环定位到最新轮次的技术、商务澄清，根据最新轮的状态判断答疑完结是否可以点击
                    let newList = this.props.getEndList;
                    let lastTenClarification = null;
                    if (newList) {
                      for (let i = newList.length - 1; i >= 0; i--) {
                        if (newList[i].milestoneCode === 'ten_clarification') {
                          lastTenClarification = newList[i];
                          break;
                        }
                      }
                    }
                    if (
                      lastTenClarification.milestoneCode &&
                      lastTenClarification.milestoneState === 'completed'
                    ) {
                      operators.push({
                        key: 'completionQA',
                        ele: (
                          <div style={{ marginRight: '16px' }}>
                            <CusButton type="plain">
                              <a
                                onClick={() => {
                                  lastTenClarification.milestoneState === 'completed'
                                    ? this.showQAModal(record)
                                    : '';
                                }}
                                style={
                                  lastTenClarification.milestoneState === 'completed'
                                    ? {}
                                    : { color: 'rgba(0,0,0,0.25)' }
                                }
                              >
                                {intl.get('bid.bidcommon.view.title.completeqa').d('答疑完结')}
                              </a>
                            </CusButton>
                          </div>
                        ),
                      });
                    }
                  }

                  // 除公开询价和邀请询价外，其余采购方式才显示初步评审汇总
                  if(!(['public_inquiry', 'invitation_inquiry'].includes(this.props.getDetailList.purchaseType))) {
                    if (
                      record.round == 1 &&
                      this.props.getDetailList.purchaseType != 'single_source' &&
                      this.props.getDetailList.purchaseType != 'internal_source'
                    ) {
                      if (record.milestoneState !== 'to_be_carried_out') {
                        operators.push({
                          key: 'new',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    record.milestoneState === 'to_be_carried_out'
                                      ? ''
                                      : this.startSorce();
                                  }}
                                  style={
                                    record.milestoneState === 'to_be_carried_out'
                                      ? { color: 'rgba(0,0,0,0.25)' }
                                      : {}
                                  }
                                >
                                  {intl
                                    .get('bid.bidcommon.view.title.Technicalcompliancereviewbutton')
                                    .d('初步评审汇总')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                      }
                    }
                  }

                  if (roundsFlag && finishFlag & lastRoundFlag) {
                    if (record.remarks !== 'y') {
                      // tips1
                      if (record.milestoneState === 'completed') {
                        operators.push({
                          key: 'AddNextRound1',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    record.milestoneState !== 'completed'
                                      ? ''
                                      : this.addModal(
                                          record,
                                          record.milestoneState == 'in_process',
                                          index
                                        );
                                  }}
                                  style={
                                    record.milestoneState !== 'completed'
                                      ? { color: 'rgba(0,0,0,0.25)' }
                                      : {}
                                  }
                                >
                                  {intl
                                    .get('bid.bidcommon.bid.button.AddNextRound')
                                    .d('添加下一轮')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                      }
                    }
                    if (
                      this.props.getEndList[index].milestoneState == 'completed' &&
                      this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out'
                    ) {
                      //tips1
                      if (record.milestoneState !== 'to_be_carried_out') {
                        operators.push({
                          key: 'submittechnicaldocuments',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    this.addModalL(record, record.milestoneState == 'in_process');
                                  }}
                                  style={
                                    record.milestoneState === 'to_be_carried_out'
                                      ? { color: 'rgba(0,0,0,0.25)' }
                                      : {}
                                  }
                                >
                                  {intl
                                    .get(
                                      'bid.bidcommon.bid.button.SubmissionOfTechnicalAndCommercialDocumentsfinalround'
                                    )
                                    .d('技术及商务文件递交(最终轮)')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                      }
                    }
                  }
                }
                if (record.milestoneCode == 'price_file_upload') {
                  // if (this.props.getDetailList.purchaseType != 'public_bidding' && this.props.getDetailList.purchaseType != 'invited_bidding') {
                  let showFlag = true;
                  if (this.props.getEndList[index + 1].milestoneCode == 'bid_metting') {
                    if (
                      this.props.getEndList[index + 2].milestoneState !== 'to_be_carried_out' ||
                      this.props.getEndList[index + 2].milestoneCode == 'price_clarification'
                    ) {
                      showFlag = false;
                    }
                  } else {
                    if (
                      this.props.getEndList[index + 1].milestoneState !== 'to_be_carried_out' ||
                      this.props.getEndList[index + 1].milestoneCode == 'price_clarification'
                    ) {
                      showFlag = false;
                    }
                  }

                  if (showFlag) {
                    let disableFlag = false;
                    if (
                      record.milestoneState === 'to_be_carried_out' ||
                      record.milestoneState === 'completed'
                    ) {
                      disableFlag = true;
                    }
                    if (
                      this.props.getDetailList.purchaseType != 'single_source' &&
                      this.props.getDetailList.purchaseType != 'internal_source' &&
                      record.milestoneState === 'in_process'
                    ) {
                      disableFlag = true;
                    }
                    // tips1
                    if (!disableFlag) {
                      operators.push({
                        key: 'priceclarification',
                        ele: (
                          <div style={{ marginRight: '16px' }}>
                            <CusButton type="plain">
                              <a
                                onClick={() => {
                                  disableFlag ? '' : this.addModalP(record);
                                }}
                                style={disableFlag ? { color: 'rgba(0,0,0,0.25)' } : {}}
                              >
                                {intl
                                  .get('bid.milestonecommon.view.title.priceclarification')
                                  .d('价格澄清')}
                              </a>
                            </CusButton>
                          </div>
                        ),
                      });
                    }
                  }

                  itemFlag = true;
                  for (const item of this.props.getEndList) {
                    if (item.milestoneCode == 'bid_metting') {
                      itemFlag = false;
                      break;
                    }
                  }
                  let counts = 0;
                  for (const item of this.props.getEndList) {
                    if (item.milestoneCode == 'price_file_upload') {
                      counts++;
                      // break
                    }
                  }
                  if (itemFlag == true && counts == record.round) {
                    // tips1
                    if (record.milestoneState !== 'to_be_carried_out') {
                      !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                        operators.push({
                          key: 'phasename',
                          ele: (
                            <div style={{ marginRight: '16px' }}>
                              <CusButton type="plain">
                                <a
                                  onClick={() => {
                                    record.milestoneState !== 'to_be_carried_out' &&
                                      this.handleCreate(
                                        record,
                                        record.milestoneState == 'in_process'
                                      );
                                  }}
                                  style={
                                    record.milestoneState === 'to_be_carried_out'
                                      ? { color: 'rgba(0,0,0,0.25)' }
                                      : {}
                                  }
                                >
                                  {intl
                                    .get(
                                      'bid.milestonecommon.view.title.projectbidpresentationmeeting'
                                    )
                                    .d('方案陈述会议')}
                                </a>
                              </CusButton>
                            </div>
                          ),
                        });
                    }
                  }
                  // }
                }
                if (record.milestoneCode == 'bid_metting') {
                  if (
                    this.props.getDetailList.purchaseType != 'public_bidding' &&
                    this.props.getDetailList.purchaseType != 'invited_bidding'
                  ) {
                    if (record.milestoneState === 'to_be_carried_out') {
                      operators.push({
                        key: 'delete1',
                        ele: (
                          <div style={{ marginRight: '16px' }}>
                            <CusButton type="plain">
                              <a
                                onClick={() => {
                                  record.milestoneState !== 'to_be_carried_out'
                                    ? ''
                                    : this.delete(record);
                                }}
                                style={
                                  record.milestoneState !== 'to_be_carried_out'
                                    ? { color: 'rgba(0,0,0,0.25)' }
                                    : {}
                                }
                              >
                                {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                              </a>
                            </CusButton>
                          </div>
                        ),
                      });
                    }
                  }
                }
              }
              if (record.milestoneCode == 'bid_metting') {
                !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                  operators.push({
                    key: 'EditTime',
                    ele: (
                      <div style={{ marginRight: '16px' }}>
                        <CusButton type="plain">
                          <a
                            onClick={() => {
                              record.milestoneCode == 'bid_metting'
                                ? this.addModalM(record, index)
                                : this.showModal(
                                    record,
                                    record.milestoneState != 'completed',
                                    index
                                  );
                            }}
                          >
                            {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                          </a>
                        </CusButton>
                      </div>
                    ),
                  });
              }
              let showTimeFlag = true;
              if (record.milestoneCode == 'project_qa') {
                !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                  operators.push({
                    key: 'EditTime',
                    ele: (
                      <div style={{ marginRight: '16px' }}>
                        <CusButton type="plain">
                          <a
                            onClick={() => {
                              record.milestoneCode == 'bid_metting'
                                ? this.addModalM(record, index)
                                : this.showModal(
                                    record,
                                    record.milestoneState != 'completed',
                                    index
                                  );
                            }}
                          >
                            {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                          </a>
                        </CusButton>
                      </div>
                    ),
                  });
                // }
              }
              if (record.milestoneCode == 'technical_documents_final') {
                if (record.milestoneState !== 'completed') {
                  if (
                    record.milestoneState !== 'completed' &&
                    this.props.getEndList[index - 1].milestoneState === 'completed'
                  ) {
                    !(['completed', 'closed'].includes(this.props.getDetailList.proState)) &&
                      operators.push({
                        key: 'EditTime',
                        ele: (
                          <div style={{ marginRight: '16px' }}>
                            <CusButton type="plain">
                              <a
                                onClick={() => {
                                  record.milestoneState !== 'completed' &&
                                  this.props.getEndList[index - 1].milestoneState === 'completed'
                                    ? this.showModal(
                                        record,
                                        record.milestoneState != 'completed',
                                        index
                                      )
                                    : '';
                                }}
                                style={
                                  record.milestoneState !== 'completed' &&
                                  this.props.getEndList[index - 1].milestoneState === 'completed'
                                    ? {}
                                    : { color: 'rgba(0,0,0,0.25)' }
                                }
                              >
                                {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                              </a>
                            </CusButton>
                          </div>
                        ),
                      });
                  }
                }
              }
              if (record.milestoneCode == 'technical_documents') {
                let countNew = 0;
                let newFlag = false;
                let noAddFlag = true;
                let startNext = false;
                for (const item of this.props.getEndList) {
                  if (item.milestoneCode == 'technical_documents') {
                    countNew++;
                    // break
                  }
                  if (item.milestoneCode == 'technical_documents_final') {
                    noAddFlag = false;
                  }
                }
                if (record.round == countNew || !record.round) {
                  newFlag = true;
                }
                if (this.props.getEndList[index + 1].milestoneState == 'to_be_carried_out') {
                  startNext = true;
                }
                if (
                  this.props.getEndList[index + 1].milestoneCode === 'price_file_upload' &&
                  this.props.getDetailList.purchaseType != 'public_bidding' &&
                  this.props.getDetailList.purchaseType != 'invited_bidding'
                ) {
                  startNext = true;
                }
                if (newFlag && showTimeFlag) {
                  operators.push(
                    !(['completed', 'closed'].includes(this.props.getDetailList.proState)) && {
                      key: 'EditTime',
                      ele: (
                        <div style={{ marginRight: '16px' }}>
                          <CusButton type="plain">
                            <a
                              onClick={() => {
                                record.milestoneCode == 'bid_metting'
                                  ? this.addModalM(record, index)
                                  : this.showModal(
                                      record,
                                      record.milestoneState != 'completed',
                                      index
                                    );
                              }}
                            >
                              {intl.get('bid.bidcommon.bid.button.EditTime').d('编辑时间')}
                            </a>
                          </CusButton>
                        </div>
                      ),
                    }
                  );
                  // showNextRound=false: 技术商务澄清最后一轮已完成=不显示添加下一轮
                  if (
                    record.milestoneState == 'completed' &&
                    startNext &&
                    noAddFlag &&
                    record.showNextRound
                  ) {
                    //tips1
                    if (record.milestoneState !== 'to_be_carried_out') {
                      operators.push({
                        key: 'AddNextRound',
                        ele: (
                          <div style={{ marginRight: '16px' }}>
                            <CusButton type="plain">
                              <a
                                onClick={() => {
                                  this.addModal(
                                    record,
                                    record.milestoneState == 'in_process',
                                    index
                                  );
                                }}
                                style={
                                  record.milestoneState === 'to_be_carried_out'
                                    ? { color: 'rgba(0,0,0,0.25)' }
                                    : {}
                                }
                              >
                                {intl.get('bid.bidcommon.bid.button.AddNextRound').d('添加下一轮')}
                              </a>
                            </CusButton>
                          </div>
                        ),
                      });
                    }
                  }
                }
              }
            }
          }
          return operatorRender(operators, record, { limit: 5 });
        },
      });
      return column;
    }
  }

  @Bind()
  handleBidOpenVisible(record) {
    console.log(record, 'record');
    
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getSupplierBidOpenList',
      payload: {
        proId: record.proId,
      }
    }).then((res) => {
      if(res) {
        const supplierList = res;

        if(supplierList.length >= 3 || this.props.getDetailList?.isDelay === 'y') {
          // 供应商数量大于3个走开标流程
          this.setState({
            bidOpenVisible: true
          });
        } else {
          // 供应商数量小于3个走流标
          this.setState({
            bidFailedVisible: true,
            failedSupplierList: supplierList,
          });
        }
      }
    })
  }

  // 开标
  @Bind()
  handleOpenBid() {
    const { dispatch, match, reChange = (e) => e } = this.props;
    dispatch({
      type: 'contractMaintain/saveOpenBid',
      payload: {
        proId: match.params.proId,
        isOpen: 'y',
      }
    }).then((res) => {
      if(res) {
        // 调用查询基本信息接口
        reChange();
        this.setState({
          bidOpenVisible: false,
        })
      }
    })
  }

  // 流标
  @Bind()
  handleFailedBid() {
    const { dispatch, match, reChange = (e) => e } = this.props;
    dispatch({
      type: 'contractMaintain/saveFailedBid',
      payload: {
        proId: match.params.proId,
      }
    }).then((res) => {
      if(res) {
        // 调用查询基本信息接口
        reChange();
        this.setState({
          bidFailedVisible: false,
        })
      }
    })
  }

  @Bind()
  handleTechfileList(record) {
    const { dispatch } = this.props;
    
    const initList = [
      {
        typeMeaning: intl.get('HKPC.commom.view.title.CoveringLetter').d('说明书'),
        type: 'CoveringLetter',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.ExecutiveSum').d('经营综合报告'),
        type: 'ExecutiveSum',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.ProjectProposal').d('项目提案'),
        type: 'ProjectProposal',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.TendererQualifications').d('投标资格说明书'),
        type: 'TendererQualifications',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.ConfidentAgree').d('保密条款'),
        type: 'ConfidentAgree',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.TechnicalDoc').d('技术文件'),
        type: 'TechnicalDoc',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.AcknowledgementLetter').d('工程量清单'),
        type: 'AcknowledgementLetter',
      },
      {
        typeMeaning: intl.get('HKPC.commom.view.title.Others').d('其他'),
        type: 'Others',
      },
    ]
    dispatch({
      type: 'contractMaintain/getTechfileList',
      payload: {
        proId: record.proId,
        milestoneId: record.milestoneId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = (res.length > 0 ? res : initList)?.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
          proId: record.proId,
          milestoneId: record.milestoneId,
        }));
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            techfileList: newDataSource,
          }
        })
      }
    })
  }

  @Bind()
  saveUploadTechFile() {
    const { dispatch, contractMaintain } = this.props;
    const { techfileList } = contractMaintain;
    const validateData = getEditTableData(techfileList, ['rowKey']) || [];
    console.log('validateData', validateData);
    dispatch({
      type: 'contractMaintain/saveTechfileList',
      payload: validateData
    }).then((res) => {
      if(res) {
        this.setState({
          uploadtechfileVisible: false,
        })
      }
    })
  }

  render() {
    const {
      selectedRowKeys,
      visible,
      titleList,
      visible1,
      visibleCreate,
      showFlag,
      openFlag,
      showList,
      onlineShow,
      nameFlag,
      judgesSorceModel,
      startSorceFlag,
      isNoticeEditTime,
      noticeRecord,
      isSupplierModalVisable,
      isSelectSup,
      bidOpenVisible,
      bidFailedVisible,
      failedSupplierList,
      showBidFileOpenModal = false,
      uploadtechfileVisible = false,
    } = this.state;
    const {
      form,
      match,
      detailEnumMap,
      customizeForm,
      getEndList,
      organizationId,
      fetchSourceList,
      contractMaintain,
      pagination = false,
      supplierMeetingLoading = false,
      fetchResultListLoading = false,
      completionQALoading = false,
      saveOnlyResultUrlLoading = false,
      dispatch,
      saveTechfileListLoading = false,
    } = this.props;

    console.log('getEndList', getEndList);
    console.log('this.props.getDetailList', this.props.getDetailList);
    
    const { showPass = [], yesNoAlternate = [], yesNo = [], portalAttachlist = [] } = detailEnumMap;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const columns = this.getColumns();
    newDataList = [];
    const {
      supplierSource = [],
      resultList = [],
      resultPagination = {},
      onlinePagination = {},
      onlineData = [],
      sorceList = [],
      sorcePagination = {},
      startSorceList,
      supplierListPagination = {},
      suggestSupplierDataSource = [],
      suggestSupplierPagination = {},
      bidFileDataSource = [],
      techfileList = [],
    } = contractMaintain;
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
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingStartTime', {
                initialValue:
                  (record.bidMeetingStartTime && dayjs(record.bidMeetingStartTime)) || '',
              })(
                <CusDatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                />
              )}
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
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingEndTime', {
                initialValue: (record.bidMeetingEndTime && dayjs(record.bidMeetingEndTime)) || '',
              })(
                <CusDatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.meetingarrangement`).d('会议安排'),
        dataIndex: 'bidMeetingUrl',
        key: 'bidMeetingUrl',
        width: 150,
        render: (val, record, index) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('bidMeetingUrl', {
                initialValue: record.bidMeetingUrl || '',
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          );
        },
      },

      {
        title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
        key: 'operate',
        width: getCurrentLanguage() === 'zh_CN' ? 130 : 170,
        render: (val, record) => (
          <CusButton onClick={() => this.sendMailUrl(record)}>
            {intl.get(`bid.bidcommon.bid.button.SendOut`).d('发送')}
          </CusButton>
        ),
      },
      {
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
        width: 430,
      },
      {
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        dataIndex: 'operator',
        key: 'operator',
        width: this.state.isOnlineDataFlag
          ? getCurrentLanguage() === 'zh_CN'
            ? 105
            : 163
          : getCurrentLanguage() === 'zh_CN'
          ? 63
          : 163,
        render: (_, record) => (
          <>
            <CusButton
              style={{ marginRight: !(record.isSendEmail === 'y') ? '16px' : '0px' }}
              onClick={() => this.previewEmail(record)}
              type="plain"
            >
              {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
            </CusButton>
            {!(record.isSendEmail === 'y') &&
              this.props.getEndList[this.props.getEndList.length - 1].milestoneState !==
                'published' && (
                <CusButton onClick={() => this.sendMail(record)} type="plain">
                  {intl.get(`bid.bidcommon.bid.button.SendOut`).d('发送')}
                </CusButton>
              )}
          </>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.sendshijian`).d('发送时间'),
        dataIndex: 'invitNoticeSendTime',
        key: 'invitNoticeSendTime',
        width: 171,
      },
    ];
    const listColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'fileName',
        key: 'fileName',
        width: 150,
        render: (val, record) => (
          <a onClick={() => this.openShowUpload(record)} style={{ marginRight: '16px' }}>
            {val}
          </a>
        ),
      },
      {
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        key: 'operator',
        dataIndex: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 43 : 77,
        render: (_, record) => (
          <>
            <CusButton
              type="plain"
              onClick={() => this.handleDownload(record)}
              style={{ marginRight: '16px' }}
            >
              {intl.get('bid.bidcommon.view.title.uploading').d('下载')}
            </CusButton>
            <CusButton type="plain" onClick={() => this.deleteFile(record)}>
              {intl.get('bid.bidcommon.view.button.delete').d('删除')}
            </CusButton>
          </>
        ),
      },
    ];
    const listProps = {
      dataSource: supplierSource,
      columns: columns1,
      pagination: supplierListPagination,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      loading: fetchSourceList,
      onChange: this.supplierList,
    };
    const resultColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        width: 850,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
        dataIndex: 'orderSeq',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 215,
        render: (_, record) => {
          return (
            <span>{record.isBeChosenMeaning}</span>
          )
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看'),
        dataIndex: 'operation',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (text, record, index) => {
          return (
            <CusButton
              type="plain"
              onClick={() => {
                this.previewEmail(record);
              }}
            >
              {intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}
            </CusButton>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.approvalstatus`).d('审批结果'),
        dataIndex: 'lineNum',
        width: getCurrentLanguage() === 'zh_CN' ? 95 : 145,
        render: (_, record) => {
          if (record.result === 'pass') {
            return <span>{intl.get('bid.bidcommon.bid.button.Adopt').d('通过')}</span>;
          }
          if (record.result === 'reject') {
            return <span>{intl.get('bid.bidcommon.bid.button.NoAdopt').d('驳回')}</span>;
          }
        },
      },
    ];
    const resultLists = {
      dataSource: resultList,
      columns: resultColumns,
      scroll: { x: tableScrollWidth(resultColumns) },
      rowKey: 'supplierId',
      pagination: resultPagination,
      onChange: this.getResultList,
    };
    const sorceColumns = [
      {
        title: intl.get(`bid.bidcommon.bid.title.name`).d('姓名'),
        dataIndex: 'name',
        key: 'name',
        width: getCurrentLanguage() === 'zh_CN' ? 280 : 190,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.reviewedornot`).d('是否已评分'),
        dataIndex: 'scoreState',
        key: 'scoreState',
        width: getCurrentLanguage() === 'zh_CN' ? 105 : 142,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.submitscoredate`).d('提交评分时间'),
        dataIndex: 'submitTime',
        key: 'submitTime',
        width: getCurrentLanguage() === 'zh_CN' ? 178 : 228,
        render: tooltipRender,
      },
    ];
    const newColumns = [
      {
        title: intl.get(`bid.bidcommon.bid.title.name`).d('姓名'),
        dataIndex: 'judgesName',
        key: 'judgesName',
        width: 240,
      },
    ];
    if (startSorceList.length) {
      startSorceList[0].supplierList.map((item, i) => {
        newColumns.push({
          title: `${item.supplierName}`,
          dataIndex: `${item.supplierName}${i}`,
          key: `${item.supplierId}`,
          dataIndex: `${item.supplierId}`,
          width: 160,
          render: (_, row) => {
            if (row.supplierList[i]) {
              if (showPass.length && row.supplierList[i].unqualifiedSupplier) {
                if (showPass[0].value === row.supplierList[i].unqualifiedSupplier) {
                  return tooltipRender(showPass[0].meaning);
                } else {
                  return tooltipRender(showPass[1].meaning);
                }
              }
            }
          },
        });
      });
    }

    const sorceLists = {
      dataSource: sorceList,
      columns: sorceColumns,
      scroll: { x: tableScrollWidth(sorceColumns) },
      pagination: sorcePagination,
    };
    const sorceStartList = {
      dataSource: startSorceList,
      columns: newColumns,
      pagination: false,
    };
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      data: this.uploadData,
      headers,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
    };
    const meetingListProps = {
      ...this.props,
      loading: supplierMeetingLoading,
      onPageChange: this.supplierList,
      handleSendMailUrl: this.sendMailUrl,
    };

    const suggestSupplierColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        width: getCurrentLanguage() === 'zh_CN' ? 445 : 355,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
        dataIndex: 'orderSeq',
        required: true,
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 180,
        render: (_, record) => {
          return (
            isSelectSup === 'Y' ?
            <div>{record.isBeChosenMeaningBefore}</div>
            :
            <Form.Item>
              {record.$form.getFieldDecorator(`isBeChosen`, {
                initialValue: record.isBeChosen,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.bidcommon.view.title.whetherthebidwaswon`)
                        .d('是否中选'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={
                    this.props.getDetailList?.isFrameAgreement === 'Y' ?
                    yesNoAlternate : yesNo
                  }
                  lazyLoad={false}
                  onChange={(val) => {
                    record.isBeChosen = val
                    if(val !== 'YES') {
                      record.beSelectedMoney = '';
                    }
                  }}
                />
              )}
            </Form.Item>
          )
        },
      },
      this.props.getDetailList?.isFrameAgreement === 'Y' && {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.budgetAmount`).d('预算金额'),
        dataIndex: 'beSelectedMoneyBefore',
        required: true,
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 120,
        render: (_, record) => {
          return (
            isSelectSup === 'Y' ?
            <div style={{textAlign: 'right'}}>{numberRender(record.beSelectedMoneyBefore, 2)}</div>
            :
            ['YES'].includes(record.isBeChosen) ?
            <Form.Item>
              {record.$form.getFieldDecorator(`beSelectedMoney`, {
                initialValue: record.beSelectedMoney,
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get(`ssrc.projectSetup.model.projectSetup.budgetAmount`).d('预算金额'),
                //     }),
                //   },
                // ],
              })(
                <CusInputNumber
                  className="cus-input-money"
                  precision={2}
                  step={0.01}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              )}
            </Form.Item>
            :
            <></>
          )
        },
      },
    ].filter(Boolean)

    console.log('suggestSupplierDataSource', suggestSupplierDataSource)
    const suggestSupplierProps = {
      dataSource: suggestSupplierDataSource,
      pagination: suggestSupplierPagination,
      columns: suggestSupplierColumns,
      scroll: { x: tableScrollWidth(suggestSupplierColumns) },
      rowKey: 'poOrderId',
      onChange: this.getSuggestSupplierList,
    }
    return (
      <>
        <Form className={styles[('header-form', 'allFormStyle')]}>
          <CusModal
            title={nameFlag ? titleList.milestoneName : titleList.milestoneNameNew}
            visible={visible1}
            destroyOnClose
            onOk={this.handleOk2}
            onCancel={this.handleCancel}
            confirmLoading={this.state.tenClarificationLoading}
          >
            <Form className="customize-form">
              <Row>
                <Col span={24}>
                  <FormItem label={intl.get('bid.bidcommon.view.title.phasename').d('阶段名称')}>
                    {getFieldDecorator('milestoneName', {
                      initialValue: nameFlag ? titleList.milestoneName : titleList.milestoneNameNew,
                    })(<CusInput.TextArea autoChangeSize={true} disabled />)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  {this.state.upload && (
                    <FormItem label={intl.get(`bid.bidcommon.view.title.round`).d('轮次')} disabled>
                      {getFieldDecorator('prequalEndDate', {
                        initialValue: this.num(titleList.round),
                      })(<CusInput.TextArea autoChangeSize={true} disabled />)}
                    </FormItem>
                  )}
                </Col>
                <Col span={24}>
                  <FormItem label={intl.get('bid.bidcommon.view.title.starttime').d('开始时间')}>
                    {getFieldDecorator('beforeTime', {
                      initialValue: '',
                    })(
                      <CusDatePicker
                        style={{ width: '100%' }}
                        format={getDateTimeFormat()}
                        showTime
                        disabledDate={(currentDate) => {
                          return (
                            (dayjs.isDayjs(
                              getFieldValue('milestoneEndTime') &&
                                dayjs(getFieldValue('milestoneEndTime'))
                            ) &&
                              currentDate &&
                              currentDate.isAfter(
                                getFieldValue('milestoneEndTime') &&
                                  dayjs(getFieldValue('milestoneEndTime'))
                              )) ||
                            (currentDate && dayjs(currentDate).isBefore(dayjs(), 'day'))
                          );
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem
                    label={intl.get('bid.milestonecommon.view.title.deadline').d('截止时间')}
                    style={{ display: 'flex' }}
                  >
                    {getFieldDecorator('milestoneEndTime', {
                      initialValue: '',
                    })(
                      <CusDatePicker
                        style={{ width: '100%' }}
                        format={getDateTimeFormat()}
                        showTime
                        disabledDate={(currentDate) => {
                          return (
                            dayjs.isDayjs(
                              getFieldValue('beforeTime') && dayjs(getFieldValue('beforeTime'))
                            ) &&
                            currentDate &&
                            currentDate.isBefore(
                              getFieldValue('beforeTime') && dayjs(getFieldValue('beforeTime'))
                            )
                          );
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label={intl.get(`HKPC.commom.view.title.Remark`).d('备注')}>
                    {getFieldDecorator('nextRoundReason', {
                    })(
                      <CusInput.TextArea
                        maxLength={500}
                        showCharacter
                        autoSize={{ minRows: 2, maxRows: 2 }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </CusModal>
          <CusModal
            title={titleList.milestoneName}
            visible={visible}
            onOk={this.handleOkTime}
            destroyOnClose
            onCancel={this.handleCancel}
          >
            <div className={classnames(styles['tip-head'])}>
              {titleList.milestoneCode === 'project_qa' && (
                <div>
                  <span>
                    {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                    {/* </span>
                  <span className={classnames(styles['tip-style'])}> */}
                    {intl
                      .get('bid.bidcommon.view.title.ProjectQAeditingtimegys')
                      .d('供应商须在截止时间前递交答疑问题')}
                  </span>
                </div>
              )}
              {titleList.milestoneCode === 'technical_documents' && (
                <div>
                  <span className={classnames(styles['tip-style'])}>
                    {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                  </span>
                  <span className={classnames(styles['tip-style'])}>
                    {intl
                      .get(
                        'bid.bidcommon.view.title.Technicalandcommercialsubmissionandeditingtimegys'
                      )
                      .d('供应商须在截止时间前递交技术商务文件')}
                  </span>
                  <span className={classnames(styles['tip-style'])} style={{ paddingBottom: 0 }}>
                    {intl
                      .get(
                        'bid.bidcommon.view.title.Technicalandcommercialsubmissionandeditingtimecgy'
                      )
                      .d('采购员可在任何时间查看已递交的文件')}
                  </span>
                </div>
              )}
              {titleList.milestoneCode === 'ten_clarification' && (
                <div>
                  <span className={classnames(styles['tip-style'])}>
                    {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                  </span>
                  <span className={classnames(styles['tip-style'])}>
                    {intl
                      .get(
                        'bid.bidcommon.view.title.Editingtimeoftechnicalandcommercialclarificationpw'
                      )
                      .d('评委需须在截止时间前提出问题')}
                  </span>
                  <span className={classnames(styles['tip-style'])} style={{ paddingBottom: 0 }}>
                    {intl
                      .get(
                        'bid.bidcommon.view.title.Editingtimeoftechnicalandcommercialclarificationcgy'
                      )
                      .d('采购员须在截止时间前操作')}
                  </span>
                </div>
              )}
              {titleList.milestoneCode === 'price_file_upload' && (
                <div>
                  <span className={classnames(styles['tip-style'])}>
                    {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                  </span>
                  <span className={classnames(styles['tip-style'])}>
                    {intl
                      .get('bid.bidcommon.view.title.Quotationfileeditingtimegys')
                      .d('供应商须在截止时间前递交报价文件')}
                  </span>
                  <span className={classnames(styles['tip-style'])} style={{ paddingBottom: 0 }}>
                    {intl
                      .get('bid.bidcommon.view.title.Quotationfileeditingtimecgy')
                      .d('采购员在截止时间后才可查看报价【单一来源谈判方式除外】')}
                  </span>
                </div>
              )}
              {titleList.milestoneCode === 'price_clarification' && (
                <div>
                  <span className={classnames(styles['tip-style'])} style={{ paddingBottom: 0 }}>
                    {intl.get('bid.bidcommon.view.title.explain').d('说明')}:
                    {/* </span>
                  <span className={classnames(styles['tip-style'])}> */}
                    {intl
                      .get('bid.bidcommon.view.title.Priceclarificationeditingtime')
                      .d('供应商须在截止时间前回复价格澄清的疑问')}
                  </span>
                </div>
              )}
            </div>
            <Form className="customize-form">
              <Row>
                <Col span={24}>
                  <FormItem label={intl.get('bid.bidcommon.view.title.phasename').d('阶段名称')}>
                    {getFieldDecorator('name', {
                      initialValue: titleList.milestoneName,
                    })(<CusInput.TextArea autoChangeSize={true} disabled />)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  {titleList.round && titleList.milestoneCode != 'project_qa' && (
                    <FormItem label={intl.get(`bid.bidcommon.view.title.round`).d('轮次')} disabled>
                      {getFieldDecorator('prequalEndDate', {
                        initialValue: titleList.round,
                      })(<CusInput.TextArea autoChangeSize={true} disabled />)}
                    </FormItem>
                  )}
                </Col>
                <Col span={24}>
                  {titleList.milestoneCode != 'bid_metting' && (
                    <FormItem label={intl.get(`bid.bidcommon.view.title.starttime`).d('开始时间')}>
                      {getFieldDecorator('beforeTime', {
                        initialValue:
                          titleList.milestoneStartTime && dayjs(titleList.milestoneStartTime),
                      })(
                        <CusDatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateTimeFormat()}
                          showTime
                          disabled={titleList.milestoneState == 'in_process'}
                          disabledDate={(currentDate) => {
                            return (
                              (dayjs.isDayjs(
                                getFieldValue('milestoneEndTime') &&
                                  dayjs(getFieldValue('milestoneEndTime'))
                              ) &&
                                currentDate &&
                                currentDate.isAfter(
                                  getFieldValue('milestoneEndTime') &&
                                    dayjs(getFieldValue('milestoneEndTime'))
                                )) ||
                              (currentDate && dayjs(currentDate).isBefore(dayjs(), 'day'))
                            );
                          }}
                        />
                      )}
                    </FormItem>
                  )}
                </Col>
                <Col span={24}>
                  {titleList.milestoneCode !== 'bid_metting' && (
                    <FormItem
                      label={intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间')}
                    >
                      {getFieldDecorator('milestoneEndTime', {
                        initialValue:
                          titleList.milestoneEndTime && dayjs(titleList.milestoneEndTime),
                      })(
                        <CusDatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateTimeFormat()}
                          showTime
                          disabledDate={(currentDate) => {
                            return (
                              dayjs.isDayjs(
                                getFieldValue('beforeTime') && dayjs(getFieldValue('beforeTime'))
                              ) &&
                              currentDate &&
                              currentDate.isBefore(
                                getFieldValue('beforeTime') && dayjs(getFieldValue('beforeTime'))
                              )
                            );
                          }}
                        />
                      )}
                    </FormItem>
                  )}
                </Col>
                <Col span={24}>
                  {titleList.milestoneCode == 'bid_metting' && (
                    <div>
                      <EditTable {...listProps} />
                    </div>
                  )}
                </Col>
              </Row>
            </Form>
          </CusModal>
          <CusModal
            title={intl
              .get('bid.milestonecommon.view.title.projectbidpresentationmeeting')
              .d('项目述标会议')}
            destroyOnClose
            visible={visibleCreate}
            onOk={this.handleOk}
            width={1000}
            onCancel={this.handleCancel}
          >
            <MeetingList {...meetingListProps} />
          </CusModal>
          <CusModal
            title={intl.get('bid.bidcommon.view.title.attachment').d('附件')}
            visible={showFlag}
            destroyOnClose
            onOk={this.fileListOk}
            onCancel={this.handleCancel}
          >
            <CusTable
              columns={listColumns}
              dataSource={showList}
              pagination={pagination}
              rowKey="milestoneId"
              scroll={{ x: tableScrollWidth(listColumns) }}
            />
          </CusModal>
          {/* <CusModal
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
          </CusModal> */}
          <CusTable
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            dataSource={getEndList}
            className={classnames(styles[('table-style', 'editTableFontSize')])}
            pagination={pagination}
            rowKey="milestoneId"
            onChange={this.changeData()}
          />
          <CusModal
            title={intl.get(`bid.bidcommon.view.button.view`).d('结果查看')}
            visible={this.state.fileModel}
            destroyOnClose
            onCancel={this.handleCancelResult}
            width={1200}
            footer={
              <CusButton onClick={this.handleCancelResult}>
                {intl.get(`hzero.common.model.button.close`).d('关闭')}
              </CusButton>
            }
          >
            <CusSpin spinning={fetchResultListLoading}>
              <CusTable {...resultLists} />
            </CusSpin>
          </CusModal>
          <CusModal
            title={intl.get(`bid.bidcommon.bid.button.Preview`).d('模板预览')}
            visible={this.state.fileEmailModel}
            onOk={this.handleOkEmailMore}
            destroyOnClose
            onCancel={this.handleCancelEmailMore}
            width="40%"
            className={styles.scrollCss}
          >
            <p dangerouslySetInnerHTML={{ __html: this.props.contractMaintain.emailPreview }}></p>
          </CusModal>
          <CusModal
            title={intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}
            visible={onlineShow}
            destroyOnClose
            onCancel={this.handleCancelEmail}
            footer={
              <>
                <CusButton onClick={this.handleCancelEmail}>
                  {intl.get('hzero.common.button.close').d('关闭')}
                </CusButton>
              </>
            }
            width={700}
          >
            <CusTable
              columns={onlineList}
              dataSource={onlineData}
              pagination={onlinePagination}
              rowKey="id"
              scroll={{ x: tableScrollWidth(onlineList) }}
              onChange={this.onlineModel}
            />
          </CusModal>
          <CusModal
            title={intl.get(`bid.bidcommon.bid.button.Viewjudgesscores`).d('查看评委评分')}
            visible={judgesSorceModel}
            destroyOnClose
            onCancel={this.handleCancelSorce}
            width={600}
            footer={
              <CusButton onClick={this.handleCancelSorce}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            }
          >
            <CusTable rowKey="poOrderId" {...sorceLists} />
          </CusModal>
          <CusModal
            title={intl
              .get(`bid.bidcommon.view.title.Summaryoftechnicalcompliancereview`)
              .d('技术符合审查汇总')}
            visible={startSorceFlag}
            destroyOnClose
            onCancel={this.handleCancelSorceStart}
            width="40%"
            footer={[
              <CusButton key="back" onClick={this.handleCancelSorceStart}>
                {intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}
              </CusButton>,
              <CusButton
                key="submit"
                type="primary"
                onClick={this.handleOkSorceStart}
                disabled={startSorceList.length && startSorceList[0].gradingState == 'y'}
              >
                {intl.get(`bid.bidcommon.view.title.Confirmtostartscoring`).d('确认开始评分')}
              </CusButton>,
            ]}
          >
            <EditTable {...sorceStartList}></EditTable>
          </CusModal>
          <CusModal
            title={intl.get(`bid.bidcommon.view.title.completeqa`).d('答疑完结')}
            visible={qaModalVisibal}
            onOk={this.handleCompletionQA}
            destroyOnClose
            onCancel={this.handleCancelQA}
            width="40%"
            confirmLoading={completionQALoading}
          >
            <p style={{ margin: 0 }}>
              {intl
                .get(`bid.bidcommon.view.title.completeqaprompt`)
                .d('点击【确认】后，将结束整个技术商务澄清环节（含添加下一轮的操作）。')}
            </p>
          </CusModal>
          <CusModal
            title={intl.get('HKPC.commom.view.title.applicationdeadline').d('报名截止时间')}
            visible={isNoticeEditTime}
            destroyOnClose
            onCancel={() => {
              this.setState({
                isNoticeEditTime: false,
              });
            }}
            onOk={() => this.showEdit(noticeRecord)}
            width={600}
          >
            <Form className="customize-form">
              <Row>
                <Col span={24}>
                  <FormItem
                    label={intl.get(`HKPC.commom.view.title.applicationdeadline`).d('报名截止时间')}
                  >
                    {getFieldDecorator('deadline', {
                      // initialValue: deadline,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`HKPC.commom.view.title.applicationdeadline`)
                              .d('报名截止时间'),
                          }),
                        },
                      ],
                    })(
                      <CusDatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateTimeFormat()}
                        showTime
                        disabledDate={(current) => {
                          return current && current.isBefore(moment(), 'minute');
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </CusModal>
          <CusModal
            title={intl.get('HKPC.commom.view.message.Selecthistoricalquote').d('建议中选供应商')}
            visible={isSupplierModalVisable}
            destroyOnClose
            confirmLoading={saveOnlyResultUrlLoading}
            footer={
              <>
                {isSelectSup === 'N' && <div>
                  <CusButton
                    onClick={() => {
                      this.setState({
                        isSupplierModalVisable: false,
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </CusButton>
                  <CusButton
                    type='primary'
                    onClick={() => 
                      CusModal.confirm({
                        content: intl.get('HKPC.commom.view.title.givepricetoapplicant').d('提交报价给申请部门!'),
                        okType: 'primary',
                        onOk: this.handleSaveOnlyResult,
                      })
                    }
                  >
                    {intl.get('hzero.common.cusModal.button.confirm').d('确认')}
                  </CusButton>
                </div>}
                {isSelectSup === 'Y' && <CusButton
                  onClick={() => {
                    this.setState({
                      isSupplierModalVisable: false,
                    });
                  }}
                >
                  {intl.get('hzero.common.button.close').d('关闭')}
                </CusButton>}
              </>
            }
            width={800}
          >
            <CusSpin spinning={fetchResultListLoading}>
              <EditTable {...suggestSupplierProps} />
            </CusSpin>
          </CusModal>
          <CusModal
            title={intl.get('HKPC.commom.view.title.openornotBid').d('是否开标')}
            visible={bidOpenVisible}
            destroyOnClose
            onCancel={() => {
              this.setState({
                bidOpenVisible: false
              })
            }}
            onOk={this.handleOpenBid}
          >
            <div>{intl.get('HKPC.commom.view.title.openBid').d('当前参与投标的供应商满足开标条件，是否开标')}</div>
          </CusModal>
          <CusModal
            title={intl.get('HKPC.commom.view.title.failedornotBid').d('是否流标')}
            visible={bidFailedVisible}
            destroyOnClose
            onCancel={() => {
              this.setState({
                bidFailedVisible: false
              })
            }}
            onOk={this.handleFailedBid}
          >
            <div style={{marginBottom: '16px'}}>{intl.get('HKPC.commom.view.title.failedBid').d('当前参与投标的供应商不满足三家，是否流标')}</div>
            <CusTable
              dataSource={failedSupplierList}
              columns={[
                {
                  title: intl.get(`HKPC.commom.view.title.SN`).d('序号'),
                  dataIndex: 'name',
                  width: 80,
                  render: (_, record, index) => {
                    return <div>{index + 1}</div>
                  }
                },
                {
                  title: intl.get(`HKPC.commom.view.title.ictsuppliername`).d('供应商名称'),
                  dataIndex: 'supplierName',
                  width: 200,
                  render: tooltipRender,
                },
              ]}
            />
          </CusModal>
          <CusModal
            title={intl.get('HKPC.commom.view.title.tectenderfiles').d('投标文件')}
            visible={showBidFileOpenModal}
            width={1000}
            destroyOnClose
            maskClosable={false}
            onCancel={() => {
              this.setState({
                showBidFileOpenModal: false
              })
            }}
            footer={
              <>
                <CusButton
                  onClick={() => {
                    this.setState({
                      showBidFileOpenModal: false,
                    });
                  }}
                >
                  {intl.get('hzero.common.button.close').d('关闭')}
                </CusButton>
              </>
            }
          >
            <CusTable
              dataSource={bidFileDataSource}
              columns={[
                {
                  fixed: 'left',
                  key: 'supplierName',
                  dataIndex: 'supplierName',
                  title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
                  width: 150,
                  render: tooltipRender,
                },
                {
                  key: 'technicalDocUuid',
                  dataIndex: 'technicalDocUuid',
                  title: intl.get(`HKPC.commom.view.title.TechnicalDoc`).d('技术要求'),
                  width: 130,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.technicalDocUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'TechnicalDoc',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'coveringLetterUuid',
                  dataIndex: 'coveringLetterUuid',
                  title: intl.get(`HKPC.commom.view.title.CoveringLetter`).d('封面信'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.coveringLetterUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'CoveringLetter',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'executiveSumUuid',
                  dataIndex: 'executiveSumUuid',
                  title: intl.get(`HKPC.commom.view.title.ExecutiveSum`).d('执行摘要'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.executiveSumUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'ExecutiveSum',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'projectProposalUuid',
                  dataIndex: 'projectProposalUuid',
                  title: intl.get(`HKPC.commom.view.title.ProjectProposal`).d('项目建议书'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.projectProposalUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'ProjectProposal',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'tendererQualificationsUuid',
                  dataIndex: 'tendererQualificationsUuid',
                  title: intl.get(`HKPC.commom.view.title.TendererQualifications`).d('投标资质'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.tendererQualificationsUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'TendererQualifications',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'confidentAgreeUuid',
                  dataIndex: 'confidentAgreeUuid',
                  title: intl.get(`HKPC.commom.view.title.ConfidentAgree`).d('合同条件'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.confidentAgreeUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'ConfidentAgree',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'acknowledgementLetterUuid',
                  dataIndex: 'acknowledgementLetterUuid',
                  title: intl.get(`HKPC.commom.view.title.AcknowledgementLetter`).d('工程量清单'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.acknowledgementLetterUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'AcknowledgementLetter',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'brcertificateUuid',
                  dataIndex: 'brcertificateUuid',
                  title: intl.get(`HKPC.commom.view.title.brcertificate`).d('商业登记证明'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.brcertificateUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'BRCertificate',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
                {
                  key: 'othersUuid',
                  dataIndex: 'othersUuid',
                  title: intl.get(`HKPC.commom.view.title.Others`).d('其它'),
                  width: 150,
                  render: (_, record) => {
                    return (
                      <CusUploadFileType
                        filePreview
                        bucketName="bidding"
                        tenantId={getCurrentOrganizationId()}
                        viewOnly
                        attachmentUUID={record.othersUuid}
                        isEncrypt
                        portalAttachlist={portalAttachlist}
                        lineRecord={
                          {
                            ...record,
                            fileType: 'Others',
                            proId: match.params.proId,
                          }
                        }
                        dispatch={dispatch}
                      />
                    )
                  }
                },
              ]}
              rowKey="rowKey"
            />
          </CusModal>
          <CusModal
            title={intl.get('HKPC.commom.view.title.uploadtechfile').d('上传技术标书')}
            visible={uploadtechfileVisible}
            destroyOnClose
            maskClosable={false}
            onOk={this.saveUploadTechFile}
            footer={
              <>
                {!(['completed', 'closed'].includes(this.props.getDetailList.proState)) && <div>
                  <CusButton
                    onClick={() => {
                      this.setState({
                        uploadtechfileVisible: false,
                      });
                    }}
                    loading={saveTechfileListLoading}
                  >
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </CusButton>
                  <CusButton
                    type='primary'
                    onClick={() => this.saveUploadTechFile()}
                    loading={saveTechfileListLoading}
                  >
                    {intl.get('hzero.common.cusModal.button.confirm').d('确认')}
                  </CusButton>
                </div>}
                {['completed', 'closed'].includes(this.props.getDetailList.proState) && <CusButton
                  onClick={() => {
                    this.setState({
                      uploadtechfileVisible: false,
                    });
                  }}
                >
                  {intl.get('hzero.common.button.close').d('关闭')}
                </CusButton>}
              </>
            }
            confirmLoading={saveTechfileListLoading}
          >
            <EditTable
              rowKey="rowKey"
              dataSource={techfileList}
              columns={[
                {
                  title: intl.get(`bid.bidcommon.view.title.number`).d('序号'),
                  dataIndex: 'orderSeq',
                  key: 'orderSeq',
                  width: 100,
                  render: (_, record, index) => {
                    return index + 1;
                  },
                },
                {
                  title: intl.get(`bid.bidcommon.view.title.documentcategory`).d('文件类别'),
                  dataIndex: 'typeMeaning',
                  width: 150,
                  key: 'typeMeaning',
                  render: (_, record) => {
                    return (
                      <span>{record.typeMeaning}</span>
                    );
                  },
                },
                {
                  title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
                  dataIndex: 'operator',
                  width: 100,
                  render: (_, record) => {
                    return (
                      <Form.Item>
                        {record.$form.getFieldDecorator(`uuid`, {
                          initialValue: record.uuid,
                        })(
                          <CusUploadTechnical
                            attachmentUUID={record.uuid}
                            bucketName="bidding"
                            filePreview
                            viewOnly={['completed', 'closed'].includes(this.props.getDetailList.proState)}
                            removeCallback={(fileList) => {
                              if(fileList.length === 0) {
                                record.$form.setFieldsValue({
                                  uuid: null,
                                })
                              }
                            }}
                          />
                        )}
                      </Form.Item>
                    );
                  },
                },
              ]}
            />
          </CusModal>
        </Form>
      </>
    );
  }
}
