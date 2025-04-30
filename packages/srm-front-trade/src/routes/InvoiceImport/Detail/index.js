import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Card, LocaleProvider, Spin } from 'hzero-ui';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentLanguage } from 'utils/utils';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
} from 'utils/constants';

import BasicInfo from './BasicInfo';
import ErrorDetail from './ErrorDetail';

const commonPrompt = 'spub.invoiceImport';

@connect(({ invoiceImport, loading }) => ({
  invoiceImport,
  invoiceImportBasic: invoiceImport.invoiceImportBasic,
  invoiceErrorList: invoiceImport.invoiceErrorList,
  detailLoading: loading.effects['invoiceImport/queryDetail'],
}))
@formatterCollections({ code: [commonPrompt] })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { invoiceImportId },
      },
      location: { pathname },
    } = props;
    this.state = {
      invoiceImportId,
      isPub: pathname.includes('/pub'),
    };
  }

  componentDidMount() {
    this.queryDetail();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceImport/updateState',
      payload: {
        invoiceImportBasic: {},
        invoiceErrorList: [],
      },
    });
  }


  @Bind()
  queryDetail() {
    const { dispatch } = this.props;
    const { invoiceImportId } = this.state;
    dispatch({
      type: 'invoiceImport/queryDetail',
      payload: {
        invoiceImportId,
      },
    });
  }

  render() {
    const {
      detailLoading = false,
      invoiceImportBasic,
      invoiceErrorList,
    } = this.props;
    const { isPub, invoiceImportId } = this.state;

    const basicProps = {
      invoiceImportBasic,
    }

    const errorDetailProps = {
      invoiceErrorList,
      invoiceImportId,
    }

    return (
      <Fragment>
        <Header backPath={`${isPub ? '/pub' : ''}/spub/invoice-import/list`} />
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <Spin spinning={detailLoading}>
              <Card
                key="basic"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`${commonPrompt}.view.message.title.basic`).d('基础信息')}
                  </h3>
                }
              >
                <BasicInfo { ...basicProps } />
              </Card>
              <Card
                key="error-detail"
                bordered={false}
                className={DETAIL_CARD_TABLE_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`${commonPrompt}.view.message.title.errorDetail`).d('错误明细')}
                  </h3>
                }
              >
                <ErrorDetail { ...errorDetailProps } />
              </Card>
            </Spin>
          </LocaleProvider>
        </Content>
      </Fragment>
    )
  }
}
