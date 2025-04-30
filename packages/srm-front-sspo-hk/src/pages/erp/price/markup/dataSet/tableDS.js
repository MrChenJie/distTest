import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
// const data = [{contractNo:"test",contractName:"test",
//               buyer:"test",contractAmount:"10",
//               drawbackFlag:"N",
//               contractStartDate:"2020-07-01",
//               contractEndDate:"2020-07-31",
//               cmiContractingBody:"test1",
//               vendorNum:"tesnum",
//               vendorName:"test2312"
//             }];
const getTableDSProps = (params, contractLoadSucess) => ({
  name: 'contractTable',
  autoQuery: true,
  feedback: {
    loadSuccess: contractLoadSucess,
  },
  // data:data,
  fields: [
    {
      name: 'contractId',
      type: FieldType.string,
    },
    {
      name: 'decisionNo',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.poDecisionNum`).d('采购结果编号'),
    },
    {
      name: 'wfApprovedDate',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.wfApprovedDate`).d('采购合同审批完成日期(采购线路)'),
    },
    {
      name: 'contractNo',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.contractNo`).d('采购合同编号'),
    },
    {
      name: 'contractName',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.contractName`).d('采购合同名称'),
    },
    {
      name: 'contractorName',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.contractorName`).d('采购人员'),
    },
    {
      name: 'currencyCode',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.currencyCode`).d('合同币种'),
    },
    {
      name: 'contractAmount',
      type: FieldType.number,
      label: intl.get(`spcm.erp.view.price.markup.model.contractAmount`).d('合同总额'),
    },
    {
      name: 'contractHkAmount',
      type: FieldType.number,
      label: intl.get(`spcm.erp.view.price.markup.model.contractHkAmount`).d('合同港币总额'),
    },
    {
      name: 'totalContractTax',
      type: FieldType.number,
      label: intl.get(`spcm.erp.view.price.markup.model.totalContractTax`).d('合同税费总额'),
    },
    {
      name: 'exchangeRate',
      type: FieldType.number,
      label: intl.get(`spcm.erp.view.price.markup.model.exchangeRate`).d('汇率'),
    },
    {
      name: 'deductFlag',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.deductFlag`).d('是否可退税'),
      lookupCode: 'SPFM.YES_NO',
    },
    {
      name: 'salesTaxVatIncludedFlag',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.salesTaxVatIncludedFlag`).d('是否含税'),
      lookupCode: 'SPFM.YES_NO',
    },
    {
      name: 'actualStartdate',
      type: FieldType.date,
      label: intl.get(`spcm.erp.view.price.markup.model.actualStartdate`).d('合同实际开始时间'),
    },
    {
      name: 'actualEnddate',
      type: FieldType.date,
      label: intl.get(`spcm.erp.view.price.markup.model.actualEnddate`).d('合同实际结束时间'),
    },
    {
      name: 'contractSignOrgName',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.contractSignOrgName`).d('CMI签约主体'),
    },
    {
      name: 'vendorNo',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.vendorNo`).d('供应商编码'),
    },
    {
      name: 'vendorName',
      type: FieldType.string,
      label: intl.get(`spcm.erp.view.price.markup.model.vendorName`).d('供应商名称'),
    },
  ],
  transport: {
    read: {
      url: `/hscm-erp/v1/contract-infos/${params.contractId}`,
      method: 'GET',
    },
  },
});

export default getTableDSProps;
