/**
 * @Description: 基本信息
 * @date 2022-5-6
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment, Component } from 'react';
import { Bind } from 'lodash-decorators';
import style from './index.less';
import { numberRender } from 'utils/renderer';

class priceHeaderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.init();
  }

  @Bind
  init() {
  }

  render() {
    const {
      poHeaderInfo,
    } = this.props;

    return (
      <>
        <div className={style['priceAssistant-header-info']}>
          <div className={style['info-wrapper']}>
            <div className={style['info-item-top']}>
              {intl
                .get(`bid.bidcommon.view.title.maximumtotalprice`)
                .d('最高报价总价')}
              :
              <span className={style['info-item-price']}>{numberRender(poHeaderInfo.highestQuotation, 2)}</span>
              {intl.get('bid.bidcommon.view.title.yuanyuan').d('元')}
            </div>
            <div className={style['info-item-bottom']}>
              {intl
                .get(`bid.bidcommon.view.title.highestquotationtotalpricesupplier`)
                .d('最高报价供应商')}
              :
              <span className={style['info-item-supplier']}>
                {poHeaderInfo.highestSupplierName}
              </span>
            </div>
          </div>
          <div className={style['info-wrapper']}>
            <div className={style['info-item-top']}>
              {intl
                .get(`bid.bidcommon.view.title.diestquatation`)
                .d('最低报价总价')}
              :
              <span className={style['info-item-price']}>{numberRender(poHeaderInfo.lowestQuotation, 2)}</span>
              {intl.get('bid.bidcommon.view.title.yuanyuan').d('元')}
            </div>
            <div className={style['info-item-bottom']}>
              {intl
                .get(`bid.bidcommon.view.title.diestquatationsupplier`)
                .d('最低报价供应商')}
              :
              <span className={style['info-item-supplier']}>
                {poHeaderInfo.lowestSupplierName}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default priceHeaderInfo;