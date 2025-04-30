/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2024-04-08 17:23:10
 */
import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse, Form, Row, Card, DatePicker } from 'antd';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { numberRender } from 'utils/renderer';
import { getCurrentLanguage } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import DataTable from './DataTable';
import Echarts1 from './echarts1';
import Echarts2 from './echarts2';
import Echarts3 from './echarts3';
import Echarts4 from './echarts4';
import styles from '../index.less';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
  fetchLoading:
    loading.effects['purchaseApplicationModel/queryProcurementReportList'] ||
    loading.effects['purchaseApplicationModel/getMountCountList'] ||
    loading.effects['purchaseApplicationModel/getCompanyAmountList'] ||
    loading.effects['purchaseApplicationModel/getSupplierAmountList'] ||
    loading.effects['purchaseApplicationModel/getWayAmountList'] ||
    loading.effects['purchaseApplicationModel/getSaveAmountList'],
}))
@fastCodeLoader(['HKPC.PROCUREMENTMETHOD'])
export default class procurementReport extends React.Component {
  modalForm = React.createRef();
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      idList: [],
      yearTime: dayjs(new Date()),
      wayAmount: [
        {
          nameOfCh: '公开询价',
          nameOfEn: 'publicinquiry',
          code: 'public_inquiry',
        },
        {
          nameOfCh: '邀请招标',
          nameOfEn: 'invitedtender',
          code: 'invited_bidding',
        },
        {
          nameOfCh: '内部采购',
          nameOfEn: 'internalprocurement',
          code: 'internal_source',
        },
        {
          nameOfCh: '单一来源',
          nameOfEn: 'singlesourcenegotiation',
          code: 'single_source',
        },
        {
          nameOfCh: '直接谈判',
          nameOfEn: 'directnegotiation',
          code: 'direct_negotiation',
        },
        {
          nameOfCh: '公开招标',
          nameOfEn: 'opentender',
          code: 'public_bidding',
        },
        {
          nameOfCh: '邀请询价',
          nameOfEn: 'invitatoryinquiry',
          code: 'invitation_inquiry',
        },
        {
          nameOfCh: '简易询价',
          nameOfEn: 'simpleinquiry',
          code: '简易询价',
        },
      ],
      monthData: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.getMountCountList();
    this.getCompanyAmountList();
    this.getSupplierAmountList();
    this.getWayAmountList();
    this.getSaveAmountList();
  }

  // 查询采购报表列表数据
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/queryProcurementReportList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if (res) {
        if (this.table) {
          const { clearState = (e) => e } = this.table;
          clearState();
        }
      }
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.form?.current?.getFieldsValue();
    const { procurementPlanApprovalDate, poDate } = fieldsValue || {};
    return {
      ...fieldsValue,
      procurementPlanApprovalDate: dayjs.isDayjs(procurementPlanApprovalDate)
        ? procurementPlanApprovalDate.format('YYYY-MM-DD')
        : undefined,
      poDate: dayjs.isDayjs(poDate) ? poDate.format('YYYY-MM-DD') : undefined,
    };
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    let idList = [];
    data.map((item) => {
      idList.push(item.id);
    });
    const { dispatch } = this.props;
    const deleteFlag = data.every((item) => item.prStatus === 'PENDING_REFER');
    if (data.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'purchaseApplicationModel/delPurchaseApplicationList',
            payload: { id: idList },
          }).then((res) => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl
          .get(`${promptCode}.view.message.onlyDeleteNEW`)
          .d('只能删除状态为"草稿"的单据。'),
      });
    }
  }

  @Bind()
  getSelectedRows(idListValue) {
    this.setState({
      idList: idListValue,
    });
  }

  // 获取采购统计数量
  getMountCountList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getMountCountList',
      payload: {
        year: dayjs(this.modalForm.current.getFieldsValue().yearTime).year(),
      },
    }).then((res) => {
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          mountCountList: res,
        },
      });
    });
  };

  // 获取部门统计采购金额
  getCompanyAmountList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getCompanyAmountList',
      payload: {
        year: dayjs(this.modalForm.current.getFieldsValue().yearTime).year(),
      },
    }).then((res) => {
      let nameData = [];
      let valueData = [];
      res.map((item) => {
        nameData.push(item.applyUserDepName);
        valueData.push(item.totalAmount);
      });
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          companyAmountList: { nameData, valueData },
        },
      });
    });
  };

  // 获取供应商统计采购金额
  getSupplierAmountList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getSupplierAmountList',
      payload: {
        year: dayjs(this.modalForm.current.getFieldsValue().yearTime).year(),
      },
    }).then((res) => {
      let nameData = [];
      let valueData = [];
      res.map((item) => {
        nameData.push(item.supName);
        valueData.push(item.totalAmount);
      });
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          supplierAmountList: { nameData, valueData },
        },
      });
    });
  };

  // 获取采购方式统计采购金额
  getWayAmountList = () => {
    const { dispatch } = this.props;
    const { wayAmount } = this.state;
    dispatch({
      type: 'purchaseApplicationModel/getWayAmountList',
      payload: {
        year: dayjs(this.modalForm.current.getFieldsValue().yearTime).year(),
      },
    }).then((res) => {
      let data = [];
      wayAmount.map((item) => {
        let obj = {};
        if (getCurrentLanguage() === 'zh_CN') {
          obj.name = item.nameOfCh;
        } else {
          obj.name = item.nameOfEn;
        }
        const index = res.findIndex((e) => item.code === e.purchaseMethod);
        if (index !== -1) {
          obj.value = res[index].totalAmount;
        } else {
          obj.value = 0;
        }
        data.push(obj);
      });
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          wayAmountList: data,
        },
      });
    });
  };

  // 获取节省金额采购金额
  getSaveAmountList = () => {
    const { dispatch } = this.props;
    const { monthData } = this.state;
    dispatch({
      type: 'purchaseApplicationModel/getSaveAmountList',
      payload: {
        year: dayjs(this.modalForm.current.getFieldsValue().yearTime).year(),
      },
    }).then((res) => {
      let nameData = monthData;
      let valueData = [];
      monthData.map((item) => {
        const index = res.findIndex((e) => item === e.month);
        if (index !== -1) {
          valueData.push(res[index].saveAmount);
        } else {
          valueData.push(0);
        }
      });
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          saveAmountList: { nameData, valueData },
        },
      });
    });
  };

  // 改变年份
  onChangeYear = (e) => {
    this.getMountCountList();
    this.getCompanyAmountList();
    this.getSupplierAmountList();
    this.getWayAmountList();
    this.getSaveAmountList();
  };

  // 跳转查询页面
  handleOpenSeachPage = () => {
    const { isPub } = this.state;
    const { history } = this.props;
    history.push(`${isPub ? '/pub' : ''}/ssrc-hk/procurementReport/table`);
  };

  render() {
    const {
      dispatch,
      idpValueMap = {},
      fetchLoading = false,
      purchaseApplicationModel,
    } = this.props;
    const { isPub, yearTime } = this.state;
    const tableProps = {
      isPub,
      idpValueMap: idpValueMap['HKPC.PRTYPE'],
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      getQueryParams: this.getQueryParams,
      purchaseApplicationModel,
      dispatch,
    };

    const echartsOneProps = {
      purchaseApplicationModel,
    };
    const echartsTwoProps = {
      purchaseApplicationModel,
    };
    const echartsThreeProps = {
      purchaseApplicationModel,
    };
    const echartsFourProps = {
      purchaseApplicationModel,
    };

    const { mountCountList } = purchaseApplicationModel;

    return (
      <>
        <PageWrapper loading={fetchLoading}>
          <Card
            title={intl
              .get(`${promptCode}.view.title.purchasingreportstatistics`)
              .d('采购统计报表')}
            className={styles['title']}
            extra={
              <Form
                ref={this.modalForm}
                initialValues={{
                  yearTime: yearTime,
                }}
              >
                <Form.Item name="yearTime">
                  <DatePicker
                    format="YYYY"
                    disabledDate={(currentDate) =>
                      dayjs(yearTime).year() < dayjs(currentDate).year()
                    }
                    onChange={this.onChangeYear}
                    picker="year"
                  />
                </Form.Item>
              </Form>
            }
          >
            <Row gutter={20}>
              <Col span={8}>
                <Card>
                  <div className={styles['flex-box']}>
                    <div>
                      {intl.get(`${promptCode}.view.title.totalpurchaseamount`).d('采购总金额')}
                    </div>
                    <div style={{ fontSize: '20px' }}>
                      {numberRender(mountCountList.totalAmount ? mountCountList.totalAmount : 0, 2)}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div className={styles['flex-box']}>
                    <div>{intl.get(`${promptCode}.view.title.totalsavings`).d('节省总金额')}</div>
                    <div style={{ fontSize: '20px' }}>
                      {numberRender(mountCountList.saveAmount ? mountCountList.saveAmount : 0, 2)}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div className={styles['flex-box']}>
                    <div>
                      {intl.get(`${promptCode}.view.title.totalnumberofpr`).d('采购申请总数量')}
                    </div>
                    <div style={{ fontSize: '20px' }}>
                      {mountCountList.totalQuantity ? mountCountList.totalQuantity : 0}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
          <Row gutter={20} style={{ marginTop: '16px' }}>
            <Col>
              <Card
                title={intl
                  .get(`${promptCode}.view.title.statisticsofdepartment`)
                  .d('按部门统计采购金额')}
                className={styles['title']}
              >
                <Echarts1 {...echartsOneProps}></Echarts1>
              </Card>
            </Col>
          </Row>
          <Row gutter={20} style={{ marginTop: '16px', marginBottom: '16px' }}>
            <Col span={8}>
              <Card
                title={intl
                  .get(`${promptCode}.view.title.purchaseamountbysup`)
                  .d('按供应商统计采购金额（前十）')}
                className={styles['title']}
              >
                <Echarts2 {...echartsTwoProps}></Echarts2>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={intl
                  .get(`${promptCode}.view.title.purchaseamountbymethod`)
                  .d('按采购方式统计采购金额')}
                className={styles['title']}
              >
                <Echarts3 {...echartsThreeProps}></Echarts3>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={intl
                  .get(`${promptCode}.view.title.statisticsofsavings`)
                  .d('统计采购节省金额')}
                className={styles['title']}
              >
                <Echarts4 {...echartsFourProps}></Echarts4>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card
                title={intl.get(`${promptCode}.view.title.latestdetailed`).d('最新明细数据(十条)')}
                className={styles['title']}
                extra={
                  <CusButton onClick={this.handleOpenSeachPage}>
                    {intl.get(`${promptCode}.view.button.more`).d('更多')}
                  </CusButton>
                }
              >
                <DataTable getSelectedRows={this.getSelectedRows.bind(this)} {...tableProps} />
              </Card>
            </Col>
          </Row>
        </PageWrapper>
      </>
    );
  }
}
