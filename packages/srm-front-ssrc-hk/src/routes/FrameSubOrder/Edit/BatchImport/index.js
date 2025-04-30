import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { connect } from 'dva';
import { SRM_SSRC } from '_utils/config';
import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import SoRequireQuery from './components/SoRequireQuery';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusPanel from '_cus_components/Page/CusPanel';
import CusHeader from '_cus_components/Page/CusHeader';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusLov from '_cus_components/CusLov';
import CusNotification from '_cus_components/CusNotification';
import ImportModal from '_cus_components/CusModal/ImportModal';

const commonPrompt = 'ssrc.resaleRfq';
const organizationId = getCurrentOrganizationId();
@fastCodeLoader(['RS_IBOSS_PRODUCT_TYPE_ISP_RFP', 'RS_IBOSS_SO_PRODUCT_TYPE'])
@formatterCollections({ code: [`${commonPrompt}`] })
@connect(({ resaleRfq, loading }) => ({
  resaleRfq,
  validateFailedLoading:
    loading.effects['resaleRfq/validateFailed'] ||
    loading.effects['resaleRfq/ictsValidateFailed'] ||
    loading.effects['resaleRfq/chinaDiaValidateFailed'],
}))
export default class BatchImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      payVisible: false,
      requireAndEnquiryNoVisible: false,
      importUploading: false,
      dataSource: [],
      pagination: {}, // 分页参数
      productDescription: undefined, // 产品类型
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
    };
  }

  @Bind
  handleCancel() {
    this.setState({
      payVisible: false,
    });
  }

  // 导入上传
  @Bind
  payUpload(payFileList) {
    const { productDescription } = this.state;
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    // 新增导入
    cusRequest(
      `${SRM_SSRC}/v1/${organizationId}/${
        productDescription === 'STANDARD'
          ? 'enquiry-price-import'
          : productDescription === 'ICTS'
          ? 'enquiry-price-icts-import'
          : 'enquiry-price-china-dia-import'
      }/import`,
      {
        method: 'POST',
        body: formData,
        responseType: 'text',
      }
    ).then((res) => {
      // 判断返回的值是不是JSON格式的字符串
      if (res) {
        try {
          const response = JSON.parse(res);
          CusNotification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: response.message,
          });
          this.setState({
            importUploading: false,
          });
        } catch {
          this.setState({
            importUploading: false,
            batchId: res,
          });
          this.handleSearchFailed(res);
        } finally {
          this.handleCancel();
        }
      }
    });
  }

  @Bind()
  handleSearchFailed(batchId = '', page = {}) {
    const { dispatch } = this.props;
    const { productDescription } = this.state;
    dispatch({
      type:
        productDescription === 'STANDARD'
          ? 'resaleRfq/validateFailed'
          : productDescription === 'ICTS'
          ? 'resaleRfq/ictsValidateFailed'
          : 'resaleRfq/chinaDiaValidateFailed',
      payload: {
        page,
        batchId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  // 导入模板下载
  @Bind
  payTemplateDownload() {
    this.setState({
      requireAndEnquiryNoVisible: true,
    });
  }

  @Bind()
  handleOkSelect(data) {
    const { idpValueMap = {} } = this.props;
    const tag = this.getFastCode(idpValueMap['RS_IBOSS_PRODUCT_TYPE_ISP_RFP'], data.value);
    if (['ICTS', 'STANDARD', 'CHINA_DIA'].includes(tag)) {
      this.setState({
        productDescription: tag,
        payVisible: true,
      });
    } else {
      CusNotification.error({
        message: intl
          .get(`${commonPrompt}.view.warning.noMatchProductTips`)
          .d('匹配不到当前产品类型'),
      });
    }
  }

  /**
   * 转义值集
   * @param {*} list - 值集列表
   * @param {*} value - 值
   */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find((e) => e.value === value);
    if (item) {
      return item.tag;
    }
  }

  render() {
    const { validateFailedLoading = false, idpValueMap = {} } = this.props;
    const { payVisible, requireAndEnquiryNoVisible, dataSource, pagination, batchId, isPub, importUploading = false } =
      this.state;
    // 导入错误的columns
    const columns = [
      {
        title: intl.get(`${commonPrompt}.model.line-num`).d('行号'),
        dataIndex: '_sheetIndex',
        width: 80,
        render: (val) => <div style={{ textAlign: 'center' }}>{val}</div>,
      },
      {
        title: intl.get(`${commonPrompt}.model.status`).d('数据状态'),
        dataIndex: '_dataStatusMeaning',
        width: 200,
      },
      {
        title: intl.get(`${commonPrompt}.model.import-error-message`).d('信息'),
        dataIndex: 'errorMsg',
      },
    ];

    return (
      <PageWrapper loading={validateFailedLoading}>
        <CusPanel>
          <CusHeader backPath={`${isPub ? '/pub' : ''}/ssrc/resale-rfq/list`} />
          <PanelHeader
            title={intl.get(`hzero.common.title.batchImport`).d('批量导入')}
            showArrow={false}
            style={{ paddingTop: '0px' }}
            buttons={
              <>
                <CusButton
                  mini
                  onClick={() => {
                    this.payTemplateDownload();
                  }}
                >
                  {intl.get(`${commonPrompt}.view.title.create-template`).d('下载模板')}
                </CusButton>
                <CusLov
                  mini
                  type="primary"
                  onOk={this.handleOkSelect}
                  isButton
                  code="RS_IBOSS_PRODUCTTYPE_ISP_QUERY"
                >
                  {intl.get(`${commonPrompt}.view.title.create-import`).d('导入')}
                </CusLov>
              </>
            }
          />
          <CusTable
            rowKey="_id"
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => this.handleSearchFailed(batchId, page)}
          />
        </CusPanel>

        <ImportModal
          visible={payVisible}
          onCancel={this.handleCancel}
          importUploading={importUploading}
          payUpload={this.payUpload}
        />

        {/* 导出选择意向单Modal */}
        <CusModal
          title={intl
            .get(`${commonPrompt}.view.tilte.requireAndEnquiryNoSearch`)
            .d('销售意向单/需求单明细查询')}
          visible={requireAndEnquiryNoVisible}
          footer={null}
          destroyOnClose
          width={800}
          onCancel={() => this.setState({ requireAndEnquiryNoVisible: false })}
        >
          <SoRequireQuery
            onCancel={() => this.setState({ requireAndEnquiryNoVisible: false })}
            idpValueMap={idpValueMap}
          />
        </CusModal>
      </PageWrapper>
    );
  }
}
