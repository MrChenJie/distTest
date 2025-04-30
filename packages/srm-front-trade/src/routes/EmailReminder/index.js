/**
 * @Description: 接口监控 -邮件提醒
 * @date 2023-02-17
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Form, LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import { getCurrentLanguage } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import { addItemToPagination, delItemsToPagination } from 'utils/utils';

@Form.create({ fieldNameProp: null })
@connect(({ emailReminder, loading }) => ({
  emailReminder,
  loading: {
    query: loading.effects['emailReminder/queryData'],
    delete: loading.effects['emailReminder/deleteList'],
    save: loading.effects['emailReminder/save'],
  },
}))
@fastCodeLoader(['HPFM.ENABLED_FLAG', 'HITF.SERVICE_CATEGORY', 'SPUB.SCM_MODULE'])
@formatterCollections({ code: ['spub.emailReminder'] })
export default class EmailReminder extends React.Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };

  componentDidMount() {
    this.fetchList();
  }

  @Bind()
  fetchList(page = {}) {
    const { dispatch, form } = this.props;
    const fieldValues = form.getFieldsValue();
    dispatch({
      type: 'emailReminder/queryData',
      payload: {
        page,
        ...fieldValues,
      },
    });
  }

  @Bind()
  handleAdd() {
    const {
      dispatch,
      emailReminder: { dataSource, pagination },
    } = this.props;
    dispatch({
      type: 'emailReminder/updateState',
      payload: {
        dataSource: [
          {
            _status: 'create',
            configId: uuidv4(),
          },
          ...dataSource,
        ],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  @Bind()
  handleDelete() {
    const {
      dispatch,
      emailReminder: { dataSource, pagination },
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const deleteLine = selectedRows.filter((item) => item._status !== 'create');
    const createLine = selectedRows.filter((item) => item._status === 'create');
    if (createLine.length > 0) {
      const newList = dataSource.filter((item) => {
        return !selectedRowKeys.includes(item.configId);
      });
      dispatch({
        type: 'emailReminder/updateState',
        payload: {
          dataSource: newList,
          pagination: delItemsToPagination(createLine.length, dataSource.length, pagination)
        },
      });
    }
    if (deleteLine.length > 0) {
      dispatch({
        type: 'emailReminder/deleteList',
        payload: deleteLine,
      }).then((res) => {
        if (res) {
          this.fetchList();
        }
      });
    }
    notification.success();
  }

  @Bind()
  handleEdit(record, flag) {
    const {
      emailReminder: { dataSource },
      dispatch,
    } = this.props;
    let newList = [];
    if(record._status === 'create'){
      newList = dataSource.filter((item) => item.configId !== record.configId);
      dispatch({
        type: 'emailReminder/updateState',
        payload: { dataSource: newList },
      });
    }else {
      newList = dataSource.map((item) => {
        if (record.configId === item.configId) {
          return { ...item, _status: flag ? 'update' : undefined };
        } else {
          return item;
        }
      });
      dispatch({
        type: 'emailReminder/updateState',
        payload: { dataSource: newList },
      });
    }
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  @Bind
  handleSave(record) {
    const { dispatch } = this.props;
    if (record.$form) {
      record.$form.validateFieldsAndScroll((err, values) => {
        if (err) {
          return false;
        }
        dispatch({
          type: 'emailReminder/save',
          payload: [
            {
              ...record,
              ...values,
              configId: record._status === 'create' ? undefined : record.configId,
            },
          ],
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchList();
          }
        });
      })
    }
  }

  render() {
    const {
      form,
      idpValueMap = {},
      loading,
      emailReminder: { dataSource, pagination },
    } = this.props;
    const { selectedRows } = this.state;
    const filterProps = {
      form,
      idpValueMap,
      search: this.fetchList,
    };
    const listProps = {
      form,
      idpValueMap,
      pagination,
      dataSource,
      loading: loading.query,
      deleteLoading: loading.delete,
      saveLoading: loading.save,
      onChange: (page) => this.fetchList(page),
      onAdd: this.handleAdd,
      onDelete: this.handleDelete,
      onEdit: this.handleEdit,
      onSave: this.handleSave,
      rowSelection: {
        onChange: this.onSelectChange,
        selectedRowKeys: selectedRows.map((n) => n.configId),
      },
    };

    return (
      <React.Fragment>
        <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
          <Content>
            <div className="table-list-search">
              <FilterForm {...filterProps} />
            </div>
            <ListTable {...listProps} />
          </Content>
        </LocaleProvider>
      </React.Fragment>
    );
  }
}
