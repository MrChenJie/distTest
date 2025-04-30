import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Input, Form, Row, Col } from 'antd';
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
import EmailEditor from '@/components/QuillEditor';
import CusSelect from '_cus_components/CusSelect'
import CusLov from '_cus_components/CusLov';

const { Panel } = Collapse;
const dateFormat = getDateFormat();

@formatterCollections({ code: ['spfmhk.trade', 'spfmhk.mylink'] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS', 'HKSM.APPLICATION.STATUS', 'HKSM.PRODCUT_SERVICE'])
@connect(({ loading, PartnerInformationModal }) => ({
  PartnerInformationModal,
  queryLoading: loading.effects['PartnerInformationModal/queryPartnerhead'],
  dataSource: PartnerInformationModal?.dataSource ,
  // dataSource: [{
  //   actId: '业务创建',
  //   isDisable: true
  // }, {
  //   actId: '业务创建',
  //   isDisable: false
  // }],
  pagination: PartnerInformationModal?.pagination,
}))
class PartnerInformationList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      addEmail: false,
      emailContent: ''
    };
  }

  form1 = React.createRef();

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/queryPartnerhead',
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
      applyDateStart: fieldsValue?.applyDate?.length ? dayjs(fieldsValue?.applyDate[0]).format(dateFormat) : null,
      applyDateEnd: fieldsValue?.applyDate?.length ? dayjs(fieldsValue?.applyDate[1]).format(dateFormat) : null,
    };
  };

  handleAddLines = (e) => {
    const templateCode = 'BPM_SCM_MLHZHBXXGX'; // 致远templateCode
    const url = `${
      process.env.APPROVAL_PROCESS
    }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
      `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/mylink/partners-information/Detail?refCaseId=${e}`
    )}`;
    window.open(url, '_blank');
    // window.open(`/mylink/partners-information/Detail?refCaseId=${e}`, '_blank')
  }

  handleDeleteLines = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const isDraft = selectedRows.every((item) => {
      return item.applyStatus === 'Draft'
    });
    if (selectedRowKeys.length > 0) {
      if (isDraft) {
        CusModal.CusDeleteConfirm(() => {
          dispatch({
            type: 'PartnerInformationModal/deleteLine',
            payload: selectedRows
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

  handleSend = () => {
    this.setState({
      addEmail: true
    })
  }

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      addEmail,
      emailContent,
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
      handleSend: this.handleSend
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
                    <CusLov code="LINK.PARTNER_INFO_PASS" isButton type='primary' onChange={(e)=>this.handleAddLines(e)} >
                      {intl.get('hzero.common.view.button.add').d('新建')}
                    </CusLov>
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

export default PartnerInformationList;
