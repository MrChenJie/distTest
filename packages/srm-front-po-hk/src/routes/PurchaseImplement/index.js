/**
 * index.js - 手工对冲查询页面
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import PurchaseImplementFrom from "./Form"
// import PurchaseImplementResults from "./Results"
// import { Form, Row, Col, Input } from 'antd';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import intl from 'utils/intl';
// import uuidv4 from 'uuid/v4';
// import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
// import { createPagination } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
// import CusModal from '_cus_components/CusModal';
// import CusNotification from '_cus_components/CusNotification';
// import CusMultiLov from '_cus_components/CusMultiLov';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
// import { Form, Spin, Tabs } from 'hzero-ui';
import { Tabs } from 'antd';
import styles from './index.less';
import { fastCodeLoader } from '@/utils/decorators';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { tableScrollWidth } from 'utils/utils';
import { Form } from 'hzero-ui';


const commonPrompt = 'sslm.standardEvaluate';
const { Panel } = Collapse;
@formatterCollections({
  code: [
    'srsp.collectiondisplay',
  ],
})

@Form.create()

@fastCodeLoader([
  "HKPC.PESTAUS",
  "HKPC.PRTYPE"
])

@connect(({ loading = {}, evaluationList = {}, purchaseEmplementModel = {} }) => ({
  evaluationList,
  purchaseEmplementModel
}))

export default class PurchaseImplement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {}, // 查询条件
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'table'],
      cachTabKey: 'null',
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseEmplementModel/init',
    });
  }

  // 查询条件格式化
  @Bind()
  formatValues() {
    const values = this.baseForm.current?.getFieldsValue(true);
    const { startDate, endDate } = values || {};
    console.log(values);
    return {
      ...values,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined,
    };
  }

  /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    // const { onClick = (e) => e } = this.props;
    this.setState({ cachTabKey: key });
    // onClick(key);
  }

  render() {
    const { evaluationList, idpValueMap,form } = this.props
    const {supperlierSouce=[],supperlierPagination={}} = evaluationList
    const { activeKey,cachTabKey } = this.state
    const PurchaseImplementResultsProps = {
      evaluationList,

    }

    const FormProps = {
      onRef: (ref) => {
        this.baseForm = ref.baseForm
      },
      idpValueMap,
      form
    }

    const dataSource = [{
      supplierNumber:'1',
      companyNameEN:'测试赛1024',
      companyNameCN:'标包名称'
    }]

    const rowSelection = {
      type:"checkbox",
      columnWidth: 50,
    };

    const columns = [
      {
          dataIndex: 'supplierNumber',
          key: 'supplierNumber',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PPnumber`).d('采购方案编号')
          ),
          width: 225,
          render: tooltipRender,
        },
      {
          dataIndex: 'companyNameEN',
          key: 'companyNameEN',
          ellipsis: true,
          editable: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PPnumber`).d('采购方案名称')
          ),
          width: 120,
          render: tooltipRender,
        },
        {
          dataIndex: 'companyNameCN',
          key: 'companyNameCN',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PackageNo`).d('标包编号')
          ),
          width: 120,
          render: tooltipRender,
        },
        {
          dataIndex: 'resonForInclusion',
          key: 'resonForInclusion',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PackageName`).d('标包名称')
          ),
          width: 120,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PEStatus`).d('采购实施状态')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.procurementhandler`).d('采购经办人')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.applicant`).d('申请人')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.aapplyingdepartment`).d('申请部门')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.pprcurrency`).d('申请币种')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.total.budget.amount.original.currency`).d('预算总金额(原币)')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.eettimatedbudgetamountH`).d('预算总金额(HKD)')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.prrate`).d('申请汇率')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PPSubmitDate`).d('采购方案提交日期')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.PPApprovedDate`).d('采购方案审批日期')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.ProcurementMethod`).d('采购方式')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.handoverhandler`).d('交接经办人')
          ),
          width: 225,
          render: tooltipRender,
        },
        {
          dataIndex: 'supplierEntryDate',
          key: 'supplierEntryDate',
          ellipsis: true,
          title: tooltipRender(
            intl.get(`HKPC.commom.view.title.operate`).d('操作')
          ),
          width: 225,
          render: tooltipRender,
        },
      
  ]

    const tableProps = {
      dataSource: dataSource,
      columns,
      pagination: supperlierPagination,
      rowKey: 'key',
      rowSelection: rowSelection,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return (
      <PageWrapper>
        <Collapse className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}>
          <Panel
            key="form"
            showArrow={false}
            header={
              <PanelHeader
                arrowActive={activeKey.includes('form')}
                title={intl.get(`hzero.common.view.title.Search`).d('查询')}
              />
            }
          >
            <PurchaseImplementFrom  {...FormProps} />
          </Panel>

          <Panel
            key="table"
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                className="isButton"
                showArrow={false}
                title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
                buttons={
                  <>
                    <CusLov
                      style={{ height: '32px', padding: '0px 8px' }}
                      isButton
                      code=''
                    // queryParams={{ tenantId }}
                    // lovOptions={{ displayField: '', valueField: '' }}
                    // onChange={}
                    // disabled={selectedRowKeys.length === 0 || queryListLoading}
                    >
                      {intl.get('HKPC.commom.view.button.handover').d('项目交接')}
                    </CusLov>
                    <CusExcelExport
                      // requestUrl={`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-evaluates/exportSupplierEvaluate`}
                      queryParams={this.formatValues}
                      type='mini'
                      downloadType="Blob"
                      // 等标准出来再修改！！
                      fileName={intl
                        .get(`${commonPrompt}.view.export.standardEvaluate`)
                        .d('标准产品供应商后评估导出数据')}
                      otherButtonProps={{
                        // icon: null,
                        // mini: true,
                        // type: "primary"
                      }}
                      buttonText={intl.get('HKPC.commom.view.button.export').d('导出')}
                    />
                  </>
                }
              />
            }>

            {/* <Spin > */}
            {/* <Tabs className={styles['tabStyle']} tabBarStyle={{ borderBottom: 'unset' }} animated={false}>
              <Tabs.TabPane
                tab={intl.get('HKPC.commom.view.button.total').d('总项目数量')}
                key="message"
              >
                <PurchaseImplementResults {...PurchaseImplementResultsProps}></PurchaseImplementResults>
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('HKPC.commom.view.button.ongoing').d('进行中')}
                key="notice"
              >
                222
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('HKPC.commom.view.button.Completed').d('已完成')}
                key="announce"
              >
                333
              </Tabs.TabPane>
            </Tabs> */}
            {/* </Spin> */}

            <CusSearchTabs
              activeKey={cachTabKey}
              items={[
                {
                  label: intl.get(`HKPC.commom.view.button.total`).d('总项目数量'),
                  key: 'null',
                  children: <CusTable {...tableProps}/>,
                },
                {
                  label: intl.get(`HKPC.commom.view.button.ongoing`).d('进行中'),
                  key: 'in_process',
                  children: <CusTable  {...tableProps}/>,
                },
                {
                  label: intl.get(`HKPC.commom.view.button.Completed`).d('已完成'),
                  key: 'completed',
                  children: <CusTable   {...tableProps}/>,
                },
              ]}
              onChange={this.changeTabs}
          />
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}