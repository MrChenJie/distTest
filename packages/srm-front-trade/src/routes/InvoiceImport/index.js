/**
 * @Description: 应付发票导入记录列表页面
 * @date 2023-02-22
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import { Form, LocaleProvider } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentLanguage } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@connect(({ invoiceImport, loading }) => ({
  invoiceImport,
  loading: { query: loading.effects['invoiceImport/queryData'] },
}))
@formatterCollections({ code: ['spub.invoiceImport'] })
export default class InvoiceImport extends React.Component {
  constructor(props) {
    super(props);
    const {
      location: { pathname },
    } = props;

    this.state = {
      isPub: pathname.includes('/pub'),
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  @Debounce(200)
  @Bind()
  fetchList(page = {}) {
    const { dispatch, form } = this.props;
    const fieldValues = form.getFieldsValue();
    const { creationDateFrom, creationDateTo } = fieldValues;
    dispatch({
      type: 'invoiceImport/queryData',
      payload: {
        page,
        ...fieldValues,
        creationDateFrom: moment.isMoment(creationDateFrom) ? creationDateFrom.format(DEFAULT_DATETIME_FORMAT) : undefined,
        creationDateTo: moment.isMoment(creationDateTo) ? creationDateTo.format(DEFAULT_DATETIME_FORMAT) : undefined,
      },
    });
  }

  @Bind()
  handleDetail(record) {
    const { dispatch } = this.props;
    const { isPub } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/spub/invoice-import/detail/${record.invoiceImportId}`,
      })
    );
  }

  render() {
    const {
      form,
      idpValueMap = {},
      loading,
      invoiceImport: { dataSource, pagination },
    } = this.props;
    const filterProps = {
      form,
      idpValueMap,
      search: this.fetchList,
    };
    const listProps = {
      idpValueMap,
      pagination,
      dataSource,
      loading: loading.query,
      onChange: (page) => this.fetchList(page),
      onDetail: this.handleDetail,
    };

    return (
      <React.Fragment>
        <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
          <Content>
            <div className="table-list-search">
              <FilterForm {...filterProps} />
            </div>
            <ListTable {...listProps} />
          </Content>
        </LocaleProvider>
      </React.Fragment>
    )
  }
}
