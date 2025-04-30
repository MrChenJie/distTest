import React, { PureComponent, Fragment } from 'react';
import { routerRedux } from 'dva/router';
import { Content } from 'components/Page';
import ExcelExport from '@/components/ExcelExport';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { SRM_SPUC, SRM_SPCM } from '_utils/config';
import { numberRender } from 'utils/renderer';
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentLanguage,
  getResponse,
  getCurrentUser,
} from 'utils/utils';
import { notification, Spin } from 'choerodon-ui';
import { Button, Modal, LocaleProvider } from 'hzero-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import queryBar from '@/components/customizeQuerybar';
import exportIcon from '@/assets/buttonIcons/导出.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import copyIcon from '@/assets/buttonIcons/复制.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import PermissionContent from '@/components/PermissionContent';
import { resaleQueryDS } from './dataset/ResaleQueryDS';
import './index.less';
import { batchDownloadFile } from '@/common/utils';
import moment from 'moment';

const { confirm } = Modal;
notification.config({
  placement: 'bottomRight',
});

const organizationId = getCurrentOrganizationId();

async function fetchPermission(params) {
  return request(`/spfm/v1/${organizationId}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: params,
  });
}

const commonPrompt = 'spcm.resaleQuery';
@formatterCollections({ code: [commonPrompt] })
@cacheComponent({ cacheKey: '/spcm/payment-request/query' })
export default class RequestQuery extends PureComponent {
  constructor(props) {
    super(props);
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    const {
      match: { path },
    } = props;
    const isView = path.includes('/spcm/payment-request-view/query');
    this.state = {
      open,
      exportQueryParams: {},
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      resaleQueryDs: new DataSet(resaleQueryDS({ commonPrompt })),
      isView,
      spinning: false,
      fileDownloadLoading: false, // 付款凭证下载loading
      downLoadingFlag: null, // 付款凭证下载标识
    };
  }

  componentDidMount() {
    const { resaleQueryDs } = this.state;
    const { queryDataSet, currentPage } = resaleQueryDs;
    const { current } = queryDataSet;
    if (current) {
      current.restore();
    }
    resaleQueryDs.query(currentPage);

    this.initPermission();
  }

  initPermission() {
    const currentUser = getCurrentUser();
    const { id, currentRoleId } = currentUser;
    fetchPermission({
      routePath: '/spcm/payment-request',
      userId: id,
      roleId: currentRoleId,
    }).then((res) => {
      if (getResponse(res)) {
        const { editFlag } = res;
        const { isView } = this.state;
        this.setState({
          isView: isView || editFlag !== 'Y',
        });
      }
    });
  }

  getExportQueryParams() {
    const data = this.state.resaleQueryDs.queryDataSet.toData();
    let filterData = filterNullValueObject(data[0]);
    if (filterData.currencyCode) {
      filterData = { ...filterData, currencyCode: filterData.currencyCode.currencyCode };
    }
    if (filterData.requestDepartment) {
      filterData = { ...filterData, requestDepartment: filterData.requestDepartment.unitCode };
    }
    if (filterData.vendorCompanyName) {
      filterData = { ...filterData, vendorCompanyName: filterData.vendorCompanyName.vendorName };
    }
    if (data.length > 0) {
      this.setState({
        exportQueryParams: filterData,
      });
    }
    return filterData;
  }

  addRecord() {
    const { history } = this.props;
    const { isPub, open } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spcm/payment-request/create`,
      search: `${open ? '?open=fs' : ''}`,
    });
  }

  // 详情页面
  toDetail(record) {
    const {
      history,
      match: { path },
    } = this.props;
    const { isPub, open } = this.state;
    const isView = path.includes('/spcm/payment-request-view/query');
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spcm/payment-request${isView ? '-view' : ''}/detail/${
        record.data.costRequestId
      }`,
      search: `${open ? '?open=fs' : ''}`,
    });
  }

  // 删除
  delRecords() {
    // 获取选中的记录集.
    const { currentSelected } = this.state.resaleQueryDs;
    const that = this;
    if (!currentSelected || currentSelected.length === 0) {
      notification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.select-to-delete`)
          .d('请选择需要删除的单据'),
        duration: 4.0,
      });
      return;
    }
    // 判断记录集中的单据申请状态（可删除付款申请单据状态为‘草稿、撤销’单据）
    const isDelete = currentSelected.every((v) => {
      return v.data.requestStatus === 'DRAFT' || v.data.requestStatus === 'REVOKE';
    });
    if (!isDelete) {
      notification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.only-to-delete`)
          .d('仅可以删除付款申请单据状态为‘草稿、撤销’的单据'),
        duration: 4.0,
      });
    } else {
      // 调用dataset的delete
      that.state.resaleQueryDs.delete(currentSelected);
    }
  }

  // 复制 mode === 'entire' 为整单复制
  copyRecord(mode) {
    // 获取选中的记录集
    const { currentSelected } = this.state.resaleQueryDs;
    if (!currentSelected || currentSelected.length === 0) {
      notification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.select-to-copy`)
          .d('请选择需要复制的单据'),
        duration: 4.0,
      });
      return;
    }
    const that = this;
    confirm({
      title: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
      content: intl
        .get(`${commonPrompt}.view.query.if-want-to-copy`)
        .d('是否对选中的单据进行复制?'),
      onOk() {
        if (currentSelected.length === 1) {
          that.setState({
            spinning: true,
          });
          request(
            `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/${
              mode === 'entire' ? 'copyAll' : 'copy'
            }/${currentSelected[0].data.costRequestId}`,
            {
              method: 'POST',
              query: mode === 'entire' ? { sourceCode: 'MANAUAL_COPY' } : {},
            }
          ).then((res) => {
            that.setState({
              spinning: false,
            });
            if (res.type === 'error' || res.type === 'warn') {
              notification[res.type]({
                message: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
                description: res.message,
                duration: 4.0,
              });
            } else {
              const { dispatch } = that.props;
              const { costRequestId } = res.costPaymentRequest;
              const { isPub, open } = that.state;
              // history.push(`${isPub ? '/pub' : ''}/spcm/payment-request/detail/${costRequestId}`);
              dispatch(
                routerRedux.push({
                  pathname: `${isPub ? '/pub' : ''}/spcm/payment-request/detail/${costRequestId}`,
                  state: {
                    newFlag: true,
                  },
                  search: `${open ? '?open=fs' : ''}`,
                })
              );
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
        }
      },
      onCancel() {},
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
          fileType: "PAYMENT_ADVICE",
          size: fileNumber,
          fileQuantityLimit: 'Y',
        }
      }
    ).then((res) => {
      if (getResponse(res)) {
        return res.content?.map(item => ({attachmentUuid: item.uuid, fileDir: item.fileTypeMeaning }));
      }
    });
    if(batchFileList){
      const fileName = `${requestNum}-${intl.get(`${commonPrompt}.view.payAdviceFileCnt.fileName`).d("付款凭证")}-${moment(new Date()).format('YYYYMMDD')}`
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
        renderer: ({ value, record }) => {
          return (
            <div>
              <a style={{ textDecoration: 'underline' }} onClick={() => this.toDetail(record)}>
                {value}
              </a>
            </div>
          );
        },
        // tooltip: 'overflow',
      },
      {
        name: 'requestStatusMeaning',
        align: 'left',
        width: 150,
      },
      {
        name: 'approvalStatus',
        align: 'left',
        width: 150,
      },
      {
        name: 'requestTitle',
        align: 'left',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'invoiceNum',
        align: 'left',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'companyOrgName',
        align: 'left',
        width: 220,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        align: 'left',
      },
      {
        name: 'invoiceAmount',
        align: 'left',
        width: 200,
        renderer: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.value, 2)}</div>;
        },
      },
      {
        name: 'vendorCompanyName',
        align: 'left',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'vendorCompanyNum',
        align: 'left',
      },
      {
        name: 'requestEmployeeName',
        align: 'left',
        width: 200,
      },
      {
        name: 'draftEmployeeName',
        align: 'left',
        width: 200,
      },
      {
        name: 'requestDepartmentMeaning',
        align: 'left',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'requestDate',
        align: 'left',
        width: 200,
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
          if(checkDateFlag === 'Y' && !record.value){
            return intl.get(`${commonPrompt}.view.payAdviceFileCnt.notProvided`).d('【银行尚未提供凭证】')
          } else {
            return (
              <Spin
                spinning={
                  this.state.fileDownloadLoading && this.state.downLoadingFlag === costRequestId
                }
                size="small"
              >
                <a onClick={() => this.fileBatchDownload({ costRequestId, requestNum, fileNumber: record.value })}>
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
      }
    ];
  }

  handleExport() {
    this.setState({
      exportLoading: true,
    });
    const queryParams = this.getExportQueryParams();
    request(
      `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/singleSheetResalePaymentExport`,
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
        const fileName = intl.get(`${commonPrompt}.view.export.resaleQuery`).d('转售付款申请导出');
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
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
        <span onClick={() => this.getExportQueryParams()}>
          <ExcelExport
            requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/resalePaymentApproveTimeExport`}
            queryParams={exportQueryParams}
            downloadType="Blob"
            fileName={intl
              .get('spcm.resaleQuery.filename.effectiveReport')
              .d('转售付款申请审批时效报表')}
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
          {/* <ExcelExport */}
          {/*  requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/resalePaymentExport`} */}
          {/*  queryParams={exportQueryParams} */}
          {/*  downloadType="Blob" */}
          {/*  fileName={intl.get(`${commonPrompt}.view.export.resaleQuery`).d('转售付款申请导出')} */}
          {/*  otherButtonProps={{ */}
          {/*    icon: null, */}
          {/*  }} */}
          {/*  buttonText={ */}
          {/*    <> */}
          {/*      <img src={exportIcon} alt="" /> */}
          {/*      {intl.get('hzero.common.button.export').d('导出')} */}
          {/*    </> */}
          {/*  } */}
          {/* /> */}
        </span>
        <Button onClick={() => this.handleExport()} loading={exportLoading}>
          <img src={exportIcon} alt="" />
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
        <Button onClick={() => this.delRecords()}>
          <img src={deleteIcon} alt="" />
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
        <Button onClick={() => this.copyRecord()}>
          <img src={copyIcon} alt="" />
          {intl.get(`hzero.common.button.copy`).d('复制')}
        </Button>
        <Button onClick={() => this.copyRecord('entire')}>
          <img src={copyIcon} alt="" />
          {intl.get(`hzero.common.button.entireCcopy`).d('整单复制')}
        </Button>
        <Button onClick={() => this.addRecord()}>
          <img src={addIcon} alt="" />
          {intl.get(`hzero.common.button.add`).d('新增')}
        </Button>
      </div>,
      <div style={{ clear: 'both' }} />,
    ];
  }

  render() {
    const { isView, spinning } = this.state;
    const {
      match: { path },
    } = this.props;
    return (
      <Fragment>
        {/* <Header
          title={
            open === 'fs'
              ? intl.get(`${commonPrompt}.view.query.fsTitle`).d('付款申请汇总【转售采购成本】')
              : intl.get(`${commonPrompt}.view.query.title`).d('转售采购成本付款申请')
          }
        /> */}
        <PermissionContent
          permissionList={
            path.includes('/spcm/payment-request-view/query')
              ? null
              : [
                  {
                    code: `/spcm/payment-request.ps.default`,
                    type: 'visible',
                    meaning: '汇总页显示控制',
                  },
                ]
          }
        >
          <Content>
            <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
              <Spin spinning={spinning} style={{ height: '100vh', maxHeight: '100vh' }}>
                <div>
                  <Table
                    dataSet={this.state.resaleQueryDs}
                    columns={this.columns}
                    buttons={isView ? undefined : this.buttons}
                    queryBar={queryBar}
                    queryFieldsLimit={3}
                  />
                </div>
              </Spin>
            </LocaleProvider>
          </Content>
        </PermissionContent>
      </Fragment>
    );
  }
}
