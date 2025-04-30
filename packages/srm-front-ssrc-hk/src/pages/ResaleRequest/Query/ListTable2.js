import React from 'react';
import intl from 'utils/intl';
import { Spin } from 'hzero-ui';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import { numberRender, dateRender } from 'utils/renderer';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import cusRequest from '_cus_utils/request';
import { SRM_SPCM } from '_utils/config';
import dayjs from 'dayjs';
import { batchDownloadFile } from '@/common/utils';

const commonPrompt = 'spcm.resaleQuery';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileDownloadLoading: false,
      downLoadingFlag: null,
    };
  }

  // 详情页面
  toDetail = (record) => {
    const { isPub, isView } = this.props;
    console.log(123);
    window.open(
      `${isPub ? '/pub' : ''}/spcm/payment-request-resale${isView ? '-view' : ''}/detail/${
        record.costRequestId
      }`
    );
  };

  async fileBatchDownload({ costRequestId, requestNum, fileNumber }) {
    this.setState({
      fileDownloadLoading: true,
      downLoadingFlag: costRequestId,
    });
    const batchFileList = await cusRequest(
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
      if (cusGetResponse(res)) {
        return res.content?.map((item) => ({
          attachmentUuid: item.uuid,
          fileDir: item.fileTypeMeaning,
        }));
      }
    });
    if (batchFileList) {
      const fileName = `${requestNum}-${intl
        .get(`${commonPrompt}.view.payAdviceFileCnt.fileName`)
        .d('付款凭证')}-${dayjs(new Date()).format('YYYYMMDD')}`;
      await batchDownloadFile(batchFileList, fileName);
    }
    this.setState({
      fileDownloadLoading: false,
      downLoadingFlag: null,
    });
  }

  render() {
    const { dataSource = [], pagination = {}, rowSelection, onChange = (e) => e } = this.props;
    const columns = [
      {
        width: 200,
        dataIndex: 'requestNum',
        title: intl.get(`${commonPrompt}.view.query.requestNum`).d('付款申请编号'),
        render: (val, record) => {
          return (
            <div>
              <a onClick={() => this.toDetail(record)}>{val}</a>
            </div>
          );
        },
      },
      {
        width: 150,
        dataIndex: 'requestStatusMeaning',
        title: intl.get(`${commonPrompt}.view.query.requestStatus`).d('申请状态'),
      },
      {
        width: 150,
        dataIndex: 'approvalStatus',
        title: intl.get(`${commonPrompt}.view.query.approvalStatus`).d('审批环节'),
      },
      {
        width: 180,
        dataIndex: 'requestTitle',
        title: intl.get(`${commonPrompt}.view.query.requestTitle`).d('付款申请标题'),
      },
      {
        width: 150,
        dataIndex: 'invoiceNum',
        title: intl.get(`${commonPrompt}.view.query.invoiceNum`).d('发票号码'),
      },
      {
        width: 220,
        dataIndex: 'companyOrgName',
        title: intl.get(`${commonPrompt}.view.query.companyOrgName`).d('采购签约主体'),
      },
      {
        width: 100,
        dataIndex: 'currencyCode',
        title: intl.get(`${commonPrompt}.view.query.currencyCode`).d('币种'),
      },
      {
        width: 200,
        dataIndex: 'invoiceAmount',
        title: intl.get(`${commonPrompt}.view.query.invoiceAmount`).d('付款申请原币金额（含税）'),
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },

      {
        width: 200,
        dataIndex: 'vendorCompanyName',
        title: intl.get(`${commonPrompt}.view.query.vendorCompanyName`).d('供应商名称'),
      },
      {
        width: 150,
        dataIndex: 'vendorCompanyNum',
        title: intl.get(`${commonPrompt}.view.query.vendorCompanyNum`).d('供应商编号'),
      },
      {
        width: 150,
        dataIndex: 'requestEmployeeName',
        title: intl.get(`${commonPrompt}.view.query.requestEmployeeName`).d('申请人'),
      },
      {
        width: 150,
        dataIndex: 'draftEmployeeName',
        title: intl.get(`${commonPrompt}.view.query.draftEmployeeName`).d('起草人'),
      },
      {
        width: 150,
        dataIndex: 'requestDepartmentMeaning',
        title: intl.get(`${commonPrompt}.view.query.requestDepartment`).d('申请部门'),
      },
      {
        width: 150,
        dataIndex: 'requestDate',
        title: intl.get(`${commonPrompt}.view.query.requestDate`).d('申请日期'),
        render: dateRender,
      },
      {
        width: 150,
        dataIndex: 'invoiceHkAmountTotal',
        title: intl.get(`${commonPrompt}.view.query.invoiceHkAmountTotal`).d('港币总金额 (含税)'),
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },

      {
        width: 150,
        dataIndex: 'payAdviceFileCnt',
        title: intl.get(`${commonPrompt}.view.query.payAdviceFileCnt`).d('付款凭证'),
        render: (val, record) => {
          const { costRequestId, requestNum, checkDateFlag } = record;
          const { fileDownloadLoading, downLoadingFlag } = this.state;
          if (checkDateFlag === 'Y' && !val) {
            return intl
              .get(`${commonPrompt}.view.payAdviceFileCnt.notProvided`)
              .d('【银行尚未提供凭证】');
          } else {
            return (
              <Spin
                spinning={fileDownloadLoading && downLoadingFlag === costRequestId}
                size="small"
              >
                <a
                  onClick={() =>
                    this.fileBatchDownload({ costRequestId, requestNum, fileNumber: val })
                  }
                >
                  {val > 0
                    ? `${intl
                        .get(`${commonPrompt}.view.payAdviceFileCnt.fileDownload`)
                        .d('附件下载')}[${val}]`
                    : null}
                </a>
              </Spin>
            );
          }
        },
      },

      {
        width: 100,
        dataIndex: 'pendingApportionFlagMeaning',
        title: intl.get(`${commonPrompt}.view.query.pendingApportionFlag`).d('是否待摊'),
      },
      {
        width: 150,
        dataIndex: 'sourceCodeMeaning',
        title: intl.get(`${commonPrompt}.view.query.sourceCode`).d('创建方式'),
      },
    ];
    return (
      <>
        <CusTable
          rowKey="rowKey"
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
