import { Form, TextField, Select } from 'choerodon-ui/pro';
import React from 'react';
import intl from 'utils/intl';

const prompt = 'spcm.costPayment';

const CoaInfo = (cosDataSet, lineDataSet, taxDataSet, defaultFlag, financeFlag) => {
  cosDataSet.query();
  taxDataSet.query();
  const coaSeg1 = cosDataSet.getField('coaSegment1').getLookupData();
  const coaSeg2 = cosDataSet.getField('coaSegment2').getLookupData();
  const coaSeg3 = cosDataSet.getField('coaSegment3').getLookupData();
  const coaSeg4 = cosDataSet.getField('coaSegment4').getLookupData();
  const coaSeg5 = cosDataSet.getField('coaSegment5').getLookupData();
  const coaSeg6 = cosDataSet.getField('coaSegment6').getLookupData();
  const coaSeg7 = cosDataSet.getField('coaSegment7').getLookupData();
  const coaSeg8 = cosDataSet.getField('coaSegment8').getLookupData();

  const coaline1 = taxDataSet.getField('coaSegment1').getLookupData();
  const coaline2 = taxDataSet.getField('coaSegment2').getLookupData();
  const coaline3 = taxDataSet.getField('coaSegment3').getLookupData();
  const coaline4 = taxDataSet.getField('coaSegment4').getLookupData();
  const coaline5 = taxDataSet.getField('coaSegment5').getLookupData();
  const coaline6 = taxDataSet.getField('coaSegment6').getLookupData();
  const coaline7 = taxDataSet.getField('coaSegment7').getLookupData();
  const coaline8 = taxDataSet.getField('coaSegment8').getLookupData();
  return (
    <>
      <Form
        dataSet={cosDataSet}
        labelLayout="horizontal"
        columns={2}
        disabled={!financeFlag}
        header={intl.get(`${prompt}.view.coa.header`).d('账户组合')}
      >
        <Select name="coaSegment1" searchable title={coaSeg1.description} />
        <Select name="coaSegment2" searchable title={coaSeg2.description} />
        <Select name="coaSegment3" searchable title={coaSeg3.description} />
        <Select name="coaSegment4" searchable title={coaSeg4.description} />
        <Select name="coaSegment5" searchable title={coaSeg5.description} />
        <Select name="coaSegment6" searchable title={coaSeg6.description} />
        <Select name="coaSegment7" searchable title={coaSeg7.description} />
        <Select name="coaSegment8" searchable title={coaSeg8.description} />
      </Form>
      {lineDataSet.getField('pendingApportionFlag').getValue() === '1' && (
        <Form
          dataSet={lineDataSet}
          labelLayout="horizontal"
          columns={2}
          disabled={!financeFlag}
          header={intl.get(`${prompt}.view.coa.actualExpenseSegment`).d('待摊科目')}
        >
          <TextField
            name="actualExpenseSegment"
            label={intl
              .get(`${prompt}.view.detail.line.actualExpenseSegment`)
              .d('Actual Expense A/C')}
          />
        </Form>
      )}
      {/* <Form */}
      {/*  dataSet={lineDataSet} */}
      {/*  labelLayout="horizontal" */}
      {/*  columns={2} */}
      {/*  disabled={!financeFlag} */}
      {/*  header={intl.get(`${prompt}.view.coa.withholdingTaxSegment`).d('预提税科目')} */}
      {/* > */}
      {/*  <TextField */}
      {/*    name="withholdingTaxSegment" */}
      {/*    label={intl */}
      {/*      .get(`${prompt}.view.detail.line.withholdingTaxSegment`) */}
      {/*      .d('Withholding tax A/C')} */}
      {/*  /> */}
      {/* </Form> */}
      <Form
        dataSet={taxDataSet}
        labelLayout="horizontal"
        columns={2}
        disabled={!financeFlag}
        header={intl.get(`${prompt}.view.coa.tax.header`).d('税账户')}
      >
        <Select name="coaSegment1" searchable title={coaline1.description} />
        <Select name="coaSegment2" searchable title={coaline2.description} />
        <Select name="coaSegment3" searchable title={coaline3.description} />
        <Select name="coaSegment4" searchable title={coaline4.description} />
        <Select name="coaSegment5" searchable title={coaline5.description} />
        <Select name="coaSegment6" searchable title={coaline6.description} />
        <Select name="coaSegment7" searchable title={coaline7.description} />
        <Select name="coaSegment8" searchable title={coaline8.description} />
      </Form>
    </>
  );
};

export default CoaInfo;
