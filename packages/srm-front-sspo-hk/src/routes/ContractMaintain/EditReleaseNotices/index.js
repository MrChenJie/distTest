/**
 * index.js - 发布公告发起MIP审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Button, Tabs, Input, DatePicker, Avatar, LocaleProvider } from 'hzero-ui';
import { Modal, Tooltip } from 'choerodon-ui/pro';
import moment from 'moment';
import { Bind, Debounce } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { connect } from 'dva';
import { SRM_BID } from '@/common/config';
import notification from 'utils/notification';
import { isUndefined, isEmpty } from 'lodash';
import request from 'utils/request';
import btnTracking from '@/assets/approval/(签收历史）Tracking.png';
import btnSubmit from '@/assets/approval/(办理or提交）btn_submit.png';
import btnDel from '@/assets/approval/（删除）btn_doDelete.png';
import btnForward from '@/assets/approval/（知会）btn_forward.png';
import btnForward2 from '@/assets/approval/（会签）btn_forward2.png';
import btnFlowChart from '@/assets/approval/（流程图）FlowChart.png';
import btnApprovalHistory from '@/assets/approval/（审批状态）ApprovalHistory.png';
import btnForwardback3 from '@/assets/approval/（转办）btn_forwardback3.png';
// import { getTableDataNotValidate } from '@/utils/utils';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import styles from './index.less';
import './index.less';
import StaticTextEditor from './StaticTextEditor';
import formatterCollections from 'utils/intl/formatterCollections';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import CusNotification from '_cus_components/CusNotification';
import { closeWindow } from '_cus_utils/utils';

const TabPane = Tabs.TabPane;
// const { TextArea } = Input;
const commonPrompt = 'srsp.nrcEstimate';
const organizationId = getCurrentOrganizationId();

@connect(({ loading = {}, contractMaintain = {}, purchaseOrder = {} }) => ({
  editNoticesLoading: loading.effects['contractMaintain/editNotices'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  saveLoading: loading.effects['contractMaintain/editNotices'],
  submitPoLoading: loading.effects['purchaseOrder/submitPo'],
  contractMaintain,
  purchaseOrder,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.announcement'
  ],
})
@Form.create({ fieldNameProp: null })
export default class EditReleaseNotices extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.staticTextEditor = React.createRef();
    this.state = {
      requestId: 0,
      editorKey: uuid(),
      noticeList: [],
      poHeadersId: match.params,
      finallyIsView: false, // 是否显示mip按钮
      approvalRequestButtonVOList: [], // 接收按钮信息
      costRequestId: match.params.proId,
      preChecking: false,
      isRequestid: 0,
      visible: false,
      isDisabled: false,
      creatTime: this.props.contractMaintain.noticeLists.signUpStartTime || '', // 更改时间格式前进行保存新建时间
      endTime: this.props.contractMaintain.noticeLists.signUpEndTime || '', // 更改时间格式前进行保存截止时间
      noticeId: '', // 用于第一次保存后再次保存作为参数
      noticeState: '', // 公告状态
      newProId: '',
      isSetNew: false, // 判断是否是新建公告，是的话校验isHaveTime
    };
  }
  componentDidMount() {
    this.getNoticeListContent();
    this.fetchEnum(); // 查询值集
    // 该方法是用于 goToClose 页面调用的，用于关闭modal框的方法
    window.addEventListener('message', this.receiveMessage, false);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrder/updateState',
      payload: {
        poHeader: {}, // 头信息
      },
    });
    window.addEventListener('message', this.receiveMessage, false);
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/init',
    });
  }

  // 判断是否有投标技术文件时间
  @Bind
  isHaveTime() {
    const { dispatch } = this.props;
    const { newProId } = this.state;
    dispatch({
      type: 'contractMaintain/checkEdit',
      payload: {
        proId: newProId
      },
    }).then((res) => {
      if (res) {
        this.getNoticeListContent()
      } else {
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.edditannouncement`).d('请填写技术及商务文件递交时间'),
        });
      }
      this.setState({isSetNew: true})
    })
  }

  // 获取查看公告页面带过来的公告内容放到编辑框中
  @Bind
  getNoticeListContent() {
    const { match } = this.props;
    if (match.params.proId !== undefined) {
      if (match.params.milestoneId === 'milestoneId' || match.params.milestoneId === '0') {
        // 这里的proId是上个页面带过来的noticeId
        request(`${SRM_BID}/v1/${organizationId}/bid-notices/${match.params.proId}`, {
          method: 'GET'
        }
        ).then((res) => {
          this.setState({
            editorKey: uuid(),
            noticeList: res,
            isRequestid: res.requestId,
            creatTime: res.signUpStartTime,
            endTime: res.signUpEndTime,
            noticeId: res.noticeId,
          })
          this.setState({ noticeState: res.noticeState, newProId: res.proId})
          if (res.proId && match.params.editFlag === '1' && res.proId === match.params.proId) {
            this.isHaveTime();
          }
          // 审批中和已完成状态禁止编辑
          if (res.noticeState === 'under_approval' || res.noticeState === 'completed') {
            this.setState({ isDisabled: false })
          } else {
            this.setState({ isDisabled: true })
          }
          let isRequestid = res.requestId
          if (isRequestid) {
            this.setState({ finallyIsView: true, isDisabled: false })
            this.approvalProcess(res.requestId)
          }
        })
      } else {
        request(`${SRM_BID}/v1/${organizationId}/bid-notices/getInitNoticeInfo/${match.params.proId}`, {
          method: 'GET'
        }
        ).then((res) => {
          this.setState({
            editorKey: uuid(),
            noticeList: res,
            creatTime: res.signUpStartTime,
            endTime: res.signUpEndTime,
            noticeId: res.noticeId,
            newProId: res.noticeId,
          })
          if (match.params.editFlag === '0') {
            this.setState({ isDisabled: false })
          } else {
            this.setState({ isDisabled: true })
          }
        })
      }
    }
  }

  // 时间编辑
  @Bind
  onChangeStart(e) {
    this.setState({
      creatTime: moment(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    this.setState({
      signUpStartTime: moment(e).format('YYYY-MM-DD HH:mm:ss')
    })
    // this.state.noticeList.signUpStartTime = moment(e).format('YYYY-MM-DD HH:mm:ss')
  }
  @Bind
  onChangeLast(e) {
    this.setState({
      endTime: moment(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    this.setState({
      signUpEndTime: moment(e).format('YYYY-MM-DD HH:mm:ss')
    })
    // this.state.noticeList.signUpEndTime = moment(e).format('YYYY-MM-DD HH:mm:ss')
  }
  @Bind
  changeNoticeList() {
    const { form: { validateFieldsAndScroll } } = this.props;
    validateFieldsAndScroll({ focus: true }, (err, values) => {
      this.state.noticeList.cnSimpleNoticeTitle = values.cnSimpleNoticeTitle;
      this.state.noticeList.cnTradNoticeTitle = values.cnTradNoticeTitle;
      this.state.noticeList.enNoticeTitle = values.enNoticeTitle;
    });
  }

  // 保存
  @Bind
  @Debounce(200)
  saveNotice(callback) {
    const { dispatch, match, form } = this.props;
    const { noticeList, creatTime, endTime, noticeId } = this.state;
    // if (noticeList.signUpStartTime < noticeList.signUpEndTime) {
    if (creatTime < endTime) {
      if (match.params && match.params.milestoneId === 'milestoneId') {
        noticeList.milestoneId = 0 // 里程碑id
        // newNoticeList.milestoneId = 0
      } else {
        noticeList.milestoneId = match.params.milestoneId // 里程碑id
        // newNoticeList.milestoneId = match.params.milestoneId
      }
      if (noticeList.cnSimpleNoticeContent !== '' && noticeList.cnTradNoticeContent !== '' && noticeList.enNoticeContent !== '') {
        form.validateFields((err, fieldsValue) => {
          if (isEmpty(err)) {
            if (noticeList.cnSimpleNoticeContent !== '' || noticeList.cnTradNoticeContent !== '' || noticeList.enNoticeContent !== '') {
              fieldsValue.signUpStartTime = creatTime;
              fieldsValue.signUpEndTime = endTime;
              fieldsValue.noticeId = noticeId;
              fieldsValue.proId = this.state.newProId ? this.state.newProId : match.params.proId;
            } else {
              fieldsValue.signUpStartTime = creatTime;
              fieldsValue.signUpEndTime = endTime;
              fieldsValue.noticeId = noticeId;
              fieldsValue.proId = this.state.newProId ? this.state.newProId : match.params.proId;
            }
            if (match.params && match.params.milestoneId === 'milestoneId') {
              fieldsValue.milestoneId = 0 // 里程碑id
            } else {
              fieldsValue.milestoneId = match.params.milestoneId // 里程碑id
            }
            dispatch({
              type: 'contractMaintain/editNotices',
              payload: [fieldsValue],
            }).then((res) => {
              if(res && res.failed) {
                return CusNotification.error({ message: res.message, closable: false })
              }
              if (res) {
                if (typeof callback === 'function') {
                  callback();
                } else {
                  notification.success({
                    message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                  });
                  this.setState({ requestId: res[0].requestId, noticeId: res[0].noticeId })
                  if (res[0].requestId) {
                    this.approvalProcess(res[0].requestId)
                  }
                }
              }
            });
          }
        })
      } else {
        notification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl
              .get(`bid.announcement.view.title.announname`)
              .d('公告名称')
          })
        });
      }
    } else {
      notification.error({
        message: intl.get('bid.announcement.view.message.xiaoyujiebiaoshijian').d('报名时间必须小于截标时间')
      });
    }
  }

  @Bind
  onEditChange(val, language) {
    const { form: { setFieldsValue } } = this.props;
    if (language === 'english') {
      setFieldsValue({
        enNoticeContent: val
      })
    } else if (language === 'mulity') {
      setFieldsValue({
        cnTradNoticeContent: val
      })
    } else {
      setFieldsValue({
        cnSimpleNoticeContent: val
      })
    }


  }

  /**
   * 监听事件回调方法
   * @param param
   */
  @Bind
  receiveMessage(param) {
    const {
      data: { routerParam = {} },
    } = param;
    console.log('param=========init', param)
    if (routerParam.opt === 'ok') {
      console.log('ok', routerParam.opt)
      this.getNoticeListContent();
      this.fetchEnum(); // 查询值集
      Modal.destroyAll();
      this.handleCloseModal(); // 公告返回上一页或者关闭tag页
    } else if (routerParam.opt === 'close') {
      Modal.destroyAll();
      console.log('close', routerParam.opt)
      this.getNoticeListContent();
      this.fetchEnum(); // 查询值集
    } else if (routerParam.opt === 'refresh') {
      Modal.destroyAll();
      // 原意打算使用tab中的刷新，无奈改动太大，等后期有提出需求的时候再做变更
      window.location.reload();
    }
  }

  // MIP审批明细查询
  @Bind
  approvalProcess(getMipId) {
    const { dispatch, match } = this.props;
    const { noticeState } = this.state;
    dispatch({
      type: 'contractMaintain/approvalProcess',
      payload: {
        requestId: getMipId,
        organizationId: getCurrentOrganizationId(),
      }
    }).then((res) => {
      if (res) {
        this.setState({
          approvalRequestButtonVOList: res.approvalRequestButtonVOList
        })
        // 初始化时没有提交按钮就禁止页面编辑
        // if ((this.state.approvalRequestButtonVOList.length > 0 && this.state.approvalRequestButtonVOList[0].buttonKey !== 'submitName') || match.params.editFlag === '0') {
        //   this.setState({ finallyIsView: true, isDisabled: false })
        // } else {
        //   this.setState({ finallyIsView: true, isDisabled: true });
        // }
        // 审批中和已完成状态禁止编辑
        if (noticeState === 'under_approval' || noticeState === 'completed') {
          this.setState({ isDisabled: false })
        } else {
          this.setState({ isDisabled: true })
        }
        this.setState({ finallyIsView: true })
        // 显示mip发起审批的按钮
        this.generateBtns()
      }
    })
  }

  /**
   * 渲染审批按钮
   * @returns {unknown[]}
   */
  @Bind
  generateBtns() {
    const { approvalRequestButtonVOList } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    return approvalRequestButtonVOList
      .sort((one, two) => {
        return one.buttonOrder - two.buttonOrder;
      })
      .map((item) => {
        let src = btnTracking;
        switch (item.buttonKey) {
          case 'submitName':
            // 提交
            src = btnSubmit;
            break;
          case 'DeleteBtn':
            // 注销
            src = btnDel;
            break;
          case 'LookView':
            // 流程图
            src = btnFlowChart;
            break;
          case 'forwardName':
            // 知会
            src = btnForward;
            break;
          case 'LookApproval':
            // 流程状态
            src = btnApprovalHistory;
            break;
          case 'takingopinionsName':
            // 会签
            src = btnForward2;
            break;
          case 'HandleForwardName':
            // 转办
            src = btnForwardback3;
            break;
          default:
            break;
        }
        if (
          item.buttonKey === 'submitName' ||
          item.buttonKey === 'takingopinionsName' ||
          item.buttonKey === 'forwardName' ||
          item.buttonKey === 'HandleForwardName' ||
          item.buttonKey === 'DeleteBtn' ||
          item.buttonKey === 'LookApproval' ||
          item.buttonKey === 'LookView'
        ) {
          if (
            item.buttonKey === 'HandleForwardName' &&
            ['DRAFT', 'REVOKE', undefined].includes(status)
          ) {
            return null;
          }
          return (
            <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
              <div className='btn' onClick={() => this.openModal(item)}>
                <Avatar className='icon' src={src} />
                <p
                  style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                  className={styles.text}
                >
                  {isEn ? item.nameE : item.name}
                </p>
              </div>
            </Tooltip>
          );
          // }
        } else {
          return (
            <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
              <div className="btn" onClick={() => this.openModal(item)}>
                <Avatar className="icon" src={src} />
                <p
                  style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                  className="text"
                >
                  {isEn ? item.nameE : item.name}
                </p>
              </div>
            </Tooltip>
          );
        }
      });
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

  // MIP提交/会签
  // @Bind
  async submitPreCheck() {
    const { dispatch } = this.props;
    const { poHeadersId } = this.state;
    dispatch({
      type: 'purchaseOrder/submitPreCheck',
      payload: {
        costRequestId: poHeadersId.proId,
      }
    })
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCloseModal() {
    const { match, dispatch, location: { state: { _back } = {} } } = this.props;
    let flag = match.params.milestoneId;
    // const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    let isHaveNoticeProId = match.params.milestoneId === '0' ? `/pub/sspo/online-purchase/notices2/${this.state.noticeList.proId}` : `/pub/sspo/online-purchase/notices2`;
    let backPath = '';
    if (flag !== 'milestoneId' && flag !== '0') {
      backPath = `/pub/sspo/online-purchase/detail1/${match.params.proId}/proId`
    } else {
      backPath = isHaveNoticeProId
    }
    if (match.params.editFlag === '0') {
      window.close();
      // 飞书提交审批后关闭tag页
      closeWindow();
    } else {
      dispatch(
        routerRedux.push({
          // 路由跳转
          pathname: backPath,
        })
      );
    }
  }

  // @Bind
  // routerPath() {
  //   const { match, dispatch, location: { state: { _back } = {} } } = this.props;
  //   let flag = match.params.milestoneId;
  //   // const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
  //   let isHaveNoticeProId = match.params.milestoneId === '0' ? `/pub/sspo/online-purchase/notices2/${this.state.noticeList.proId}` : `/pub/sspo/online-purchase/notices2`;
  //   let backPath = '';
  //   if (flag !== 'milestoneId' && flag !== '0') {
  //     backPath = `/pub/sspo/online-purchase/detail1/${match.params.proId}/proId`
  //   } else {
  //     backPath = isHaveNoticeProId
  //   }
  //   if (match.params.editFlag !== '0' && this.receiveMessage === 'ok') {
  //     dispatch(
  //       routerRedux.push({
  //         // 路由跳转
  //         pathname: backPath,
  //       })
  //     );
  //   }
  // }

  @Debounce(200)
  @Bind
  openModal(record) {
    const isEn = getCurrentLanguage() === 'en_US';
    if (record.buttonKey === 'submitName') {
      this.saveNotice(() => {
        Modal.open({
          key: Modal.key(),
          title: isEn ? record.nameE : record.name,
          maskClosable: true,
          closable: true,
          destroyOnClose: true,
          footer: null,
          style: {
            width: `${record.width > 1200 ? record.width - 300 : record.width}px`,
            // height: record.buttonKey === 'LookView' && `${record.height - 300}px`,
            // height: `${record.buttonKey === 'DeleteBtn'}` ? `${record.height}px` : `${record.height + 35}px`,
            maxWidth: '90vw',
            overflow: 'hidden',
          },
          onClose: () => {
            this.switchModalContainerClassName();
          },
          children: (
            <iframe
              title="urlContent"
              src={record.url}
              frameBorder="0"
              style={{ width: '100%', overflow: 'auto', height: `${record.height - 15}px` }}
              // style={{ width: '100%', overflow: record.buttonKey === 'LookView' ? 'hidden' : 'auto', height: record.buttonKey === 'LookView' ? '100%' : `${record.height - 12}px` }}
              marginWidth="1"
              marginHeight="1"
            />
          ),
        });
      })
    } else {
      Modal.open({
        key: Modal.key(),
        title: isEn ? record.nameE : record.name,
        maskClosable: true,
        closable: true,
        destroyOnClose: true,
        footer: null,
        style: {
          width: `${record.width > 1200 ? record.width - 300 : record.width}px`,
          // height: record.buttonKey === 'LookView' && `${record.height - 300}px`,
          // height: `${record.buttonKey === 'DeleteBtn'}` ? `${record.height}px` : `${record.height + 35}px`,
          maxWidth: '90vw',
          overflow: 'hidden',
        },
        onClose: () => {
          this.switchModalContainerClassName();
        },
        children: (
          <iframe
            title="urlContent"
            src={record.url}
            frameBorder="0"
            style={{ width: '100%', overflow: 'auto', height: `${record.height - 15}px` }}
            // style={{ width: '100%', overflow: record.buttonKey === 'LookView' ? 'hidden' : 'auto', height: record.buttonKey === 'LookView' ? '100%' : `${record.height - 12}px` }}
            marginWidth="1"
            marginHeight="1"
          />
        ),
      });
    }
    this.switchModalContainerClassName(true);
  }

  /**
    * 按钮状态变更
    * @param {string} btn - 指示是哪个按钮
    */
  @Bind()
  getButtonStatus(btn = '') {
    const {
      purchaseOrder: {
        poHeader: { poStatus }, // 从model获取当前页面需要控制的按钮的状态
      },
    } = this.props;
    const obj = {
      // NEW 起草
      // COMMITED 已提交
      // CANCELED 已取消
      // APPROVED 审批通过
      // REJECTED 审批拒绝
      // CANCELING 取消中
      // 	APPROVING 审批中
      // TERMINATION 已终止
      // STARTCANCEL 发起取消/终止
      cancel: {
        NEW: false,
        COMMITED: false,
        APPROVED: false,
        REJECTED: false,
      },
      RDrafting: {
        COMMITED: false,
        APPROVED: false,
      },
      submit: {
        NEW: false,
        REJECTED: false,
      },
      submit1: {
        NEW: false,
      },
      save: {
        NEW: false,
        REJECTED: false,
        STARTCANCEL: false,
      },
      save1: {
        NEW: false,
        STARTCANCEL: false,
      },
      revoke: {
        STARTCANCEL: false,
      },
      return: {},
    };
    return isUndefined(obj[btn][poStatus]); // 获得该按钮在当前状态是否可编辑
  }

  render() {
    const {
      match,
      form = {},
      location: { state: { _back } = {} },
      editNoticesLoading,
      saveLoading,
    } = this.props;
    const { noticeList = [], finallyIsView, isDisabled } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const {
      cnSimpleNoticeTitle,
      cnSimpleNoticeContent,
      cnTradNoticeTitle,
      cnTradNoticeContent,
      enNoticeTitle,
      enNoticeContent,
      signUpStartTime,
      signUpEndTime,
      linkUrl,
      proId
    } = noticeList;
    // let flag = match.params.editFlag;
    let flag = match.params.milestoneId;
    // editFlag=0里程碑跳过来(可编辑)。editFlag=1查看公告跳过来编辑(可编辑)。editFlag=2查看公告跳过来查看(禁止编辑)
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    let isHaveNoticeProId = match.params.milestoneId === '0' ? `${isPub ? '/pub' : ''}/sspo/online-purchase/notices2/${this.state.noticeList.proId}` : `${isPub ? '/pub' : ''}/sspo/online-purchase/notices2`;
    return (
      <Fragment>
        {isDisabled && <Header>
          <Button type="primary" onClick={() => this.saveNotice()} loading={saveLoading}
          >
            {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
          </Button>
        </Header>}
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zh_CN : undefined}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="简体" key="1">
                <Form.Item label="公告名称：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnSimpleNoticeTitle', {
                    initialValue: cnSimpleNoticeTitle,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announname`)
                          .d('公告名称'),
                      }),
                    }]
                  })(
                    <Input placeholder='请输入' disabled={flag === 2 || !isDisabled}
                      // onChange={() => this.state.noticeList.cnSimpleNoticeTitle = getFieldValue('cnSimpleNoticeTitle')} />
                      onChange={() => this.changeNoticeList()} />
                  )}
                </Form.Item>
                <Form.Item label="报名时间" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpStartTime', {
                    initialValue: signUpStartTime && moment(signUpStartTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.registrationtime`)
                          .d('报名时间'),
                      }),
                    }]
                  })(
                    <DatePicker format="YYYY-MM-DD HH:mm" disabled={flag === 2 || !isDisabled}
                      onChange={e => this.onChangeStart(e)} />
                  )}
                </Form.Item>
                <Form.Item label="截止时间" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpEndTime', {
                    initialValue: signUpEndTime && moment(signUpEndTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.deadlinetraditional`)
                          .d('截止时间'),
                      }),
                    }]
                  })(
                    <DatePicker format="YYYY-MM-DD HH:mm:ss" disabled
                      onChange={e => this.onChangeLast(e)} />
                  )}
                </Form.Item>
                <Form.Item label="公告内容：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnSimpleNoticeContent', {
                    initialValue: cnSimpleNoticeContent,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announcontent`)
                          .d('公告内容'),
                      }),
                    }]
                  })(
                    <div className={styles[flag === 2 || !isDisabled ? 'tinymacClass' : '']}>
                      <StaticTextEditor
                        key='chinese'
                        loading={editNoticesLoading}
                        content={cnSimpleNoticeContent || ''}
                        onRef={staticTextEditor => {
                          this.staticTextEditor = staticTextEditor;
                        }}
                        onEditChange={this.onEditChange}
                        newContent='chinese'
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
              <TabPane tab="繁體" key="2">
                <Form.Item label="公告名稱：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnTradNoticeTitle', {
                    initialValue: cnTradNoticeTitle,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announname`)
                          .d('公告名稱'),
                      }),
                    }]
                  })(
                    <Input placeholder='請輸入' disabled={flag === 2 || !isDisabled}
                      onChange={() => this.changeNoticeList()}
                    // onChange={() => this.state.noticeList.cnTradNoticeTitle = getFieldValue('cnTradNoticeTitle')}
                    />
                  )}
                </Form.Item>
                <Form.Item label="報名時間:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpStartTime', {
                    initialValue: signUpStartTime && moment(signUpStartTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.registrationtimetraditional`)
                          .d('報名時間'),
                      }),
                    }]
                  })(
                    <DatePicker placeholder='請選擇' format="YYYY-MM-DD HH:mm" disabled={flag === 2 || !isDisabled}
                      onChange={e => this.onChangeStart(e)} />
                  )}
                </Form.Item>
                <Form.Item label="截止時間:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpEndTime', {
                    initialValue: signUpEndTime && moment(signUpEndTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.deadlinetraditional`)
                          .d('截止時間'),
                      }),
                    }]
                  })(
                    <DatePicker placeholder='請選擇' format="YYYY-MM-DD HH:mm:ss" disabled
                      onChange={e => this.onChangeLast(e)} />
                  )}
                </Form.Item>
                <Form.Item label="公告內容：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnTradNoticeContent', {
                    initialValue: cnTradNoticeContent,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announcontent`)
                          .d('公告內容'),
                      }),
                    }]
                  })(
                    <div className={styles[flag === 2 || !isDisabled ? 'tinymacClass' : '']}>
                      <StaticTextEditor
                        key='mulity'
                        content={cnTradNoticeContent || ''}
                        onRef={staticTextEditor => {
                          this.staticTextEditor = staticTextEditor;
                        }}
                        onEditChange={this.onEditChange}
                        newContent='mulity'
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
              <TabPane tab="English" key="3">
                <Form.Item label="Announ name：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('enNoticeTitle', {
                    initialValue: enNoticeTitle,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announname`)
                          .d('Announ Name'),
                      }),
                    }]
                  })(
                    <Input placeholder='Please enter' disabled={flag === 2 || !isDisabled}
                      onChange={() => this.changeNoticeList()}
                    // onChange={() => this.state.noticeList.enNoticeTitle = getFieldValue('enNoticeTitle')}
                    />
                  )}
                </Form.Item>
                <Form.Item label="Start time:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpStartTime', {
                    initialValue: signUpStartTime && moment(signUpStartTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.registrationtime`)
                          .d('Registration Time'),
                      }),
                    }]
                  })(
                    <DatePicker placeholder='Please select' format="YYYY-MM-DD HH:mm" disabled={flag === 2 || !isDisabled}
                      onChange={e => this.onChangeStart(e)} />
                  )}
                </Form.Item>
                <Form.Item label="End time:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpEndTime', {
                    initialValue: signUpEndTime && moment(signUpEndTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.deadlinetraditional`)
                          .d('Deadline'),
                      }),
                    }]
                  })(
                    <DatePicker placeholder='Please select' format="YYYY-MM-DD HH:mm:ss" disabled
                      onChange={e => this.onChangeLast(e)} />
                  )}
                </Form.Item>
                <Form.Item label="Announ content:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('enNoticeContent', {
                    initialValue: enNoticeContent,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announcontent`)
                          .d('Announ content'),
                      }),
                    }]
                  })(
                    <div className={styles[flag === 2 || !isDisabled ? 'tinymacClass' : '']}>
                      <StaticTextEditor
                        key='english'
                        content={enNoticeContent || ''}
                        onRef={staticTextEditor => {
                          this.staticTextEditor = staticTextEditor;
                        }}
                        onEditChange={this.onEditChange}
                        newContent='english'
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
            </Tabs>
          </LocaleProvider>
        </Content>
        {finallyIsView && <div className={styles['approval-btn']} >{this.generateBtns(true)}</div>}
      </Fragment>
    );
  }
}
EditReleaseNotices = Form.create({})(EditReleaseNotices);
