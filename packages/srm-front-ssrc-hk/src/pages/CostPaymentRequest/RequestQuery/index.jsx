import React, { PureComponent, Fragment } from 'react';
import { Content } from 'components/Page';
import ExcelExport from '@/components/ExcelExport';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { SRM_SPUC, SRM_SPCM } from '_utils/config';
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentLanguage,
  getResponse,
} from 'utils/utils';
import { notification } from 'choerodon-ui';
import querystring from 'querystring';
import { Button, LocaleProvider, Modal } from 'hzero-ui';
import { DataSet, Spin, Table } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import cacheComponent from 'components/CacheComponent';
import queryBar from '@/components/customizeQuerybar';
import exportIcon from '@/assets/buttonIcons/导出.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import copyIcon from '@/assets/buttonIcons/复制.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import { costPaymentQueryDS } from './dataset/CostPaymentQueryDS';
import PrepayWriteOff from './components/PrepayWriteOff';
import './index.less';
import { batchDownloadFile } from '@/common/utils';
import moment from 'moment';

const { confirm } = Modal;
notification.config({
  placement: 'bottomRight',
});

const commonPrompt = 'spcm.costPayment';
@formatterCollections({ code: [commonPrompt] })
@fastCodeLoader(['VP.PRICE_CONTRACT_SIGN_ENTITY'])
@cacheComponent({ cacheKey: '/spcm/cost/payment/request' })
export default class CostRequestQuery extends PureComponent {
  constructor(props) {
    super(props);
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    this.state = {
      open,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      exportQueryParams: {},
      costRequestLoading: false,
      costPaymentQueryDS: new DataSet(costPaymentQueryDS({ commonPrompt })),
      prepayWriteOffVisible: false,
      fileDownloadLoading: false, // 付款凭证下载loading
      downLoadingFlag: null, // 付款凭证下载标识
    };
  }

  getExportQueryParams() {
    const data = this.state.costPaymentQueryDS.queryDataSet.toData();
    if (data.length) {
      let filterData = data[0];
      if (filterData.currencyCode) {
        const { currencyCode } = data[0];
        if (currencyCode) {
          filterData = { ...filterData, currencyCode: data[0].currencyCode.currencyCode };
        }
      }
      if (filterData.requestDepartment) {
        const { requestDepartment } = data[0];
        if (requestDepartment) {
          filterData = { ...filterData, requestDepartment: data[0].requestDepartment.unitCode };
        }
      }
      const newData = filterNullValueObject(filterData);
      this.setState({
        exportQueryParams: newData,
      });
      return newData;
    }
  }

  addRecord() {
    const { history } = this.props;
    const { isPub, open } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/oldDetail/${-1}`,
      search: `${open ? '?open=fs' : ''}`,
    });
  }

  // 详情叶
  toDetail(record) {
    const { history } = this.props;
    const { isPub, open } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/oldDetail/${
        record.record.data.costRequestId
      }`,
      search: `${open ? '?open=fs' : ''}`,
    });
  }

  // 删除
  delRecords() {
    // 获取选中的记录集
    const { currentSelected } = this.state.costPaymentQueryDS;
    if (!currentSelected || currentSelected.length === 0) return;
    // 判断记录集中的单据申请状态（可删除付款申请单据状态为‘草稿’单据）
    const isDelete = currentSelected.every((v) => {
      // return v.data.requestStatus === 'DRAFT' || v.data.requestStatus === 'REVOKE';
      return v.data.requestStatus === 'DRAFT';
    });
    if (!isDelete) {
      notification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.only-to-delete`)
          .d('仅可以删除付款申请单据状态为‘草稿’的单据'),
        duration: 3.0,
      });
    } else {
      // 调用dataset的delete
      this.state.costPaymentQueryDS.delete(currentSelected);
    }
  }

  // 复制 mode === 'entire' 为整单复制
  copyRecord(mode) {
    const { currentSelected } = this.state.costPaymentQueryDS;
    const that = this;
    if (!currentSelected || currentSelected.length === 0) {
      notification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.select-to-copy`)
          .d('请选择需要复制的单据'),
        duration: 3.0,
      });
      return;
    }
    confirm({
      title: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
      content: intl
        .get(`${commonPrompt}.view.query.if-want-to-copy`)
        .d('是否对选中的单据进行复制?'),
      onOk() {
        that.setState({
          costRequestLoading: true,
        });
        // 获取选中的记录集
        if (currentSelected.length === 1) {
          request(
            `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/${
              mode === 'entire' ? 'copyAll' : 'copy'
            }/${currentSelected[0].data.costRequestId}`,
            {
              method: mode === 'entire' ? 'GET' : 'POST',
              query: mode === 'entire' ? { sourceCode: 'MANAUAL_COPY' } : {},
            }
          ).then((res) => {
            if (res.type === 'error' || res.type === 'warn') {
              notification[res.type]({
                message: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
                description: res.message,
                duration: 3.0,
              });
              that.setState({
                costRequestLoading: false,
              });
            } else {
              // 复制成功跳转到详情页
              that.setState({
                costRequestLoading: false,
              });
              const { history } = that.props;
              const { costRequestId } = res.costPaymentRequest;
              history.push({
                pathname: `${
                  that.state.isPub ? '/pub' : ''
                }/spcm/cost/payment/request/oldDetail/${costRequestId}`,
                query: {
                  iscopy: true,
                },
                search: `${that.state.open ? '?open=fs' : ''}`,
              });
            }
          });
        } else if (currentSelected.length > 1) {
          notification.warning({
            message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
            description: intl
              .get(`${commonPrompt}.view.query.only-one-copy`)
              .d('仅能选择一项记录进行复制'),
            duration: 3.0,
          });
          that.setState({
            costRequestLoading: false,
          });
        }
      },
      onCancel() {},
    });
  }

  // 打开报表的Modal
  openPrepayModal() {
    this.setState({
      prepayWriteOffVisible: true,
    });
  }

  async fileBatchDownload({ costRequestId, requestNum, fileNumber }) {
    this.setState({
      fileDownloadLoading: true,
      downLoadingFlag: costRequestId,
    });
    const batchFileList = await request(
      `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/cost-attach-files/payment-advice`,
      {
        method: 'GET',
        query: {
          costRequestId,
          fileType: 'PAYMENT_ADVICE',
          size: fileNumber,
          fileQuantityLimit: 'Y',
        },
      }
    ).then((res) => {
      if (getResponse(res)) {
        return res.content?.map((item) => ({
          attachmentUuid: item.uuid,
          fileDir: item.fileTypeMeaning,
        }));
      }
    });
    if (batchFileList) {
      const fileName = `${requestNum}-${intl
        .get(`${commonPrompt}.view.payAdviceFileCnt.fileName`)
        .d('付款凭证')}-${moment(new Date()).format('YYYYMMDD')}`;
      await batchDownloadFile(batchFileList, fileName);
    }
    this.setState({
      fileDownloadLoading: false,
      downLoadingFlag: null,
    });
  }

  get columns() {
    return [
      {
        name: 'requestNum',
        align: 'left',
        width: 200,
        renderer: (record) => {
          return (
            <div style={{ textAlign: 'center' }}>
              <a onClick={() => this.toDetail(record)}>{record.value}</a>
            </div>
          );
        },
      },
      {
        name: 'requestEmployeeName',
        align: 'left',
        width: 100,
      },
      {
        name: 'requestTitle',
        align: 'left',
        width: 200,
      },
      {
        name: 'companyOrgName',
        align: 'left',
        width: 300,
      },
      {
        name: 'requestStatusMeaning',
        align: 'left',
        width: 150,
      },
      {
        name: 'approvalStatusMeaning',
        align: 'left',
        width: 150,
      },
      {
        name: 'requestDate',
        align: 'left',
        width: 150,
      },
      {
        name: 'invoiceNum',
        align: 'left',
        width: 200,
      },
      {
        name: 'invoiceDate',
        align: 'left',
        width: 150,
      },
      {
        name: 'vendorCompanyName',
        align: 'left',
        width: 280,
        tooltip: 'overflow',
      },
      {
        name: 'vendorCompanyNum',
        align: 'left',
      },
      {
        name: 'importEbsDate',
        align: 'left',
        width: 150,
      },
      {
        name: 'currencyCode',
        align: 'left',
      },
      {
        name: 'invoiceAmount',
        align: 'left',
        renderer: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.value, 2)}</div>;
        },
      },
      {
        name: 'invoiceHkAmountTotal',
        align: 'left',
        width: 140,
        renderer: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.value, 2)}</div>;
        },
      },
      {
        name: 'payAdviceFileCnt',
        align: 'left',
        width: 190,
        renderer: (record) => {
          const { costRequestId, requestNum, checkDateFlag } = record.record.data;
          if (checkDateFlag === 'Y' && !record.value) {
            return intl
              .get(`${commonPrompt}.view.payAdviceFileCnt.notProvided`)
              .d('【银行尚未提供凭证】');
          } else {
            return (
              <Spin
                spinning={
                  this.state.fileDownloadLoading && this.state.downLoadingFlag === costRequestId
                }
                size="small"
              >
                <a
                  onClick={() =>
                    this.fileBatchDownload({ costRequestId, requestNum, fileNumber: record.value })
                  }
                >
                  {record.value > 0
                    ? `${intl
                        .get(`${commonPrompt}.view.payAdviceFileCnt.fileDownload`)
                        .d('附件下载')}[${record.value}]`
                    : null}
                </a>
              </Spin>
            );
          }
        },
      },
      {
        name: 'pendingApportionFlagMeaning',
        align: 'left',
        width: 100,
      },
      {
        name: 'sourceCodeMeaning',
        align: 'left',
        width: 140,
      },
    ];
  }

  handleExport() {
    this.setState({
      exportLoading: true,
    });
    const queryParams = this.getExportQueryParams();
    request(
      `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/singleSheetCostDetailExport`,
      {
        method: 'GET',
        responseType: 'blob',
        query: queryParams,
      }
    ).then((res) => {
      this.setState({
        exportLoading: false,
      });
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl
          .get(`${commonPrompt}.view.export.costPayment`)
          .d('成本类付款申请清单明细');
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  get buttons() {
    const { exportQueryParams, exportLoading = false } = this.state;
    return [
      <div>
        <Button onClick={() => this.openPrepayModal()}>
          <img src={exportIcon} alt="" />
          {intl.get('hzero.common.button.prepayWriteOffReportForm').d('预付款核销报表')}
        </Button>
        <span onClick={() => this.getExportQueryParams()}>
          <ExcelExport
            requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/costPaymentApproveTimeExport`}
            // otherButtonProps={{ style: { margin: '10px 0 8px 8px' } }}
            queryParams={this.state.exportQueryParams}
            downloadType="Blob"
            fileName={intl
              .get('spcm.costPayment.filename.effectiveReport')
              .d('成本付款申请审批时效报表')}
            otherButtonProps={{
              icon: null,
            }}
            buttonText={
              <>
                <img src={exportIcon} alt="" />
                {intl.get(`hzero.common.button.approvalTimeReport`).d('审批时效')}
              </>
            }
            title={intl.get(`hzero.common.button.approvalTimeReport`).d('审批时效')}
          />
          {/*<ExcelExport*/}
          {/*  requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/costDetailExport`}*/}
          {/*  // otherButtonProps={{ style: { margin: '10px 0 8px 8px' } }}*/}
          {/*  queryParams={this.state.exportQueryParams}*/}
          {/*  downloadType="Blob"*/}
          {/*  fileName={intl*/}
          {/*    .get(`${commonPrompt}.view.export.costPayment`)*/}
          {/*    .d('成本类付款申请清单明细')}*/}
          {/*  otherButtonProps={{*/}
          {/*    icon: null,*/}
          {/*  }}*/}
          {/*  buttonText={*/}
          {/*    <>*/}
          {/*      <img src={exportIcon} alt="" />*/}
          {/*      {intl.get('hzero.common.button.export').d('导出')}*/}
          {/*    </>*/}
          {/*  }*/}
          {/*/>*/}
        </span>
        <Button onClick={() => this.handleExport()} loading={exportLoading}>
          <img src={exportIcon} alt="" />
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
        <Button onClick={() => this.delRecords()}>
          <img src={deleteIcon} alt="" />
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <Button onClick={() => this.copyRecord()}>
          <img src={copyIcon} alt="" />
          {intl.get('hzero.common.button.copy').d('复制')}
        </Button>
        <Button onClick={() => this.copyRecord('entire')}>
          <img src={copyIcon} alt="" />
          {intl.get(`hzero.common.button.entireCcopy`).d('整单复制')}
        </Button>
        <Button onClick={() => this.addRecord()}>
          <img src={addIcon} alt="" />
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      </div>,
    ];
  }

  render() {
    const { costRequestLoading, prepayWriteOffVisible } = this.state;
    const { idpValueMap = {} } = this.props;
    return (
      <Fragment>
        <Spin spinning={costRequestLoading}>
          {/* <Header
            title={
              open === 'fs'
                ? intl.get(`${commonPrompt}.view.query.fsTitle`).d('付款申请汇总【业务运营成本】')
                : intl.get(`${commonPrompt}.view.query.title`).d('成本付款申请')
            }
          /> */}
          <Content>
            <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
              <>
                <Table
                  columnResizable
                  dataSet={this.state.costPaymentQueryDS}
                  columns={this.columns}
                  buttons={this.buttons}
                  queryBar={queryBar}
                />

                {/* 预付款核销报表Modal */}
                {prepayWriteOffVisible && (
                  <Modal
                    title={intl
                      .get('spcm.costPayment.view.title.prepayWriteOffExport')
                      .d('预付款核销报表导出')}
                    visible={prepayWriteOffVisible}
                    onCancel={() => this.setState({ prepayWriteOffVisible: false })}
                    footer={null}
                    width={800}
                    destroyOnClose
                  >
                    <PrepayWriteOff idpValueMap={idpValueMap} />
                  </Modal>
                )}
              </>
            </LocaleProvider>
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
