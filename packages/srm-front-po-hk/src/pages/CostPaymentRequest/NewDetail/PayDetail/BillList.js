/**
 * @Description: 账单列表
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber, Checkbox } from 'hzero-ui';
import { Row, Col } from 'antd';
import { getCurrentUser, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { concat, isNumber } from 'lodash';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import { labelTip, tooltipRender, yesOrNoRender } from '_cus_utils/render';
import { queryUnifyIdpValue } from 'services/api';
import { dateRender, numberRender } from 'utils/renderer';
import TabWriteOffDetail from '../components/TabWriteOffDetail';
import WriteOffArea from '../components/WriteOffArea';
import { batchDownloadFile } from '@/common/utils';
import Attachment from './components/Attachment';
import './index.less';

const ROW_KEY = 'costInvoiceId';
const prompt = 'spcm.costPayment';
const { loginName } = getCurrentUser();
@connect(({ receiptProgress, loading }) => ({
  receiptProgress,
  deleteBillLoading: loading.effects['receiptProgress/deleteBillList'],
  saveLoading: loading.effects['costRequest/saveAll'],
}))
class BillList extends Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      downloading: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  @Bind()
  openWriteOffModal(record = {}) {
    this.setState({
      writeOffVisible: true,
      writeOffData: record,
    });
  }

  /**
   * 可核销保存
   * @param data
   * @returns {number}
   */
  @Bind()
  handleSaveWriteOff(data = []) {
    const { dispatch } = this.props;
    const flag = data.some((item) => {
      return item.appliedAmount <= 0;
    });
    if (flag) {
      CusNotification.error({
        message: intl.get(`${prompt}.error.mustGreaterZero`).d('本次核销原币金额必须大于0'),
      });
      return 0;
    }
    dispatch({
      type: 'costRequest/saveWriteOff',
      payload: data,
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.setState({
          writeOffVisible: false,
        });
      }
    });
  }

  /**
   * 预提税税务机构名称 变更
   * @param value
   * @param record
   */
  @Bind()
  changeTaxAgencyName(value, record) {
    if (value) {
      record.$form.setFieldsValue({
        withholdingTaxVendorNum: value.bankAccountNum,
        withholdingTaxVendorName: value.bankAccountName,
        withholdingTaxVendorSite: value.vendorSiteCode,
      });
      Object.assign(record, {
        withholdingTaxVendorNum: value.bankAccountNum,
        withholdingTaxVendorName: value.bankAccountName,
        withholdingTaxVendorSite: value.vendorSiteCode,
      });
    } else {
      record.$form.setFieldsValue({
        withholdingTaxVendorNum: undefined,
        withholdingTaxVendorName: undefined,
        withholdingTaxVendorSite: undefined,
      });
      Object.assign(record, {
        withholdingTaxVendorNum: undefined,
        withholdingTaxVendorName: undefined,
        withholdingTaxVendorSite: undefined,
      });
    }
  }

  /**
   * 预提税金额 不能大于发票金额
   * @param record
   */
  @Bind()
  withholdingTaxAmountChange(record) {
    const withholdingTaxAmount = record.$form.getFieldValue('withholdingTaxAmount') || 0;
    const invoiceAmount = record['invoiceAmount'] || 0;
    if (withholdingTaxAmount > invoiceAmount) {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.withholding-invoice`)
          .d('预提税金额不能大于发票金额(原币含税)'),
      });
      record.$form.setFieldsValue({
        withholdingTaxAmount: undefined,
      });
    }
  }

  /**
   * 账单列表新建
   */
  @Bind()
  billListCreate() {
    const { onCreate = (e) => e } = this.props;
    onCreate((newBillDataSource) => this.setWithholdingTaxVendor(newBillDataSource));
  }

  /**
   *  查询当前公司主体下的预提税税务机构，
   *    若数量为1，同步更新所有账单行的预提税税务机构，
   *    若数量不为1，置空账单行的所有预提税税务机构
   * @param billDataSource
   * @returns {Promise<void>}
   */
  @Bind
  async setWithholdingTaxVendor(billDataSource = []) {
    const { form } = this.props;
    const ouOrgCode = form.getFieldValue('ouOrgCode');
    const res = await queryUnifyIdpValue('SPCM_COST_WITHOUTHING_SUPPLIER', { orgCode: ouOrgCode });
    // 查询发票头预提税机构名称 如果公司主体下的预提税机构有且仅有一个 则自动带出机构名称
    if (res && res.length === 1) {
      billDataSource.forEach((item) => {
        if (item.$form) {
          item.$form.setFieldsValue({
            withholdingTaxVendorName: res[0].bankAccountName,
            withholdingTaxVendorNum: res[0].bankAccountNum,
            withholdingTaxVendorSite: res[0].vendorSiteCode,
          });
        }
        // table字段有被过滤的情况，需要同时更新BillDataSource的数据
        Object.assign(item, {
          withholdingTaxVendorName: res[0].bankAccountName,
          withholdingTaxVendorNum: res[0].bankAccountNum,
          withholdingTaxVendorSite: res[0].vendorSiteCode,
        });
      });
    } else {
      billDataSource.forEach((item) => {
        if (item.$form) {
          item.$form.setFieldsValue({
            withholdingTaxVendorName: undefined,
            withholdingTaxVendorNum: undefined,
            withholdingTaxVendorSite: undefined,
          });
        }
        Object.assign(item, {
          withholdingTaxVendorName: undefined,
          withholdingTaxVendorNum: undefined,
          withholdingTaxVendorSite: undefined,
        });
      });
    }
  }

  /**
   * 删除
   */
  @Bind
  billListDelete() {
    const { onDelete = (e) => e } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    CusModal.CusDeleteConfirm(() => {
      onDelete(selectedRowKeys, selectedRows, () => {
        this.setState({
          selectedRows: [],
          selectedRowKeys: [],
        });
      });
    });
  }

  /**
   * 批量下载
   * @returns {Promise<void>}
   */
  @Bind
  async handleDown() {
    const { idpValueMap } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return;
    }
    const fileList = idpValueMap['RS_IP_ATTACHMENT_TYPE'] || [];
    let allAttachmentList = [];
    selectedRows.forEach((item) => {
      const { attachmentLineList, otherAttachmentLineList } = item;
      if (attachmentLineList && otherAttachmentLineList) {
        allAttachmentList = concat(allAttachmentList, [
          ...attachmentLineList,
          ...otherAttachmentLineList,
        ]);
      }
    });
    this.setState({
      downLoading: true,
    });
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
    this.setState({
      downLoading: false,
    });
  }

  /**
   * 是否非全额支付变更，
   *  为否时，置空账单总额【billTotalAmount】
   *  为是时，通过ouOrgCode、发票号码【invoiceNum】、供应商编码【vendorCompanyNum】查询当前行的账单总额【billTotalAmount】，并赋值
   * @param value
   * @param record
   */
  @Bind
  changeInstalmentFlag(value, record) {
    const { form, dispatch } = this.props;
    const invoiceNum = record.$form.getFieldValue('invoiceNum');
    if (value === '0') {
      record.$form.setFieldsValue({
        billTotalAmount: undefined,
      });
    }
    if (value === '1' && invoiceNum && isNumber(record.costInvoiceId)) {
      const vendorCompanyNum = form.getFieldValue('vendorCompanyNum');
      const ouOrgCode = form.getFieldValue('ouOrgCode');
      dispatch({
        type: 'costRequest/queryBillAmount',
        payload: {
          invoiceNum,
          vendorNum: vendorCompanyNum,
          ouOrgCode,
          costInvoiceId: record.costInvoiceId,
        },
      }).then((res) => {
        if (res) {
          const { billTotalAmount } = res;
          record.$form.setFieldsValue({
            billTotalAmount: billTotalAmount,
          });
        }
      });
    }
  }

  /**
   * 根据规格生成发票号码
   * @param record 当前发票
   */
  @Bind
  createInvoiceNum(record) {
    const { form } = this.props;
    // 发票号码生成规则为：
    // 获取当前发票头数据
    const { billLineDataSource = [] } = record;
    if (!billLineDataSource?.length) {
      CusNotification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl.get(`${prompt}.view.detail.noInvoiceLines`).d('请录入发票行'),
      });
      return;
    }
    const reg = RegExp('M2M|MVNO|GDS|JEGOTRIP');
    const invoiceLines = billLineDataSource.every((v) => {
      return reg.exec(v.costBigCategory) && reg.exec(v.costBigCategory).index === 0;
    });
    if (!invoiceLines) {
      CusNotification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl
          .get(`${prompt}.view.detail.validateCostBigCategory`)
          .d('发票号码自动生成仅适用于成本大类为M2M,GDS,MVNO,JEGO的业务'),
      });
      return;
    }
    // 获取服务开始日期list
    const serviceStartList = billLineDataSource.map((v) => {
      return v.serviceStartDate ? dayjs(v.serviceStartDate).format('YYYYMMDD') : false;
    });
    // 获取服务结束日期list
    const serviceEndList = billLineDataSource.map((v) => {
      return v.serviceEndDate ? dayjs(v.serviceEndDate).format('YYYYMMDD') : false;
    });
    // 服务开始时间-服务结束时间 Math.max(...arr)
    if (
      !serviceStartList.length ||
      !serviceEndList.length ||
      serviceStartList.includes(false) ||
      serviceEndList.includes(false)
    ) {
      CusNotification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl
          .get(`${prompt}.view.detail.service-message`)
          .d('请输入服务开始日期/服务结束日期'),
      });
      return;
    }
    // 获取成本大类list
    const costBigCategoryList = billLineDataSource.map((v) => {
      return reg.exec(v.costBigCategory)[0];
    });
    // 1. 当用户录入的发票行中成本大类为“M2M、MVNO、GDS、JEGOTRIP”中任意一个时，可用户选择触发发票编号生成；
    const onlyCategory = costBigCategoryList.map((i) => {
      return i === costBigCategoryList[0];
    });
    if (onlyCategory.includes(false)) {
      CusNotification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl
          .get(`${prompt}.view.detail.costBigCategory-message`)
          .d('仅适用于发票行成本大类为M2M/MVNO/GDS/JEGOTRIP的业务'),
      });
    } else {
      // 成本大类
      const bigCategory = reg.exec(costBigCategoryList[0])[0];
      // OU短码
      const ouOrgCode = form.getFieldValue('ouOrgCode');
      if (!ouOrgCode) {
        CusNotification.error({
          message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
          description: intl.get(`${prompt}.view.detail.OrgName-message`).d('请选择公司主体'),
        });
        return;
      }
      // 供应商编号
      const vendorCompanyNum = form.getFieldValue('vendorCompanyNum');
      if (!vendorCompanyNum) {
        CusNotification.error({
          message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
          description: intl
            .get(`${prompt}.view.detail.vendorCompany-message`)
            .d('请选择供应商名称'),
        });
        return;
      }
      const serviceStartDate = Math.min(...serviceStartList);
      const serviceEndDate = Math.max(...serviceEndList);
      // 2. 发票号码生成规则为“成本大类_OU短码_供应商编号_服务开始时间-服务结束时间“，其中成本大类即为发票行第一行中的成本大类（英文）； costBigCategory costSmallCategory
      const invoiceNum = `${bigCategory}_${ouOrgCode}_${vendorCompanyNum}_${serviceStartDate}-${serviceEndDate}`;
      // 3. 当用户修改发票行第一行中的成本大类，或删除第一行发票时，发票号码不变；
      // 4. 发票号码生成按钮提示用户“仅适用于发票行首行成本大类为M2M/MVNO/GDS/JEGOTRIP的业务”
      record.$form.setFieldsValue({
        invoiceNum: invoiceNum,
      });
    }
  }

  render() {
    const {
      form,
      idpValueMap = {},
      activeRowKey,
      billDataSource = [],
      billPagination = {},
      onClickRow = (e) => e,
      deleteBillLoading = false,
      saveLoading = false,
      financeFlag,
      currentOperatorFlag,
      archiveFlag,
      withholdingTaxFlag,
      defaultFlag,
      fileFlag,
      customerPayFlag,
      payWriteOffData = {},
      requestStatus,
      currencyCode,
      precision,
      onCopy = (e) => e,
      toExport = (e) => e,
      headerData,
    } = this.props;
    const {
      selectedRowKeys,
      selectedRows,
      downLoading,
      writeOffVisible,
      writeOffData,
    } = this.state;
    const { standardFlag, amountFlag } = payWriteOffData;

    const handleRow = (record) => {
      return {
        onClick: () => onClickRow(record[ROW_KEY]),
      };
    };

    const regExpList = idpValueMap['SPUC.PAYMENT_INVOCIE_NUM_CHAR'] || [];
    let regex = '^[';
    regExpList.map((item) => {
      regex += item.meaning;
    });
    regex += ']+$';

    const columns = [
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.invoice.invoiceNum`).d('发票号码'),
          tip: intl
            .get(`${prompt}.view.detail.line.invoiceNum.help`)
            .d(
              '发票号码可以包含的字符：数字 字母(大小写) 汉字(简体 繁体) 空格 罗马数字 / , ‘” _ - # . ( ) & 〔 〕:  % +()'
            ),
        }),
        dataIndex: 'invoiceNum',
        required: true,
        width: 200,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Form.Item style={{ flex: '1' }}>
                {record.$form.getFieldDecorator(`invoiceNum`, {
                  initialValue: record.invoiceNum,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.view.detail.invoice.invoiceNum`).d('发票号码'),
                      }),
                    },
                    {
                      pattern: regex,
                      message: intl
                        .get(`${prompt}.message.validator.invoiceNum.info`)
                        .d('包含不合法字符，请重新输入发票号！'),
                    },
                  ],
                })(<CusInput.TextArea autoChangeSize={true} />)}
              </Form.Item>
              {defaultFlag && (
                <CusButton
                  type="plain"
                  style={{ marginLeft: '16px' }}
                  onClick={() => this.createInvoiceNum(record)}
                >
                  {intl.get(`${prompt}.view.button.generate`).d('生成')}
                </CusButton>
              )}
            </div>
          ) : (
            text
          ),
      },
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.invoice.invoiceDate`).d('发票日期'),
          tip: intl.get(`${prompt}.view.detail.line.invoiceDate.help`).d('请输入发票的开具日期'),
        }),
        dataIndex: 'invoiceDate',
        width: 150,
        required: true,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`invoiceDate`, {
                  initialValue: record.invoiceDate ? dayjs(record.invoiceDate) : undefined,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.view.detail.invoice.invoiceDate`).d('发票日期'),
                      }),
                    },
                  ],
                })(
                  <CusDatePicker
                    disabledDate={(currentDate) => dayjs().isBefore(currentDate, 'day')}
                    onChange={() => {
                      record.$form.setFieldsValue({
                        termsDate: undefined,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </div>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.termsDate`).d('发票到期日'),
        dataIndex: 'termsDate',
        width: 150,
        required: true,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`termsDate`, {
                  initialValue: record.termsDate ? dayjs(record.termsDate) : undefined,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.view.detail.invoice.termsDate`).d('发票到期日'),
                      }),
                    },
                  ],
                })(
                  <CusDatePicker
                    disabledDate={(currentDate) => {
                      const startDate = record.$form.getFieldValue(`invoiceDate`);
                      if (currentDate && startDate && dayjs(startDate).isValid()) {
                        return currentDate.isBefore(startDate);
                      }
                    }}
                  />
                )}
              </Form.Item>
            </div>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.description`).d('发票描述'),
        dataIndex: 'description',
        required: true,
        width: 150,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`description`, {
                  initialValue: record.description,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.view.detail.invoice.description`).d('发票描述'),
                      }),
                    },
                  ],
                })(<CusInput.TextArea autoChangeSize={true} />)}
              </Form.Item>
            </div>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.invoiceAmount`).d('发票金额(原币含税)'),
        dataIndex: 'invoiceAmount',
        width: 170,
        render: (val) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(val || 0, precision)}</span>
            </div>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.invoiceTaxAmount`).d('发票税额(原币)'),
        dataIndex: 'invoiceTaxAmount',
        width: 150,
        render: (val) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(val || 0, precision)}</span>
            </div>
          );
        },
      },
      {
        title: intl
          .get(`${prompt}.view.detail.invoice.excludingTaxAmount`)
          .d('发票金额(原币不含税)'),
        dataIndex: 'excludingTaxAmount',
        width: 170,
        render: (val) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(val || 0, precision)}</span>
            </div>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.writeOffInformation`).d('核销信息'),
        dataIndex: 'writeOffInformation',
        width: 150,
        hidden: standardFlag !== 'Y' || +customerPayFlag === 1,
        render: (_, record) => {
          return (
            <CusButton type="plain" onClick={() => this.openWriteOffModal(record)}>
              {intl
                .get(`${prompt}.view.detail.invoice.selectWriteOffInformation`)
                .d('选择可核销明细')}
            </CusButton>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.writeOffAmount`).d('核销原币金额'),
        dataIndex: 'writeOffAmount',
        width: 150,
        hidden: standardFlag !== 'Y' || +customerPayFlag === 1,
        render: (val) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(val, precision)}</span>
            </div>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.paymentAmount`).d('本次净支付原币金额'),
        dataIndex: 'paymentAmount',
        width: 170,
        hidden: standardFlag !== 'Y',
        render: (val) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(val, precision)}</span>
            </div>
          );
        },
      },
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.invoice.instalmentFlag`).d('是否非全额支付'),
          tip: intl
            .get(`${prompt}.view.detail.line.instalmentFlag.help`)
            .d('當賬單並非全額支付時﹐請勾選並填上賬單所顯示的總金額'),
        }),
        dataIndex: 'instalmentFlag',
        width: 170,
        render: (text, record) =>
          defaultFlag || financeFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`instalmentFlag`, {
                  initialValue: record.instalmentFlag || '0',
                })(
                  <Checkbox
                    checkedValue="1"
                    unCheckedValue="0"
                    disabled={!['DRAFT', 'PENDING_REVIEW'].includes(requestStatus)}
                    onChange={(e) => this.changeInstalmentFlag(e.target.checked, record)}
                  />
                )}
              </Form.Item>
            </div>
          ) : (
            yesOrNoRender(Number(text))
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.paymentCount`).d('第几次付款'),
        dataIndex: 'paymentCount',
        width: 150,
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.billTotalAmount`).d('账单总额'),
        dataIndex: 'billTotalAmount',
        width: 120,
        render: (text, record) =>
          record.$form.getFieldValue('instalmentFlag') === '1' &&
          ['DRAFT', 'PENDING_REVIEW'].includes(requestStatus) ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`billTotalAmount`, {
                  initialValue: record.billTotalAmount,
                })(<InputNumber step={0.01} precision={precision} className="cus-input-money" />)}
              </Form.Item>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(text, precision)}</span>
            </div>
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.ebsInvoiceNum`).d('EBS发票编号'),
        dataIndex: 'ebsInvoiceNum',
        width: 150,
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.exchangeRate`).d('(税务)发票汇率'),
        dataIndex: 'exchangeRate',
        width: 150,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`exchangeRate`, {
                  initialValue: record.exchangeRate,
                  rules: [
                    {
                      required: (() => {
                        const requestEmployeeNum = form.getFieldValue('requestEmployeeNum');
                        // 必填逻辑为在指定OU清单下的，如果发票货币不是公司主体本位币，则为必输字段。
                        const companyOrgCode = form.getFieldValue('companyOrgCode');
                        const org =
                          idpValueMap['RS_IP_INVOICETAX_SIGN_ENTITY']?.find(
                            (i) => i.value === companyOrgCode
                          ) || {};
                        const finEntity =
                          idpValueMap['RS_FIN_INVOICETAX_SIGN_ENTITY']?.find(
                            (i) => i.value === companyOrgCode
                          ) || {};
                        // 公司本体币
                        const { description } =
                          idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY']?.find(
                            (i) => i.value === companyOrgCode
                          ) || {};
                        if (description !== currencyCode) {
                          // 当公司主体属于值集RS_IP_INVOICETAX_SIGN_ENTITY中的公司主体，但申请单上的币种并非主体的本位币时，申请人提交审批时必须填写（税务）发票汇率字段，允许财务复核时修改。
                          if (org.value) {
                            return true;
                          } else if (finEntity.value) {
                            // 当公司主体属于值集RS_FIN_INVOICETAX_SIGN_ENTITY中的公司主体，但申请单上的币种并非主体的本位币时，申请人提交审批时非必填（税务）发票汇率字段，财务复核时必填且可以修改。
                            return loginName !== requestEmployeeNum;
                          }
                        }
                      })(),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${prompt}.view.detail.invoice.exchangeRate`)
                          .d('(税务)发票汇率'),
                      }),
                    },
                  ],
                })(<InputNumber className="cus-input-money" min={0} max={9999999} step={0.01} />)}
              </Form.Item>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{text}</span>
            </div>
          ),
      },

      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.line.payCurrencyCode`).d('支付币种'),
          tip: intl
            .get(`${prompt}.view.detail.line.payCurrencyCode.help`)
            .d('只限于特殊情况下使用, 请线下跟 Aptradepayment team 沟通'),
        }),
        dataIndex: 'payCurrencyCode',
        width: 150,
        render: (text, record) =>
          defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`payCurrencyCode`, {
                  initialValue: record.payCurrencyCode,
                })(<CusLov textValue={record.payCurrencyCode} code="HPFM.CURRENCY" />)}
              </Form.Item>
            </div>
          ) : (
            text
          ),
      },
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.line.payExchangeRate`).d('支付汇率'),
          tip: intl
            .get(`${prompt}.view.detail.line.payCurrencyCode.help`)
            .d('只限于特殊情况下使用, 请线下跟 Aptradepayment team 沟通'),
        }),
        dataIndex: 'payExchangeRate',
        width: 150,
        render: (text, record) =>
          defaultFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`payExchangeRate`, {
                  initialValue: record.payExchangeRate,
                })(
                  <InputNumber
                    className="cus-input-money"
                    onChange={(value) => {
                      Object.assign(record, {
                        payExchangeRate: value,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{text}</span>
            </div>
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.payAmount`).d('支付金额'),
        dataIndex: 'payAmount',
        width: 120,
        render: (val, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <span>
                {numberRender(
                  (record.invoiceAmount * record.payExchangeRate).toFixed(2) || 0,
                  precision
                )}
              </span>
            </div>
          );
        },
      },
      {
        title: intl
          .get(`${prompt}.view.detail.line.withholdingTaxVendorNum`)
          .d('预提税税务机构编号'),
        dataIndex: 'withholdingTaxVendorNum',
        width: 180,
        hidden: !withholdingTaxFlag && !archiveFlag,
        onHeaderCell: () => ({ style: { color: withholdingTaxFlag ? '#f54a45' : '' } }),
      },
      {
        title: intl
          .get(`${prompt}.view.detail.line.withholdingTaxVendorName`)
          .d('预提税税务机构名称'),
        dataIndex: 'withholdingTaxVendorName',
        width: 180,
        hidden: !withholdingTaxFlag && !archiveFlag,
        onHeaderCell: () => ({ style: { color: withholdingTaxFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          withholdingTaxFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <>
                <Form.Item style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator(`withholdingTaxVendorName`, {
                    initialValue: record.withholdingTaxVendorName,
                  })(<div />)}
                </Form.Item>
                <Form.Item>
                  {record.$form.getFieldDecorator(`withholdingTaxVendorSite`, {
                    initialValue: record.withholdingTaxVendorSite,
                  })(
                    <CusLov
                      code="SPCM_COST_WITHOUTHING_SUPPLIER"
                      queryParams={() => {
                        const ouOrgCode = form.getFieldValue('ouOrgCode');
                        return { orgCode: ouOrgCode };
                      }}
                      textField="withholdingTaxVendorName"
                      onChange={(_, lovRecord) => this.changeTaxAgencyName(lovRecord, record)}
                    />
                  )}
                </Form.Item>
              </>
            </div>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.withholdingTaxRemarks`).d('预提税备注'),
        dataIndex: 'withholdingTaxRemarks',
        width: 150,
        hidden: !withholdingTaxFlag && !archiveFlag,
        onHeaderCell: () => ({ style: { color: withholdingTaxFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          withholdingTaxFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`withholdingTaxRemarks`, {
                  initialValue: record.withholdingTaxRemarks,
                })(<CusInput.TextArea autoChangeSize={true} maxLength={140} />)}
              </Form.Item>
            </div>
          ) : (
            text
          ),
      },
      {
        title: intl
          .get(`${prompt}.view.detail.invoice.withholdingTaxAmount`)
          .d('预提税金额（原币）'),
        dataIndex: 'withholdingTaxAmount',
        width: 180,
        hidden: !withholdingTaxFlag && !archiveFlag,
        onHeaderCell: () => ({ style: { color: withholdingTaxFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          withholdingTaxFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`withholdingTaxAmount`, {
                  initialValue: record.withholdingTaxAmount,
                })(
                  <InputNumber
                    step={0.01}
                    precision={precision}
                    className="cus-input-money"
                    onChange={() => this.withholdingTaxAmountChange(record)}
                  />
                )}
              </Form.Item>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(text, precision)}</span>
            </div>
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.vendorSiteCode`).d('供应商地点'),
        dataIndex: 'vendorSiteCode',
        width: 150,
        hidden: !financeFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`vendorSiteCode`, {
                  initialValue: record.vendorSiteCode,
                })(<CusInput.TextArea autoChangeSize={true} />)}
              </Form.Item>
            </div>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.glDate`).d('GL Date'),
        dataIndex: 'glDate',
        width: 120,
        hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`glDate`, {
                  initialValue: record.glDate ? dayjs(record.glDate) : undefined,
                })(<CusDatePicker />)}
              </Form.Item>
            </div>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.sscSuggestion`).d('(税务)SSC意见'),
        dataIndex: 'sscSuggestion',
        width: 180,
        hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`sscSuggestion`, {
                  initialValue: record.sscSuggestion,
                })(<CusInput.TextArea autoChangeSize={true} />)}
              </Form.Item>
            </div>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.invoice.invoiceAttachment`).d('发票附件'),
        dataIndex: 'invoiceAttachment',
        width: getCurrentLanguage() === 'en_US' ? 200 : 130,
        fixed: 'right',
        render: (text, record) => {
          return (
            <div
              onClick={(e) => {
                if (e && e.stopPropagation) {
                  e.stopPropagation();
                } else {
                  window.event.cancelBubble = true;
                }
              }}
            >
              <Form.Item>
                {record.$form.getFieldDecorator(`invoiceAttachment`, {
                  initialValue: record.invoiceAttachment,
                })(
                  <Attachment
                    rowKey="invoiceFileId"
                    prompt={prompt}
                    idpValueMap={idpValueMap}
                    parentId={{ costInvoiceId: record.costInvoiceId }}
                    dataSource={record.attachmentLineList || []}
                    title={intl.get(`${prompt}.view.invoice.attachment`).d('发票附件')}
                    disabled={!defaultFlag && !fileFlag}
                  />
                )}
              </Form.Item>
            </div>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item[ROW_KEY]),
      onChange: (keys, rows) => {
        this.setState({
          selectedRows: rows,
          selectedRowKeys: keys,
        });
      },
    };

    return (
      <>
        {standardFlag === 'Y' && amountFlag === 'Y' && (
          <TabWriteOffDetail payWriteOffData={payWriteOffData} />
        )}
        <Row style={{ marginBottom: '16px', marginTop: '16px' }}>
          <Col span={12} style={{ lineHeight: '32px' }}>
            <span>
              {intl
                .get(`${prompt}.view.pay.tabToViewDetail`)
                .d('账单列表 （点击账单进行切换查看账单明细）')}
            </span>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <CusButton mini loading={downLoading} onClick={() => this.handleDown()}>
              {intl.get(`${prompt}.view.file.bathDown`).d('批量下载')}
            </CusButton>
            {defaultFlag && (
              <>
                {requestStatus === 'DRAFT' && (
                  <CusButton mini loading={saveLoading} onClick={() => toExport(true)}>
                    {intl.get('hzero.common.button.import').d('导入')}
                  </CusButton>
                )}
                <CusButton
                  mini
                  loading={deleteBillLoading}
                  disabled={selectedRowKeys.length === 0}
                  onClick={this.billListDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                <CusButton
                  mini
                  disabled={selectedRowKeys.length === 0}
                  onClick={() =>
                    onCopy(selectedRows, () => {
                      this.setState({
                        selectedRows: [],
                        selectedRowKeys: [],
                      });
                    })
                  }
                >
                  {intl.get('hzero.common.button.copy').d('复制')}
                </CusButton>
                <CusButton mini type="primary" onClick={this.billListCreate}>
                  {intl.get('hzero.common.button.add').d('新增')}
                </CusButton>
              </>
            )}
          </Col>
        </Row>
        <EditTable
          rowKey={ROW_KEY}
          columns={columns}
          hideOnSinglePage={false}
          dataSource={billDataSource}
          pagination={billPagination}
          rowSelection={rowSelection}
          // onChange={onChange}
          onRow={handleRow}
          rowClassName={(record) => {
            return record[ROW_KEY] === activeRowKey ? 'active-row' : '';
          }}
        />
        {/* 选择可核销Modal */}
        {writeOffVisible && (
          <CusModal
            title={intl.get('spcm.costPayment.view.selectWriteOffResultArea').d('选择核销结果区域')}
            visible={writeOffVisible}
            onCancel={() => {
              this.setState({
                writeOffVisible: false,
              });
            }}
            footer={null}
            width={1000}
            destroyOnClose
            marginBottom={40}
          >
            <WriteOffArea
              writeOffData={writeOffData}
              headerData={headerData}
              prompt={prompt}
              onCancel={() => {
                this.setState({
                  writeOffVisible: false,
                });
              }}
              onOk={this.handleSaveWriteOff}
              defaultFlag={defaultFlag}
            />
          </CusModal>
        )}
      </>
    );
  }
}

export default BillList;
