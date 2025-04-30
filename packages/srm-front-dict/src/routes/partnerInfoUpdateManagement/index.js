/**
 * DICT 合作伙伴信息更新
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/10/17
 * @Copyright: Copyright (c), 2024, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import { fastCodeLoader } from '@/utils/decorators';
import FilterForm from './Form';
import ListTable from './ListTable';
import { Bind } from 'lodash-decorators';
import CusModal from '_cus_components/CusModal';
import SelectPartnerForm from './components/SelectPartnerForm';
import CusNotification from '_cus_components/CusNotification';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([])
@connect(({ loading, partnerInfoUpdateManagement }) => ({
  queryLoading: loading.effects['partnerInfoUpdateManagement/queryPartnerInfoUpdateList'],
  partnerInfoUpdateManagement,
}))

export default class PartnerInfoUpdateManagement extends Component {
  constructor(props) {
    super(props);
    this.form = {};
    this.selectPartnerForm = {};
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      selectPartnerVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询
  @Bind()
  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnerInfoUpdateManagement/queryPartnerInfoUpdateList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  // 获取form values
  getQueryParams = () => {
    const fieldsValue = (this.form.props && this.form.props.form.getFieldsValue()) || {};
    return {
      ...fieldsValue,
    };
  };

  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const payload = selectedRows.map(item => ({ editRecordId: item.editRecordId }));
    CusModal.CusDeleteConfirm(() => {
      dispatch({
        type: 'partnerInfoUpdateManagement/deletePartnerInfo',
        payload,
      }).then(res => {
        CusNotification.success({
          message: intl.get(`hzero.common.notification.success.delete`).d('删除成功'),
        });
        this.handleSearch();
      });
    });
  }

  @Bind()
  selectConfirm() {
    this.selectPartnerForm.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log(values);
        // window.open(`/pub/dict/partner-info-update/detail?partnerId=${values.partnerId}&editType=${values.editType}`);
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTHZHBXXGX&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/partner-info-update/detail?partnerId=${values.partnerId}&editType=${values.editType}`)}`);
        this.setState({
          selectPartnerVisible: false,
        });
      }
    });
  }

  render() {
    const { queryLoading = false, partnerInfoUpdateManagement: { tableData = [], pagination = {} } } = this.props;
    const { activeKey, selectedRowKeys, selectPartnerVisible } = this.state;
    const filterFormProps = {
      onRef: (ref) => {
        this.form = ref;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      getCheckboxProps: (record) => {
        return {
          disabled: record.editApplyStatus !== 'PENDING_REFER',
        };
      },
    };
    const listTableProps = {
      ...this.props,
      rowSelection,
      onChange: this.handleSearch,
      dataSource: tableData,
      pagination,
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
                      onClick={this.handleDelete}
                      disabled={selectedRowKeys.length === 0}
                    >
                      {intl.get(`hzero.common.view.button.delete`).d('删除')}
                    </CusButton>
                    <CusButton
                      mini
                      type="primary"
                      onClick={() => this.setState({ selectPartnerVisible: true })}
                    >
                      {intl.get(`hzero.common.view.button.add`).d('新建')}
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

        {selectPartnerVisible && (
          <CusModal
            title={intl.get(`${prompt}.view.field.select.partner`).d('选择合作伙伴')}
            visible={selectPartnerVisible}
            destroyOnClose
            width={600}
            onCancel={() => this.setState({ selectPartnerVisible: false })}
            onOk={this.selectConfirm}
          >
            <SelectPartnerForm
              onRef={ref => {
                this.selectPartnerForm = ref;
              }}
            />
          </CusModal>
        )}
      </PageWrapper>
    );
  }
}
