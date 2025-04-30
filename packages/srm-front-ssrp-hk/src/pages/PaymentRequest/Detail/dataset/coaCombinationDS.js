import intl from 'utils/intl';

// const prefix = 'spcm.paymentRequest';

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

export default ({ name }) => ({
  name: 'coaCombination',
  autoCreate: true,
  autoQuery: false,
  fields: [
    {
      name: 'coaSegment1',
      label: intl.get(`spcm.paymentRequest.model.coaCompany`).d('COA公司段'),
      disabled: true,
      bind: `${name}.coaSegment1`,
      textField: 'meaning',
      // lovCode: 'CMI_COA_COMPANY',
      lookupCode: 'CMI_COA_COMPANY',
    },
    {
      name: 'coaSegment2',
      label: intl.get(`spcm.paymentRequest.model.coaAccount`).d('COA财务科目段'),
      // lovCode: 'CMI_COA_ACCT',
      lookupCode: 'CMI_COA_ACCT',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment2Meaning };
      // },
      bind: `${name}.coaSegment2`,
      // textField: 'value',
      textField: 'meaning',
      // valueField: 'value',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment3',
      label: intl.get(`spcm.paymentRequest.model.coaIntercompany`).d('COA往来段'),
      // lovCode: 'CMI_COA_INTERCO',
      lookupCode: 'CMI_COA_INTERCO',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment3Meaning };
      // },
      bind: `${name}.coaSegment3`,
      textField: 'meaning',
      // valueField: 'value',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment4',
      label: intl.get(`spcm.paymentRequest.model.coaCostCenter`).d('COA成本中心段'),
      // lovCode: 'CMI_COA_COST_CENTER',
      lookupCode: 'CMI_COA_COST_CENTER',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment4Meaning };
      // },
      bind: `${name}.coaSegment4`,
      textField: 'meaning',
      // valueField: 'value',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment5',
      label: intl.get(`spcm.paymentRequest.model.coaBusiness`).d('COA业务段'),
      // lovCode: 'CMI_COA_BUSINESS',
      lookupCode: 'CMI_COA_BUSINESS',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment5Meaning };
      // },
      bind: `${name}.coaSegment5`,
      textField: 'meaning',
      // valueField: 'value',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment6',
      label: intl.get(`spcm.paymentRequest.model.coaProduct`).d('COA产品段'),
      // lovCode: 'CMI_COA_PRODUCT',
      lookupCode: 'CMI_COA_PRODUCT',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment6Meaning };
      // },
      bind: `${name}.coaSegment6`,
      textField: 'meaning',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment7',
      label: intl.get(`spcm.paymentRequest.model.coaProductItem`).d('COA产品科目段'),
      // lovCode: 'CMI_COA_PRODUCT_ITEM',
      lookupCode: 'CMI_COA_PRODUCT_ITEM',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment7Meaning };
      // },
      bind: `${name}.coaSegment7`,
      textField: 'meaning',
      // valueField: 'value',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment8',
      label: intl.get(`spcm.paymentRequest.model.coaLocation`).d('COA地点段'),
      // lovCode: 'CMI_COA_LOCATION',
      lookupCode: 'CMI_COA_LOCATION',
      type: 'string',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment8Meaning };
      // },
      bind: `${name}.coaSegment8`,
      textField: 'meaning',
      // valueField: 'value',
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment9',
      label: intl.get(`spcm.paymentRequest.model.Spare1`).d('备用段1'),
      bind: `${name}.coaSegment9`,
      type: 'string',
      // lovCode: 'CMI_COA_SPARE1',
      lookupCode: 'CMI_COA_SPARE1',
      textField: 'meaning',
      // valueField: 'value',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment9Meaning };
      // },
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment10',
      label: intl.get(`spcm.paymentRequest.model.Spare2`).d('备用段2'),
      bind: `${name}.coaSegment10`,
      type: 'string',
      // lovCode: 'CMI_COA_SPARE1',
      lookupCode: 'CMI_COA_SPARE2',
      textField: 'meaning',
      // valueField: 'value',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment10Meaning };
      // },
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment11',
      label: intl.get(`spcm.paymentRequest.model.Spare3`).d('备用段3'),
      bind: `${name}.coaSegment11`,
      type: 'string',
      // lovCode: 'CMI_COA_SPARE1',
      lookupCode: 'CMI_COA_SPARE3',
      textField: 'meaning',
      // valueField: 'value',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment11Meaning };
      // },
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
    {
      name: 'coaSegment12',
      label: intl.get(`spcm.paymentRequest.model.Spare4`).d('备用段4'),
      bind: `${name}.coaSegment12`,
      type: 'string',
      // lovCode: 'CMI_COA_SPARE1',
      lookupCode: 'CMI_COA_SPARE4',
      textField: 'meaning',
      // valueField: 'value',
      // transformRequest: (value) => {
      //   if (isObject(value)) {
      //     return value.value;
      //   } else {
      //     return value;
      //   }
      // },
      // transformResponse: (value, object) => {
      //   return { value, meaning: object.coaSegment12Meaning };
      // },
      lookupAxiosConfig: defaultLookupAxiosConfig,
    },
  ],
  transport: {
    read: () => {},
  },
  events: {
    update: ({ dataSet, name: fieldName, value }) => {
      if (fieldName === 'coaSegment5' && name === 'costCoaAccount') {
        const { parent } = dataSet;
        if (!parent) return;
        const { current } = parent;
        if (current) {
          if (!value) {
            current.set('coaBusiness', undefined);
          } else if (value.value) {
            current.set('coaBusiness', value.value);
          }
        }
      }
    },
  },
});
