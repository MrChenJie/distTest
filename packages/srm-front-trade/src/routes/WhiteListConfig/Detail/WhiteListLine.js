import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Button, Row, Col, Switch, Form, Input } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import uuid from 'uuid/v4';
import addIcon from '@/assets/buttonIcons/新建.png';

const commonPrompt = 'spub.whiteListConfig';
const Item = Form.Item;

export default class WhiteListLine extends PureComponent {
  constructor(props) {
    super(props);
  }

  isEdit = (record = {}) => {
    return ['create', 'update'].includes(record._status);
  }

  handleCreate = () => {
    const {
      dispatch,
      whiteListConfigId,
      whiteListConfigList,
      isCreate,
    } = this.props;
    dispatch({
      type: 'whiteListConfig/updateState',
      payload: {
        whiteListConfigList: [
          {
            _status: 'create',
            whiteListConfigId: isCreate ? undefined : whiteListConfigId,
            detailId: uuid(),
          },
          ...whiteListConfigList,
        ],
      },
    });
  }


  render() {
    const { whiteListConfigList = [] } = this.props;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.whiteListLine.systemCode`).d('来源系统'),
        dataIndex: 'systemCode',
        width: 120,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('systemCode', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${commonPrompt}.view.whiteListLine.systemCode`)
                          .d('来源系统'),
                      }),
                    },
                  ],
                })(
                  <Input />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.whiteListLine.ipRule`).d('ip规则'),
        dataIndex: 'ipRule',
        width: 500,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('ipRule', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${commonPrompt}.view.whiteListLine.ipRule`)
                          .d('ip规则'),
                      }),
                    },
                  ],
                })(
                  <Input />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.whiteListLine.enabledFlag`).d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 90,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('enabledFlag', {
                  initialValue: val || '1',
                })(
                  <Switch checkedValue='1' unCheckedValue='0' />
                )}
              </Item>
            )
          }
        }
      },
    ];
    return (
      <Fragment>
        <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
          <Col offset={12} span={12} className="customize-buttons">
            <Button onClick={this.handleCreate}>
              <img src={addIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Col>
        </Row>
        <EditTable
          bordered
          rowKey="detailId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={whiteListConfigList}
          pagination={false}
        />
      </Fragment>
    )
  }
}
