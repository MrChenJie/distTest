import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { getDateFormat } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;
const dateFormat = getDateFormat(); 

@formatterCollections({ code: ['spfmhk.trade'] })
@fastCodeLoader(['HKPC.FORM_STATUS'])
@connect(({ loading, propertyLeaseModel }) => ({
  propertyLeaseModel,
  queryLoading: loading.effects['propertyLeaseModel/queryLeaseList'],
  dataSource: propertyLeaseModel?.dataSource,
  pagination: propertyLeaseModel?.pagination,
}))
class LeaseList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'propertyLeaseModel/queryLeaseList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);
    return {
      ...fieldsValue,
      leaseStartDateFrom: fieldsValue?.leaseStartDateFrom ? dayjs(fieldsValue?.leaseStartDateFrom).format(dateFormat) : null,
      leaseStartDateTo: fieldsValue?.leaseStartDateTo ? dayjs(fieldsValue?.leaseStartDateTo).format(dateFormat) : null,
      leaseEndDateFrom: fieldsValue?.leaseEndDateFrom ? dayjs(fieldsValue?.leaseEndDateFrom).format(dateFormat) : null,
      leaseEndDateTo: fieldsValue?.leaseEndDateTo ? dayjs(fieldsValue?.leaseEndDateTo).format(dateFormat) : null,
    };
  };

  handleLeaseLink = () => {
    const url = `/pub/ssrc-hk/propertyLease/applicationForm`;
    window.open(url, '_blank');
  }

  handleDeleteLines = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const isDraft = selectedRows.every((item) => {
      return item.status === 'draft'
    });
    if(selectedRowKeys.length > 0) {
      const storeRowKeys = selectedRowKeys.map(item => {
        return {
          id: item
        }
      })
      if(isDraft) {
        CusModal.CusDeleteConfirm(() => {
          dispatch({
            type: 'propertyLeaseModel/deleteLeaseLine',
            payload: storeRowKeys
          }).then((res) => {
            if(res) {
              this.handleSearch();
            }
          })
        })
      } else {
        CusNotification.error({
          message: intl.get('demoTitle1').d('只能删除状态为"草稿"的单据'),
        });
      }
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
    } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
      // columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const listTableProps = {
      ...this.props,
      isPub,
      rowSelection,
      onChange: this.handleSearch,
    };
    return (
      <PageWrapper loading={queryLoading}>
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
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    <CusButton
                      mini
                      onClick={this.handleDeleteLines}
                    >
                      {intl.get('hzero.common.view.button.delete').d('删除')}
                    </CusButton>
                    <CusButton
                      mini
                      onClick={this.handleLeaseLink}
                    >
                      {intl.get('hzero.common.view.button.add').d('新建')}
                    </CusButton>
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...listTableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}

export default LeaseList;
