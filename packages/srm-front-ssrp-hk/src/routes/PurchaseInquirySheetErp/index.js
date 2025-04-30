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
    if (!this.props.location.hasOwnProperty('state')) {
      this.queryPurChaseResultInfo(); // 新增的时候需要查询userInfo
    } else {
      this.setState({
        tabString: 'scoreSum',
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


  // 保存
  @Bind()
  save() {
    if (this.filterForm.props.form?.getFieldsValue().prApplyTitle == undefined ||
      this.state.esFormValue.totalAmountOc == undefined ||
      this.state.esFormValue.totalAmountHkd == undefined ||
      this.state.esFormValue.originalCurrency == undefined ||
      this.prForm?.current?.getFieldsValue().prType == undefined ||
      this.prForm?.current?.getFieldsValue().prer == undefined ||
      this.prForm?.current?.getFieldsValue().supNo == undefined ||
      this.prForm?.current?.getFieldsValue().supContact == undefined ||
      this.prForm?.current?.getFieldsValue().supPhone == undefined ||
      this.prForm?.current?.getFieldsValue().supEmail == undefined ||
      this.prForm?.current?.getFieldsValue().supDeliveryAddress == undefined) {
      this.filterForm.props.form?.validateFields((err, values) => {
        if (err) {
          CusNotification.warning({
            message: intl.get(`scpc.CollaborationWrite.validateNotPass`).d('存在必输字段未维护！'),
          });
        }
        return 0;
      });
      this.prForm?.current?.validateFields((err, values) => {
        if (err) {
          CusNotification.warning({
            message: intl.get(`scpc.CollaborationWrite.validateNotPass`).d('存在必输字段未维护！'),
          });
        }
        return 0;
      });
      this.esForm?.current?.validateFields((err, values) => {
        if (err) {
          CusNotification.warning({
            message: intl.get(`scpc.CollaborationWrite.validateNotPass`).d('存在必输字段未维护！'),
          });
        }
        return 0;
      });
    } else {
      if (this.props.location.hasOwnProperty('state') && this.props.location.state !== 'undefined') {
        const {
          attachmentSource,
          equipmentAndServiceValue,
          saleNo,
          equipmentLineNo,
          esFormValue,
          delIdList,
          delMatIdList,
          ictPrAttachListValue,
          idsValue,
        } = this.state;
        const { dispatch } = this.props;
        const searchFormValue = this.filterForm.props.form?.getFieldsValue();
        const prFormValue = this.prForm?.current?.getFieldsValue();
        const ictPrDetailHeadsList = this.props.location.state?.ictPrDetailHeadsList;
        const _saleNo = ictPrDetailHeadsList.saleNo;
        const _equipmentLineNo = ictPrDetailHeadsList.equipmentLineNo;
        const ictPrDetailMatList = this.props.location.state?.ictPrDetailMatList;
        const ictPrAttachList = ictPrAttachListValue == [] ? this.props.location.state?.ictPrAttachList : ictPrAttachListValue;
        this.setState({
          equipmentAndServiceValue: [...equipmentAndServiceValue, ...ictPrDetailMatList],
          attachmentSource: [...attachmentSource, ...ictPrAttachList],
        }, () => {
          // console.log('equipmentAndServiceValue', this.state.equipmentAndServiceValue)
          // console.log('attachmentSource', this.state.attachmentSource)
          const ictPrDetailHeadsObj = Object.assign(searchFormValue, prFormValue, esFormValue, {
            saleNo: _saleNo,
            equipmentLineNo: _equipmentLineNo,
          }, { id: ictPrDetailHeadsList.id, _token: ictPrDetailHeadsList._token });
          const ictPrDetailHeads = [ictPrDetailHeadsObj];

          // 辅助对象用于存储已经出现过的元素
          const seen = {};

          const ictPrDetailMatsUnique = this.state.equipmentAndServiceValue.filter(item => {
            const stringifiedItem = JSON.stringify(item);
            if (!seen[stringifiedItem]) {
              seen[stringifiedItem] = true;
              return true;
            }
            return false;
          });
          let ictPrDetailMats = [...ictPrDetailMatsUnique];

          let ictPrAttachs = [...this.state.attachmentSource];
          dispatch({
            type: 'purchaseInquirySheetModelErp/addPurchaseResultApplication',
            payload: ictPrDetailHeads,
          }).then((res) => {
            ictPrDetailMats = ictPrDetailMats.map(item => {
              return {
                ...item,
                refHeadId: res[0].id,
              };
            });
            ictPrAttachs = ictPrAttachs.map(item => {
              return {
                ...item,
                refHeadId: res[0].id,
              };
            });
            // 保存物料
            dispatch({
              type: 'purchaseInquirySheetModelErp/addPurchaseResultMaterial',
              payload: ictPrDetailMats,
            }).then((res) => {
              // console.log(res);
            });
            //保存附件
            dispatch({
              type: 'purchaseInquirySheetModelErp/addPurchaseResultAttach',
              payload: ictPrAttachs,
            }).then((res) => {
              // console.log(res);
            });
            // 删除物料
            if (delMatIdList.length > 0) {
              console.log('delMatIdList', delMatIdList);
              dispatch({
                type: 'purchaseInquirySheetModelErp/delMaterials',
                payload: {
                  id: delMatIdList,
                },
              });
            }
            //删除附件
            if (delIdList.length > 0) {
              dispatch({
                type: 'purchaseInquirySheetModelErp/delAttachs',
                payload: {
                  id: delIdList,
                },
              });
            }
            dispatch(
              routerRedux.push({
                pathname: `/ssrp-hk/purchaseInquiryQuery`,
              }),
            );
          });
        });
      } else {
        const {
          attachmentSource,
          equipmentAndServiceValue,
          saleNo,
          equipmentLineNo,
          esFormValue,
        } = this.state;
        const { dispatch } = this.props;
        const searchFormValue = this.filterForm.props.form?.getFieldsValue();
        const prFormValue = this.prForm?.current?.getFieldsValue();
        const ictPrDetailHeadsObj = Object.assign(searchFormValue, prFormValue, esFormValue, {
          saleNo,
          equipmentLineNo,
        });
        const ictPrDetailHeads = [ictPrDetailHeadsObj];
        let ictPrDetailMats = equipmentAndServiceValue;
        let ictPrAttachs = attachmentSource;
        dispatch({
          type: 'purchaseInquirySheetModelErp/addPurchaseResultApplication',
          payload: ictPrDetailHeads,
        }).then((res) => {
          // debugger
          ictPrDetailMats = ictPrDetailMats.map(item => {
            return {
              ...item,
              refHeadId: res[0].id,
            };
          });
          ictPrAttachs = ictPrAttachs.map(item => {
            return {
              ...item,
              refHeadId: res[0].id,
            };
          });
          dispatch({
            type: 'purchaseInquirySheetModelErp/addPurchaseResultMaterial',
            payload: ictPrDetailMats,
          }).then((res) => {
            // console.log(res);
          });
          dispatch({
            type: 'purchaseInquirySheetModelErp/addPurchaseResultAttach',
            payload: ictPrAttachs,
          }).then((res) => {
            // console.log(res);
          });
          dispatch(
            routerRedux.push({
              pathname: `/ssrp-hk/purchaseInquiryQuery`,
            }),
          );
        });
      }
    }
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
      submitLoading = false,
      tabKey,
      purchaseInquirySheetModelErp,
      form,
      dispatch,
      location: { state },
    } = this.props;
    const { contact, contactTel } = purchaseInquirySheetModelErp;

    // console.log(state)
    const {
      activeKey, modalVisible = false, submitModalVisible = false,
      attachmentSource,
      deviceInfoListValue,
      tabString,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
      flag,
    } = this.state;

    const searchFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.filterForm = ref;
      },
      purchaseInquirySheetModelErp,
      form,
      ictPrDetailHeadsList: state?.ictPrDetailHeadsList,
    };
    const requFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.requForm = ref.requForm;
      },
    };
    const prFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.prForm = ref.prForm;
      },
      form,
      ictPrDetailHeadsList: state?.ictPrDetailHeadsList,
      dispatch,
      contact,
      contactTel
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
    };
    const tableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      attachmentSource,
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
    };
    const requTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      deviceInfoListValue,
    };

    const contentProps = {
      // docStatus: evalStatus,
      // evalHeaderId,
      // tableData: tableData[tabKey],
      // pagination: paginationData[tabKey],
      // granularity,
      // loading: initialLoading || scoreSumLoading || scoreVendorLoading || searchLoading,
      openModal: this.handleOpenModal,
    };

    return (
      <PageWrapper loading={fetchLoading}>
        {/* // this.form.current.getFieldsValue()*/}
        <CusButton onClick={this.save}>保存</CusButton>
        <Collapse
          className='customize-collapse'
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
            key='form'
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
                    label: intl
                      .get(`sslm.supplierDocManage.model`)
                      .d('需求'),
                    key: 'scoreDetail',
                    children: (
                      <>
                        <div style={{ padding: '16px' }}>
                          <FilterSearchRequ getDeviceInfoList={this.getDeviceInfoList.bind(this)} {...requFormProps} />
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
                                  title={intl.get(`hzero.common`).d('设备信息')}
                                  arrowActive={activeKey.includes('table')}
                                  showArrow={false}
                                  buttons={
                                    <>
                                      <CusButton mini type='primary' onClick={this.jumpPurchase}>确认</CusButton>
                                    </>
                                  }
                                />
                              }
                              key='table'
                            >
                              <DataTable getEquipmentLineNo={this.getEquipmentLineNo.bind(this)} {...requTableProps} />
                            </Panel>
                          </Collapse>
                          {/*</PageWrapper>*/}
                        </div>
                      </>
                    ),
                  },
                  {
                    label: intl
                      .get(`sslm.supplierDocManage.model`)
                      .d('采购'),
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
                                  buttons={
                                    <>
                                      <CusButton onClick={this.mulDelete} mini>批量删除</CusButton>
                                      <CusButton mini type='primary' onClick={this.handleAddAttachment}>新增</CusButton>
                                    </>
                                  }
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
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </Collapse>
      </PageWrapper>
    );
  }
}
