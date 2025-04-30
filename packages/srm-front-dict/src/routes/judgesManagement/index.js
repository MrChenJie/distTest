import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
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
const prompt = 'spfmhk.dict';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS', 'DICT.JUDGE_APPLY_STATUS'])
@connect(({ loading, judgesManagementModel }) => ({
  judgesManagementModel,
  queryLoading: loading.effects['judgesManagementModel/queryList'],
  dataSource: judgesManagementModel?.dataSource,
  pagination: judgesManagementModel?.pagination,
}))
class judgesManagement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      setEdit: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
    document.addEventListener('keydown', this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  @Bind
  handleKeyPress(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleSearch();
    }
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'judgesManagementModel/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      console.log('列表', res);
    }).catch((err) => {
      console.log(err);
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form?.current?.getFieldsValue(true);
    if (fieldsValue?.applyDateRange) {
      fieldsValue.applyDateStart = dayjs(fieldsValue.applyDateRange[0].hour(0).minute(0).second(0)).format(DEFAULT_DATETIME_FORMAT);
      fieldsValue.applyDateEnd = dayjs(fieldsValue.applyDateRange[1].hour(0).minute(0).second(-1)).add(1, 'day').format(DEFAULT_DATETIME_FORMAT);
    }
    if(fieldsValue?.applyDateRange===null){
      fieldsValue.applyDateStart = null;
      fieldsValue.applyDateEnd = null;
    }
    return {
      ...fieldsValue,
    };
  };

  handleDelete = () => {
    const { dispatch, judgesManagementModel, dataSource } = this.props;
    const { selectedRows, formRecordId, headId } = this.state;
    if (selectedRows.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const data = selectedRows?.map((i) => {
          return i?.judgeId;
        });
        console.log('data', data);
        const deleteData = dataSource.filter(
          (item) => data.includes(item.judgeId),
        );
        console.log('deleteData', deleteData);
        if (deleteData.length > 0) {
          // 后台删除
          const judges = deleteData?.map((i) => {
            return {
              judgeId: i?.judgeId,
            };
          });
          console.log('judges', judges);
          dispatch({
            type: 'judgesManagementModel/deleteJudgesLine',
            payload: { judges },
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.handleSearch(_);
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
            }
          });
        }
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }

  };
  handleEdit = () => {
    this.setState({
      setEdit: true,
    });
  };
  handleSave = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    //保存被勾选评委的信息
    if (selectedRows.length > 0) {
      const judges = selectedRows?.map((i) => {
        return {
          judgeAccount: i?.judgeAccount,
          judgeId: i?.judgeId,
          isEffective: i?.isEffective,
        };
      });
      console.log('judges', selectedRows, judges);
      dispatch({
        type: 'judgesManagementModel/saveJudges',
        payload: { judges },
      }).then((res) => {
        if (res) {
          CusNotification.success({
            message: intl.get('hzero.common.notification.success.save').d('保存成功'),
          });
          this.handleSearch();
          this.setState({
            setEdit: false,
          });
        }
      });
    }
  };
  handleAdd = () => {
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_PWRKLC&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/judges-management/detail`)}`);
    // window.open('/pub/dict/judges-management/detail', '_blank');
  };
  handleIsEffective = (index, flag) => {
    const { dataSource, dispatch } = this.props;
    //更新dataSource
    console.log('data', index, flag);
    let updateDataSource = [
      ...dataSource,
    ];
    updateDataSource[index].isEffective = flag;
    console.log('updateDataSource', updateDataSource);
    dispatch({
      type: 'judgesManagementModel/updateState',
      payload: {
        dataSource: updateDataSource,
      },
    });
  };

  render() {
    const { queryLoading = false, idpValueMap = {}, dispatch, dataSource } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      selectedRows,
      setEdit,
    } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
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
    };
    const listTableProps = {
      ...this.props,
      idpValueMap,
      isPub,
      rowSelection,
      setEdit,
      onChange: this.handleSearch,
      handleIsEffective: this.handleIsEffective,
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
                      disabled={!((selectedRows?.filter(item => ['FINISHED', 'PENDING_REVIEW'].includes(item.applyStatus)).length === 0) && selectedRowKeys?.length !== 0)}
                    >
                      {intl.get('hzero.common.view.button.delete').d('删除')}
                    </CusButton>
                    <CusButton
                      mini
                      onClick={this.handleEdit}
                      disabled={!((selectedRows?.filter(item => ['PENDING_REFER', 'PENDING_REVIEW'].includes(item.applyStatus)).length === 0) && selectedRowKeys?.length !== 0)}
                    >
                      {intl.get('spfmhk.dict.view.commontext.edit').d('编辑')}
                      {/* 选中改行且点击编辑按钮，勾选框才变为可用 */}
                    </CusButton>
                    <CusButton
                      mini
                      onClick={this.handleSave}
                    >
                      {intl.get('hzero.common.view.button.save').d('保存')}
                      {/* 勾选框消失，将勾选的数据更新到数据库 */}
                    </CusButton>
                    <CusButton
                      mini
                      type="primary"
                      onClick={this.handleAdd}
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

export default judgesManagement;
