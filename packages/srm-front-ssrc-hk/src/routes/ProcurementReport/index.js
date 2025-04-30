import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse, Form, Row, Card, DatePicker } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import CusExcelExport from '_cus_components/CusExcelExport';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const prefix = `/cmhk-pr-center/v1/${organizationId}`;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
  fetchLoading: loading.effects['purchaseApplicationModel/queryProcurementReportList'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.PRTYPE',
  'HKPC.RELATEDTOPROJECT',
  'HKPC.PURCHASINGCATEGORY',
  'HKPC.BUDGETTYPE',
  'HKPC.PRRECORDSSTATUS',
  'HKPC.PROGRESSQUERY',
])
export default class procurementReport extends React.Component {
  modalForm = React.createRef();
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      idList: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询采购报表列表数据
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/queryProcurementReportList',
      payload: {
        page,
        // lang: currentUser.language,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if (res) {
        if (this.table) {
          const { clearState = (e) => e } = this.table;
          clearState();
        }
      }
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
    const { procurementPlanApprovalDate, poDate } = fieldsValue || {};
    return {
      ...fieldsValue,
      procurementPlanApprovalDate: dayjs.isDayjs(procurementPlanApprovalDate)
        ? procurementPlanApprovalDate.format('YYYY-MM-DD')
        : undefined,
      poDate: dayjs.isDayjs(poDate) ? poDate.format('YYYY-MM-DD') : undefined,
    };
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    let idList = [];
    data.map((item) => {
      idList.push(item.id);
    });
    const { dispatch } = this.props;
    const deleteFlag = data.every((item) => item.prStatus === 'PENDING_REFER');
    if (data.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'purchaseApplicationModel/delPurchaseApplicationList',
            payload: { id: idList },
          }).then((res) => {
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
        message: intl
          .get(`${promptCode}.view.message.onlyDeleteNEW`)
          .d('只能删除状态为"草稿"的单据。'),
      });
    }
  }

  @Bind()
  getSelectedRows(idListValue) {
    this.setState({
      idList: idListValue,
    });
  }

  render() {
    const dataExportProps = {
      requestUrl: `${prefix}/pr-third-heads/reportDown`,
      method: 'POST',
      downloadType: 'Blob',
      buttonText: intl.get(`${promptCode}.view.button.export`).d('导出'),
      fileName:
        intl.get(`${promptCode}.view.button.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams,
    };
    const {
      dispatch,
      idpValueMap = {},
      fetchLoading = false,
      purchaseApplicationModel,
      language,
    } = this.props;
    const { activeKey, isPub } = this.state;
    const formProps = {
      idpValueMap,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      },
      language,
    };
    const tableProps = {
      isPub,
      idpValueMap: idpValueMap['HKPC.PRTYPE'],
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      getQueryParams: this.getQueryParams,
      purchaseApplicationModel,
      dispatch,
    };
    const yearTime = dayjs(new Date());

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
                  // buttons={
                  //   <>
                  //     <CusExcelExport
                  //       otherButtonProps={{ mini: true }}
                  //       {...dataExportProps}
                  //     />
                  //   </>
                  // }
                />
              }
              key="table"
            >
              <DataTable getSelectedRows={this.getSelectedRows.bind(this)} {...tableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
      </>
    );
  }
}
