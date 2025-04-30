import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import EditTable from '_cus_components/EditTable';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '_cus_components/CusUpload';

@Form.create({ fieldNameProp: null })

export default class UploadFileList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      rowSelection,
      PartnerInformationModal,
      readyOnly = false,
      activityCode,
      state
    } = this.props;

    const {
      partnerScore,
      partnerBase,
    } = PartnerInformationModal;

    // 只有节点在专家01，02，03且状态为审批中才能编辑
    const isEdit = ['01', '02', '03'].includes(activityCode) && partnerBase?.revStatus === 'Inapproval';

    console.log('partnerScore', partnerScore);
    console.log('partnerBase', partnerBase);

    const columns = [
      {
        title: intl.get(`spfmhk.dict.view.field.tech.majorscoreitem`).d('评分大项'),
        dataIndex: 'lineNum',
        width: 180,
        render: (_, record) => {
          return (
            <div>{record.revItemMeaning}</div>
          )
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.tech.detailedscore`).d('评分细项'),
        dataIndex: 'revSubItem',
        width: 300,
        render: (_, record) => {
          return (
            tooltipRender(<div style={{fontSize: 16}} dangerouslySetInnerHTML={{ __html: record.revSubItem }} />)
          )
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.tech.scorevalue`).d('分值'),
        dataIndex: 'orderSeq',
        width: 80,
        render: (_, record) => {
          return (
            <div>{record.scoreRange}</div>
          )
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.tech.score`).d('分数'),
        dataIndex: 'operation',
        width: 100,
        required: true,
        render: (_, record) => {
          return (
            isEdit && state != 'DONE' ?
            <Form.Item>
              {record.$form.getFieldDecorator(`score`, {
                initialValue: record.score,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.tech.score`).d('分数'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  max={record.maxScore}
                  precision={0}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.score)
          )
        }
      },
      {
        title: intl.get(`spfmhk.dict.view.field.tech.reason`).d('理由'),
        dataIndex: 'reason',
        width: 200,
        render: (_, record) => {
          return (
            isEdit && state != 'DONE' ?
            <Form.Item>
              {record.$form.getFieldDecorator(`reason`, {
                initialValue: record.reason,
              })(
                <CusInput.TextArea
                  showCharacter
                  maxLength={255}
                  autoChangeSize={true}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.reason)
          )
        }
      }
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          rowSelection={readyOnly ? rowSelection : false}
          dataSource={partnerScore}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
