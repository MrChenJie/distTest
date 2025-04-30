import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { DATETIME_MIN } from 'utils/constants';

import CreateModalForm from './CreateModalForm';

@connect(({ contractMaintain, loading }) => ({
  contractMaintain,
  loading: loading.effects['contractMaintain/fetchAddPurchaseOrder'],
}))
export default class CreateModal extends Component {
  state = {
    selectedRowKeys: [],
    selectedRows: [],
  };

  componentDidMount() {
    const {
      contractMaintain: { addPoPagination = {} },
    } = this.props;
    this.handleSearchAddPurchaseOrder(addPoPagination);
  }

  @Bind()
  handleSearchAddPurchaseOrder(page = {}) {
    const { dispatch, resultId, supplierCompanyId } = this.props;
    const filterValues = this.filterForm ? this.filterForm.getFieldsValue() : {};
    const dateFormat = this.handleFormQuery(filterValues, [
      'erpCreationDateStart',
      'erpCreationDateEnd',
    ]);
    dispatch({
      type: 'contractMaintain/fetchAddPurchaseOrder',
      payload: {
        page,
        resultId,
        supplierCompanyId,
        ...dateFormat,
      },
    });
  }

  /**
   * 格式化时间
   */
  @Bind()
  handleFormQuery(filterValues, timeArray) {
    const dealTime = {};
    timeArray.forEach(item => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  render() {
    const {
      loading,
      visible,
      onCancel,
      onAddPurchaseOrder,
      contractMaintain: { addPoList = [], addPoPagination = {} },
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const columns = [
      {
        title: intl.get(`sodr.sendOrder.model.common.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 170,
      },
      {
        title: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
      },
      // {
      //   title: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
      //   dataIndex: 'occupationQuantity',
      //   width: 100,
      // },
      // {
      //   title: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
      //   dataIndex: 'availableQuantity',
      //   width: 120,
      // },
      {
        title: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.noTaxPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.noTaxAmount`).d('不含税金额'),
        dataIndex: 'lineAmount',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.TaxPrice`).d('含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.TaxAmount`).d('含税金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 100,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 100,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'erpCreatedName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'erpCreationDate',
        width: 150,
      },
      // {
      //   title: intl.get(`spcm.common.model.common.orderNumOrLine`).d('采购订单号|行号'),
      //   dataIndex: 'prLineNum',
      //   width: 150,
      //   render: (_, record) =>
      //     record.displayPoNum ? `${record.displayPoNum} | ${record.displayLineNum}` : '',
      // },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 100,
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
    };
    const scrollX = tableScrollWidth(columns);

    const createModalForm = {
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.handleSearchAddPurchaseOrder,
    };
    return (
      <Modal
        destroyOnClose
        title={intl.get(`spcm.contractSubject.view.message.addSubjectLines`).d('新增标的行')}
        width={1100}
        visible={visible}
        onCancel={onCancel}
        footer={
          <Button
            type="primary"
            disabled={isEmpty(selectedRowKeys)}
            onClick={() => {
              onAddPurchaseOrder(selectedRows);
              onCancel();
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        }
      >
        <CreateModalForm {...createModalForm} />
        <Table
          bordered
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={addPoList}
          pagination={addPoPagination}
          scroll={{ x: scrollX }}
          rowSelection={rowSelection}
          onChange={this.handleSearchAddPurchaseOrder}
        />
      </Modal>
    );
  }
}
