import React from 'react';
import { Form, TextField, Lov, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'utils/intl';
import styles from './index.less';

// const prefix = 'spcm.paymentRequest';

const financeNodeName = [
  '05 财务第一复核人审批',
  '06 财务第二复核人审批',
  '11 财务第一复核人审批',
  '12 财务第二复核人审批',
];

export default function ({
  costCoaAccountDataset,
  taxCoaAccountDataset,
  parentDataset,
  isOperator,
  currentNodeName = '',
  pendingApportionFlag,
  viewOnly = false,
  batchFlag = false,
}) {
  return (
    <div className={styles['coa-combination']}>
      <Card
        title={intl.get(`spcm.paymentRequest.view.accountCombination`).d('账户组合')}
        bordered={false}
        type="inner"
      >
        <Form dataSet={costCoaAccountDataset} columns={2} labelLayout={LabelLayout.horizontal}>
          <TextField name="coaSegment1" />
          <Select
            name="coaSegment2"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment3"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment4"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment5"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment6"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment7"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment8"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
        </Form>
      </Card>
      {pendingApportionFlag &&
        !batchFlag && (
          <Card
            title={intl.get(`spcm.paymentRequest.view.deferredSubject`).d('待摊科目')}
            bordered={false}
            type="inner"
          >
            <Form columns={2} labelLayout={LabelLayout.horizontal} dataSet={parentDataset}>
              <Lov
                name="actualExpenseSegment"
                tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                label={intl.get(`spcm.paymentRequest.model.actualExpenseSegment`).d('待摊科目')}
                disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
              />
            </Form>
          </Card>
        )}
      {/* <Card
        title={intl.get(`spcm.paymentRequest.view.withholdingTaxSubject`).d('预提税科目')}
        bordered={false}
        type="inner"
      >
        <Form columns={2} labelLayout={LabelLayout.horizontal} dataSet={parentDataset}>
          <Lov
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator}
            name="withholdingTaxSegment"
            tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
            label={intl.get(`spcm.paymentRequest.model.withholdingTaxSegment`).d('预提税科目')}
          />
        </Form>
      </Card> */}
      <Card
        title={intl.get(`spcm.paymentRequest.view.taxAccount`).d('税账户')}
        bordered={false}
        type="inner"
        style={{ display: batchFlag ? 'none' : 'block' }}
      >
        <Form dataSet={taxCoaAccountDataset} columns={2} labelLayout={LabelLayout.horizontal}>
          <TextField name="coaSegment1" />
          <Select
            name="coaSegment2"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment3"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment4"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment5"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment6"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment7"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
          <Select
            name="coaSegment8"
            searchable
            disabled={!financeNodeName.includes(currentNodeName) || !isOperator || viewOnly}
          />
        </Form>
      </Card>
    </div>
  );
}
