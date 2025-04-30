/**
 * index.js - 发布公告发起MIP审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusTabs from '_cus_components/CusTabs';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusNotification from '_cus_components/CusNotification';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import moment from 'moment';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { SRM_BID } from '@/common/config';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import request from 'utils/request';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import styles from './index.less';
import './index.less';
import StaticTextEditor from './StaticTextEditor';
import formatterCollections from 'utils/intl/formatterCollections';

const organizationId = getCurrentOrganizationId();
const dateTimeFormat = getDateTimeFormat();

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

export default class EditReleaseNoticesCus extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.staticTextEditor = React.createRef();
    this.state = {
      itemKey: '0',
      requestId: 0,
      editorKey: uuid(),
      noticeList: [],
      poHeadersId: match.params,
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
    };
    this.cusApprovalBtns = React.createRef();
  }
  componentDidMount() {
    this.getNoticeListContent();
    this.fetchEnum(); // 查询值集
    // 该方法是用于 goToClose 页面调用的，用于关闭modal框的方法
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrder/updateState',
      payload: {
        poHeader: {}, // 头信息
      },
    });
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
        CusNotification.error({
          message: intl.get(`bid.bidcommon.view.message.edditannouncement`).d('请填写技术及商务文件递交时间'),
        });
      }
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
            noticeState: res.noticeState,
            newProId: res.proId,
          })
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
            this.setState({ isDisabled: false })
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
      creatTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    this.setState({
      signUpStartTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss')
    })
    // this.state.noticeList.signUpStartTime = moment(e).format('YYYY-MM-DD HH:mm:ss')
  }
  @Bind
  onChangeLast(e) {
    this.setState({
      endTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    this.setState({
      signUpEndTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss')
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
    if (creatTime < endTime) {
      if (match.params && match.params.milestoneId === 'milestoneId') {
        noticeList.milestoneId = 0 // 里程碑id
      } else {
        noticeList.milestoneId = match.params.milestoneId // 里程碑id
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
              if (res && res.failed) {
                return CusNotification.error({ message: res.message, closable: false })
              }
              if (res) {
                if (typeof callback === 'function') {
                  callback();
                } else {
                  CusNotification.success({
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
        CusNotification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl
              .get(`bid.announcement.view.title.announname`)
              .d('公告名称')
          })
        });
      }
    } else {
      CusNotification.error({
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

  // MIP审批明细查询
  @Bind
  approvalProcess(getMipId) {
    const { dispatch } = this.props;
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
          approvalRequestButtonVOList: res.approvalRequestButtonVOList,
          generalRequestLoading: false,
        })
        // 审批中和已完成状态禁止编辑
        if (noticeState === 'under_approval' || noticeState === 'completed') {
          this.setState({ isDisabled: false })
        } else {
          this.setState({ isDisabled: true })
        }
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
  generateBtns(isEdit) {
    const { approvalRequestButtonVOList = [], isDisabled } = this.state;
    // 向提价审批前面插入保存按钮
    if (isDisabled) {
      const saveButton = {
        nameE: intl.get('hzero.common.button.save').d('保存'),
        name: intl.get('hzero.common.button.save').d('保存'),
        buttonOrder: 15,
        buttonKey: 'saveName',
        disabled: !isEdit,
      };
      if (!approvalRequestButtonVOList.find((item) => item.buttonKey === 'saveName') && isEdit) {
        approvalRequestButtonVOList.push(saveButton);
      }
    }
    const updatedList = approvalRequestButtonVOList.map(item => {
      if (item.buttonKey === 'forwardName') {
        item.buttonOrder = '16'
      }
      if (item.buttonKey === 'takingopinionsName') {
        item.buttonOrder = '19'
      }
      return item;
    });
    return updatedList
      .sort((one, two) => {
        return one.buttonOrder - two.buttonOrder;
      });
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

  @Bind
  openModal(record) {
    if (record.buttonKey === 'submitName') {
      const { form } = this.props;
      let validateResult = true;
      let errMessageList = [];
      const { validateFieldsAndScroll = (e) => e } = form;
      validateFieldsAndScroll((err) => {
        if (err) {
          for (let child in err) {
            errMessageList.push(err[child].errors[0].message);
          }
          validateResult = false;
        };
      });
      if (validateResult) {
        this.saveNotice(() => {
          this.cusApprovalBtns?.current?.openModal({ ...record })
        })
      } else {
        const description = (
          <div>
            {errMessageList.map((item) => (
              <p style={{ marginBottom: '0px' }}>{item}</p>
            ))}
          </div>
        );
        CusNotification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: description,
        });
      }
    } else if (record.buttonKey === 'saveName') {
      this.saveNotice();
    } else {
      this.cusApprovalBtns?.current?.openModal({ ...record });
    }
  }

  @Bind
  fetchData(times) {
    const { isRequestid } = this.state;
    this.getNoticeListContent();
    this.setState({
      generalRequestLoading: true,
    });
    // 去查询审批数据
    this.requestRound(isRequestid, times);
  }

  @Bind
  requestRound(targetHeaderId, times = 30, nextTime = 0) {
    const { isRequestid } = this.state;
    if (times <= 0) {
      this.setState({
        generalRequestLoading: false,
      });
      return;
    }
    this.timeout = setTimeout(() => {
      // 根据requestType去查询获得通用审批的数据内容，设置定时器，在结束上一个请求的2s之后再执行下一次的。
      this.approvalProcess(isRequestid);
    }, nextTime);
  }

  render() {
    const {
      match,
      form = {},
      location: { state: { _back } = {} },
      editNoticesLoading,
    } = this.props;
    const { noticeList = [], isDisabled, itemKey, generalRequestLoading = false } = this.state;
    const { getFieldDecorator } = form;
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
    let flag = match.params.milestoneId;
    // editFlag=0里程碑跳过来(可编辑)。editFlag=1查看公告跳过来编辑(可编辑)。editFlag=2查看公告跳过来查看(禁止编辑)
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    let isHaveNoticeProId = match.params.milestoneId === '0' ? `${isPub ? '/pub' : ''}/sspo/online-purchase/notices2/${this.state.noticeList.proId}` : `${isPub ? '/pub' : ''}/sspo/online-purchase/notices2`;
    const tabItems = [
      {
        key: '0',
        label: '简体',
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="公告名称：" className={styles['nativeLable']}>
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
                  <CusInput
                    placeholder='请输入'
                    disabled={flag === 2 || !isDisabled}
                    style={{ width: '99%' }}
                    // onChange={() => this.state.noticeList.cnSimpleNoticeTitle = getFieldValue('cnSimpleNoticeTitle')} />
                    onChange={() => this.changeNoticeList()}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="报名时间" className={styles['nativeLable']}>
                {getFieldDecorator('signUpStartTime', {
                  initialValue: signUpStartTime ? dayjs(signUpStartTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.registrationtimeNew`)
                        .d('报名时间'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='请选择'
                    style={{ width: '98%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={flag === 2 || !isDisabled}
                    // disabledDate={(currentDate) => {
                    //   return (
                    //     dayjs.isDayjs(getFieldValue('estimateSubmitDateEnd')) &&
                    //     currentDate &&
                    //     currentDate.isAfter(getFieldValue('estimateSubmitDateEnd'))
                    //   );
                    // }}
                    onChange={e => this.onChangeStart(e)}
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止时间" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: signUpEndTime ? dayjs(signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.deadlinetraditionalNewJT`)
                        .d('截止时间'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='请选择'
                    disabled
                    style={{ width: '98%' }}
                    format={dateTimeFormat}
                  />
                  // <DatePicker format="YYYY-MM-DD HH:mm:ss" disabled
                  //   onChange={e => this.onChangeLast(e)} />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="公告内容：" className={styles['nativeLable']}>
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
                  <div className={styles[flag === 2 || !isDisabled ? 'tinymacClass' : '']}
                    style={{ width: '99%' }}
                  >
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
            </Col>
          </Row>
        </>
      },
      {
        key: '1',
        label: '繁體',
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="公告名稱：" className={styles['nativeLable']}>
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
                  <CusInput
                    placeholder='請輸入'
                    disabled={flag === 2 || !isDisabled}
                    style={{ width: '99%' }}
                    onChange={() => this.changeNoticeList()}
                  // onChange={() => this.state.noticeList.cnTradNoticeTitle = getFieldValue('cnTradNoticeTitle')} 
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="報名時間:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpStartTime', {
                  initialValue: signUpStartTime ? dayjs(signUpStartTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.registrationtimetraditionalNew`)
                        .d('報名時間'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='請選擇'
                    style={{ width: '98%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={flag === 2 || !isDisabled}
                    onChange={e => this.onChangeStart(e)}
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止時間:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: signUpEndTime ? dayjs(signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.deadlinetraditionalNewFT`)
                        .d('截止時間'),
                    }),
                  }]
                })(
                  <CusDatePicker placeholder='請選擇' disabled style={{ width: '98%' }} format={dateTimeFormat} />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="公告內容：" className={styles['nativeLable']}>
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
                  <div className={styles[flag === 2 || !isDisabled ? 'tinymacClass' : '']}
                    style={{ width: '99%' }}
                  >
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
            </Col>
          </Row>
        </>
      },
      {
        key: '2',
        label: 'English',
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="Announ name：" className={styles['nativeLable']}>
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
                  <CusInput
                    placeholder='Please enter'
                    disabled={flag === 2 || !isDisabled}
                    style={{ width: '99%' }}
                    onChange={() => this.changeNoticeList()}
                  // onChange={() => this.state.noticeList.enNoticeTitle = getFieldValue('enNoticeTitle')} 
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Start time:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpStartTime', {
                  initialValue: signUpStartTime ? dayjs(signUpStartTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.registrationtimeNew`)
                        .d('Registration Time'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='Please select'
                    style={{ width: '98%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={flag === 2 || !isDisabled}
                    onChange={e => this.onChangeStart(e)}
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End time:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: signUpEndTime ? dayjs(signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.deadlinetraditionalNewEN`)
                        .d('Deadline'),
                    }),
                  }]
                })(
                  <CusDatePicker placeholder='Please select' disabled style={{ width: '98%' }} format={dateTimeFormat} />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Announ content:" className={styles['nativeLable']}>
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
                  <div className={styles[flag === 2 || !isDisabled ? 'tinymacClass' : '']}
                    style={{ width: '99%' }}
                  >
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
            </Col>
          </Row>
        </>
      }
    ]
    return (
      <>
        <PageWrapper loading={generalRequestLoading}>
          <div className={styles.marginLeft0}>
            <Form className="customize-form">
              <CusTabs
                defaultActiveKey={itemKey}
                items={tabItems}
                moreIcon={false}
                onChange={(collapseKeys) => {
                  this.setState({ itemKey: collapseKeys });
                }}
              />
            </Form>
          </div>
        </PageWrapper>
        <CusApprovalButtons
          approvalRequestButtonVOList={this.generateBtns(true)}
          openModal={this.openModal}
          ref={this.cusApprovalBtns}
          onOk={() => this.fetchData(1)}
        />
      </>
    );
  }
}
EditReleaseNoticesCus = Form.create({})(EditReleaseNoticesCus);
