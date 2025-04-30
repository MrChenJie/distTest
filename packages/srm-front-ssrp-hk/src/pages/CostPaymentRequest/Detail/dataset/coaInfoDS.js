import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const prompt = 'spcm.costPayment';
const fieldLabels = {
  coaSegment1: intl.get(`${prompt}.view.coa.coaSegment1`).d('Company'),
  coaSegment2: intl.get(`${prompt}.view.coa.coaSegment2`).d('Account'),
  coaSegment3: intl.get(`${prompt}.view.coa.coaSegment3`).d('Intercompany'),
  coaSegment4: intl.get(`${prompt}.view.coa.coaSegment4`).d('Cost center'),
  coaSegment5: intl.get(`${prompt}.view.coa.coaSegment5`).d('Business'),
  coaSegment6: intl.get(`${prompt}.view.coa.coaSegment6`).d('Product'),
  coaSegment7: intl.get(`${prompt}.view.coa.coaSegment7`).d('Product Item'),
  coaSegment8: intl.get(`${prompt}.view.coa.coaSegment8`).d('Location/region'),
  coaSegment9: intl.get(`${prompt}.view.coa.coaSegment9`).d('Spare1'),
  coaSegment10: intl.get(`${prompt}.view.coa.coaSegment10`).d('Spare2'),
  coaSegment11: intl.get(`${prompt}.view.coa.coaSegment11`).d('Spare3'),
  coaSegment12: intl.get(`${prompt}.view.coa.coaSegment12`).d('Spare4'),
};

const compareFn = (a, b) => {
  return a.value <= b.value ? -1 : 1;
};

const defaultLookupAxiosConfig = {
  transformResponse: (data) => {
    if (Array.isArray(data)) {
      return data.map(item => {
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
      return res.map(item => {
        return {
          ...item,
          meaning: `${item.value} ${item.description || ''}`,
        };
      });
    } catch (e) {
      console.log('JSON Parsed Error', e);
    }
  },
};

const coaAccountInfo = () => ({
  name: 'coaAccountInfo',
  autoCreate: false,
  autoQuery: false,
  autoQueryAfterSubmit: false,
  primaryKey: 'coaAccountId',
  data: [
    {
      coaSegment1: '1133050101',
    },
  ],
  fields: [
    {
      name: 'coaAccountId',
      type: FieldType.number,
    },
    {
      name: 'coaSegment1',
      type: FieldType.string,
      label: fieldLabels.coaSegment1,
      lookupCode: 'CMI_COA_COMPANY',
      disabled: true,
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment2',
      type: FieldType.string,
      label: fieldLabels.coaSegment2,
      lookupCode: 'CMI_COA_ACCT',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment3',
      type: FieldType.string,
      label: fieldLabels.coaSegment3,
      lookupCode: 'CMI_COA_INTERCO',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment4',
      type: FieldType.string,
      label: fieldLabels.coaSegment4,
      lookupCode: 'CMI_COA_COST_CENTER',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment5',
      type: FieldType.string,
      label: fieldLabels.coaSegment5,
      lookupCode: 'CMI_COA_BUSINESS',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment6',
      type: FieldType.string,
      label: fieldLabels.coaSegment6,
      lookupCode: 'CMI_COA_PRODUCT',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment7',
      type: FieldType.string,
      label: fieldLabels.coaSegment7,
      lookupCode: 'CMI_COA_PRODUCT_ITEM',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment8',
      type: FieldType.string,
      label: fieldLabels.coaSegment8,
      lookupCode: 'CMI_COA_LOCATION',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment9',
      type: FieldType.string,
      label: fieldLabels.coaSegment9,
      lookupCode: 'CMI_COA_SPARE1',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment10',
      type: FieldType.string,
      label: fieldLabels.coaSegment10,
      lookupCode: 'CMI_COA_SPARE2',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment11',
      type: FieldType.string,
      label: fieldLabels.coaSegment11,
      lookupCode: 'CMI_COA_SPARE3',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment12',
      type: FieldType.string,
      label: fieldLabels.coaSegment12,
      lookupCode: 'CMI_COA_SPARE4',
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
  ],
  transport: {
    read: () => {
      const url = `${SRM_SPUC}/v1/${organizationId}/cost-coa-accounts`;
      return {
        url,
        method: 'GET',
        transformResponse: (data) => {
          const responseData = JSON.parse(data);
          if(responseData.content.length > 1 ) {
            return false;
          }else {
            return {
              ...responseData,
            };
          }
        },
      };
    },
  },
  events: {
    query: ({ params }) => {
      const { coaAccountId } = params;
      if(coaAccountId) {
        return params;
      }else {
        return false;
      }
    },
  },
});

export default coaAccountInfo;
