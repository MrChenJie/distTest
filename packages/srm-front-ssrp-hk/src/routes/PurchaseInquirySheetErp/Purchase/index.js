import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusButton from '_cus_components/CusButton';
import styles from './index.less';
import classnames from 'classnames';
import FilterSearchPr from './FilterSearchPr';
import FilterSearchEs from './FilterSearchEs';
import DataTableEs from './DataTableEs';
import DataTableInfo from './DataTableInfo';
import uuid from 'uuid/v4';
import { Form } from 'hzero-ui';


/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseInquirySheetModelErp, loading }) => ({
  purchaseInquirySheetModelErp,
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
])
@Form.create()

export default class purchaseInquirySheetErp extends React.Component {
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
      deviceInfoListValue: [], //接收从子组件传过来的设备信息list
      tabString: 'scoreDetail', //tabs标签页
      saleNo: '', // 销售订单编号
      equipmentLineNo: '', //设备行号
      filterForm: {},
      esFilterForm: {},
      id: 0,
      totalAmount: 0,
      esFormValue: {},
      flag: false,
      delMatIdList: [], // 删除的物料的id值
      delIdList: [], // 删除的文件list的id值
      ictPrAttachListValue: [],
      idsValue: [],
    };
  }

  componentDidMount() {
    // if (!this.props.location.hasOwnProperty('state')) {
    //   this.queryPurChaseResultInfo(); // 新增的时候需要查询userInfo
    // } else {
    //   this.setState({
    //     tabString: 'scoreSum',
    //   });
    // }
    this.handleSearch();
  }


  @Bind()
  handleSearch() {
    const { dispatch, location: { search } } = this.props;
    const { oddNumber } = querystring.parse(search.substring(1));
    if (oddNumber) {
      dispatch({
        type: 'purchaseInquirySheetModelErp/editPurchaseResultApplication',
        payload: {
          id: oddNumber
        },
      }).then(res => {
        if (res) {
          console.log(res, 'res')
          dispatch({
            type: 'purchaseInquirySheetModelErp/commentUpdateState',
            payload: {
              originalCurrency: res.ictPrDetailHeadsList.originalCurrency,
              originalCurrencyStr: res.ictPrDetailHeadsList.originalCurrencyHkd,
              ictPrDetailHeadsList: res.ictPrDetailHeadsList,
              ictPrAttachList: res.ictPrAttachList,
              ictPrDetailMatList: res.ictPrDetailMatList.map(item => {
                return {
                  ...item,
                  _status: 'update',
                };
              }),
              cmhkIctPrSo: res.cmhkIctPrSo,
              cmhkIctPrDeviceInfoList: res.cmhkIctPrDeviceInfoList,
              equipmentLineNo: res.ictPrDetailHeadsList.equipmentLineNo,
              glCode: res.ictPrDetailHeadsList.glCode
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'purchaseInquirySheetModelErp/commentUpdateState',
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

  @Bind()
  setChildComponentRef = (ref) => {
    this.childComponent = ref;
  };

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
   * 转义值集
   * @param {*} list - 值集列表
   * @param {*} value - 值
   */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find((e) => e.value === value);
    if (item) {
      return item.description;
    }
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

  @Bind()
  handleCreateQuotation() {
    const { idpValueMap } = this.props;
    const { dataList = {}, isPub } = this.state;
    const values = this.createForm?.current?.getFieldsValue() || {};
    let path;
    const description = this.getFastCode(
      idpValueMap.RS_IBOSS_PRODUCT_TYPE_ISP_RFP,
      values.productType,
    );
    if (values.productType) {
      if (description === 'SP_RFP_TEMPLATE') {
        path = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/standard/create`;
      } else if (description === 'SP_RFP_ICTS_TEMPLATE') {
        path = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/create`;
      } else if (description === 'SP_RFP_CDIA_TEMPLATE') {
        path = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/china-dia/create`;
      } else {
        CusNotification.error({
          message: intl.get('ssrc.resaleRfq.view.message.noModal').d('匹配不到模板'),
        });
        return 0;
      }
      this.setState({
        modalVisible: false,
      });
      this.createForm?.current?.resetFields();
      window.open(`${path}?${querystring.stringify({ ...dataList, ...values })}`, '_blank');
      // openTab({
      //   key: path,
      //   path,
      //   search: querystring.stringify({
      //     ...dataList,
      //     ...values,
      //   }),
      // });
      // setTimeout(() => {
      //   closeTab('/ssrc/resale-rfq');
      // }, 200);
    } else {
      CusNotification.error({
        message: intl.get('ssrc.resaleRfq.view.modal.warning').d('请选择询价单类型'),
      });
    }
  }

  @Bind()
  handleRequireCodeChange(val, dataList) {
    this.setState({
      dataList,
    });
    this.createForm?.current?.setFieldsValue({
      subSoId: dataList.subSoId,
      subsId: dataList.subsId,
      soEnquiryCode: dataList.handleCode,
      soRequireCode: dataList.requireCode,
      orderOwner: dataList.orderOwnerCode,
      orderOwnerMeaning: dataList.orderOwnerName,
      contractEntityNo: dataList.contractEntityEbsCode,
      contractEntityNoMeaning: this.translateEbsCode(dataList.contractEntityEbsCode),
      sprNumber: dataList.sprNo,
      nonSlaNumber: dataList.unslaNo,
      soRequireNo: `${dataList.handleCode ? dataList.handleCode : ''}${dataList.requireCode && dataList.handleCode ? '/' : ''
        }${dataList.requireCode ? dataList.requireCode : ''}`,
      productType: ['6600200001', '6600200003'].includes(dataList.productType)
        ? '6600202'
        : dataList.productType,
      productTypeMeaning: dataList.productName,
      empty: '',
      sprRequestId: dataList.sprRequestId,
      ibossBussinessType: dataList.ibossBussinessType,
      custId: dataList.custId,
      custName: dataList.custName,
      endCustomer: dataList.endCustomer,
    });
  }


  /**
   * @description 公用的提交 handleSubmitCommon
   * @param {*} data 提交的数据
   * @param {*} onlySubmit 是否是只提交
   */
  @Bind()
  handleSubmitCommon(data = [], onlySubmit = 'N') {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/submitValidateCommonSummary',
      payload: {
        enquiryPriceRoundsList: data.map((item) => {
          return {
            enquiryPriceId: item.enquiryPriceId,
            enquiryPriceRoundsId: item.enquiryPriceRoundsId,
          };
        }),
        typeCode: 'CHINA_DIA',
        validateAllFlag: 'Y',
      },
    }).then((r) => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitEnquiryPriceSummary',
          payload: {
            typeCode: 'CHINA_DIA',
            enquiryPriceRoundsList: data,
            onlySubmit,
          },
        }).then((res) => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
          }
        });
      }
    });
  }


  // 新增一行附件信息
  @Bind()
  handleAddAttachment() {
    const { attachmentSource } = this.state;
    this.setState({
      attachmentSource: [...attachmentSource, {
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
      }],
    });
  }

  // 父组件定义方法来获取子组件设备及服务信息
  @Bind()
  getEquipmentAndService(equipmentAndServiceSourceValue) {
    console.log(equipmentAndServiceSourceValue, 'equipmentAndServiceSourceValue');
    let total = 0;
    equipmentAndServiceSourceValue.map(item => {
      total += Number(item.quantity) * Number(item.price);
    });
    // console.log(total)
    console.log('this.state.esFormValue', this.state.esFormValue);
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
    const { attachmentSource } = this.state;
    attachmentSource.push(fileList[0]);
    const filteredArr = attachmentSource.filter(item => item.refType !== '');
    this.setState({
      attachmentSource: filteredArr,
    });
  }

  // 接受子组件esForm传递过来的值
  @Bind()
  getEsFormValue(esFormValueAccept) {
    console.log('esFormValueAccept', esFormValueAccept);
    console.log(this.state.totalAmount, 'this.state.totalAmount');
    // esFormValueAccept.totalAmountOc = this.state.totalAmount
    // esFormValueAccept.totalAmountHkd = this.state.totalAmount * esFormValueAccept.exchangeRate;

    this.setState({ esFormValue: esFormValueAccept });
  }

  // 接收子组件DataTableInfo传递过来要删除的文件id数组
  @Bind()
  getChildDelFileList(idList) {
    console.log(idList);
    this.setState({
      delIdList: idList,
    });
  }

  // 接收子组件DataTableEs传递过来的删除的物料id数组
  @Bind()
  getChildDelMatList(matIdList) {
    console.log(matIdList, 'matIdList');
    this.setState({
      delMatIdList: matIdList,
    });
  }

  // 获取设备信息List
  @Bind()
  getDeviceInfoList(deviceInfoList, salesOrderNo) {
    this.setState({
      deviceInfoListValue: deviceInfoList,
      saleNo: salesOrderNo,
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
      type: 'purchaseInquirySheetModelErp/queryPurchaseResult',
      payload: {},
    }).then((res) => {
      dispatch({
        type: 'purchaseInquirySheetModelErp/commentUpdateState',
        payload: { basicInfo: res },
      });
    });
  }

  //父组件触发子组件删除
  @Bind()
  mulDelete() {
    this.ChildRef?.handleDelete()
  }

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      purchaseInquirySheetModelErp,
      form,
      dispatch,
      location: { state },
    } = this.props;
    const { contact, contactTel } = purchaseInquirySheetModelErp;
    const {
      activeKey, modalVisible = false, submitModalVisible = false,
      attachmentSource,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
    } = this.state;

    const prFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.prForm = ref.prForm;
      },
      form,
      ictPrDetailHeadsList: state?.ictPrDetailHeadsList,
      dispatch,
      contact,
      contactTel,
      purchaseInquirySheetModelErp
    };
    const esFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.esForm = ref.esForm;
      },
      form,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
      ictPrDetailHeadsList: state?.ictPrDetailHeadsList,
      flag: this.props.location.hasOwnProperty('state'),
      purchaseInquirySheetModelErp
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
      ictPrAttachList: state?.ictPrAttachList,
      flag: this.props.location.hasOwnProperty('state'),
      purchaseInquirySheetModelErp
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
      ictPrDetailMatList: state?.ictPrDetailMatList,
      flag: this.props.location.hasOwnProperty('state'),
      purchaseInquirySheetModelErp
    };
    return (
      <PageWrapper loading={fetchLoading}>
        <Collapse
          className='customize-collapse'
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              marginTop: '16px',
              display: 'block',
            }}
          >
            <div className={classnames(styles['out-div-tab'])}>
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
                          title={intl.get(`hzero.common`).d('设备及服务信息')}
                          arrowActive={activeKey.includes('table')}
                          showArrow={false}
                        />
                      }
                      key='table'
                    >
                      <FilterSearchEs getEsFormValue={this.getEsFormValue.bind(this)} {...esFormProps} />
                      <DataTableEs
                        getEquipmentAndService={this.getEquipmentAndService.bind(this)}
                        getChildDelMatList={this.getChildDelMatList.bind(this)} {...esTableProps} />
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
                          title={intl.get(`hzero.common`).d('附件信息')}
                          arrowActive={activeKey.includes('info')}
                          showArrow={false}
                        />
                      }
                      key='info'
                    >
                      <DataTableInfo
                        getFatherFileList={this.getFatherFileList.bind(this)}
                        getChildDelFileList={this.getChildDelFileList.bind(this)}
                        onRef={node => this.ChildRef = node}
                        {...infoTableProps}
                      />
                    </Panel>
                  </Collapse>
                  {/*</PageWrapper>*/}
                </div>
              </div>
            </div>
          </div>
        </Collapse>
      </PageWrapper>
    );
  }
}
