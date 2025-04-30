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

import FeiShuInformation from './FeiShuInformation';
import FeiShuLine from './FeiShuLine';

const commonPrompt = 'spub.feiShuMsgConfig';

@connect(({ feiShuMsgConfig, loading }) => ({
  feiShuMsgConfig,
  feiShuMsgConfigheader: feiShuMsgConfig.feiShuMsgConfigheader,
  feiShuMsgConfigList: feiShuMsgConfig.feiShuMsgConfigList,
  detailLoading: loading.effects['feiShuMsgConfig/queryDetail'],
  saveLoading: loading.effects['feiShuMsgConfig/save'],
}))
@fastCodeLoader(['SPUB.FEI_SHU_TAG_CODE', 'SPUB.FEI_SHU_TEXT_VALUE_TYPE'])
@formatterCollections({ code: [commonPrompt] })
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { msgConfigId },
      },
      location: { pathname },
    } = props;
    this.state = {
      msgConfigId,
      isCreate: false,
      isPub: pathname.includes('/pub'),
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { msgConfigId },
      },
    } = this.props;
    if (msgConfigId === 'create') {
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
      type: 'feiShuMsgConfig/updateState',
      payload: {
        feiShuMsgConfigheader: {},
        feiShuMsgConfigList: [],
      },
    });
  }


  @Bind()
  queryDetail() {
    const { dispatch } = this.props;
    const { msgConfigId } = this.state;
    dispatch({
      type: 'feiShuMsgConfig/queryDetail',
      payload: {
        msgConfigId,
      },
    });
  }

  @Bind()
  handleSave() {
    const { dispatch, history, form, feiShuMsgConfigheader, feiShuMsgConfigList } = this.props;
    const { isCreate, isPub } = this.state;
    const validateResult = this.saveValidate();
    if (!validateResult) {
      return 0;
    };
    const headerValue = form.getFieldsValue();
    const feiShuMsgConfigDtlList = getTableDataNotValidate(feiShuMsgConfigList, ['msgConfigDtlId']);
    dispatch({
      type: 'feiShuMsgConfig/save',
      payload: {
        feiShuMsgConfig: {
          ...feiShuMsgConfigheader,
          ...headerValue,
        },
        feiShuMsgConfigDtlList,
      },
    }).then(res => {
      if (res) {
        const { feiShuMsgConfig: { msgConfigId } } = res || {};
        notification.success({
          message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
        });
        if (isCreate && msgConfigId !== feiShuMsgConfigheader.msgConfigId) {
          if (msgConfigId) {
            this.setState({
              isCreate: false,
              msgConfigId,
            });
            history.push({
              pathname: `${isPub ? '/pub' : ''}/spub/feishu-msg-config/detail/${msgConfigId}`
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
    const { feiShuMsgConfigList } = this.props;
    let validateResult = true;
    let errMessageList = [];
    for (const item of feiShuMsgConfigList) {
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
      detailLoading = false,
      saveLoading = false,
      feiShuMsgConfigheader,
    } = this.props;
    const { isPub, msgConfigId, isCreate } = this.state;

    const feiShuInformationProps = {
      form,
      feiShuMsgConfigheader,
    }

    const feiShuLineProps = {
      ...this.props,
      msgConfigId,
      isCreate,
    }

    return (
      <Fragment>
        <Header backPath={`${isPub ? '/pub' : ''}/spub/feishu-msg-config/list`}>
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
                key="feishu-header"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`${commonPrompt}.view.message.title.serversInfo`).d('飞书消息配置信息')}
                  </h3>
                }
              >
                <FeiShuInformation { ...feiShuInformationProps } />
              </Card>
              <Card
                key="feishu-line"
                bordered={false}
                className={DETAIL_CARD_TABLE_CLASSNAME}
                title={
                  <h3>
                    {intl.get(`${commonPrompt}.view.message.title.lineInfo`).d('飞书消息配置行信息')}
                  </h3>
                }
              >
                <FeiShuLine { ...feiShuLineProps } />
              </Card>
            </Spin>
          </LocaleProvider>
        </Content>
      </Fragment>
    )
  }
}
