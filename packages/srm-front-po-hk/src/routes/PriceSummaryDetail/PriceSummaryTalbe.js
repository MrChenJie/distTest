/**
 * Table - 期间新增结果展示
 * @date: 2023-9-12
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { tableScrollWidth } from 'utils/utils';
// import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
// import querystring from 'querystring';
import { numberRender, dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import Modal from './Modal'
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { Input } from 'antd';
import { Form } from 'hzero-ui';
import MaterialList from './materialList';
import searchIcon from '@/assets/searchIcon.svg';
import styles from './index.less';

const promptCode = 'HKPC.commom';

@formatterCollections({
  code: [promptCode],
})
export default class PriceSummaryTalbe extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      materialModel: false,
    };
  }

  onSearchBtnClick = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getMatList',
      payload: {
        refSupId: record.refSupId,
        refHeadId: record.refHeadId,
        rounds: record.rounds,
      }
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const newDataSource = content?.map((item) => ({
          ...item,
          _status: 'update',
        }));
        this.setState({
          materialModel: true,
          materialDataSource: newDataSource,
        })
      }
    })
  }

  handleSaveMaterial = () => {}

  handleMaterialCancel = () => {
    this.setState({
      materialModel: false
    })
  }

  render() {
    const {
      purchaseApplicationModel,
      state,
    } = this.props;

    const {
      priceSummaryList,
    } = purchaseApplicationModel;

    const {
      materialModel,
      materialDataSource = [],
      selectedRowKeys,
      selectedRows,
    } = this.state;

    const columns = [
      {
        dataIndex: 'supName',
        key: 'supName',
        ellipsis: true,
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 225,
        render: tooltipRender,
      },

      {
        dataIndex: 'priceOriginak',
        key: 'priceOriginak',
        ellipsis: true,
        title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）'),
        width: 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        dataIndex: 'currency',
        key: 'currency',
        ellipsis: true,
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'priceHkd',
        key: 'priceHkd',
        ellipsis: true,
        title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）'),
        width: 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'materialName',
        width: 200,
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`materialName`, {
                initialValue: record.materialName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
                    }),
                  },
                ],
              })(
                <Input
                  readOnly
                  suffix={
                    <>
                      <div className="cus-lov-clear" />
                      <div onClick={() => this.onSearchBtnClick(record)}>
                        <img
                          src={searchIcon}
                          alt="searchIcon"
                          style={{ cursor: 'pointer', color: '#666' }}
                        />
                      </div>
                    </>
                  }
                  className={styles['lov-input2']}
                  value={record?.materialName ? record?.materialName : null}
                  style={{ cursor: 'pointer', color: '#666' }}
                  onClick={() => {
                    this.onSearchBtnClick(record);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
    ]

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      fixed: true,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled:
          state === 'DONE' || state === 'REVOKE' || state === 'SENT' || record.isQuote === 'N', // 选择框的是否可选
      }),
    };

    const materialProps = {
      dataSource: materialDataSource,
      rowSelection,
      ...this.props,
    };

    const tableProps = {
      dataSource: priceSummaryList,
      columns,
      rowKey: 'rowKey',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
      <EditTable {...tableProps} />
      <CusModal
        title={intl.get(`${promptCode}.view.title.materialname`).d('物料名称')}
        visible={materialModel}
        width={800}
        destroyOnClose={true}
        onOk={this.handleSaveMaterial}
        onCancel={this.handleMaterialCancel}
      >
        <MaterialList {...materialProps} />
      </CusModal>
    </>;
  }
}