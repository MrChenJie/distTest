import React, { PureComponent, Fragment } from 'react';
import { Button, Card, Form, LocaleProvider, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import { getCurrentLanguage } from 'utils/utils';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
} from 'utils/constants';
import { getTableDataNotValidate } from '@/utils/utils';

import WhiteListInformation from './WhiteListInformation';
import WhiteListLine from './WhiteListLine';

const commonPrompt = 'spub.whiteListConfig';

@connect(({ whiteListConfig, loading }) => ({
  whiteListConfig,
  whiteListConfigheader: whiteListConfig.whiteListConfigheader,
  whiteListConfigList: whiteListConfig.whiteListConfigList,
  detailLoading: loading.effects['whiteListConfig/queryDetail'],
  saveLoading: loading.effects['whiteListConfig/save'],
}))
@fastCodeLoader([
  'HPFM.FLAG',
  'SPUB.WHITE_INTERFACE_TYPE',
])
@formatterCollections({ code: [commonPrompt] })
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { whiteListConfigId },
      },
      location: { pathname },
    } = props;
    this.state = {
      whiteListConfigId,
      isCreate: false,
      isPub: pathname.includes('/pub'),
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { whiteListConfigId },
      },
    } = this.props;
    if (whiteListConfigId === 'create') {
      this.setState({
        isCreate: true,
      });
      return 0;
    }
    this.queryDetail();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'whiteListConfig/updateState',
      payload: {
        whiteListConfigheader: {},
        whiteListConfigList: [],
      },
    });
  }


  @Bind()
  queryDetail() {
    const { dispatch } = this.props;
    const { whiteListConfigId } = this.state;
    dispatch({
      type: 'whiteListConfig/queryDetail',
      payload: {
        whiteListConfigId,
      },
    });
  }

  @Bind()
  handleSave() {
    const { dispatch, history, form, whiteListConfigheader, whiteListConfigList } = this.props;
    const { isCreate, isPub } = this.state;
    const validateResult = this.saveValidate();
    if (!validateResult) {
      return 0;
    };
    const headerValue = form.getFieldsValue();
    const whiteListDetailList = getTableDataNotValidate(whiteListConfigList, ['detailId']);
    const payload = {
      whiteListConfig: {
        ...whiteListConfigheader,
        ...headerValue,
      },
      whiteListDetailList,
    }
    dispatch({
      type: 'whiteListConfig/save',
      payload,
    }).then(res => {
      if (res) {
        const { whiteListConfig: { whiteListConfigId } } = res || {};
        notification.success({
          message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
        });
        if (isCreate && whiteListConfigId !== whiteListConfigheader.whiteListConfigId) {
          if (whiteListConfigId) {
            this.setState({
              isCreate: false,
              whiteListConfigId,
            });
            history.push({
              pathname: `${isPub ? '/pub' : ''}/spub/white-list-config/detail/${whiteListConfigId}`
            });
            this.queryDetail();
            return 0;
          }
        }
        this.queryDetail();
      }
    })
  }

  saveValidate = () => {
    const { form, whiteListConfigList } = this.props;
    let validateResult = true;
    let errMessageList = [];
    form.validateFieldsAndScroll((err) => {
      if (err) {
        for (let child in err) {
          errMessageList.push(err[child].errors[0].message);
        }
        validateResult = false;
      }
    })
    for (const item of whiteListConfigList) {
      if (item.$form) {
        // eslint-disable-next-line no-loop-func
        item.$form.validateFieldsAndScroll((err) => {
          if (err) {
            for (let child in err) {
              errMessageList.push(err[child].errors[0].message);
            }
            validateResult = false;
          }
        });
      }
    }

    if (!validateResult) {
      const description = (
        <div>
          {errMessageList.map((item) => (
            <p>{item}</p>
          ))}
        </div>
      );
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: description,
      });
      return validateResult;
    } else {
      return validateResult;
    }
  }

  render() {
    const {
      form,
      idpValueMap = {},
      detailLoading = false,
      saveLoading = false,
      whiteListConfigheader,
    } = this.props;
    const { isPub, whiteListConfigId, isCreate } = this.state;

    const whiteListInformationProps = {
      form,
      idpValueMap,
      whiteListConfigheader,
    }

    const whiteListLineProps = {
      ...this.props,
      whiteListConfigId,
      isCreate,
    }

    return (
      <Fragment>
        <Header backPath={`${isPub ? '/pub' : ''}/spub/white-list-config/list`}>
          <Button
            onClick={this.handleSave}
            type="primary"
            icon="save"
            loading={saveLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <Spin spinning={detailLoading || saveLoading}>
              <Card
                key="white-list-header"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`${commonPrompt}.view.message.title.basicInfo`).d('基础信息')}
                  </h3>
                }
              >
                <WhiteListInformation { ...whiteListInformationProps } />
              </Card>
              <Card
                key="white-list-line"
                bordered={false}
                className={DETAIL_CARD_TABLE_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`${commonPrompt}.view.message.title.lineInfo`).d('配置行明细')}
                  </h3>
                }
              >
                <WhiteListLine { ...whiteListLineProps } />
              </Card>
            </Spin>
          </LocaleProvider>
        </Content>
      </Fragment>
    )
  }
}
