import React from 'react';
import intl from 'utils/intl';
import { Col, Input, InputNumber } from 'antd';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import EditTable from '_cus_components/EditTable';
import uuid from 'uuid/v4';
import queryString from 'querystring';
import { divide } from 'lodash';

const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class ScoreTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
  }

  render() {
    const {
      rowSelection,
      scoreList = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      isDone,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.tech.majorscoreitem`).d('评分大项'),
        dataIndex: 'itemCase',
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.view.field.tech.detailedscore`).d('评分细项'),
        dataIndex: 'itemCaseDetail',
        align: 'left',
        render: (val, record) => {
          return <div style={{ whiteSpace: 'pre-wrap' }}>{val.replaceAll('\\n', '\n')}</div>;
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.field.tech.scorevalue`).d('分值'),
        dataIndex: 'scoreValue',
        align: 'left',
      },
      {
        title: (
          <>
            {' '}
            <span style={{ color: 'red' }}>*</span>{' '}
            {intl.get(`${commonPrompt}.view.field.tech.score`).d('分数')}
          </>
        ),
        dataIndex: 'score',
        align: 'left',
        render: (val, record) => {
          if (isDone) {
            return <>{val}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`${record.rowKey}score`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${commonPrompt}.view.field.tech.score`).d('分数'),
                    }),
                  },
                ],
                initialValue: record.score,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  step={1}
                  min={0}
                  max={Number(record.scoreValue.split('-')[1])}
                  precision={0}
                  onBlur={(e) => {
                    record.score = e.target.value;
                  }}
                  disabled={isDone}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.field.tech.reason`).d('理由'),
        dataIndex: 'reason',
        align: 'left',
        render: (val, record) => {
          if (isDone) {
            return <>{val}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`${record.rowKey}reason`, {
                initialValue: record.reason,
              })(
                <Input
                  onBlur={(e) => {
                    record.reason = e.target.value;
                  }}
                  disabled={isDone}
                />
              )}
            </Form.Item>
          );
        },
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={scoreList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
