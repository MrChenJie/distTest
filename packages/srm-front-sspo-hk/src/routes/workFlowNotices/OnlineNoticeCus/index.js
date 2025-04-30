/**
 * index.js - 发布公告发起致远审批
 * @date: 2023-10-12
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusTabs from '_cus_components/CusTabs';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusNotification from '_cus_components/CusNotification';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { SRM_BID } from '@/common/config';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import request from 'utils/request';
import { getCurrentOrganizationId, getDateTimeFormat, getCurrentUser } from 'utils/utils';
import styles from './index.less';
import './index.less';
import StaticTextEditor from './StaticTextEditor';
import formatterCollections from 'utils/intl/formatterCollections';
import querystring from 'querystring';
import CusSpin from '_cus_components/CusSpin';

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
      editorKey: uuid(),
      noticeList: [],
      approvalRequestButtonVOList: [], // 接收按钮信息
      preChecking: false,
      visible: false,
      isDisabled: false,
      creatTime: this.props.contractMaintain.noticeLists.signUpStartTime || '', // 更改时间格式前进行保存新建时间
      endTime: this.props.contractMaintain.noticeLists.signUpEndTime || '', // 更改时间格式前进行保存截止时间
      noticeId: '', // 用于第一次保存后再次保存作为参数
      noticeState: '', // 公告状态
      newProId: '',
      packageName: '',
    };
  }
  componentDidMount() {
    this.getNoticeListContent();
    this.fetchEnum(); // 查询值集
    setTimeout(() => {
      this.getBpmWork();
      let editorContainer = document.getElementsByTagName('iframe')
      if (editorContainer.length > 0) {
        for (let i = 0; i < editorContainer.length; i++) {
          const editorContainerDoc = editorContainer[i].contentDocument || editorContainer[i].contentWindow.document
          let head = editorContainerDoc?.querySelector('head');
          // 创建一个style元素，并将其添加到head元素中
          let style = editorContainerDoc?.createElement('style');
          head?.appendChild(style);
          // 用于存储 CSS 规则的数组
          const cssRules = [
            {
              selector: '::-webkit-scrollbar-track-piece',
              styles: {
                'background-color': 'transparent',
                'border-radius': '4px'
              }
            },
            {
              selector: '::-webkit-scrollbar-thumb',
              styles: {
                // 'background-color': '#dee0e3',
                'border-radius': '4px',
                'background-color': 'transparent',
              }
            },
            {
              selector: '::-webkit-resizer, ::-webkit-scrollbar-corner',
              styles: {
                'background-color': 'transparent'
              }
            },
            {
              selector: '::-webkit-scrollbar',
              styles: {
                width: '8px',
                height: '8px',
                'background-color': 'transparent',
              }
            },
          ]
          // 将 CSS 规则转换为文本
          const cssText = cssRules.map((rule) => {
            const styles = Object.entries(rule.styles).map(([key, value]) => `${key}: ${value}`).join('; ');
            return `${rule.selector} { ${styles} }`;
          }).join('\n');
          // 创建一个文本节点，用于插入多个 CSS 规则
          const cssTextNode = editorContainerDoc?.createTextNode(cssText);
          // 将文本节点添加到 style 元素中
          style?.appendChild(cssTextNode);
        }
      }
    }, 1000)
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

  // 致远调用参数&流程
  @Bind()
  getBpmWork() {
    const { location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { noticeId, formRecordId } = routerParams;
    const { packageName } = this.state;
    top?.postMessage({
      hasListener: true,
    }, '*');
    window.addEventListener('message', (e) => {
      console.log('监听的message', e)
      if(e.data.messageType ==='GET_FORM_DATA') {
        if(['SEND', 'AGREE', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          this.saveNotice((params) => {
            console.log('保存后的参数', params)
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  // 阻止页面关闭
                    preventClose: !['SEND', 'AGREE'].includes(e.data.submitType)
                },
                //表单数据放这里
                formData: {
                  formRecordId: params[0].noticeId || formRecordId,//表单记录id（Long） 
                  caseSender: getCurrentUser().loginName,
                  processName: intl.get('bid.bidcommon.view.title.Anap', {
                    name: packageName || params[0].packageName
                  }).d(`发布公告申请-${packageName || params[0].packageName}`), //待办流程名称
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url);
            }
          });
        } else {
          this.saveNotice((params) => {
            console.log('保存后的参数', params)
            if(params) {
              top?.postMessage({
                success: true, //传true
                submitType: e.data.submitType,//将此字段值回传
                messageType: e.data.messageType, //获取表单数据消息
                actionInfo: {
                  // 阻止页面关闭
                    preventClose: e.data.messageType === 'PROCESS_SHOW'
                },
                //表单数据放这里
                formData: {
                  formRecordId: params[0].noticeId || formRecordId,//表单记录id（Long） 
                  caseSender: getCurrentUser().loginName,
                  processName: intl.get('bid.bidcommon.view.title.Anap', {
                    name: packageName || params[0].packageName
                  }).d(`发布公告申请-${packageName || params[0].packageName}`), //待办流程名称
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url);
            }
          })
        }
      }
    })
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
    // const ifram = document.querySelector('iframe');
    // const iframSrc = ifram.src;
    // const iframRouter = new URL(iframSrc);
    const { location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { noticeId, formRecordId, milestoneId, caseId, noticeState, permissionType, deadline } = routerParams;
    console.log('noticeId', noticeId)
    console.log('formRecordId', formRecordId)
    console.log('caseId', caseId)
    console.log('permissionType', permissionType)
    console.log('deadline', deadline, dayjs.unix(deadline).format('YYYY-MM-DD HH:mm:ss'))
    if ((noticeId || formRecordId) !== undefined) {
        // 这里的id是路由上自己的单据id
      if (caseId) {
        request(`${SRM_BID}/v1/${organizationId}/bid-notices/${formRecordId || noticeId}`, {
          method: 'GET'
        }
        ).then((res) => {
          this.setState({
            editorKey: uuid(),
            noticeList: res,
            creatTime: res.signUpStartTime,
            endTime: res.signUpEndTime,
            noticeId: res.noticeId,
            noticeState: res.noticeState,
            newProId: res.proId,
            packageName: res.packageName,
          })
          if (res.proId && res.proId === (noticeId || formRecordId)) {
            this.isHaveTime();
          }
          console.log('noticeState', res.noticeState)
          // permissionType 发送&知会&会签&审批时
          if(['SEND','APPROVE', 'NOTICE', 'JOINTLY', 'COLLABORATION'].includes(permissionType)) {
            //如果是退回或者保存的时候，isDisabled=true可以编辑，==============为什么等于true，因为下面的输入框是取反的
            if(permissionType === 'SEND' && res.noticeState === 'rough_draft') {
              this.setState({ isDisabled: true })
            } else {
              this.setState({ isDisabled: false })
            }
          } else {
            this.setState({ isDisabled: true })
          }
        })
      } else {
        request(`${SRM_BID}/v1/${organizationId}/bid-notices/getInitNoticeInfo/${noticeId || formRecordId}`, {
          method: 'GET',
          query: {
            deadline: dayjs.unix(deadline).format('YYYY-MM-DD HH:mm:ss')
          }
        }
        ).then((res) => {
          this.setState({
            editorKey: uuid(),
            noticeList: res,
            creatTime: res.signUpStartTime,
            endTime: res.signUpEndTime,
            noticeId: res.noticeId,
            newProId: res.noticeId,
            isDisabled: true,
          })
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
  }
  @Bind
  onChangeLast(e) {
    this.setState({
      endTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    this.setState({
      signUpEndTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss')
    })
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
    const { dispatch, match, form, location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { formRecordId, milestoneId } = routerParams;
    const { noticeList, creatTime, endTime, noticeId } = this.state;
    if (creatTime < endTime) {
      form.validateFields((err, fieldsValue) => {
        if (isEmpty(err)) {
          if (noticeList.cnSimpleNoticeContent !== '' || noticeList.cnTradNoticeContent !== '' || noticeList.enNoticeContent !== '') {
            fieldsValue.signUpStartTime = creatTime;
            fieldsValue.signUpEndTime = endTime;
            fieldsValue.noticeId = noticeId;
            fieldsValue.proId = this.state.newProId ? this.state.newProId : routerParams?.noticeId || formRecordId;
          } else {
            fieldsValue.signUpStartTime = creatTime;
            fieldsValue.signUpEndTime = endTime;
            fieldsValue.noticeId = noticeId;
            fieldsValue.proId = this.state.newProId ? this.state.newProId : routerParams?.noticeId || formRecordId
          }
          fieldsValue.milestoneId = 0
          dispatch({
            type: 'contractMaintain/editNotices',
            payload: [fieldsValue],
          }).then((res) => {
            // if (res && res.failed) {
            //   return CusNotification.error({ message: res.message, closable: false })
            // }
            if (res) {
              if (typeof callback === 'function') {
                this.setState({ noticeId: res[0].noticeId })
                callback(res);
              } else {
                CusNotification.success({
                  message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                });
                this.setState({ noticeId: res[0].noticeId })
              }
            }
          });
        } else {
          setTimeout(() => {
            if (err.cnSimpleNoticeContent || err.cnSimpleNoticeTitle) {
              CusNotification.error({
                message: intl.get('bid.bidcommon.view.message.bulletinalert1')
              });
            }
          }, 200)
          setTimeout(() => {
            if (err.cnTradNoticeContent || err.cnTradNoticeTitle) {
              CusNotification.error({
                message: intl.get('bid.bidcommon.view.message.bulletinalert2')
              });
            }
          }, 400)
          setTimeout(() => {
            if (err.enNoticeContent || err.enNoticeTitle) {
              CusNotification.error({
                message: intl.get('bid.bidcommon.view.message.bulletinalert3')
              });
            }
          }, 600)
        }
      })
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

  render() {
    const {
      match,
      form = {},
      editNoticesLoading,
      location,
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { state } = routerParams;
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
      noticeState,
    } = noticeList;
    // editFlag=0里程碑跳过来(可编辑)。editFlag=1查看公告跳过来编辑(可编辑)。editFlag=2查看公告跳过来查看(禁止编辑)
    const tabItems = [
      {
        key: '0',
        label: '简体',
        forceRender: true,
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
                    disabled={!isDisabled}
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
                        .get(`bid.announcement.view.title.registrationtime`)
                        .d('报名时间'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='请选择'
                    style={{ width: '98%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={!isDisabled}
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
              <Form.Item label="截止报名时间" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: signUpEndTime ? dayjs(signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.bidcommon.view.message.Enti`)
                        .d('截止报名时间'),
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
                  !isDisabled ?
                    <StaticTextEditor
                      key='chinese'
                      loading={editNoticesLoading}
                      content={cnSimpleNoticeContent || ''}
                      onRef={staticTextEditor => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      onEditChange={this.onEditChange}
                      newContent='chinese'
                      isDisabled={true}
                    />
                    :
                  // <div className={styles[!isDisabled ? 'tinymacClass' : '']}>
                    <StaticTextEditor
                      key='chinese1'
                      loading={editNoticesLoading}
                      content={cnSimpleNoticeContent || ''}
                      onRef={staticTextEditor => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      onEditChange={this.onEditChange}
                      newContent='chinese'
                    />
                  // </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </>
      },
      {
        key: '1',
        label: '繁體',
        forceRender: true,
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
                    disabled={!isDisabled}
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
                        .get(`bid.announcement.view.title.registrationtime`)
                        .d('報名時間'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='請選擇'
                    style={{ width: '98%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={!isDisabled}
                    onChange={e => this.onChangeStart(e)}
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止報名時間:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: signUpEndTime ? dayjs(signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.bidcommon.view.message.Enti`)
                        .d('截止報名時間'),
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
                  !isDisabled ?
                    <StaticTextEditor
                      key='mulity'
                      content={cnTradNoticeContent || ''}
                      onRef={staticTextEditor => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      onEditChange={this.onEditChange}
                      newContent='mulity'
                      isDisabled={true}
                    />
                    :
                    <StaticTextEditor
                      key='mulity1'
                      content={cnTradNoticeContent || ''}
                      onRef={staticTextEditor => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      onEditChange={this.onEditChange}
                      newContent='mulity'
                    />
                )}
              </Form.Item>
            </Col>
          </Row>
        </>
      },
      {
        key: '2',
        label: 'English',
        forceRender: true,
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="Announ na-me" className={styles['nativeLable']}>
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
                    disabled={!isDisabled}
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
                        .get(`bid.announcement.view.title.registrationtime`)
                        .d('Registration Time'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='Please select'
                    style={{ width: '98%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={!isDisabled}
                    onChange={e => this.onChangeStart(e)}
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End Time:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: signUpEndTime ? dayjs(signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.bidcommon.view.message.Enti`)
                        .d('End Time'),
                    }),
                  }]
                })(
                  <CusDatePicker placeholder='Please select' disabled style={{ width: '98%' }} format={dateTimeFormat} />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Announ co-ntent" className={styles['nativeLable']}>
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
                  !isDisabled ?
                    <StaticTextEditor
                      key='english'
                      content={enNoticeContent || ''}
                      onRef={staticTextEditor => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      onEditChange={this.onEditChange}
                      newContent='english'
                      isDisabled={true}
                    />
                    :
                    <StaticTextEditor
                      key='english1'
                      content={enNoticeContent || ''}
                      onRef={staticTextEditor => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      onEditChange={this.onEditChange}
                      newContent='english'
                    />
                )}
              </Form.Item>
            </Col>
          </Row>
        </>
      }
    ]
    return (
      <PageWrapper loading={generalRequestLoading}>
        <div className={styles.marginLeft0} style={{margin: '-16px'}}>
          <Form className="customize-form">
            <CusTabs
              // destroyInactiveTabPane={true}
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
    );
  }
}
EditReleaseNoticesCus = Form.create({})(EditReleaseNoticesCus);
