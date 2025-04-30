import React from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseResultModel, loading }) => ({
  purchaseResultModel,
  fetchLoading: loading.effects['purchaseResultModel/queryPurchaseResultDraftList'],
}))
@fastCodeLoader(['BID.PROCUREMENT_METHOD'])
export default class purchaseResultDraft extends React.Component {
  modalForm = React.createRef();
  // 创建新单据表单
  createForm;
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table'],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询采购结果列表数据
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseResultModel/queryPurchaseResultDraftList',
      payload: {
        page,
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
    console.log('fieldsValue', fieldsValue);
    return {
      ...fieldsValue,
    };
  }

  render() {
    const { idpValueMap = {}, fetchLoading = false, purchaseResultModel } = this.props;
    const { activeKey } = this.state;
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
      onChange: this.handleSearch,
      getQueryParams: this.getQueryParams,
      purchaseResultModel,
      idpValueMap,
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
                  //     <CusButton mini>
                  //       {intl.get(`HKPC.commom.view.button.export`).d('导出')}
                  //     </CusButton>
                  //   </>
                  // }
                />
              }
              key="table"
            >
              <DataTable {...tableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
      </>
    );
  }
}
