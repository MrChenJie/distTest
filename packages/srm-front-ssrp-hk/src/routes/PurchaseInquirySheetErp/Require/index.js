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
import DataTable from './DataTable';
import styles from './index.less';
import classnames from 'classnames';
import FilterSearchRequ from './FilterSearchRequ';
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
    //加载查询页面数据
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


  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      purchaseInquirySheetModelErp,
      form,
      dispatch,
      location: { state },
    } = this.props;
    const { cmhkIctPrSo, cmhkIctPrDeviceInfoList } = purchaseInquirySheetModelErp;
    const {
      activeKey, modalVisible = false, submitModalVisible = false,
      deviceInfoListValue,
    } = this.state;
    const requFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.requForm = ref.requForm;
      },
      cmhkIctPrSo,
      form
    };
    const requTableProps = {
      ...this.props,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      getQueryParams: this.getQueryParams,
      deviceInfoListValue,
      cmhkIctPrDeviceInfoList
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
              <div style={{ padding: '16px' }}>
                <FilterSearchRequ getDeviceInfoList={this.getDeviceInfoList.bind(this)} {...requFormProps} />
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
                      />
                    }
                    key='table'
                  >
                    <DataTable getEquipmentLineNo={this.getEquipmentLineNo.bind(this)} {...requTableProps} />
                  </Panel>
                </Collapse>
              </div>
            </div>
          </div>
        </Collapse>
      </PageWrapper>
    );
  }
}
