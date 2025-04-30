import { Button, Form, DataSet, Lov, TextField } from 'choerodon-ui/pro';
import { Card, notification } from 'choerodon-ui';
import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'utils/intl';
import { getCurrentTenant } from 'utils/utils';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import TableForm from './components/TableForm';
import getFormDSProps from './dataSet/formDS';
import getTableDSProps from './dataSet/tableDS';
import styles from './index.less';

const { PFM_HOST } = process.env;

const SSRC = '/ssrc';
@formatterCollections({ code: ['spcm.erp'] })
export default class PriceMarkup extends PureComponent {
  constructor(props) {
    const { match = {} } = props;
    const { params } = match;
    super(props);
    this.state = {
      /* eslint-disable */
      formDS: new DataSet(getFormDSProps()),
      tableDS: new DataSet(getTableDSProps(params, this.contractLoadSucess)),
      /* eslint-enable */
    };
  }

  componentWillReceiveProps(nextProps) {
    const { match = {} } = nextProps;
    const { params } = match;
    this.state = {
      /* eslint-disable */
      formDS: new DataSet(getFormDSProps()),
      tableDS: new DataSet(getTableDSProps(params, this.contractLoadSucess)),
      /* eslint-enable */
    };
  }

  /**
   * 查询table回调函数
   * @param {}} res
   */
  contractLoadSucess = (res) => {
    console.log(res);
    // if (!res.viewFlag && Object.keys(res).length !== 0) {
    //   this.props.history.push({
    //     pathname: `/pub/spcm/not/access`,
    //   });
    // }
  };

  // const formDS = useMemo(() => new DataSet(getFormDSProps()), []);
  // const tableDS = useMemo(() => new DataSet(getTableDSProps(params,contractLoadSucess)), []);
  templateImport = () => {
    this.props.history.push({
      pathname: `/pub${SSRC}/price/import`,
    })
  };

  jumpPriceLibraryQuery = () => {
    this.props.history.push({
      pathname: `/pub${SSRC}/price-library`,
    })
  };

  manualMarkup = () => {
    this.state.formDS.validate().then((e) => {
      if (e) {
        const tenantInfo = getCurrentTenant();
        const tableData = this.state.tableDS.data[0];
        const formData = this.state.formDS.data[0];
        // console.log(tenantInfo);
        // console.log(tableData.data);
        // console.log(formData.data);
        const param = {
          categoryId: formData.data.categoryId,
          priceEntryCt: {
            sourceId: tableData.data.contractId,
            poContractNum: tableData.data.contractNo,
            poContractName: tableData.data.contractName,
            contractAmountEt: tableData.data.contractAmount, // 合同总额
            contractStartDate: tableData.data.actualStartdate, // 合同实际开始时间
            contractEndDate: tableData.data.actualEnddate, // 合同实际结束时间
            supplierNum: tableData.data.vendorNo,
            supplierName: tableData.data.vendorName,
            priceCompanyCode: tableData.data.contractSignOrgName,
            contractAmountAt: tableData.data.contractHkAmount, // 合同港币
            currencyCode: tableData.data.currencyCode, // 合同币种
            deductFlag: tableData.data.deductFlag, // 是否可退税
            exchangeRate: tableData.data.exchangeRate, // 汇率
            taxAmount: tableData.data.totalContractTax, // 合同税费
            taxFlag: tableData.data.salesTaxVatIncludedFlag, // 是否含税
            tenantId: tenantInfo.tenantId,
            purchaseDecisionFlag: tableData.data.purchaseDecisionFlag,
            purchaseDecisionId: tableData.data.purchaseDecisionId,
            poDecisionNum: tableData.data.decisionNo,
            wfApprovedDate: tableData.data.wfApprovedDate,
          },
          tenantId: tenantInfo.tenantId,
        };
        request(`${SSRC}/v1/${tenantInfo.tenantId}/price-entrys/priceEntryAdd`, {
          method: 'POST',
          body: param,
        })
          .then((resonseData) => {
            // console.log(resonseData.priceEntry.priceGroupId);
            // console.log(resonseData);
            if (resonseData.failed) {
              notification.error({
                description: resonseData.message,
              });
            } else {
              this.props.history.push({
                pathname: `/pub${SSRC}/price-entry/detail/${resonseData.priceEntry.priceGroupId}`
              })
            }
          })
          .catch(() => {
            // console.log('err');
            // console.log(err);
            notification.error({
              description: 'error',
            });
          });
      }
    });
  };

  render() {
    return (
      <>
        <PageHeaderWrapper
          title={intl.get('spcm.erp.view.price.markup.contract.title').d('采购合同价格补录')}
        >
          <Card>
            <div style={{ float: 'right' }}>
              <Button onClick={this.templateImport}>
                {intl.get('spcm.erp.view.price.markup.template.import.button').d('模板导入')}
              </Button>
              <Button color="primary" onClick={this.manualMarkup}>
                {intl.get('spcm.erp.view.price.markup.manual.input.button').d('手工录入')}
              </Button>
              <Button onClick={this.jumpPriceLibraryQuery}>
                {intl
                  .get('spcm.erp.view.price.markup.template.jump.price.library.query.button')
                  .d('跳转价格库查询')}
              </Button>
            </div>
          </Card>
          <Card
            className={styles['search-table']}
            title={intl.get('spcm.erp.view.price.markup.contract.detail.title').d('采购合同明细')}
            bordered={false}
          >
            <TableForm dataSet={this.state.tableDS} />
          </Card>

          <Card
            title={intl.get('spcm.erp.view.price.markup.product.info.title').d('产品基础信息')}
            bordered={false}
          >
            <Form dataSet={this.state.formDS} columns={3} labelLayout={LabelLayout.horizontal}>
              <TextField name="purBigCategory" disabled />
              <TextField name="purMediumCategory" disabled />
              <TextField name="purSmallCategory" disabled />
              <TextField name="productCode" disabled />
              <Lov
                name="productName"
                tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                placeholder={intl
                  .get('spcm.erp.view.price.markup.product.name.option')
                  .d('请选择产品')}
                // onChange={selectData}
              />
            </Form>
          </Card>
        </PageHeaderWrapper>
      </>
    );
  }
}
