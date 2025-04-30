import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import cusRequest from '_cus_utils/request';
import PanelHeader from '_cus_components/CusCollapse';
import { getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusModal from '_cus_components/CusModal';
import CusInput from '_cus_components/CusInput';
import { fastCodeLoader } from '@/utils/decorators';
import { SRM_SPUC } from '_utils/config';

const FormItem = Form.Item;
const prompt = 'spcm.costPayment';
const coaSegmentCode = [
  'CMI_COA_COMPANY',
  'CMI_COA_ACCT',
  'CMI_COA_INTERCO',
  'CMI_COA_COST_CENTER',
  'CMI_COA_BUSINESS',
  'CMI_COA_PRODUCT',
  'CMI_COA_PRODUCT_ITEM',
  'CMI_COA_LOCATION',
];

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,

      coaData: {},
      taxData: {},
    };
    this.coaRef = React.createRef();
    this.taxRef = React.createRef();
  }

  @Bind
  queryCoaData() {
    const { billLineData = {} } = this.props;
    cusRequest(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-coa-accounts`, {
      method: 'GET',
      query: {
        coaAccountId: billLineData.coaAccountId ? billLineData.coaAccountId : -1,
        costDetailLineId: billLineData.costDetailLineId,
      },
    }).then((res) => {
      if (cusGetResponse(res)) {
        this.setState({
          coaData: res.content?.length === 1 ? res.content[0] : {},
        });
      }
    });
  }
  @Bind
  queryTaxData() {
    const { billLineData = {} } = this.props;
    cusRequest(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-coa-accounts`, {
      method: 'GET',
      query: {
        coaAccountId: billLineData.taxAccountId ? billLineData.taxAccountId : -1,
        costDetailLineId: billLineData.costDetailLineId,
      },
    }).then((res) => {
      if (cusGetResponse(res)) {
        this.setState({
          taxData: res.content?.length === 1 ? res.content[0] : {},
        });
      }
    });
  }

  @Bind()
  showCoa() {
    this.setState({
      visible: true,
    });
    this.queryCoaData();
    this.queryTaxData();
  }

  @Bind
  handleSaveCoa() {
    const { onSaveCoa = (e) => e, billLineData } = this.props;
    const { coaData, taxData } = this.state;
    let costCoaAccount;
    let taxCostCoaAccount;
    if (this.coaRef) {
      costCoaAccount = this.coaRef.getFieldsValue();
      taxCostCoaAccount = this.taxRef.getFieldsValue();
    }
    billLineData['costCoaAccount'] = { ...coaData, ...costCoaAccount };
    billLineData['taxCostCoaAccount'] = { ...taxData, ...taxCostCoaAccount };
    onSaveCoa(() => {
      this.setState({
        visible: false,
      });
    });
  }

  render() {
    const { financeFlag, billLineData = {} } = this.props;
    const { coaData = {}, taxData = {}, visible } = this.state;

    return (
      <>
        <CusButton type="plain" onClick={() => this.showCoa()}>
          COA
        </CusButton>
        {visible && (
          <CusModal
            title="COA"
            visible={visible}
            width={800}
            onCancel={() => {
              this.setState({
                visible: false,
              });
            }}
            cancelText={
              financeFlag
                ? intl.get('hzero.common.button.cancel').d('取消')
                : intl.get('hzero.common.button.close').d('关闭')
            }
            onOk={financeFlag ? this.handleSaveCoa : null}
          >
            <PanelHeader
              title={intl.get(`${prompt}.view.coa.header`).d('账户组合')}
              showArrow={false}
            />
            <CoaInfo
              data={coaData}
              financeFlag={financeFlag}
              onRef={(node) => {
                this.coaRef = node.props.form;
              }}
            />
            {billLineData.$form.getFieldValue('pendingApportionFlag') === '1' && (
              <>
                <PanelHeader
                  title={intl.get(`${prompt}.view.coa.actualExpenseSegment`).d('待摊科目')}
                  showArrow={false}
                />
                <Form className="customize-form">
                  <Col span={12}>
                    <FormItem
                      label={intl
                        .get(`${prompt}.view.detail.line.actualExpenseSegment`)
                        .d('Actual Expense A/C')}
                    >
                      {billLineData.$form.getFieldDecorator('actualExpenseSegment', {
                        initialValue: billLineData['actualExpenseSegment'],
                      })(<CusInput disabled={!financeFlag} />)}
                    </FormItem>
                  </Col>
                </Form>
              </>
            )}

            <PanelHeader
              title={intl.get(`${prompt}.view.coa.tax.header`).d('税账户')}
              showArrow={false}
            />
            <CoaInfo
              data={taxData}
              financeFlag={financeFlag}
              onRef={(node) => {
                this.taxRef = node.props.form;
              }}
            />
          </CusModal>
        )}
      </>
    );
  }
}

export function renderItem({ form, data = {}, code, index, idpValueMap = {}, financeFlag }) {
  const { getFieldDecorator } = form || {};
  const isDis = index === 0 ? true : !financeFlag;
  const filed = `coaSegment${index + 1}`;
  const generateData = (data) => {
    const compareFn = (a, b) => {
      return a.value <= b.value ? -1 : 1;
    };

    if (Array.isArray(data)) {
      return data.map((item) => {
        return {
          ...item,
          meaning: `${item.value} ${item.description || ''}`,
        };
      });
    }
    try {
      const res = JSON.parse(data);
      if (Array.isArray(res)) {
        res.sort(compareFn);
      }
      return res.map((item) => {
        return {
          ...item,
          meaning: `${item.value} ${item.description || ''}`,
        };
      });
    } catch (e) {
      console.log('JSON Parsed Error', e);
    }
  };

  return (
    <Col span={12}>
      <FormItem label={intl.get(`${prompt}.view.coa.${filed}`).d(`${filed}`)}>
        {getFieldDecorator(filed, {
          initialValue: data[filed],
        })(
          <CusSelect
            showSearch
            allowClear
            options={generateData(idpValueMap[code])}
            disabled={isDis}
            filterOption={(inputValue, option) => {
              return option.meaning.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
            }}
          />
        )}
      </FormItem>
    </Col>
  );
}

@fastCodeLoader([...coaSegmentCode])
@Form.create({ fieldNameProp: null })
export class CoaInfo extends Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }
  render() {
    const { form, data, idpValueMap = {}, financeFlag } = this.props;
    return (
      <Form className="customize-form">
        <Row>
          {coaSegmentCode.map((code, index) =>
            renderItem({
              form,
              data,
              code,
              index,
              idpValueMap,
              financeFlag,
            })
          )}
        </Row>
      </Form>
    );
  }
}
