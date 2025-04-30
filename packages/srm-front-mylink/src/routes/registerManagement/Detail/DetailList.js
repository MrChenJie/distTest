import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { Form } from 'hzero-ui';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusCascader from '_cus_components/CusCascader';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { tooltipRender } from '_cus_utils/render';
import CusLov from '_cus_components/CusLov';
import dayjs from 'dayjs';
import {Checkbox} from 'antd';
import { getCurrentOrganizationId } from 'utils/utils';

const prompt = 'spfmhk.supplier';
const tenantId = getCurrentOrganizationId();
@Form.create()
@formatterCollections({ code: [prompt] })
export default class DetailList extends PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, readyOnly,judgesSource, idpValueMap,  disabled = false, form, rowKey, fileCascader, tenantId ,basicForm} = this.props;
    const {getFieldDecorator} = form;
    const columns = [
      {
        title:
        (
          <>
            <span style={{color:'#FC0A0AFF'}}>*</span>
            <span>{intl.get(`spfmhk.dict.view.portal.name`).d('姓名')}</span>
          </>),
        dataIndex: 'name',
        width: 160,
        render: (value, record,index) => {
          return readyOnly ? (
            tooltipRender(record?.name)
          ) : (
            <Form.Item>
              {getFieldDecorator(`name${record?.rowKey}`, {
                initialValue: record?.name,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.portal.name`).d('姓名'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="MYLINK_USER_UNIT"
                  queryParams={{ tenantId: tenantId ,unitCode:basicForm?.unitCode}}
                  textValue={record?.name}
                  onChange={(_, item) => {
                    console.log(item,record)
                    record.name = item?.name;
                    record.judgeAccount = item?.employeeNum;
                    record.mobile = item?.mobile;
                    record.email = item?.email;
                    record.isEffective = 'Y';
                  }}
                />
              )}
            </Form.Item>
          );
        }
      },
      {
        title:intl.get(`spfmhk.dict.view.field.telno`).d('电话'),
        width: 160,
        dataIndex: 'mobile',
        key: 'mobile',
        render: (value, record) => {
          return readyOnly ? (
            tooltipRender(record.mobile)
          ) : (
            <Form.Item>
              {getFieldDecorator(`mobile${record?.rowKey}`, {
                initialValue: record?.mobile
              })(
              <CusInput disabled/>
              )}
            </Form.Item>
          );
        }
      },
      {
        title:intl.get(`spfmhk.dict.view.field.portalemail`).d('电邮'),
        width: 160,
        dataIndex: 'email',
        key: 'email',
        render: (value, record) => {
          return readyOnly ? (
            tooltipRender(record?.email)
          ) : (
            <Form.Item>
              {getFieldDecorator(`email${record?.rowKey}`, {
                initialValue: record?.email
              })(
              <CusInput disabled/>
              )}
            </Form.Item>
          );
        }
      },
      {
        title:intl.get(`spfmhk.dict.view.portal.userdescription`).d('用户描述'),
        width: 160,
        dataIndex: 'describe',
        key: 'describe',
        render: (value, record) => {
          return readyOnly ? (
            tooltipRender(record?.describe)
          ) : (
            <Form.Item>
              {getFieldDecorator(`describe${record?.rowKey}`, {
                initialValue: record?.describe,
              })(
                <CusInput
                  onChange={(value) => {
                    record.describe = value;
                  }}
                />
              )}
            </Form.Item>
          );
        }
      },
      {
        title:intl.get(`spfmhk.dict.view.field.judge.enable`).d('是否启用'),
        width: 100,
        dataIndex: 'isEffective',
        key: 'isEffective',
        render: (value, record) => {
          return readyOnly ? (
            tooltipRender(record?.isEffectiveMeaning)
          ) : (
            <Form.Item>
              {getFieldDecorator(`isEffective${record?.rowKey}`, {
                initialValue: record?.isEffective ? record?.isEffective : "Y"
              })(
                <Checkbox checkedValue="Y" unCheckedValue="N" checked={record.isEffective==="Y" ? true : false}
                onChange={(e) => {
                  record.isEffective = e.target.checked ? "Y" : "N"
                }}/>
              )}
            </Form.Item>
          );
        }
      },

    ];
    return (
      <Fragment>
        <EditTable
          rowKey={record => record?.rowKey}
          pagination={false}
          columns={columns}
          dataSource={judgesSource}
          // pagination={judgesPagination}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    )
  }
}
