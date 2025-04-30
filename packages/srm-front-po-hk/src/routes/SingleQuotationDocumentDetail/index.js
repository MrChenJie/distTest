/**
 * index.js -  50w<hkd<=100w 报价文件详情
 * @date: 2024-01-05
 * @author: <huasheng.fang@hand-china.com>
 */
import React, { Component } from 'react';
import ProjectBaseInfoForm from './ProjectBaseInfoForm2';
import QuotationListTable from './QuotationListTable2';
import QuotationClauseTable from './QuotationClauseTable2';
import InquiryRound from './InquiryRound2';
import { Form } from 'hzero-ui';
import querystring from 'querystring';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
// import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
import { createPagination, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
// import CusNotification from '_cus_components/CusNotification';
// import CusMultiLov from '_cus_components/CusMultiLov';
// import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import ComparePriceModal from './ComparePriceModal';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const prefix = `/cmhk-pr-center/v1/${organizationId}`;
const promptCode = 'HKPC.commom';
@formatterCollections({
  code: [promptCode],
})
@connect(({ loading = {}, evaluationList = {}, singlePurchaseApplicationModel }) => ({
  evaluationList,
  singlePurchaseApplicationModel,
  fetchLoading:
    loading.effects['singlePurchaseApplicationModel/getQuotationDetail'] ||
    loading.effects['singlePurchaseApplicationModel/getQuotationListDetail'] ||
    loading.effects['singlePurchaseApplicationModel/getQuotationClauseDetail'],
}))
@Form.create()
export default class PeriodAddition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {}, // 查询条件
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'formTwo', 'tableOne', 'tableTwo'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
      openVisible: false, // 弹框是否开启
      priceColumns: [], // 比价里的的columns
    };
  }

  componentDidMount() {
    this.handleQueryData();
  }

  // 查询数据
  handleQueryData = () => {
    const { dispatch } = this.props;
    const {
      id,
      rounds,
      prName,
      prNumber,
      currency,
      refPrFirstId,
      projectNumber,
    } = querystring.parse(this.props.location.search.substr(1));
    
    // 查询报价文件详情数据
    dispatch({
      type: 'singlePurchaseApplicationModel/getQuotationDetail',
      payload: {
        id,
        refPrFirstId,
        projectNumber,
        currency,
        prNumber,
        prName,
        rounds,
      },
    }).then((res) => {
      if (res) {
        const infomationForm = {
          ...res?.prThirdHeadVO,
          prNumber: prNumber,
          prName: prName,
          estimatedHKD: numberRender(res?.prThirdHeadVO?.estimatedHKD, 2),
        };
        console.log('infomationForm', infomationForm);
        dispatch({
          type: 'singlePurchaseApplicationModel/updateState',
          payload: {
            infomationForm, // 项目基本信息
            inquiryRoundForm: res?.prThirdStageLineVO, // 询价轮次
          },
        });
      }
    });
    // 新报价表数据
    this.getPriceList();
    // 查询报价文件详情数据——报价条款
    dispatch({
      type: 'singlePurchaseApplicationModel/getQuotationClauseDetail',
      payload: {
        id,
        refPrFirstId,
        projectNumber,
        currency,
        rounds,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationTermsId: uuidv4(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationModel/updateState',
          payload: {
            quotationTermsList: newDataSource, // 报价条款数据
            quotationTermsPagination: pagination, // 报价条款分页
          },
        });
      }
    });
  };

  // 单独查询报价表
  handleQuotationListDetail = (page = {}) => {
    const { dispatch } = this.props;
    const {
      id,
      rounds,
      currency,
      refPrFirstId,
      projectNumber,
    } = querystring.parse(this.props.location.search.substr(1));
    dispatch({
      type: 'singlePurchaseApplicationModel/getQuotationListDetail',
      payload: {
        page,
        id,
        refPrFirstId,
        projectNumber,
        currency,
        rounds,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationId: uuidv4(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationModel/updateState',
          payload: {
            quotationList: newDataSource, // 报价表数据
            quotationPagination: pagination, // 报价表分页
          },
        });
      }
    });
  };

  // 报价表数据
  @Bind
  getPriceList(page = {}) {
    const { dispatch } = this.props;
    const {
      id,
      rounds,
    } = querystring.parse(this.props.location.search.substr(1));
    dispatch({
      type: 'singlePurchaseApplicationModel/getPriceList',
      payload: {
        page,
        id,
        rounds,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationModel/updateState',
          payload: {
            priceList: newDataSource,
            priceListPagination: pagination,
          },
        });
      }
    });
  }

  // 比价弹框打开
  @Bind
  handleComparePricebutton() {
    this.handleQuotationListDetail();
    this.setState({
      openVisible: true,
    });
    // dispatch({
    //   type: 'singlePurchaseApplicationModel/getPriceDetail',
    //   payload: {
    //     id: match.params.id,
    //     refPrFirstId: match.params.refPrFirstId,
    //     projectNumber: match.params.projectNumber,
    //     currency: match.params.currency,
    //     rounds: match.params.rounds,
    //   },
    // }).then((res) => {
    //   if (res) {
    //     // console.log('res', res);
    //     const { materiaNameList = [], supplierNameList = [], priceMap = {} } = res;
    //     let dataSource = [];
    //     materiaNameList?.map((item, index) => {
    //       let obj = {
    //         materiaName: materiaNameList[index],
    //       };
    //       supplierNameList.map((item2, index2) => {
    //         if (`${item}$${item2}` in priceMap) {
    //           obj[item2] = priceMap[`${item}$${item2}`];
    //         }
    //       });
    //       dataSource.push(obj);
    //       // return obj;
    //     });
    //     // console.log('dataSource', dataSource);

    //     let columns = [
    //       {
    //         title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
    //         width: 80,
    //         render: (val, record, index) => {
    //           return index + 1;
    //         },
    //       },
    //       {
    //         dataIndex: 'materiaName',
    //         key: 'materiaName',
    //         width: 160,
    //         title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
    //         render: tooltipRender,
    //       },
    //     ];
    //     supplierNameList?.map((item2, index2) => {
    //       let obj = {
    //         width: 200,
    //         title: item2,
    //         dataIndex: item2,
    //         key: item2,
    //         render: (record) => {
    //           return (
    //             <div style={{ textAlign: 'right' }}>
    //               {record === '未报价' ? record : tooltipRender(numberRender(record, 2))}
    //             </div>
    //           );
    //         },
    //       };
    //       columns.push(obj);
    //     });

    //     dispatch({
    //       type: 'singlePurchaseApplicationModel/updateState',
    //       payload: {
    //         priceList: dataSource,
    //       },
    //     });
    //     this.setState({
    //       priceColumns: columns,
    //     });
    //   }
    // });
  }

  // 比价弹框确认
  @Bind
  handleConfim() {
    this.setState({
      openVisible: false,
    });
  }

  // 比价弹框取消
  @Bind
  handleCancel() {
    this.setState({
      openVisible: false,
    });
  }

  render() {
    const { singlePurchaseApplicationModel, form, fetchLoading = false, match } = this.props;
    const { activeKey, openVisible, priceColumns } = this.state;
    const {
      infomationForm, // 项目基本信息
      inquiryRoundForm, // 询价轮次
      quotationList, // 报价表数据
      quotationPagination, // 报价表分页
      quotationTermsList, // 报价条款数据
      quotationTermsPagination, // 报价条款分页
      priceList, //比价数据
    } = singlePurchaseApplicationModel;

    const {
      id,
      rounds,
    } = querystring.parse(this.props.location.search.substr(1));

    // 项目基本信息Props
    const ProjectBaseInfoFormProps = {
      form,
      infomationForm,
      onRef: (ref) => {
        this.baseForm = ref.form;
      },
    };

    // 询价轮次Props
    const InquiryRoundProps = {
      form,
      inquiryRoundForm,
      onRef: (ref) => {
        this.inquiryRoundForm = ref.form;
      },
    };

    // 报价表数据Props
    const QuotationListTableProps = {
      form,
      quotationList,
      quotationPagination,
      onChange: this.handleQuotationListDetail,
    };

    // 报价条款数据Props
    const QuotationClauseTableProps = {
      form,
      quotationTermsList,
      quotationTermsPagination,
    };

    // 比价props
    const comparePriceModalProps = {
      ...this.props,
      onChange: this.getPriceList,
    };

    const supplierDataExportProps = {
      requestUrl: `${prefix}/pr-third-heads/getPrThirdQuotationList/quotationExport?id=${id}&rounds=${rounds}`,
      method: 'POST',
      downloadType: 'Blob',
      buttonText: intl.get(`${promptCode}.view.button.export`).d('导出'),
      fileName:
        intl.get(`${promptCode}.view.title.QuotationContent`).d('报价表') +
        dayjs().format('YYYY-MM-DD'),
      // queryParams: { exportType: 'COLUMN', id: id, rounds: rounds },
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
          {/* 项目基本信息 */}
          <Panel
            key="form"
            showArrow={false}
            header={
              <PanelHeader
                arrowActive={activeKey.includes('form')}
                title={intl.get(`${promptCode}.view.title.projectinformation`).d('项目基本信息')}
              />
            }
          >
            <ProjectBaseInfoForm {...ProjectBaseInfoFormProps} />
          </Panel>
          {/* 询价轮次 */}
          <Panel
            key="formTwo"
            showArrow={false}
            // collapsible="disabled"
            header={
              <PanelHeader
                // showArrow={true}
                arrowActive={activeKey.includes('formTwo')}
                title={intl.get(`${promptCode}.view.title.InquiryRound`).d('询价轮次')}
              />
            }
          >
            <InquiryRound {...InquiryRoundProps}></InquiryRound>
          </Panel>
          {/* 报价表 */}
          <Panel
            key="tableOne"
            showArrow={false}
            // collapsible="disabled"
            header={
              <PanelHeader
                // showArrow={false}
                arrowActive={activeKey.includes('tableOne')}
                title={intl.get(`${promptCode}.view.title.QuotationContent`).d('报价表')}
                buttons={
                  <>
                    <CusButton
                      onClick={() => {
                        this.handleComparePricebutton();
                      }}
                    >
                      {intl.get(`${promptCode}.view.button.PriceRelations`).d('比价')}
                    </CusButton>
                  </>
                }
              />
            }
          >
            <ComparePriceModal {...comparePriceModalProps}></ComparePriceModal>
          </Panel>
          {/* 报价条款 */}
          <Panel
            key="tableTwo"
            showArrow={false}
            // collapsible="disabled"
            header={
              <PanelHeader
                // showArrow={true}
                arrowActive={activeKey.includes('tableTwo')}
                title={intl.get(`${promptCode}.view.title.QuotationTerms`).d('报价条款')}
              />
            }
          >
            <QuotationClauseTable {...QuotationClauseTableProps}></QuotationClauseTable>
          </Panel>
        </Collapse>
        <CusModal
          visible={openVisible}
          width={800}
          title={intl.get(`${promptCode}.view.button.PriceRelations`).d('比价')}
          onCancel={this.handleCancel}
          onOk={this.handleConfim}
        >
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <CusExcelExport otherButtonProps={{ mini: true }} {...supplierDataExportProps} />
          </div>
          <QuotationListTable {...QuotationListTableProps}></QuotationListTable>
        </CusModal>
      </PageWrapper>
    );
  }
}
