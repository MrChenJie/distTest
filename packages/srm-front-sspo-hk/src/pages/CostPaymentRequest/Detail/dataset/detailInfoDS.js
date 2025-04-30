import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const now = new Date();

const detailInfo = (prompt) => ({
  name: 'detailInfo',
  autoCreate: true,
  autoQuery: false,
  autoLocateAfterCreate: false,
  primaryKey: 'costRequestId',
  data: [
    {
      pressLevel: 'GENERAL',
      requestStatus: 'DRAFT',
      requestDate: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      vendorPayFlag: '0',
      importEbsFlag: '0',
      totalAmount: 0.0,
      totalAmountHK: 0.0,
      productType: 'OTHERS',
    },
  ],
  fields: [
    {
      name: 'costRequestId',
      type: FieldType.number,
    },
    {
      name: 'createdBy',
      type: FieldType.number,
    },
    {
      name: 'requestNum',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.requestNum`).d('申请编号'),
      disabled: true,
    },
    {
      name: 'draftEmployeeId',
      type: FieldType.number,
    },
    {
      name: 'draftEmployeeName',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.draftEmployeeName`).d('起草人'),
      disabled: true,
    },
    {
      name: 'requestStatus',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.requestStatus`).d('申请状态'),
      lookupCode: 'SPCM.COST_REQUEST_STATUS',
      disabled: true,
    },
    {
      name: 'requestDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.requestDate`).d('申请日期'),
      disabled: true,
    },
    {
      name: 'requestEmployeeId',
      type: FieldType.number,
    },
    {
      name: 'requestEmployeeName',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.requestEmployeeName`).d('申请人'),
      disabled: true,
    },
    {
      name: 'requestEmployeeNum',
      type: FieldType.string,
    },
    {
      name: 'requestDepartment',
      type: FieldType.string,
      disabled: true,
    },
    {
      name: 'pressLevel',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.pressLevel`).d('紧急程度'),
      lookupCode: 'SPCM.COST_PRESS_LEVEL',
      required: true,
    },
    {
      name: 'companyOrgCode',
      type: FieldType.string,
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
    },
    {
      name: 'ouOrgCode',
      type: FieldType.string,
    },
    {
      name: 'companyOrgName',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.companyOrgName`).d('公司主体'),
      required: true,
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
    },
    {
      name: 'vendorCompanyId',
      type: FieldType.number,
    },
    {
      name: 'vendorCompanyNum',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.vendorCompanyNum`).d('供应商编码'),
      disabled: true,
    },
    {
      name: 'vendorCompanyName',
      type: FieldType.object,
      label: intl.get(`${prompt}.view.detail.vendorCompanyName`).d('供应商名称'),
      lovCode: 'SSLM.COST_SUPPLIER_INFO',
      required: true,
    },
    {
      name: 'currencyCode',
      type: FieldType.object,
      label: intl.get(`${prompt}.view.detail.currencyCode`).d('发票币种'),
      lovCode: 'HPFM.CURRENCY',
      required: true,
    },
    {
      name: 'totalAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.totalAmount`).d('原币总金额(含税)'),
      disabled: true,
    },
    {
      name: 'totalAmountHK',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.totalAmountHK`).d('港币总金额(含税)'),
      disabled: true,
    },
    {
      name: 'vendorPayFlag',
      type: FieldType.boolean,
      label: intl.get(`${prompt}.view.detail.vendorPayFlag`).d('是否员工代付'),
      defaultValue: '0',
      falseValue: '0',
      trueValue: '1',
    },
    {
      name: 'payCompanyId',
      type: FieldType.string,
    },
    {
      name: 'payCompanyNum',
      type: FieldType.string,
    },
    {
      name: 'processStatus',
      type: FieldType.string,
    },
    {
      name: 'payCompanyName',
      type: FieldType.object,
      label: intl.get(`${prompt}.view.detail.payCompanyName`).d('代付员工名称'),
      lovCode: 'SSLM.COST_SUPPLIER_INFO',
      dynamicProps: {
        disabled: ({ record }) => {
          const vendorPayFlag = record.get('vendorPayFlag');
          return vendorPayFlag === '0';
        },
        required: ({ record }) => {
          const vendorPayFlag = record.get('vendorPayFlag');
          return vendorPayFlag === '1';
        },
        lovPara: ({ record }) => {
          const org = record.getField('companyOrgCode').getLookupData();
          return { orgCode: org.tag };
        },
      },
    },
    {
      name: 'requestTitle',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.requestTitle`).d('申请标题'),
      required: true,
    },
    {
      name: 'requestRemarks',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.requestRemarks`).d('申请描述'),
    },
    {
      name: 'importEbsFlag',
      type: FieldType.boolean,
      label: intl.get(`${prompt}.view.detail.importEbsFlag`).d('银行自动扣款'),
      defaultValue: '0',
      falseValue: '0',
      trueValue: '1',
    },
    {
      name: 'companyBankAccountId',
      type: FieldType.number,
    },
    // {
    //   name: 'bankAccountName',
    //   type: FieldType.string,
    //   label: intl.get(`${prompt}.view.detail.bankAccountName`).d('账户名称'),
    //   required: true,
    // },
    // {
    //   name: 'bankAccountNum',
    //   type: FieldType.string,
    //   label: intl.get(`${prompt}.view.detail.bankAccountNum`).d('银行账号'),
    //   required: true,
    // },
    // {
    //   name: 'bankId',
    //   type: FieldType.number,
    // },
    // {
    //   name: 'bankName',
    //   type: FieldType.string,
    //   label: intl.get(`${prompt}.view.detail.bankName`).d('开户银行'),
    //   required: true,
    // },
    // {
    //   name: 'swiftCode',
    //   type: FieldType.string,
    //   label: intl.get(`${prompt}.view.detail.swiftCode`).d('Swift Code'),
    //   required: true,
    // },
    {
      name: 'uid',
      type: FieldType.string,
    },
    {
      name: 'originalReceived',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.originalReceived`).d('已接收原件'),
      required: true,
      lookupCode: 'SPUC.COST_ORIGINAL_RECEIVED',
    },
    {
      name: 'productType',
      label: intl.get('spcm.costPayment.view.detail.productType').d('业务类型'),
      type: FieldType.string,
      // required: true,
    },
  ],
});

export default detailInfo;
