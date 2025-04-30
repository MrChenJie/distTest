import React from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { Popover } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import request from 'utils/request';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import styles from './index.less';

const InvoiceTable = ({
  dataSet,
  onImportData = (e) => e,
  editable,
  isOperator,
  status,
  currentNodeName = '',
  viewOnly = false,
  lineLoading = false,
  hasSubmitButton = true,
  importLoading = false,
}) => {
  const importData = () => {
    onImportData();
  };

  const columns = [
    {
      name: 'invoiceNum',
      width: 285,
      editor:
        hasSubmitButton &&
        (editable || currentNodeName.includes('财务')) &&
        isOperator &&
        !viewOnly,
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'invoiceDate',
      width: 130,
      editor:
        hasSubmitButton &&
        (editable || currentNodeName.includes('财务')) &&
        isOperator &&
        !viewOnly,
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'payDate',
      width: 130,
      editor: editable && isOperator && !viewOnly,
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'currencyCodeMeaning',
      width: 80,
      renderer: ({ record }) => {
        const { current } = record.dataSet.parent;
        return current.get('currencyCode');
      },
    },
    {
      name: 'invoiceAmount',
      width: 170,
      renderer: ({ value }) => {
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return numberRender(value, precision);
      },
    },
    {
      name: 'excludingTaxAmount',
      width: 180,
      renderer: ({ value }) => {
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return numberRender(value, precision);
      },
    },
    {
      name: 'invoiceTaxAmount',
      width: 150,
      renderer: ({ value }) => {
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return numberRender(value, precision);
      },
    },
    // {
    //   name: 'invoiceHkAmount',
    //   width: 150,
    //   renderer: ({ value }) => {
    //     return numberRender(value, 2);
    //   },
    // },
    {
      name: 'bankFreesAmount',
      width: 150,
      editor: editable && isOperator && !viewOnly,
      align: 'right',
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'description',
      width: 150,
      editor: editable && isOperator && !viewOnly,
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'instalmentFlag',
      width: 150,
      editor: editable && isOperator && !viewOnly,
    },
    {
      name: 'paymentCount',
      width: 120,
      renderer: ({ record, value }) => {
        if (record.get('instalmentFlag')) {
          return value;
        } else {
          return '-';
        }
      },
      align: 'center',
    },
    {
      name: 'billTotalAmount',
      width: 170,
      editor: (record) => {
        return record.get('instalmentFlag') && isOperator && editable && !viewOnly;
      },
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'ebsInvoiceNum',
      width: 130,
      className: 'center-align',
      // renderer: ({ record }) =>
      //   record.get('invoiceNum') &&
      //   (record.get('instalmentFlag')
      //     ? `${record.get('invoiceNum')}-${record.get('paymentCount')}`
      //     : record.get('invoiceNum')),
    },
    {
      name: 'vendorSiteCode',
      width: 130,
      // renderer:
      //   currentNodeName.includes('财务') || !['DRAFT', 'REVOKE'].includes(status)
      //     ? undefined
      //     : ({ record }) => {
      //         if (editable) {
      //           const data = record.toData();
      //           const { resaleDetailLineList = [] } = data;
      //           if (resaleDetailLineList && resaleDetailLineList.length > 0) {
      //             const businessCodes = resaleDetailLineList
      //               .map((item) => item.coaBusiness || (item.costCoaAccount[0] || {}).coaSegment5)
      //               .filter((item) => !!item);
      //             const businessCodeSet = new Set(businessCodes);
      //             const businessCodeCount = [];
      //             businessCodeSet.forEach((item) => {
      //               businessCodeCount.push({
      //                 code: item,
      //                 count: businessCodes.filter((code) => code === item).length,
      //               });
      //             });
      //             businessCodeCount.sort((a, b) => {
      //               if (a.count < b.count) {
      //                 return 1;
      //               } else if (a.count > b.count) {
      //                 return -1;
      //               } else if (a.code < b.code) {
      //                 return 1;
      //               } else if (a.code > b.code) {
      //                 return -1;
      //               } else {
      //                 return 0;
      //               }
      //             });
      //             return businessCodeCount[0] && `A-${businessCodeCount[0].code}`;
      //           }
      //         }
      //       },
      editor: hasSubmitButton && currentNodeName.includes('财务') && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName: currentNodeName.includes('财务') && styles['header-table-color-red'],
    },
    {
      name: 'glDate',
      width: 130,
      editor: hasSubmitButton && currentNodeName.includes('财务') && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName: currentNodeName.includes('财务') && styles['header-table-color-red'],
    },
    {
      name: 'withholdingTaxVendorNum',
      width: 200,
      editor: hasSubmitButton && currentNodeName.includes('预提税审核') && isOperator && !viewOnly,
      renderer: ({ value }) => {
        if (typeof value === 'string') {
          return value;
        } else if (value && value.vendorNum) {
          return value.vendorNum;
        }
      },
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName: currentNodeName.includes('预提税审核') && styles['header-table-color-red'],
    },
    {
      name: 'withholdingTaxVendorName',
      width: 200,
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      // editor: currentNodeName.includes('预提税审核'),
      headerClassName: currentNodeName.includes('预提税审核') && styles['header-table-color-red'],
    },
    {
      name: 'withholdingTaxAmount',
      width: 150,
      renderer: ({ value }) => {
        return numberRender(value, 2);
      },
      editor: hasSubmitButton && currentNodeName.includes('预提税审核') && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName: currentNodeName.includes('预提税审核') && styles['header-table-color-red'],
    },
    {
      name: 'withholdingTaxRemarks',
      width: 150,
      editor: hasSubmitButton && currentNodeName.includes('预提税审核') && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName: currentNodeName.includes('预提税审核') && styles['header-table-color-red'],
    },
    {
      name: 'exchangeRate',
      width: 190,
      editor:
        hasSubmitButton &&
        ([undefined, 'DRAFT', 'REVOKE'].includes(status) || currentNodeName.includes('财务')) &&
        isOperator &&
        !viewOnly,
      align: 'right',
      headerClassName: currentNodeName.includes('财务') && styles['header-table-color-red'],
    },
    {
      name: 'sscSuggestion',
      width: 150,
      editor: hasSubmitButton && currentNodeName.includes('财务') && isOperator && !viewOnly,
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING'].includes(status),
      headerClassName: currentNodeName.includes('财务') && styles['header-table-color-red'],
    },
  ];

  const importButton = (
    <Button
      funcType="raised"
      color="default"
      onClick={importData}
      key="import"
      disabled={!status}
      loading={importLoading}
    >
      {intl.get('hzero.common.button.import').d('导入')}
    </Button>
  );

  // 发票行新增 预提税机构名称有且仅有一个 则带出赋值
  const getWithholdingTaxVendor = () => {
    const org = dataSet.parent.getField('companyOrgCode').getLookupData();
    // 查询发票头预提税机构名称 如果公司主体下的预提税机构有且仅有一个 则自动带出机构名称
    request(`${SRM_SPUC}/v1/lovs/sql/data`, {
      method: 'GET',
      query: {
        lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
        page: 0,
        size: 10,
        orgCode: org.tag,
      },
    }).then((res) => {
      if (res) {
        const { content } = res;
        if (content.length === 1) {
          dataSet.records.forEach((line) => {
            line.set('withholdingTaxVendorNum', {
              vendorNum: content[0].bankAccountNum,
              vendorName: content[0].bankAccountName,
            });
          });
        } else {
          dataSet.records.forEach((line) => {
            line.set('withholdingTaxVendorName', null);
            line.set('withholdingTaxVendorNum', null);
          });
        }
      }
    });
  };

  const createInvoice = () => {
    dataSet.create();
    getWithholdingTaxVendor();
  };

  const addButton = (
    <Button funcType="raised" color="primary" onClick={createInvoice} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>
  );

  const buttons =
    editable && isOperator && !viewOnly
      ? [
          importButton,
          ['delete', { color: 'default', funcType: 'raised', icon: null }],
          // ['add', { color: 'primary', funcType: 'raised', icon: null }],
          addButton,
        ]
      : [];

  return (
    <div className={styles['invoice-table']}>
      <Table dataSet={dataSet} columns={columns} buttons={buttons} autoHeight />
      {/* 查询行时遮挡发票头，防止误切换 */}
      <div className="mask" style={{ display: lineLoading ? 'block' : 'none' }} />
    </div>
  );
};

export default InvoiceTable;
