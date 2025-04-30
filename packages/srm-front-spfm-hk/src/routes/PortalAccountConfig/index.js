/*
 * portalAccountConfig - 供应商门户配置
 * @date: 2023-09-07
 * @author: FHS <huasheng.fang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import {
  addItemToPagination,
  delItemsToPagination,
  createPagination,
  getCurrentUser
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';

import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import DataTable from './DataTable';
import FilterForm from './FilterForm';

const { Panel } = Collapse;
const commonPrompt = 'spfm.companyAccountRec';
const ROW_KEY = 'companyAccountRecId';
const currentUser = getCurrentUser();
@connect(({ loading, companyAccountRec }) => ({
  companyAccountRec,
  fetchListLoading: loading.effects['companyAccountRec/fetchList'],
  saveLoading: loading.effects['companyAccountRec/save'],
  deleteLinesLoading: loading.effects[`companyAccountRec/deleteLines`],
  generateAccountLoading: loading.effects[`companyAccountRec/generateAccount`],
}))
@formatterCollections({ code: [commonPrompt,'spfmhk.supplier'] })
@fastCodeLoader(['ISP.ACCOUNT_GENERATE_STATUS', 'SPFM.COM_GENERATE_USER'])
export default class CompanyAccountRec extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      dataSource: [],
      pagination: [],
      isEdit: false,
      isUpdate: false,
      page: {},
    };
  }

  @Bind()
  componentDidMount() {
    this.handleSearch();
  }

  // 查询条件格式化
  @Bind()
  formatValues() {
    const values = this.form?.current?.getFieldsValue();
    const { lastUpdateDateFrom, lastUpdateDateTo } = values;
    const { language } = currentUser;
    return {
      ...values,
      langDto: language,
      lastUpdateDateFrom: dayjs.isDayjs(lastUpdateDateFrom)
        ? lastUpdateDateFrom.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      lastUpdateDateTo: dayjs.isDayjs(lastUpdateDateTo)
        ? lastUpdateDateTo.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
    };
  }

  @Bind
  handleAddLine(newLine = {}) {
    const { dataSource = [], pagination = {} } = this.state;
    const newPagination = addItemToPagination(dataSource.length, pagination);
    this.setState({
      dataSource: [newLine, ...dataSource],
      pagination: newPagination,
    });
  }

  @Bind
  handleDeleteLine(keys = [], rows = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const { dataSource = [], pagination = [], page = {} } = this.state;
    const deleteData = rows.filter((item) => item._status === 'update');
    const deleteDataN = rows.filter(
      (item) => item._status === 'update' && item.processStatus === 'New'
    );
    if (deleteData.length > 0) {
      if (deleteDataN[0]) {
        dispatch({
          type: 'companyAccountRec/deleteLines',
          payload: deleteDataN,
        }).then((res) => {
          if (res) {
            CusNotification.success();
            callback();
            this.handleSearch(page);
          }
        });
      } else {
        CusNotification.info({
          message: intl.get(`${commonPrompt}.view.message.deleteInfo`).d('只能删除已起草状态'),
        });
      }
    } else {
      const newDataSource = dataSource.filter((item) => !keys.includes(item[ROW_KEY]));
      const delItemsLength = dataSource.length - newDataSource.length;
      const newPagination = delItemsToPagination(delItemsLength, dataSource.length, pagination);
      this.setState(
        {
          dataSource: newDataSource,
          pagination: newPagination,
        },
        () => {
          callback();
        }
      );
    }
  }

  @Bind
  handleSaveLine(data = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const { page = {} } = this.state;
    dispatch({
      type: 'companyAccountRec/save',
      payload: data,
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.handleSearch(page);
        callback();
      }
    });
  }

  @Bind
  handleGenerateAccount(data = [], callback = (e) => e) {
    if (this.state.isUpdate) {
      CusModal.info({
        content: intl
          .get(`${commonPrompt}.view.message.please.save`)
          .d('当前页面有未保存的数据,请先保存后再进行操作'),
      });
      return;
    }
    const { dispatch } = this.props;
    const { page = {} } = this.state;
    dispatch({
      type: 'companyAccountRec/generateAccount',
      payload: data,
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.handleSearch(page);
        callback();
      }
    });
  }

  @Bind
  handleExport() {
    const { dispatch } = this.props;
    this.setState({
      exportLoading: true,
    });
    dispatch({
      type: 'companyAccountRec/supplierExport',
    }).then((res) => {
      this.setState({
        exportLoading: false,
      });
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl
          .get(`${commonPrompt}.view.export.accountExport`)
          .d('门户账号报表导出');
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xlsx`);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  @Bind()
  handleSearch(page = {}, isSearch = false) {
    const { dispatch } = this.props;
    const values = this.formatValues();
    this.setState({ isEdit: true, page });
    dispatch({
      type: 'companyAccountRec/fetchList',
      payload: {
        pageParam: {
          page,
          sourceCode:'SCM_CREATE'
        },
        queryParam: { ...values },
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            dataSource: res.content.map((item) => ({
              ...item,
              _status: 'update',
              editFlag: ['New', 'Fail'].includes(item.processStatus),
            })),
            pagination: createPagination(res),
          },
          () => {
            this.setState({ isEdit: false });
          }
        );
        if (this.list) {
          const { clearEditRowKey = (e) => e, clearRows = (e) => e } = this.list;
          clearEditRowKey();
          this.setState({ isUpdate: false });
          if (this.list?.tableForm?.current) {
            this.list?.tableForm?.current?.resetFields();
          };
          if (isSearch) {
            clearRows();
          }
        }
      }
    });
  }

  @Bind()
  handleOpenIsUpdate() {
    this.setState({
      isUpdate: true,
    });
  }

  render() {
    const {
      activeKey,
      dataSource = [],
      pagination = {},
      distribution,
      isEdit,
      isUpdate,
    } = this.state;
    const {
      fetchListLoading = false,
      saveLoading = false,
      idpValueMap = {},
    } = this.props;

    const filterFormProps = {
      handleSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      },
      idpValueMap,
      isUpdate,
    };

    const dataTableProps = {
      isEdit,
      isUpdate,
      idpValueMap,
      dataSource,
      pagination,
      distribution,
      onAddLine: this.handleAddLine,
      onSaveLine: this.handleSaveLine,
      onDeleteLine: this.handleDeleteLine,
      onGenerateAccount: this.handleGenerateAccount,
      onExport: this.handleExport,
      onRef: (ref) => {
        this.list = ref;
      },
      onChange: this.handleSearch,
      onIsUpdate: this.handleOpenIsUpdate,
      formatValues: this.formatValues,
      onSetState: (list = {}) => {
        this.setState(list)
      },
    };

    return (
      <PageWrapper loading={fetchListLoading || saveLoading}>
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
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={this.list?.getButtons({ propsList: this.props, stateList: this.state })}
              />
            }
            key="table"
          >
            <DataTable {...dataTableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
