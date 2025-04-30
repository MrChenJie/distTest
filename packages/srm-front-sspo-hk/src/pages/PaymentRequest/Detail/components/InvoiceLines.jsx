import React from 'react';
import { Table, Lov, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Popover, Tag } from 'hzero-ui';
import { sum, isNil } from 'lodash';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { numberRender, dateRender } from 'utils/renderer';
import request from 'utils/request';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';
import RequireAttachment from './RequireAttachment';
import CoaCombination from './CoaCombination';
import styles from './index.less';
import InvoiceSplit from './InvoiceSplit';

const financeNodeName = [
  '05 财务第一复核人审批',
  '06 财务第二复核人审批',
  '11 财务第一复核人审批',
  '12 财务第二复核人审批',
];
const organizationId = getCurrentOrganizationId();

const yesOrNoRender = (value) => {
  return value === 'Y'
    ? intl.get('hzero.common.status.yes').d('是')
    : value === 'N'
    ? intl.get('hzero.common.status.no').d('否')
    : undefined;
};

const oldData = new Map();
let okFlag = false;

export default function inVoiceLines({
  dataSet,
  status,
  editable,
  isOperator,
  lineAddAble,
  isCreate,
  currentNodeName = '',
  viewOnly = false,
  onPoDetail = (e) => e,
  onSoDetail = (e) => e,
  lineLoading = false,
  hasSubmitButton = true,
  switchModalContainerClassName = (e) => e,
}) {
  function handleRestore(ds, key) {
    if (ds.dirty) {
      const data = oldData.get(key);
      if (key === 'actualExpenseSegment') {
        if (ds.current.get('actualExpenseSegment') !== data) {
          ds.current.set('actualExpenseSegment', data);
        }
      } else {
        Object.keys(data).forEach((item) => {
          if (ds.current.get(item) !== data[item]) {
            ds.current.set(item, data[item]);
          }
        });
      }
    }
  }

  function addButton() {
    const headerRecord = dataSet.parent.parent.current;
    const companyOrgCode = headerRecord.get('companyOrgCode');
    const vendorCompanyNum = headerRecord.get('vendorCompanyNum');
    const currency = headerRecord.get('currency');
    if (!companyOrgCode || !vendorCompanyNum || !currency) {
      return (
        <Button
          disabled={!lineAddAble}
          type="button"
          color="primary"
          onClick={() => {
            notification.warning({
              message: intl.get('spcm.paymentRequest.warning.fillInfoTip', {
                company: !companyOrgCode
                  ? !vendorCompanyNum || !currency
                    ? `${intl
                        .get('spcm.paymentRequest.view.detail.companyOrgName')
                        .d('公司主体')}、`
                    : intl.get('spcm.paymentRequest.view.detail.companyOrgName').d('公司主体')
                  : '',
                currency: !currency
                  ? !vendorCompanyNum
                    ? `${intl.get('spcm.paymentRequest.view.detail.currencyCode').d('发票币种')}、`
                    : intl.get('spcm.paymentRequest.view.detail.currencyCode').d('发票币种')
                  : '',
                supplierInfo: !vendorCompanyNum
                  ? intl.get('spcm.paymentRequest.view.supplierInformation').d('供应商信息')
                  : '',
              }),
            });
          }}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      );
    } else {
      return (
        <span
          onClick={() => {
            switchModalContainerClassName();
          }}
        >
          <Lov {...lovProps}>{intl.get('hzero.common.button.add').d('新增')}</Lov>
        </span>
      );
    }
  }

  function showInvioceSplit(record) {
    const { data = {} } = record;
    const { resaleDetailLine = {} } = data;
    const params = {
      currencyCode: dataSet.parent.parent.current.get('currencyCode') || null,
      glDate: dataSet.parent.current.get('glDate') || null,
      resaleDetailLine: {
        ...resaleDetailLine,
        serviceStartDate: resaleDetailLine.serviceStartDate
          ? resaleDetailLine.serviceStartDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
        serviceEndDate: resaleDetailLine.serviceEndDate
          ? resaleDetailLine.serviceEndDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
        apportionStartDate: resaleDetailLine.apportionStartDate
          ? resaleDetailLine.apportionStartDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
        apportionEndDate: resaleDetailLine.apportionEndDate
          ? resaleDetailLine.apportionEndDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
      },
    };
    request(`${SRM_SPUC}/v1/${organizationId}/resale-detail-lines/getSplitInvoiceLine`, {
      method: 'POST',
      body: params,
    }).then((res) => {
      if (getResponse(res)) {
        Modal.open({
          key: Modal.key(),
          title: intl.get(`spcm.costPayment.view.detail.pendingApportion.preview`).d('待摊预览'),
          maskClosable: true,
          closable: true,
          destroyOnClose: true,
          footer: null,
          style: {
            top: 50,
          },
          children: InvoiceSplit({
            prompt: 'spcm.costPayment',
            res,
          }),
        });
      }
    });
  }
  const columns = [
    {
      name: 'circuitNumber',
      width: 120,
      lock: 'left',
    },
    {
      name: 'coaCombination',
      width: 70,
      hidden: !financeNodeName.includes(currentNodeName) && !['PAID', 'PAYING'].includes(status),
      command: ({ record }) => [
        <div style={{ textAlign: 'left' }}>
          <Button
            funcType="flat"
            color="default"
            icon="view_list-o"
            onClick={() => {
              const { costCoaAccount, taxCoaAccount } = dataSet.children;
              const costCoaAccountData = costCoaAccount.toData();
              const taxCoaAccountData = taxCoaAccount.toData();
              const actualExpenseSegment = dataSet.current.get('actualExpenseSegment');
              if (Array.isArray(costCoaAccountData) && costCoaAccountData[0]) {
                oldData.set('costCoaAccount', costCoaAccountData[0].costCoaAccount);
              }
              if (Array.isArray(taxCoaAccountData) && taxCoaAccountData[0]) {
                oldData.set('taxCoaAccount', taxCoaAccountData[0].taxCoaAccount);
              }
              oldData.set('actualExpenseSegment', actualExpenseSegment);

              Modal.open({
                key: 'coaModal',
                title: intl.get(`spcm.paymentRequest.view.coaCombination`).d('COA组合'),
                children: (
                  <CoaCombination
                    costCoaAccountDataset={dataSet.children.costCoaAccount}
                    taxCoaAccountDataset={dataSet.children.taxCoaAccount}
                    parentDataset={dataSet}
                    editable={editable && !isCreate}
                    isOperator={isOperator}
                    currentNodeName={currentNodeName}
                    pendingApportionFlag={record.get('pendingApportionFlag')}
                    viewOnly={viewOnly}
                  />
                ),
                closable: true,
                // footer: null,
                onClose: () => {
                  if (!okFlag) {
                    handleRestore(dataSet.children.costCoaAccount, 'costCoaAccount');
                    handleRestore(dataSet.children.taxCoaAccount, 'taxCoaAccount');
                    handleRestore(dataSet, 'actualExpenseSegment');
                  }
                  oldData.clear();
                  okFlag = false;
                },
                onOk: () => {
                  okFlag = true;
                },
              });
            }}
          />
        </div>,
      ],
    },
    {
      hidden: !financeNodeName.includes(currentNodeName) || !isOperator,
      header: intl.get(`spcm.costPayment.view.detail.pendingApportion.preview`).d('待摊预览'),
      width: 80,
      align: 'left',
      command: ({ record }) => [
        <div style={{ height: '100%', display: 'flex', textAlign: 'left', alignItems: 'center' }}>
          <Button
            funcType="flat"
            color="default"
            icon="search"
            onClick={() => showInvioceSplit(record)}
          />
        </div>,
      ],
    },
    {
      name: 'poNumber',
      width: 200,
      renderer: ({ record, value }) => (
        <a onClick={() => onPoDetail(record.get('poHeadersId'), record.get('poType'))}>{value}</a>
      ),
    },
    {
      name: 'poStatusMeaning',
      width: 150,
      renderer: ({ value, record }) => {
        const flag = ['CANCELED', 'CANCELING', 'TERMINATION', 'STARTCANCEL'].includes(
          record.get('poStatus')
        );
        return (
          <span style={{ color: flag && '#d50000', fontWeight: flag && 'bolder' }}>{value}</span>
        );
      },
    },
    {
      name: 'contractName',
      width: 170,
    },
    {
      name: 'salesContractNum',
      width: 170,
      renderer: ({ record, value }) => (
        <a
          key="soNumUrl"
          href={onSoDetail(record.get('salesContractId'))}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ),
    },
    {
      name: 'poLineNum',
      width: 100,
      align: 'center',
    },
    {
      name: 'lineStatusMeaning',
      width: 120,
      renderer: ({ value, record }) => {
        const flag = ['TERMINATED'].includes(record.get('lineStatus'));
        return (
          <span style={{ color: flag && '#d50000', fontWeight: flag && 'bolder' }}>{value}</span>
        );
      },
    },
    {
      name: 'serviceTypeMeaning',
      width: 120,
    },
    {
      name: 'itemAttributes',
      width: 170,
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'deductFlag',
      width: 200,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'milestoneLineNum',
      width: 140,
      align: 'center',
    },
    {
      name: 'milestoneName',
      width: 130,
    },
    {
      name: 'poLineAmount',
      width: 150,
      renderer: ({ value }) => numberRender(value, 2),
      align: 'right',
    },
    {
      name: 'oneTimeExcludingAmount',
      width: 200,
      renderer: ({ value }) => numberRender(value, 2),
      align: 'right',
    },
    {
      name: 'oneTimeApplyAmount',
      width: 200,
      renderer: ({ value }) => numberRender(value, 2),
      align: 'right',
    },
    {
      name: 'oneTimeAmount',
      width: 200,
      editor: editable && isOperator && !viewOnly,
      align: 'right',
      renderer: ({ record, value }) => {
        if (!(isNil(record.get('periodicAmount')) || record.get('periodicAmount') === 0)) {
          return (
            <Popover
              content={
                <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                  {intl
                    .get('spcm.paymentRequest.validator.message.nrc-mrc')
                    .d('若需填写此行的NRC/MRC金额，请再次新增并勾选此PO行')}
                </div>
              }
            >
              <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {typeof value === 'number' ? numberRender(value, 2) : 0.0}
              </div>
            </Popover>
          );
        } else {
          return typeof value === 'number' ? numberRender(value, 2) : '';
        }
      },
    },
    {
      name: 'otherFeeAmount',
      width: 200,
      editor: editable && isOperator && !viewOnly,
      align: 'left',
      renderer: ({ value }) => (typeof value === 'number' ? numberRender(value, 2) : ''),
      className: 'right-align',
    },
    {
      name: 'otherFeeReason',
      width: 200,
      editor: editable && isOperator && !viewOnly,
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'poLineTaxAmount',
      width: 150,
      align: 'right',
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'taxApplyAmount',
      width: 150,
      align: 'right',
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'lineTaxAmount',
      width: 100,
      editor: editable && isOperator && !viewOnly,
      align: 'right',
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'lineAmount',
      width: 200,
      renderer: ({ record }) =>
        numberRender(
          (record.get('lineTaxAmount') || 0) +
            (record.get('oneTimeAmount') || 0) +
            (record.get('periodicAmount') || 0) +
            (record.get('otherFeeAmount') || 0),
          2
        ),
      align: 'right',
    },
    {
      name: 'lineHkAmount',
      width: 200,

      renderer: ({ record }) => {
        const conversionRate = dataSet.parent.parent.current.get('conversionRate') || 1;
        return numberRender(
          ((record.get('lineTaxAmount') || 0) +
            (record.get('oneTimeAmount') || 0) +
            (record.get('periodicAmount') || 0) +
            (record.get('otherFeeAmount') || 0)) *
            conversionRate,
          2
        );
      },
      align: 'right',
    },
    {
      name: 'isFlowFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'usageNote',
      width: 100,
    },
    {
      name: 'cycleMethod',
      width: 130,
    },
    {
      name: 'terms',
      width: 100,
      className: 'right-align',
    },
    {
      name: 'orderServiceStartDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'orderServiceEndDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'lastServiceEndDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'periodicExcludingAmount',
      width: 200,
      renderer: ({ value }) => numberRender(value, 2),
      align: 'right',
    },
    {
      name: 'periodicApplyAmount',
      width: 200,
      renderer: ({ value }) => numberRender(value, 2),
      align: 'right',
    },
    {
      name: 'currentUsage',
      width: 120,
      editor: editable && isOperator && !viewOnly,
      align: 'center',
    },
    {
      name: 'periodicAmount',
      width: 200,
      editor: editable && isOperator && !viewOnly,
      align: 'right',
      renderer: ({ record, value }) => {
        if (!(isNil(record.get('oneTimeAmount')) || record.get('oneTimeAmount') === 0)) {
          return (
            <Popover
              content={
                <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                  {intl
                    .get('spcm.paymentRequest.validator.message.nrc-mrc')
                    .d('若需填写此行的NRC/MRC金额，请再次新增并勾选此PO行')}
                </div>
              }
            >
              <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {typeof value === 'number' ? numberRender(value, 2) : '0.00'}
              </div>
            </Popover>
          );
        } else {
          return typeof value === 'number' ? numberRender(value, 2) : '';
        }
      },
    },
    {
      name: 'overweightAmount',
      width: 150,
      renderer: ({ record }) => {
        if (record.get('periodicAmount') - record.get('periodicExcludingAmount') < 0) {
          return numberRender(0, 2);
        } else {
          return numberRender(
            record.get('periodicAmount') - record.get('periodicExcludingAmount'),
            2
          );
        }
      },
      className: 'right-align',
    },
    {
      name: 'overweightReason',
      width: 100,
      editor: editable && isOperator && !viewOnly,
      className: styles['header-table-color-red'],
      headerClassName: styles['header-table-color-red'],
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'serviceStartDate',
      width: 170,
      editor:
        hasSubmitButton &&
        (editable || financeNodeName.includes(currentNodeName)) &&
        isOperator &&
        !viewOnly,
    },
    {
      name: 'serviceEndDate',
      width: 170,
      editor:
        hasSubmitButton &&
        (editable || financeNodeName.includes(currentNodeName)) &&
        isOperator &&
        !viewOnly,
    },
    {
      name: 'pendingApportionFlag',
      width: 100,
      editor:
        hasSubmitButton && financeNodeName.includes(currentNodeName) && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName:
        financeNodeName.includes(currentNodeName) && styles['header-table-color-red'],
    },
    {
      name: 'apportionStartDate',
      width: 150,
      editor:
        hasSubmitButton && financeNodeName.includes(currentNodeName) && isOperator && !viewOnly,
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName:
        financeNodeName.includes(currentNodeName) && styles['header-table-color-red'],
    },
    {
      name: 'apportionEndDate',
      width: 150,
      editor:
        hasSubmitButton && financeNodeName.includes(currentNodeName) && isOperator && !viewOnly,
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName:
        financeNodeName.includes(currentNodeName) && styles['header-table-color-red'],
    },
    {
      name: 'pendingApportionAmount',
      width: 130,
      editor:
        hasSubmitButton && financeNodeName.includes(currentNodeName) && isOperator && !viewOnly,
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName:
        financeNodeName.includes(currentNodeName) && styles['header-table-color-red'],
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'currencyCode',
      width: 80,
    },
    {
      name: 'supplierCode',
      width: 120,
    },
    {
      name: 'supplierName',
      width: 120,
    },
    {
      name: 'cmiEntityMeaning',
      width: 180,
    },
    {
      name: 'contractEntity',
      width: 130,
    },
    {
      name: 'supplierCircuitNumber',
      width: 140,
    },
    {
      name: 'requiredAttachment',
      width: 190,
      renderer: ({ record }) => {
        const data = record.toData();
        const { resaleLineFiles = [] } = data;
        const count = sum(resaleLineFiles.map((item) => item.fileQuantity));
        return (
          <>
            <a
              onClick={() => {
                Modal.open({
                  key: 'attachmentModal',
                  title: intl.get(`spcm.paymentRequest.view.attachment.maintenance`).d('附件维护'),
                  children: (
                    <RequireAttachment
                      dataSet={dataSet.children.resaleLineFiles}
                      editable={editable}
                      isOperator={isOperator}
                      viewOnly={viewOnly}
                    />
                  ),
                  closable: true,
                  footer: null,
                });
              }}
            >
              {intl.get(`spcm.paymentRequest.view.attachment.maintenance`).d('附件维护')}
            </a>
            <Tag color="#108ee9" style={{ marginLeft: '5px' }}>
              {count}
            </Tag>
          </>
        );
      },
    },
  ];
  const addDS = new DataSet({
    autoCreate: true,
    selection: 'multiple',
    fields: [
      {
        name: 'orders',
        lovCode: 'SPCM.RESALE_PAYMENT_PO',
        type: 'object',
        multiple: true,
        dynamicProps: {
          lovPara: () => ({
            vendorNum: dataSet.parent.parent.current.get('vendorCompanyNum'),
            currencyCode: dataSet.parent.parent.current.get('currencyCode'),
            cmiEntity: dataSet.parent.parent.current.get('companyOrgCode'),
          }),
        },
      },
    ],
    events: {
      create: () => {},
      update: ({ record }) => {
        const data = record.get('orders');
        data.forEach((item) => {
          const r = dataSet.create(
            {
              ...item,
              lineStatus: item.poLineStatus,
              lineStatusMeaning: item.poLineStatusMeaning,
              periodicExcludingAmount: item.mrcAmount,
              oneTimeExcludingAmount: item.nrcAmount,
              milestoneLineNum: item.lineNum,
              orderServiceStartDate: item.serviceStartDate,
              orderServiceEndDate: item.serviceEndDate,
              contractName: item.poContractName,
              poLineTaxAmount: item.taxAmount,
              taxApplyAmount: item.alTaxAmount,
              oneTimeApplyAmount: item.alNrcAmount,
              serviceStartDate: undefined,
              serviceEndDate: undefined,
              deductFlag: item.isValFlag,
              contractNo: item.purchaseContractNumber,
              periodicApplyAmount: item.alMrcAmount,
              resaleLineId: uuidv4(),
            },
            0
          );
          const { dataSetSnapshot } = r;
          const { costCoaAccount, taxCoaAccount } = dataSetSnapshot;
          costCoaAccount.current.set('coaSegment1', item.cmiEntity);
          taxCoaAccount.current.set('coaSegment1', item.cmiEntity);
          costCoaAccount.current.set('coaSegment4', item.coaCostCenter);
          costCoaAccount.current.set('coaSegment5', item.coaBusiness);
          costCoaAccount.current.set('coaSegment6', item.coaProduct);
          costCoaAccount.current.set('coaSegment7', item.coaProductItem);
          costCoaAccount.current.set('coaSegment8', item.coaLocation);
          costCoaAccount.current.set('coaSegment9', item.coaSpare1);
          costCoaAccount.current.set('coaSegment10', item.coaSpare2);
          costCoaAccount.current.set('coaSegment11', item.coaSpare3);
          costCoaAccount.current.set('coaSegment12', item.coaSpare4);

          taxCoaAccount.current.set('coaSegment2', '1133050101');
          taxCoaAccount.current.set('coaSegment3', '0000');
          taxCoaAccount.current.set('coaSegment4', '0000');
          taxCoaAccount.current.set('coaSegment5', '0000');
          taxCoaAccount.current.set('coaSegment6', '0000');
          taxCoaAccount.current.set('coaSegment7', '000');
          taxCoaAccount.current.set('coaSegment8', '0000');
          taxCoaAccount.current.set('coaSegment9', '000');
          taxCoaAccount.current.set('coaSegment10', '000');
          taxCoaAccount.current.set('coaSegment11', '000');
          taxCoaAccount.current.set('coaSegment12', '000');
        });
        record.set('orders', []);
      },
    },
  });
  const lovProps = {
    modalProps: {
      destroyOnClose: true,
    },
    tableProps: {
      className: styles['lov-table'],
    },
    dataSet: addDS,
    name: 'orders',
    mode: 'button',
    key: 'add',
    color: 'primary',
    funcType: 'raised',
    icon: null,
    clearButton: false,
    disabled: !lineAddAble,
    noCache: true,
  };

  const buttons =
    editable && isOperator && !viewOnly
      ? [['delete', { color: 'default', funcType: 'raised', icon: null }], addButton()]
      : [];
  return (
    <div className={styles['invoice-lines']}>
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        autoHeight
        spin={{ spinning: lineLoading }}
      />
    </div>
  );
}
