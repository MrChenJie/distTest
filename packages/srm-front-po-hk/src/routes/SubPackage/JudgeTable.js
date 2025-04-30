/**
 * TechnicalGradeTable - 评委组设置
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
const organizationId = getCurrentOrganizationId();
import { pullAllBy } from 'lodash';
import CusNotification from 'utils/notification';


const promptCode = 'ssrc.resaleRfq';
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
    const {
      dispatch,
      // contactPerson: { judgeDataSource = [] },
      pacId,
    } = this.props;
    const { judgeDataSource } = this.props
    dispatch({
      type: `purchasePlan/updateState`,
      payload: {
        judgeDataSource: [
          ...judgeDataSource,
          {
            // _status: 'create',
            // qqq: uuid(),
            // detailTerm : '' , //细节条款
            // isDel : '0' , // 删除状态
            // isKpi : '' , // 是否关键指标code
            // isKpiMeaning :'',  // 是否关键指标
            // lineNo : judgeDataSource.length + 1, // 序号
            // processMessage : '' , // 处理信息
            // refHeadId : pacId , // 标包ID
            // tenantId: organizationId.toString(),
            // term : '', //大条款

            _status: 'create',
            iii: uuid(),
            email : '' ,//邮箱
            isDel : '0' ,//删除状态
            judgeDep : '' , //评委所在部门
            judgeName : '' ,//评委姓名
            judgeType : '' ,//评委类型
            lineNo : judgeDataSource.length + 1, // 序号
            phone :  '',//电话
            refHeadId : pacId , // 标包ID
            remark : '' ,//备注
            status : '' ,//状态
            tenantId: organizationId.toString(),
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
       : selectedRows.filter((n) => n.iii !== record.iii);
     // 选择的行key
     let newSelectedRowKeys = [];
     newSRows.forEach((item) => {
       newSelectedRowKeys.push(item.iii);
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
       : pullAllBy([...selectedRows], changeRows, 'iii');
     let newSelectedRowKeys = [];
     newSRows.forEach((item) => {
       newSelectedRowKeys.push(item.iii);
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
       judgeDataSource
     } = this.props;
     const { selectedRowKeys } = this.state;
     if (selectedRowKeys.length > 0) {
       const newjudgeDataSource = judgeDataSource
         .map((item) => {
           //  如果选择的是后端返回的数据，就把这个数据的状态改为1
           if (selectedRowKeys.includes(item.iii)) {
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
       //     judgeDataSource: [...newjudgeDataSource],
       //   },
       // });
       this.setState({ selectedRowKeys: [] });
       console.log(newjudgeDataSource, '删除之后的数据');
     } else {
       CusNotification.info({
         message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
         placement: 'bottomRight',
       });
     }
   }

  render() {
    const { disabled,selectedRowKeys } = this.state
    const {
      judgeDataSource,
      judgeDataPagination
    } = this.props

    console.log('这是评委',judgeDataSource);

    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.SN`).d('序号'),
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
        title: intl.get(`bid.bidcommon.view.title.ExpertType`).d('评委类型'),
        dataIndex: 'judgeType',
        width: 150,
        required: !disabled,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('judgeType', {
                initialValue: record.judgeType,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.ExpertType`).d('评委类型'),
                  }),
                }]
              })(
                <CusInput
                  onBlur={(event)=>{
                    record.judgeType = event.target.value
                  }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.ExpertName`).d('评委姓名'),
        dataIndex: 'judgeName',
        width: 150,
        required: !disabled,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('judgeName', {
                initialValue: record.judgeName,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.ExpertName`).d('评委姓名'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.judgeName = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.Department`).d('评委所在部门'),
        dataIndex: 'judgeDep',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('judgeDep', {
                initialValue: record.judgeDep,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.Department`).d('评委所在部门'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.judgeDep = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.Phone`).d('电话'),
        dataIndex: 'phone',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('phone', {
                initialValue: record.phone,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.Phone`).d('电话'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.phone = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.MailAddress2`).d('邮箱'),
        dataIndex: 'email',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('email', {
                initialValue: record.email,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.MailAddress2`).d('邮箱'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.email = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.Status`).d('状态'),
        dataIndex: 'status',
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
                    name: intl.get(`bid.bidcommon.view.title.Status`).d('状态'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.status = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.Remark`).d('备注'),
        dataIndex: 'remark',
        required: !disabled,
        width: 100,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('remark', {
                initialValue: record.remark,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.Remark`).d('备注'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.remark = event.target.value
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
      dataSource: judgeDataSource,
      pagination: judgeDataPagination,
      rowSelection: rowSelection,
      rowKey: 'iii',
      columns,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    }

    return (<>
      <div style={{ margin: '16px 0', textAlign: 'right', display: 'flex', flexDirection: 'row-reverse' }}>
        <CusButton onClick={this.handleAdd}>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
        <CusButton onClick={this.handleDelete}>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
      </div>
      <EditTable {...tableProps} />
    </>)
  }
}