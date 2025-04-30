import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { createPagination } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import CusNotification from '_cus_components/CusNotification';
import CusSpin from '_cus_components/CusSpin';
import { cusDateFormat } from '_cus_utils/utils';

@Form.create()
@connect(({ resaleRfq, loading }) => ({
  resaleRfq,
  loading: loading.effects['resaleRfq/querySoRequiry'],
  exportLoading:
    loading.effects['resaleRfq/enquiryPriceExport'] ||
    loading.effects['resaleRfq/ictsEnquiryPriceExport'] ||
    loading.effects['resaleRfq/chinaDiaEnquiryPriceExport'],
}))
export default class CustomerQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page) {
    const { form, dispatch } = this.props;
    const fieldsValue = form.getFieldsValue();
    const { createDateFrom, createDateTo } = fieldsValue;
    const params = {
      ...fieldsValue,
      createDateFrom: cusDateFormat(createDateFrom, 'YYYY-MM-DD'),
      createDateTo: cusDateFormat(createDateTo, 'YYYY-MM-DD'),
    };
    dispatch({
      type: 'resaleRfq/querySoRequiry',
      payload: {
        page,
        ...params,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, rowKey: uuidv4() })),
          pagination: createPagination(res),
        });

        if (this.table) {
          this.table.setState({
            isShowFlag: false,
          });
        }
      }
    });
  }

  /**
   * 转义值集
   * @param {*} list - 值集列表
   * @param {*} value - 值
   */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find(
      (e) => e.value === (['6600200001', '6600200003'].includes(value) ? '6600202' : value)
    );
    if (item) {
      return item.description;
    }
  }

  @Bind()
  handleExport(data = []) {
    const { dispatch, idpValueMap = {}, form } = this.props;
    const fileName = intl.get(`ssrc.resaleRfq.view.title.exportExecl`).d('批量创建询价单导入模板');
    const downloadFile = (description) => {
      if (!description) {
        CusNotification.error({
          message: intl.get(`ssrc.resaleRfq.view.warning.needProductType`).d('匹配不到对应的模板'),
        });
        return 0;
      }
      dispatch({
        type:
          description === 'SP_RFP_TEMPLATE'
            ? 'resaleRfq/enquiryPriceExport'
            : description === 'SP_RFP_ICTS_TEMPLATE'
            ? 'resaleRfq/ictsEnquiryPriceExport'
            : 'resaleRfq/chinaDiaEnquiryPriceExport',
        payload: data.map((item) => ({
          ...item,
          productType: ['6600200001', '6600200003'].includes(item.productType)
            ? '6600202'
            : item.productType,
        })),
      }).then((res) => {
        if (res) {
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          if ('msSaveOrOpenBlob' in navigator) {
            // 使用ie下载
            navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
            return false;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.xlsx`;
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      });
    };
    if (!isEmpty(data)) {
      const dataProductTypeList = data.map((item) => {
        return this.getFastCode(idpValueMap['RS_IBOSS_PRODUCT_TYPE_ISP_RFP'], item.productType);
      });
      const description = dataProductTypeList[0];
      if (dataProductTypeList.every((item) => item === description)) {
        downloadFile(description);
      } else {
        CusNotification.error({
          message: intl
            .get(`ssrc.resaleRfq.view.warning.selectSameRfq`)
            .d('请选择相同类型的意向单'),
        });
      }
    } else {
      form.validateFieldsAndScroll((errors, values) => {
        if (!errors) {
          const description = this.getFastCode(
            idpValueMap['RS_IBOSS_PRODUCT_TYPE_ISP_RFP'],
            values.productType
          );
          downloadFile(description);
        }
      });
    }
  }

  @Bind()
  handleShowAllSelect(data = [], callback = (e) => e) {
    this.setState({
      dataSource: data,
      pagination: createPagination(data),
    });
    callback();
  }

  render() {
    const {
      form,
      loading,
      onCancel = (e) => e,
      exportLoading = false,
      idpValueMap = {},
    } = this.props;
    const { dataSource, pagination } = this.state;
    const filterFormProps = {
      idpValueMap,
      form,
      onSearch: this.handleSearch,
    };
    const listTableProps = {
      form,
      loading,
      exportLoading,
      dataSource,
      pagination,
      onCancel,
      onSearch: this.handleSearch,
      onExport: this.handleExport,
      onShowAllSelect: this.handleShowAllSelect,
      onShowPage: (page = {}) => {
        this.setState({
          pagination: createPagination(page),
        });
      },
      onRef: (ref) => {
        this.table = ref;
      },
    };

    return (
      <CusSpin spinning={loading || exportLoading}>
        <FilterForm {...filterFormProps} />
        <ListTable {...listTableProps} />
      </CusSpin>
    );
  }
}
