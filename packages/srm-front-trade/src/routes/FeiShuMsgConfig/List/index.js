/**
 * @Description: 飞书消息配置列表页面
 * @date 2023-02-09
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Form, LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import { getCurrentLanguage } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@connect(({ feiShuMsgConfig, loading }) => ({
  feiShuMsgConfig,
  loading: { query: loading.effects['feiShuMsgConfig/queryData'] },
}))
@fastCodeLoader(['SPFM.YES_NO'])
@formatterCollections({ code: ['spub.feiShuMsgConfig'] })
export default class FeiShuMsgConfig extends React.Component {
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

  @Bind()
  fetchList(page = {}) {
    const { dispatch, form } = this.props;
    const fieldValues = form.getFieldsValue();
    dispatch({
      type: 'feiShuMsgConfig/queryData',
      payload: {
        page,
        ...fieldValues,
      },
    });
  }

  @Bind()
  handleAdd() {
    const { dispatch } = this.props;
    const { isPub } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/spub/feishu-msg-config/detail/create`,
      })
    );
  }


  @Bind()
  handleEdit(record) {
    const { dispatch } = this.props;
    const { isPub } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/spub/feishu-msg-config/detail/${record.msgConfigId}`,
      })
    );
  }


  render() {
    const {
      form,
      idpValueMap = {},
      loading,
      feiShuMsgConfig: { dataSource, pagination },
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
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
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
