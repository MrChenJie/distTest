import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind, Debounce } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusButton from '_cus_components/CusButton';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';
import styles from './index.less';
import classnames from 'classnames';
import FilterSearchRequ from './FilterSearchRequ';
import FilterSearchPr from './FilterSearchPr';
import FilterSearchEs from './FilterSearchEs';
import DataTableEs from './DataTableEs';
import DataTableInfo from './DataTableInfo';
import uuid from 'uuid/v4';
import { Form } from 'hzero-ui';
import { routerRedux } from 'dva/router';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseInquirySheetModel, loading }) => ({
  purchaseInquirySheetModel,
  // fetchLoading: loading.effects['resaleRfq/queryRfqList'],
  // submitLoading:
  //   loading.effects['resaleRfq/submitSummary'] ||
  //   loading.effects['resaleRfq/ictsSubmitSummary'] ||
  //   loading.effects['resaleRfq/submitValidateSummary'] ||
  //   loading.effects['resaleRfq/ictsSubmitValidateSummary'] ||
  //   loading.effects['resaleRfq/submitEnquiryPriceSummary'] ||
  //   loading.effects['resaleRfq/submitValidateCommonSummary'],
  // publishLoading:
  //   loading.effects['resaleRfq/publishSummary'] ||
  //   loading.effects['resaleRfq/ictsPublishSummary'] ||
  //   loading.effects['resaleRfq/publishEnquiryPriceSummary'] ||
  //   loading.effects['resaleRfq/submitValidateCommonSummary'],
  // deleteLoading: loading.effects['resaleRfq/deleteEnquiryPriceByList'],
  // queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
  // exportLoading: loading.effects['resaleRfq/enquiryExport'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'SPCM.CURRENCY',
  'CMHK.ERP.ADDRESS',
  'HKPC.ICT.SERVICETYPE',
])
@Form.create()
export default class purchaseInquirySheet extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table', 'info'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      tabKey: 'scoreDetail',
      attachmentSource: [], //附件信息
      equipmentAndServiceValue: [], //接收从子组件传过来的设备及服务信息的值
      deviceInfoList: [],
      deviceInfoListValue: [], //接收从子组件传过来的设备信息list
      tabString: 'scoreDetail', //tabs标签页
      filterForm: {},
      esFilterForm: {},
      id: 0,
      totalAmount: 0,
      esFormValue: {},
      flag: false,
      delMatIdList: [], // 删除的物料的id值
      delIdList: [], // 删除的文件list的id值
      infoState: {},
      zyHeads: {},
      zyMats: [],
      zyAttachs: [],
      zyProSo: {},
      zyPrDev: [],
      requireDataObj: {}, //需求界面查询表单的数据,
      PRjine: '',
      btnVisible: false,
      totalAmountHkd: '',
      profitMargin: '',
      tenderManager: ''
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    const {
      location: { search },
    } = this.props;
    const { id, isStart, formRecordId } = querystring.parse(search.substring(1));
    // console.log(isStart, 'isStart123');
    // console.log(formRecordId, 'formRecordId123');
    if (id == 0) {
      this.queryPurChaseResultInfo(); // 新增的时候需要查询userInfo
    } else {
      this.setState({
        tabString: 'scoreSum',
        btnVisible: true,
      });
    }
    this.handleSearchDetails();
    this.listener();
  }

  //根据待办进入页面的查询销售订单数据
  @Bind()
  querySaleOrderDetails(page = {}) {
    const { dispatch } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
    console.log(formRecordId, 'formRecordId123');
    dispatch({
      type: 'purchaseInquirySheetModel/querySaleOrderDetails',
      payload: {
        page,
        recordId: formRecordId,
      },
    }).then((res) => {
      console.log(res, 'res123');
      dispatch({
        type: 'purchaseInquirySheetModel/commentUpdateState',
        payload: {
          cmhkIctPrSo: res[0],
        },
      });
    });
  }

  //根据单据id查询当前数据详情
  @Bind()
  handleSearchDetails(resId) {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
    const id = querystring.parse(location.search)['?id'];
    if (id != '0') {
      dispatch({
        type: 'purchaseInquirySheetModel/editPurchaseResultApplication',
        payload: {
          id: resId || id || formRecordId,
        },
      }).then((res) => {
        if (res) {
          console.log(res, 'res1234');
          if (res?.ictPrDetailHeadsList?.prApplyStatus == 'PENDING_REFER') {
            this.setState({
              tabString: 'scoreDetail',
            });
          }
          dispatch({
            type: 'purchaseInquirySheetModel/commentUpdateState',
            payload: {
              originalCurrency:
                res?.ictPrDetailHeadsList != null
                  ? res?.ictPrDetailHeadsList?.originalCurrency
                  : '',
              originalCurrencyStr:
                res?.ictPrDetailHeadsList != null
                  ? res?.ictPrDetailHeadsList?.originalCurrencyHkd
                  : '',
              ictPrDetailHeadsList:
                res?.ictPrDetailHeadsList != null ? res?.ictPrDetailHeadsList : {},
              ictPrAttachList: res?.ictPrAttachList != null ? res?.ictPrAttachList : [],
              ictPrDetailMatList:
                res?.ictPrDetailMatList != null
                  ? res?.ictPrDetailMatList?.map((item) => {
                      return {
                        ...item,
                        _status: 'update',
                      };
                    })
                  : [],
              cmhkIctPrSo: res?.cmhkIctPrSo,
              cmhkIctPrDeviceInfoList: res?.cmhkIctPrDeviceInfoList,
              hasCmhkIctPrDeviceInfoList: res?.hasCmhkIctPrDeviceInfoList,
              equipmentLineNo:
                res?.ictPrDetailHeadsList != null ? res?.ictPrDetailHeadsList?.equipmentLineNo : '',
              glCode: res?.ictPrDetailHeadsList != null ? res?.ictPrDetailHeadsList?.glCode : '',
              prApplyStatus:
                res?.ictPrDetailHeadsList != null ? res?.ictPrDetailHeadsList?.prApplyStatus : '',
              currency:
                res?.ictPrDetailHeadsList != null
                  ? res?.ictPrDetailHeadsList?.originalCurrencyHkd
                  : '',
              prer: res?.ictPrDetailHeadsList != null ? res?.ictPrDetailHeadsList?.prer : '',
              totalAmountHkd:
                res?.ictPrDetailHeadsList != null ? res?.ictPrDetailHeadsList?.totalAmountHkd : '',
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'purchaseInquirySheetModel/commentUpdateState',
        payload: {
          ictPrDetailHeadsList: {},
          ictPrAttachList: [],
          ictPrDetailMatList: [],
          cmhkIctPrSo: {},
          cmhkIctPrDeviceInfoList: [],
        },
      });
    }
  }

  /**
   * @description 打开新建询价单Modal
   */
  @Bind()
  handleOpenModal() {
    this.setState({
      modalVisible: true,
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.form?.current?.getFieldsValue();
    const {
      creationDateFrom,
      creationDateTo,
      enquiryStartDateFrom,
      enquiryStartDateTo,
      enquiryEndDateFrom,
      enquiryEndDateTo,
    } = fieldsValue || {};
    return {
      ...fieldsValue,
      creationDateFrom: dayjs.isDayjs(creationDateFrom)
        ? creationDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      creationDateTo: dayjs.isDayjs(creationDateTo)
        ? creationDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryStartDateFrom: dayjs.isDayjs(enquiryStartDateFrom)
        ? enquiryStartDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryStartDateTo: dayjs.isDayjs(enquiryStartDateTo)
        ? enquiryStartDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryEndDateFrom: dayjs.isDayjs(enquiryEndDateFrom)
        ? enquiryEndDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryEndDateTo: dayjs.isDayjs(enquiryEndDateTo)
        ? enquiryEndDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
    };
  }

  //致远流程
  @Bind()
  listener() {
    const {
      location: { search },
    } = this.props;
    const { id, formRecordId } = querystring.parse(search.substring(1));
    // console.log(id,'id致远')
    // console.log(formRecordId,'formRecordId致远')
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'GIVE', 'SEND'].includes(e.data.submitType)) {
          this.save((params) => {
            console.log(params, 'params');
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  // actionInfo: {
                  //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                  // },
                  formData: {
                    formRecordId: id || formRecordId, //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
                    affairTitle: 'ICT转售', //待办流程名称
                    //下面内容为表单数据
                    ...params,
                    // fenzhitiaojian: 'Y',
                    PRjine:
                      params[0]?.totalAmountHkd?.toString().replace(/,/g, '') < 5000000 && params[0].profitMargin > 0
                        ? 'Y'
                        : 'N',
                    toubiaojingli: params[0].tenderManager,
                  },
                },
                e.data.url
              );
            }
          });
        } else {
          this.save((params) => {
            if (params) {
              this.setState({
                btnVisible: true,
              });
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  // actionInfo: {
                  //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                  // },
                  formData: {
                    formRecordId: id || formRecordId, //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
                    affairTitle: 'ICT转售', //待办流程名称
                    //下面内容为表单数据
                    ...params,
                    // fenzhitiaojian: 'Y',
                    PRjine:
                      params[0]?.totalAmountHkd?.toString().replace(/,/g, '') < 5000000 && params[0].profitMargin > 0
                        ? 'Y'
                        : 'N',
                    toubiaojingli: params[0].tenderManager,
                  },
                },
                e.data.url
              );
            }
          });
        }
      }
    });
  }

  // 保存
  @Bind()
  save(callback) {
    //校验标题是否输入
    this.filterForm.props.form.validateFields((err, value) => {
      if (err) {
        return;
      }
    });
    //校验销售订单是否选择
    this.requForm.props.form.validateFields((err, value) => {
      if (err) {
        return;
      }
    });
    //校验需求以及采购页面采购类别，供应商编号等
    this.prForm?.props?.form.validateFields((err, value) => {
      if (!err) {
        const {
          location: { search },
          dispatch,
        } = this.props;
        const { id, formRecordId } = querystring.parse(search.substring(1));
        console.log(id, 'id亚信');
        console.log(formRecordId, 'formRecordId亚信');
        // const id = querystring.parse(location.search)['?id'];
        if (id != 0) {
          const {
            requireDataObj,
            equipmentAndServiceValue,
            esFormValue,
            delIdList,
            delMatIdList,
            deviceInfoList,
          } = this.state;
          const { purchaseInquirySheetModel } = this.props;
          const {
            ictPrDetailMatList,
            ictPrAttachList,
            originalCurrency,
            originalCurrencyStr,
            cmhkIctPrSo,
            cmhkIctPrDeviceInfoList,
            hasCmhkIctPrDeviceInfoList,
            glCode,
            equipmentLineNo,
            currency,
            prer,
            totalAmountHkd,
          } = purchaseInquirySheetModel;
          const searchFormValue = this.filterForm.props.form?.getFieldsValue();
          const prFormValue = this.prForm.props.form?.getFieldsValue();
          const ictPrDetailHeadsList = this.props.location.state?.ictPrDetailHeadsList;
          const _saleNo = ictPrDetailHeadsList?.saleNo;
          this.setState(
            {
              equipmentAndServiceValue: [...equipmentAndServiceValue, ...ictPrDetailMatList],
              attachmentSource: [...ictPrAttachList],
            },
            () => {
              const ictPrDetailHeadsObj = Object.assign(
                searchFormValue,
                prFormValue,
                esFormValue,
                {
                  saleNo: _saleNo,
                  equipmentLineNo,
                  ...requireDataObj,
                  deviceInfoList,
                },
                {
                  id: parseInt(formRecordId) || parseInt(id),
                },
                { originalCurrency },
                { originalCurrencyHkd: originalCurrencyStr },
                { glCode },
                { prer },
                { totalAmountHkd }
              );
              const ictPrDetailHeads = [ictPrDetailHeadsObj];
              let ictPrDetailMats = [...ictPrDetailMatList];
              let ictPrAttachs = [...ictPrAttachList];

              dispatch({
                type: 'purchaseInquirySheetModel/addPurchaseResultApplication',
                payload: {
                  supAccessTryHeads: ictPrDetailHeads[0],
                  cmhkIctPrSo,
                  cmhkIctPrDeviceInfoList: hasCmhkIctPrDeviceInfoList,
                },
              })
                .then((res) => {
                  console.log(res, 'res');
                  this.setState({
                    zyHeads: res?.supAccessTryHeads,
                    zyProSo: res?.cmhkIctPrSo,
                    zyPrDev: res?.cmhkIctPrDeviceInfoList,
                    totalAmountHkd: res?.supAccessTryHeads?.totalAmountHkd,
                    profitMargin: res?.cmhkIctPrSo?.profitMargin,
                    tenderManager: res?.cmhkIctPrSo?.tenderManager
                  });
                  ictPrDetailMats = ictPrDetailMats?.map((item) => {
                    return {
                      ...item,
                      refHeadId: res?.supAccessTryHeads?.id,
                      currency,
                    };
                  });
                  ictPrAttachs = ictPrAttachs?.map((item) => {
                    return {
                      ...item,
                      refHeadId: res?.supAccessTryHeads?.id,
                    };
                  });
                  // 保存物料
                  dispatch({
                    type: 'purchaseInquirySheetModel/addPurchaseResultMaterial',
                    payload: ictPrDetailMats,
                  }).then((res) => {
                    console.log(res,'res物料')
                    this.setState({
                      zyMats: res,
                    });
                  });
                  //保存附件
                  dispatch({
                    type: 'purchaseInquirySheetModel/addPurchaseResultAttach',
                    payload: ictPrAttachs,
                  }).then((res) => {
                    console.log(res,'res附件')
                    this.setState({
                      zyAttachs: res,
                    });
                  });
                  // 删除物料
                  if (delMatIdList.length > 0) {
                    dispatch({
                      type: 'purchaseInquirySheetModel/delMaterials',
                      payload: {
                        id: delMatIdList,
                      },
                    });
                  }
                  //删除附件
                  if (delIdList.length > 0) {
                    dispatch({
                      type: 'purchaseInquirySheetModel/delAttachs',
                      payload: {
                        id: delIdList,
                      },
                    });
                  }
                  setTimeout(() => {
                    this.handleSearchDetails(res.id);
                  }, 600);
                })
                .then(() => {
                  if (typeof callback === 'function') {
                    callback([
                      {
                        totalAmountHkd: this.state.totalAmountHkd,
                        profitMargin: this.state.profitMargin,
                        tenderManager: this.state.tenderManager
                      },
                      this.state.zyHeads,
                      ...(this.state.zyMats || []),
                      ...(this.state.zyAttachs || []),
                      this.state.zyProSo,
                      ...(this.state.zyPrDev || []),
                    ]);
                  }
                  CusNotification.success();
                });
            }
          );
        } else {
          const { requireDataObj, saleNo, equipmentLineNo, esFormValue, deviceInfoList } =
            this.state;
          const { dispatch, purchaseInquirySheetModel } = this.props;
          const {
            ictPrDetailHeadsList,
            ictPrAttachList,
            ictPrDetailMatList,
            originalCurrency,
            originalCurrencyStr,
            cmhkIctPrSo,
            cmhkIctPrDeviceInfoList,
            hasCmhkIctPrDeviceInfoList,
            glCode,
            currency,
            prer,
          } = purchaseInquirySheetModel;
          const searchFormValue = this.filterForm.props.form?.getFieldsValue();
          const prFormValue = this.prForm?.current?.getFieldsValue();
          const ictPrDetailHeadsObj = Object.assign(searchFormValue, prFormValue, esFormValue, {
            ...requireDataObj,
            deviceInfoList,
            saleNo,
            equipmentLineNo,
            id: id == 0 ? null : parseInt(id) || parseInt(formRecordId),
            originalCurrency,
            originalCurrencyHkd: originalCurrencyStr,
            glCode,
            prer,
          });
          const ictPrDetailHeads = [ictPrDetailHeadsObj];
          let ictPrDetailMats = ictPrDetailMatList?.map((item) => {
            return {
              ...item,
              currency,
            };
          });
          let ictPrAttachs = ictPrAttachList;
          dispatch({
            type: 'purchaseInquirySheetModel/addPurchaseResultApplication',
            payload: {
              supAccessTryHeads: ictPrDetailHeads[0],
              cmhkIctPrSo,
              cmhkIctPrDeviceInfoList: hasCmhkIctPrDeviceInfoList,
            },
          }).then((res) => {
            this.setState({
              zyHeads: res?.supAccessTryHeads,
              zyProSo: res?.cmhkIctPrSo,
              zyPrDev: res?.cmhkIctPrDeviceInfoList,
              totalAmountHkd: res?.supAccessTryHeads?.totalAmountHkd,
              profitMargin: res?.cmhkIctPrSo?.profitMargin,
              tenderManager: res?.cmhkIctPrSo?.tenderManager
            });
            ictPrDetailMats = ictPrDetailMats?.map((item) => {
              return {
                ...item,
                refHeadId: res.supAccessTryHeads.id,
              };
            });
            ictPrAttachs = ictPrAttachs?.map((item) => {
              return {
                ...item,
                refHeadId: res?.supAccessTryHeads?.id,
              };
            });
            dispatch({
              type: 'purchaseInquirySheetModel/addPurchaseResultMaterial',
              payload: ictPrDetailMats,
            }).then((res) => {
              console.log(res,'res物料')
              this.setState({
                zyMats: res,
              });
            });
            dispatch({
              type: 'purchaseInquirySheetModel/addPurchaseResultAttach',
              payload: ictPrAttachs,
            }).then((res) => {
              console.log(res,'res附件')
              this.setState({
                zyAttachs: res,
              });
            });
            setTimeout(() => {
              this.handleSearchDetails(res.id);
            }, 600);
            if (typeof callback === 'function') {
              // debugger
              callback([
                {
                  totalAmountHkd: this.state.totalAmountHkd,
                  profitMargin: this.state.profitMargin,
                  tenderManager: this.state.tenderManager
                },
                this.state.zyHeads,
                ...(this.state.zyMats || []),
                ...(this.state.zyAttachs || []),
                this.state.zyProSo,
                ...(this.state.zyPrDev || []),
              ]);
            }
            window.open(
              `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=ICTzhuanshouPRshenpiliucheng&pcThirdContentPageUrl=${encodeURIComponent(
                `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrp-hk/purchaseInquirySheet/add?${querystring.stringify(
                  { id: res.supAccessTryHeads.id }
                )}`
              )}`
            );
            window.close();
            CusNotification.success();
          });
        }
      }
    });
  }

  // 父组件定义方法来获取子组件设备及服务信息
  @Bind()
  getEquipmentAndService(equipmentAndServiceSourceValue) {
    let total = 0;
    equipmentAndServiceSourceValue.map((item) => {
      total += Number(item.quantity) * Number(item.price);
    });
    let esFormValueCopy = this.state.esFormValue;

    esFormValueCopy.totalAmountOc = total.toFixed(2);
    esFormValueCopy.totalAmountHkd = (total * this.state.esFormValue.exchangeRate).toFixed(2);
    this.setState({
      equipmentAndServiceValue: equipmentAndServiceSourceValue,
      totalAmount: total.toFixed(2),
      esFormValue: esFormValueCopy,
    });
  }

  // 接收子组件传递过来的文件信息
  @Bind()
  getFatherFileList(fileList) {
    const { dispatch, purchaseInquirySheetModel } = this.props;
    // const { attachmentSource } = this.state;
    const { ictPrAttachList } = purchaseInquirySheetModel;
    ictPrAttachList.push(fileList[0]);
    const filteredArr = ictPrAttachList.filter((item) => item.refType !== '');
    // this.setState({
    //   attachmentSource: filteredArr,
    // });
    dispatch({
      type: 'purchaseInquirySheetModel/commentUpdateState',
      payload: {
        ictPrAttachList: filteredArr,
      },
    });
  }

  // 接受子组件esForm传递过来的值
  @Bind()
  getEsFormValue(esFormValueAccept) {
    this.setState({ esFormValue: esFormValueAccept });
  }

  // 接收子组件DataTableInfo传递过来要删除的文件id数组
  @Bind()
  getChildDelFileList(idList) {
    this.setState({
      delIdList: idList,
    });
  }

  // 接收子组件DataTableEs传递过来的删除的物料id数组
  @Bind()
  getChildDelMatList(matIdList) {
    this.setState({
      delMatIdList: matIdList,
    });
  }

  // 获取设备信息List
  @Bind()
  getDeviceInfoList(deviceInfoList, salesOrderNo, record) {
    console.log(deviceInfoList, 'deviceInfoList----CIT');
    console.log(record, 'record----');
    const { dispatch, purchaseInquirySheetModel } = this.props;
    this.setState({
      deviceInfoListValue: deviceInfoList,
      saleNo: salesOrderNo,
      requireDataObj: record,
    });
  }

  // 获取设备行号
  @Bind()
  getEquipmentLineNo(equipmentLineNo) {
    this.setState({
      equipmentLineNo,
    });
  }

  //跳转到采购tab
  @Bind()
  jumpPurchase() {
    this.setState({
      tabString: 'scoreSum',
    });
  }

  // 切换tab方法
  @Bind()
  handleTabChange(activeKey = '') {
    this.setState({
      tabString: activeKey,
    });
  }

  //采购结果单号信息查询
  @Bind()
  queryPurChaseResultInfo() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseInquirySheetModel/queryPurchaseResult',
      payload: {},
    }).then((res) => {
      dispatch({
        type: 'purchaseInquirySheetModel/commentUpdateState',
        payload: { basicInfo: res, prApplyStatus: res.prApplyStatus },
      });
    });
  }

  //父组件触发子组件删除
  @Bind()
  mulDelete() {
    console.log(this.ChildRef, 'this.ChildRef');
    this.ChildRef?.handleDelete();
  }

  // 新增一行附件信息
  @Bind()
  handleAttach() {
    const { purchaseInquirySheetModel } = this.props;
    const { ictPrAttachList } = purchaseInquirySheetModel;
    let attachmentSource = [
      ...ictPrAttachList,
      {
        uuid: uuid(),
        _status: 'create',
        refType: '',
        uploadTime: '',
        fileSize: '',
        createdBy: '',
        createdUser: '',
        remark: '',
        filePath: '',
        isDefault: false,
      },
    ];
    this.updateIctPrAttachList(attachmentSource);
  }

  //更新model中附件数据
  @Bind()
  updateIctPrAttachList(fileList) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseInquirySheetModel/commentUpdateState',
      payload: {
        ictPrAttachList: fileList,
      },
    });
  }

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      tabKey,
      purchaseInquirySheetModel,
      form,
      dispatch,
      location: { state },
    } = this.props;
    const {
      contact,
      contactTel,
      ictPrDetailHeadsList,
      ictPrAttachList,
      ictPrDetailMatList,
      prApplyStatus,
    } = purchaseInquirySheetModel;
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      attachmentSource,
      deviceInfoListValue,
      tabString,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
      flag,
      infoState,
      requireDataObj,
      btnVisible,
    } = this.state;
    const searchFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.filterForm = ref;
      },
      purchaseInquirySheetModel,
      form,
      ictPrDetailHeadsList,
    };
    const requFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.requForm = ref;
      },
      purchaseInquirySheetModel,
      ictPrDetailHeadsList,
      form,
      requireDataObj,
    };
    const prFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.prForm = ref;
      },
      form,
      purchaseInquirySheetModel,
      ictPrDetailHeadsList,
      dispatch,
      contact,
      contactTel,
    };
    const esFormProps = {
      dispatch,
      idpValueMap,
      onRef: (ref) => {
        this.esForm = ref;
      },
      form,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
      purchaseInquirySheetModel,
      ictPrDetailHeadsList,
      flag: this.props.location.hasOwnProperty('state'),
    };
    const infoTableProps = {
      ...this.props,
      // onRef: this.onTableRef,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      attachmentSource,
      purchaseInquirySheetModel,
      flag: this.props.location.hasOwnProperty('state'),
    };
    const esTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      purchaseInquirySheetModel,
      ictPrDetailMatList: purchaseInquirySheetModel?.ictPrDetailMatList,
      flag: this.props.location.hasOwnProperty('state'),
      idpValueMap,
    };
    const requTableProps = {
      dispatch,
      ...this.props,
      onRef: this.onTableRef,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      deviceInfoListValue,
      purchaseInquirySheetModel,
    };

    return (
      <>
        <PageWrapper loading={fetchLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <FilterSearch {...searchFormProps} />
            </Panel>
            <div
              style={{
                backgroundColor: '#fff',
                marginTop: '16px',
                display: 'block',
              }}
            >
              <div className={classnames(styles['out-div-tab'])}>
                <CusTabs
                  defaultActiveKey={tabString}
                  activeKey={tabString}
                  onChange={this.handleTabChange}
                  items={[
                    {
                      label: intl.get(`${promptCode}.view.title.requirement`).d('需求'),
                      key: 'scoreDetail',
                      children: (
                        <>
                          <div style={{ padding: '16px' }}>
                            <FilterSearchRequ
                              getDeviceInfoList={this.getDeviceInfoList.bind(this)}
                              {...requFormProps}
                            />
                            {/*<PageWrapper loading={fetchLoading}>*/}
                            <Collapse
                              className={classnames('customize-collapse', styles['show-border'])}
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
                                    title={intl
                                      .get(`${promptCode}.view.title.equipinfo`)
                                      .d('设备信息')}
                                    arrowActive={activeKey.includes('table')}
                                    //showArrow={false}
                                    buttons={
                                      <>
                                        {prApplyStatus == 'PENDING_REFER' ? (
                                          <CusButton
                                            mini
                                            type="primary"
                                            onClick={this.jumpPurchase}
                                          >
                                            {intl
                                              .get(`${promptCode}.view.button.confirm`)
                                              .d('确认')}
                                          </CusButton>
                                        ) : (
                                          ''
                                        )}
                                      </>
                                    }
                                  />
                                }
                                key="table"
                              >
                                <DataTable
                                  getEquipmentLineNo={this.getEquipmentLineNo.bind(this)}
                                  {...requTableProps}
                                />
                              </Panel>
                            </Collapse>
                          </div>

                          {/*</PageWrapper>*/}
                        </>
                      ),
                    },
                    {
                      label: intl.get(`${promptCode}.view.title.procurement`).d('采购'),
                      key: 'scoreSum',
                      children: (
                        <div className={styles['out-div-pageWrapper']}>
                          <div style={{ padding: '16px' }}>
                            <FilterSearchPr {...prFormProps} />
                            {/*<PageWrapper loading={fetchLoading}>*/}
                            <Collapse
                              className={classnames('customize-collapse', styles['show-border'])}
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
                                    title={intl
                                      .get(`${promptCode}.view.title.equipmentinfo`)
                                      .d('设备及服务信息')}
                                    arrowActive={activeKey.includes('table')}
                                    showArrow={false}
                                  />
                                }
                                key="table"
                              >
                                <FilterSearchEs
                                  getEsFormValue={this.getEsFormValue.bind(this)}
                                  {...esFormProps}
                                />
                                <DataTableEs
                                  getEquipmentAndService={this.getEquipmentAndService.bind(this)}
                                  getChildDelMatList={this.getChildDelMatList.bind(this)}
                                  {...esTableProps}
                                />
                              </Panel>
                            </Collapse>
                            {/*</PageWrapper>*/}
                            {/*<PageWrapper loading={fetchLoading}>*/}
                            <Collapse
                              className={classnames('customize-collapse', styles['show-border'])}
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
                                    title={intl
                                      .get(`${promptCode}.view.title.AttachmentInformation`)
                                      .d('附件信息')}
                                    arrowActive={activeKey.includes('info')}
                                    showArrow={false}
                                    buttons={
                                      <>
                                        {prApplyStatus == 'PENDING_REFER' ? (
                                          <>
                                            <CusButton onClick={this.mulDelete} mini>
                                              {intl
                                                .get('HKPC.commom.view.button.bulkdelete')
                                                .d('批量删除')}
                                            </CusButton>
                                            <CusButton
                                              mini
                                              type="primary"
                                              onClick={this.handleAttach}
                                            >
                                              {intl.get(`hzero.common.view.button.add`).d('新建')}
                                            </CusButton>
                                          </>
                                        ) : (
                                          ''
                                        )}
                                      </>
                                    }
                                  />
                                }
                                key="info"
                              >
                                <DataTableInfo
                                  onRef={(node) => (this.ChildRef = node)}
                                  getFatherFileList={this.getFatherFileList.bind(this)}
                                  getChildDelFileList={this.getChildDelFileList.bind(this)}
                                  {...infoTableProps}
                                />
                              </Panel>
                            </Collapse>
                            {/*</PageWrapper>*/}
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </Collapse>
        </PageWrapper>
        {/* <div style={{ display: btnVisible == true ? 'none' : 'block' }}> */}
          <CusApprovalButtons
            approvalRequestButtonVOList={[]}
            ref={this.cusApprovalBtns}
            children={
              <>
                <CusButton onClick={this.save}>
                  {intl.get(`hzero.common.view.button.save`)}
                </CusButton>
                {/* <CusButton onClick={this.submit}>提交</CusButton> */}
              </>
            }
          ></CusApprovalButtons>
        {/* </div> */}
      </>
    );
  }
}
