import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse, Form, Col } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import CusRequest from '_cus_utils/request';
import { uniqBy } from 'lodash';
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentUser,
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
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import DetailList from './DetailList';
import CusTabs from '_cus_components/CusTabs';
import CusInput from '_cus_components/CusInput';
import { getLFormGridSpan } from '_cus_utils/utils';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();

let isSave = true
let flag = false // 必填校验
let isFirstFlag = true

@formatterCollections({ code: ['spfmhk.mylink', 'spcm.costPayment'] })
@fastCodeLoader([
  'HKTB.HEAD_BIDALL',
  'HKTB.LINE_BIDRULE',
  'HKTB.ACTIVITY_STATUS',
  'HKSM.COOP_MODE.ATTACH.TYPE',
])
@connect(({ loading, CollaborationModeModal }) => ({
  CollaborationModeModal,
  qeuryLoading:
    loading.effects['CollaborationModeModal/queryDetail'] ||
    loading.effects['CollaborationModeModal/addHistory'] ||
    loading.effects['CollaborationModeModal/queryDetailHistory'] ||
    loading.effects['CollaborationModeModal/saveInfo'] ||
    loading.effects['CollaborationModeModal/saveInfoHistory'],
  detailList: CollaborationModeModal.detailList,
}))
export default class Detail extends React.Component {
  form0 = React.createRef();
  form1 = React.createRef();
  form2 = React.createRef();

  constructor(props) {
    super(props);
    // window.parent?.postMessage({ hasListener: true }, '*');
    // window.addEventListener('message', this.handleClickBtn);
    const { location } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const {
      id = null,
      formRecordId = null,
      refCaseId = null,
    } = queryString.parse(location?.search?.substr(1)) || {};
    console.log(queryString.parse(location?.search?.substr(1)));
    this.state = {
      formRecordId: formRecordId && formRecordId !== 'null' ? formRecordId : id,
      isPub,
      activeKey: ['form', 'table', 'setting'],
      templateCode: 'mylink_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      itemKey: '0',
      refCaseId,
    };
  }

  componentDidMount() {
    console.log(this.state);
    if (this.state.formRecordId) {
      this.queryDetail(this.state.formRecordId);
      // this.queryListDetail(_, this.state.formRecordId);
    }
    if (this.state.refCaseId) this.getInfo(this.state.refCaseId);
    this.getBpmWork();
  }

  componentWillUnmount() {
    // window.removeEventListener('message', this.handleClickBtn);
  }

  /**
   * @name: 监听事件 - 监听致远点击按钮
   * @param {object} e
   */
  // handleClickBtn = (e) => {
  //   console.log('监听的message', e);
  //   const { submitType, messageType, url } = e.data || {};

  //   const handlePostMessage = (params) => {
  //     debugger
  //     window.parent?.postMessage(
  //       {
  //         success: true,
  //         submitType: submitType,
  //         messageType: messageType,
  //         formData: {
  //           formRecordId: params?.formRecordId,
  //           subject: params?.subject,
  //           info: params?.info,
  //           ...params,
  //         },
  //       },
  //       url
  //     );
  //   };

  //   if (e.data.messageType === 'GET_FORM_DATA') {
  //     if (['DRAFT_HANDLE', 'SEND'].includes(submitType)) {
  //       // 保存 提交
  //       this.handleSave((params) => {
  //         console.log('save&submit', params)
  //         if (params) {
  //           handlePostMessage({
  //             formRecordId: params?.formRecordId,
  //             subject: params?.subject,
  //             info: params?.info,
  //           });
  //         }
  //       });
  //     } else {
  //       // 其他按钮
  //       handlePostMessage();
  //     }
  //   }
  // };

  getInfo = (e) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'CollaborationModeModal/addHistory',
      payload: { id: e },
    }).then((res) => {
      if (res) {
        this.form0?.current?.setFieldsValue({
          applicationNo: res?.partnerMode?.applicationNo,
          applicationStatus: res?.partnerMode?.applyStatusMeaning,
          applicant: res?.partnerMode?.applicant,
          applicantDate: res?.partnerMode?.applicantDate,
          cooperationMode: res?.partnerMode?.cooperationMode?.find((item) => item.lang === 'zh_CN')
            ?.description,
          sort: res?.partnerMode?.sort,
          effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          ecommerceServiceOrNot: res?.partnerMode?.ecommerceServiceOrNot,
          description: res?.partnerMode?.description?.find((item) => item.lang === 'zh_CN')
            ?.description,
          cooperationModeList: res?.partnerMode?.cooperationMode?.filter(
            (item) => item.lang === 'zh_CN'
          ),
          descriptionList: res?.partnerMode?.description?.filter((item) => item.lang === 'zh_CN'),
          modeRgb: res?.partnerMode?.modeRgb,
        });
        this.form1?.current?.setFieldsValue({
          applicationNo: res?.partnerMode?.applicationNo,
          applicationStatus: res?.partnerMode?.applyStatusMeaning,
          applicant: res?.partnerMode?.applicant,
          applicantDate: res?.partnerMode?.applicantDate,
          cooperationMode: res?.partnerMode?.cooperationMode?.find((item) => item.lang === 'zh_TW')
            ?.description,
          sort: res?.partnerMode?.sort,
          effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          ecommerceServiceOrNot: res?.partnerMode?.ecommerceServiceOrNot,
          description: res?.partnerMode?.description?.find((item) => item.lang === 'zh_TW')
            ?.description,
          cooperationModeList: res?.partnerMode?.cooperationMode?.filter(
            (item) => item.lang === 'zh_TW'
          ),
          descriptionList: res?.partnerMode?.description?.filter((item) => item.lang === 'zh_TW'),
          modeRgb: res?.partnerMode?.modeRgb,
        });
        this.form2?.current?.setFieldsValue({
          applicationNo: res?.partnerMode?.applicationNo,
          applicationStatus: res?.partnerMode?.applyStatusMeaning,
          applicant: res?.partnerMode?.applicant,
          applicantDate: res?.partnerMode?.applicantDate,
          cooperationMode: res?.partnerMode?.cooperationMode?.find((item) => item.lang === 'en_US')
            ?.description,
          sort: res?.partnerMode?.sort,
          effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          ecommerceServiceOrNot: res?.partnerMode?.ecommerceServiceOrNot,
          description: res?.partnerMode?.description?.find((item) => item.lang === 'en_US')
            ?.description,
          cooperationModeList: res?.partnerMode?.cooperationMode?.filter(
            (item) => item.lang === 'en_US'
          ),
          descriptionList: res?.partnerMode?.description?.filter((item) => item.lang === 'en_US'),
          modeRgb: res?.partnerMode?.modeRgb,
        });
        this.setState({
          headerInfo: res,
        });
        if (isFirstFlag) {
          dispatch({
            type: 'CollaborationModeModal/updateState',
            payload: {
              productDetailSource: [
                ...res?.partnerModeFile?.map((n) => ({
                  ...n,
                  isUploadFlag: n.attachmentCount ? true : false,
                  _status: 'update',
                })),
              ],
            },
          });
          const list = getEditTableData(this.props.CollaborationModeModal.productDetailSource);
        }
      }
    });
  };

  queryDetail = (formRecordId) => {
    const { dispatch, match, CollaborationModeModal } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    dispatch({
      type:
        match.params.type == 'create'
          ? 'CollaborationModeModal/queryDetail'
          : 'CollaborationModeModal/queryDetailHistory',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      console.log('res', res, isFirstFlag);
      if (res) {
        this.form0?.current?.setFieldsValue({
          applicationNo: res?.partnerMode?.applicationNo,
          applicationStatus:
            res?.partnerMode?.applyStatusMeaning ||
            res?.partnerMode?.applicationStatus?.find((item) => item.lang === 'zh_CN')?.description,
          applicant: res?.partnerMode?.applicant,
          applicantDate: res?.partnerMode?.applicantDate,
          cooperationMode: res?.partnerMode?.cooperationMode?.find((item) => item.lang === 'zh_CN')
            ?.description,
          sort: res?.partnerMode?.sort,
          effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          ecommerceServiceOrNot: res?.partnerMode?.ecommerceServiceOrNot,
          description: res?.partnerMode?.description?.find((item) => item.lang === 'zh_CN')
            ?.description,
          cooperationModeList: res?.partnerMode?.cooperationMode?.filter(
            (item) => item.lang === 'zh_CN'
          ),
          descriptionList: res?.partnerMode?.description?.filter((item) => item.lang === 'zh_CN'),
          modeRgb: res?.partnerMode?.modeRgb,
        });
        this.form1?.current?.setFieldsValue({
          applicationNo: res?.partnerMode?.applicationNo,
          applicationStatus:
            res?.partnerMode?.applyStatusMeaning ||
            res?.partnerMode?.applicationStatus?.find((item) => item.lang === 'zh_TW')?.description,
          applicant: res?.partnerMode?.applicant,
          applicantDate: res?.partnerMode?.applicantDate,
          cooperationMode: res?.partnerMode?.cooperationMode?.find((item) => item.lang === 'zh_TW')
            ?.description,
          sort: res?.partnerMode?.sort,
          effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          ecommerceServiceOrNot: res?.partnerMode?.ecommerceServiceOrNot,
          description: res?.partnerMode?.description?.find((item) => item.lang === 'zh_TW')
            ?.description,
          cooperationModeList: res?.partnerMode?.cooperationMode?.filter(
            (item) => item.lang === 'zh_TW'
          ),
          descriptionList: res?.partnerMode?.description?.filter((item) => item.lang === 'zh_TW'),
          modeRgb: res?.partnerMode?.modeRgb,
        });
        this.form2?.current?.setFieldsValue({
          applicationNo: res?.partnerMode?.applicationNo,
          applicationStatus:
            res?.partnerMode?.applyStatusMeaning ||
            res?.partnerMode?.applicationStatus?.find((item) => item.lang === 'en_US')?.description,
          applicant: res?.partnerMode?.applicant,
          applicantDate: res?.partnerMode?.applicantDate,
          cooperationMode: res?.partnerMode?.cooperationMode?.find((item) => item.lang === 'en_US')
            ?.description,
          sort: res?.partnerMode?.sort,
          effectiveOrNot: res?.partnerMode?.effectiveOrNot,
          ecommerceServiceOrNot: res?.partnerMode?.ecommerceServiceOrNot,
          description: res?.partnerMode?.description?.find((item) => item.lang === 'en_US')
            ?.description,
          cooperationModeList: res?.partnerMode?.cooperationMode?.filter(
            (item) => item.lang === 'en_US'
          ),
          descriptionList: res?.partnerMode?.description?.filter((item) => item.lang === 'en_US'),
          modeRgb: res?.partnerMode?.modeRgb,
        });
        this.setState({
          headerInfo: res,
          refCaseId: res?.partnerMode?.refModeId,
        });
        if (isFirstFlag) {
          dispatch({
            type: 'CollaborationModeModal/updateState',
            payload: {
              productDetailSource: [
                ...res?.partnerModeFile?.map((n) => ({
                  ...n,
                  isUploadFlag: n.attachmentCount ? true : false,
                  _status: 'update',
                })),
              ],
            },
          });
        }
      }
    });
  };

  queryListDetail = (page = {}, formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'CollaborationModeModal/queryListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log('商品详情', res);
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'CollaborationModeModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            productDetailPagination: pagination,
          },
        });
      }
    });
  };

  @Bind()
  handleDeleteLine = () => {
    const { dispatch, CollaborationModeModal } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    const { selectedRowKeys, formRecordId, headId } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = productDetailSource.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'CollaborationModeModal/deleteProductLine',
            payload: deleteData,
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.queryListDetail(_, formRecordId || headId);
            }
          });
        } else {
          // 本地删除
          const newDataSource = productDetailSource.filter(
            (item) => !selectedRowKeys.includes(item['rowKey'])
          );
          // const delItemsLength = productDetailSource.length - newDataSource.length;
          // productDetailPagination.total = productDetailSource.length - 1
          // const newPagination = delItemsToPagination(delItemsLength, productDetailSource.length, productDetailPagination);
          dispatch({
            type: 'CollaborationModeModal/updateState',
            payload: {
              productDetailSource: newDataSource,
              // productDetailPagination: newPagination,
            },
          });
        }
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  };

  @Bind()
  handleDownloadTemplateClick = () => {
    const { templateCode } = this.state;
    const api = `/bidding/v1/${organizationId}/import/template/${templateCode}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] });
  };

  @Bind()
  handleAddLine = () => {
    const { dispatch, CollaborationModeModal } = this.props;
    const { productDetailSource = [] } = CollaborationModeModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const newDataSource = [
      ...productDetailSource,
      {
        rowKey: uuidv4(),
        quoteRule: basicForm?.isFullQuote === 'Y' ? 'Bundled' : 'Singleton',
        _status: 'create',
      },
    ];
    // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
    dispatch({
      type: 'CollaborationModeModal/updateState',
      payload: {
        productDetailSource: newDataSource,
        // productDetailPagination: newPagination,
      },
    });
  };

  payUpload = (payFileList = []) => {
    const { CollaborationModeModal, dispatch } = this.props;
    const { productDetailSource = [] } = CollaborationModeModal;
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
        const newDataSource = [...productDetailSource, ...data];
        // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
        dispatch({
          type: 'CollaborationModeModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            // productDetailPagination: newPagination,
          },
        });
        this.setState(
          {
            importUploading: false,
            productVisible: false,
          },
          () => {
            if (response.msg) {
              CusNotification.error({
                message: response.msg,
              });
            }
          }
        );
      }
    });
  };

  // handleSave = () => {
  //   const { itemKey, headerInfo } = this.state
  //   const newItemKey = itemKey
  //   const { dispatch, CollaborationModeModal, match } = this.props;
  //   const { productDetailSource } = CollaborationModeModal;
  //   const lang = newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US'
  //   dispatch({
  //     type: match.params.type == 'create' ? 'CollaborationModeModal/saveInfo' : 'CollaborationModeModal/saveInfoHistory',
  //     // 判断是否有id 确认是新增还是跟新数据
  //     payload: (headerInfo?.partnerMode?.modeId || headerInfo?.partnerMode?.modeRecordId) ? {
  //       partnerMode: {
  //         ...this[`form${newItemKey}`].current.getFieldsValue(),
  //         cooperationMode: [
  //           {
  //             ...this[`form${newItemKey}`].current.getFieldsValue()?.cooperationModeList[0], // 由于跟新存在langId，需要进行赋值, 在赋值时进行筛选过滤保证保存时只存在唯一值
  //             lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
  //             description: this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
  //           }
  //         ],
  //         description: [
  //           {
  //             ...this[`form${newItemKey}`].current.getFieldsValue()?.descriptionList[0],
  //             lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
  //             description: this[`form${newItemKey}`].current.getFieldsValue().description || '',
  //           }
  //         ],
  //         effectiveOrNot: this[`form${newItemKey}`].current.getFieldsValue()?.effectiveOrNot,
  //         modeId: headerInfo?.partnerMode?.modeId,
  //         partnerModeId: this.state.refCaseId,
  //         modeRecordId:headerInfo?.partnerMode?.modeRecordId,
  //       },
  //       partnerModeFile: getEditTableData(productDetailSource)
  //     } : {
  //       partnerMode: {
  //         cooperationMode: headerInfo?.partnerMode?.cooperationMode.filter(item=> item.lang != lang)?.length ? [
  //           ...headerInfo?.partnerMode?.cooperationMode.filter(item=> item.lang != lang),
  //           {
  //             description: this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
  //             lang: lang
  //           }
  //         ]: [{
  //           description: this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
  //           lang: lang
  //         }],
  //         description: headerInfo?.partnerMode?.description.filter(item=> item.lang != lang).length ? [
  //           ...headerInfo?.partnerMode?.description.filter(item=> item.lang != lang),
  //           {
  //             description: this[`form${newItemKey}`].current.getFieldsValue().description || '',
  //             lang: lang
  //           }
  //         ] : [{
  //           description: this[`form${newItemKey}`].current.getFieldsValue().description || '',
  //           lang: lang
  //         }
  //       ],
  //         effectiveOrNot: this[`form${newItemKey}`].current.getFieldsValue()?.effectiveOrNot,
  //         sort: this[`form${newItemKey}`].current.getFieldsValue()?.sort,
  //         modeRgb: this[`form${newItemKey}`].current.getFieldsValue()?.modeRgb,
  //         modeId: headerInfo?.partnerMode?.modeId,
  //         partnerModeId: this.state.refCaseId
  //       },
  //       partnerModeFile: getEditTableData(productDetailSource)
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       this.setState({
  //         headerInfo: res,
  //         formRecordId: headerInfo?.partnerMode?.modeId || headerInfo?.partnerMode?.modeRecordId || res?.partnerMode?.modeId || res?.partnerMode?.modeRecordId,
  //       })
  //       CusNotification.success({
  //         message: intl.get('hzero.common.notification.success.save').d('保存成功')
  //       })
  //       isSave = false
  //       isFirstFlag =false
  //       this.queryDetail(headerInfo?.partnerMode?.modeId || headerInfo?.partnerMode?.modeRecordId || res?.partnerMode?.modeId || res?.partnerMode?.modeRecordId)
  //     }
  //   });
  // }

  saveTabs = (key) => {
    const { itemKey, headerInfo } = this.state;
    const newItemKey = key || itemKey;
    const { dispatch, CollaborationModeModal, match } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    console.log('productDetailSource', headerInfo?.partnerMode?.cooperationMode);
    const lang = newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US';
    dispatch({
      type:
        match.params.type == 'create'
          ? 'CollaborationModeModal/saveInfo'
          : 'CollaborationModeModal/saveInfoHistory',
      // 判断是否有id 确认是新增还是跟新数据
      payload:
        headerInfo?.partnerMode?.modeId || headerInfo?.partnerMode?.modeRecordId
          ? {
              partnerMode: {
                ...this[`form${newItemKey}`].current.getFieldsValue(),
                cooperationMode: [
                  {
                    ...this[`form${newItemKey}`].current.getFieldsValue()?.cooperationModeList[0], // 由于跟新存在langId，需要进行赋值, 在赋值时进行筛选过滤保证保存时只存在唯一值
                    lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
                    description:
                      this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
                  },
                ],
                description: [
                  {
                    ...this[`form${newItemKey}`].current.getFieldsValue()?.descriptionList[0],
                    lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
                    description:
                      this[`form${newItemKey}`].current.getFieldsValue().description || '',
                  },
                ],
                effectiveOrNot: this[`form${newItemKey}`].current.getFieldsValue()?.effectiveOrNot,
                ecommerceServiceOrNot:
                  this[`form${newItemKey}`].current.getFieldsValue()?.ecommerceServiceOrNot,
                modeId: headerInfo?.partnerMode?.modeId,
                partnerModeId: this.state.refCaseId,
                modeRecordId: headerInfo?.partnerMode?.modeRecordId,
              },
              partnerModeFile: productDetailSource?.length
                ? productDetailSource.filter((item) => item.fileType != null)
                : [],
            }
          : {
              partnerMode: {
                cooperationMode: headerInfo?.partnerMode?.cooperationMode.filter(
                  (item) => item.lang != lang
                )?.length
                  ? [
                      ...headerInfo?.partnerMode?.cooperationMode.filter(
                        (item) => item.lang != lang
                      ),
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
                        lang: lang,
                      },
                    ]
                  : [
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
                        lang: lang,
                      },
                    ],
                description: headerInfo?.partnerMode?.description.filter(
                  (item) => item.lang != lang
                ).length
                  ? [
                      ...headerInfo?.partnerMode?.description.filter((item) => item.lang != lang),
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue().description || '',
                        lang: lang,
                      },
                    ]
                  : [
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue().description || '',
                        lang: lang,
                      },
                    ],
                effectiveOrNot: this[`form${newItemKey}`].current.getFieldsValue()?.effectiveOrNot,
                ecommerceServiceOrNot:
                  this[`form${newItemKey}`].current.getFieldsValue()?.ecommerceServiceOrNot,
                sort: this[`form${newItemKey}`].current.getFieldsValue()?.sort,
                modeRgb: this[`form${newItemKey}`].current.getFieldsValue()?.modeRgb,
                modeId: headerInfo?.partnerMode?.modeId,
                partnerModeId: this.state.refCaseId,
              },
              partnerModeFile: productDetailSource?.length
                ? productDetailSource.filter((item) => item.fileType != null)
                : [],
            },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          formRecordId:
            headerInfo?.partnerMode?.modeId ||
            headerInfo?.partnerMode?.modeRecordId ||
            res?.partnerMode?.modeId ||
            res?.partnerMode?.modeRecordId,
        });
        CusNotification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        isSave = false;
        isFirstFlag = false;
        this.queryDetail(
          headerInfo?.partnerMode?.modeId ||
            headerInfo?.partnerMode?.modeRecordId ||
            res?.partnerMode?.modeId ||
            res?.partnerMode?.modeRecordId
        );
        dispatch({
          type: 'CollaborationModeModal/updateState',
          payload: {
            productDetailSource: productDetailSource?.length
              ? productDetailSource.filter((item) => item.fileType != null)
              : [],
          },
        });
      }
    });
  };

  @Bind
  saveSubmit = (callback) => {
    const { itemKey, headerInfo } = this.state;
    const newItemKey = itemKey;
    const { dispatch, CollaborationModeModal, match } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    console.log('productDetailSource', getEditTableData(productDetailSource));
    const checkListPc = productDetailSource.filter((item) => item.fileType == 'Picture');
    const checkListModile = productDetailSource.filter((item) => item.fileType == 'PicturePhone');
    if (checkListPc?.length > 1 || checkListModile?.length > 1) {
      CusModal.error({
        content: intl
          .get(`spfmhk.mylink.button.savemode.verify`)
          .d('存在多行背景图，请勿重复上传。'),
      });
      return;
    }
    const lang = newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US';
    dispatch({
      type:
        match.params.type == 'create'
          ? 'CollaborationModeModal/saveInfo'
          : 'CollaborationModeModal/saveInfoHistory',
      // 判断是否有id 确认是新增还是跟新数据
      payload:
        headerInfo?.partnerMode?.modeId || headerInfo?.partnerMode?.modeRecordId
          ? {
              partnerMode: {
                ...this[`form${newItemKey}`].current.getFieldsValue(),
                cooperationMode: [
                  {
                    ...this[`form${newItemKey}`].current.getFieldsValue()?.cooperationModeList[0], // 由于跟新存在langId，需要进行赋值, 在赋值时进行筛选过滤保证保存时只存在唯一值
                    lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
                    description:
                      this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
                  },
                ],
                description: [
                  {
                    ...this[`form${newItemKey}`].current.getFieldsValue()?.descriptionList[0],
                    lang: newItemKey == '0' ? 'zh_CN' : newItemKey == '1' ? 'zh_TW' : 'en_US',
                    description:
                      this[`form${newItemKey}`].current.getFieldsValue().description || '',
                  },
                ],
                effectiveOrNot: this[`form${newItemKey}`].current.getFieldsValue()?.effectiveOrNot,
                ecommerceServiceOrNot:
                  this[`form${newItemKey}`].current.getFieldsValue()?.ecommerceServiceOrNot,
                modeId: headerInfo?.partnerMode?.modeId,
                modeRecordId: this.state.formRecordId,
              },
              partnerModeFile: productDetailSource,
            }
          : {
              partnerMode: {
                cooperationMode: headerInfo?.partnerMode?.cooperationMode.filter(
                  (item) => item.lang != lang
                )?.length
                  ? [
                      ...headerInfo?.partnerMode?.cooperationMode.filter(
                        (item) => item.lang != lang
                      ),
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
                        lang: lang,
                      },
                    ]
                  : [
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue()?.cooperationMode,
                        lang: lang,
                      },
                    ],
                description: headerInfo?.partnerMode?.description.filter(
                  (item) => item.lang != lang
                ).length
                  ? [
                      ...headerInfo?.partnerMode?.description.filter((item) => item.lang != lang),
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue().description || '',
                        lang: lang,
                      },
                    ]
                  : [
                      {
                        description:
                          this[`form${newItemKey}`].current.getFieldsValue().description || '',
                        lang: lang,
                      },
                    ],
                effectiveOrNot: this[`form${newItemKey}`].current.getFieldsValue()?.effectiveOrNot,
                ecommerceServiceOrNot:
                  this[`form${newItemKey}`].current.getFieldsValue()?.ecommerceServiceOrNot,
                sort: this[`form${newItemKey}`].current.getFieldsValue()?.sort,
                modeRgb: this[`form${newItemKey}`].current.getFieldsValue()?.modeRgb,
                modeId: headerInfo?.partnerMode?.modeId,
                partnerModeId: this.state.refCaseId,
              },
              partnerModeFile: productDetailSource?.length
                ? productDetailSource.filter((item) => item.fileType != null)
                : [],
            },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          formRecordId:
            headerInfo?.partnerMode?.modeId ||
            headerInfo?.partnerMode?.modeRecordId ||
            res?.partnerMode?.modeId ||
            res?.partnerMode?.modeRecordId,
        });
        CusNotification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        callback(true);
        isFirstFlag = false;
        this.queryDetail(
          headerInfo?.partnerMode?.modeId ||
            headerInfo?.partnerMode?.modeRecordId ||
            res?.partnerMode?.modeId ||
            res?.partnerMode?.modeRecordId
        );
      } else {
        callback(false);
      }
    });
  };

  changeEffectiveOrNot = (key) => {
    const { itemKey, headerInfo } = this.state;
    this[`form${itemKey}`]?.current?.setFieldsValue({
      effectiveOrNot: key,
    });
  };

  changeEcommerceServiceOrNot = (key) => {
    const { itemKey } = this.state;
    this[`form${itemKey}`]?.current?.setFieldsValue({
      ecommerceServiceOrNot: key,
    });
  };

  // 致远调用参数&流程
  @Bind()
  getBpmWork() {
    const { location } = this.props;
    const routerParams = queryString.parse(location.search.substr(1));
    const { formRecordId } = routerParams;
    console.log(formRecordId, this.state.formRecordId);
    // const { infoForm, } = resaleRequestDetail;
    top?.postMessage(
      {
        hasListener: true,
      },
      '*'
    );
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
    window.addEventListener('message', async (e) => {
      const { match } = this.props;
      const { headerInfo } = this.state;
      // 申请状态 = 审批中 （不可编辑单据）
      const readyOnly =
        headerInfo?.partnerMode?.applyStatus && headerInfo?.partnerMode?.applyStatus != 'Draft';
      // const { infoForm, } = resaleRequestDetail;
      // let headerDatalist = infoForm?.current?.getFieldsValue()
      console.log('监听的message', e, readyOnly);
      if (e.data.messageType === 'GET_FORM_DATA') {
        if (['SEND', 'AGREE', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          // 保存和提交
          if (['DRAFT_HANDLE'].includes(e.data.submitType)) {
            flag = false;
            await this[`form${this.state.itemKey}`].current
              .validateFields()
              .then((err, values) => {})
              .catch((err) => {
                this.changeFlag();
              });
            if (flag) return;
            if (!readyOnly) {
              this.saveSubmit((params) => {
                if (params) {
                  console.log('callback', isSave, this.state);
                  top?.postMessage(
                    {
                      success: true, //表单数据验证成功或不需要验证时传true，否则传false
                      submitType: e.data.submitType, //将此字段值回传
                      messageType: 'GET_FORM_DATA', //获取表单数据消息
                      actionInfo: {
                        // 阻止页面关闭
                        preventClose: !['SEND', 'AGREE'].includes(e.data.submitType),
                      },
                      //表单数据放这里
                      formData: {
                        formRecordId:
                          formRecordId && formRecordId !== 'null'
                            ? formRecordId
                            : String(this.state.formRecordId), //表单记录id（Long）
                        caseSender: getCurrentUser().loginName,
                        subject:
                          match.params.type == 'create'
                            ? intl
                                .get('spfmhk.mylink.title.zhiyuan.modenew', {
                                  ModeName:
                                    this.state.headerInfo?.partnerMode?.cooperationMode?.find(
                                      (item) => item.lang === 'zh_CN'
                                    )?.description,
                                })
                                .d('合作模式新增：')
                            : intl
                                .get('spfmhk.mylink.title.zhiyuan.modechange', {
                                  ModeName:
                                    this.state.headerInfo?.partnerMode?.cooperationMode?.find(
                                      (item) => item.lang === 'zh_CN'
                                    )?.description,
                                })
                                .d('合作模式新增：'),
                        // business_type: headerDatalist?.businessType || 'IDD',
                        // account_manager: ["kammyyang"]
                        // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                        //   packageName: params.packageName
                        // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                        // //下面内容为表单数据
                        // ...params,
                      },
                    },
                    e.data.url
                  );
                }
              });
            }
          } else {
            this.goSubmit((params) => {
              if (params) {
                // this.saveTabs()
                top?.postMessage(
                  {
                    success: true, //表单数据验证成功或不需要验证时传true，否则传false
                    submitType: e.data.submitType, //将此字段值回传
                    messageType: 'GET_FORM_DATA', //获取表单数据消息
                    actionInfo: {
                      // 阻止页面关闭
                      preventClose: !['SEND', 'AGREE'].includes(e.data.submitType),
                    },
                    //表单数据放这里
                    formData: {
                      formRecordId:
                        formRecordId && formRecordId !== 'null'
                          ? formRecordId
                          : String(this.state.formRecordId), //表单记录id（Long）
                      caseSender: getCurrentUser().loginName,
                      subject:
                        match.params.type == 'create'
                          ? intl
                              .get('spfmhk.mylink.title.zhiyuan.modenew', {
                                ModeName: this.state.headerInfo?.partnerMode?.cooperationMode?.find(
                                  (item) => item.lang === 'zh_CN'
                                )?.description,
                              })
                              .d('合作模式新增：')
                          : intl
                              .get('spfmhk.mylink.title.zhiyuan.modechange', {
                                ModeName: this.state.headerInfo?.partnerMode?.cooperationMode?.find(
                                  (item) => item.lang === 'zh_CN'
                                )?.description,
                              })
                              .d('合作模式新增：'),
                      // title: headerDatalist?.toDoTitle,
                      // business_type: headerDatalist?.businessType || 'IDD',
                      // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                      //   packageName: params.packageName
                      // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                      // //下面内容为表单数据
                      // ...params,
                    },
                  },
                  e.data.url
                );
              }
            }, e.data.submitType);
          }
        } else {
          if (['TERMINATION', 'PROCESS_SHOW'].includes(e.data.submitType)) {
            // this.goSave((params) => {
            //   console.log('params', params)
            //   if(params) {
            top?.postMessage(
              {
                success: true, //传true
                submitType: e.data.submitType, //将此字段值回传
                messageType: e.data.messageType, //获取表单数据消息
                actionInfo: {
                  // 阻止页面关闭
                  preventClose: e.data.messageType === 'PROCESS_SHOW',
                },
                //表单数据放这里
                formData: {
                  formRecordId:
                    formRecordId && formRecordId !== 'null'
                      ? formRecordId
                      : String(this.state.formRecordId), //表单记录id（Long）
                  caseSender: getCurrentUser().loginName,
                  // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                  //   packageName: params.packageName
                  // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                  // //下面内容为表单数据
                  // ...params,
                },
              },
              e.data.url
            );
            //   }
            // })
          } else {
            // this.goSubmit((params) => {
            //   console.log('params', params)
            //   if(params) {
            top?.postMessage(
              {
                success: true, //传true
                submitType: e.data.submitType, //将此字段值回传
                messageType: e.data.messageType, //获取表单数据消息
                actionInfo: {
                  // 阻止页面关闭
                  preventClose: e.data.messageType === 'PROCESS_SHOW',
                },
                //表单数据放这里
                formData: {
                  formRecordId:
                    formRecordId && formRecordId !== 'null'
                      ? formRecordId
                      : String(this.state.formRecordId), //表单记录id（Long）
                  caseSender: getCurrentUser().loginName,
                  // processName: intl.get(`bid.bidcommon.view.title.pending`, {
                  //   packageName: params.packageName
                  // }).d(`采购结果申请_${params.packageName}`), //待办流程名称
                  // //下面内容为表单数据
                  // ...params,
                },
              },
              e.data.url
            );
            //   }
            // })
          }
        }
      }
    });
  }

  @Bind
  handleAddLines = () => {
    const { dispatch, CollaborationModeModal } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    console.log(this.state.formRecordId);
    dispatch({
      type: 'CollaborationModeModal/updateState',
      payload: {
        productDetailSource: this.state.formRecordId
          ? [
              ...productDetailSource,
              {
                _status: 'create',
                fileUuid: uuidv4(),
                refModeId: this.state.formRecordId,
                isUploadFlag: false,
              },
            ]
          : [
              ...productDetailSource,
              {
                _status: 'create',
                fileUuid: uuidv4(),
                isUploadFlag: false,
              },
            ],
        // productDetailPagination: newPagination,
      },
    });
  };

  handleDeleteLines = () => {
    const { selectedRowKeys } = this.state;
    const { CollaborationModeModal, dispatch } = this.props;
    const { productDetailSource } = CollaborationModeModal;

    const newDataSource = productDetailSource.filter(
      (item) => !selectedRowKeys.includes(item['fileUuid'])
    );
    // const delItemsLength = productDetailSource.length - newDataSource.length;
    // productDetailPagination.total = productDetailSource.length - 1
    // const newPagination = delItemsToPagination(delItemsLength, productDetailSource.length, productDetailPagination);
    dispatch({
      type: 'CollaborationModeModal/updateState',
      payload: {
        productDetailSource: newDataSource,
        // productDetailPagination: newPagination,
      },
    });
  };

  @Bind
  goSubmit = async (callback) => {
    flag = false;
    const { dispatch, CollaborationModeModal, match, idpValueMap } = this.props;
    const { productDetailSource } = CollaborationModeModal;
    await this.form0.current
      .validateFields()
      .then((err, values) => {})
      .catch((err) => {
        this.changeFlag();
      });
    await this.form1.current
      .validateFields()
      .then((err, values) => {})
      .catch((err) => {
        this.changeFlag();
      });
    await this.form2.current
      .validateFields()
      .then((err, values) => {})
      .catch((err) => {
        this.changeFlag();
      });
    console.log(productDetailSource, 'productDetailSource', getEditTableData(productDetailSource));
    const list = productDetailSource;
    console.log(list, 'list');
    const checkList = productDetailSource.filter(
      (item) => item.isUploadFlag === false && item._status === 'create'
    );
    console.log(checkList, 'list');
    productDetailSource.filter((item) => item.isUploadFlag === false && item._status === 'create');
    let checkFlag = false;
    idpValueMap['HKSM.COOP_MODE.ATTACH.TYPE'].map((item) => {
      const check = productDetailSource.filter(
        (record) => item.value == record.fileType && record.isUploadFlag == true
      );
      if (check.length == 0) {
        checkFlag = true;
      }
    });
    console.log(checkFlag, 'list');
    // 判断是否必填 是否为纯数字
    const checkDescriptionList = productDetailSource.filter(
      (item) =>
        item.fileType == 'Logo' &&
        (!!!item.fileDescription || !/^[0-9]+$/.test(item.fileDescription))
    );
    // const checkDescriptionList = []
    console.log(checkDescriptionList);
    if (checkDescriptionList.length > 0) return;
    if (flag) {
      callback(false);
      CusNotification.error({
        message: intl.get('spfmhk.mylink.button.save.verify').d('填写三种语言'),
      });
      return;
    }
    if (list.length == 0 || checkList.length > 0 || checkFlag) {
      callback(false);
      CusNotification.error({
        message: intl.get('spfmhk.mylink.field.save.attachverify').d('填写附件'),
      });
      return;
    }
    this.saveSubmit((params) => {
      callback(params);
    });
  };

  changeFlag = () => {
    flag = true;
  };

  @Bind
  iSave() {
    this.goSubmit((params) => {
      console.log(params);
      if (params) {
        // this.saveTabs()
        console.log(this.state, 'state');
      }
    });
  }

  render() {
    const { qeuryLoading = false, detailList = {}, idpValueMap } = this.props;
    const { activeKey, selectedRowKeys, headerInfo, headId, formRecordId, itemKey } = this.state;

    console.log(getCurrentUser(), '11122233');

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly =
      (headerInfo?.partnerMode?.applyStatus && headerInfo?.partnerMode?.applyStatus != 'Draft') ||
      (headerInfo?.partnerMode?.applyStatus && headerInfo?.partnerMode?.startUserCode != loginName);
    console.log(readyOnly, headerInfo);
    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref;
      },
      getEffectiveOrNot: this.changeEffectiveOrNot,
      getEcommerceServiceOrNot: this.changeEcommerceServiceOrNot,
      itemKey,
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
      // basicForm: this.basicForm?.getFieldsValue(),
      onChange: (page) => this.queryListDetail(page, formRecordId || headId),
      onRef: (ref) => {
        this.tableForm = ref.props.form;
      },
    };

    const tabItems = [
      {
        key: '0',
        label: '简体',
        forceRender: true,
        children: (
          <>
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
                      title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="form"
                >
                  <BasicForm {...basicFormProps} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.mylink.view.title.coopmode`).d('合作方式设置')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="setting"
                >
                  <div className="customize-form">
                    <Col span={24}>
                      <Form.Item
                        label={intl.get(`spfmhk.mylink.field.cooperate.mode.descri`).d('描述')}
                        name="description"
                        rules={[
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`spfmhk.mylink.field.cooperate.mode.descri`).d('描述'),
                            }),
                          },
                        ]}
                      >
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={210}
                          disabled={readyOnly}
                          showCharacter
                        />
                      </Form.Item>
                    </Col>
                  </div>
                </Panel>
                {/* <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.ProduInfor`).d('商品详情')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <DetailList {...detailListrops} />
            </Panel> */}
              </Collapse>
            </Form>
          </>
        ),
      },
      {
        key: '1',
        label: '繁體',
        forceRender: true,
        children: (
          <>
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
                      title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="form"
                >
                  <BasicForm {...basicFormProps} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.mylink.view.title.coopmode`).d('合作方式设置')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="setting"
                >
                  <div className="customize-form">
                    <Col span={24}>
                      <Form.Item
                        label={intl.get(`spfmhk.mylink.field.cooperate.mode.descri`).d('描述')}
                        name="description"
                        rules={[
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`spfmhk.mylink.field.cooperate.mode.descri`).d('描述'),
                            }),
                          },
                        ]}
                      >
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={210}
                          disabled={readyOnly}
                          showCharacter
                        />
                      </Form.Item>
                    </Col>
                  </div>
                </Panel>
              </Collapse>
            </Form>
          </>
        ),
      },
      {
        key: '2',
        label: 'English',
        forceRender: true,
        children: (
          <>
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
                      title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="form"
                >
                  <BasicForm {...basicFormProps} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.mylink.view.title.coopmode`).d('合作方式设置')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="setting"
                >
                  <div className="customize-form">
                    <Col span={24}>
                      <Form.Item
                        label={intl.get(`spfmhk.mylink.field.cooperate.mode.descri`).d('描述')}
                        name="description"
                        rules={[
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`spfmhk.mylink.field.cooperate.mode.descri`).d('描述'),
                            }),
                          },
                        ]}
                      >
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={210}
                          showCharacter
                          disabled={readyOnly}
                        />
                      </Form.Item>
                    </Col>
                  </div>
                </Panel>
                {/* <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.ProduInfor`).d('商品详情')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <DetailList {...detailListrops} />
            </Panel> */}
              </Collapse>
            </Form>
          </>
        ),
      },
    ];

    return (
      <PageWrapper loading={qeuryLoading}>
        {/* <CusButton onClick={this.iSave}>
          1weq
        </CusButton> */}
        <CusTabs
          defaultActiveKey={itemKey}
          activeKey={itemKey}
          items={tabItems}
          moreIcon={false}
          onTabClick={(collapseKeys) => {
            this[`form${itemKey}`].current.validateFields().then((err, values) => {
              console.log(err);
              this.setState({ itemKey: collapseKeys });
              if (!readyOnly) this.saveTabs(itemKey);
              isSave = true;
            });
            // .catch(() => {
            //   console.log('err', itemKey, collapseKeys)
            //   this.setState({ itemKey: itemKey });
            // })
          }}
        />
        <Collapse
          className="customize-collapse"
          style={{ marginTop: '16px' }}
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spcm.costPayment.view.detail.file.title`).d('附件上传')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    {!readyOnly && (
                      <CusButton
                        // mini
                        onClick={this.handleDeleteLines}
                      >
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                    )}
                    {!readyOnly && (
                      <CusButton
                        // mini
                        type="primary"
                        onClick={this.handleAddLines}
                      >
                        {intl.get('hzero.common.view.button.add').d('新建')}
                      </CusButton>
                    )}
                  </>
                }
              />
            }
            key="table"
          >
            <DetailList {...detailListrops} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
