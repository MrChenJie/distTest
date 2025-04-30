import React, { PureComponent, Fragment } from 'react';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { Form } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';//文字提示
import intl from 'utils/intl';
import CusButton from 'srm-front-common/lib/components/CusButton';

const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class DetailList extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const {
      rowSelection,
      dataSource,
      handleTableFieldChange,
      handleReset,
      existUnitCodes,
    } = this.props;
    const columns = [
      {
        title: intl.get('spfmhk.dict.view.selectjudge.no').d('序号'),
        width: 100,
        render: (value, record, index) => {
          return <>{index + 1}</>;
        },
      },
      {
        title: intl.get('spfmhk.dict.view.selectjudge.judgetype').d('评委类型'),
        width: 160,
        dataIndex: 'judgeType',
        key: 'judgeType',
        required: true,
        render: (value, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('judgeType', {
                initialValue: record?.judgeType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfmhk.dict.view.selectjudge.judgetype').d('评委类型'),
                    }),
                  },
                ],
              })(<CusSelect lovCode="DICT.JUDGE_CHOICE_TYPE"
                            onChange={(rowValue) => {
                              handleTableFieldChange({
                                rowValue,
                                record,
                                fieldName: 'judgeType',
                                dataSource,
                              });
                            }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.judge.name').d('评委名称'),
        width: 300,
        dataIndex: 'name',
        key: 'name',
        required: true,
        render: (value, record) => {
          const { disabled } = record;
          if (disabled) {
            return <>{record?.name}</>;
          }
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('name', {
                initialValue: record.name,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfmhk.dict.view.field.judge.name').d('评委名称'),
                    }),
                  },
                ],
              })(<CusLov code="DICT.JUDGE_DEPART_MEMBER"
                         lovOptions={{
                           valueField: 'name',
                           displayField: 'name',
                         }}
                         textField="name"
                         textValue={record.name}
                         queryParams={{
                           judgeType: record.tag,
                           existUnitCodes,
                         }}
                         onChange={(rowValue, selectedRow) => {
                           handleTableFieldChange({
                             selectedRow,
                             record,
                             fieldName: 'name',
                             dataSource,
                           });
                         }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.selectjudge.judgedepartment').d('评委所在部门'),
        width: 160,
        dataIndex: 'unitName',
        key: 'unitName',
        render: tooltipRender,
      },
      {
        title: intl.get('spfmhk.dict.view.field.telno').d('电话'),
        width: 160,
        dataIndex: 'mobile',
        key: 'mobile',
        render: tooltipRender,
      },
      {
        title: intl.get('spfmhk.dict.view.field.email').d('邮箱'),
        width: 160,
        dataIndex: 'email',
        key: 'email',
        render: tooltipRender,
      },
      {
        title: intl.get('spfmhk.dict.view.selectjudge.status').d('状态'),
        width: 100,
        dataIndex: 'status',
        key: 'status',
        required: true,
        render: (value, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('status', {
                initialValue: record.status,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfmhk.dict.view.selectjudge.status').d('状态'),
                    }),
                  },
                ],
              })(<CusSelect lovCode="DICT.JUDGE_CHOICE_STATUS"
                            onChange={(rowValue) => {
                              handleTableFieldChange({
                                rowValue,
                                record,
                                fieldName: 'status',
                              });
                            }} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.operate').d('操作'),
        width: 160,
        dataIndex: 'operation',
        key: 'operation',
        render: (value, record) => {
          return (
            <CusButton type="plain"
                       onClick={() => handleReset({ record })}
                       disabled={!record.name}
            >
              {intl.get(`${prompt}.view.field.judge.reset`).d('重新抽取')}
            </CusButton>
          );
        },
      },

    ];
    return (
      <EditTable
        rowKey="rowKey"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
