/**
 * 供应商管理 - 供应商信息更新比对 采购
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/19
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component, Fragment } from 'react';
import ReactToPrint from 'react-to-print';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Collapse, Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import PanelHeader from '_cus_components/CusCollapse';
import intl from 'utils/intl';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import ContactTable from '@/routes/Supplier/components/ContactTable';
import ComparisonAttachmentTable from '@/routes/Supplier/components/ComparisonAttachmentTable';
import './index.less'
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import { fastCodeLoader } from '../../../../../src/utils/decorators';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([

])
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  comparisonData: supplierHK.comparisonData || {},
  loading: loading.effects['supplierHK/compareData'],
  baseInfoExportLoading: loading.effects['supplierHK/baseInfoExport'],
  tenantId: getCurrentOrganizationId()
}))
export default class FinanceInfoComparison extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'client', 'attachment']
    }
    this.componentRef = React.createRef();
  }

  componentDidMount() {
    this.getComparisonDataDetail();
  }

  // 信息比对导出
  @Bind()
  handleExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
      const { applyNumber } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/baseInfoExport',
      payload: {
        applyNumber,
      }
    }).then(res => {
      if(res) {
        // 创建下载的链接
        const url = window.URL.createObjectURL(new Blob([res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const location = document.createElement('a');
        location.style.display = 'none';
        const fileName = `${intl.get(`${prompt}.view.button.comparison`).d('信息比对')}.xlsx`;
        location.download = fileName;
        location.href = url;
        document.body.appendChild(location);
        location.click();
        // 释放的 URL 对象以及移除 a 标签
        URL.revokeObjectURL(location.href);
        document.body.removeChild(location);
      }
    });
  }

  /**
   * 查询比对信息详情
   */
  @Bind()
  getComparisonDataDetail() {
    const { location: { search }, dispatch } = this.props;
    const { applyNumber } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/compareData',
      payload: {
        applyNumber
      }
    })
  }

  render() {
    const {
      loading,
      form: { getFieldDecorator, getFieldValue },
      comparisonData: {
        baseInfoUpdateHeadCompare = {},
        baseInfoUpdateContactCompare = {},
        baseInfoUpdateAttachCompare = {},
      },
      baseInfoExportLoading = false,
    } = this.props;
    const { activeKey } = this.state;
    const gridSpan = { span: 12 };
    const { previousHead = {}, nextHead = {} } = baseInfoUpdateHeadCompare;
    const { previousContacts = [], nextContacts = [] } = baseInfoUpdateContactCompare;
    const { previousAttachs = [], nextAttachs = [] } = baseInfoUpdateAttachCompare;
    const previousContactsTableProps = {
      rowKey: 'id',
      dataSource: previousContacts,
      otherDataSource: nextContacts,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true
    };
    const nextContactsTableProps = {
      rowKey: 'id',
      dataSource: nextContacts,
      otherDataSource: previousContacts,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true
    };
    const previousAttachsTableProps = {
      rowKey: 'id',
      dataSource: previousAttachs,
      otherDataSource: nextAttachs,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true
    };
    const nextAttachsTableProps = {
      rowKey: 'id',
      dataSource: nextAttachs,
      otherDataSource: previousAttachs,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true
    };
    return (
      <Fragment>
      <div style={{ marginTop: '16px', textAlign: 'right', marginRight: '16px' }}>
        <CusButton
          mini
          onClick={this.handleExport}
          loading={baseInfoExportLoading}
        >
          {intl.get('spfmhk.supplier.button.exportexcel').d('导出Excel')}
        </CusButton>
        <ReactToPrint
          trigger={() => (
            <CusButton
              mini
              onClick={() => this.componentRef.current?.print()}
            >
              {intl.get('spfmhk.supplier.button.exportpdf').d('导出pdf')}
            </CusButton>
          )}
          content={() => this.componentRef.current}
        />
      </div>
      <div ref={this.componentRef}>
        <PageWrapper loading={loading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.basic.information.update`).d('变更基本信息')}
                  arrowActive={activeKey.includes('basic')}
                />
              }
              key="basic"
            >
              <Form className="customize-form no-border-form">
                <Row gutter={24}>
                  <Col {...gridSpan} className="after-border">
                    <h5 style={{ paddingLeft: '16px', fontWeight: 'bold' }}>{intl.get(`${prompt}.view.title.update.before`).d('变更前')}</h5>
                    <Col span={24}>
                      <Form.Item label={intl.get(`${prompt}.field.change.reason`).d('变更原因')}
                                  className={getFieldValue('editReasonBefore') !== getFieldValue('editReasonAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('editReasonBefore', {
                          initialValue: previousHead?.editReason
                        })(<CusInput.TextArea readOnly autoSize />)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.view.table.applicant`).d('申请人')}
                                 className={getFieldValue('salesmanBefore') !== getFieldValue('salesmanAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('salesmanBefore', {
                          initialValue: previousHead?.salesman,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}
                                 className={getFieldValue('supplierNumberBefore') !== getFieldValue('supplierNumberAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierNumberBefore', {
                          initialValue: previousHead?.supplierNumber,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}
                                 className={getFieldValue('companyNameEnBefore') !== getFieldValue('companyNameEnAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyNameEnBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.companyNameEn,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}
                                 className={getFieldValue('companyNameChBefore') !== getFieldValue('companyNameChAfter') ? `tips-input-text-color` : ''}>
                        {getFieldDecorator('companyNameChBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.companyNameCh,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.address.en`).d('地址（英文）')}
                                 className={getFieldValue('addressEnBefore') !== getFieldValue('addressEnAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('addressEnBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.addressEn,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.address.en`).d('地址（中文）')}
                                 className={getFieldValue('addressChBefore') !== getFieldValue('addressChAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('addressChBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.addressCh,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.telNo`).d('电话号码')}
                                 className={getFieldValue('phoneNumberBefore') !== getFieldValue('phoneNumberAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('phoneNumberBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.phoneNumber,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.faxNo`).d('传真号码')}
                                 className={getFieldValue('faxBefore') !== getFieldValue('faxAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('faxBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.fax,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.email`).d('电邮')}
                                 className={getFieldValue('emailBefore') !== getFieldValue('emailAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('emailBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.email,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.web`).d('公司网址')}
                                 className={getFieldValue('companyWebsiteBefore') !== getFieldValue('companyWebsiteAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyWebsiteBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.companyWebsite,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.type`).d('公司类型')}
                                 className={getFieldValue('companyTypeBefore') !== getFieldValue('companyTypeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyTypeBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.companyTypeMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.category`).d('公司类别')}
                                 className={getFieldValue('companyClassesBefore') !== getFieldValue('companyClassesAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyClassesBefore', {
                          rules: [{
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${prompt}.field.company.category`).d('公司类别'),
                            }),
                          }],
                          initialValue: previousHead?.companyClassesMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.business.nature`).d('业务性质')}
                                 className={getFieldValue('professionalBefore') !== getFieldValue('professionalAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('professionalBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.professional,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supply.of.goods.services`).d('供应货品/服务')}
                                 className={getFieldValue('productBefore') !== getFieldValue('productAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('productBefore', {
                          rules: [{
                            required: getFieldValue('supplierCategoryBefore') !== 'FINANCIALPAYMENT',
                          }],
                          initialValue: previousHead?.product,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.category`).d('供应商类别')}
                                 className={getFieldValue('supplierCategoryBefore') !== getFieldValue('supplierCategoryAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierCategoryBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.supplierCategoryMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.product.categories`).d('供应商产品类别')}
                                 className={getFieldValue('supplierProductClassBefore') !== getFieldValue('supplierProductClassAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierProductClassBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.supplierProductClassMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.establishment.date`).d('公司成立日期')}
                                 className={getFieldValue('foundDateBefore') !== getFieldValue('foundDateAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('foundDateBefore', {
                          initialValue: previousHead?.foundDate,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.location`).d('公司成立地点')}
                                 className={getFieldValue('foundAddressBefore') !== getFieldValue('foundAddressAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('foundAddressBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.foundAddress,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码')}
                                 className={getFieldValue('registrationNumberBefore') !== getFieldValue('registrationNumberAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('registrationNumberBefore', {
                          rules: [{
                            required: getFieldValue('supplierCategoryBefore') !== 'FINANCIALPAYMENT',
                          }],
                          initialValue: previousHead?.registrationNumber,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.country`).d('国家')}
                                 className={getFieldValue('countryBefore') !== getFieldValue('countryAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('countryBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.countryMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.order.currency`).d('订单币种')}
                                 className={getFieldValue('orderMoneyTypeBefore') !== getFieldValue('orderMoneyTypeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('orderMoneyTypeBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.orderMoneyType,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.credit.period`).d('付款期限')}
                                 className={getFieldValue('promptBefore') !== getFieldValue('promptAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('promptBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.promptMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.payment.method`).d('付款办法')}
                                 className={getFieldValue('paymentMethodBefore') !== getFieldValue('paymentMethodAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('paymentMethodBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.paymentMethodMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.basic.info.international.regulation`).d('国贸条规')}
                                 className={getFieldValue('deliveryClauseBefore') !== getFieldValue('deliveryClauseAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('deliveryClauseBefore', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: previousHead?.deliveryClauseMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.communicatsection`).d('往来段')}
                                 className={getFieldValue('dealingsBefore') !== getFieldValue('dealingsAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('dealingsBefore', {
                          initialValue: previousHead?.linePrevious?.dealings
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.controlledbudget`).d('是否受关联预算控制')}
                                 className={getFieldValue('isRelatedBudgetBefore') !== getFieldValue('isRelatedBudgetAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('isRelatedBudgetBefore', {
                          initialValue: previousHead?.linePrevious?.isRelatedBudgetMeaning
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.relatedtranstparty`).d('是否为关联交易方')}
                                 className={getFieldValue('isRelatedTraderBefore') !== getFieldValue('isRelatedTraderBeforeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('isRelatedTraderBefore', {
                          initialValue: previousHead?.linePrevious?.isRelatedTraderMeaning
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.liabilityaccount`).d('负债账户')}
                                 className={getFieldValue('liabilityAccountBefore') !== getFieldValue('liabilityAccountAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('liabilityAccountBefore', {
                          initialValue: previousHead?.linePrevious?.liabilityAccount
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.Invaildsupplier`).d('是否失效')}
                                 className={getFieldValue('enableValidBefore') !== getFieldValue('enableValidAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('enableValidBefore', {
                          initialValue: previousHead?.enableValidMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    {previousHead?.enableValid === 'Y' && <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.Invaildate`).d('失效日期')}
                                 className={getFieldValue('expireDateBefore') !== getFieldValue('expireDateAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('expireDateBefore', {
                          initialValue: previousHead?.expireDate,
                        })(<CusInput readOnly />)}
                      </Form.Item>
                    </Col>}
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supmodifystatus`).d('供应商修改状态')}
                                 className={getFieldValue('supModifyStateBefore') !== getFieldValue('supModifyStateAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supModifyStateBefore', {
                          initialValue: previousHead?.supModifyStateMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.enableportal`).d('是否启用供应商门户')}
                                 className={getFieldValue('enableSupPortalBefore') !== getFieldValue('enableSupPortalAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('enableSupPortalBefore', {
                          initialValue: previousHead?.enableSupPortalMeaning || 'N',
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.status`).d('供应商状态')}
                                 className={getFieldValue('supplierStatusBefore') !== getFieldValue('supplierStatusAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierStatusBefore', {
                          initialValue: previousHead?.supplierStatusMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.status.update.date`).d('状态更新日期')}
                                 className={getFieldValue('statusUpdateTimeBefore') !== getFieldValue('statusUpdateTimeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('statusUpdateTimeBefore', {
                          initialValue: previousHead?.statusUpdateTime,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}
                                 className={getFieldValue('supplierVersionsBefore') !== getFieldValue('supplierVersionsAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierVersionsBefore', {
                          initialValue: previousHead?.supplierVersions,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.version.update.date`).d('版本更新日期')}
                                 className={getFieldValue('versionsUpdateTimeBefore') !== getFieldValue('versionsUpdateTimeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('versionsUpdateTimeBefore', {
                          initialValue: previousHead?.versionsUpdateTime,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.entry.date`).d('供应商准入日期')}
                                 className={getFieldValue('supplierAccessTimeBefore') !== getFieldValue('supplierAccessTimeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierAccessTimeBefore', {
                          initialValue: previousHead?.supplierAccessTime,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                  </Col>
                  <Col {...gridSpan}>
                    <h5 style={{ paddingLeft: '16px', fontWeight: 'bold' }}>{intl.get(`${prompt}.view.title.update.after`).d('变更后')}</h5>
                    <Col span={24}>
                      <Form.Item label={intl.get(`${prompt}.field.change.reason`).d('变更原因')}
                                  className={getFieldValue('editReasonBefore') !== getFieldValue('editReasonAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('editReasonAfter', {
                          initialValue: nextHead?.editReason
                        })(<CusInput.TextArea readOnly autoSize />)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.view.table.applicant`).d('申请人')}
                                 className={getFieldValue('salesmanBefore') !== getFieldValue('salesmanAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('salesmanAfter', {
                          initialValue: nextHead?.salesman,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}
                                 className={getFieldValue('supplierNumberBefore') !== getFieldValue('supplierNumberAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierNumberAfter', {
                          initialValue: nextHead?.supplierNumber,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}
                                 className={getFieldValue('companyNameEnBefore') !== getFieldValue('companyNameEnAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyNameEnAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.companyNameEn,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}
                                 className={getFieldValue('companyNameChBefore') !== getFieldValue('companyNameChAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyNameChAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.companyNameCh,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.address.en`).d('地址（英文）')}
                                 className={getFieldValue('addressEnBefore') !== getFieldValue('addressEnAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('addressEnAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.addressEn,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.address.cn`).d('地址（中文）')}
                                 className={getFieldValue('addressChBefore') !== getFieldValue('addressChAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('addressChAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.addressCh,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.telNo`).d('电话号码')}
                                 className={getFieldValue('phoneNumberBefore') !== getFieldValue('phoneNumberAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('phoneNumberAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.phoneNumber,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.faxNo`).d('传真号码')}
                                 className={getFieldValue('faxBefore') !== getFieldValue('faxAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('faxAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.fax,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.email`).d('电邮')}
                                 className={getFieldValue('emailBefore') !== getFieldValue('emailAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('emailAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.email,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.web`).d('公司网址')}
                                 className={getFieldValue('companyWebsiteBefore') !== getFieldValue('companyWebsiteAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyWebsiteAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.companyWebsite,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.type`).d('公司类型')}
                                 className={getFieldValue('companyTypeBefore') !== getFieldValue('companyTypeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyTypeAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.companyTypeMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.category`).d('公司类别')}
                                 className={getFieldValue('companyClassesBefore') !== getFieldValue('companyClassesAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('companyClassesAfter', {
                          rules: [{
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${prompt}.field.company.category`).d('公司类别'),
                            }),
                          }],
                          initialValue: nextHead?.companyClassesMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.business.nature`).d('业务性质')}
                                 className={getFieldValue('professionalBefore') !== getFieldValue('professionalAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('professionalAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.professional,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supply.of.goods.services`).d('供应货品/服务')}
                                 className={getFieldValue('productBefore') !== getFieldValue('productAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('productAfter', {
                          rules: [{
                            required: getFieldValue('supplierCategoryAfter') !== 'FINANCIALPAYMENT',
                          }],
                          initialValue: nextHead?.product,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.category`).d('供应商类别')}
                                 className={getFieldValue('supplierCategoryBefore') !== getFieldValue('supplierCategoryAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierCategoryAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.supplierCategoryMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.product.categories`).d('供应商产品类别')}
                                 className={getFieldValue('supplierProductClassBefore') !== getFieldValue('supplierProductClassAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierProductClassAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.supplierProductClassMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.establishment.date`).d('公司成立日期')}
                                 className={getFieldValue('foundDateBefore') !== getFieldValue('foundDateAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('foundDateAfter', {
                          initialValue: nextHead?.foundDate,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.company.location`).d('公司成立地点')}
                                 className={getFieldValue('foundAddressBefore') !== getFieldValue('foundAddressAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('foundAddressAfter', {
                          rules: [{
                            required: getFieldValue('supplierCategoryAfter') !== 'FINANCIALPAYMENT',
                          }],
                          initialValue: nextHead?.foundAddress,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码')}
                                 className={getFieldValue('registrationNumberBefore') !== getFieldValue('registrationNumberAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('registrationNumberAfter', {
                          rules: [{
                            required: getFieldValue('supplierCategoryAfter') !== 'FINANCIALPAYMENT',
                          }],
                          initialValue: nextHead?.registrationNumber,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.country`).d('国家')}
                                 className={getFieldValue('countryBefore') !== getFieldValue('countryAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('countryAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.countryMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.order.currency`).d('订单币种')}
                                 className={getFieldValue('orderMoneyTypeBefore') !== getFieldValue('orderMoneyTypeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('orderMoneyTypeAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.orderMoneyType,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.credit.period`).d('付款期限')}
                                 className={getFieldValue('promptBefore') !== getFieldValue('promptAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('promptAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.promptMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.payment.method`).d('付款办法')}
                                 className={getFieldValue('paymentMethodBefore') !== getFieldValue('paymentMethodAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('paymentMethodAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.paymentMethodMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.basic.info.international.regulation`).d('国贸条规')}
                                 className={getFieldValue('deliveryClauseBefore') !== getFieldValue('deliveryClauseAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('deliveryClauseAfter', {
                          rules: [{
                            required: true,
                          }],
                          initialValue: nextHead?.deliveryClauseMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.communicatsection`).d('往来段')}
                                 className={getFieldValue('dealingsBefore') !== getFieldValue('dealingsAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('dealingsAfter', {
                          initialValue: nextHead?.lineNext?.dealings
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.controlledbudget`).d('是否受关联预算控制')}
                                 className={getFieldValue('isRelatedBudgetBefore') !== getFieldValue('isRelatedBudgetAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('isRelatedBudgetAfter', {
                          initialValue: nextHead?.lineNext?.isRelatedBudgetMeaning
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.relatedtranstparty`).d('是否为关联交易方')}
                                 className={getFieldValue('isRelatedTraderBefore') !== getFieldValue('isRelatedTraderBeforeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('isRelatedTraderBeforeAfter', {
                          initialValue: nextHead?.lineNext?.isRelatedTraderMeaning
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.liabilityaccount`).d('负债账户')}
                                 className={getFieldValue('liabilityAccountBefore') !== getFieldValue('liabilityAccountAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('liabilityAccountAfter', {
                          initialValue: nextHead?.lineNext?.liabilityAccount
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.Invaildsupplier`).d('是否失效')}
                                 className={getFieldValue('enableValidBefore') !== getFieldValue('enableValidAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('enableValidAfter', {
                          initialValue: nextHead?.enableValidMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    {nextHead?.enableValid === 'Y' && <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.Invaildate`).d('失效日期')}
                                 className={getFieldValue('expireDateBefore') !== getFieldValue('expireDateAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('expireDateAfter', {
                          initialValue: nextHead?.expireDate,
                        })(<CusInput readOnly />)}
                      </Form.Item>
                    </Col>}
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supmodifystatus`).d('供应商修改状态')}
                                 className={getFieldValue('supModifyStateBefore') !== getFieldValue('supModifyStateAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supModifyStateAfter', {
                          initialValue: nextHead?.supModifyStateMeaning || 'Draft'
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.enableportal`).d('是否启用供应商门户')}
                                 className={getFieldValue('enableSupPortalBefore') !== getFieldValue('enableSupPortalAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('enableSupPortalAfter', {
                          initialValue: nextHead?.enableSupPortalMeaning || 'N',
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.status`).d('供应商状态')}
                                 className={getFieldValue('supplierStatusBefore') !== getFieldValue('supplierStatusAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierStatusAfter', {
                          initialValue: nextHead?.supplierStatusMeaning,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.status.update.date`).d('状态更新日期')}
                                 className={getFieldValue('statusUpdateTimeBefore') !== getFieldValue('statusUpdateTimeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('statusUpdateTimeAfter', {
                          initialValue: nextHead?.statusUpdateTime,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}
                                 className={getFieldValue('supplierVersionsBefore') !== getFieldValue('supplierVersionsAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierVersionsAfter', {
                          initialValue: nextHead?.supplierVersions,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.version.update.date`).d('版本更新日期')}
                                 className={getFieldValue('versionsUpdateTimeBefore') !== getFieldValue('versionsUpdateTimeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('versionsUpdateTimeAfter', {
                          initialValue: nextHead?.versionsUpdateTime,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item label={intl.get(`${prompt}.field.supplier.entry.date`).d('供应商准入日期')}
                                 className={getFieldValue('supplierAccessTimeBefore') !== getFieldValue('supplierAccessTimeAfter') ? `tips-input-text-color` : ''}
                      >
                        {getFieldDecorator('supplierAccessTimeAfter', {
                          initialValue: nextHead?.supplierAccessTime,
                        })(<CusInput readOnly/>)}
                      </Form.Item>
                    </Col>
                  </Col>
                </Row>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.contact.information.update`).d('变更联系人信息')}
                  arrowActive={activeKey.includes('contact')}
                />
              }
              key="contact"
            >
              <Row gutter={24}>
                <Col {...gridSpan} className="after-border">
                  <h5>{intl.get(`${prompt}.view.title.update.before`).d('变更前')}</h5>
                  <ContactTable {...previousContactsTableProps}/>
                </Col>
                <Col {...gridSpan}>
                  <h5>{intl.get(`${prompt}.view.title.update.after`).d('变更后')}</h5>
                  <ContactTable {...nextContactsTableProps}/>
                </Col>
              </Row>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.company.attachment.update`).d('变更公司附件')}
                  arrowActive={activeKey.includes('attachment')}
                />
              }
              key="attachment"
            >
              <Row gutter={24}>
                <Col {...gridSpan} className="after-border">
                  <h5>{intl.get(`${prompt}.view.title.update.before`).d('变更前')}</h5>
                  <ComparisonAttachmentTable {...previousAttachsTableProps}/>
                </Col>
                <Col {...gridSpan}>
                  <h5>{intl.get(`${prompt}.view.title.update.after`).d('变更后')}</h5>
                  <ComparisonAttachmentTable {...nextAttachsTableProps}/>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </PageWrapper>
      </div>
      </Fragment>
    )
  }
}
