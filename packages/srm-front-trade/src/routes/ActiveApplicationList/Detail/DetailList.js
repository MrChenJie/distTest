import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';

const organizationId = getCurrentOrganizationId();

@Form.create()
export default class DetailList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      idpValueMap,
      rowSelection,
      activeApplicationListModal,
      basicForm,
      readyOnly = false,
      onChange = (e) => e,
    } = this.props;

    const {
      productDetailSource,
      productDetailPagination,
    } = activeApplicationListModal;

    console.log('productDetailSource', productDetailSource);

    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.ProductName`).d('商品名称'),
        dataIndex: 'matName',
        width: 250,
        required: true,
        render: (_, record) => {
          return (
            readyOnly ? tooltipRender(record.matName) : <Form.Item>
              {record?.$form?.getFieldDecorator('matNum', {
                initialValue: record.matName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.trade.field.ProductName`).d('商品名称'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="HKTB.SQL.ITEM.LIST"
                  queryParams={{ tenantId: organizationId }}
                  lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                  textValue={record.matName}
                  onChange={(_, item) => {
                    record.matNumber = item?.itemNumber; // 商品编码
                    record.matName = item?.itemDescription; // 商品名称
                    record.matModel = item?.itemLongDescription; // 型号
                    record.productCode = item?.productCode; // 产品编码
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductCode`).d('产品编码'),
        dataIndex: 'productCode',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductSpecif`).d('型号'),
        dataIndex: 'matModel',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductBidRule`).d('商品投标规则'),
        dataIndex: 'orderSeq',
        width: 180,
        required: true,
        render: (_, record) => {
          const productBidRuleOptions = idpValueMap['HKTB.LINE_BIDRULE'] || [];
          return (
            readyOnly ? tooltipRender(record.quoteRuleMeaning) : <Form.Item>
              {record?.$form?.getFieldDecorator('quoteRule', {
                initialValue: record.quoteRule,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.trade.field.ProductBidRule`).d('商品投标规则'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={productBidRuleOptions.filter((v) => basicForm?.isFullQuote === 'Y' ? v.value === 'Bundled' : v.value === 'Singleton')}
                  lazyLoad={false}
                  allowClear
                  onChange={(value) => {
                    record.quoteRule = value
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductBidAvail`).d('可投标总数'),
        dataIndex: 'lineNum',
        width: 180,
        required: true,
        render: (_, record) => {
          return (
            readyOnly ? numberRender(record.totals, 0) : <Form.Item>
              {record?.$form?.getFieldDecorator('totals', {
                initialValue: record.totals,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.trade.field.ProductBidAvail`).d('可投标总数'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={(value) => {
                    record.totals = value
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          rowSelection={readyOnly ? false : rowSelection}
          dataSource={productDetailSource}
          pagination={productDetailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
