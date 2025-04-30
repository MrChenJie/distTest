/**
 * Results - 采购实施
 * @date: 2023-9-27
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
// import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { tableScrollWidth } from 'utils/utils';
// import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
// import querystring from 'querystring';
// import { numberRender, dateRender } from 'utils/renderer';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';

export default class PurchaseImplementResults extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
          selectedRowKeys: [],
          selectedRows: [],
        };
      }

      render() {
        const {
          evaluationList
          } = this.props
          const {supperlierSouce=[],supperlierPagination={}} = evaluationList
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
        
        console.log('evaluationList',evaluationList);
        const rowSelection = {
          type:"checkbox",
          columnWidth: 50,
        };
        const tableProps = {
            dataSource: supperlierSouce,
            columns,
            pagination: supperlierPagination,
            rowKey: 'key',
            rowSelection: rowSelection,
            scroll: { x: tableScrollWidth(columns) }, // y: 480
          };
          return <CusTable {...tableProps}/>;
      }
}