/**
 * index.js - 协议拟制列表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Select, Input } from 'hzero-ui';
import { sum } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

export default class List extends React.Component {
  // // 编辑保存
  // toggleEdit = () => {
  //   const editing = !this.state.editing;
  //   this.setState({ editing }, () => {
  //     if (editing) {
  //       this.input.focus();
  //     }
  //   });
  // }
  // // 编辑时的保存
  // @Bind()
  // save = () => {
  //   const { record, handleSave } = this.props;
  //   this.form.validateFields((error, values) => {
  //     if (error) {
  //       return;
  //     }
  //     this.toggleEdit();
  //     handleSave({ ...record, ...values });
  //   });
  // }
  // @Bind()
  // handleSave = (row) => {
  //   const newData = [...this.state.dataSource];
  //   const index = newData.findIndex(item => row.key === item.key);
  //   const item = newData[index];
  //   newData.splice(index, 1, {
  //     ...item,
  //     ...row,
  //   });
  //   this.setState({ dataSource: newData });
  // }

  getNewDatasource () {

  }

  render() {
    const {
      loading,
      dataSource = [],
      onSearch,
      pagination,
      selectedRows,
      selectedRowKeys = [],
      onRowSelectChange = (e) => e,
      // handleDataChange = (e) => e,
      contractMaintain,
      newDatasource = [
        ...dataSource, 
        {
          remarks: "",
          score: "",
          scoreClause: "",
          scoreType: "",
          setScore: "",
          socreConfigId: "",
        }, 
        {
          remarks: "",
          score: "",
          scoreClause: "",
          scoreType: "",
          setScore: "",
          socreConfigId: "",
        }
      ],
      ...others
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('一级评审项目'),
        dataIndex: 'scoreClause',
        width: 150,
        render: (text, row, index, record) => {
          // if (record._status === 'update' || record._status === 'create') {
          console.log("一级评审项目", row.length);
          if (row.$form !== undefined) {
            const { getFieldDecorator } = row.$form;
            if (index < newDatasource.length - 2) {
              return (
                // <Input
                //   type="text"
                //   defaultValue={row.scoreClause} onPressEnter={this.save}
                //   placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')}
                // />
                <Form.Item>
                  {getFieldDecorator('scoreClause', {
                    initialValue: row.scoreClause,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.purchaseOrg.model.org.organizationCode')
                            .d('一级评审项目'),
                        }),
                      },
                    ],
                  })(
                    <Input typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              );
            // }
            }
          }
          if (index === newDatasource.length - 2) {
            return {
              children: <p>总分(百分制)</p>,
              props: {
                colSpan: 2,
              },
            };
          }
          if (index === newDatasource.length - 1) {
            return {
              children: <p>权重</p>,
              props: {
                colSpan: 2,
              },
            };
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('评分细则'),
        dataIndex: 'clauseDetail',
        width: 150,
        render: (text, row, index) => {
          if (index < newDatasource.length - 2) {
            return (
              <Input
                type="text"
                value={row.clauseDetail}
                placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')}
              />
            );
          }
          if (index === newDatasource.length - 2) {
            return {
              children: <p>100分</p>,
              props: {
                colSpan: 4,
              },
            };
          }
          if (index === newDatasource.length - 1) {
            return {
              children: <p>100分</p>,
              props: {
                colSpan: 4,
              },
            };
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('分值'),
        dataIndex: 'score',
        width: 150,
        render: (text, row, index) => {
          if (index < newDatasource.length - 2) {
            return (
              <Input
                type="text"
                value={row.score}
                placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('20')}
              />
            );
          }
          if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
            return {
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('分值类型'),
        dataIndex: 'scoreType',
        width: 150,
        render: (text, row, index, val) => {
          if (index < newDatasource.length - 2) {
            return (
              <Select
                placeholder="请选择"
                value={row.scoreType}
                style={{ width: '100%' }}
                onChange={this.handleCurrencyChange}
              >
                <Select.Option value="rmb">定值型</Select.Option>
                <Select.Option value="dollar">范围型</Select.Option>
              </Select>
            );
          }
          if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
            return {
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('是否客观分'),
        dataIndex: 'isObjectiveScore',
        width: 150,
        render: (text, row, index) => {
          if (index < newDatasource.length - 2) {
            return (
              // setTimeout(() => {
              <Select
                placeholder="请选择"
                value={row.isObjectiveScore}
                style={{ width: '100%' }}
                onChange={this.handleCurrencyChange}
              >
                {/* {chooseList.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))} */}
                <Select.Option value="rmb">是</Select.Option>
                <Select.Option value="dollar">否</Select.Option>
              </Select>
              // }, 500)
            );
          }
          if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
            return {
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('设置分值下拉值'),
        dataIndex: 'setScore',
        width: 150,
        // render: () => <Input type="text" placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')} />
        render: (text, row, index) => {
          if (index < newDatasource.length - 2) {
            return (
              <Input
                type="text"
                value={row.setScore}
                placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')}
              />
            );
          }
          if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
            return {
              props: {
                colSpan: 0,
              },
            };
          }
        },
      },
    ].filter(Boolean);
    const tableProps = {
      newDatasource: [
        ...dataSource, 
        {
          remarks: "",
          score: "",
          scoreClause: "",
          scoreType: "",
          setScore: "",
          socreConfigId: "",
        }, 
        {
          remarks: "",
          score: "",
          scoreClause: "",
          scoreType: "",
          setScore: "",
          socreConfigId: "",
        }
      ],
      dataSource: newDatasource,
      loading,
      columns,
      rowSelection: {
        selectedRowKeys,
        onChange: onRowSelectChange,
        // onDataChange: handleDataChange,
      },
      bordered: true,
      pagination: false,
      ...others,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return <EditTable {...tableProps} />;
  }
}
