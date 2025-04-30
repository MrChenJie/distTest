const purchaseTemplateDS = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'tecGrad',
      type: 'string',
      lookupCode: 'HKPC.PR_SCORE_IMPORT_TEMPLATE',
    },
    {
      name: 'businessResp',
      type: 'string',
      lookupCode: 'HKPC.PR_BUS_REPLY_IMPORT_TEMPLATE',
    },
    {
      name: 'tecResp',
      type: 'string',
      lookupCode: 'HKPC.PR_TECH_REPLY_IMPORT_TEMPLATE',
    }
  ],
});
export default purchaseTemplateDS;
