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
import CusLov from '_cus_components/CusLov';

const { Panel } = Collapse;
const dateFormat = getDateFormat();

@formatterCollections({ code: ['spfmhk.trade', 'spfmhk.mylink'] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS', 'HKSM.APPLICATION.STATUS', 'HKSM.EFFECTIVE.STATUS'])
@connect(({ loading, CollaborationModeModal }) => ({
  CollaborationModeModal,
  queryLoading: loading.effects['CollaborationModeModal/queryList'],
  dataSource: CollaborationModeModal?.dataSource,
  // dataSource: [{
  //   actId: '业务创建',
  //   isDisable: true
  // }, {
  //   actId: '业务创建',
  //   isDisable: false
  // }],
  pagination: CollaborationModeModal?.pagination,
}))
class CollaborationModeList extends Component {
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
    const { dispatch, match } = this.props;
    dispatch({
      type: match.params.type == 'create' ? 'CollaborationModeModal/queryList' : 'CollaborationModeModal/queryListHistory',
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
      applicantDateStart: fieldsValue?.applicantDate?.length ? dayjs(fieldsValue?.applicantDate[0]).format(dateFormat) : null,
      applicantDateEnd: fieldsValue?.applicantDate?.length ? dayjs(fieldsValue?.applicantDate[1]).format(dateFormat) : null,
    };
  };

  handleAddLines = (e) => {
    const {
      match
    } = this.props
    const templateCode =  match.params.type == 'create' ? 'BPM_SCM_HZXZ' : 'BPM_SCM_HZGX'; // 致远templateCode
    const url = `${
      process.env.APPROVAL_PROCESS
    }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
      `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/mylink/collaboration-mode/Detail/${match.params.type}${e ? `?refCaseId=${e}` : ''}`
    )}`;
    console.log(url)
    window.open(url, '_blank');
    // window.open(`/pub/mylink/collaboration-mode/Detail/${match.params.type}`, '_blank')
    
  }

  handleDeleteLines = () => {
    const { dispatch, match } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const isDraft = selectedRows.every((item) => {
      return item.applicationStatus === 'Draft'
    });
    console.log('selectedRows', selectedRows)
    if (selectedRowKeys.length > 0) {
      if (isDraft) {
        CusModal.CusDeleteConfirm(() => {
          dispatch({
            type: match.params.type == 'create' ? 'CollaborationModeModal/deleteLine' : 'CollaborationModeModal/deleteLineHistory',
            payload: selectedRowKeys
          }).then((res) => {
            if (res) {
              this.handleSearch();
            }
          })
        })
      } else {
        CusNotification.error({
          message: intl.get('spfmhk.mylink.button.delete.check').d('只能删除状态为“草稿”的单据'),
        });
      }
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  render() {
    const { queryLoading = false, idpValueMap = {}, match } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
    } = this.state;
    const filterFormProps = {
      ...this.props,
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
                      // mini
                      onClick={this.handleDeleteLines}
                    >
                      {intl.get('hzero.common.view.button.delete').d('删除')}
                    </CusButton>
                    {match.params.type == 'create'&&<CusButton
                      // mini
                      type='primary'
                      onClick={()=> this.handleAddLines()}
                    >
                      {intl.get('hzero.common.view.button.add').d('新建')}
                    </CusButton>}
                    {match.params.type != 'create'&&<CusLov code="LINK.ALL_PART_MODE" isButton type='primary' onChange={(e)=>this.handleAddLines(e)} >
                      {intl.get('hzero.common.view.button.add').d('新建')}
                    </CusLov>}
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

export default CollaborationModeList;
