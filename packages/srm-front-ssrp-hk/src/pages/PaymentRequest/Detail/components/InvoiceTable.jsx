import React, { useState } from 'react';
import { Table, Button, Modal as ModalPro } from 'choerodon-ui/pro';
import { Popover, Modal, Tag, Tooltip } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import request from 'utils/request';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { sum, concat, isEmpty } from 'lodash';
import { notification } from 'choerodon-ui';
import {
  getCurrentOrganizationId,
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';
import { batchDownloadFile } from '@/common/utils';
import { queryIdpValue } from 'services/api';
import WriteOffArea from './WriteOffArea';
import LineAttachment from './LineAttachment';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

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
  prompt = 'spcm.costPayment',
  idpValueMap = {},
}) => {
  const [writeOffVisible, setWriteOffVisible] = useState(false);
  const [writeOffData, setWriteOffData] = useState({});
  const [headerData, setHeaderData] = useState({});
  const [downLoading, setDownLoading] = useState(false);

  const importData = () => {
    onImportData();
  };

  const openWriteOffModal = (data = {}, headerData = {}) => {
    setWriteOffVisible(true);
    setWriteOffData(data.costDetailInvoice);
    setHeaderData(headerData);
  }

  const handleSaveWriteOff = (data = []) => {
    const flag = data.some(item => {
      return item.appliedAmount <= 0;
    });
    if (flag) {
      notification.error({
        message: intl.get(`${prompt}.error.mustGreaterZero`).d('本次核销原币金额必须大于0'),
      });
      return 0;
    };
    request(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/insertOrUpdateList`, {
      method: 'POST',
      body: data,
    }).then(res => {
      if (getResponse(res)) {
        notification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        setWriteOffVisible(false);
      };
    });
  }

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
    // {
    //   name: 'payDate',
    //   width: 130,
    //   editor: editable && isOperator && !viewOnly,
    //   headerClassName: styles['header-table-cell-required'],
    // },
    {
      name: 'termsDate',
      width: 130,
      editor:
        hasSubmitButton &&
        (editable || currentNodeName.includes('财务')) &&
        isOperator &&
        !viewOnly,
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
    {
      header: intl.get(`${prompt}.view.detail.invoice.writeOffInformation`).d('核销信息'),
      width: 160,
      align: 'left',
      renderer: ({ record }) => {
        return (<a onClick={() => openWriteOffModal(record.data, dataSet.parent.current.data.costPaymentRequest)}>
          {intl.get(`${prompt}.view.detail.invoice.selectWriteOffInformation`).d('选择可核销明细')}
        </a>);
      },
    },
    {
      name: 'writeOffAmount',
      width: 120,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'paymentAmount',
      width: 155,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
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
      name: 'supplierInvoiceAmount',
      width: 150,
      editor: false,
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
      editor: 
        (editable || (['PENDING_REVIEW'].includes(status) && hasSubmitButton)) &&
        isOperator &&
        !viewOnly,
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
        return record.get('instalmentFlag') &&
          isOperator &&
          (editable || (['PENDING_REVIEW'].includes(status) && hasSubmitButton)) &&
          !viewOnly;
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
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
      headerClassName: currentNodeName.includes('财务') && styles['header-table-color-red'],
    },
    {
      name: 'glDate',
      width: 130,
      editor: hasSubmitButton && currentNodeName.includes('财务') && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
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
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
      headerClassName: currentNodeName.includes('预提税审核') && styles['header-table-color-red'],
    },
    {
      name: 'withholdingTaxVendorName',
      width: 200,
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
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
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
      headerClassName: currentNodeName.includes('预提税审核') && styles['header-table-color-red'],
    },
    {
      name: 'withholdingTaxRemarks',
      width: 150,
      editor: hasSubmitButton && currentNodeName.includes('预提税审核') && isOperator && !viewOnly, // status === 'PENDING_REVIEW',
      hidden:
        !(currentNodeName.includes('财务') || currentNodeName.includes('预提税审核')) &&
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
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
        !['PAID', 'PAYING', 'PROCESSED'].includes(status),
      headerClassName: currentNodeName.includes('财务') && styles['header-table-color-red'],
    },
    {
      name: 'invoiceAttachment',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => {
        const data = record.toData();
        const { attachmentLineList = [] } = data;
        const count = sum(attachmentLineList.map((item) => item.fileQuantity));
        return (
          <>
            <a
              onClick={() => {
                ModalPro.open({
                  key: 'invoiceAttachmentModal',
                  title: intl.get(`spcm.paymentRequest.view.invoice.attachment`).d('发票附件'),
                  children: (
                    <>
                      <div
                        style={
                          {
                            color: '#d50000',
                            height: getCurrentLanguage() === 'en_US' ? 'none' : '0px',
                            minHeight: getCurrentLanguage() === 'en_US' ? '28px' : 'none',
                            wordWrap: 'break-word',
                          }
                        }
                      >
                        <span>
                          {intl
                            .get('spcm.costPayment.view.tip.requiredAttachment')
                            .d(
                              '注意：当上传附件选择附件类型为发票时，对应附件会开放给供应商查看，请注意发票类型的附件只能上传发票附件。'
                            )}
                        </span>
                      </div>
                      <LineAttachment
                        dataSet={dataSet.children.attachmentLineList}
                        editable={editable}
                        isOperator={isOperator}
                        viewOnly={viewOnly}
                        currentNodeName={currentNodeName}
                        hasSubmitButton={hasSubmitButton}
                        isOther={false}
                      />
                    </>
                  ),
                  closable: true,
                  footer: null,
                });
              }}
            >
              {intl.get(`spcm.paymentRequest.view.upload.attachment`).d('上传附件')}
            </a>
            <Tag color="#108ee9" style={{ marginLeft: '5px' }}>
              {count}
            </Tag>
          </>
        );
      },
    },
    // {
    //   name: 'otherAttachment',
    //   minWidth: 300,
    //   lock: 'right',
    //   renderer: ({ record }) => {
    //     const data = record.toData();
    //     const { otherAttachmentLineList = [] } = data;
    //     const count = sum(otherAttachmentLineList.map((item) => item.fileQuantity));
    //     const showAttach = otherAttachmentLineList.map(list => {
    //       for(let i = 0; i < (idpValueMap['RS_IP_ATTACHMENT_TYPE'] || []).length; i++) {
    //         const item = (idpValueMap['RS_IP_ATTACHMENT_TYPE'] || [])[i] || {};
    //         if (list.fileType === item.value) {
    //           return {
    //             description: item.description,
    //             fileQuantity: list.fileQuantity,
    //           };
    //         }
    //       }
    //     })
    //     let list = '';
    //     showAttach.forEach((item) => {
    //       list = list + `${item.description}【${item.fileQuantity}】`;
    //     });
    //     return (
    //       <>
    //         <a
    //           onClick={() => {
    //             ModalPro.open({
    //               key: 'otherAttachmentModal',
    //               title: intl.get(`spcm.paymentRequest.view.other.attachment`).d('其他附件'),
    //               children: (
    //                 <LineAttachment
    //                   dataSet={dataSet.children.otherAttachmentLineList}
    //                   editable={editable}
    //                   isOperator={isOperator}
    //                   viewOnly={viewOnly}
    //                   currentNodeName={currentNodeName}
    //                   hasSubmitButton={hasSubmitButton}
    //                   isOther
    //                 />
    //               ),
    //               closable: true,
    //               footer: null,
    //             });
    //           }}
    //         >
    //           {intl.get(`spcm.paymentRequest.view.upload.attachment`).d('上传附件')}
    //         </a>
    //         <Tag color="#108ee9" style={{ marginLeft: '5px' }}>
    //           {count}
    //         </Tag>
    //         <Tooltip title={<div style={{ wordBreak: 'break-word' }}>{list}</div>}>
    //           {list ? `${list}` : ''}
    //         </Tooltip>
    //       </>
    //     );
    //   },
    // },
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

  const handleDown = async () => {
    if (dataSet.selected.length === 0){
      notification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return;
    }
    const fileList = idpValueMap['RS_IP_ATTACHMENT_TYPE'] || [];
    let allAttachmentList = [];
    dataSet.selected.forEach(item => {
      if (!isEmpty(item.dataSetSnapshot)) {
        const { attachmentLineList, otherAttachmentLineList } = item.dataSetSnapshot;
        if (attachmentLineList && otherAttachmentLineList)
          allAttachmentList = concat(allAttachmentList, [...attachmentLineList.records.map(item => item.data), ...otherAttachmentLineList.records.map(item => item.data)]);
      } else {
        const { attachmentLineList, otherAttachmentLineList } = item.data;
        if (attachmentLineList && otherAttachmentLineList)
          allAttachmentList = concat(allAttachmentList, [...attachmentLineList, ...otherAttachmentLineList]);
      };
    });
    setDownLoading(true);
    await batchDownloadFile(
      allAttachmentList
        .filter((item) => item.uuid !== undefined)
        .map((item) => {
          return {
            attachmentUuid: item.uuid,
            fileDir: ((fileList.filter(fileType => fileType.value === item.fileType) || [])[0] || {}).meaning,
          };
        }),
      intl.get('spcm.costPayment.view.file.summary').d('附件汇总')
    );
    setDownLoading(false);
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

  const batchDownload = (
    <div style={{ marginRight: '8px', display: 'inline', verticalAlign: 'bottom' }}>
      <Button loading={downLoading} onClick={handleDown}>
        {intl.get('spcm.costPayment.view.file.bathDown').d('批量下载')}
      </Button>
    </div>
  );

  const buttons =
    editable && isOperator && !viewOnly
      ? [
          batchDownload,
          importButton,
          ['delete', { color: 'default', funcType: 'raised', icon: null }],
          // ['add', { color: 'primary', funcType: 'raised', icon: null }],
          addButton,
        ]
      : [batchDownload];

  return (
    <div className={styles['invoice-table']}>
      <Table dataSet={dataSet} columns={columns} buttons={buttons} />
      {/* 查询行时遮挡发票头，防止误切换 */}
      <div className="mask" style={{ display: lineLoading ? 'block' : 'none' }} />

      {/* 选择可核销Modal */}
      {writeOffVisible && (
        <Modal
          title={intl.get('spcm.costPayment.view.selectWriteOffResultArea').d('选择核销结果区域')}
          visible={writeOffVisible}
          onCancel={() => setWriteOffVisible(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          <WriteOffArea
            writeOffData={writeOffData}
            headerData={headerData}
            prompt={prompt}
            onCancel={() => setWriteOffVisible(false)}
            onOk={handleSaveWriteOff}
            currentNodeName={currentNodeName}
          />
        </Modal>
      )}
    </div>
  );
};

export default InvoiceTable;
