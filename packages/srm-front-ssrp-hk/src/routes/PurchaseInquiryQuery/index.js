import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusExcelExport from '_cus_components/CusExcelExport';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';

const organizationId = getCurrentOrganizationId();

const prefix = `/cmhk-purchase-requisition/v1/${organizationId}/ict-pr-detail-heads`;

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseInquiryQueryModel, loading }) => ({
  purchaseInquiryQueryModel,
  fetchLoading: loading.effects['purchaseInquiryQueryModel/queryPurchaseInquiryList'],
  submitLoading: loading.effects['resaleRfq/submitSummary'] ||
    loading.effects['resaleRfq/ictsSubmitSummary'] ||
    loading.effects['resaleRfq/submitValidateSummary'] ||
    loading.effects['resaleRfq/ictsSubmitValidateSummary'] ||
    loading.effects['resaleRfq/submitEnquiryPriceSummary'] ||
    loading.effects['resaleRfq/submitValidateCommonSummary'],
  publishLoading: loading.effects['resaleRfq/publishSummary'] ||
    loading.effects['resaleRfq/ictsPublishSummary'] ||
    loading.effects['resaleRfq/publishEnquiryPriceSummary'] ||
    loading.effects['resaleRfq/submitValidateCommonSummary'],
  deleteLoading: loading.effects['resaleRfq/deleteEnquiryPriceByList'],
  queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
  exportLoading: loading.effects['resaleRfq/enquiryExport'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.PRRECORDSSTATUS'
])
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      detailInfo: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * @description 查询询价汇总数据
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const queryObj = this.getQueryParams();
    // console.log(...queryObj, 'queryObj')
    dispatch({
      type: 'purchaseInquiryQueryModel/queryPurchaseInquiryList',
      payload: {
        page,
        ...queryObj,
      },
    }).then(res => {
      if (res) {
        if (this.table) {
          const { clearState = (e) => e } = this.table;
          clearState();
        }
      }
    });
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

  @Bind
  translateEbsCode(code) {
    const { idpValueMap = {} } = this.props;
    const valuelist = idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] || [];
    const { meaning } = valuelist.find((item) => item.value === code) || {};
    return meaning;
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


  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    console.log(data);
    let idStr = '';
    const length = data.length;
    data.map((item, index) => {
      idStr += item.id;
      if (index !== length - 1) {
        idStr += ',';
      }
    });
    const { dispatch } = this.props;
    const deleteFlag = data.every(item => item.prApplyStatus === 'PENDING_REFER');
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'purchaseInquiryQueryModel/deletePurchaseResultApplication',
            payload: { id: idStr, organizationId },
          }).then(res => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“草稿”的采购单'),
      });
    }
  }

  /**
   * @description 批量创建
   */
  @Bind()
  handleMassCreate() {
    const { history } = this.props;
    const { isPub } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/ssrc/resale-rfq/batchImport`,
    });
  }

  @Bind()
  handleSubmit(onlySubmit = 'N') {
    const { dispatch } = this.props;
    const { selectSubmitData = [] } = this.state;
    dispatch({
      type: 'resaleRfq/submitValidateSummary',
      payload: selectSubmitData.map(item => {
        return {
          enquiryPriceId: item.enquiryPriceId,
          enquiryPriceRoundsId: item.enquiryPriceRoundsId,
        };
      }),
    }).then(r => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitSummary',
          payload: {
            enquiryPriceList: selectSubmitData,
            onlySubmit,
          },
        }).then(res => {
          if (res) {
            this.setState({
              submitModalVisible: false,
            });
            CusNotification.success();
            this.handleSearch();
          }
        });
      }
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
        enquiryPriceRoundsList: data.map(item => {
          return {
            enquiryPriceId: item.enquiryPriceId,
            enquiryPriceRoundsId: item.enquiryPriceRoundsId,
          };
        }),
        typeCode: 'CHINA_DIA',
        validateAllFlag: 'Y',
      },
    }).then(r => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitEnquiryPriceSummary',
          payload: {
            typeCode: 'CHINA_DIA',
            enquiryPriceRoundsList: data,
            onlySubmit,
          },
        }).then(res => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
          }
        });
      }
    });
  }

  /**
   * 新增模板，跳转到明细页面
   */
  @Bind()
  handleAddTemplate() {
    const { dispatch } = this.props;
    const { isPub } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/ssrp-hk/purchaseInquirySheet/add`,
        search: querystring.stringify({ id: 0 })
      }),
    );
  }

  render() {
    const supplierDataExportProps = {
      requestUrl: `${prefix}/supplier/search/ictListExport`,
      method: 'POST',
      downloadType: 'Blob',
      buttonText: intl.get(`${promptCode}.view.button.export`).d('导出'),
      fileName:
        intl.get(`${promptCode}.view.button.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams,
    };
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      purchaseInquiryQueryModel,
    } = this.props;

    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
    } = this.state;
    const formProps = {
      idpValueMap,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      },
    };
    const tableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      // onExport: this.handleExport,
    };

    return (
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
                title={intl.get(`hzero.common.view.button.search`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterSearch {...formProps} />
          </Panel>

          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                showArrow={false}
                buttons={
                  <>
                    <CusExcelExport
                      otherButtonProps={{ mini: true }}
                      {...supplierDataExportProps}
                    />
                    <CusButton onClick={this.handleAddTemplate} mini type="primary">
                      {intl.get(`hzero.common.view.button.add`).d('新建')}
                    </CusButton>
                  </>
                }
              />
            }
            key="table"
          >
            <DataTable {...tableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
