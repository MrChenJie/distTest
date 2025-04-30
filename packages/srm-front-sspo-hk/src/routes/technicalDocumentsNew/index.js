/**
 * index.js - 应答表
 * @date: 2022-04-07
 * @author:  <haitao.lu02shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Input, Form } from 'hzero-ui';
import { connect } from 'dva';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import {
  FORM_COL_2_LAYOUT,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse, Tag } from 'antd';
import PanelHeader from '_cus_components/CusCollapse';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import UploadFile from './UploadFile';
import { dateRender, numberRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import { sum } from 'lodash';
import { createPagination, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import { dateTimeRender } from 'utils/renderer';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusButton from '_cus_components/CusButton';
import CusUpload from '@/components/CusUpload';
import CusExcelExport from '_cus_components/CusExcelExport';
import { SRM_BID } from '@/common/config';
const prompt = 'bid.bidcommon';
const dashPrompt = 'bid.biddashbord';

const { Panel } = Collapse;

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  fetchSourceListLoading: loading.effects['contractJudgesSorce/getDiddingRound'],
  fetchSupplierListLoading: loading.effects['contractJudgesSorce/getSupplierList'],
  getAnswerListJsLoading: loading.effects['contractJudgesSorce/getAnswerListJs'],  // 技术应答表loading
  getAnswerListLoading: loading.effects['contractJudgesSorce/getAnswerList'], // 商务应答表loading
  contractJudgesSorce,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'HKPC.commom',
  ],
})
export default class JudgesSorce extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      packageName: '',
      isNeedAnswer: 0,
      isNeedAnswerBusiness: 0,
      fileFlag: 0,
      tabFlag: 0,
      activeKey: ['form', 'tabs'],
      cachTabKey: 'null',
      tenderDataSource: [],
      pagination: {},
      supplierSource: [],
      supplierPagination: {},
      answerSource: [],
      answerPagination: {},
      answerShangwuSource: [],
      answerShangwuPagination: {},
    };
  }

  componentDidMount() {
    this.getPackageName();
    this.fetchEnum()
    this.getAnswerJishuTable()
    this.getAnswerShangwuTable()
    this.fetchSupplierList()
    this.fetchTenderList()
  }
  /**
   * getPackageName - 根据跳转带过来的packageName拿到标包名称
   */
  @Bind()
  getPackageName() {
    const { match, dispatch } = this.props;
    if (match.params.proId !== undefined) {
      dispatch({
        type: 'contractJudgesSorce/queryProjectQaInfo',
        payload: {
          proId: match.params.proId,
        },
      }).then(res => {
        this.setState({
          packageName: res.packageName,
          isNeedAnswer: res.isNeedAnswer,
          isNeedAnswerBusiness: res.isNeedAnswerBusiness,
          proInfoWording: res.proInfoWording
        })
      })
    }
  }
  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/init',
    });
  }

  @Bind()
  changeFlag() {
    this.setState({
      upFlag: false
    })
  }

    /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    const { onClick = (e) => e } = this.props;
    if (key === 'jishubiao') {
      this.setState({ tabFlag: 0 });
    } else if (key === 'shangwubiao') {
      this.setState({ tabFlag: 1 });
    }
    this.setState({ cachTabKey: key });
    onClick(key);
  }
  /**
   * fetchTenderList - 查询招标/投标文件表格信息
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchTenderList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getDiddingRound',
      payload: {
        page,
        proId: match.params.proId, // match.params.proId
        milestoneId: match.params.milestoneId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          tenderDataSource: res.datail.content.map(n => ({
            ...n,
            _status: 'update',
          })),
          pagination: createPagination(res.datail),
        })
      }
    });
  }

  /**
 * 查询值集
 */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/init',
    });
  }

  /**
  * getAnswerTable - 查询技术、商务应答表
  */
  @Bind()
  getAnswerJishuTable(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getAnswerList',
      payload: {
        page,
        proId: match.params.proId, // 测试proId：3
        state: 0, //判断技术/商务应答表
        milestoneId: match.params.milestoneId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res.page;
        this.setState({
          answerSource: content.map(n => ({
            ...n,
            _status: 'update',
          })),
          answerPagination: createPagination(res.page),
        })
        this.setState({ milestoneId: res.milestones[0].milestoneId })
      }
    });
  }
  @Bind()
  getAnswerShangwuTable(page = {}) {
    console.log('page==', page)
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getAnswerList',
      payload: {
        page,
        proId: match.params.proId, // 测试proId：3
        state: 1, //判断技术/商务应答表
        milestoneId: match.params.milestoneId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res.page;
        this.setState({
          answerShangwuSource: content.map(n => ({
            ...n,
            _status: 'update',
          })),
          answerShangwuPagination: createPagination(res.page),
        })
        this.setState({ milestoneId: res.milestones[0].milestoneId })
      }
    });
  }
  /**
     * fetchSupplierList - 查询供应商信息
     */
  @Bind()
  fetchSupplierList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getSupplierList',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          supplierSource: res.content.map(n => ({
            ...n,
            _status: 'update',
          })),
          supplierPagination: createPagination(res),
        })
      }
    });
  }
  @Bind()
  downloadAll(e, record) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/downLoadBidFilesZip',
      payload: {
        supplierId: record.supplierId,
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
      },
    }).then((res) => {
      // 创建下载的链接
      const url = window.URL.createObjectURL(
        new Blob(
          [res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        )
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      const fileName = record.supplierName + '.zip';
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    });
  }

  @Bind()
  handleExport(key) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/downloadTech',
      payload: {
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
        state: key === 'jishubiao' ? '0' : '1', // 技术应答表0，商务应答表1
      },
    }).then((res) => {
      const url = window.URL.createObjectURL(
        new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      let fileName = key === 'jishubiao' ?
      intl.get(`bid.bidcommon.view.title.jishubiao`).d('技术应答表') + '.xlsx'
      :
      intl.get(`bid.bidcommon.view.title.shangwubiao`).d('商务应答表') + '.xlsx';
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    })
  }

  render() {
    const {
      contractJudgesSorce,
      fetchSourceListLoading,
      fetchSupplierListLoading,
      getAnswerListJsLoading,
      getAnswerListLoading,
      match,
    } = this.props;
    const {
      tabFlag,
      activeKey,
      tenderDataSource,
      pagination,
      supplierSource,
      supplierPagination,
      cachTabKey,
      answerSource,
      answerPagination,
      answerShangwuSource,
      answerShangwuPagination,
      milestoneId,
    } = this.state;
    const { enumMap = {} } = contractJudgesSorce;
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    // 应答文件或者投标文件
    const fileSorce = [
      {
        key: 'supplierName',
        dataIndex: 'supplierName',
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        width: getCurrentLanguage() === 'zh_CN' ? 300 : 200,
        render: tooltipRender,
      },
      {
        key: 'technicalDocUuid',
        dataIndex: 'technicalDocUuid',
        title: intl.get(`HKPC.commom.view.title.TechnicalDoc`).d('技术文件'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 175,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.technicalDocUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'coveringLetterUuid',
        dataIndex: 'coveringLetterUuid',
        title: intl.get(`HKPC.commom.view.title.CoveringLetter`).d('商务文件'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 235,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.coveringLetterUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'executiveSumUuid',
        dataIndex: 'executiveSumUuid',
        title: intl.get(`HKPC.commom.view.title.ExecutiveSum`).d('技术、商务应答表'),
        width: getCurrentLanguage() === 'zh_CN' ? 160 : 330,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.executiveSumUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'projectProposalUuid',
        dataIndex: 'projectProposalUuid',
        title: intl.get(`HKPC.commom.view.title.ProjectProposal`).d('技术、商务应答表'),
        width: getCurrentLanguage() === 'zh_CN' ? 160 : 280,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.projectProposalUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'tendererQualificationsUuid',
        dataIndex: 'tendererQualificationsUuid',
        title: intl.get(`HKPC.commom.view.title.TendererQualifications`).d('技术、商务应答表'),
        width: getCurrentLanguage() === 'zh_CN' ? 160 : 330,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.tendererQualificationsUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'confidentAgreeUuid',
        dataIndex: 'confidentAgreeUuid',
        title: intl.get(`HKPC.commom.view.title.ConfidentAgree`).d('保密协议'),
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 290,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.confidentAgreeUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'acknowledgementLetterUuid',
        dataIndex: 'acknowledgementLetterUuid',
        title: intl.get(`HKPC.commom.view.title.AcknowledgementLetter`).d('反谋串确认函'),
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 280,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.acknowledgementLetterUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'brcertificateUuid',
        dataIndex: 'brcertificateUuid',
        title: intl.get(`HKPC.commom.view.title.brcertificate`).d('商业登记证明'),
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 280,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.brcertificateUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'othersUuid',
        dataIndex: 'othersUuid',
        title: intl.get(`HKPC.commom.view.title.Others`).d('其它'),
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 150,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              tenantId={getCurrentOrganizationId()}
              viewOnly
              attachmentUUID={record.othersUuid}
              isEncrypt
            />
          )
        }
      },
      {
        key: 'orderSeq',
        dataIndex: 'orderSeq',
        title: intl.get(`${dashPrompt}.model.title.status`).d('状态'),
        width: getCurrentLanguage() === 'zh_CN' ? 78 : 108,
        render: (_, record) => (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{
              display: 'block',
              padding: '4px',
              lineHeight: '12px',
              height: '20px',
              backgroundColor: record.state === 'N' ? 'rgba(245, 74, 69, 0.1)' : 'rgba(52, 199, 36, 0.1)',
              color: record.state === 'N' ? '#F54A45' : '#34C724',
              fontSize: '10px',
              borderRadius: '2px',
            }}>
              {record.state === 'N' ? intl.get(`${prompt}.view.title.unstatenew`).d('未应答') :intl.get(`${prompt}.view.title.statenew`).d('已应答')}
            </span>
          </div>
        ),
      },
      {
        key: 'selected',
        dataIndex: 'selected',
        title: intl.get(`${prompt}.view.title.biddingdatenew`).d('应答时间'),
        width: 165,
        render: (_, record) => {
          return (
            <span>{dateTimeRender(record.bidDate)}</span>
          )
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.operate`).d('操作'),
        width: getCurrentLanguage() === 'zh_CN' ? 85 : 125,
        dataIndex: 'operator',
        render: (_, record) => {
          return (
            <>
              <CusButton type="plain" onClick={(e) => this.downloadAll(e, record)}>
                {intl.get(`${prompt}.view.button.downloadall`).d('全部下载')}
              </CusButton>
            </>
          )
        }
      },
    ];
    const listProps = {
      dataSource: tenderDataSource,
      columns: fileSorce,
      pagination: false,
      resizable: true,
      // loading: fetchSourceListLoading,
      onChange: (page) => this.fetchTenderList(page),
    };

    // 技术应答表和商务应答表
    const { yesNO = [] } = enumMap
    let lists = [];
    let newDataList = [];
    answerSource.map((item) => {
      if (item.list.length > 0) {
        lists.push(item.list)
      }
    })
    lists.map((items) => {
      newDataList.push(items)
    })
    let columns = [];
    if (newDataList.length > 0) {
      columns = [
        {
          title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
          dataIndex: 'clause',
          fixed: 'left',
          width: 150,
          ellipsis: true,
          resizable: true,
          render: tooltipRender
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
          dataIndex: 'clauseDetail',
          fixed: 'left',
          width: 200,
          ellipsis: true,
          resizable: true,
          render: tooltipRender
        },
        {
          title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
          dataIndex: 'isLowestRequire',
          fixed: 'left',
          width: 120,
          className: styles.borderRightBolder,
          render: (_, record) => {
            yesNO.map((item) => {
              if (item.value === record.isLowestRequire) {
                record.isLowestRequire = item.meaning
              }
            })
            return (
              <span>{tooltipRender(record.isLowestRequire)}</span>
            )
          }
        }
      ];
      if (answerSource[0].list.length > 0) {
        answerSource[0].list.map((item, i) => {
          columns.push({
            key: `${item.supplierName}`,
            dataIndex: `${item.supplierName}${i}`,
            title: `${item.supplierName}` != 'null' ? `${item.supplierName}` : '',
            width: 300,
            ellipsis: true,
            className: i > 0 ? styles.borderBolder : styles.borderNone,
            children: [
              {
                title: intl.get(`bid.bidcommon.view.title.response`).d('应答情况'),
                width: 120,
                key: `${item.answerCondition}`,
                dataIndex: `${item.answerCondition}`,
                ellipsis: true,
                resizable: true,
                className: i > 0 ? styles.borderBolder : styles.borderNone,
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      <span>{row.list[i].answerCondition}</span>
                    )
                  }
                },
              },
              {
                title: intl.get(`bid.bidcommon.bid.title.DeviationDescription`).d('偏离情况说明'),
                width: 120,
                key: `${item.deviationRemark}${i}`,
                dataIndex: `${item.deviationRemark}${i}`,
                ellipsis: true,
                resizable: true,
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      <span>{tooltipRender(row.list[i].deviationRemark)}</span>
                    )
                  }
                }
              }
            ],
          })
        })
      }
    } else {
      columns = [
        {
          title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
          key: 'clause',
          width: 150,
          dataIndex: 'clause',
          ellipsis: true,
          resizable: true,
          render: (_, record) => {
            return (
              <span>{tooltipRender(record.clause)}</span>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
          key: 'clauseDetail',
          width: 200,
          dataIndex: 'clauseDetail',
          ellipsis: true,
          resizable: true,
          render: (_, record) => {
            return (
              <span>{tooltipRender(record.clauseDetail)}</span>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
          key: 'isLowestRequire',
          dataIndex: 'isLowestRequire',
          width: 120,
          ellipsis: true,
          resizable: true,
          render: (val, record) => {
            yesNO.map((item) => {
              if (item.value === record.isLowestRequire) {
                record.isLowestRequire = item.meaning
              }
            })
            return (
              <span>{tooltipRender(record.isLowestRequire)}</span>
            )
          }
        }
      ];
    }
    const otherListProps = {
      dataSource: tabFlag === 0 ? answerSource : answerShangwuSource,
      columns,
      pagination: tabFlag === 0 ? answerPagination : answerShangwuPagination,
      contractJudgesSorce,
      // loading: tabFlag === 0 ? getAnswerListJsLoading : getAnswerListLoading,
      onChange: (page) => tabFlag === 0 ? this.getAnswerJishuTable(page) : this.getAnswerShangwuTable(page),
    };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };

    // 供应商
    const supplierColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        width: 500,
        dataIndex: 'supplierName',
        render: tooltipRender
      },
      {
        title: intl.get(`bid.bidcommon.view.title.EstablishDate`).d('成立日期'),
        width: getCurrentLanguage() === 'zh_CN' ? 110 : 155,
        dataIndex: 'operation',
        render: (_, record) => {
          return (
            <span>{dateRender(record.establishmentDate)}</span>
          )
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.RegisterCapital`).d('注册资本'),
        width: 120,
        dataIndex: 'lineNum',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.registeredCapital, 2)}
            </div>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.rcurrency`).d('注册币种'),
        width: 90,
        dataIndex: 'orderSeq',
        render: (_, record) => {
          return (
            <span>{record.currency}</span>
          )
        }
      }
    ];
    const supplierProps = {
      dataSource: supplierSource,
      columns: supplierColumns,
      pagination: supplierPagination,
      contractJudgesSorce,
      // loading: fetchSupplierListLoading,
      onChange: (page) => this.fetchSupplierList(page),
    };
    supplierProps.scroll = { x: sum(columns.map((n) => n.width)) + 300 };

    return (
      <>
        <PageWrapper loading={
          fetchSourceListLoading ||
          fetchSupplierListLoading ||
          getAnswerListJsLoading ||
          getAnswerListLoading
        }>
          <Collapse
              className='customize-collapse'
              defaultActiveKey={activeKey}
              onChange={(collapseKeys) => {
                this.setState({ activeKey: collapseKeys });
              }}
            >
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get('bid.bidcommon.bid.title.EssentialInformation').d('基本信息')}
                    arrowActive={activeKey.includes('form')}
                  />}
                key='form'
              >
                <Form className="customize-form">
                  <Form.Item
                        label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                        {...FORM_COL_2_LAYOUT}
                      >
                      <Input placeholder='基站项目' disabled value={this.state.packageName} />
                  </Form.Item>
                </Form>
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get('bid.bidcommon.view.title.responsemessage').d('应答信息')}
                    arrowActive={activeKey.includes('tabs')}
                    buttons={
                      <>
                        {['jishubiao', 'shangwubiao'].includes(cachTabKey) && <CusButton mini onClick={() => this.handleExport(cachTabKey)}>
                          {intl.get('HKPC.commom.view.button.export').d('导出')}
                        </CusButton>}
                        {['SupplierInfor'].includes(cachTabKey) && <CusExcelExport
                          requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-ten-busi-configs/exportSupplier`}
                          otherButtonProps={{
                            mini: true,
                            icon: null,
                          }}
                          downloadType="Blob"
                          fileName={intl.get(`bid.bidcommon.view.title.SupplierInfor`).d('供应商信息')}
                          buttonText={intl.get(`HKPC.commom.view.button.export`).d('导出')}
                          queryParams={{
                            proId: match.params.proId,
                            milestoneId: match.params.milestoneId
                          }}
                        />}
                      </>
                    }
                  />
                }
                key='tabs'
              >
                <CusSearchTabs
                  activeKey={cachTabKey}
                  items={[
                    {
                      label: this.state.proInfoWording ? intl.get(`bid.bidcommon.view.title.biddingdocumenttb`).d('投标文件') : intl.get(`bid.bidcommon.view.title.biddingdocumenttbnew`).d('应答文件'),
                      key: 'null',
                      children: <CusTable {...listProps} />,
                    },
                    {
                      label: intl.get(`bid.bidcommon.view.title.jishubiao`).d('技术应答表'),
                      key: 'jishubiao',
                      children: <CusTable {...otherListProps} />,
                    },
                    {
                      label: intl.get(`bid.bidcommon.view.title.shangwubiao`).d('商务应答表'),
                      key: 'shangwubiao',
                      children: <CusTable {...otherListProps} />,
                    },
                    {
                      label: intl.get(`bid.bidcommon.view.title.SupplierInfor`).d('供应商信息'),
                      key: 'SupplierInfor',
                      children: <CusTable {...supplierProps} />,
                    },
                  ]}
                  onChange={this.changeTabs}
                />
              </Panel>
          </Collapse>
        </PageWrapper>

      </>
    );
  }
}
