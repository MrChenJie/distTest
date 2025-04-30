import React from 'react';
import { Spin } from 'antd';
import cmiLoading from '../../assets/cmi_loading.gif';
import intl from 'utils/intl';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex !important;
  flex-direction: column;
  align-items: center;
  width: 140px !important;
  height: 96px !important;
  background-color: #ffffff;
  transform: translate(-50%, -50%);
  box-shadow: 0px 4px 10px 0px rgba(219, 219, 219, 0.5);
  border-radius: 4px;
  img {
    width: 78px;
    height: 24px;
    margin-top: 16px;
  }
  span {
    color: #1f2329;
    font-size: 16px;
    line-height: 24px;
    font-weight: normal;
    margin-top: 10px;
  }
`;

export default (props) => {
  const { children, ...other } = props;
  const indicator = (
    <Wrapper>
      <img src={cmiLoading} alt="cmi_loading.gif" />
      <span>{intl.get('hzero.common.cusView.message.loading').d('加载中...')}</span>
    </Wrapper>
  );
  return (
    <Spin indicator={indicator} {...other}>
      {children}
    </Spin>
  );
};
