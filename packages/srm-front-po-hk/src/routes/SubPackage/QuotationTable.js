/**
 * TechnicalGradeTable - 报价表格式
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import { numberRender, dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { Col } from 'antd';
import uuid from 'uuid/v4';
import { getCurrentOrganizationId } from 'utils/utils';
import { pullAllBy } from 'lodash';
import CusNotification from 'utils/notification';

const organizationId = getCurrentOrganizationId();
const promptCode = 'HKPC.commom';
@Form.create()
export default class TechnicalGradeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      disabled: false
    };
  }

   // 新建
   @Bind()
   handleAdd() {
     this.setState({
       disabled:true
     })
     const {
       dispatch,
       // contactPerson: { quoteDataSource = [] },
       pacId,
     } = this.props;
     const { quoteDataSource } = this.props
     dispatch({
       type: `purchasePlan/updateState`,
       payload: {
         quoteDataSource: [
           ...quoteDataSource,
           {
            //  _status: 'create',
            //  qqq: uuid(),
            //  detailTerm : '' , //细节条款
            //  isDel : '0' , // 删除状态
            //  isKpi : '' , // 是否关键指标code
            //  isKpiMeaning :'',  // 是否关键指标
            //  lineNo : quoteDataSource.length + 1, // 序号
            //  processMessage : '' , // 处理信息
            //  refHeadId : pacId , // 标包ID
            //  tenantId: organizationId.toString(),
            //  term : '', //大条款

              _status: 'create',
              eee: uuid(),
              isDel :  '0',//删除状态
              lineNo : quoteDataSource.length + 1, // 序号
              matName : '' ,//物料名称
              matType : '' ,//规格型号
              quantity : null ,//数量
              quotedCurrency : '' ,//报价货币
              refHeadId : pacId ,
              tenantId : organizationId.toString() ,
              unit : '', //单位
           },
         ],
       },
     })
   }

   // 选中行
  @Bind()
  handleSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n.eee !== record.eee);
    // 选择的行key
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.eee);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
    console.log("选中的key", newSelectedRowKeys);
  }

  // 全选/全不选
  @Bind()
  handleSelectAll(selected, newSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, 'eee');
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.eee);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  // 删除
  @Bind()
  handleDelete() {
    const {
      dispatch,
      quoteDataSource
    } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      const newquoteDataSource = quoteDataSource
        .map((item) => {
          //  如果选择的是后端返回的数据，就把这个数据的状态改为1
          if (selectedRowKeys.includes(item.eee)) {
            item.isDel = '1';
            return item;
          } else {
            return item;
          }
        })
        // 过滤出 后端反的（删掉了） || 选择的是后端反的 但是排除掉被勾选的（同时也保留了新增的数据）
        .filter((i) => i.isDel !== '1');

      // dispatch({
      //   type: `${NAME_SPACE}/updateState`,
      //   payload: {
      //     quoteDataSource: [...newquoteDataSource],
      //   },
      // });
      this.setState({ selectedRowKeys: [] });
      console.log(newquoteDataSource, '删除之后的数据');
    } else {
      CusNotification.info({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        placement: 'bottomRight',
      });
    }
  }

  render() {
    const { selectedRowKeys, } = this.state
    const {
      quoteDataSource,
      quoteDataPagination,
      disabled,
      idpValueMap
    } = this.props

    console.log(quoteDataSource,'这是报价表格式设置');

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 62,
        // fixed: 'left',
        dataIndex: 'lineNo',
        render: (_, record, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              {index + 1}
            </div>
          );
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        width: 150,
        required: !disabled,
        render: (text, record, index) => {
          return (
            <Form.Item>
              {record.$form && record.$form.getFieldDecorator('matName', {
                initialValue: record.matName,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
                  }),
                }]
              })(
                <CusLov
                  autoChangeSize={true}
                  onChange={() => {
                    record.matName = record.$form.getFieldValue('matName')
                  }}
                  code='MATERIALNAME'
                  // options={idpValueMap['MATERIALNAME']}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        width: 550,
        required: !disabled,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('matType', {
                initialValue: record.matType,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
                  }),
                }]
              })(
                <CusInput
                  onBlur={(event)=>{
                    record.matType = event.target.value
                  }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('unit', {
                initialValue: record.unit,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.unit`).d('单位'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.unit = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'quantity',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('quantity', {
                initialValue: record.quantity,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
                  }),
                }]
              })(
                <CusInput
                  onBlur={(event)=>{
                    record.quantity = Number(event.target.value)
                  }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        dataIndex: 'quotedCurrency',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('quotedCurrency', {
                initialValue: record.quotedCurrency,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
                  }),
                }]
              })(
                <CusInput
                  onBlur={(event)=>{
                    record.quotedCurrency = event.target.value
                  }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
    ].filter(Boolean);

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onSelect: this.handleSelect,
      onSelectAll: this.handleSelectAll,
    };

    const tableProps = {
      dataSource: quoteDataSource,
      pagination: quoteDataPagination,
      rowKey: 'eee',
      rowSelection: rowSelection,
      columns,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    }

    return (<>
      <div style={{ margin: '16px 0', textAlign: 'right', display: 'flex', flexDirection: 'row-reverse' }}>
        <CusButton onClick={this.handleAdd}>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
        <CusButton onClick = {this.handleDelete}>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
      </div>
      <EditTable {...tableProps} />
    </>)
  }
}