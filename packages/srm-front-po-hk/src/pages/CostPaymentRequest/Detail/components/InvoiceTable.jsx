/* eslint-disable */
import {
  Table,
  Button,
  Lov,
  Select,
  NumberField,
  DatePicker,
  CheckBox,
  Modal,
} from 'choerodon-ui/pro';
import React, { useState } from 'react';
import { Tag, notification } from 'choerodon-ui';
import { Popover, Modal as Modal1, Tag as Tag1, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import { numberRender } from 'utils/renderer';
import { queryIdpValue } from 'services/api';
import { sum, concat, isEmpty } from 'lodash';
import { batchDownloadFile } from '@/common/utils';
import WriteOffArea from './WriteOffArea';
import TabWriteOffDetail from './TabWriteOffDetail';
import LineAttachment from './LineAttacment';
import ChannelCommissionSelect from './ChannleCommissionData';
import styles from '../index.less';

const { CheckableTag } = Tag;
notification.config({
  placement: 'bottomRight',
  duration: 6.0,
});
const organizationId = getCurrentOrganizationId();

const InvoiceTable = ({
  // 草稿Flag
  requestStatusFlag,
  dataSet,
  lineDataSet,
  lineDetailCommand,
  coaDetailCommand,
  coaHistoryCommand,
  dateHistoryCommand,
  invoiceSplitCommand,
  contractNameField,
  headerDataSet,
  toExport,
  defaultFlag,
  currentOperatorFlag,
  withholdingTaxFlag,
  financeFlag,
  fileFlag,
  archiveFlag,
  prompt,
  payWriteOffData = {},
  batchModifyCoa,
  batchServiceDate,
  idpValueMap = {},
  isCommissionFlag,
  customerPayFlag,
}) => {
  const [writeOffVisible, setWriteOffVisible] = useState(false);
  const [writeOffData, setWriteOffData] = useState({});
  const [headerData, setHeaderData] = useState({});
  const [downLoading, setDownLoading] = useState(false);
  // 渠道商酬金选择
  const [commissionDataVisible, setCommissionDataVisible] = useState(false);

  const { standardFlag, amountFlag } = payWriteOffData;
  // 支付币种 变更
  const changePayCurrencyCode = (pay, record) => {
    if (pay) {
      record.set('payCurrencyCode', pay.currencyCode);
    } else {
      record.set('payCurrencyCode', null);
    }
  };

  // 预提税税务机构名称 选择
  const changeTaxAgencyName = (value, record) => {
    if (value) {
      record.set('withholdingTaxVendorNum', value.bankAccountNum);
      record.set('withholdingTaxVendorName', value.bankAccountName);
      record.set('withholdingTaxVendorSite', value.vendorSiteCode);
    } else {
      record.set('withholdingTaxVendorNum', null);
      record.set('withholdingTaxVendorName', null);
      record.set('withholdingTaxVendorSite', null);
    }
  };

  // 是否分期为是时 清空账单总额
  const instalmentFlagChange = (value, record) => {
    record.set('billTotalAmount', null);
  };

  // 成本项目类型 修改
  const changeCategory = (category, record) => {
    const { parent } = record.dataSet;
    const { current } = parent;

    current.set('vendorSiteCode', null);
    const data = record.dataSet.data.filter((item) => {
      return (
        item.get('costInvoiceType') !== undefined &&
        item.data.costDetailLineId !== record.data.costDetailLineId
      );
    });

    const flag = data.every((item) => {
      return item.get('costInvoiceType') === category?.invoiceType;
    });
    if (record.get('costInvoiceType')) {
      if (data.length > 1 && !flag) {
        record.getField('contractNo').set('required', record.get('associateContractFlag') === 'Y');
        record.set('vendorSiteCode', record.get('vendorSiteCode'));
        record.set('costBigCategory', record.get('costBigCategory'));
        record.set('costSmallCategory', record.get('costSmallCategory'));
        record.set('costProductCategoryCode', record.get('costProductCategoryCode'));
        record.set('costInvoiceType', record.get('costInvoiceType'));
        record.set('costProductCategoryName', record.get('costProductCategoryName'));

        Modal.warning(
          intl
            .get(`${prompt}.warning.lineData.typeNeedAgreement`)
            .d('业务运营成本付款申请单上的发票类型需一致，请检查成本项目类型是否正确！')
        );
        return;
      }
    } else {
      if (record.dataSet.data.length > 1 && !flag) {
        record.getField('contractNo').set('required', false);
        record.set('vendorSiteCode', null);
        record.set('costBigCategory', null);
        record.set('costSmallCategory', null);
        record.set('costProductCategoryCode', null);
        record.set('costInvoiceType', null);
        record.set('costProductCategoryName', null);
        record.set('coaMappingId', null);

        Modal.warning(
          intl
            .get(`${prompt}.warning.lineData.typeNeedAgreement`)
            .d('业务运营成本付款申请单上的发票类型需一致，请检查成本项目类型是否正确！')
        );
        return;
      }
    }

    if (!category) {
      // 为空 置空其他值
      record.getField('contractNo').set('required', false);
      record.set('vendorSiteCode', null);
      record.set('costBigCategory', null);
      record.set('costSmallCategory', null);
      record.set('costProductCategoryCode', null);
      record.set('costInvoiceType', null);
      record.set('coaAccountId', null);
      record.set('isCircuitIdRequired', null);
      record.set('coaMappingId', null);
      record.set('coaMapAttribute3', null);
      return;
    }
    record.getField('contractNo').set('required', category.associateContractFlag === 'Y');
    record.set('vendorSiteCode', category.siteCode);
    record.set('costBigCategory', category.costBigCategory);
    record.set('costSmallCategory', category.costSmallCategory);
    record.set('costProductCategoryCode', category.productTypeEn);
    record.set('costInvoiceType', category.invoiceType);
    record.set('coaAccountId', null);
    record.set('isCircuitIdRequired', category.isCircuitIdRequired);
    record.set('coaMappingId', category.coaMappingId);
    record.set('coaMapAttribute3', category.attribute3);
    if (category.costBigCategory === 'Prepayment(預付款)') {
      Modal.warning(
        intl
          .get(`${prompt}.warning.detail.line.costProductCategoryName`)
          .d(
            '只适用于尚未收到正式发票或增值税发票使用, 在收到正式发票或增值税发票后请用户在转售类付款申请中提交付款申请并附上此预付款申请作参考'
          )
      );
    }
  };

  // 成本主体 选择修改
  const changeOrg = (org, record) => {
    const orgObj = record.getField('lineCompanyOrgCode').getLookupData(org);
    const { meaning } = orgObj;
    if (meaning) {
      record.set('lineCompanyOrgName', orgObj.meaning);
      // record.set('lineCompanyOrgCode', orgObj.value);
    } else {
      record.set('lineCompanyOrgName', null);
      // record.set('lineCompanyOrgCode', null);
    }
    record.set('coaAccountId', null);
    record.set('invoiceTaxAmount', null);
  };

  // 修改服务开始时间结束时间时要将 是否待摊重置为0 待摊开始时间待摊结束时间重置为空 待摊金额重置为0
  const serviceDateChange = (record) => {
    record.set('pendingApportionFlag', null);
    record.set('apportionStartDate', null);
    record.set('apportionEndDate', null);
    record.set('pendingApportionAmount', null);
  };

  //  待摊时间修改时，将待摊金额置空
  const apportionDateChange = (record) => {
    record.set('pendingApportionAmount', null);
  };

  // 预提税金额 不能大于发票金额
  const withholdingTaxAmountChange = (record) => {
    const withholdingTaxAmount = record.get('withholdingTaxAmount') || 0;
    const invoiceAmount = record.get('invoiceAmount') || 0;
    if (withholdingTaxAmount > invoiceAmount) {
      notification.error({
        message: intl
          .get(`${prompt}.view.withholding-invoice`)
          .d('预提税金额不能大于发票金额(原币含税)'),
      });
      record.set('withholdingTaxAmount', null);
    }
  };

  // 合同编号 选择
  const changeContractNo = (contrac, record) => {
    if (contrac) {
      record.set('contractId', contrac.contractId);
      record.set('contractNo', contrac.contractNo);
      record.set('contractName', contrac.contractName);
      record.set('contractAmount', contrac.contractAmount);
    } else {
      record.set('contractId', null);
      record.set('contractNo', null);
      record.set('contractName', null);
      record.set('contractAmount', null);
    }
  };

  // 是否待摊为是时，待摊时间必填，待摊金额可输入，为否时，将待摊时间，待摊金额置空且不可输入
  const pendingApportionFlagChange = (value, record) => {
    if (value === '1') {
      record.getField('apportionStartDate').set('required', true);
      record.getField('apportionEndDate').set('required', true);
      record.getField('apportionStartDate').set('disabled', false);
      record.getField('apportionEndDate').set('disabled', false);
      record.getField('pendingApportionAmount').set('disabled', false);
    } else if (value === '0') {
      record.getField('apportionStartDate').set('required', false);
      record.getField('apportionEndDate').set('required', false);
      record.set('apportionStartDate', null);
      record.set('apportionEndDate', null);
      record.set('pendingApportionAmount', null);
      record.getField('apportionStartDate').set('disabled', true);
      record.getField('apportionEndDate').set('disabled', true);
      record.getField('pendingApportionAmount').set('disabled', true);
    }
  };

  // 待摊金额 不因大于 发票行金额（原币不含税）
  const pendingApportionAmountChange = (record) => {
    const excludingTaxAmount = lineDataSet.getField('excludingTaxAmount').getValue() || 0;
    const pendingApportionAmount = lineDataSet.getField('pendingApportionAmount').getValue() || 0;
    if (pendingApportionAmount > excludingTaxAmount) {
      notification.error({
        message: intl
          .get(`${prompt}.view.excluding-pending`)
          .d('待摊金额不能大于发票行金额（原币不含税）'),
      });
      record.set('pendingApportionAmount', null);
    }
  };

  // 发票头 复制
  const copyData = () => {
    const { selected } = dataSet;
    if (selected.length < 1) {
      notification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return;
    }
    const copyLines = selected.map((record) => {
      const newRecord = record.clone();
      newRecord.set('costDetailLineList', null);
      newRecord.set('excludingTaxAmount', null);
      newRecord.set('paymentCount', null);
      newRecord.set('instalmentFlag', '0');
      newRecord.set('invoiceAmount', null);
      newRecord.set('invoiceTaxAmount', null);
      newRecord.set('billTotalAmount', null);
      newRecord.set('ebsInvoiceNum', null);
      return newRecord;
    });
    dataSet.push(...copyLines);
  };

  // 发票行复制
  const copyLineData = () => {
    const { selected } = lineDataSet;
    if (selected.length < 1) {
      notification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return;
    }
    const copyLines = selected.map((record) => {
      const newRecord = record.clone();
      newRecord.set('pendingApportionAmount', null);
      return newRecord;
    });
    lineDataSet.push(...copyLines);
  };

  // 发票行明细 删除
  const delInv = (data) => {
    // 获取选中的记录集
    const { currentSelected } = data;
    if (currentSelected.length > 0) {
      // 调用dataset的delete
      data.delete(currentSelected);
    }
  };

  // 发票头新增
  const invoiceAdd = () => {
    dataSet.create({
      tempId: Date.now(),
    });
    getWithholdingTaxVendor();
  };

  // 发票明细新增
  const invoiceLineAdd = () => {
    if (dataSet.records.length === 0) {
      notification.error({
        message: intl.get(`${prompt}.view.detail.invoice-no-records`).d('请先新增发票'),
      });
      return;
    }
    lineDataSet.create();
    const companyOrg = headerDataSet.getField('companyOrgCode').getLookupData();
    // 公司主体为CMI总部时 发票明细上的发票税额不可编辑
    if (companyOrg.tag === 'CMI') {
      lineDataSet.getField('invoiceTaxAmount').set('disabled', true);
    }
  };

  // 渠道商酬金选择
  const selectChannelCommission = () => {
    const vendorCompanyNum = headerDataSet.current.get('vendorCompanyNum');
    const ouOrgCode = headerDataSet.current.get('ouOrgCode');
    const currencyCode = headerDataSet.current.get('currencyCode');
    if (dataSet.selected.length === 0) {
      notification.error({
        message: intl.get('hzero.common.validation.atLeastOneInvoice').d('请至少选择一行发票头'),
      });

      return 0;
    }
    if (vendorCompanyNum && ouOrgCode && currencyCode) {
      setCommissionDataVisible(true);
    } else {
      notification.error({
        message: intl
          .get(`${prompt}.view.detail.vendorCompanyNum-ouOrgCode-currencyCode`)
          .d('请先维护币种、供应商和公司主体'),
      });
    }
  };

  // 发票行新增 预提税机构名称有且仅有一个 则带出赋值
  const getWithholdingTaxVendor = () => {
    const org = headerDataSet.getField('companyOrgCode').getLookupData();
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
            line.set('withholdingTaxVendorName', content[0].bankAccountName);
            line.set('withholdingTaxVendorNum', content[0].bankAccountNum);
            line.set('withholdingTaxVendorSite', content[0].vendorSiteCode);
          });
        } else {
          dataSet.records.forEach((line) => {
            line.set('withholdingTaxVendorName', null);
            line.set('withholdingTaxVendorNum', null);
            line.set('withholdingTaxVendorSite', null);
          });
        }
      }
    });
  };

  const openWriteOffModal = (data = {}, headerData = {}) => {
    setWriteOffVisible(true);
    setWriteOffData(data);
    setHeaderData(headerData);
  };

  const handleSaveWriteOff = (data = []) => {
    const flag = data.some((item) => {
      return item.appliedAmount <= 0;
    });
    if (flag) {
      notification.error({
        message: intl.get(`${prompt}.error.mustGreaterZero`).d('本次核销原币金额必须大于0'),
      });
      return 0;
    }
    request(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/insertOrUpdateList`, {
      method: 'POST',
      body: data,
    }).then((res) => {
      if (getResponse(res)) {
        notification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        setWriteOffVisible(false);
      }
    });
  };

  const handleDown = async () => {
    if (dataSet.selected.length === 0) {
      notification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return;
    }
    const fileList = idpValueMap['RS_IP_ATTACHMENT_TYPE'] || [];
    let allAttachmentList = [];
    dataSet.selected.forEach((item) => {
      if (!isEmpty(item.dataSetSnapshot)) {
        const { attachmentLineList, otherAttachmentLineList } = item.dataSetSnapshot;
        if (attachmentLineList && otherAttachmentLineList) {
          allAttachmentList = concat(allAttachmentList, [
            ...attachmentLineList.records.map((item) => item.data),
            ...otherAttachmentLineList.records.map((item) => item.data),
          ]);
        }
      } else {
        const { attachmentLineList, otherAttachmentLineList } = item.data;
        if (attachmentLineList && otherAttachmentLineList) {
          allAttachmentList = concat(allAttachmentList, [
            ...attachmentLineList,
            ...otherAttachmentLineList,
          ]);
        }
      }
    });
    setDownLoading(true);
    await batchDownloadFile(
      allAttachmentList
        .filter((item) => item.uuid !== undefined)
        .map((item) => {
          return {
            attachmentUuid: item.uuid,
            fileDir: (
              (fileList.filter((fileType) => fileType.value === item.fileType) || [])[0] || {}
            ).meaning,
          };
        }),
      intl.get('spcm.costPayment.view.file.summary').d('附件汇总')
    );
    setDownLoading(false);
  };

  // 渠道商选择点击确认
  const handleChannleCommissionOk = (data = []) => {
    dataSet.selected.forEach((record = {}) => {
      data.forEach((item = {}) => {
        lineDataSet.create({
          ...item,
          costProductCategoryName: item.costProductCategory,
          lineAmount: item.unpaidPaymentAmount,
          costInvoiceId: record.get('costInvoiceId'),
          tempId: record.get('tempId'), // 使用临时id与新增未保存的发票头创建关联
          sourceLineId: item['dataId'] || -1, // 来源id，渠道商酬金数据主键id，空给-1（正常情况不会空），用于定位问题；
          sourceCode: 'SPCM_COMMISSION_DATA', // 来源编码，常量（SPCM_COMMISSION_DATA），渠道商酬金数据表名；
          remarks: 'Commission', // 付款申请行描述默认为Commission
        });
      });
    });
    toExport(false);
  };

  // 发票头 columns
  const columns = [
    lineDetailCommand,
    {
      name: 'invoiceNum',
      width: 285,
      editor: financeFlag || defaultFlag,
      align: 'left',
      tooltip: 'overflow',
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'invoiceDate',
      width: 150,
      editor: financeFlag || defaultFlag,
      align: 'left',
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'termsDate',
      width: 150,
      editor: financeFlag || defaultFlag,
      align: 'left',
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'description',
      width: 150,
      editor: financeFlag || defaultFlag,
      align: 'left',
      headerClassName: styles['header-table-cell-required'],
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'invoiceAmount',
      width: 150,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'invoiceTaxAmount',
      width: 150,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'excludingTaxAmount',
      width: 180,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      header: intl.get(`${prompt}.view.detail.invoice.writeOffInformation`).d('核销信息'),
      width: 160,
      align: 'left',
      hidden: standardFlag !== 'Y' || +customerPayFlag === 1,
      renderer: ({ record }) => {
        return (
          <a onClick={() => openWriteOffModal(record.data, headerDataSet.current.data)}>
            {intl
              .get(`${prompt}.view.detail.invoice.selectWriteOffInformation`)
              .d('选择可核销明细')}
          </a>
        );
      },
    },
    {
      name: 'writeOffAmount',
      width: 120,
      align: 'left',
      hidden: standardFlag !== 'Y' || +customerPayFlag === 1,
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'paymentAmount',
      width: 155,
      align: 'left',
      hidden: standardFlag !== 'Y',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'instalmentFlag',
      width: 150,
      align: 'left',
      editor: (record) => {
        return (
          (defaultFlag || financeFlag) && (
            <CheckBox
              name="instalmentFlag"
              onChange={(value) => instalmentFlagChange(value, record)}
            />
          )
        );
      },
    },
    {
      name: 'paymentCount',
      width: 150,
      align: 'left',
    },
    {
      name: 'billTotalAmount',
      width: 180,
      editor: (record) => {
        const instalmentFlag = record.get('instalmentFlag');
        if (instalmentFlag === '1') {
          return true;
        } else {
          return false;
        }
      },
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'ebsInvoiceNum',
      width: 180,
      align: 'left',
    },
    {
      name: 'exchangeRate',
      width: 150,
      editor: financeFlag || defaultFlag,
      align: 'left',
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
      renderer: ({ value }) => {
        return <div style={{ textAlign: 'right' }}>{value}</div>;
      },
    },
    {
      name: 'payCurrencyCode',
      width: 150,
      align: 'left',
      editor: (record) => {
        return (
          defaultFlag && (
            <Lov
              dataSet={dataSet}
              name="payCurrencyCode"
              onChange={(value) => changePayCurrencyCode(value, record)}
            />
          )
        );
      },
    },
    {
      name: 'payExchangeRate',
      width: 150,
      editor: defaultFlag,
      align: 'left',
      renderer: ({ value }) => {
        return <div style={{ textAlign: 'right' }}>{value}</div>;
      },
    },
    {
      name: 'payAmount',
      width: 150,
      // editor: defaultFlag,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'withholdingTaxVendorNum',
      width: 150,
      align: 'left',
      hidden: !withholdingTaxFlag && !archiveFlag,
      headerStyle: {
        color: withholdingTaxFlag ? 'red' : '',
      },
    },
    {
      name: 'withholdingTaxVendorName',
      width: 200,
      align: 'left',
      editor: (record) => {
        return (
          withholdingTaxFlag && (
            <Lov
              dataSet={dataSet}
              name="withholdingTaxVendorName"
              onChange={(value) => changeTaxAgencyName(value, record)}
            />
          )
        );
      },
      hidden: !withholdingTaxFlag && !archiveFlag,
      headerStyle: {
        color: withholdingTaxFlag ? 'red' : '',
      },
    },
    {
      name: 'withholdingTaxRemarks',
      width: 200,
      editor: withholdingTaxFlag,
      align: 'left',
      hidden: !withholdingTaxFlag && !archiveFlag,
      headerStyle: {
        color: withholdingTaxFlag ? 'red' : '',
      },
      maxLength: 140,
    },
    {
      name: 'withholdingTaxAmount',
      width: 150,
      align: 'left',
      hidden: !withholdingTaxFlag && !archiveFlag,
      headerStyle: {
        color: withholdingTaxFlag ? 'red' : '',
      },
      editor: (record) => {
        return (
          withholdingTaxFlag && (
            <NumberField
              style={{ textAlign: 'right' }}
              name="withholdingTaxAmount"
              step={0.01}
              onChange={() => withholdingTaxAmountChange(record)}
            />
          )
        );
      },
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'vendorSiteCode',
      width: 150,
      editor: financeFlag,
      align: 'left',
      hidden: !financeFlag && !currentOperatorFlag,
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
    },
    {
      name: 'glDate',
      width: 150,
      editor: financeFlag,
      align: 'left',
      hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
    },
    {
      name: 'sscSuggestion',
      width: 150,
      align: 'left',
      editor: financeFlag,
      hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
    },
    {
      name: 'invoiceAttachment',
      width: 190,
      lock: 'right',
      renderer: ({ record }) => {
        const data = record.toData();
        const { attachmentLineList = [] } = data;
        const count = sum(attachmentLineList.map((item) => item.fileQuantity));
        return (
          <>
            <a
              onClick={() => {
                Modal.open({
                  key: 'invoiceAttachmentModal',
                  title: intl.get(`${prompt}.view.invoice.attachment`).d('发票附件'),
                  children: (
                    <>
                      <div
                        style={{
                          color: '#d50000',
                          height: getCurrentLanguage() === 'en_US' ? 'none' : '0px',
                          minHeight: getCurrentLanguage() === 'en_US' ? '28px' : 'none',
                          wordWrap: 'break-word',
                        }}
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
                        fileFlag={fileFlag}
                        defaultFlag={defaultFlag}
                        isOther={false}
                      />
                    </>
                  ),
                  closable: true,
                  footer: null,
                });
              }}
            >
              {intl.get(`${prompt}.view.upload.attachment`).d('上传附件')}
            </a>
            <Tag1 color="#108ee9" style={{ marginLeft: '5px' }}>
              {count}
            </Tag1>
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
    //             Modal.open({
    //               key: 'otherAttachmentModal',
    //               title: intl.get(`${prompt}.view.other.attachment`).d('其他附件'),
    //               children: (
    //                 <LineAttachment
    //                   dataSet={dataSet.children.otherAttachmentLineList}
    //                   fileFlag={fileFlag}
    //                   defaultFlag={defaultFlag}
    //                   isOther
    //                 />
    //               ),
    //               closable: true,
    //               footer: null,
    //             });
    //           }}
    //         >
    //           {intl.get(`${prompt}.view.upload.attachment`).d('上传附件')}
    //         </a>
    //         <Tag1 color="#108ee9" style={{ marginLeft: '5px' }}>
    //           {count}
    //         </Tag1>
    //         <Tooltip title={<div style={{ wordBreak: 'break-word' }}>{list}</div>}>
    //           {list ? `${list}` : ''}
    //         </Tooltip>
    //       </>
    //     );
    //   },
    // },
  ];
  // 发票行 columns
  const lineColumns = [
    coaDetailCommand,
    coaHistoryCommand,
    dateHistoryCommand,
    invoiceSplitCommand,
    {
      name: 'costBigCategory',
      width: 150,
      align: 'left',
      tooltip: 'overflow',
    },
    {
      name: 'costSmallCategory',
      width: 150,
      align: 'left',
      tooltip: 'overflow',
    },
    {
      name: 'costProductCategoryName',
      width: 150,
      editor: (record) => {
        return (
          // 草稿 待修改状态（起草人节点13）可修改成本项目类型
          (defaultFlag || fileFlag) && (
            <Lov
              dataSet={lineDataSet}
              name="costProductCategoryName"
              onChange={(value) => changeCategory(value, record)}
            />
          )
        );
      },
      align: 'left',
      headerClassName: styles['header-table-cell-required'],
    },
    {
      name: 'serviceStartDate',
      headerClassName: styles['header-table-cell-required'],
      width: 170,
      align: 'left',
      editor: (record) => {
        return (
          (financeFlag || defaultFlag) && (
            <DatePicker
              name="serviceStartDate"
              placeholder="Select date"
              onChange={() => serviceDateChange(record)}
            />
          )
        );
      },
    },
    {
      name: 'serviceEndDate',
      headerClassName: styles['header-table-cell-required'],
      width: 170,
      align: 'left',
      editor: (record) => {
        return (
          (financeFlag || defaultFlag) && (
            <DatePicker
              name="serviceEndDate"
              placeholder="Select date"
              onChange={() => serviceDateChange(record)}
            />
          )
        );
      },
    },
    {
      name: 'lineAmount',
      headerClassName: styles['header-table-cell-required'],
      width: 180,
      editor: () => {
        return (
          defaultFlag && (
            <NumberField style={{ textAlign: 'right' }} name="lineAmount" step={0.01} />
          )
        );
      },
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'invoiceTaxAmount',
      width: 150,
      editor: () => {
        const companyOrg = headerDataSet.getField('companyOrgCode').getLookupData();
        if (companyOrg.tag === 'CMI') {
          return false;
        } else {
          return (
            defaultFlag && (
              <NumberField style={{ textAlign: 'right' }} name="invoiceTaxAmount" step={0.01} />
            )
          );
        }
      },
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'excludingTaxAmount',
      width: 180,
      align: 'left',
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
    },
    {
      name: 'remarks',
      width: 150,
      editor: financeFlag || defaultFlag,
      align: 'left',
      headerClassName: styles['header-table-cell-required'],
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'circuitId',
      width: 150,
      align: 'left',
      editor: defaultFlag || financeFlag,
    },
    {
      name: 'poNumber',
      width: 150,
      align: 'left',
      editor: defaultFlag || financeFlag,
    },
    {
      name: 'lineCompanyOrgCode',
      width: 200,
      editor: (record) => {
        return (
          defaultFlag && (
            <Select
              searchable
              dataSet={lineDataSet}
              name="lineCompanyOrgCode"
              dropdownMatchSelectWidth={false}
              onChange={(value) => changeOrg(value, record)}
            />
          )
        );
      },
      align: 'left',
      tooltip: 'overflow',
    },
    {
      name: 'contractNo',
      width: 150,
      editor: (record) => {
        return (
          defaultFlag && (
            <Lov
              dataSet={lineDataSet}
              name="contractNo"
              onChange={(value) => changeContractNo(value, record)}
            />
          )
        );
      },
      align: 'left',
    },
    contractNameField,
    {
      name: 'pendingApportionFlag',
      width: 150,
      align: 'left',
      hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
      editor: (record) => {
        return (
          financeFlag && (
            <CheckBox
              name="pendingApportionFlag"
              onChange={(value) => pendingApportionFlagChange(value, record)}
            />
          )
        );
      },
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
    },
    {
      name: 'apportionStartDate',
      width: 150,
      align: 'left',
      hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
      editor: (record) => {
        return (
          financeFlag && (
            <DatePicker
              name="apportionStartDate"
              placeholder="Select date"
              onChange={() => apportionDateChange(record)}
            />
          )
        );
      },
    },
    {
      name: 'apportionEndDate',
      width: 150,
      align: 'left',
      hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
      editor: (record) => {
        return (
          financeFlag && (
            <DatePicker
              name="apportionEndDate"
              placeholder="Select date"
              onChange={() => apportionDateChange(record)}
            />
          )
        );
      },
    },
    {
      name: 'pendingApportionAmount',
      width: 150,
      align: 'left',
      hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
      editor: (record) => {
        return (
          financeFlag && (
            <NumberField
              name="pendingApportionAmount"
              step={0.01}
              onChange={() => pendingApportionAmountChange(record)}
            />
          )
        );
      },
      renderer: ({ value }) => {
        const currencyCode = headerDataSet.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        return <div style={{ textAlign: 'right' }}>{numberRender(value, precision)}</div>;
      },
      headerStyle: {
        color: financeFlag ? 'red' : '',
      },
    },
    {
      name: 'referenceNumber',
      width: 150,
      align: 'left',
      renderer: ({ value }) => (
        <Popover content={<div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>{value}</div>}>
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </Popover>
      ),
    },
    {
      name: 'expectRecycleDate',
      width: 150,
      align: 'left',
      editor: () => {
        return (
          (financeFlag || defaultFlag) && (
            <DatePicker
              name="expectRecycleDate"
              placeholder="Select date"
            />
          )
        );
      },
    },
  ];

  const batchDownload = (
    <Button
      loading={downLoading}
      onClick={handleDown}
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      funcType="raised"
      color="default"
    >
      {intl.get(`${prompt}.view.file.bathDown`).d('批量下载')}
    </Button>
  );

  // 发票头 按钮
  const buttons = [
    <Button
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      funcType="raised"
      onClick={() => invoiceAdd()}
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    <Button
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      color="default"
      funcType="raised"
      onClick={() => delInv(dataSet)}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
    <Button
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      color="default"
      funcType="raised"
      onClick={() => copyData()}
    >
      {intl.get('hzero.common.button.copy').d('复制')}
    </Button>,
    requestStatusFlag === 'DRAFT' && (
      <Button
        style={{ float: 'right', margin: '0 0 8px 8px' }}
        funcType="raised"
        color="default"
        onClick={() => toExport(true)}
      >
        {intl.get('hzero.common.button.import').d('导入')}
      </Button>
    ),
    batchDownload,
    <div
      style={{
        float: 'right',
      }}
    />,
    <div style={{ clear: 'both' }} />,
  ];

  // 发票行 按钮
  const lineButtons = [
    isCommissionFlag && (
      <Button
        style={{ float: 'right', margin: '0 0 8px 8px' }}
        funcType="raised"
        onClick={() => selectChannelCommission()}
      >
        {intl.get(`${prompt}.view.button.selectChannelCommission`).d('渠道商酬金选择')}
      </Button>
    ),
    !isCommissionFlag && (
      <Button
        style={{ float: 'right', margin: '0 0 8px 8px' }}
        funcType="raised"
        onClick={() => invoiceLineAdd()}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>
    ),
    <Button
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      color="default"
      funcType="raised"
      onClick={() => delInv(lineDataSet)}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
    !isCommissionFlag && (
      <Button
        style={{ float: 'right', margin: '0 0 8px 8px' }}
        color="default"
        funcType="raised"
        onClick={() => copyLineData()}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </Button>
    ),
    <div
      style={{
        float: 'right',
      }}
    />,
    <div style={{ clear: 'both' }} />,
  ];

  const batchButton = [
    <Button
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      funcType="raised"
      onClick={() => batchModifyCoa()}
    >
      {intl.get(`${prompt}.view.button.batchModifyCoa`).d('修改COA')}
    </Button>,
    <Button
      style={{ float: 'right', margin: '0 0 8px 8px' }}
      funcType="raised"
      onClick={() => batchServiceDate()}
    >
      {intl.get(`${prompt}.view.button.batchServiceDate`).d('批量修改服务日期')}
    </Button>,
    <div
      style={{
        float: 'right',
      }}
    />,
    <div style={{ clear: 'both' }} />,
  ];

  return (
    <>
      {standardFlag === 'Y' && amountFlag === 'Y' && (
        <>
          <CheckableTag key="soHead" style={{ fontSize: '13px', margin: '4px 0' }}>
            {intl.get(`${prompt}.view.pay.tabWriteOffDetail`).d('支付及核销信息')}
          </CheckableTag>
          <TabWriteOffDetail payWriteOffData={payWriteOffData} prompt={prompt} />
        </>
      )}
      <CheckableTag key="head" style={{ fontSize: '13px', margin: '4px 0' }}>
        {intl
          .get(`${prompt}.view.pay.tabToViewDetail`)
          .d('账单列表 （点击账单进行切换查看账单明细）')}
      </CheckableTag>
      <Table
        className={styles['table-height-list']}
        dataSet={dataSet}
        columns={columns}
        buttons={
          defaultFlag
            ? buttons
            : [
                batchDownload,
                <div
                  style={{
                    float: 'right',
                  }}
                />,
                <div style={{ clear: 'both' }} />,
              ]
        }
      />
      <CheckableTag key="line" style={{ fontSize: '13px', margin: '15px 0 4px 0' }}>
        {intl.get(`${prompt}.view.pay.detail`).d('账单明细')}
      </CheckableTag>
      <Table
        className={styles['table-height']}
        dataSet={lineDataSet}
        columns={lineColumns}
        buttons={defaultFlag ? lineButtons : financeFlag ? batchButton : ''}
        autoHeight
      />

      {/* 选择可核销Modal */}
      {writeOffVisible && (
        <Modal1
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
            defaultFlag={defaultFlag}
          />
        </Modal1>
      )}

      {/* 渠道商酬金选择Modal */}
      {commissionDataVisible && (
        <Modal1
          title={intl
            .get('spcm.costPayment.view.title.channelCommissionSelect')
            .d('渠道商酬金选择')}
          visible={commissionDataVisible}
          onCancel={() => setCommissionDataVisible(false)}
          footer={null}
          width={1000}
          destroyOnClose
          bodyStyle={{ paddingTop: '10px' }}
        >
          <ChannelCommissionSelect
            selectedData={dataSet.selected}
            onOk={handleChannleCommissionOk}
            onCancel={() => setCommissionDataVisible(false)}
            headerDataSet={headerDataSet}
          />
        </Modal1>
      )}
    </>
  );
};

export default InvoiceTable;
