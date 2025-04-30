import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { getCurrentLanguage } from 'utils/utils';
import cmiLoading from '../../../assets/cmi_loading.gif';
import intl from 'utils/intl';
import './index.less';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { wordTruncation } from '@/utils/utils';

/**
 * 页面包裹组件
 * @param props
 *  loading: 页面加载loading
 *  requiredColor: 是否需要必输底色
 *  emptyLabel: 是否为空标签
 * @returns {*}
 */
export default (props) => {
  const {
    loading = false,
    requiredColor = false,
    emptyLabel = false,
    wordFlag = true,
    isApprovalPage = false,
  } = props;
  const language = getCurrentLanguage();

  if(emptyLabel){
    return props.children;
  }

  useEffect(() => {
    if (language === 'en_US') {
      dayjs.locale('en_us');
      // wordTruncation();
    } else {
      dayjs.locale('zh-cn');
    }
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          screenLGMax: 999,
          screenXL: 1000,
          screenXLMin: 1000,
          screenXLMax: 1559,
          screenXXL: 1560,
          screenXXLMin: 1560,
        },
      }}
      locale={language === 'en_US' ? undefined : zhCN}
      autoInsertSpaceInButton={false}
    >
      <div className="page-wrapper">
        {props.pageTop && <div className="page-wrapper-top">{props.pageTop}</div>}
        <div
          data-required={requiredColor}
          className={`page-wrapper-content ${language === 'en_US' ? 'form-label-120' : ''}`}
        >
          {isApprovalPage ? (
            <div style={{ margin: '-16px 0 -16px -16px' }}>{props.children}</div>
          ) : (
            props.children
          )}
        </div>
        {loading && (
          <div className="page-wrapper-loading">
            <div className="wrapper-loading">
              <img src={cmiLoading} alt="cmi_loading.gif" />
              <span>{intl.get('hzero.common.cusView.message.loading').d('加载中...')}</span>
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};
