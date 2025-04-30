import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import queryString from 'querystring';
import { filterNullValueObject, getCurrentOrganizationId, getCurrentLanguage, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import dayjs from 'dayjs';
import uuidv4 from 'uuid/v4';
import { Collapse, Row, Col, Tag } from 'antd';
import { Form } from 'hzero-ui';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusNotification from '_cus_components/CusNotification';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import { closeWindow } from '_cus_utils/utils';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import HeaderInfoPanel from './headerInfo';
import BiddingInfoPanel from './biddingInfo';
import UploadList from '@/components/uploadList';
import QuotationClause from './quotationClause';
import QuotationDetail from './quotationDetail';

const { Panel } = Collapse;
@connect(({ enterQuotationModel, loading = {} }) => ({
  enterQuotationModel,
  saveLoading: loading.effects['enterQuotationModel/saveQuotationInfo']
  || loading.effects['enterQuotationModel/submitQuotationInfo'],
  queryLoading: loading.effects['enterQuotationModel/queryInfo'],
}))
@formatterCollections({ code: ['HKPC.commom', 'bid.bidcommon'] })
@Form.create()
export default class EnterQuotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [
        'headerInfo',
        'biddingRoundInfo',
        'quotationfile',
        'supplierfile',
        'quotationClause',
        'quotationDetail',
      ],
    };
  }

  componentDidMount() {
    this.handleQuery();
    this.handleFetchEnum();
  }

  // 查询值集
  handleFetchEnum = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterQuotationModel/fetchEnum',
    });
  }

  // 查询基本信息
  handleQuery = () => {
    const { dispatch, location } = this.props;
    const routerParams = queryString.parse(location.search.substr(1));
    const {
      rounds,
      refSupId,
      refHeadId,
      refStageId,
      } = routerParams;
    dispatch({
      type: 'enterQuotationModel/queryInfo',
      payload: {
        refHeadId,
        refStageId,
        refSupId,
        rounds,
      }
    }).then((res) => {
      if(res) {
        // 计算总价
        const totalpriceOriginak = (res?.porClauseInfo || []).reduce((sum, item) => sum + Number(item.priceOriginak || 0), 0);
        const totalpriceHkd = (res?.porClauseInfo || []).reduce((sum, item) => sum + Number(item.priceHkd || 0), 0);
        const newQuotationDetailDataSource = (res?.porClauseInfo || []).concat({
          priceOriginak: totalpriceOriginak,
          priceHkd: totalpriceHkd,
          isTotalRow: true,
        })
        console.log('newQuotationDetailDataSource', newQuotationDetailDataSource);
        dispatch({
          type: 'enterQuotationModel/updateState',
          payload: {
            headerInfo: res?.porProjectInfo, // 基本信息
            bidRoundInfo: res?.porFreq, // 轮次信息
            quotationfileUuid: res?.porFile ? res?.porFile[0].uuid : uuidv4(), // 报价文件uuid
            supplierfileUuid: res?.supPorFile ? res?.supPorFile[0].uuid : uuidv4(), // 给供应商的附件uuid
            quotationClauseDataSource: res?.porClause ? (res?.porClause || []).map((item) => ({
              ...item,
              _status: 'update',
              rowKey: uuidv4(),
            })) : [
              {
                _status: 'update',
                rowKey: uuidv4(),
              }
            ], // 报价条款
            quotationDetailDataSource: newQuotationDetailDataSource.map((item) => ({
              ...item,
              _status: 'update',
              rowKey: uuidv4(),
            })), // 报价详情
            bakup: res?.bakup || intl.get(`HKPC.commom.view.title.remarkcontent`).d('因供应商无法自行登录门户，由采购员帮助供应商填写报价信息。'), // 轮次备注
          }
        })
      }
    })
  }

  // 查询uuid上传的附件信息
  handleFileList = (callback) => {
    const { enterQuotationModel, dispatch } = this.props;
    const { quotationfileUuid } = enterQuotationModel;
    if (quotationfileUuid) {
      dispatch({
        type: 'enterQuotationModel/queryFileList',
        payload: {
          tenantId: getCurrentOrganizationId(),
          bucketName: 'bidding',
          attachmentUUID: quotationfileUuid,
        }
      }).then((fileList) => {
        if (typeof callback === 'function') {
          callback(fileList);
        }
      })
    } else {
      callback([]);
    }
  }

  // 保存
  handleSave = (callback) => {
    const { dispatch, location, enterQuotationModel } = this.props;
    const routerParams = queryString.parse(location.search.substr(1));
    const {
      rounds,
      refSupId,
      refHeadId,
      } = routerParams;
    const {
      quotationClauseDataSource = [],
      quotationDetailDataSource = [],
      quotationfileUuid,
    } = enterQuotationModel;
    const clauseParams = getEditTableData(quotationClauseDataSource, ['rowKey']);
    const detailList = getEditTableData(quotationDetailDataSource, ['rowKey']);
    const detailParams = detailList?.filter(item => !item.isTotalRow);
    console.log('clauseParams', clauseParams);
    console.log('detailParams', detailParams);
    console.log('attachmentUUID', quotationfileUuid);
    console.log('this.form', this.form.getFieldsValue());
    this.form.validateFields((err, val) => {
      if(!err) {
        this.handleFileList((params) => {
          if(params.length > 0) {
            if(clauseParams.length > 0 && detailList.length > 0) {
              dispatch({
                type: 'enterQuotationModel/saveQuotationInfo',
                payload: {
                  porClause: clauseParams,
                  porClauseInfo: detailParams,
                  porFileList: [{
                    uuid: quotationfileUuid
                  }],
                  refSupId,
                  refHeadId,
                  rounds,
                  isTryQuote: 'Y',
                  bakup: val?.bakup,
                }
              }).then((res) => {
                if(res.code === 200) {
                  CusNotification.success({
                    message: intl.get('hzero.common.notification.success.save').d('保存成功'),
                  });
                  this.handleQuery();
                  if(typeof callback === 'function') {
                    callback(res);
                  }
                } else {
                  CusNotification.warning({
                    message: intl.get(`${res.msg}`).d('错误消息'),
                  });
                }
              })
            }
          } else {
            CusNotification.warning({
              message: intl.get(`HKPC.commom.view.message.uploadquotationfile`).d('请上传报价文件'),
            })
          }
        })
      }
    })
  }

  // 提交
  handleSubmit = () => {
    const { dispatch, location, enterQuotationModel } = this.props;
    const routerParams = queryString.parse(location.search.substr(1));
    const {
      rounds,
      refSupId,
      refHeadId,
      refRoundsId,
      } = routerParams;
    this.handleSave((params) => {
      if(params) {
        dispatch({
          type: 'enterQuotationModel/submitQuotationInfo',
          payload: {
            refSupId,
            refRoundsId,
            refHeadId,
            rounds,
          },
        }).then((res) => {
          if(res) {
            CusNotification.success({
              message: intl.get('bid.bidcommon.view.title.submitsuccessfully').d('提交成功'),
            });
            window.close();
            // 飞书提交审批后关闭tag页
            closeWindow();
          }
        })
      }
    })
  }

  render() {
    const {
      dispatch,
      enterQuotationModel,
      saveLoading = false,
      queryLoading = false,
    } = this.props;
    const {
      quotationfileUuid,
      supplierfileUuid,
    } = enterQuotationModel;
    console.log('supplierfileUuid', supplierfileUuid);
    const {
      activeKey,
    } = this.state;
    const headerInfoProps = {
      ...this.props,
    }
    const biddingInfoProps = {
      ...this.props,
      onRef: (node) => {
        this.form = node.props.form;
      },
    }
    const quotationClauseProps = {
      ...this.props,
    }
    const quotationDetailProps = {
      ...this.props,
    }
    return (
      <>
        <PageWrapper loading={queryLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              key="headerInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('HKPC.commom.view.title.projectinformation').d('项目基本信息')}
                  arrowActive={activeKey.includes('headerInfo')}
                />
              }
            >
              <HeaderInfoPanel {...headerInfoProps} />
            </Panel>
            <Panel
              key="biddingRoundInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('HKPC.commom.view.title.biddinground').d('投标轮次')}
                  arrowActive={activeKey.includes('biddingRoundInfo')}
                />
              }
            >
              <BiddingInfoPanel {...biddingInfoProps} />
            </Panel>
            <Panel
              key="quotationfile"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('HKPC.commom.view.title.quotationfile').d('报价文件(附件形式上传)')}
                  arrowActive={activeKey.includes('quotationfile')}
                />
              }
            >
              <UploadList
                viewOnly={false}
                multiple={true}
                bucketName='bidding'
                tenantId={getCurrentOrganizationId()}
                // showUploadList={{
                //   removePopConfirmTitle: intl
                //     .get('hzero.common.message.confirm.delete')
                //     .d('是否删除此条记录？'),
                //   showRemoveIcon: true,
                // }}
                filePreview
                onUploadSuccess={(file, fileList, attachmentUUID) => {
                  console.log('上传成功', attachmentUUID);
                  dispatch({
                    type: 'enterQuotationModel/updateState',
                    payload: {
                      quotationfileUuid: attachmentUUID,
                    }
                  })
                }}
                attachmentUUID={quotationfileUuid}
                setLoading={(uploading = false) => {
                  this.setState({
                    uploading,
                  });
                }}
              />
            </Panel>
            <Panel
              key="supplierfile"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('HKPC.commom.view.title.attachmenttosupplier').d('给供应商的附件')}
                  arrowActive={activeKey.includes('supplierfile')}
                />
              }
            >
              <UploadList
                viewOnly={true}
                multiple={true}
                bucketName='private-bucket'
                tenantId={getCurrentOrganizationId()}
                filePreview
                attachmentUUID={supplierfileUuid}
              />
            </Panel>
            <Panel
              key="quotationClause"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('HKPC.commom.view.title.QuotationTerms').d('报价条款')}
                  arrowActive={activeKey.includes('quotationClause')}
                />
              }
            >
              <QuotationClause {...quotationClauseProps} />
            </Panel>
            <Panel
              key="quotationDetail"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('HKPC.commom.view.title.quotationdetail').d('报价详情')}
                  arrowActive={activeKey.includes('quotationDetail')}
                />
              }
            >
              <QuotationDetail {...quotationDetailProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          <CusButton
            onClick={this.handleSave}
            loading={saveLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </CusButton>
          <CusButton
            type="primary"
            onClick={this.handleSubmit}
            loading={saveLoading}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </CusButton>
        </CusApprovalButtons>
      </>
    )
  }
}