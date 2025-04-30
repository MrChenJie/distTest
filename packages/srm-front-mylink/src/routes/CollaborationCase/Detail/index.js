import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse, Form } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import CusRequest from '_cus_utils/request';
import { uniqBy } from 'lodash';
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentUser,
  isTenantRoleLevel,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFile } from 'hzero-front/lib/services/api';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import DetailList from './DetailList';
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';
import CusTabs from '_cus_components/CusTabs';
import { init } from 'echarts/lib/echarts';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();
let isSave = true
let flag = false // 必填校验
let basicFlag = true // 基本信息校验
let isFirstFlag = true

@formatterCollections({ code: ['spfmhk.mylink'] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.LINE_BIDRULE', 'HKTB.ACTIVITY_STATUS'])
@connect(({ loading, CollaborationCaseModal, CollaborationModeModal }) => ({
  CollaborationCaseModal,
  CollaborationModeModal,
  qeuryLoading: loading.effects['CollaborationCaseModal/queryDetail'] ||
    loading.effects['CollaborationCaseModal/addHistory'],
  detailList: CollaborationCaseModal.detailList,
}))

export default class Detail extends React.Component {

  form = React.createRef();
  form0 = React.createRef();
  form1 = React.createRef();
  form2 = React.createRef();

  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { id, formRecordId, caseRecordId = null, refCaseId = null, refCaseName = null } =
      queryString.parse(location?.search?.substr(1)) || {};
    console.log(queryString.parse(location?.search?.substr(1)))
    this.state = {
      formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : id,
      isPub,
      activeKey: ['form', 'table'],
      templateCode: 'mylink_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      itemKey: '0',
      fileList: [],
      fileUuid: uuidv4(),
      caseRecordId,
      refCaseId,
      refCaseName,
    };
  }

  componentDidMount() {
    console.log(this.state.formRecordId)
    const { match } = this.props;
    if (this.state.formRecordId) {
      this.queryDetail(this.state.formRecordId);
      // this.queryListDetail(_, this.state.formRecordId);
    } else {
      if (this.state.refCaseName) { 
        this.getModeName(this.state.refCaseId)
      } else {
        this.getInfo(this.state.refCaseId)
      }
    }
    // if (this.state.refCaseId && match.params.type !== 'create') this.getInfo(this.state.refCaseId)
    // if (this.state.refCaseName) this.getModeName(this.state.refCaseId)
    this.getBpmWork();
    // this.beforUpload({
    //   tenantId: getCurrentOrganizationId(),
    //   bucketName: "mylink",
    //   attachmentUUID: this.state.fileUuid,
    // })
  }

  componentWillUnmount() {
  }

  queryDetail = (formRecordId) => {
    const { dispatch, match } = this.props;
    dispatch({
      type: match.params.type == 'create' ? 'CollaborationCaseModal/queryDetail' : 'CollaborationCaseModal/queryDetailHistory',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.basicForm?.current?.setFieldsValue({
          applicationNo: res?.partnerCase?.applicationNo,
          applicant: res?.partnerCase?.applicant,
          applicantDate: res?.partnerCase?.applicantDate,
          cooperationMode: res?.partnerCase?.cooperationMode,
          sort: res?.partnerCase?.sort,
          effectiveOrNot: res?.partnerCase?.effectiveOrNot,
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
          applicationStatusMeaning: res?.partnerCase?.applicationStatusMeaning
        })
        this.form0?.current?.setFieldsValue({
          caseTitle: res?.caseTitle?.find(item => item.lang === "zh_CN")?.description,
          caseDescription: res?.caseDescription?.find(item => item.lang === "zh_CN")?.description,
          caseDescriptionList: res?.caseDescription?.filter(item => item.lang === "zh_CN"),
          caseTitleList: res?.caseTitle?.filter(item => item.lang === "zh_CN"),
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.form1?.current?.setFieldsValue({
          caseTitle: res?.caseTitle?.find(item => item.lang === "zh_TW")?.description,
          caseDescription: res?.caseDescription?.find(item => item.lang === "zh_TW")?.description,
          caseDescriptionList: res?.caseDescription?.filter(item => item.lang === "zh_TW"),
          caseTitleList: res?.caseTitle?.filter(item => item.lang === "zh_TW"),
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.form2?.current?.setFieldsValue({
          caseTitle: res?.caseTitle?.find(item => item.lang === "en_US")?.description,
          caseDescription: res?.caseDescription?.find(item => item.lang === "en_US")?.description,
          caseDescriptionList: res?.caseDescription?.filter(item => item.lang === "en_US"),
          caseTitleList: res?.caseTitle?.filter(item => item.lang === "en_US"),
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.setState({
          headerInfo: res,
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.beforUpload({
          tenantId: getCurrentOrganizationId(),
          bucketName: "mylink",
          attachmentUUID: res?.partnerCase?.fileUuid || uuidv4()
        })
      }
    });
  };

  queryListDetail = (page = {}, formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'CollaborationCaseModal/queryListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log('商品详情', res)
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'CollaborationCaseModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            productDetailPagination: pagination,
          },
        });
      }
    });
  }


  @Bind()
  handleAddLine = () => {
    const { dispatch, CollaborationCaseModal } = this.props;
    const { productDetailSource = [] } = CollaborationCaseModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const newDataSource = [
      ...productDetailSource,
      {
        rowKey: uuidv4(),
        quoteRule: basicForm?.isFullQuote === 'Y' ? 'Bundled' : 'Singleton',
        _status: 'create',
      },
    ]
    // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
    dispatch({
      type: 'CollaborationCaseModal/updateState',
      payload: {
        productDetailSource: newDataSource,
        // productDetailPagination: newPagination,
      },
    });
  }

  @Bind()
  handleSave = (callback) => {
    const { dispatch, CollaborationCaseModal } = this.props;
    const { productDetailSource } = CollaborationCaseModal;
    const { headerInfo } = this.state;
    const validateData = getEditTableData(productDetailSource, ['rowKey']);
    const isUniqBy = uniqBy(validateData, item => `${item.productCode}`);
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        if (Array.isArray(validateData) && validateData.length === 0) {
          return CusNotification.warning({
            message: intl.get('spfmhk.mylink.view.verifytip.addproduct').d('请添加商品行')
          })
        }
        if (isUniqBy.length < validateData.length) {
          return CusNotification.warning({
            message: intl.get('spfmhk.mylink.view.verifytip.Product').d('存在相同商品，请检查')
          })
        }
        // 先保存基本信息，把id取到放到列表
        dispatch({
          type: 'CollaborationCaseModal/saveActiveInfo',
          payload: {
            ...headerInfo,
            ...values,
            quoteEndTime: dayjs(values.quoteEndTime).format(DEFAULT_DATETIME_FORMAT),
            actStartTime: dayjs(values.actStartTime).format(DEFAULT_DATETIME_FORMAT)
          },
        }).then(info => {
          if (info) {
            this.queryDetail(info?.id);
            this.setState({
              headId: info?.id
            })
            dispatch({
              type: 'CollaborationCaseModal/saveProductInfo',
              payload: {
                list: validateData.map((item) => ({
                  ...item,
                  currency: 'HKD',
                  refHeadId: info?.id
                }))
              }
            }).then((res) => {
              if (res) {
                if (typeof callback === 'function') {
                  callback({
                    formRecordId: info?.id,
                    subject: '标题',
                    info,
                  })
                }
                this.queryListDetail(_, info?.id);
              }
            })
          }
        });
      }
    })
  }

  payUpload = (payFileList = []) => {
    const { CollaborationCaseModal, dispatch } = this.props;
    const { productDetailSource = [] } = CollaborationCaseModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    CusRequest(`/mylink/v1/${organizationId}/cmhk-act-mats/importMatExcelCheck`, {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }).then((res) => {
      if (res) {
        const response = JSON.parse(res);
        const data = (response?.data || [])?.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          quoteRule: basicForm?.isFullQuote === 'Y' ? 'Bundled' : 'Singleton',
          _status: 'create',
        }));
        const newDataSource = [
          ...productDetailSource,
          ...data,
        ]
        // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
        dispatch({
          type: 'CollaborationCaseModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            // productDetailPagination: newPagination,
          }
        })
        this.setState({
          importUploading: false,
          productVisible: false,
        }, () => {
          if (response.msg) {
            CusNotification.error({
              message: response.msg,
            });
          }
        });
      }
    })
  }

  beforUpload = (params) => {
    console.log('beforUpload')
    const { itemKey } = this.state
    cusRequest(
      `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}files/${params.attachmentUUID
      }/file`,
      {
        method: 'GET',
        query: params,
      }
    ).then(res => {
      this.form0.current.setFieldsValue({
        fileList: res
      })
      this.form1.current.setFieldsValue({
        fileList: res
      })
      this.form2.current.setFieldsValue({
        fileList: res
      })
      this.setState({
        fileList: res
      })
    });
  }

  saveTabs = (key) => {
    const { itemKey, headerInfo, refCaseId, fileUuid } = this.state
    const newItemKey = key || itemKey
    const { dispatch, match } = this.props;
    const lang = newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
    console.log('headerInfo', this.basicForm?.current.getFieldsValue(),)
    dispatch({
      type: match.params.type == 'create' ? 'CollaborationCaseModal/saveInfo' : 'CollaborationCaseModal/saveInfoHistory',
      // 判断是否有id 确认是新增还是跟新数据
      payload: (headerInfo?.partnerCase?.partnerCaseId || headerInfo?.partnerCase?.caseRecordId) ? {
        ...headerInfo.partnerCase,
        caseDescription: [
          {
            ...this[`form${newItemKey}`].current.getFieldsValue()?.caseDescriptionList[0], // 由于跟新存在langId，需要进行赋值, 在赋值时进行筛选过滤保证保存时只存在唯一值
            lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
            description: this[`form${newItemKey}`].current.getFieldsValue()?.caseDescription,
          }
        ],
        caseTitle: [
          {
            ...this[`form${newItemKey}`].current.getFieldsValue()?.caseTitleList[0],
            lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
            description: this[`form${newItemKey}`].current.getFieldsValue().caseTitle || '',
          }
        ],
        effectiveOrNot: this.basicForm?.current.getFieldsValue()?.effectiveOrNot,
        sort: this.basicForm?.current.getFieldsValue()?.sort,
        caseId: headerInfo?.partnerCase?.caseId,
        fileUuid: fileUuid,
        // modeId: refCaseId,
      } : {
        caseDescription:
          headerInfo?.caseDescription?.length && headerInfo?.caseDescription?.filter(item => item.lang != lang)?.length ?
            [
              ...headerInfo?.caseDescription.filter(item => item.lang != lang),
              {
                description: this[`form${newItemKey}`].current.getFieldsValue()?.caseDescription,
                lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
              }
            ]
            : [
              {
                description: this[`form${newItemKey}`].current.getFieldsValue()?.caseDescription,
                lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
              }
            ],
        caseTitle: headerInfo?.caseTitle?.length && headerInfo?.caseTitle?.filter(item => item.lang != lang)?.length ? [
          ...headerInfo?.caseTitle.filter(item => item.lang != lang),
          {
            description: this[`form${newItemKey}`].current.getFieldsValue().caseTitle || '',
            lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
          }
        ] :
          [
            {
              description: this[`form${newItemKey}`].current.getFieldsValue().caseTitle || '',
              lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
            }
          ],
        effectiveOrNot: this.basicForm?.current.getFieldsValue()?.effectiveOrNot,
        sort: this.basicForm?.current.getFieldsValue()?.sort,
        caseId: headerInfo?.partnerCase?.caseId,
        refCaseId: refCaseId,
        partnerModeId: headerInfo?.partnerCase?.partnerModeId || refCaseId,
        partnerCaseId: headerInfo?.partnerCase?.partnerCaseId,
        fileUuid: fileUuid,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          formRecordId: res?.partnerCase?.partnerCaseId || res?.partnerCase?.caseRecordId,
        })
        this.queryDetail(res?.partnerCase?.partnerCaseId || res?.partnerCase?.caseRecordId)
        isSave = false
        CusNotification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功')
        })
      }
    });
    // CusNotification.success({
    //   message: intl.get('hzero.common.notification.success.save').d('保存成功')
    // })
  }

  getInfo = (e) => {
    const { dispatch } = this.props
    dispatch({
      type: 'CollaborationCaseModal/addHistory',
      payload: { id: e }
    }).then((res) => {
      if (res) {
        // this.basicForm?.current?.setFieldsValue({
        //   cooperationMode: res?.partnerCase?.cooperationMode || this.state.refCaseName,
        // })
        this.basicForm?.current?.setFieldsValue({
          applicationNo: res?.partnerCase?.applicationNo,
          applicant: res?.partnerCase?.applicant,
          applicantDate: res?.partnerCase?.applicantDate,
          cooperationMode: res?.partnerCase?.cooperationMode,
          sort: res?.partnerCase?.sort,
          effectiveOrNot: res?.partnerCase?.effectiveOrNot || 'Effective',
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
          applicationStatusMeaning: res?.partnerCase?.applicationStatusMeaning
        })
        this.form0?.current?.setFieldsValue({
          caseTitle: res?.caseTitle?.find(item => item.lang === "zh_CN")?.description,
          caseDescription: res?.caseDescription?.find(item => item.lang === "zh_CN")?.description,
          caseDescriptionList: res?.caseDescription?.filter(item => item.lang === "zh_CN"),
          caseTitleList: res?.caseTitle?.filter(item => item.lang === "zh_CN"),
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.form1?.current?.setFieldsValue({
          caseTitle: res?.caseTitle?.find(item => item.lang === "zh_TW")?.description,
          caseDescription: res?.caseDescription?.find(item => item.lang === "zh_TW")?.description,
          caseDescriptionList: res?.caseDescription?.filter(item => item.lang === "zh_TW"),
          caseTitleList: res?.caseTitle?.filter(item => item.lang === "zh_TW"),
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.form2?.current?.setFieldsValue({
          caseTitle: res?.caseTitle?.find(item => item.lang === "en_US")?.description,
          caseDescription: res?.caseDescription?.find(item => item.lang === "en_US")?.description,
          caseDescriptionList: res?.caseDescription?.filter(item => item.lang === "en_US"),
          caseTitleList: res?.caseTitle?.filter(item => item.lang === "en_US"),
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.setState({
          headerInfo: res,
          fileUuid: res?.partnerCase?.fileUuid || uuidv4(),
        })
        this.beforUpload({
          tenantId: getCurrentOrganizationId(),
          bucketName: "mylink",
          attachmentUUID: res?.partnerCase?.fileUuid || uuidv4()
        })
      }
    })
  }

  // 致远调用参数&流程
  @Bind()
  getBpmWork() {
    const { location, match } = this.props;
    const routerParams = queryString.parse(location.search.substr(1));
    const { formRecordId } = routerParams;
    console.log(formRecordId, this.state.formRecordId)
    // const { infoForm, } = resaleRequestDetail;
    top?.postMessage({
      hasListener: true,
    }, '*');
    // 保存："DRAFT_HANDLE"  不做校验
    // 发起人提交："SEND"  校验
    // 审批人提交："AGREE"  校验
    // 会签："GIVE"  校验
    // 知会："NOTICE"  校验
    // 转办：""  校验
    // 退回：""  校验
    // 撤回：""  校验
    // 注销："TERMINATION"  不做校验
    // 查看流程："PROCESS_SHOW"  不做校验
    window.addEventListener('message', (e) => {
      // const { resaleRequestDetail } = this.props;
      // const { infoForm, } = resaleRequestDetail;
      // let headerDatalist = infoForm?.current?.getFieldsValue()
      console.log('监听的message', e)
      if (e.data.messageType === 'GET_FORM_DATA') {
        if (['SEND', 'AGREE', 'DRAFT_HANDLE'].includes(e.data.submitType)) { // 保存和提交
          if (['DRAFT_HANDLE'].includes(e.data.submitType)) {
            this.saveSubmit((params) => {
              if (params) {
                if (isSave) return
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
                    formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : this.state.formRecordId,//表单记录id（Long）
                    caseSender: getCurrentUser().loginName,
                    subject: match.params.type == 'create' ? intl.get(`spfmhk.mylink.title.zhiyuan.casenew`, { CaseTitle: this.form0.current.getFieldsValue().caseTitle }) :
                      intl.get(`spfmhk.mylink.title.zhiyuan.casechange`, { CaseTitle: this.form0.current.getFieldsValue().caseTitle })
                    // title: headerDatalist?.toDoTitle,
                    // business_type: headerDatalist?.businessType || 'IDD',
                    // account_manager: ["kammyyang"]
                    // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                    //   packageName: params.packageName
                    // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                    // //下面内容为表单数据
                    // ...params,
                  }
                }, e.data.url);
              }
            })
          } else {
            this.goSubmit((params) => {
              if (params) {
                // this.saveTabs()
                if (isSave) return
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
                    formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : this.state.formRecordId,//表单记录id（Long）
                    caseSender: getCurrentUser().loginName,
                    subject: match.params.type == 'create' ? intl.get(`spfmhk.mylink.title.zhiyuan.casenew`, { CaseTitle: this.form0.current.getFieldsValue().caseTitle }) :
                      intl.get(`spfmhk.mylink.title.zhiyuan.casechange`, { CaseTitle: this.form0.current.getFieldsValue().caseTitle })
                    // title: headerDatalist?.toDoTitle,
                    // business_type: headerDatalist?.businessType || 'IDD',
                    // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                    //   packageName: params.packageName
                    // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                    // //下面内容为表单数据
                    // ...params,
                  }
                }, e.data.url);
              }
            }, e.data.submitType);
          }
        }
        else {
          if (['TERMINATION', 'PROCESS_SHOW'].includes(e.data.submitType)) {
            // this.goSave((params) => {
            //   console.log('params', params)
            //   if(params) {
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
                formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : this.state.formRecordId,//表单记录id（Long）
                caseSender: getCurrentUser().loginName,
                subject: match.params.type == 'create' ? intl.get(`spfmhk.mylink.title.zhiyuan.casenew`, { CaseTitle: this.state.headerInfo?.partnerCase?.cooperationMode }) :
                  intl.get(`spfmhk.mylink.title.zhiyuan.casechange`, { CaseTitle: this.state.headerInfo?.partnerCase?.cooperationMode })
                // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                //   packageName: params.packageName
                // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                // //下面内容为表单数据
                // ...params,
              }
            }, e.data.url);
            //   }
            // })
          } else {
            // this.goSubmit((params) => {
            //   console.log('params', params)
            //   if(params) {
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
                formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : this.state.formRecordId,//表单记录id（Long）
                caseSender: getCurrentUser().loginName,
                subject: match.params.type == 'create' ? intl.get(`spfmhk.mylink.title.zhiyuan.casenew`, { CaseTitle: this.state.headerInfo?.partnerCase?.cooperationMode }) :
                  intl.get(`spfmhk.mylink.title.zhiyuan.casechange`, { CaseTitle: this.state.headerInfo?.partnerCase?.cooperationMode })
                // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                //   packageName: params.packageName
                // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                // //下面内容为表单数据
                // ...params,
              }
            }, e.data.url);
            //   }
            // })
          }
        }
      }
    })
  }

  goSubmit = async (callback) => {
    flag = false
    basicFlag = true
    const { dispatch, CollaborationModeModal, match } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    await this.form0.current.validateFields().then((err, values) => {
    }).catch((err) => {
      this.changeFlag()
    })
    await this.form1.current.validateFields().then((err, values) => {
    }).catch((err) => { this.changeFlag() })
    await this.form2.current.validateFields().then((err, values) => {
    }).catch((err) => { this.changeFlag() })
    await this.basicForm.current.validateFields().then((err, values) => {
    }).catch((err) => {
      this.changeBasicFlag()
    })
    if (flag) {
      callback(false)
      if (basicFlag) CusNotification.error({
        message: intl.get('spfmhk.mylink.button.save.verify').d('填写三种语言'),
      });
      return
    }
    this.saveSubmit((params) => {
      callback(params)
    })
    // this.saveTabs()
    // callback(true)
  }


  saveSubmit = (callback) => {
    const { itemKey, headerInfo, refCaseId, fileUuid } = this.state
    const newItemKey = itemKey
    const { dispatch, match } = this.props;
    const lang = newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
    console.log('headerInfo', this.basicForm?.current.getFieldsValue(),)
    dispatch({
      type: match.params.type == 'create' ? 'CollaborationCaseModal/saveInfo' : 'CollaborationCaseModal/saveInfoHistory',
      // 判断是否有id 确认是新增还是跟新数据
      payload: (headerInfo?.partnerCase?.partnerCaseId || headerInfo?.partnerCase?.caseRecordId) ? {
        ...headerInfo.partnerCase,
        caseDescription: [
          {
            ...this[`form${newItemKey}`].current.getFieldsValue()?.caseDescriptionList[0], // 由于跟新存在langId，需要进行赋值, 在赋值时进行筛选过滤保证保存时只存在唯一值
            lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
            description: this[`form${newItemKey}`].current.getFieldsValue()?.caseDescription,
          }
        ],
        caseTitle: [
          {
            ...this[`form${newItemKey}`].current.getFieldsValue()?.caseTitleList[0],
            lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
            description: this[`form${newItemKey}`].current.getFieldsValue().caseTitle || '',
          }
        ],
        effectiveOrNot: this.basicForm?.current.getFieldsValue()?.effectiveOrNot,
        sort: this.basicForm?.current.getFieldsValue()?.sort,
        caseId: headerInfo?.partnerCase?.caseId,
        fileUuid: fileUuid,
        // modeId: refCaseId,
      } : {
        caseDescription:
          headerInfo?.caseDescription?.length && headerInfo?.caseDescription?.filter(item => item.lang != lang)?.length ?
            [
              ...headerInfo?.caseDescription.filter(item => item.lang != lang),
              {
                description: this[`form${newItemKey}`].current.getFieldsValue()?.caseDescription,
                lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
              }
            ]
            : [
              {
                description: this[`form${newItemKey}`].current.getFieldsValue()?.caseDescription,
                lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
              }
            ],
        caseTitle: headerInfo?.caseTitle?.length && headerInfo?.caseTitle?.filter(item => item.lang != lang)?.length ? [
          ...headerInfo?.caseTitle.filter(item => item.lang != lang),
          {
            description: this[`form${newItemKey}`].current.getFieldsValue().caseTitle || '',
            lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
          }
        ] :
          [
            {
              description: this[`form${newItemKey}`].current.getFieldsValue().caseTitle || '',
              lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
            }
          ],
        effectiveOrNot: this.basicForm?.current.getFieldsValue()?.effectiveOrNot,
        sort: this.basicForm?.current.getFieldsValue()?.sort,
        caseId: headerInfo?.partnerCase?.caseId,
        refCaseId: refCaseId,
        partnerModeId: headerInfo?.partnerCase?.partnerModeId || refCaseId,
        partnerCaseId: headerInfo?.partnerCase?.partnerCaseId,
        fileUuid: fileUuid,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          formRecordId: res?.partnerCase?.partnerCaseId || res?.partnerCase?.caseRecordId,
        })
        this.queryDetail(res?.partnerCase?.partnerCaseId || res?.partnerCase?.caseRecordId)
        isSave = false
        CusNotification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功')
        })
        callback(true)
      } else {
        callback(false)
      }
    });
    // CusNotification.success({
    //   message: intl.get('hzero.common.notification.success.save').d('保存成功')
    // })
  }

  changeFlag = () => {
    flag = true
  }

  changeBasicFlag = () => {
    flag = true
    basicFlag = false
  }

  getModeName = (id) => {
    const {
      dispatch
    } = this.props
    dispatch({
      type: 'CollaborationModeModal/queryDetail',
      payload: {
        id: id,
      },
    }).then(res => {
      if (res) {
        this.setState({
          cooperationMode: res?.partnerMode?.cooperationMode?.find(item => item.lang === "zh_CN")?.description,
          // effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          // sort: res?.partnerMode?.sort,
        })
        this.basicForm?.current?.setFieldsValue({
          cooperationMode: res?.partnerMode?.cooperationMode?.find(item => item.lang === "zh_CN")?.description,
          // effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          // sort: res?.partnerMode?.sort,
        })
      }
    })
  }

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
    } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      fileList,
      itemKey,
      fileUuid,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = headerInfo?.partnerCase?.applicationStatus && headerInfo?.partnerCase?.applicationStatus != 'Draft' || headerInfo?.partnerCase?.startUserCode && headerInfo?.partnerCase?.startUserCode != loginName;

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.form;
      },

    };

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const detailListrops = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection,
      basicForm: this.tableForm?.current.getFieldsValue(),
      fileList,
      fileUuid,
      onChange: (page) => this.queryListDetail(page, (formRecordId || headId)),
      beforUpload: this.beforUpload,
    };

    const tabItems = [{
      key: '0',
      label: '简体',
      forceRender: true,
      children: <>
        <Form ref={this.form0}>
          <Collapse
            // className="customize-collapse"
            defaultActiveKey={activeKey}
            bordered={false}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
            style={{ padding: ' 0 16px' }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.coopcase`).d('合作案例')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >

              <DetailList {...detailListrops} />
            </Panel>
          </Collapse>
        </Form>
      </>
    },
    {
      key: '1',
      label: '繁體',
      forceRender: true,
      children: <>
        <Form ref={this.form1}>
          <Collapse
            // className="customize-collapse"
            defaultActiveKey={activeKey}
            bordered={false}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
            style={{ padding: ' 0 16px' }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.coopcase`).d('合作案例')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >

              <DetailList {...detailListrops} />
            </Panel>
          </Collapse>
        </Form>
      </>
    },
    {
      key: '2',
      label: 'English',
      forceRender: true,
      children: <>
        <Form ref={this.form2}>
          <Collapse
            // className="customize-collapse"
            defaultActiveKey={activeKey}
            bordered={false}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
            style={{ padding: ' 0 16px' }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.coopcase`).d('合作案例')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >

              <DetailList {...detailListrops} />
            </Panel>
          </Collapse>
        </Form>
      </>
    }
    ]


    return (
      <PageWrapper loading={qeuryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
          style={{ paddingBottom: '16px' }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            bordered={false}
            key="form"
          >
            <BasicForm {...basicFormProps} />
          </Panel>
        </Collapse>
        <CusTabs
          defaultActiveKey={itemKey}
          activeKey={itemKey}
          items={tabItems}
          moreIcon={false}
          onTabClick={(collapseKeys) => {
            this[`form${itemKey}`].current.validateFields().then((values) => {
              isSave = true
              this.setState({ itemKey: collapseKeys });
              this.saveTabs(itemKey)

            })
          }}
        />
      </PageWrapper>
    );
  }
}
