import React, { Fragment, PureComponent } from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { pullAllBy } from 'lodash';
import { Form, Input } from 'antd';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage, getCurrentUser } from 'utils/utils';
import { EMAIL } from 'utils/regExp';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusLov from '_cus_components/CusLov';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import Permissions from './Permissions';

const FormItem = Form.Item;
const commonPrompt = 'spfmhk.supplier';
const ROW_KEY = 'companyAccountRecId';
const currentLanguage = getCurrentLanguage();
const currentUser = getCurrentUser();

class DataTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef && onRef(this);
    this.state = {
      editRowKey: undefined,
      selectedRowKeys: [],
      selectedRows: [],
      permissionVisible: false, // 分配权限弹框
      currentRecord: false, // 当前选择行数据
    };
  }


  tableForm = React.createRef();

  getColWidth(title = '', value = '') {
    const unitWidth = 14;
    // 标题和内容长度，优先取长的，空传入取默认120；
    return (title.length === 0 && value.length === 0) ? 120 : Math.max(title.length * unitWidth + 80, value.length * unitWidth + 80);
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    if (!record[ROW_KEY]) {
      return 0;
    };
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => (n[ROW_KEY] !== record[ROW_KEY]));
    const totalAmount = newSRows.reduce((pre, item) => {
      const scAmount = item.estimateAmount;
      return pre + scAmount;
    }, 0);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
      totalAmount,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newChangeRows = changeRows.filter(item => !!item[ROW_KEY]);
    if (newChangeRows.length <= 0) {
      return 0;
    };
    const newSRows = selected
      ? selectedRows.concat(newChangeRows)
      : pullAllBy([...selectedRows], newChangeRows, ROW_KEY);
    const totalAmount = newSRows.reduce((pre, item) => {
      const scAmount = item.estimateAmount;
      return pre + scAmount;
    }, 0);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
      totalAmount,
    });
  }

  @Bind()
  handleRow(record, _) {
    const { selectedRows = [] } = this.state;
    return {
      onClick: () => {
        if (!record[ROW_KEY]) {
          return 0;
        };
        let selected = true;
        selectedRows.forEach((item) => {
          if (item[ROW_KEY] === record[ROW_KEY]) {
            selected = false;
          }
        });
        const newSRows = selected
          ? selectedRows.concat(record)
          : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
        const totalAmount = newSRows.reduce((pre, item) => {
          const scAmount = item.estimateAmount;
          return pre + scAmount;
        }, 0);
        const newSelectedRowKeys = [];
        newSRows.forEach((item) => {
          newSelectedRowKeys.push(item[ROW_KEY]);
        });
        this.setState({
          selectedRows: newSRows,
          selectedRowKeys: newSelectedRowKeys,
          totalAmount,
        });
      },
    };
  }

  @Bind()
  handleChange(page) {
    const { onChange = (e) => e, isUpdate } = this.props;
    if (isUpdate) {
      CusModal.confirm({
        content: intl
          .get(`${commonPrompt}.message.saveTips`)
          .d('当前页面有未保存数据继续操作，数据将丢失， 请确认继续？'),
        onOk: () => {
          onChange(page);
        },
      });
    } else {
      onChange(page);
    }
  }
  @Bind
  getEditStatus(record) {
    return record.editFlag && ['update', 'create'].includes(record._status);
  }

  @Bind
  clearEditRowKey() {
    this.setState({
      editRowKey: undefined,
    });
  }

  @Bind
  clearRows() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
      totalAmount: null,
    });
  }

  @Bind()
  companyNameOnChange(_, lovRecord, record) {
    const { dataSource, onSetState } = this.props;
    if (this.props.isEdit) {
      this.tableForm?.current?.resetFields();
    }
    this.tableForm?.current?.setFieldsValue({
      [`${record[ROW_KEY]}#supplierNumber`]: lovRecord.supplierNumber,
      [`${record[ROW_KEY]}#companyName`]: lovRecord.companyName,
      [`${record[ROW_KEY]}#companyId`]: lovRecord.supplierId,
      [`${record[ROW_KEY]}#companyNameEn`]: lovRecord.companyNameEn,
      [`${record[ROW_KEY]}#companyEmail`]: lovRecord.companyEmail,
    });
    const newDataSource = dataSource.map(item => {
      if (item[ROW_KEY] === record[ROW_KEY]) {
        return {
          ...item,
          supplierNumber: lovRecord.supplierNumber,
          companyName: lovRecord.companyName,
          companyNameEn: lovRecord.companyNameEn,
          companyId: lovRecord.supplierId,
          companyEmail: lovRecord.companyEmail,
        };
      }
      return { ...item };
    })
    onSetState({
      dataSource: newDataSource,
    });
    record.rowUpdate = true;
  }

  @Bind()
  emailOnChange(_, updateRecord) {
    updateRecord.rowUpdate = true;
  }

  @Bind
  handleDelete() {
    const { dataSource = [] } = this.props;
    const { selectedRowKeys, selectedRows, editRowKey } = this.state;
    if (selectedRows.length <= 0) {
      CusNotification.info({
        message: intl
          .get(`${commonPrompt}.message.selected.atLeast`)
          .d('请至少选择一行数据'),
      });
      return 0;
    }
    const updateAndDelRowData = selectedRows
      .filter((item) => item.rowUpdate)
      .map((r) => {
        return r.companyAccountRecId;
      });
    const haveUpdateRowData = dataSource.filter(
      (item) => item.rowUpdate && !updateAndDelRowData.includes(item.companyAccountRecId)
    );
    if (haveUpdateRowData.length > 0) {
      CusModal.confirm({
        content: intl
          .get(`${commonPrompt}.message.saveTips`)
          .d('当前页面有未保存数据继续操作，数据将丢失， 请确认继续？'),
        onOk: () => {
          CusModal.confirm({
            content: intl.get(`${commonPrompt}.message.confirm.remove`).d('确定删除选中数据?'),
            onOk: () => {
              const { onDeleteLine = (e) => e } = this.props;
              onDeleteLine(selectedRowKeys, selectedRows, () => {
                this.setState({
                  selectedRowKeys: [],
                  selectedRows: [],
                  totalAmount: null,
                  editRowKey: selectedRowKeys.includes(editRowKey) ? undefined : editRowKey,
                });
              });
            },
          });
        },
      });
    } else {
      CusModal.confirm({
        content: intl.get(`${commonPrompt}.message.confirm.remove`).d('确定删除选中数据?'),
        onOk: () => {
          const { onDeleteLine = (e) => e } = this.props;
          onDeleteLine(selectedRowKeys, selectedRows, () => {
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
              totalAmount: null,
              editRowKey: selectedRowKeys.includes(editRowKey) ? undefined : editRowKey,
            });
          });
        },
      });
    }
  }

  @Bind
  handleAdd() {
    const { onAddLine = (e) => e } = this.props;
    const { editRowKey } = this.state;
    // const { id, tenantId } = currentUser;
    if (editRowKey) {
      CusNotification.warning({
        message: intl
          .get(`${commonPrompt}.message.confirm.createNeedAfterSave`)
          .d('请保存当前行再新建'),
      });
      return false;
    }
    const key = uuidv4();
    onAddLine({
      [ROW_KEY]: key,
      _status: 'create',
      processStatus: 'New',
      editFlag: true,
      companyId: null,
      companyName: '',
      companyNameEn: '',
    });
    this.setState({
      editRowKey: key,
    });
  }

  @Bind
  @Debounce(300, { leading: true })
  handleSave() {
    const { onSaveLine = (e) => e, dataSource = [] } = this.props;
    const updateRowData = dataSource.map(item => {
      return {
        ...item,
        [ROW_KEY]: item._status === 'create' ? undefined : item[ROW_KEY],
        companyEmail: item.companyEmail?.toLowerCase(),
      };
    }).filter((item) => item.rowUpdate);
    const { validateFields } = this.tableForm?.current || {};
    validateFields()
      .then(() => {
        onSaveLine(updateRowData, () => {
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
            totalAmount: null,
          });
        });
      })
      .catch(() => {
        CusNotification.warning({
          message: intl.get(`${commonPrompt}.message.confirm.pleaseField`).d('请输入必填字段'),
        });
      })
  }

  @Bind()
  handleGenerateAccount() {
    const { onGenerateAccount = (e) => e } = this.props;
    const { selectedRowKeys = [], selectedRows = [] } = this.state;
    const successRow = selectedRows.filter((item) => item.processStatus === 'Success');
    if (successRow.length > 0) {
      CusNotification.info({
        message: intl.get(`${commonPrompt}.message.confirm.generateInfo`).d('该企业已成功生成账号'),
      });
      return;
    }
    if (selectedRowKeys.length > 0) {
      onGenerateAccount(
        selectedRows.map((item) => {
          return {
            companyId: item.companyId,
            companyEmail: item.companyEmail?.toLowerCase(),
            companyAccountRecId: item.companyAccountRecId,
          };
        }),
        () => { }
      );
      this.clearRows();
    } else {
      CusNotification.info({
        message: intl.get(`${commonPrompt}.message.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  // 表单值 改变 触发 onDataChange
  @Bind
  @Debounce(300, { leading: true })
  onFormChange(changedValues) {
    // 处理表单项的值变化
    const { dataSource, onIsUpdate } = this.props;
    onIsUpdate();
    const [id, name] = Object.keys(changedValues)[0].split('#');
    const value = Object.values(changedValues)[0];
    dataSource.map((item) => {
      const temp = item || {};
      if (item[ROW_KEY]?.toString() === id) {
        temp[name] = value;
        return temp;
      }
      return temp;
    });
  }

  @Bind()
  checkEmailFuc(rule, value, callback) {
    console.log(value);
    const url = `${process.env.CMHK_LOGIN}/iam/hzero/v1/users/validation/email?email=${value}`
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json"); // 设置请求头
    //第三步：实时监控xhr的变化过程
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var result = xhr.responseText;
            var obj = JSON.parse(result);
            console.log(obj);
            if (obj.type == 'error') {
              callback(obj.message);
          } else {
              callback(); // 如果没有报错，传入 null
          }
        }
    }
    xhr.send(JSON.stringify({ email: value })); // 发送请求参数
    if(!EMAIL.test(value) && value){
      callback(intl.get(`${commonPrompt}.field.email.placeHolder`).d('邮箱格式不正确'))
    }
  }

  getButtons = ({ propsList = {}, stateList = {} }) => {
    const {
      deleteLinesLoading = false,
      generateAccountLoading = false,
      saveLoading = false,
    } = propsList;
    const {
      distribution,
      exportLoading = false,
    } = stateList;
    const { onExport = (e) => e } = this.props;

    return (
      <>
        {/* <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get(`${commonPrompt}.view.button.accountExport`).d('门户账号报表')}
        </CusButton> */}
        <CusButton
          mini
          onClick={this.handleDelete}
          loading={deleteLinesLoading}
          disabled={distribution === 'viewer'}
        >
          {intl.get('hzero.common.view.button.delete').d('删除')}
        </CusButton>
        <CusButton mini onClick={this.handleAdd} disabled={distribution === 'viewer'}>
          {intl.get(`hzero.common.view.button.add`).d('新建')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleSave}
          loading={saveLoading}
          disabled={distribution === 'viewer'}
        >
          {intl.get('hzero.common.view.button.save').d('保存')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleGenerateAccount}
          loading={generateAccountLoading}
          disabled={distribution === 'viewer'}
          type="primary"
        >
          {intl.get(`${commonPrompt}.view.button.GenerPortAccount`).d('生成门户账号')}
        </CusButton>
      </>
    )
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
    } = this.props;
    const { selectedRows, permissionVisible, currentRecord } = this.state;
    console.log('dataSource', dataSource);
    const columns = [
      // {
      //   title: intl.get(`${commonPrompt}.view.column.companyNum`).d('企业编号'),
      //   dataIndex: 'companyNum',
      //   width: 120,
      //   render: (val, record) =>
      //     ['create'].includes(record._status) ? (
      //       <FormItem name={`${record[ROW_KEY]}#companyNum`} initialValue={val}>
      //         <Input disabled />
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get(`${commonPrompt}.field.supplier.num`).d('供应商编号'),
        dataIndex: 'supplierNumber',
        width: 160,
        render: (val, record) => {
          return ['create'].includes(record._status) ? (
            <FormItem name={`${record[ROW_KEY]}#supplierNumber`} initialValue={val}>
              <CusLov
                code="HKSP.ACCESS_SUPPLIER_EN"
                textValue={record.supplierNumber}
                onChange={(value, lovRecord) => {
                  this.companyNameOnChange(value, lovRecord, record);
                }}
              />
            </FormItem>
          ) : (
            tooltipRender(record.companyNum)
          )
        }
      },
      {
        title: intl.get(`${commonPrompt}.view.table.company.name.en`).d('公司名称(英文)'),
        dataIndex: 'companyNameEn',
        width: 250,
        required: true,
        render: (val, record) => {
          return ['create'].includes(record._status) ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Form.Item
                name={`${record[ROW_KEY]}#companyNameEn`}
                initialValue={record.companyNameEn}
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.view.table.company.name.en`).d('公司名称(英文)'),
                    }),
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </div>
          ) : (
            tooltipRender(val)
          )
        }
      },
      {
        title: intl.get(`${commonPrompt}.view.table.company.name.cn`).d('公司名称(中文)'),
        dataIndex: 'companyName',
        width: 250,
        required: true,
        render: (val, record) => {
          return ['create'].includes(record._status) ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Form.Item
                name={`${record[ROW_KEY]}#companyName`}
                initialValue={record.companyName}
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.view.table.company.name.cn`).d('公司名称(中文)'),
                    }),
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </div>
          ) : (
            tooltipRender(val)
          )
        }
      },
      {
        title: intl.get(`${commonPrompt}.view.table.EnterpriseEmail`).d('企业邮箱'),
        dataIndex: 'companyEmail',
        width: 250,
        required: true,
        render: (val, record) => {
          return ['create'].includes(record._status) ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Form.Item
                name={`${record[ROW_KEY]}#companyEmail`}
                initialValue={record.companyEmail}
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${commonPrompt}.view.table.EnterpriseEmail`)
                        .d('企业邮箱（门户登录账号）'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get(`${commonPrompt}.field.email.placeHolder`).d('邮箱格式不正确'),
                  },
                  // {
                  //   validator: this.checkEmailFuc
                  // }
                ]}
              >
                <Input onChange={(e) => this.emailOnChange(e.target.value, record)} />
              </Form.Item>
            </div>
          ) : (
            tooltipRender(val)
          )
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.table.Creator`).d('创建人'),
        dataIndex: 'creator',
        width: 100,
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.table.UpdateStatus`).d('更新状态'),
        dataIndex: 'processStatus',
        width: 120,
        render: (val, record) => (tooltipRender(record.processStatusMeaning)),
      },
      {
        title: intl.get(`${commonPrompt}.view.table.UpdateDate`).d('更新日期'),
        dataIndex: 'lastUpdateDate',
        width: 180,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`${commonPrompt}.view.column.processMessage`).d('处理信息'),
      //   dataIndex: 'processMessageMeaning',
      //   width: 120,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.table.operation`).d('操作'),
      //   dataIndex: 'action',
      //   width: this.getColWidth(
      //     intl.get(`${commonPrompt}.table.operation`).d('操作'),
      //     '分配权限',
      //   ),
      //   render: (_, record) => {
      //     return (
      //       <CusButton
      //         type="plain"
      //         disabled={record.processStatus !== 'Success'}
      //         onClick={() => {
      //           this.setState({
      //             permissionVisible: true,
      //             currentRecord: record,
      //           });
      //         }}
      //       >
      //         {intl.get(`${commonPrompt}.view.table.AssignPermissions`).d('分配权限')}
      //       </CusButton>
      //     );
      //   },
      // },
    ];

    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n[ROW_KEY]),
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      getCheckboxProps: (record) => ({
        disabled: !record[ROW_KEY], // 选择框的是否可选
      }),
    };
    return (
      <Fragment>
        <Form ref={this.tableForm} className="customize-table-from" onValuesChange={this.onFormChange}>
          <CusTable
            rowKey={ROW_KEY}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            scroll={{ x: tableScrollWidth(columns) }}
            rowSelection={rowSelection}
            onChange={(page) => this.handleChange(page)}
          // onRow={this.handleRow}
          />
        </Form>
        {/* <CusModal
          title={intl.get(`${commonPrompt}.view.button.modal.permissions`).d('门户权限分配')}
          visible={permissionVisible}
          destroyOnClose
          onCancel={() => {
            this.setState({
              permissionVisible: false,
            });
          }}
          footer={null}
          width={1000}
        >
          <Permissions
            infoData={currentRecord}
            onCancel={() => {
              this.setState({
                permissionVisible: false,
              });
            }}
          />
        </CusModal> */}
      </Fragment>
    );
  }
}

export default DataTable;
