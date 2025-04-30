import React, {Component} from 'react';
import {Steps} from 'antd';
import styles from './index.less';
import Spin from '_cus_components/CusSpin';
import demoIcon from './img/picture.jpg'; // 无图片时默认显示
import intl from 'utils/intl';

const {Step} = Steps;

export default class OperationType extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    current: 0,
  };

  handleStepClick = (current) => {
    this.setState({current});
  };

  render() {
    const {current} = this.state;
    const { operationTypeLoading = false, contractMaintain: { noticeFlowRecordDtoList } } = this.props;
    return (
      <Spin spinning={operationTypeLoading}>
        <Steps
          direction={'vertical'}
          current={current}
          className={styles['_cus_custom-step']}
        >
          {noticeFlowRecordDtoList.map((item, index) => {
            const { reqCreatedByName, approvingOpinion, headPortraitUrl, operateDate } = item;
            return (
              <Step
                status="process"
                key={index}
                title={reqCreatedByName}
                description={
                  <div style={{fontSize: '14px'}}>
                    <div className={styles['op-lable']}>{approvingOpinion}</div>
                    <div className={styles['op-time']}>
                      <span>{intl.get(`bid.bidcommon.`).d('于') + operateDate}</span>
                    </div>
                  </div>
                }
                icon={
                  <img src={headPortraitUrl ? headPortraitUrl : demoIcon} alt="" width={32} height={32} style={{borderRadius: "50%"}} />
                }
              />
            );
          })}
        </Steps>
      </Spin>
    );
  }
}
