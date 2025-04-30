import React from 'react';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '_cus_components/CusUpload';
import CusLov from '_cus_components/CusLov';
import uuidv4 from 'uuid/v4';
import CusButton from '_cus_components/CusButton';


export default class DrawJudgeList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      idpValueMap,
      PartnerInformationModal,
      readyOnly = false,
      onChange = (e) => e,
      handleRedraw = (e) => e,
    } = this.props;

    const {
      drawJudgeSource,
    } = PartnerInformationModal;

    console.log('drawJudgeSource', drawJudgeSource);

    const columns = [
      {
        title: intl.get(`HKPC.commom.view.title.SN`).d('序号'),
        dataIndex: 'orderSeq',
        width: 80,
        render: (text, record, index) => index + 1,
      },
      {
        title: intl.get(`spfmhk.mylink.view.title.SN`).d('评委类型'),
        dataIndex: 'drawjudge',
        width: 150,
        render: (_, record) => {
          return (
            <div>{intl.get(`spfmhk.mylink.title.drawjudge`).d('评委抽取')}</div>
          )
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.judgeName`).d('评委名称'),
        dataIndex: 'judgeName',
        width: 350,
        required: true,
        render: (_, record) => {
          return (
            readyOnly ? tooltipRender(record.judgeName) :
            <Form.Item>
              {record?.$form?.getFieldDecorator('judgeIdVal', {
                initialValue: record.judgeName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.judgeName`).d('评委名称'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="LINK.JUDGE_INFO"
                  queryParams={{judgeUnitCode: record.judgeUnitCode}}
                  lovOptions={{ displayField: 'judgeName', valueField: 'judgeId' }}
                  textValue={record.judgeName}
                  onChange={(_, item) => {
                    record.judgeId = item?.judgeId; // 评委id
                    record.judgeName = item?.judgeName; // 评委姓名
                    record.judgeDepartment = item?.unitName; // 评委所在部门
                    record.judgePhone = item?.judgePhone; // 评委电话
                    record.judgeEmail = item?.judgeEmail; // 评委邮箱
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.judgeDepart`).d('评委所在部门'),
        dataIndex: 'judgeDepartment',
        width: 460,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.company.phone`).d('电话号码'),
        dataIndex: 'judgePhone',
        width: 300,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.mailbox`).d('邮箱'),
        dataIndex: 'judgeEmail',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`hzero.common.view.operation`).d('操作'),
        dataIndex: 'operator',
        width: 150,
        render: (_, record) => {
          return (
            <>
              <CusButton
                type="plain"
                onClick={() => handleRedraw(record)}
              >
                {intl.get(`spfmhk.mylink.field.Redraw`).d('重新抽取')}
              </CusButton>
            </>
          )
        },
      }
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          dataSource={drawJudgeSource}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
