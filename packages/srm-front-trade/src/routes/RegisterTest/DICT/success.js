import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Upload, Col, Row } from 'antd';

import './index.less';
import en from './lanuage/en_US.json';
import sc from './lanuage/zh_CN.json';
import tc from './lanuage/zh_TS.json';
const prompt = 'spfmhk.dict';
const languages = {
  en: en,
  sc: sc,
  tc: tc,
};

const SuccessContent = ({PageBack,form}) => {
  const [currentLanguage, setCurrentLanguage] = useState();
  useEffect(() => {
    if (location.pathname.includes('/sc')) {
      setCurrentLanguage('sc');
    } else if (location.pathname.includes('/tc')) {
      setCurrentLanguage('tc');
    } else {
      setCurrentLanguage('en');
    }
  }, [currentLanguage]);
  const translate = (key) => {
    return languages[currentLanguage]?.[key] || key;
  };
  const [isWeb, setIsWeb] = useState(true);
  const webContent = (
    <div className="success-container-web">
      <div className="register-success-web">
        <Row gutter={16} className="top">
          <Col>
            <img src={require('../../../../src/assets/register/success-icon.png')}></img>
          </Col>
          <Col>
            <h2>{translate(`${prompt}.view.success`)}!</h2>
          </Col>
        </Row>
        <p className="message">
          {translate(`${prompt}.view.message`)}
          <br />
          <Button
            type="primary"
            className="register-back"
            onClick={() => {
              PageBack()
            }}
          >
            {translate(`${prompt}.button.back`)}
          </Button>
        </p>
      </div>
    </div>
  );
  const mobileContent = (
    <div className="success-container-mobile">
      <div className="register-success-mobile">
        <Row gutter={16} className="top">
          <Col>
            <img
              src={require('../../../../src/assets/register/success-icon.png')}
              style={{ width: '32px', height: '32px' }}
            ></img>
          </Col>
          <Col>
            <h2>{translate(`${prompt}.view.success`)}!</h2>
          </Col>
        </Row>
        <p className="message">
          {translate(`${prompt}.view.message`)}
          <br />
          <Button
            type="primary"
            className="register-back"
            onClick={() => {
              PageBack()
            }}
          >
            {translate(`${prompt}.button.back`)}
          </Button>
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 420) {
        setIsWeb(false);
      } else {
        setIsWeb(true);
      }
    };

    handleResize(); // 初始化调用
    window.addEventListener('resize', handleResize); // 添加窗口大小变化事件监听

    return () => {
      window.removeEventListener('resize', handleResize); // 清除事件监听
    };
  }, []);
  return (
    <>
      {
        isWeb? webContent : mobileContent
      }
    </>
  );
};

export default SuccessContent;
