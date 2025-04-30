import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import { Form } from 'hzero-ui';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';

const prompt = 'spfmhk.mylink';

@Form.create()
export default class DetailList extends PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  componentDidMount() {}

  render() {
    const {
      dispatch,
      readyOnly,
      idpValueMap,
      judgesActiveKey,
      partnerAssessmentModal,
      handleExport = (e) => e,
      handleImport = (e) => e,
    } = this.props;
    const { judgesSource = [], partnerEvalItems = [] } = partnerAssessmentModal;
    
    const columns = [
      {
        title: intl.get(`${prompt}.field.partner.name`).d('合作伙伴名称'),
        dataIndex: 'lineNum',
        width: 180,
        render: (_, record) => {
          return (
            tooltipRender(record?.partnerName)
          )
        }
      },
      judgesActiveKey === 'SALES_MAN' && {
        title: intl.get(`${prompt}.field.title.user`).d('业务员'),
        dataIndex: 'operation',
        width: 160,
        render: (_, record) => {
          return (
            tooltipRender(record?.salesPerson)
          )
        }
      },
    ].filter(Boolean);

    const totalScoreColumns = [
      {
        title: intl.get(`${prompt}.field.total.score`).d('总分'),
        dataIndex: 'operator',
        width: 80,
        render: (_, record) => {
          console.log('getFieldsValue', record.$form.getFieldsValue());
          
          const sum = Object.values(record.$form.getFieldsValue()).reduce((acc, value) => acc + (Number(value) || 0), 0);
          console.log('sum', sum);
          
          return (
            tooltipRender(sum === 0 ? record.evalScoreSum : sum)
          )
        }
      },
    ];

    const newColumns = [
      ...columns, // 保留原来的列
      ...partnerEvalItems?.map(item => ({
        title: item.meaning, 
        dataIndex: item.value,
        required: !readyOnly,
        // width: 80,
        render: (_, record) => {
          console.log('readyOnly', readyOnly);
          
          return readyOnly ? (
            tooltipRender(record?.[item.value])
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`${item.value}`, {
                initialValue: record?.[item.value],
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: item.meaning,
                    }),
                  },
                ],
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  allowClear
                  options={idpValueMap['LINK.PARTNER_EVAL_SCORE']}
                  onChange={(value) => {
                    console.log('record', value, record)
                    record.$form.setFieldsValue({
                      totalScore: value
                    });
                    record.totalScore = value;

                    dispatch({
                      type: 'partnerAssessmentModal/updateState',
                      payload: {
                        changeJudgesSource: judgesSource.map((el) => {
                          if(el.evalScoreId === record.evalScoreId) {
                            el[item.value] = value
                          }
                          return el;
                        })
                      }
                    })
                  }}
                />
              )}
            </Form.Item>
          );
        }
      })),
      ...totalScoreColumns, // 总分列
    ];

    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: intl.get(`${prompt}.field.assess.tips`).d('考核指标：(非常满意 20分 /  满意15分/ 普通10分/ 不满意 5分/ 非常不满意 0分)</br>1. 业绩表现：交易笔数/兑换量/用户喜爱度</br>2. 运营表现：库存响应度/物流发货/技术支撑</br>3. 竞争力：产品或服务质量/优惠吸引度</br>4. 服务质量：客户投诉量/服务回复支撑</br>5. 付款情况：对账配合情况/结算配合情况') }}></div>
        <div style={{margin: '16px 0', textAlign: 'right'}}>
          {!readyOnly && <div>
            <CusButton
              mini
              onClick={handleExport}
            >
              {intl.get(`${prompt}.button.template.export`).d('模版导出')}
            </CusButton>
            <CusButton
              mini
              type="primary"
              onClick={handleImport}
            >
              {intl.get(`${prompt}.button.import`).d('导入')}
            </CusButton>
          </div>}
        </div>
        <div style={{marginBottom: '16px'}}>
          <EditTable
            rowKey="rowKey"
            pagination={false}
            columns={newColumns}
            dataSource={judgesSource}
            rowSelection={false}
            scroll={{ x: tableScrollWidth(columns), y: 440 }}
          />
        </div>
      </>
    )
  }
}
