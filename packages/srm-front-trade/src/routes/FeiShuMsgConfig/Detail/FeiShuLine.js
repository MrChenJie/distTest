import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Button, Row, Col, Switch, Form, Input } from 'hzero-ui';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { tableScrollWidth } from 'utils/utils';
import uuid from 'uuid/v4';
import addIcon from '@/assets/buttonIcons/新建.png';

const commonPrompt = 'spub.feiShuMsgConfig';
const Item = Form.Item;

export default class FeiShuLine extends PureComponent {
  constructor(props) {
    super(props);
  }

  isEdit = (record = {}) => {
    return ['create', 'update'].includes(record._status);
  }

  handleCreate = () => {
    const {
      dispatch,
      msgConfigId,
      feiShuMsgConfigList,
      isCreate,
    } = this.props;
    dispatch({
      type: 'feiShuMsgConfig/updateState',
      payload: {
        feiShuMsgConfigList: [
          {
            _status: 'create',
            msgConfigId: isCreate ? undefined : msgConfigId,
            msgConfigDtlId: uuid(),
          },
          ...feiShuMsgConfigList,
        ],
      },
    });
  }


  render() {
    const { feiShuMsgConfigList = [], idpValueMap } = this.props;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.feiShuLine.sequence`).d('序号'),
        dataIndex: 'sequence',
        width: 100,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('sequence', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${commonPrompt}.view.feiShuLine.sequence`)
                          .d('序号'),
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
        title: intl.get(`${commonPrompt}.view.feiShuLine.tag`).d('标签'),
        dataIndex: 'tag',
        width: 140,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('tag', {
                  initialValue: val,
                })(
                  <ValueList
                    options={idpValueMap['SPUB.FEI_SHU_TAG_CODE']}
                    style={{ width: '100%' }}
                    lazyLoad={false}
                    allowClear
                  />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.feiShuLine.textCode`).d('文本编码'),
        dataIndex: 'textCode',
        width: 160,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('textCode', {
                  initialValue: val,
                })(
                  <Input />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.feiShuLine.textDefault`).d('文本内容默认值'),
        dataIndex: 'textDefault',
        width: 180,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('textDefault', {
                  initialValue: val,
                })(
                  <Input />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.feiShuLine.textValueType`).d('文本内容值类型'),
        dataIndex: 'textValueType',
        width: 200,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('textValueType', {
                  initialValue: val,
                })(
                  <ValueList
                    options={idpValueMap['SPUB.FEI_SHU_TEXT_VALUE_TYPE']}
                    style={{ width: '100%' }}
                    lazyLoad={false}
                    allowClear
                  />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.feiShuLine.href`).d('超链接'),
        dataIndex: 'href',
        width: 220,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('href', {
                  initialValue: val,
                })(
                  <Input />
                )}
              </Item>
            )
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.feiShuLine.enabledFlag`).d('是否有效'),
        dataIndex: 'enabledFlag',
        width: 120,
        render: (val, record) => {
          if (this.isEdit(record)) {
            return (
              <Item>
                {record.$form.getFieldDecorator('enabledFlag', {
                  initialValue: val,
                })(
                  <Switch checkedValue='Y' unCheckedValue='N' />
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
          rowKey="msgConfigDtlId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={feiShuMsgConfigList}
          pagination={false}
        />
      </Fragment>
    )
  }
}
